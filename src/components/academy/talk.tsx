import { useState } from "react";
import { SCENES, type Choice, type Scene } from "@/lib/academy/scenes";
import { speak } from "@/lib/academy/speak";
import { useAcademy } from "@/lib/academy/store";
import { Btn, Card, cx } from "./ui";

const POINTS = { best: 3, ok: 2, weak: 0 } as const;

export function TalkView() {
  const talks = useAcademy((s) => s.talks);
  const finishTalk = useAcademy((s) => s.finishTalk);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const scene = SCENES.find((item) => item.id === sceneId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <p className="text-xs font-semibold tracking-wide text-teal uppercase">Out loud</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight">Conversation dojo</h2>
        <p className="mt-1 text-sm text-muted">
          Pick a line, then say it before you move on. The best line is short, polite, and specific. A weak line still teaches you what not to do on a real call.
        </p>
      </Card>
      {scene ? (
        <ScenePlayer
          key={scene.id}
          scene={scene}
          best={talks[scene.id] ?? 0}
          onExit={() => setSceneId(null)}
          onDone={(score) => finishTalk(scene.id, score)}
        />
      ) : (
        <div className="grid gap-3">
          {SCENES.map((item) => {
            const best = talks[item.id];
            return (
              <Card key={item.id}>
                <p className="text-xs font-semibold text-teal">{item.where}</p>
                <h3 className="mt-1 text-lg font-extrabold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.setup}</p>
                <p className="mt-2 text-sm font-semibold">{best ? `Best score ${best}` : "Not played yet"}</p>
                <Btn tone="primary" className="mt-3" onClick={() => setSceneId(item.id)}>
                  Start
                </Btn>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScenePlayer({
  scene,
  best,
  onExit,
  onDone,
}: {
  scene: Scene;
  best: number;
  onExit: () => void;
  onDone: (score: number) => void;
}) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [points, setPoints] = useState(0);
  const [said, setSaid] = useState(false);
  const beat = scene.beats[step];
  const finished = step >= scene.beats.length;

  if (finished) {
    const max = scene.beats.length * 3;
    const score = Math.round((points / max) * 100);
    return (
      <Card>
        <p className="text-xs font-semibold tracking-wide text-ok uppercase">Scene done</p>
        <h2 className="mt-1 text-3xl font-extrabold tabular-nums">{score}</h2>
        <p className="mt-1 text-sm text-muted">
          {score >= 80 ? "Clean enough for a real call." : score >= 50 ? "The shape is there. Play it once more." : "Short lines. Name, apology, one next step."}
          {best ? ` Previous best ${best}.` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn
            tone="gold"
            onClick={() => {
              onDone(score);
              onExit();
            }}
          >
            Save score
          </Btn>
          <Btn onClick={onExit}>Back to scenes</Btn>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-teal">
            {scene.title} · {step + 1} / {scene.beats.length}
          </p>
          <h2 className="mt-1 text-lg font-extrabold">They say</h2>
        </div>
        <button type="button" className="text-sm font-semibold text-muted" onClick={onExit}>
          Leave
        </button>
      </div>
      <p className="mt-2 text-base font-semibold">{beat.npc}</p>
      <Btn className="mt-3" onClick={() => speak(beat.npc, 0.92)}>
        Hear them
      </Btn>
      <h3 className="mt-4 text-sm font-bold">Your line</h3>
      <div className="mt-2 flex flex-col gap-2">
        {beat.choices.map((choice) => {
          const on = picked?.text === choice.text;
          return (
            <button
              key={choice.text}
              type="button"
              disabled={Boolean(picked)}
              onClick={() => {
                setPicked(choice);
                setSaid(false);
                setPoints((value) => value + POINTS[choice.quality]);
              }}
              className={cx(
                "min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-semibold disabled:opacity-100",
                on && choice.quality === "best" && "border-ok bg-ok text-ok-ink",
                on && choice.quality === "ok" && "border-gold bg-gold text-gold-ink",
                on && choice.quality === "weak" && "border-warn bg-warn-soft text-warn",
                !on && "border-line bg-card",
              )}
            >
              {choice.text}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="mt-3">
          <p className="text-sm">
            <span className="font-semibold">
              {picked.quality === "best" ? "Best line." : picked.quality === "ok" ? "Workable." : "That one costs you the call."}
            </span>{" "}
            Say it once, then hear what they answer.
          </p>
          <p className="mt-2 text-sm text-muted">They answer: {picked.reply}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn tone="primary" onClick={() => speak(picked.text, 0.9)}>
              Hear your line
            </Btn>
            <Btn
              onClick={() => {
                setSaid(true);
                speak(picked.reply, 0.92);
              }}
            >
              I said it
            </Btn>
            <Btn tone="gold" disabled={!said} onClick={() => { setStep((value) => value + 1); setPicked(null); setSaid(false); }}>
              Next
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}
