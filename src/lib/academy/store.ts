import { create } from "zustand";
import { currentAccount, GUEST_KEY, profileKey } from "./accounts";
import { deleteClip } from "./audio";
import {
  DEFAULT_REWARDS,
  taskSplit,
  type DayMode,
  type TaskId,
} from "./content";
import { dayKey, monthKey } from "./dates";
import { LESSON_COUNT, lessonsFrom } from "./lessons";

export type TabId =
  | "home"
  | "today"
  | "plan"
  | "levels"
  | "lab"
  | "words"
  | "read"
  | "talk"
  | "studio"
  | "resources"
  | "notes"
  | "progress"
  | "check"
  | "booth";

export type ThemeChoice = "system" | "light" | "dark";
export type MinuteKind = "disc" | "listen" | "shadow";
export type RecordingKind = "news" | "twister" | "call" | "speak";

export type DayLog = {
  mode: DayMode;
  done: string[];
  rest: boolean;
  legacyOk?: boolean;
  teCredit?: number;
  bonusPaid?: boolean;
  minuteXp?: Partial<Record<MinuteKind, number>>;
};

export type WordItem = { id: string; w: string; s: string; d: string };
export type NotePage = { id: number; t: string; b: string };
export type MinuteLog = { d: string; m: number };
export type RecordingItem = {
  id: string;
  d: string;
  kind: RecordingKind;
  title: string;
  seconds: number;
};

export type AcademyData = {
  xp: number;
  lv: number;
  passed: number[];
  days: Record<string, DayLog>;
  words: WordItem[];
  notes: NotePage[];
  nid: number;
  teNext: number;
  teDone: number;
  discLog: MinuteLog[];
  listenLog: MinuteLog[];
  shadowLog: MinuteLog[];
  recordings: RecordingItem[];
  rw: string[];
  tab: TabId;
  theme: ThemeChoice;
  sprintEndsAt: number | null;
  name: string;
  studio: number[];
  reads: string[];
  talks: Record<string, number>;
  booth: BoothState;
};

type AcademyStore = AcademyData & {
  hydrated: boolean;
  notice: string;
  deskId: string | null;
  hydrate: () => void;
  setTab: (tab: TabId) => void;
  setTheme: (theme: ThemeChoice) => void;
  setMode: (mode: DayMode) => void;
  setDayMode: (date: string, mode: DayMode) => void;
  toggleRest: () => void;
  toggleTask: (id: TaskId) => void;
  setReward: (index: number, value: string) => void;
  addWord: (w: string, s: string) => boolean;
  removeWord: (id: string) => void;
  addNote: () => void;
  selectNote: (id: number) => void;
  updateNote: (id: number, patch: Partial<Pick<NotePage, "t" | "b">>) => void;
  deleteNote: (id: number) => void;
  addMinutes: (kind: MinuteKind, minutes: number) => void;
  addRecording: (item: RecordingItem) => void;
  removeRecording: (id: string) => void;
  minutesThisMonth: (kind: MinuteKind, today?: string) => number;
  minutesToday: (kind: MinuteKind, today?: string) => number;
  setLesson: (n: number) => void;
  placeLevel: (level: number) => void;
  passLevel: () => void;
  startSprint: () => void;
  clearSprint: () => void;
  dismissNotice: () => void;
  setName: (name: string) => void;
  markStudio: (n: number) => void;
  finishRead: (id: string) => void;
  finishTalk: (id: string, score: number) => void;
  markLine: (id: string) => void;
  markMail: (id: string) => void;
  scoreAsk: (id: string, score: number) => void;
  markMinute: () => void;
  markSlip: (id: string) => void;
  openDesk: (id: string | null) => void;
  exportData: () => AcademyData;
  importData: (raw: unknown) => boolean;
};

const THEME_KEY = "eng-academy-theme";

const TABS: TabId[] = [
  "home",
  "today",
  "plan",
  "levels",
  "lab",
  "words",
  "read",
  "talk",
  "studio",
  "resources",
  "notes",
  "progress",
  "check",
  "booth",
];

