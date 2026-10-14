import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { deleteClip, loadClip, saveClip } from "@/lib/academy/audio";
import { dayKey } from "@/lib/academy/dates";
import { useAcademy, type RecordingItem, type RecordingKind } from "@/lib/academy/store";
import { Btn } from "./ui";

const MAX_MS = 8 * 60 * 1000;

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function clock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function Recorder({ kind, title }: { kind: RecordingKind; title: string }) {
  const addRecording = useAcademy((s) => s.addRecording);
  const [phase, setPhase] = useState<"idle" | "rec" | "save">("idle");
  const [ms, setMs] = useState(0);
  const [error, setError] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const started = useRef(0);
  const timer = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      window.clearInterval(timer.current);
      const rec = recRef.current;
      if (!rec) return;
      rec.onstop = null;
      rec.stream.getTracks().forEach((track) => track.stop());
      if (rec.state !== "inactive") rec.stop();
    };
  }, []);

  async function start() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser cannot record. Use the phone’s voice recorder, then listen there.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        void finish(rec.mimeType || mime || "audio/webm");
      };
      recRef.current = rec;
      started.current = Date.now();
      setMs(0);
      setPhase("rec");
      rec.start();
      timer.current = window.setInterval(() => {
        const elapsed = Date.now() - started.current;
        setMs(elapsed);
        if (elapsed >= MAX_MS && rec.state !== "inactive") rec.stop();
      }, 250);
    } catch {
      setError("Mic is blocked. Allow the microphone, or record in the phone voice app.");
    }
  }

  async function finish(mime: string) {
    window.clearInterval(timer.current);
    const blob = new Blob(chunks.current, { type: mime });
    const seconds = Math.max(1, Math.round((Date.now() - started.current) / 1000));
    if (!alive.current) return;
    if (blob.size < 800) {
      setPhase("idle");
      setError("That was too short to keep.");
      return;
    }
    setPhase("save");
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    try {
      await saveClip(id, blob);
      if (!alive.current) {
        await deleteClip(id);
        return;
      }
      addRecording({ id, d: dayKey(), kind, title, seconds });
      setPhase("idle");
      setMs(0);
    } catch {
      await deleteClip(id).catch(() => undefined);
      if (!alive.current) return;
      setPhase("idle");
      setError("Could not save that recording on this device.");
    }
  }

  function stop() {
    const rec = recRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {phase === "rec" ? (
          <Btn tone="gold" onClick={stop}>
            <Square className="size-4" aria-hidden />
            Stop · {clock(Math.floor(ms / 1000))}
          </Btn>
        ) : (
          <Btn tone="primary" onClick={start} disabled={phase === "save"}>
            <Mic className="size-4" aria-hidden />
            {phase === "save" ? "Saving" : "Record"}
          </Btn>
        )}
        <span className="text-sm text-muted">{title}</span>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-warn">{error}</p>}
    </div>
  );
}

const KIND_NAME: Record<RecordingKind, string> = {
  news: "Article",
  twister: "Twister",
  call: "Call",
  speak: "Speaking",
};

export function RecordingList({
  items,
  empty,
}: {
  items: RecordingItem[];
  empty: string;
}) {
  const removeRecording = useAcademy((s) => s.removeRecording);
  if (items.length === 0) return <p className="mt-2 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-2">
      {[...items].reverse().map((item) => (
        <ClipRow key={item.id} item={item} onRemove={() => removeRecording(item.id)} />
      ))}
    </ul>
  );
}

function ClipRow({ item, onRemove }: { item: RecordingItem; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  async function toggle() {
    if (url) {
      URL.revokeObjectURL(url);
      setUrl(null);
      return;
    }
    try {
      const blob = await loadClip(item.id);
      if (!blob) {
        setError("That file is no longer on this device.");
        return;
      }
      setError("");
      setUrl(URL.createObjectURL(blob));
    } catch {
      setError("Could not play that recording.");
    }
  }

  return (
    <li className="border-b border-line py-3 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{item.title}</p>
          <p className="text-sm text-muted">
            {KIND_NAME[item.kind]} · {item.d} · {clock(item.seconds)}
          </p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={toggle}>{url ? "Hide" : "Play"}</Btn>
          <Btn onClick={onRemove}>Remove</Btn>
        </div>
      </div>
      {url && <audio className="mt-2 w-full" controls autoPlay src={url} />}
      {error && <p className="mt-2 text-sm font-semibold text-warn">{error}</p>}
    </li>
  );
}
