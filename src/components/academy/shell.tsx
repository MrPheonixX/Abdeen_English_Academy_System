import { useEffect, useState } from "react";
import {
  AudioLines,
  ChartNoAxesColumn,
  BookOpen,
  Compass,
  Flag,
  GraduationCap,
  House,
  Library,
  ListChecks,
  Menu,
  MessagesSquare,
  Moon,
  Newspaper,
  NotebookPen,
  Route,
  Briefcase,
  Sun,
  X,
  type LucideIcon,
} from "lucide-react";
import { rankFor } from "@/lib/academy/content";
import { dayKey } from "@/lib/academy/dates";
import { LESSON_COUNT } from "@/lib/academy/lessons";
import { streakCount, useAcademy, type TabId, type ThemeChoice } from "@/lib/academy/store";
import { LabView } from "./lab";
import { FloorView } from "./floor";
import { CheckView, HomeView, LevelsView, NotesView, PlanView, ProgressView, ResourcesView, WordsView } from "./pages";
import { ReadView } from "./read";
import { StudioView } from "./studio";
import { TalkView } from "./talk";
import { TodayView } from "./today";
import { cx } from "./ui";

const NAV: { id: TabId; label: string; icon: LucideIcon; primary?: boolean }[] = [
  { id: "today", label: "Today", icon: ListChecks, primary: true },
  { id: "studio", label: "Studio", icon: GraduationCap, primary: true },
  { id: "words", label: "Words", icon: Library, primary: true },
  { id: "progress", label: "Progress", icon: ChartNoAxesColumn, primary: true },
  { id: "talk", label: "Talk", icon: MessagesSquare },
  { id: "booth", label: "Booth", icon: Briefcase },
  { id: "read", label: "Reading", icon: Newspaper },
  { id: "lab", label: "Sounds", icon: AudioLines },
  { id: "home", label: "Home", icon: House },
  { id: "plan", label: "My plan", icon: Route },
  { id: "levels", label: "Levels", icon: Flag },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "check", label: "Level check", icon: Compass },
];

export function Academy() {
  const tab = useAcademy((s) => s.tab);
  const setTab = useAcademy((s) => s.setTab);
  const xp = useAcademy((s) => s.xp);
  const lv = useAcademy((s) => s.lv);
  const teDone = useAcademy((s) => s.teDone);
  const days = useAcademy((s) => s.days);
  const name = useAcademy((s) => s.name);
  const theme = useAcademy((s) => s.theme);
  const setTheme = useAcademy((s) => s.setTheme);
  const notice = useAcademy((s) => s.notice);
  const dismissNotice = useAcademy((s) => s.dismissNotice);
  const [today, setToday] = useState(dayKey);
  const [more, setMore] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setToday(dayKey()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const isDark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      setDark(isDark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const rank = rankFor(xp);
  const streak = streakCount(days, today);
  const lessons = Math.min(LESSON_COUNT, teDone);

  function open(next: TabId) {
    setTab(next);
    setMore(false);
    window.scrollTo(0, 0);
  }

  return (
    <div className="app-pad mx-auto min-h-screen w-full max-w-5xl px-4 pt-5 md:px-6">
      <header className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-teal">Speaking practice that stays on this page</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Abdeen English Academy</h1>
            <p className="mt-1 text-sm text-muted">For {name || "you"}. Progress stays in this browser.</p>
          </div>
          <button
            type="button"
            aria-label={dark ? "Switch to light" : "Switch to dark"}
            onClick={() => setTheme(nextTheme(theme, dark))}
            className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-card"
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </div>
        <div className="mt-4 rounded-card bg-teal px-4 py-4 text-teal-ink">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-extrabold">{rank.current.name}</p>
              <p className="text-sm text-teal-ink/80">
                {rank.next ? `${rank.next.xp - xp} XP to ${rank.next.name}` : "Top rank"}
              </p>
            </div>
            <p className="text-sm font-semibold">Level {lv}</p>
          </div>
          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-teal-ink/25"
            role="progressbar"
            aria-label="Rank progress"
            aria-valuenow={Math.round(rank.pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-gold" style={{ width: `${rank.pct}%` }} />
          </div>
          <p className="mt-3 text-sm text-teal-ink/90">
            English for a better job, without quitting early. Travel uses the same plan.
          </p>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Stat value={String(streak)} label="streak" />
          <Stat value={String(lv)} label="level" />
          <Stat value={String(xp)} label="XP" />
          <Stat value={String(lessons)} label="lessons" />
        </div>
      </header>

      {notice && (
        <div className="mb-3 flex items-start justify-between gap-3 rounded-2xl border border-warn bg-warn-soft px-3 py-3 text-sm text-warn">
          <p>{notice}</p>
          <button type="button" className="font-semibold" onClick={dismissNotice}>
            Close
          </button>
        </div>
      )}

      <div className="md:grid md:grid-cols-[13.5rem_minmax(0,1fr)] md:items-start md:gap-6">
        <nav className="mb-3 hidden md:sticky md:top-4 md:block" aria-label="Sections">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavButton key={item.id} item={item} active={tab === item.id} onClick={() => open(item.id)} />
            ))}
          </div>
        </nav>
        <main className="min-w-0">
          {tab === "home" && <HomeView today={today} />}
          {tab === "today" && <TodayView today={today} />}
          {tab === "plan" && <PlanView />}
          {tab === "levels" && <LevelsView />}
          {tab === "lab" && <LabView />}
          {tab === "studio" && <StudioView />}
          {tab === "talk" && <TalkView />}
          {tab === "booth" && <FloorView />}
          {tab === "read" && <ReadView today={today} />}
          {tab === "words" && <WordsView today={today} />}
          {tab === "resources" && <ResourcesView />}
          {tab === "notes" && <NotesView />}
          {tab === "progress" && <ProgressView today={today} />}
          {tab === "check" && <CheckView />}
        </main>
      </div>

      <nav
        className="safe-dock fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-5">
          {NAV.filter((item) => item.primary).map((item) => (
            <NavButton key={item.id} item={item} active={tab === item.id} onClick={() => open(item.id)} stacked />
          ))}
          <button
            type="button"
            onClick={() => setMore(true)}
            className={cx(
              "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold",
              !NAV.find((item) => item.id === tab)?.primary ? "text-teal" : "text-muted",
            )}
          >
            <Menu className="size-5" aria-hidden />
            More
          </button>
        </div>
      </nav>

      {more && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/40" onClick={() => setMore(false)} />
          <div className="safe-dock absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-3xl border border-line bg-card px-4 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold">More</p>
              <button type="button" aria-label="Close" className="inline-flex size-11 items-center justify-center" onClick={() => setMore(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="grid gap-1 pb-2">
              {NAV.filter((item) => !item.primary).map((item) => (
                <NavButton key={item.id} item={item} active={tab === item.id} onClick={() => open(item.id)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-2 py-2 text-center">
      <b className="block text-lg leading-none font-extrabold tabular-nums">{value}</b>
      <span className="mt-1 block text-xs text-muted">{label}</span>
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
  stacked,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onClick: () => void;
  stacked?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cx(
        stacked
          ? "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold"
          : "flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold",
        active ? "bg-teal text-teal-ink" : "text-ink",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      {item.label}
    </button>
  );
}

function nextTheme(theme: ThemeChoice, dark: boolean): ThemeChoice {
  if (theme === "system") return dark ? "light" : "dark";
  return theme === "dark" ? "light" : "dark";
}
