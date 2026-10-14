import { useState } from "react";
import { ARTICLES, articlesForDay, type Article } from "@/lib/academy/articles";
import { speakLines } from "@/lib/academy/speak";
import { useAcademy } from "@/lib/academy/store";
import { Recorder } from "./record";
import { Btn, Card, cx } from "./ui";

export function ReadView({ today }: { today: string }) {
  const deskId = useAcademy((s) => s.deskId);
  const reads = useAcademy((s) => s.reads);
  const finishRead = useAcademy((s) => s.finishRead);
  const openDesk = useAcademy((s) => s.openDesk);
  const todays = articlesForDay(today);
  const article = ARTICLES.find((item) => item.id === deskId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <p className="text-xs font-semibold tracking-wide text-teal uppercase">Level 2, written here</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight">Reading desk</h2>
        <p className="mt-1 text-sm text-muted">
          Three short pieces for today, on this page. Read them aloud. Record. Then answer without looking back if you can. News in Levels is still a good extra, not a requirement.
        </p>
      </Card>
      {article ? (
        <Reader article={article} done={reads.includes(article.id)} onBack={() => openDesk(null)} onDone={() => finishRead(article.id)} />
      ) : (
        <>
          <Card>
            <h3 className="text-base font-bold">Today's three</h3>
            <div className="mt-3 flex flex-col gap-2">
              {todays.map((item, index) => (
                <ArticleButton key={item.id} index={index + 1} article={item} done={reads.includes(item.id)} onOpen={() => openDesk(item.id)} />
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-base font-bold">Whole desk</h3>
            <div className="mt-3 flex flex-col gap-2">
              {ARTICLES.map((item) => (
                <ArticleButton key={item.id} article={item} done={reads.includes(item.id)} onOpen={() => openDesk(item.id)} />
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function ArticleButton({
  article,
  done,
  index,
  onOpen,
}: {
  article: Article;
  done: boolean;
  index?: number;
  onOpen: () => void;
}) {
  return (
    <button type="button" onClick={onOpen} className="min-h-11 rounded-xl border border-line bg-paper px-3 py-2 text-left">
      <span className="block font-semibold">
        {index ? `${index}. ` : ""}
        {article.title}
      </span>
      <span className="mt-0.5 block text-xs text-muted">
        {article.minutes} min{done ? " · read" : ""}
      </span>
    </button>
  );
}

function Reader({
  article,
  done,
  onBack,
  onDone,
}: {
  article: Article;
  done: boolean;
  onBack: () => void;
  onDone: () => void;
}) {
  const [picks, setPicks] = useState<Array<number | null>>(() => article.questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const allPicked = picks.every((pick) => pick !== null);
  const correct = article.questions.filter((quiz, index) => picks[index] === quiz.answer).length;

  return (
    <Card>
      <button type="button" className="text-sm font-semibold text-teal" onClick={onBack}>
        All articles
      </button>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{article.title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed">
        {article.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn tone="primary" onClick={() => speakLines(article.paragraphs, 0.9, 280)}>
          Hear it
        </Btn>
      </div>
      <h3 className="mt-4 text-base font-bold">Keep these</h3>
      <ul className="mt-2 space-y-2">
        {article.glossary.map((item) => (
          <li key={item.w} className="text-sm">
            <span className="font-semibold">{item.w}.</span> {item.d}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Recorder kind="news" title={article.title} />
      </div>
      <h3 className="mt-4 text-base font-bold">Three questions</h3>
      <div className="mt-2 flex flex-col gap-3">
        {article.questions.map((quiz, qIndex) => (
          <fieldset key={quiz.q} className="border-t border-line pt-3">
            <legend className="text-sm font-semibold">{quiz.q}</legend>
            <div className="mt-2 flex flex-col gap-2">
              {quiz.options.map((option, oIndex) => {
                const on = picks[qIndex] === oIndex;
                const right = checked && oIndex === quiz.answer;
                const wrong = checked && on && oIndex !== quiz.answer;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={checked}
                    onClick={() =>
                      setPicks((current) => current.map((pick, index) => (index === qIndex ? oIndex : pick)))
                    }
                    className={cx(
                      "min-h-11 rounded-xl border px-3 text-left text-sm font-semibold",
                      right && "border-ok bg-ok text-ok-ink",
                      wrong && "border-warn bg-warn-soft text-warn",
                      on && !checked && "border-teal bg-teal text-teal-ink",
                      !on && !right && "border-line bg-card",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {!checked ? (
          <Btn tone="gold" disabled={!allPicked} onClick={() => setChecked(true)}>
            Check answers
          </Btn>
        ) : (
          <p className="text-sm font-semibold text-ok">
            {correct} / {article.questions.length} right.
          </p>
        )}
        <Btn tone={done ? "ok" : "primary"} disabled={!checked} onClick={onDone}>
          {done ? "Saved" : "Mark read"}
        </Btn>
      </div>
    </Card>
  );
}