export type BoothState = {
  lines: string[];
  mails: string[];
  asks: Record<string, number>;
  minutes: number;
  slips: string[];
};

export function emptyBooth(): BoothState {
  return { lines: [], mails: [], asks: {}, minutes: 0, slips: [] };
}

export const emptyDay = (): DayLog => ({
  mode: "n",
  done: [],
  rest: false,
});

export function defaults(): AcademyData {
  return {
    xp: 0,
    lv: 1,
    passed: [],
    days: {},
    words: [],
    notes: [],
    nid: 0,
    teNext: 1,
    teDone: 0,
    discLog: [],
    listenLog: [],
    shadowLog: [],
    recordings: [],
    rw: [...DEFAULT_REWARDS],
    tab: "today",
    theme: "system",
    sprintEndsAt: null,
    name: "Ahmed",
    studio: [],
    reads: [],
    talks: {},
    booth: emptyBooth(),
  };
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clampLesson(n: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(LESSON_COUNT + 1, Math.round(n)));
}

function asMode(value: unknown): DayMode {
  if (value === "s" || value === "o" || value === "n") return value;
  if (value === "m") return "s";
  return "n";
}

const OLD_TASK: Record<string, TaskId | "te"> = {
  l1: "te",
  l2: "te",
  l3: "te",
  rv: "review",
  tt: "tw",
  sn: "vocab",
  ar: "news1",
  a2: "news2",
  a3: "news3",
  sh: "shadow",
  li: "msa",
  fun: "game",
  dc: "discord",
  mc: "mock",
  review: "review",
  te: "te",
  tw: "tw",
  news1: "news1",
  news2: "news2",
  news3: "news3",
  vocab: "vocab",
  shadow: "shadow",
  msa: "msa",
  game: "game",
  discord: "discord",
  mock: "mock",
};

function migrateDays(raw: unknown): Record<string, DayLog> {
  if (!raw || typeof raw !== "object") return {};
  const days: Record<string, DayLog> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    const doneRaw = Array.isArray(row.done) ? row.done : [];
    const done = [
      ...new Set(
        doneRaw
          .map((id) => OLD_TASK[String(id)] ?? null)
          .filter((id): id is TaskId => Boolean(id)),
      ),
    ];
    days[key] = {
      mode: asMode(row.mode),
      done,
      rest: Boolean(row.rest),
      legacyOk: Boolean(row.ok) || Boolean(row.legacyOk),
      teCredit: typeof row.teCredit === "number" ? row.teCredit : undefined,
      bonusPaid: Boolean(row.bonusPaid),
      minuteXp:
        row.minuteXp && typeof row.minuteXp === "object"
          ? (row.minuteXp as DayLog["minuteXp"])
          : undefined,
    };
  }
  return days;
}

function migrateWords(raw: unknown): WordItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const w = String(row.w ?? "").trim();
      if (!w) return null;
      return {
        id: typeof row.id === "string" ? row.id : `w-${index}-${row.d ?? "x"}`,
        w,
        s: String(row.s ?? ""),
        d: typeof row.d === "string" ? row.d : dayKey(),
      };
    })
    .filter((item): item is WordItem => Boolean(item));
}

function migrateNotes(raw: unknown): NotePage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = Number(row.id);
      if (!Number.isFinite(id)) return null;
      return { id, t: String(row.t ?? ""), b: String(row.b ?? "") };
    })
    .filter((item): item is NotePage => Boolean(item));
}

function migrateRecordings(raw: unknown): RecordingItem[] {
  if (!Array.isArray(raw)) return [];
  const kinds = new Set<RecordingKind>(["news", "twister", "call", "speak"]);
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const kind = row.kind;
      const id = typeof row.id === "string" ? row.id : "";
      const d = typeof row.d === "string" ? row.d : "";
      const seconds = Number(row.seconds);
      if (!id || !d || !kinds.has(kind as RecordingKind) || !Number.isFinite(seconds)) return null;
      return {
        id,
        d,
        kind: kind as RecordingKind,
        title: String(row.title ?? "Recording").slice(0, 120),
        seconds: Math.max(1, Math.min(8 * 60, Math.round(seconds))),
      };
    })
    .filter((item): item is RecordingItem => Boolean(item))
    .slice(-24);
}

