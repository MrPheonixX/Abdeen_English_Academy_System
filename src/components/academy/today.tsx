import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import {
  CALL_SCENES,
  CALL_STEPS,
  MODES,
  modeMeta,
  orderedTasks,
  taskCopy,
  taskSplit,
  type DayMode,
  type TaskId,
} from "@/lib/academy/content";
import { articlesForDay } from "@/lib/academy/articles";
import { shiftKey, weekdayShort } from "@/lib/academy/dates";
import { LESSON_COUNT } from "@/lib/academy/lessons";
import { speak, speakLines } from "@/lib/academy/speak";
import { isDayFull, streakCount, useAcademy, type MinuteKind, type RecordingKind } from "@/lib/academy/store";
import { Recorder, RecordingList } from "./record";
import { Btn, Card, cx, Field, OutLink } from "./ui";

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

export function TodayView({ today }: { today: string }) {
  const days = useAcademy((s) => s.days);
  const words = useAcademy((s) => s.words);
  const teNext = useAcademy((s) => s.teNext);
  const rw = useAcademy((s) => s.rw);
  const sprintEndsAt = useAcademy((s) => s.sprintEndsAt);
  const setMode = useAcademy((s) => s.setMode);
  const toggleRest = useAcademy((s) => s.toggleRest);
  const toggleTask = useAcademy((s) => s.toggleTask);
  const setReward = useAcademy((s) => s.setReward);
  const startSprint = useAcademy((s) => s.startSprint);
  const clearSprint = useAcademy((s) => s.clearSprint);
  const addMinutes = useAcademy((s) => s.addMinutes);
  const setDayMode = useAcademy((s) => s.setDayMode);
  const recordings = useAcademy((s) => s.recordings);
  const setTab = useAcademy((s) => s.setTab);
  const openDesk = useAcademy((s) => s.openDesk);
  const [recKind, setRecKind] = useState<RecordingKind>("news");
  const [scene, setScene] = useState(0);
  const desk = articlesForDay(today);

  const day = days[today] ?? { mode: "n" as const, done: [], rest: false };
  const meta = modeMeta(day.mode);
  const items = orderedTasks(day.mode);
  const required = taskSplit(day.mode).required;
  const doneRequired = required.filter((id) => day.done.includes(id)).length;
  const pct = required.length ? Math.round((doneRequired / required.length) * 100) : 0;
  const nextId = required.find((id) => !day.done.includes(id));
  const streak = streakCount(days, today);
  const yesterday = shiftKey(today, -1);
  const yWords = words.filter((word) => word.d === yesterday);
  const now = useNow(Boolean(sprintEndsAt));
  const left = sprintEndsAt ? sprintEndsAt - now : null;
  const running = left !== null && left > 0;

  useEffect(() => {
    if (sprintEndsAt && Date.now() - sprintEndsAt > 2 * 60 * 1000) clearSprint();
  }, [sprintEndsAt, now, clearSprint]);

  let headline = "Start with 5 minutes. Then do the next task on the list.";
  if (day.rest) headline = "Rest day. Your streak stays. Come back tomorrow.";
  else if (!nextId) headline = "Core is done for today. Stop, or keep the optional exposure.";
  else if (pct >= 50) headline = "Past halfway. Finish the next small task, not the whole day at once.";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setMode(mode.id)}
            className={cx(
              "min-h-16 rounded-2xl border px-2 py-2 text-center",
              day.mode === mode.id
                ? "border-ok bg-ok text-ok-ink"
                : "border-line bg-card text-ink",
            )}
          >
            <span className="block text-sm font-bold">{mode.name}</span>
            <span className={cx("block text-xs", day.mode === mode.id ? "text-ok-ink/80" : "text-muted")}>
              {mode.time}
            </span>
          </button>
        ))}
      </div>

      <NowCard
        rest={day.rest}
        mode={day.mode}
        nextId={nextId}
        doneRequired={doneRequired}
        requiredCount={required.length}
        teNext={teNext}
        reviewWords={yWords}
        onDone={() => nextId && toggleTask(nextId)}
        onWords={() => setTab("words")}
        onLab={() => setTab("lab")}
        onStudio={() => setTab("studio")}
        onTalk={() => setTab("talk")}
        onRead={(index) => openDesk(desk[index]?.id ?? null)}
        onRest={toggleRest}
        onSprint={startSprint}
        running={running}
        left={left}
      />

      <WeekPlan today={today} days={days} onSet={setDayMode} />

      <Card>
        <p className="text-base font-bold text-ok">{headline}</p>
        <p className="mt-1 text-sm text-muted">{meta.line}</p>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }, (_, i) => {
            const key = shiftKey(today, -6 + i);
            const row = days[key];
            const full = isDayFull(row);
            const rest = Boolean(row?.rest);
            return (
              <div key={key} className="text-center text-xs text-muted">
                {weekdayShort(key)}
                <span
                  className={cx(
                    "mt-1 block h-5 rounded-md",
                    rest ? "bg-gold" : full ? "bg-ok" : "bg-line",
                  )}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={toggleRest}>{day.rest ? "Cancel rest day" : "Use one rest day"}</Btn>
        </div>
        <p className="mt-3 text-sm text-muted">
          Streak {streak} · core {doneRequired}/{required.length}
          {teNext > LESSON_COUNT ? " · Speaking Basics finished" : ` · next lesson ${teNext}`}
        </p>
      </Card>

      <Card className="p-0">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-base font-bold">Today, in order</h2>
        </div>
        <ul>
          {items.map((item) => (
            <TaskRow
              key={item.id}
              id={item.id}
              optional={item.optional}
              active={item.id === nextId}
              checked={day.done.includes(item.id)}
              mode={day.mode}
              teNext={teNext}
              reviewWords={item.id === "review" ? yWords : undefined}
              onToggle={() => toggleTask(item.id)}
              onWords={() => setTab("words")}
              onLab={() => setTab("lab")}
              onStudio={() => setTab("studio")}
              onTalk={() => setTab("talk")}
              onRead={(index) => openDesk(desk[index]?.id ?? null)}
              deskTitles={desk.map((article) => article.title)}
            />
          ))}
        </ul>
      </Card>

      {items.some((item) => item.id === "mock") && (
        <Card>
          <h2 className="text-base font-bold">Customer call</h2>
          <p className="mt-1 text-sm text-muted">
            Hear the model once. Close it. Then record your own version. Do not read while you speak.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CALL_SCENES.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setScene(index)}
                className={cx(
                  "min-h-11 rounded-xl border px-3 text-sm font-semibold",
                  scene === index ? "border-teal bg-teal text-teal-ink" : "border-line bg-card",
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm">{CALL_SCENES[scene]?.setup}</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
            {CALL_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="mt-3">
            <Btn onClick={() => speakLines(CALL_SCENES[scene]?.model ?? [], 0.86)} className="w-full sm:w-auto">
              Hear a simple model
            </Btn>
          </div>
        </Card>
      )}

      <LogCard today={today} mode={day.mode} addMinutes={addMinutes} />

      <Card>
        <h2 className="text-base font-bold">Record, then listen back</h2>
        <p className="mt-1 text-sm text-muted">
          Read the article on the computer. Record here on the phone. Same for the customer call. These stay in this browser. They are not inside the backup file.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["news", "Article"],
              ["call", "Call"],
              ["speak", "Speaking"],
            ] as const
          ).map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              onClick={() => setRecKind(kind)}
              className={cx(
                "min-h-11 rounded-xl border px-3 text-sm font-semibold",
                recKind === kind ? "border-teal bg-teal text-teal-ink" : "border-line bg-card",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Recorder key={recKind} kind={recKind} title={REC_TITLE[recKind]} />
        </div>
        <RecordingList
          items={recordings.filter((item) => item.d === today)}
          empty="Nothing recorded today yet."
        />
      </Card>

      <Card>
        <h2 className="text-base font-bold">Rewards you picked</h2>
        <div className="mt-3 flex flex-col gap-2">
          {[
            ["Half the core", pct >= 50],
            ["Full core", pct === 100],
            ["7-day streak", streak >= 7],
          ].map(([label, on], index) => (
            <label key={String(label)} className="block">
              <span className={cx("mb-1 block text-xs font-semibold", on ? "text-ok" : "text-muted")}>
                {label}
                {on ? " — unlocked" : ""}
              </span>
              <Field
                value={rw[index] ?? ""}
                aria-label={`${label} reward`}
                onChange={(event) => setReward(index, event.target.value)}
                className={on ? "border-ok" : undefined}
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TaskRow({
  id,
  optional,
  active,
  checked,
  mode,
  teNext,
  reviewWords,
  onToggle,
  onWords,
  onLab,
  onStudio,
  onTalk,
  onRead,
  deskTitles,
}: {
  id: TaskId;
  optional: boolean;
  active: boolean;
  checked: boolean;
  mode: "s" | "n" | "o";
  teNext: number;
  reviewWords?: { id: string; w: string; s: string }[];
  onToggle: () => void;
  onWords: () => void;
  onLab: () => void;
  onStudio: () => void;
  onTalk: () => void;
  onRead: (index: number) => void;
  deskTitles: string[];
}) {
  const copy = taskCopy(id, mode, teNext);
  return (
    <li className={cx("border-b border-line px-4 py-3 last:border-b-0", active && "bg-teal-soft/60")}>
      <label className="flex cursor-pointer gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 size-6 shrink-0 accent-ok"
        />
        <span className="min-w-0">
          <span className={cx("block font-semibold", checked && "text-muted line-through")}>
            {copy.title}
          </span>
          <span className="mt-0.5 block text-sm text-muted no-underline">
            {copy.detail}
            {reviewWords
              ? reviewWords.length
                ? ` ${reviewWords.length} saved from yesterday.`
                : " Nothing saved yesterday. Say three older phrases if you have them."
              : ""}
          </span>
          {optional && (
            <span className="mt-1 inline-block rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-muted">
              Optional
            </span>
          )}
          {active && !checked && (
            <span className="mt-1 ml-1 inline-block rounded-full bg-teal px-2 py-0.5 text-xs font-semibold text-teal-ink">
              Next
            </span>
          )}
        </span>
      </label>
      {reviewWords && reviewWords.length > 0 && (
        <ul className="mt-2 space-y-3 pl-9">
          {reviewWords.map((word) => (
            <li key={word.id}>
              <p className="text-sm font-semibold">{word.w}</p>
              <p className="text-sm text-muted">{word.s}</p>
              <Btn className="mt-1" onClick={() => speak(`${word.w}. ${word.s}`, 0.86)}>
                Hear it
              </Btn>
            </li>
          ))}
        </ul>
      )}
      {copy.links.length > 0 && (
        <div className="mt-2 flex flex-col gap-2 pl-9">
          {copy.links.map((link) => (
            <OutLink key={link.href + link.label} href={link.href}>
              {link.label}
            </OutLink>
          ))}
        </div>
      )}
      {id === "review" && (
        <div className="mt-2 pl-9">
          <Btn onClick={onWords}>Open words</Btn>
        </div>
      )}
      {id === "tw" && (
        <div className="mt-2 pl-9">
          <Btn onClick={onLab}>Open Sound Lab</Btn>
        </div>
      )}
      {id === "te" && (
        <div className="mt-2 pl-9">
          <Btn tone="primary" onClick={onStudio}>
            Practice them here
          </Btn>
        </div>
      )}
      {(id === "news1" || id === "news2" || id === "news3") && (
        <div className="mt-2 pl-9">
          <Btn tone="primary" onClick={() => onRead(id === "news1" ? 0 : id === "news2" ? 1 : 2)}>
            Read here: {deskTitles[id === "news1" ? 0 : id === "news2" ? 1 : 2]}
          </Btn>
        </div>
      )}
      {id === "mock" && (
        <div className="mt-2 pl-9">
          <Btn tone="primary" onClick={onTalk}>
            Practice the call
          </Btn>
        </div>
      )}
      {id === "vocab" && (
        <div className="mt-2 pl-9">
          <Btn onClick={onWords}>Write sentences</Btn>
        </div>
      )}
    </li>
  );
}

function LogCard({
  today,
  mode,
  addMinutes,
}: {
  today: string;
  mode: DayMode;
  addMinutes: (kind: MinuteKind, minutes: number) => void;
}) {
  const disc = useAcademy((s) => s.discLog);
  const listen = useAcademy((s) => s.listenLog);
  const shadow = useAcademy((s) => s.shadowLog);
  const sum = (rows: { d: string; m: number }[]) =>
    rows.filter((row) => row.d === today).reduce((total, row) => total + row.m, 0);
  return (
    <Card>
      <h2 className="text-base font-bold">Log real minutes</h2>
      <p className="mt-1 text-sm text-muted">Speaking, listening, or shadowing. Not scrolling.</p>
      <div className="mt-3 grid gap-3">
        <MinuteRow label="Discord" value={sum(disc)} target={30} onAdd={(n) => addMinutes("disc", n)} />
        <MinuteRow
          label="My Story Animated"
          value={sum(listen)}
          target={mode === "s" ? 20 : 60}
          onAdd={(n) => addMinutes("listen", n)}
        />
        <MinuteRow label="Shadowing" value={sum(shadow)} target={5} onAdd={(n) => addMinutes("shadow", n)} />
      </div>
    </Card>
  );
}

function MinuteRow({
  label,
  value,
  target,
  onAdd,
}: {
  label: string;
  value: number;
  target: number;
  onAdd: (n: number) => void;
}) {
  const [draft, setDraft] = useState("");
  const pct = Math.max(0, Math.min(100, Math.round((value / target) * 100)));
  return (
    <div>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd(Number(draft));
          setDraft("");
        }}
      >
        <span className="min-w-36 text-sm font-semibold">
          {label}
          <span className="ml-2 font-bold tabular-nums text-teal">
            {value}/{target} min
          </span>
        </span>
        <Field
          type="number"
          min={1}
          inputMode="numeric"
          placeholder="Minutes"
          aria-label={`${label} minutes`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="w-28 flex-1"
        />
        <Btn type="submit" tone="primary">
          Add
        </Btn>
      </form>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-ok" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatLeft(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function NowCard({
  rest,
  mode,
  nextId,
  doneRequired,
  requiredCount,
  teNext,
  reviewWords,
  onDone,
  onWords,
  onLab,
  onStudio,
  onTalk,
  onRead,
  onRest,
  onSprint,
  running,
  left,
}: {
  rest: boolean;
  mode: DayMode;
  nextId: TaskId | undefined;
  doneRequired: number;
  requiredCount: number;
  teNext: number;
  reviewWords: { id: string; w: string; s: string }[];
  onDone: () => void;
  onWords: () => void;
  onLab: () => void;
  onStudio: () => void;
  onTalk: () => void;
  onRead: (index: number) => void;
  onRest: () => void;
  onSprint: () => void;
  running: boolean;
  left: number | null;
}) {
  if (rest) {
    return (
      <Card>
        <p className="text-xs font-semibold tracking-wide text-teal uppercase">Do this now</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Rest. The streak stays.</h2>
        <p className="mt-2 text-sm text-muted">One rest day in seven. Come back tomorrow.</p>
        <Btn className="mt-3" onClick={onRest}>
          Cancel rest day
        </Btn>
      </Card>
    );
  }
  if (!nextId) {
    return (
      <Card>
        <p className="text-xs font-semibold tracking-wide text-ok uppercase">Do this now</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Core is done.</h2>
        <p className="mt-2 text-sm text-muted">Stop, or keep a game with Arabic subtitles off. Discord still counts only if you talked.</p>
      </Card>
    );
  }
  const copy = taskCopy(nextId, mode, teNext);
  const showRecord = nextId === "news1" || nextId === "news2" || nextId === "news3" || nextId === "mock";
  return (
    <Card>
      <p className="text-xs font-semibold tracking-wide text-teal uppercase">
        Do this now · {doneRequired + 1} of {requiredCount}
      </p>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{copy.title}</h2>
      <p className="mt-2 text-sm text-muted">{copy.detail}</p>
      {nextId === "review" && reviewWords.length > 0 && (
        <ul className="mt-3 space-y-2">
          {reviewWords.map((word) => (
            <li key={word.id} className="border-t border-line pt-2">
              <p className="font-semibold">{word.w}</p>
              <p className="text-sm text-muted">{word.s}</p>
              <Btn className="mt-1" onClick={() => speak(`${word.w}. ${word.s}`, 0.86)}>
                Hear it
              </Btn>
            </li>
          ))}
        </ul>
      )}
      {copy.links.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {copy.links.map((link) => (
            <OutLink key={link.href + link.label} href={link.href}>
              {link.label}
            </OutLink>
          ))}
        </div>
      )}
      {showRecord && (
        <div className="mt-3">
          <Recorder key={nextId} kind={nextId === "mock" ? "call" : "news"} title={copy.title} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn tone="gold" onClick={onDone}>
          Done. Next.
        </Btn>
        {(nextId === "review" || nextId === "vocab") && <Btn onClick={onWords}>Words</Btn>}
        {nextId === "tw" && <Btn onClick={onLab}>Sound Lab</Btn>}
        {nextId === "te" && <Btn onClick={onStudio}>Practice here</Btn>}
        {(nextId === "news1" || nextId === "news2" || nextId === "news3") && (
          <Btn onClick={() => onRead(nextId === "news1" ? 0 : nextId === "news2" ? 1 : 2)}>Read here</Btn>
        )}
        {nextId === "mock" && <Btn onClick={onTalk}>Call dojo</Btn>}
        {doneRequired === 0 && (
          <Btn onClick={onSprint}>
            <Timer className="size-4" aria-hidden />
            5-minute start
          </Btn>
        )}
      </div>
      {running && left !== null && (
        <p className="mt-3 text-center text-4xl font-extrabold tabular-nums tracking-tight">{formatLeft(left)}</p>
      )}
      {left !== null && left <= 0 && (
        <p className="mt-3 text-sm font-semibold">Five minutes done. Keep going, or stop honestly.</p>
      )}
    </Card>
  );
}

const REC_TITLE: Record<RecordingKind, string> = {
  news: "News in Levels reading",
  call: "Customer call",
  speak: "Unscripted speaking",
  twister: "Tongue twister",
};

const MODE_SHORT: Record<DayMode, string> = { n: "Work", o: "Off", s: "Light" };

function cycleMode(mode: DayMode): DayMode {
  if (mode === "n") return "o";
  if (mode === "o") return "s";
  return "n";
}

function WeekPlan({
  today,
  days,
  onSet,
}: {
  today: string;
  days: Record<string, { mode?: DayMode }>;
  onSet: (date: string, mode: DayMode) => void;
}) {
  return (
    <Card>
      <h2 className="text-base font-bold">Next 7 days</h2>
      <p className="mt-1 text-sm text-muted">Off days move. Tap a day: Work, then Off, then Light.</p>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, i) => {
          const key = shiftKey(today, i);
          const mode = days[key]?.mode ?? "n";
          return (
            <button
              key={key}
              type="button"
              aria-label={`${weekdayShort(key)} ${MODE_SHORT[mode]}`}
              onClick={() => onSet(key, cycleMode(mode))}
              className={cx(
                "min-h-16 rounded-xl border px-0.5 py-1.5 text-center",
                i === 0 ? "border-2 border-teal" : "border",
                mode === "o" && "bg-ok-soft",
                mode === "s" && "bg-gold-soft",
                mode === "n" && "bg-card",
                i !== 0 && mode === "o" && "border-ok",
                i !== 0 && mode === "s" && "border-gold",
                i !== 0 && mode === "n" && "border-line",
              )}
            >
              <span className="block text-xs text-muted">{i === 0 ? "Today" : weekdayShort(key)}</span>
              <span className="block text-sm font-bold tabular-nums">{Number(key.slice(8))}</span>
              <span className="block text-xs font-semibold">{MODE_SHORT[mode]}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
