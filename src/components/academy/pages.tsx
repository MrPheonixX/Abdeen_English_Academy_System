import { useMemo, useRef, useState } from "react";
import {
  CHECKS,
  LEVELS,
  RESOURCES,
  orderedTasks,
  rankFor,
  taskCopy,
} from "@/lib/academy/content";
import { monthKey, shiftKey } from "@/lib/academy/dates";
import { LESSON_COUNT, lessonHref, lessonsFrom, type Lesson } from "@/lib/academy/lessons";
import { badgeList } from "@/lib/academy/badges";
import { speak } from "@/lib/academy/speak";
import { isDayFull, streakCount, useAcademy } from "@/lib/academy/store";
import { RecordingList } from "./record";
import { Area, Btn, Card, cx, Field, OutLink } from "./ui";

export function HomeView({ today }: { today: string }) {
  const lv = useAcademy((s) => s.lv);
  const days = useAcademy((s) => s.days);
  const setTab = useAcademy((s) => s.setTab);
  const teNext = useAcademy((s) => s.teNext);
  const name = useAcademy((s) => s.name);
  const setName = useAcademy((s) => s.setName);
  const day = days[today];
  const mode = day?.mode ?? "n";
  const required = orderedTasks(mode).filter((item) => !item.optional);
  const done = required.filter((item) => day?.done.includes(item.id)).length;
  const pct = required.length ? Math.round((done / required.length) * 100) : 0;
  const next = required.find((item) => !day?.done.includes(item.id));
  const nextTitle = next ? taskCopy(next.id, mode, teNext).title : "Core is done";

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="text-xl font-extrabold tracking-tight">Welcome back, {name.trim() || "there"}</h2>
        <p className="mt-1 text-sm text-muted">
          Level {lv} · {streakCount(days, today)} day streak · today {done}/{required.length}
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-ok" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-sm font-semibold">Next: {nextTitle}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn tone="primary" onClick={() => setTab("today")}>
            Open today
          </Btn>
          <Btn onClick={() => setTab("lab")}>Sound Lab</Btn>
          <Btn onClick={() => setTab("words")}>Words</Btn>
        </div>
        <label className="mt-4 block text-sm font-semibold">
          Your name
          <Field
            value={name}
            aria-label="Your name"
            onChange={(event) => setName(event.target.value)}
            className="mt-1"
          />
        </label>
      </Card>
      <Card>
        <h2 className="text-base font-bold">Rules that do not move</h2>
        <ul className="mt-2 space-y-2 text-sm">
          <li>No Arabic subtitles in games, shows, anime, or animation.</li>
          <li>Read aloud. If the task says record, record on your phone.</li>
          <li>Discord is talking. Silent scrolling does not count. Minimum 30 minutes, last thing.</li>
          <li>Grammar is for a mistake you already made. It is not the main study.</li>
          <li>A short day beats a skipped day. Use Recovery when the shift empties you.</li>
        </ul>
      </Card>
      <Card>
        <h2 className="text-base font-bold">How you actually learn</h2>
        <p className="mt-2 text-sm">
          Hear it, copy it, use it, notice the mistake, repeat. Friends, English-dubbed anime, American animation, and games with the subtitles off already taught you more than rule lists. This plan starts there again, in a size that fits rotating shifts.
        </p>
        <p className="mt-2 text-sm text-muted">
          The level here is a training level, not a certificate. The job stays until the English option is real. Travel English is the same muscle.
        </p>
      </Card>
    </div>
  );
}