function migrateBooth(raw: unknown): BoothState {
  const base = emptyBooth();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Record<string, unknown>;
  const take = (value: unknown, cap: number) =>
    Array.isArray(value)
      ? [...new Set(value.map((id) => String(id)).filter(Boolean))].slice(0, cap)
      : [];
  const asks: Record<string, number> = {};
  if (row.asks && typeof row.asks === "object") {
    for (const [key, value] of Object.entries(row.asks as Record<string, unknown>)) {
      const score = Number(value);
      if (!key || !Number.isFinite(score)) continue;
      asks[key.slice(0, 40)] = Math.max(1, Math.min(5, Math.round(score)));
    }
  }
  return {
    lines: take(row.lines, 200),
    mails: take(row.mails, 40),
    slips: take(row.slips, 40),
    asks,
    minutes: Math.max(0, Math.min(500, Math.round(Number(row.minutes) || 0))),
  };
}

function migrateTalks(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const talks: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const score = Number(value);
    if (!key || !Number.isFinite(score)) continue;
    talks[key.slice(0, 40)] = Math.max(0, Math.min(100, Math.round(score)));
  }
  return talks;
}

function migrateLogs(raw: unknown): MinuteLog[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const m = Number(row.m);
      const d = typeof row.d === "string" ? row.d : "";
      if (!d || !Number.isFinite(m) || m <= 0) return null;
      return { d, m: Math.round(m) };
    })
    .filter((item): item is MinuteLog => Boolean(item));
}

function sanitize(raw: unknown): AcademyData | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const base = defaults();
  const tab = TABS.includes(row.tab as TabId) ? (row.tab as TabId) : "today";
  const theme: ThemeChoice =
    row.theme === "light" || row.theme === "dark" || row.theme === "system"
      ? row.theme
      : "system";
  const rw = Array.isArray(row.rw) ? row.rw.map((item) => String(item ?? "")) : base.rw;
  while (rw.length < 3) rw.push(DEFAULT_REWARDS[rw.length] ?? "");
  return {
    xp: Math.max(0, Number(row.xp) || 0),
    lv: Math.min(3, Math.max(1, Number(row.lv) || 1)),
    passed: Array.isArray(row.passed)
      ? row.passed.map(Number).filter((n) => n === 1 || n === 2 || n === 3)
      : [],
    days: migrateDays(row.days),
    words: migrateWords(row.words),
    notes: migrateNotes(row.notes),
    nid: Number(row.nid) || 0,
    teNext: clampLesson(Number(row.teNext) || 1),
    teDone: Math.max(0, Math.min(LESSON_COUNT, Number(row.teDone) || 0)),
    discLog: migrateLogs(row.discLog),
    listenLog: migrateLogs(row.listenLog),
    shadowLog: migrateLogs(row.shadowLog),
    recordings: migrateRecordings(row.recordings),
    rw: rw.slice(0, 3),
    tab,
    theme,
    sprintEndsAt: typeof row.sprintEndsAt === "number" ? row.sprintEndsAt : null,
    name: typeof row.name === "string" && row.name.trim() ? row.name.trim().slice(0, 40) : "Ahmed",
    studio: Array.isArray(row.studio)
      ? [...new Set(row.studio.map(Number).filter((n) => n >= 1 && n <= LESSON_COUNT))]
      : [],
    reads: Array.isArray(row.reads) ? [...new Set(row.reads.map((id) => String(id)).filter(Boolean))].slice(0, 40) : [],
    talks: migrateTalks(row.talks),
    booth: migrateBooth(row.booth),
  };
}

