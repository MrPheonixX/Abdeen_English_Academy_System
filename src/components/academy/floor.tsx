import { useEffect, useState } from "react";
import { ASKS, DECKS, MAIL_CHECKS, MAILS, MINUTE_TOPICS, SLIPS } from "@/lib/academy/floor";
import { speak } from "@/lib/academy/speak";
import { useAcademy } from "@/lib/academy/store";
import { Btn, Card, cx, Area } from "./ui";

type Room = "hub" | "lines" | "mail" | "ask" | "minute" | "clinic";

export function FloorView() {
  const [room, setRoom] = useState<Room>("hub");
  const booth = useAcademy((s) => s.booth);
  if (room === "lines") return <LinesRoom onBack={() => setRoom("hub")} />;
  if (room === "mail") return <MailRoom onBack={() => setRoom("hub")} />;
  if (room === "ask") return <AskRoom onBack={() => setRoom("hub")} />;
  if (room === "minute") return <MinuteRoom onBack={() => setRoom("hub")} />;
  if (room === "clinic") return <ClinicRoom onBack={() => setRoom("hub")} />;

  const rooms: { id: Room; title: string; line: string; meta: string }[] = [
    {
      id: "lines",
      title: "Lines",
      line: "Phone, travel, and the break room. Hear it, say it, mark it.",
      meta: `${booth.lines.length} said`,
    },
    {
      id: "mail",
      title: "Mail",
      line: "Four short emails. A reason, a next step, then stop.",
      meta: `${booth.mails.length} of ${MAILS.length} sent`,
    },
    {
      id: "ask",
      title: "Interview",
      line: "The questions you will actually get. A model, then your own mouth.",
      meta: `${Object.keys(booth.asks).length} of ${ASKS.length} scored`,
    },
    {
      id: "minute",
      title: "One minute",
      line: "A topic. Sixty seconds. No script, no Arabic.",
      meta: `${booth.minutes} finished`,
    },
    {
      id: "clinic",
      title: "Mistake clinic",
      line: "Lines you might say that a caller would stumble on. Pick the natural one.",
      meta: `${booth.slips.length} of ${SLIPS.length} clean`,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <p className="text-xs font-semibold tracking-wide text-teal uppercase">The floor</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight">Practice that is not another tab of links</h2>
        <p className="mt-1 text-sm text-muted">
          Five rooms. Each one ends when you have said or written something. Progress stays on this device with the rest of the plan.
        </p>
      </Card>
      {rooms.map((item) => (
        <Card key={item.id}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-extrabold">{item.title}</h3>
            <p className="text-sm font-semibold text-teal">{item.meta}</p>
          </div>
          <p className="mt-1 text-sm text-muted">{item.line}</p>
          <Btn tone="primary" className="mt-3" onClick={() => setRoom(item.id)}>
            Open
          </Btn>
        </Card>
      ))}
    </div>
  );
}

function Back({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <div className="mb-1 flex items-center justify-between gap-3">
      <Btn onClick={onBack}>Back</Btn>
      <p className="text-sm font-semibold text-muted">{label}</p>
    </div>
  );
}

function LinesRoom({ onBack }: { onBack: () => void }) {
  const lines = useAcademy((s) => s.booth.lines);
  const markLine = useAcademy((s) => s.markLine);
  const [deckId, setDeckId] = useState(DECKS[0].id);
  const deck = DECKS.find((item) => item.id === deckId) ?? DECKS[0];
  return (
    <div className="flex flex-col gap-3">
      <Back onBack={onBack} label="Lines" />
      <div className="flex flex-wrap gap-2">
        {DECKS.map((item) => (
          <Btn key={item.id} tone={item.id === deck.id ? "primary" : "ghost"} onClick={() => setDeckId(item.id)}>
            {item.title}
          </Btn>
        ))}
      </div>
      <Card>
        <h2 className="text-lg font-extrabold">{deck.title}</h2>
        <p className="mt-1 text-sm text-muted">{deck.blurb}</p>
      </Card>
      {deck.phrases.map((phrase) => {
        const said = lines.includes(phrase.id);
        return (
          <Card key={phrase.id}>
            <p className="text-base font-bold">{phrase.line}</p>
            <p className="mt-1 text-sm text-muted">{phrase.when}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn onClick={() => speak(phrase.line, 0.9)}>Hear it</Btn>
              <Btn tone={said ? "ok" : "gold"} onClick={() => markLine(phrase.id)} disabled={said}>
                {said ? "Said" : "I said it"}
              </Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function MailRoom({ onBack }: { onBack: () => void }) {
  const mails = useAcademy((s) => s.booth.mails);
  const markMail = useAcademy((s) => s.markMail);
  const [id, setId] = useState(MAILS[0].id);
  const [draft, setDraft] = useState("");
  const [flags, setFlags] = useState<boolean[]>(() => MAIL_CHECKS.map(() => false));
  const [show, setShow] = useState(false);
  const job = MAILS.find((item) => item.id === id) ?? MAILS[0];
  const sent = mails.includes(job.id);
  const ready = draft.trim().length >= 40 && flags.every(Boolean);

  function open(next: string) {
    setId(next);
    setDraft("");
    setFlags(MAIL_CHECKS.map(() => false));
    setShow(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <Back onBack={onBack} label="Mail" />
      <div className="flex flex-wrap gap-2">
        {MAILS.map((item) => (
          <Btn key={item.id} tone={item.id === job.id ? "primary" : "ghost"} onClick={() => open(item.id)}>
            {item.title}
          </Btn>
        ))}
      </div>
      <Card>
        <h2 className="text-lg font-extrabold">{job.title}</h2>
        <p className="mt-1 text-sm">{job.situation}</p>
        <Area
          className="mt-3"
          rows={8}
          value={draft}
          aria-label="Your email"
          placeholder="Write it in your own words."
          onChange={(event) => setDraft(event.target.value)}
        />
        <ul className="mt-3">
          {MAIL_CHECKS.map((item, index) => (
            <li key={item}>
              <label className="flex cursor-pointer gap-3 py-2">
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
        <div className="mt-2 flex flex-wrap gap-2">
          <Btn onClick={() => setShow((value) => !value)}>{show ? "Hide the model" : "Show a model"}</Btn>
          <Btn tone="gold" disabled={!ready || sent} onClick={() => markMail(job.id)}>
            {sent ? "Saved" : "Save this mail"}
          </Btn>
        </div>
        {!ready && !sent && (
          <p className="mt-2 text-sm text-muted">Write at least a short note, then tick every check. The model is a shape, not a script to paste.</p>
        )}
        {sent && <p className="mt-2 text-sm font-semibold text-ok">Saved. Read it once out loud before you send a real one.</p>}
        {show && <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-paper p-3 text-sm">{job.model}</pre>}
      </Card>
    </div>
  );
}

function AskRoom({ onBack }: { onBack: () => void }) {
  const asks = useAcademy((s) => s.booth.asks);
  const scoreAsk = useAcademy((s) => s.scoreAsk);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const ask = ASKS[index];
  const saved = asks[ask.id];
  return (
    <div className="flex flex-col gap-3">
      <Back onBack={onBack} label={`${index + 1} of ${ASKS.length}`} />
      <Card>
        <p className="text-xs font-semibold text-teal">Say your answer before you open the model.</p>
        <h2 className="mt-2 text-xl font-extrabold">{ask.q}</h2>
        {open ? <p className="mt-3 text-sm">{ask.model}</p> : <p className="mt-3 text-sm text-muted">Model hidden.</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={() => speak(ask.q, 0.92)}>Hear the question</Btn>
          <Btn onClick={() => setOpen((value) => !value)}>{open ? "Hide model" : "Show model"}</Btn>
          {open && <Btn onClick={() => speak(ask.model, 0.9)}>Hear the model</Btn>}
        </div>
        <p className="mt-4 text-sm font-semibold">After you say yours, score it. 5 means you could use it tomorrow.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Btn key={n} tone={saved === n ? "gold" : "ghost"} onClick={() => scoreAsk(ask.id, n)}>
              {n}
            </Btn>
          ))}
        </div>
        {saved ? <p className="mt-2 text-sm text-muted">Saved score {saved}. A higher score replaces it.</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn
            onClick={() => {
              setIndex((value) => (value + ASKS.length - 1) % ASKS.length);
              setOpen(false);
            }}
          >
            Previous
          </Btn>
          <Btn
            tone="primary"
            onClick={() => {
              setIndex((value) => (value + 1) % ASKS.length);
              setOpen(false);
            }}
          >
            Next question
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function MinuteRoom({ onBack }: { onBack: () => void }) {
  const markMinute = useAcademy((s) => s.markMinute);
  const minutes = useAcademy((s) => s.booth.minutes);
  const [topic, setTopic] = useState(0);
  const [left, setLeft] = useState<number | null>(null);
  const [flags, setFlags] = useState<boolean[]>([false, false, false]);
  const checks = ["I stayed in English.", "I did not read a script.", "I used full sentences, not single words."];

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) return;
    const id = window.setTimeout(() => setLeft((value) => (value === null ? null : value - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [left]);

  const done = left === 0;
  const passed = flags.filter(Boolean).length >= 2;

  return (
    <div className="flex flex-col gap-3">
      <Back onBack={onBack} label={`${minutes} minutes kept`} />
      <Card>
        <p className="text-xs font-semibold tracking-wide text-teal uppercase">Sixty seconds</p>
        <h2 className="mt-2 text-xl font-extrabold">{MINUTE_TOPICS[topic]}</h2>
        <p className="mt-3 text-4xl font-extrabold tabular-nums">{left === null ? "1:00" : `0:${String(left).padStart(2, "0")}`}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {left === null && (
            <Btn tone="primary" onClick={() => { setFlags([false, false, false]); setLeft(60); }}>
              Start
            </Btn>
          )}
          {left !== null && left > 0 && (
            <Btn onClick={() => setLeft(null)}>Stop</Btn>
          )}
          <Btn
            onClick={() => {
              setTopic((value) => (value + 1) % MINUTE_TOPICS.length);
              setLeft(null);
              setFlags([false, false, false]);
            }}
          >
            Another topic
          </Btn>
        </div>
        {done && (
          <div className="mt-4">
            <p className="text-sm font-semibold">Tick what was true. Two is enough to keep the minute.</p>
            <ul className="mt-2">
              {checks.map((item, index) => (
                <li key={item}>
                  <label className="flex cursor-pointer gap-3 py-2">
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
              className="mt-2"
              disabled={!passed}
              onClick={() => {
                markMinute();
                setLeft(null);
                setFlags([false, false, false]);
                setTopic((value) => (value + 1) % MINUTE_TOPICS.length);
              }}
            >
              Keep this minute
            </Btn>
          </div>
        )}
      </Card>
    </div>
  );
}

function ClinicRoom({ onBack }: { onBack: () => void }) {
  const slips = useAcademy((s) => s.booth.slips);
  const markSlip = useAcademy((s) => s.markSlip);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const slip = SLIPS[index];
  const known = slips.includes(slip.id);
  const correct = picked === slip.answer;

  function go(next: number) {
    setIndex(next);
    setPicked(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <Back onBack={onBack} label={`${slips.length} of ${SLIPS.length} clean`} />
      <Card>
        <p className="text-xs font-semibold text-warn">A caller would stumble on this</p>
        <h2 className="mt-2 text-xl font-extrabold">{slip.wrong}</h2>
        <div className="mt-3 flex flex-col gap-2">
          {slip.options.map((option, optionIndex) => {
            const show = picked !== null;
            const on = show && optionIndex === slip.answer;
            const bad = show && picked === optionIndex && optionIndex !== slip.answer;
            return (
              <button
                key={option}
                type="button"
                disabled={picked !== null}
                onClick={() => {
                  setPicked(optionIndex);
                  if (optionIndex === slip.answer) markSlip(slip.id);
                }}
                className={cx(
                  "min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-semibold",
                  on ? "border-ok bg-ok-soft" : bad ? "border-warn bg-warn-soft" : "border-line bg-paper",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <p className={cx("mt-3 text-sm", correct || known ? "text-ok" : "text-warn")}>
            {slip.why} {known ? "Already clean." : correct ? "Marked clean." : "Try the next one, then come back."}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={() => speak(slip.options[slip.answer], 0.9)}>Hear the natural line</Btn>
          <Btn tone="primary" onClick={() => go((index + 1) % SLIPS.length)}>
            Next slip
          </Btn>
        </div>
      </Card>
    </div>
  );
}
