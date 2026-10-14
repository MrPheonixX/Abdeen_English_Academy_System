import { useState } from "react";
import { Mic, Square } from "lucide-react";
import { canListen, listenOnce, matchScore } from "@/lib/academy/speech";
import { speak } from "@/lib/academy/speak";
import { Btn } from "./ui";

export function SayLine({ text, slow = true }: { text: string; slow?: boolean }) {
  const [phase, setPhase] = useState<"idle" | "listen">("idle");
  const [heard, setHeard] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");

  async function start() {
    setNote("");
    setHeard("");
    setScore(null);
    if (!canListen()) {
      setNote("This browser can't hear you. Say the line anyway, then use the recorder if you want a tape.");
      return;
    }
    setPhase("listen");
    const next = await listenOnce(7);
    setPhase("idle");
    setHeard(next);
    if (!next) {
      setNote("No speech came through. Allow the microphone, then try again.");
      setScore(0);
      return;
    }
    setScore(matchScore(text, next));
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-3">
      <p className="text-lg font-bold leading-snug">{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {slow && (
          <Btn onClick={() => speak(text, 0.62)} disabled={phase === "listen"}>
            Hear it slow
          </Btn>
        )}
        <Btn onClick={() => speak(text, 0.9)} disabled={phase === "listen"}>
          Hear it
        </Btn>
        <Btn tone="primary" onClick={() => void start()} disabled={phase === "listen"}>
          {phase === "listen" ? <Square className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
          {phase === "listen" ? "Listening" : "Say it"}
        </Btn>
      </div>
      {phase === "listen" && <p className="mt-2 text-sm font-semibold text-teal">Listening for about seven seconds.</p>}
      {heard && (
        <p className="mt-2 text-sm">
          Heard: <span className="font-semibold">{heard}</span>
        </p>
      )}
      {score !== null && (
        <p className="mt-1 text-sm font-semibold text-ok">
          {score >= 80 ? "Close enough to keep." : score >= 50 ? "The shape is there. Say it once more, slower." : "Try the slow version, then say it again."}{" "}
          {score}% of the words matched.
        </p>
      )}
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </div>
  );
}