function readStorage(): AcademyData {
  if (typeof localStorage === "undefined") return defaults();
  const base = profileKey();
  const keys = [base, `${base}:backup`, ...(base === GUEST_KEY ? ["eng-academy-v2", "eng-academy"] : [])];
  for (const key of keys) {
    const text = localStorage.getItem(key);
    if (!text) continue;
    try {
      const parsed = sanitize(JSON.parse(text));
      if (parsed) return parsed;
    } catch {
      /* try the next key */
    }
  }
  return defaults();
}

function pick(state: AcademyStore): AcademyData {
  return {
    xp: state.xp,
    lv: state.lv,
    passed: state.passed,
    days: state.days,
    words: state.words,
    notes: state.notes,
    nid: state.nid,
    teNext: state.teNext,
    teDone: state.teDone,
    discLog: state.discLog,
    listenLog: state.listenLog,
    shadowLog: state.shadowLog,
    recordings: state.recordings,
    rw: state.rw,
    tab: state.tab,
    theme: state.theme,
    sprintEndsAt: state.sprintEndsAt,
    name: state.name,
    studio: state.studio,
    reads: state.reads,
    talks: state.talks,
    booth: state.booth,
  };
}

let backupDay = "";

function persist(data: AcademyData) {
  let ok = true;
  try {
    const key = profileKey();
    const text = JSON.stringify(data);
    const previous = localStorage.getItem(key);
    const today = new Date().toISOString().slice(0, 10);
    // Keep the last known good copy once per day in case the main one is damaged.
    if (previous && previous !== text && backupDay !== today) {
      localStorage.setItem(`${key}:backup`, previous);
      backupDay = today;
    }
    localStorage.setItem(key, text);
    localStorage.setItem(THEME_KEY, data.theme);
  } catch {
    ok = false;
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("academy-save", { detail: { ok } }));
  }
}

function logsOf(data: AcademyData, kind: MinuteKind) {
  if (kind === "disc") return data.discLog;
  if (kind === "listen") return data.listenLog;
  return data.shadowLog;
}

function withLogs(data: AcademyData, kind: MinuteKind, logs: MinuteLog[]): AcademyData {
  if (kind === "disc") return { ...data, discLog: logs };
  if (kind === "listen") return { ...data, listenLog: logs };
  return { ...data, shadowLog: logs };
}

function capFor(kind: MinuteKind, minutes: number) {
  const raw = Math.ceil(minutes / 10);
  if (kind === "disc") return Math.min(20, raw);
  if (kind === "listen") return Math.min(15, raw);
  return Math.min(10, raw);
}

function syncBonus(day: DayLog, xp: number) {
  const required = taskSplit(day.mode).required;
  const ok = !day.rest && required.every((id) => day.done.includes(id));
  if (ok && !day.bonusPaid) return { day: { ...day, bonusPaid: true }, xp: xp + 40 };
  if (!ok && day.bonusPaid) {
    return { day: { ...day, bonusPaid: false }, xp: Math.max(0, xp - 40) };
  }
  return { day, xp };
}

export function isDayFull(day: DayLog | undefined) {
  if (!day) return false;
  if (day.rest || day.legacyOk) return true;
  return taskSplit(day.mode).required.every((id) => day.done.includes(id));
}

export function streakCount(days: Record<string, DayLog>, today = dayKey()) {
  let cursor = today;
  if (!isDayFull(days[cursor])) cursor = shiftBack(cursor);
  let n = 0;
  while (isDayFull(days[cursor])) {
    n += 1;
    cursor = shiftBack(cursor);
    if (n > 4000) break;
  }
  return n;
}

function shiftBack(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() - 1);
  return dayKey(dt);
}

function restUsedRecently(days: Record<string, DayLog>, today: string) {
  for (let i = 1; i <= 6; i += 1) {
    const key = shiftBackN(today, i);
    if (days[key]?.rest) return true;
  }
  return false;
}

function shiftBackN(today: string, n: number) {
  let key = today;
  for (let i = 0; i < n; i += 1) key = shiftBack(key);
  return key;
}

