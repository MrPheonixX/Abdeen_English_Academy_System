import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { deleteClip, loadClip, saveClip } from "@/lib/academy/audio";
import { dayKey } from "@/lib/academy/dates";
import { useAcademy, type RecordingItem, type RecordingKind } from "@/lib/academy/store";
import { playSfx } from "@/lib/academy/sfx";
import { Btn } from "./ui";

const MAX_MS = 8 * 60 * 1000;

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/aac"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function clock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function micMessage(err: unknown) {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotFoundError") return "No microphone was found on this device.";
  if (name === "NotReadableError") return "Another app is using the microphone. Close it and try again.";
  if (name === "SecurityError") return "Recording needs a secure page (https).";
  return "Mic is blocked. Allow the microphone for this site, then press Record again.";
}

function ClipAudio({ src, autoPlay }: { src: string; autoPlay?: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  // Chrome writes recordings without a length. This makes the seek bar work.
  function fixLength() {
    const audio = ref.current;
    if (!audio || Number.isFinite(audio.duration)) return;
    const back = () => {
      audio.removeEventListener("timeupdate", back);
      audio.currentTime = 0;
    };
    audio.addEventListener("timeupdate", back);
    audio.currentTime = 1e101;
  }
  return (
    <audio ref={ref} className="mt-2 w-full" controls preload="auto" autoPlay={autoPlay} src={src} onLoadedMetadata={fixLength} />
  );
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
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  function showPreview(blob: Blob | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = blob ? URL.createObjectURL(blob) : null;
    setPreview(previewRef.current);
  }

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
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
    showPreview(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser cannot record. Use the phone’s voice recorder, then listen there.");
      return;
    }
    if (!window.isSecureContext) {
      setError("Recording needs a secure page (https).");
      return;
    }
    try {
      void navigator.storage?.persist?.();
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
      rec.onerror = () => {
        window.clearInterval(timer.current);
        stream.getTracks().forEach((track) => track.stop());
        setPhase("idle");
        setError("Recording stopped because of an error. Try again.");
      };
      recRef.current = rec;
      started.current = Date.now();
      setMs(0);
      setPhase("rec");
      playSfx("start");
      rec.start(1000);
      timer.current = window.setInterval(() => {
        const elapsed = Date.now() - started.current;
        setMs(elapsed);
        if (elapsed >= MAX_MS && rec.state !== "inactive") rec.stop();
      }, 250);
    } catch (err) {
      setError(micMessage(err));
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
      showPreview(blob);
      playSfx("win");
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
    if (rec && rec.state !== "inactive") {
      playSfx("stop");
      rec.stop();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {phase === "rec" ? (
          <Btn tone="gold" onClick={stop}>
            <span className="rec-dot" aria-hidden />
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
      {preview && (
        <div className="view-in mt-3 rounded-xl border border-line bg-card p-3">
          <p className="text-sm font-semibold">Listen to what you just recorded</p>
          <ClipAudio src={preview} />
        </div>
      )}
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

  async function download() {
    try {
      const blob = await loadClip(item.id);
      if (!blob) {
        setError("That file is no longer on this device.");
        return;
      }
      const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${item.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "recording"}-${item.d}.${ext}`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(href), 4000);
    } catch {
      setError("Could not download that recording.");
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
          <Btn onClick={download}>Save</Btn>
          <Btn onClick={onRemove}>Remove</Btn>
        </div>
      </div>
      {url && <ClipAudio src={url} autoPlay />}
      {error && <p className="mt-2 text-sm font-semibold text-warn">{error}</p>}
    </li>
  );
}