export function PlanView() {
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="text-base font-bold">What this is</h2>
        <p className="mt-2 text-sm">
          A speaking plan, built for exposure and imitation. Not a grammar course. You already know you do not learn by memorising rules. Whole sentences, from TalkEnglish, stories, shows, and real talk.
        </p>
      </Card>
      <Card>
        <h2 className="text-base font-bold">The real week</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-line p-3">
            <p className="font-bold">Work days</p>
            <p className="mt-1 text-sm text-muted">1–2 hours. Shifts rotate. The commute is for tongue twisters, not new lessons.</p>
          </div>
          <div className="rounded-xl border border-line p-3">
            <p className="font-bold">Days off</p>
            <p className="mt-1 text-sm text-muted">Two days, and they move every week or two. Use them for the full 3–4 hour stack.</p>
          </div>
          <div className="rounded-xl border border-line p-3">
            <p className="font-bold">The job</p>
            <p className="mt-1 text-sm text-muted">Arabic call centre. Do not quit before an English option is actually ready.</p>
          </div>
          <div className="rounded-xl border border-line p-3">
            <p className="font-bold">After graduation</p>
            <p className="mt-1 text-sm text-muted">English stays in your pocket for work and for travel. Same daily speaking, not a second hobby plan.</p>
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="text-base font-bold">The day, in this order</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
          <li>Morning: say yesterday’s words and your sentences.</li>
          <li>TalkEnglish: 3 Speaking Basics lessons, in order. Listen, repeat, say them without looking.</li>
          <li>News in Levels, Level 2: 3 articles. Open on the computer. Record on the phone.</li>
          <li>Write one sentence for each phrase you keep.</li>
          <li>On the way: engVid tongue twisters 1, 2, 3, 21, 22. Let the app or a video say them. Copy the sound.</li>
          <li>My Story Animated: 60 minutes, split on work days. Imitate how they speak. No Arabic.</li>
          <li>Five minutes of shadowing. Friends, English-dubbed anime, animation, or your playlist.</li>
          <li>If you play: Arabic subtitles off.</li>
          <li>Last: at least 30 minutes on Discord with foreigners. No script.</li>
        </ol>
      </Card>
      <Card>
        <h2 className="text-base font-bold">Three sizes</h2>
        <p className="mt-2 text-sm">
          <b>Recovery, 50–60 min.</b> Review, 3 TalkEnglish lessons, tongue twisters, 30 minutes on Discord. That is still a real English day.
        </p>
        <p className="mt-2 text-sm">
          <b>Normal, 1–2 h.</b> Add the three articles, your sentences, a 5-minute shadow, and My Story Animated in blocks.
        </p>
        <p className="mt-2 text-sm">
          <b>Day off, 3–4 h.</b> The full hour of My Story Animated, a customer-call recording, games with subtitles off, then Discord.
        </p>
        <p className="mt-2 text-sm text-muted">
          One rest day every 7 days protects the streak. Starting is the hard part, so the 5-minute button exists. Five minutes is a start, not the goal. Mark the moving offs on Today, under Next 7 days.
        </p>
      </Card>
    </div>
  );
}

export function LevelsView() {
  const lv = useAcademy((s) => s.lv);
  const passLevel = useAcademy((s) => s.passLevel);
  return (
    <div className="flex flex-col gap-3">
      {LEVELS.map((level, index) => {
        const n = index + 1;
        const state = lv === n ? "Now" : lv > n ? "Passed" : "Later";
        return (
          <Card
            key={level.name}
            className={cx(
              "border-l-4",
              lv === n ? "border-l-gold" : lv > n ? "border-l-ok" : "border-l-line",
            )}
          >
            <p className="text-xs font-semibold text-muted">{state}</p>
            <h2 className="text-lg font-extrabold">
              Level {n}: {level.name}
            </h2>
            <p className="mt-2 text-sm">{level.body}</p>
            <p className="mt-2 text-sm">
              <span className="font-bold">Graduation test. </span>
              {level.test}
            </p>
            {lv === n && n < 3 && (
              <Btn tone="gold" className="mt-3" onClick={passLevel}>
                I passed this test
              </Btn>
            )}
            {lv > n && <p className="mt-3 text-sm font-bold text-ok">Passed</p>}
          </Card>
        );
      })}
      <p className="text-sm text-muted">
        Move up because the recording got better, not because a date arrived. Listen back before you press the button. This app cannot hear you.
      </p>
    </div>
  );
}