export const useAcademy = create<AcademyStore>((set, get) => ({
  ...defaults(),
  hydrated: false,
  notice: "",
  deskId: null,
  hydrate: () => {
    const data = readStorage();
    const account = currentAccount();
    if (account && !data.name) data.name = account.name;
    set({ ...data, hydrated: true, notice: "" });
  },
  setTab: (tab) => {
    const next = { ...pick(get()), tab };
    persist(next);
    set({ tab });
  },
  setTheme: (theme) => {
    const next = { ...pick(get()), theme };
    persist(next);
    set({ theme });
  },
  setMode: (mode) => {
    get().setDayMode(dayKey(), mode);
  },
  setDayMode: (date, mode) => {
    const state = get();
    const prev = state.days[date] ?? emptyDay();
    let day: DayLog = { ...prev, mode };
    let xp = state.xp;
    if (date === dayKey()) ({ day, xp } = syncBonus(day, xp));
    const days = { ...state.days, [date]: day };
    const next = { ...pick(state), days, xp };
    persist(next);
    set({ days, xp, notice: "" });
  },
  toggleRest: () => {
    const today = dayKey();
    const state = get();
    const prev = state.days[today] ?? emptyDay();
    if (!prev.rest && restUsedRecently(state.days, today)) {
      set({ notice: "You already used the one rest day in the last 7 days." });
      return;
    }
    let day: DayLog = { ...prev, rest: !prev.rest };
    let xp = state.xp;
    ({ day, xp } = syncBonus(day, xp));
    const days = { ...state.days, [today]: day };
    const next = { ...pick(state), days, xp };
    persist(next);
    set({ days, xp, notice: "" });
  },
  toggleTask: (id) => {
    const today = dayKey();
    const state = get();
    const prev = state.days[today] ?? emptyDay();
    const wasDone = prev.done.includes(id);
    let done = prev.done;
    let xp = state.xp;
    let teNext = state.teNext;
    let teDone = state.teDone;
    let teCredit = prev.teCredit ?? 0;
    if (wasDone) {
      done = done.filter((item) => item !== id);
      xp = Math.max(0, xp - 10);
      if (id === "te" && teCredit > 0) {
        teNext = Math.max(1, teNext - teCredit);
        teDone = Math.max(0, teDone - teCredit);
        teCredit = 0;
      }
    } else {
      done = [...done, id];
      xp += 10;
      if (id === "te") {
        const batch = lessonsFrom(teNext);
        teCredit = batch.length;
        teNext = Math.min(LESSON_COUNT + 1, teNext + teCredit);
        teDone = Math.min(LESSON_COUNT, teDone + batch.length);
      }
    }
    let day: DayLog = { ...prev, done, teCredit };
    ({ day, xp } = syncBonus(day, xp));
    const days = { ...state.days, [today]: day };
    const next = { ...pick(state), days, xp, teNext, teDone };
    persist(next);
    set({ days, xp, teNext, teDone, notice: "" });
  },
  setReward: (index, value) => {
    const rw = get().rw.slice();
    rw[index] = value;
    const next = { ...pick(get()), rw };
    persist(next);
    set({ rw });
  },
  addWord: (w, s) => {
    const word = w.trim();
    const sentence = s.trim();
    if (!word || !sentence) {
      set({ notice: "Add the phrase and your own sentence." });
      return false;
    }
    const state = get();
    const words = [...state.words, { id: uid(), w: word, s: sentence, d: dayKey() }];
    const xp = state.xp + 5;
    const next = { ...pick(state), words, xp };
    persist(next);
    set({ words, xp, notice: "" });
    return true;
  },
  removeWord: (id) => {
    const state = get();
    if (!state.words.some((word) => word.id === id)) return;
    const words = state.words.filter((word) => word.id !== id);
    const xp = Math.max(0, state.xp - 5);
    const next = { ...pick(state), words, xp };
    persist(next);
    set({ words, xp });
  },
  addNote: () => {
    const state = get();
    const id = Date.now();
    const notes = [...state.notes, { id, t: "", b: "" }];
    const next = { ...pick(state), notes, nid: id };
    persist(next);
    set({ notes, nid: id });
  },
  selectNote: (id) => {
    const next = { ...pick(get()), nid: id };
    persist(next);
    set({ nid: id });
  },
  updateNote: (id, patch) => {
    const notes = get().notes.map((note) => (note.id === id ? { ...note, ...patch } : note));
    const next = { ...pick(get()), notes };
    persist(next);
    set({ notes });
  },
  deleteNote: (id) => {
    const state = get();
    const notes = state.notes.filter((note) => note.id !== id);
    const nid = state.nid === id ? (notes[0]?.id ?? 0) : state.nid;
    const next = { ...pick(state), notes, nid };
    persist(next);
    set({ notes, nid });
  },
  addMinutes: (kind, minutes) => {
    const mins = Math.round(minutes);
    if (!Number.isFinite(mins) || mins <= 0) {
      set({ notice: "Enter the minutes as a number above 0." });
      return;
    }
    const today = dayKey();
    const state = get();
    const logs = [...logsOf(state, kind), { d: today, m: mins }];
    const totalToday = logs.filter((row) => row.d === today).reduce((sum, row) => sum + row.m, 0);
    const prev = state.days[today] ?? emptyDay();
    const already = prev.minuteXp?.[kind] ?? 0;
    const paid = capFor(kind, totalToday);
    const gain = Math.max(0, paid - already);
    let day: DayLog = {
      ...prev,
      minuteXp: { ...prev.minuteXp, [kind]: already + gain },
    };
    let xp = state.xp + gain;
    let data = withLogs({ ...pick(state), xp }, kind, logs);
    data = { ...data, days: { ...state.days, [today]: day } };
    persist(data);
    set({ ...data, notice: "" });
  },
  addRecording: (item) => {
    const state = get();
    const recordings = [...state.recordings, item];
    const dropped = recordings.length > 24 ? recordings.splice(0, recordings.length - 24) : [];
    const next = { ...pick(state), recordings };
    persist(next);
    set({ recordings });
    dropped.forEach((old) => {
      void deleteClip(old.id);
    });
  },
  removeRecording: (id) => {
    const state = get();
    if (!state.recordings.some((item) => item.id === id)) return;
    const recordings = state.recordings.filter((item) => item.id !== id);
    const next = { ...pick(state), recordings };
    persist(next);
    set({ recordings });
    void deleteClip(id);
  },
  minutesThisMonth: (kind, today = dayKey()) => {
    const month = monthKey(today);
    return logsOf(get(), kind)
      .filter((row) => monthKey(row.d) === month)
      .reduce((sum, row) => sum + row.m, 0);
  },
  minutesToday: (kind, today = dayKey()) =>
    logsOf(get(), kind)
      .filter((row) => row.d === today)
      .reduce((sum, row) => sum + row.m, 0),
  setLesson: (n) => {
    const teNext = clampLesson(n);
    const teDone = Math.max(0, Math.min(LESSON_COUNT, teNext - 1));
    const next = { ...pick(get()), teNext, teDone };
    persist(next);
    set({ teNext, teDone, notice: "" });
  },
  placeLevel: (level) => {
    const lv = Math.min(3, Math.max(1, level));
    const next = { ...pick(get()), lv };
    persist(next);
    set({ lv, notice: "" });
  },
  passLevel: () => {
    const state = get();
    if (state.lv >= 3) return;
    const passed = state.passed.includes(state.lv)
      ? state.passed
      : [...state.passed, state.lv];
    const xp = state.passed.includes(state.lv) ? state.xp : state.xp + 120;
    const lv = state.lv + 1;
    const next = { ...pick(state), passed, xp, lv };
    persist(next);
    set({ passed, xp, lv });
  },
  startSprint: () => {
    const sprintEndsAt = Date.now() + 5 * 60 * 1000;
    const next = { ...pick(get()), sprintEndsAt };
    persist(next);
    set({ sprintEndsAt });
  },
  clearSprint: () => {
    const next = { ...pick(get()), sprintEndsAt: null };
    persist(next);
    set({ sprintEndsAt: null });
  },
  dismissNotice: () => set({ notice: "" }),
  setName: (name) => {
    const clean = name.slice(0, 40);
    const next = { ...pick(get()), name: clean };
    persist(next);
    set({ name: clean });
  },
  markStudio: (n) => {
    const state = get();
    if (state.studio.includes(n) || n < 1 || n > LESSON_COUNT) return;
    const studio = [...state.studio, n];
    const xp = state.xp + 8;
    const next = { ...pick(state), studio, xp };
    persist(next);
    set({ studio, xp, notice: "" });
  },
  finishRead: (id) => {
    const state = get();
    if (!id || state.reads.includes(id)) return;
    const reads = [...state.reads, id];
    const xp = state.xp + 12;
    const next = { ...pick(state), reads, xp };
    persist(next);
    set({ reads, xp });
  },
  finishTalk: (id, score) => {
    const state = get();
    const prev = state.talks[id] ?? 0;
    const nextScore = Math.max(prev, Math.max(0, Math.min(100, Math.round(score))));
    let xp = state.xp;
    if (prev === 0) xp += 10;
    if (prev < 80 && nextScore >= 80) xp += 15;
    const talks = { ...state.talks, [id]: nextScore };
    const next = { ...pick(state), talks, xp };
    persist(next);
    set({ talks, xp });
  },
  markLine: (id) => {
    const state = get();
    if (!id || state.booth.lines.includes(id)) return;
    const booth = { ...state.booth, lines: [...state.booth.lines, id] };
    const xp = state.xp + 2;
    const next = { ...pick(state), booth, xp };
    persist(next);
    set({ booth, xp });
  },
  markMail: (id) => {
    const state = get();
    if (!id || state.booth.mails.includes(id)) return;
    const booth = { ...state.booth, mails: [...state.booth.mails, id] };
    const xp = state.xp + 12;
    const next = { ...pick(state), booth, xp };
    persist(next);
    set({ booth, xp });
  },
  scoreAsk: (id, score) => {
    const state = get();
    const clean = Math.max(1, Math.min(5, Math.round(score)));
    const prev = state.booth.asks[id] ?? 0;
    if (clean <= prev) {
      const booth = { ...state.booth, asks: { ...state.booth.asks, [id]: prev } };
      set({ booth });
      return;
    }
    let xp = state.xp;
    if (prev === 0) xp += 8;
    if (prev < 4 && clean >= 4) xp += 6;
    const booth = { ...state.booth, asks: { ...state.booth.asks, [id]: clean } };
    const next = { ...pick(state), booth, xp };
    persist(next);
    set({ booth, xp });
  },
  markMinute: () => {
    const state = get();
    const booth = { ...state.booth, minutes: Math.min(500, state.booth.minutes + 1) };
    const xp = state.xp + 6;
    const next = { ...pick(state), booth, xp };
    persist(next);
    set({ booth, xp });
  },
  markSlip: (id) => {
    const state = get();
    if (!id || state.booth.slips.includes(id)) return;
    const booth = { ...state.booth, slips: [...state.booth.slips, id] };
    const xp = state.xp + 3;
    const next = { ...pick(state), booth, xp };
    persist(next);
    set({ booth, xp });
  },
  openDesk: (id) => {
    const next = { ...pick(get()), tab: "read" as const };
    persist(next);
    set({ tab: "read", deskId: id });
  },
  exportData: () => pick(get()),
  importData: (raw) => {
    const data = sanitize(raw);
    if (!data) {
      set({ notice: "That file is not an English Academy backup." });
      return false;
    }
    persist(data);
    set({ ...data, hydrated: true, notice: "Backup restored on this device." });
    return true;
  },
}));
