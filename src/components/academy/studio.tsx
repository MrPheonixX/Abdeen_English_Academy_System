import { useMemo, useState } from "react";
import { LESSON_COUNT, LESSONS, lessonHref, lessonsFrom } from "@/lib/academy/lessons";
import { patternFor } from "@/lib/academy/patterns";
import { speakLines } from "@/lib/academy/speak";
import { useAcademy } from "@/lib/academy/store";
import { SayLine } from "./say";
import { Btn, Card, cx, Field, OutLink } from "./ui";

export function StudioView() {
  const teNext = useAcademy((s) => s.teNext);
  const studio = useAcademy((s) => s.studio);
  const markStudio = useAcademy((s) => s.markStudio);
  const todayBatch = lessonsFrom(teNext);
  const [section, setSection] = useState<0 | 1 | 2 | 3>(0);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number>(todayBatch[0]?.n ?? 1);
  const [line, setLine] = useState(0);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LESSONS.filter((lesson) => {
      if (section && lesson.section !== section) return false;
      if (!q) return true;
      return `${lesson.n} ${lesson.title}`.toLowerCase().includes(q);
    });
  }, [query, section]);

  const lesson = LESSONS.find((item) => item.n === open) ?? list[0] ?? LESSONS[0];
  const pattern = patternFor(lesson.n);
  const currentLine = pattern?.lines[line] ?? pattern?.lines[0] ?? lesson.title;
  const done = studio.includes(lesson.n);

  function choose(n: number) {
    setOpen(n);
    setLine(0);
  }

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <p className="text-xs font-semibold tracking-wide text-teal uppercase">On this page</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight">Pattern studio</h2>
        <p className="mt-1 text-sm text-muted">
          The same 89 Speaking Basics patterns, practiced here. Hear a line, say it, then say it without looking. TalkEnglish is still there if you want the original audio.
        </p>
        {todayBatch.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-semibold">Today's three</p>
            <div className="mt-2 flex flex-col gap-2">
              {todayBatch.map((item) => (
                <button
                  key={item.n}
                  type="button"
                  onClick={() => choose(item.n)}
                  className={cx(
                    "min-h-11 rounded-xl border px-3 text-left text-sm font-semibold",
                    open === item.n ? "border-teal bg-teal text-teal-ink" : "border-line bg-card",
                  )}
                >
                  {item.n}. {item.title}
                  {studio.includes(item.n) ? " · practiced" : ""}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          {(
            [
              [0, "All"],
              [1, "1–29"],
              [2, "30–59"],
              [3, "60–89"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={cx(
                "min-h-11 rounded-xl border px-3 text-sm font-semibold",
                section === id ? "border-teal bg-teal text-teal-ink" : "border-line bg-card",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Field
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a pattern"
          aria-label="Search patterns"
          className="mt-3"
        />
        <p className="mt-2 text-xs text-muted">
          {studio.length} of {LESSON_COUNT} practiced in the studio
        </p>
        <ul className="mt-2 max-h-52 overflow-auto rounded-xl border border-line">
          {list.map((item) => (
            <li key={item.n}>
              <button
                type="button"
                onClick={() => choose(item.n)}
                className={cx(
                  "flex min-h-11 w-full items-center justify-between gap-3 px-3 text-left text-sm",
                  item.n === lesson.n ? "bg-teal-soft font-semibold" : "",
                )}
              >
                <span>
                  {item.n}. {item.title}
                </span>
                {studio.includes(item.n) && <span className="text-xs font-semibold text-ok">Done</span>}
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="px-3 py-3 text-sm text-muted">No pattern matches that.</li>}
        </ul>
      </Card>

      <Card>
        <p className="text-xs font-semibold text-teal">Lesson {lesson.n}</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight">{lesson.title}</h2>
        <p className="mt-2 text-sm">{pattern?.tip}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {pattern?.lines.map((sentence, index) => (
            <button
              key={sentence}
              type="button"
              onClick={() => setLine(index)}
              className={cx(
                "min-h-11 rounded-xl border px-3 text-sm font-semibold",
                line === index ? "border-gold bg-gold text-gold-ink" : "border-line bg-card",
              )}
            >
              Line {index + 1}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <SayLine key={currentLine} text={currentLine} />
        </div>
        <OrderLine key={currentLine} sentence={currentLine} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={() => pattern && speakLines([...pattern.lines], 0.84)}>Hear all three</Btn>
          <Btn tone={done ? "ok" : "gold"} onClick={() => markStudio(lesson.n)}>
            {done ? "Practiced" : "Mark practiced"}
          </Btn>
          <OutLink href={lessonHref(lesson.alid)}>Original lesson</OutLink>
        </div>
        {pattern && (
          <ul className="mt-4 space-y-2 text-sm">
            {pattern.lines.map((sentence) => (
              <li key={sentence} className="border-t border-line pt-2">
                {sentence}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function tokens(sentence: string) {
  return sentence.split(/\s+/).filter(Boolean);
}

function shuffled(sentence: string) {
  const words = tokens(sentence);
  const next = [...words];
  let seed = 0;
  for (const ch of sentence) seed = (seed * 33 + ch.charCodeAt(0)) >>> 0;
  for (let i = next.length - 1; i > 0; i -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const swap = next[i];
    next[i] = next[j] ?? swap;
    next[j] = swap;
  }
  if (next.join(" ") === words.join(" ") && next.length > 1) {
    const first = next.shift();
    if (first) next.push(first);
  }
  return next.map((word, index) => ({ id: `${index}-${word}`, word }));
}

function OrderLine({ sentence }: { sentence: string }) {
  const start = useMemo(() => shuffled(sentence), [sentence]);
  const [bank, setBank] = useState(start);
  const [built, setBuilt] = useState<typeof start>([]);
  const [mark, setMark] = useState<"idle" | "ok" | "no">("idle");

  function take(id: string) {
    const chip = bank.find((item) => item.id === id);
    if (!chip) return;
    setBank((items) => items.filter((item) => item.id !== id));
    setBuilt((items) => [...items, chip]);
    setMark("idle");
  }

  function drop(id: string) {
    const chip = built.find((item) => item.id === id);
    if (!chip) return;
    setBuilt((items) => items.filter((item) => item.id !== id));
    setBank((items) => [...items, chip]);
    setMark("idle");
  }

  function check() {
    setMark(built.map((item) => item.word).join(" ") === tokens(sentence).join(" ") ? "ok" : "no");
  }

  return (
    <div className="mt-3 rounded-2xl border border-line bg-paper p-3">
      <p className="text-sm font-bold">Build the line</p>
      <p className="mt-1 text-sm text-muted">Tap the words in order. Then check, and say it.</p>
      <div className="mt-3 flex min-h-11 flex-wrap gap-2 rounded-xl border border-dashed border-line p-2">
        {built.length === 0 && <span className="text-sm text-muted">Your line</span>}
        {built.map((chip) => (
          <button key={chip.id} type="button" onClick={() => drop(chip.id)} className="min-h-11 rounded-xl border border-teal bg-teal px-3 text-sm font-semibold text-teal-ink">
            {chip.word}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {bank.map((chip) => (
          <button key={chip.id} type="button" onClick={() => take(chip.id)} className="min-h-11 rounded-xl border border-line bg-card px-3 text-sm font-semibold">
            {chip.word}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Btn tone="gold" onClick={check} disabled={built.length === 0}>
          Check
        </Btn>
        <Btn
          onClick={() => {
            setBank(start);
            setBuilt([]);
            setMark("idle");
          }}
        >
          Reset
        </Btn>
        {mark === "ok" && <p className="text-sm font-semibold text-ok">That is the line. Say it once.</p>}
        {mark === "no" && <p className="text-sm font-semibold text-warn">Not yet. Hear it, then try the order again.</p>}
      </div>
    </div>
  );
}