export function ResourcesView() {
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="text-base font-bold">Open the source, do the task, close it</h2>
        <p className="mt-2 text-sm text-muted">
          Do not turn this list into a collection. The path is already fixed on Today.
        </p>
      </Card>
      <Card className="p-0">
        <ul>
          {RESOURCES.map((item) => (
            <li key={item.href} className="border-b border-line px-4 py-3 last:border-b-0">
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="block font-semibold text-teal">
                {item.title}
              </a>
              <p className="text-sm text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function CheckView() {
  const lv = useAcademy((s) => s.lv);
  const placeLevel = useAcademy((s) => s.placeLevel);
  const [flags, setFlags] = useState<boolean[]>(() => CHECKS.map(() => false));
  const [msg, setMsg] = useState("");
  return (
    <Card>
      <h2 className="text-base font-bold">Honest level check</h2>
      <p className="mt-1 text-sm text-muted">
        Tick only what you can do today, without rehearsing it first. This picks a training level. It is not a certificate. You are on level {lv} now.
      </p>
      <ul className="mt-2">
        {CHECKS.map((item, index) => (
          <li key={item}>
            <label className="flex cursor-pointer gap-3 border-b border-line py-3">
              <input
                type="checkbox"
                className="mt-0.5 size-6 accent-ok"
                checked={flags[index]}
                onChange={(event) =>
                  setFlags((prev) => prev.map((value, i) => (i === index ? event.target.checked : value)))
                }
              />
              <span className="text-sm">{item}</span>
            </label>
          </li>
        ))}
      </ul>
      <Btn
        tone="gold"
        className="mt-3"
        onClick={() => {
          const n = flags.filter(Boolean).length;
          const level = n <= 1 ? 1 : n <= 3 ? 2 : 3;
          placeLevel(level);
          setMsg(`Start at training level ${level}. Move up only after the performance test.`);
        }}
      >
        Set training level
      </Btn>
      {msg && <p className="mt-3 font-bold text-ok">{msg}</p>}
    </Card>
  );
}

export function WordsView({ today }: { today: string }) {
  const words = useAcademy((s) => s.words);
  const addWord = useAcademy((s) => s.addWord);
  const removeWord = useAcademy((s) => s.removeWord);
  const [w, setW] = useState("");
  const [s, setS] = useState("");
  const yesterday = shiftKey(today, -1);
  const yWords = words.filter((word) => word.d === yesterday);
  const recent = [...words].reverse().slice(0, 40);

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="text-base font-bold">Add a phrase</h2>
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (addWord(w, s)) {
              setW("");
              setS("");
            }
          }}
        >
          <Field value={w} onChange={(event) => setW(event.target.value)} placeholder="Word or phrase" aria-label="Word or phrase" />
          <Area value={s} onChange={(event) => setS(event.target.value)} rows={3} placeholder="Your own sentence" aria-label="Your sentence" />
          <Btn type="submit" tone="gold">
            Save
          </Btn>
        </form>
        <p className="mt-2 text-sm text-muted">
          Prefer phrases from News in Levels, a story, a game, or a conversation. Not a random word list.
        </p>
      </Card>
      <WordList title="Yesterday — say these" items={yWords} onRemove={removeWord} empty="No phrases saved yesterday." speakable />
      <WordList title="Recent" items={recent} onRemove={removeWord} empty="Your journal is empty." />
      <FlashReview items={words} />
    </div>
  );
}

