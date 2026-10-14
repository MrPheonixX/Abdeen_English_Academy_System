import { useState } from "react";
import { ALL_TWISTERS, SOUNDS } from "@/lib/academy/content";
import { speak, speakLines } from "@/lib/academy/speak";
import { SayLine } from "./say";
import { Recorder } from "./record";
import { Btn, Card } from "./ui";

const SHADOW = [
  "Let me check that for you.",
  "I'm sorry you're dealing with this.",
  "Can you say that a little slower?",
  "The refund takes three to five days.",
  "I can't see your password.",
  "Is there anything else I can help you with?",
];

const COMMUTE = ALL_TWISTERS.flatMap((twister) =>
  twister.lines.map((line) => ({
    id: `${twister.id}:${line}`,
    label: twister.label,
    why: twister.why,
    line,
  })),
);

export function LabView() {
  const [index, setIndex] = useState(0);
  const [reps, setReps] = useState(0);
  const [shadow, setShadow] = useState(0);
  const current = COMMUTE[index] ?? COMMUTE[0];

  function go(next: number) {
    setIndex((next + COMMUTE.length) % COMMUTE.length);
    setReps(0);
  }

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <p className="text-xs font-semibold tracking-wide text-teal uppercase">On the commute</p>
        <h2 className="mt-1 text-base font-bold">{current.label}</h2>
        <p className="mt-1 text-sm text-muted">{current.why}</p>
        <p className="mt-4 text-2xl font-extrabold leading-snug">{current.line}</p>
        <div className="mt-4 flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <span key={dot} className={dot < reps ? "h-2 flex-1 rounded-full bg-ok" : "h-2 flex-1 rounded-full bg-line"} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn tone="primary" onClick={() => speak(current.line, reps < 3 ? 0.55 : 0.82)}>
            {reps < 3 ? "Hear it slow" : "Hear it normal"}
          </Btn>
          <Btn onClick={() => setReps((value) => Math.min(3, value + 1))} disabled={reps >= 3}>
            I said it · {reps}/3
          </Btn>
        </div>
        <div className="mt-3">
          <Recorder key={current.id} kind="twister" title={current.label} />
        </div>
        <p className="mt-3 text-sm text-muted">
          {reps < 3
            ? "Slow, three clean times. Then hear it at normal speed and record."
            : "Normal speed. Record. Listen back on Progress. Then the next line."}
        </p>
        <div className="mt-3 flex gap-2">
          <Btn className="flex-1" onClick={() => go(index - 1)}>
            Previous
          </Btn>
          <Btn tone="gold" className="flex-1" onClick={() => go(index + 1)} disabled={reps < 3}>
            Next line
          </Btn>
        </div>
        <p className="mt-2 text-center text-xs text-muted">
          Line {index + 1} / {COMMUTE.length} · engVid 1, 2, 3, 21, 22, then your two starters
        </p>
      </Card>

      <details className="rounded-card border border-line bg-card px-4 py-3">
        <summary className="cursor-pointer text-base font-bold">All seven, written out</summary>
        <div className="mt-3 flex flex-col gap-4">
          {ALL_TWISTERS.map((twister) => (
            <div key={twister.id}>
              <h2 className="text-base font-bold">{twister.label}</h2>
              <p className="mt-1 text-sm text-muted">{twister.why}</p>
              <div className="mt-2 space-y-1 text-sm">
                {twister.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn onClick={() => speakLines(twister.lines, 0.82)}>Hear it</Btn>
                <Btn onClick={() => speakLines(twister.lines, 0.55)}>Slow</Btn>
              </div>
            </div>
          ))}
        </div>
      </details>

      <Card>
        <h2 className="text-base font-bold">Shadow a work line</h2>
        <p className="mt-1 text-sm text-muted">Hear it, pause, copy the rhythm. Then the next line. Five minutes is enough.</p>
        <div className="mt-3">
          <SayLine key={SHADOW[shadow]} text={SHADOW[shadow] ?? SHADOW[0]} />
        </div>
        <div className="mt-3 flex gap-2">
          <Btn className="flex-1" onClick={() => setShadow((value) => (value + SHADOW.length - 1) % SHADOW.length)}>
            Previous
          </Btn>
          <Btn tone="gold" className="flex-1" onClick={() => setShadow((value) => (value + 1) % SHADOW.length)}>
            Next line
          </Btn>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-bold">Sounds to fix first</h2>
        <p className="mt-1 text-sm text-muted">
          th, s/z, and b/p. Tap a word, copy it, then say the pair back to back.
        </p>
      </Card>
      {SOUNDS.map((sound) => (
        <Card key={sound.title}>
          <h2 className="text-base font-bold">{sound.title}</h2>
          <p className="mt-1 text-sm text-muted">{sound.how}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sound.words.map((word) => (
              <Btn key={word} onClick={() => speak(word, 0.75)}>
                {word}
              </Btn>
            ))}
          </div>
        </Card>
      ))}
      <p className="text-xs text-muted">
        Source for 1, 2, 3, 21 and 22: engVid, 50 Tongue Twisters to improve pronunciation in English.
        The two starters are yours.
      </p>
    </div>
  );
}