function FlashReview({ items }: { items: { id: string; w: string; s: string }[] }) {
  const deck = useMemo(() => [...items].reverse(), [items]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const card = deck[index % Math.max(deck.length, 1)];
  if (!card) {
    return (
      <Card>
        <h2 className="text-base font-bold">Say them back</h2>
        <p className="mt-2 text-sm text-muted">Save a phrase first. Then this stack will drill it.</p>
      </Card>
    );
  }
  return (
    <Card>
      <h2 className="text-base font-bold">Say them back</h2>
      <p className="mt-1 text-sm text-muted">
        Card {deck.length ? (index % deck.length) + 1 : 0} of {deck.length}. Say the sentence before you reveal it.
      </p>
      <p className="mt-4 text-2xl font-extrabold">{card.w}</p>
      {open ? <p className="mt-2 text-sm">{card.s}</p> : <p className="mt-2 text-sm text-muted">Sentence hidden.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn onClick={() => setOpen((value) => !value)}>{open ? "Hide" : "Show sentence"}</Btn>
        <Btn onClick={() => speak(`${card.w}. ${card.s}`, 0.86)}>Hear it</Btn>
        <Btn
          tone="gold"
          onClick={() => {
            setIndex((value) => value + 1);
            setOpen(false);
          }}
        >
          Next
        </Btn>
      </div>
    </Card>
  );
}

function WordList({
  title,
  items,
  empty,
  speakable,
  onRemove,
}: {
  title: string;
  items: { id: string; w: string; s: string }[];
  empty: string;
  speakable?: boolean;
  onRemove: (id: string) => void;
}) {
  return (
    <Card>
      <h2 className="text-base font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-2">
          {items.map((item) => (
            <li key={item.id} className="border-b border-line py-3 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{item.w}</p>
                  <p className="text-sm text-muted">{item.s}</p>
                </div>
                <button type="button" className="text-sm font-semibold text-muted" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </div>
              {speakable && (
                <div className="mt-2">
                  <Btn onClick={() => speak(`${item.w}. ${item.s}`, 0.86)}>Hear it</Btn>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function NotesView() {
  const notes = useAcademy((s) => s.notes);
  const nid = useAcademy((s) => s.nid);
  const addNote = useAcademy((s) => s.addNote);
  const selectNote = useAcademy((s) => s.selectNote);
  const updateNote = useAcademy((s) => s.updateNote);
  const deleteNote = useAcademy((s) => s.deleteNote);
  const [armed, setArmed] = useState<number | null>(null);
  const current = notes.find((note) => note.id === nid) ?? null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {notes.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => selectNote(note.id)}
            className={cx(
              "min-h-11 rounded-xl border px-3 text-sm font-semibold",
              note.id === nid ? "border-teal bg-teal text-teal-ink" : "border-line bg-card",
            )}
          >
            {note.t.trim() || "Untitled"}
          </button>
        ))}
        <Btn tone="gold" onClick={addNote}>
          New page
        </Btn>
      </div>
      {current ? (
        <Card>
          <Field
            value={current.t}
            aria-label="Page title"
            placeholder="Page title"
            onChange={(event) => updateNote(current.id, { t: event.target.value })}
            className="font-bold"
          />
          <Area
            value={current.b}
            aria-label="Page body"
            rows={14}
            placeholder="Shift pattern, a mistake to fix, a phrase, a weekly note…"
            className="mt-2"
            onChange={(event) => updateNote(current.id, { b: event.target.value })}
          />
          {armed === current.id ? (
            <div className="mt-3 flex gap-2">
              <Btn
                tone="gold"
                onClick={() => {
                  deleteNote(current.id);
                  setArmed(null);
                }}
              >
                Delete this page
              </Btn>
              <Btn onClick={() => setArmed(null)}>Keep it</Btn>
            </div>
          ) : (
            <Btn className="mt-3" onClick={() => setArmed(current.id)}>
              Delete page
            </Btn>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-muted">
            Pages for your shift pattern, sounds that broke, useful phrases, and a monthly listen-back. Saved on this device.
          </p>
        </Card>
      )}
    </div>
  );
}

export function ProgressView({ today }: { today: string }) {
  const days = useAcademy((s) => s.days);
  const words = useAcademy((s) => s.words);
  const teNext = useAcademy((s) => s.teNext);
  const teDone = useAcademy((s) => s.teDone);
  const xp = useAcademy((s) => s.xp);
  const setLesson = useAcademy((s) => s.setLesson);
  const exportData = useAcademy((s) => s.exportData);
  const importData = useAcademy((s) => s.importData);
  const discLog = useAcademy((s) => s.discLog);
  const listenLog = useAcademy((s) => s.listenLog);
  const shadowLog = useAcademy((s) => s.shadowLog);
  const recordings = useAcademy((s) => s.recordings);
  const studio = useAcademy((s) => s.studio);
  const reads = useAcademy((s) => s.reads);
  const talks = useAcademy((s) => s.talks);
  const fileRef = useRef<HTMLInputElement>(null);
  const [lessonDraft, setLessonDraft] = useState(String(Math.min(teNext, LESSON_COUNT + 1)));
  const keys = Array.from({ length: 30 }, (_, i) => shiftKey(today, -29 + i));
  const doneDays = keys.filter((key) => isDayFull(days[key])).length;
  const month = monthKey(today);
  const sumMonth = (rows: { d: string; m: number }[]) =>
    rows.filter((row) => monthKey(row.d) === month).reduce((total, row) => total + row.m, 0);
  const disc = sumMonth(discLog);
  const listen = sumMonth(listenLog);
  const shadow = sumMonth(shadowLog);
  const upcoming: Lesson[] = lessonsFrom(teNext);
  const position = Math.min(LESSON_COUNT, Math.max(0, teNext - 1));
  const pct = Math.round((position / LESSON_COUNT) * 100);
  const rank = rankFor(xp);
  const bestTalk = Math.max(0, ...Object.values(talks), 0);
  const badges = badgeList({
    xp,
    words: words.length,
    streak: streakCount(days, today),
    studio: studio.length,
    reads: reads.length,
    scenes: Object.keys(talks).length,
    bestTalk,
    recordings: recordings.length,
    lessons: teDone,
  });
  const earned = badges.filter((badge) => badge.on).length;

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <h2 className="text-base font-bold">Last 30 days</h2>
        <p className="mt-1 text-3xl font-extrabold tabular-nums">
          {doneDays}
          <span className="text-base font-semibold text-muted"> / 30 done</span>
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {keys.map((key) => {
            const row = days[key];
            const on = isDayFull(row);
            return (
              <div
                key={key}
                title={key}
                className={cx("h-8 rounded-md", row?.rest ? "bg-gold" : on ? "bg-ok" : "bg-line")}
              />
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">Gold is a rest day. Green is a finished core.</p>
      </Card>

      <Card>
        <h2 className="text-base font-bold">TalkEnglish Speaking Basics</h2>
        <p className="mt-1 text-sm text-muted">
          {position} of {LESSON_COUNT} finished · {LESSON_COUNT - position} left
          {teDone !== position ? ` · checks recorded ${teDone}` : ""}
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-teal" style={{ width: `${pct}%` }} />
        </div>
        {upcoming.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {upcoming.map((lesson) => (
              <li key={lesson.alid}>
                <OutLink href={lessonHref(lesson.alid)}>
                  {lesson.n}. {lesson.title}
                </OutLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm font-semibold text-ok">
            Basics are finished. Move to Regular English, 3 lessons a day, same method.
          </p>
        )}
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setLesson(Number(lessonDraft));
          }}
        >
          <Field
            type="number"
            min={1}
            max={LESSON_COUNT + 1}
            inputMode="numeric"
            aria-label="Next lesson number"
            value={lessonDraft}
            onChange={(event) => setLessonDraft(event.target.value)}
            className="w-32"
          />
          <Btn type="submit">Set next lesson</Btn>
        </form>
        <p className="mt-2 text-xs text-muted">
          Use {LESSON_COUNT + 1} when Basics are finished. The site sometimes says 90 lessons. The live list has {LESSON_COUNT}.
        </p>
        <p className="mt-1 text-xs text-muted">Rank {rank.current.name}</p>
      </Card>

      <Card>
        <h2 className="text-base font-bold">Marks</h2>
        <p className="mt-1 text-sm text-muted">
          {earned} of {badges.length}. They follow the work. They are not a certificate.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {badges.map((badge) => (
            <li key={badge.id} className={cx("rounded-xl border px-3 py-2", badge.on ? "border-ok bg-ok-soft" : "border-line")}>
              <p className={cx("text-sm font-bold", !badge.on && "text-muted")}>{badge.title}</p>
              <p className="text-xs text-muted">{badge.detail}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-base font-bold">Word journal</h2>
        <p className="mt-1 text-3xl font-extrabold tabular-nums">{words.length}</p>
      </Card>

      <Card>
        <h2 className="text-base font-bold">This month</h2>
        <ul className="mt-3 space-y-3 text-sm">
          <li className="flex items-center justify-between gap-3">
            <span>Discord</span>
            <b className="tabular-nums">{disc} min</b>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span>Listening</span>
            <b className="tabular-nums">{listen} min</b>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span>Shadowing</span>
            <b className="tabular-nums">{shadow} min</b>
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted">
          Add minutes on Today, right after the block. Listening target: 60 minutes of My Story Animated on a full day, 20 on a light day, split around the shift.
        </p>
      </Card>

      <Card>
        <h2 className="text-base font-bold">Recordings</h2>
        <p className="mt-1 text-sm text-muted">
          Listen back here. Compare one from about a month ago with one from today. Audio stays in this browser and is not inside the backup file.
        </p>
        <RecordingList items={recordings} empty="No recordings yet. Use Record on Today or Sounds." />
      </Card>

      <Card>
        <h2 className="text-base font-bold">Monthly listen-back</h2>
        <p className="mt-2 text-sm text-muted">
          On a day off, play a recording from about a month ago next to one from today. Listen for th, s/z, pace, pauses, and filler. Judge the recording, not your mood. If two months show no change, change the method.
        </p>
      </Card>

      <Card>
        <h2 className="text-base font-bold">Backup on this phone</h2>
        <p className="mt-1 text-sm text-muted">
          The plan stays on this device. Export a file before you clear the browser, or when you change phones.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn
            tone="primary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `english-academy-${today}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download backup
          </Btn>
          <Btn onClick={() => fileRef.current?.click()}>Restore backup</Btn>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              try {
                importData(JSON.parse(await file.text()));
              } catch {
                useAcademy.setState({ notice: "That file could not be read." });
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
}
