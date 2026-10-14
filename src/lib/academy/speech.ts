type SpeechResult = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResult) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRec;
  webkitSpeechRecognition?: new () => SpeechRec;
};

export function canListen() {
  if (typeof window === "undefined") return false;
  const w = window as SpeechWindow;
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function listenOnce(seconds = 8): Promise<string> {
  const w = window as SpeechWindow;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return Promise.resolve("");
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.continuous = false;
  rec.interimResults = true;
  return new Promise((resolve) => {
    let text = "";
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
      resolve(text.trim());
    };
    rec.onresult = (event) => {
      text = Array.from(event.results)
        .map((row) => row[0]?.transcript ?? "")
        .join(" ")
        .trim();
    };
    rec.onerror = finish;
    rec.onend = finish;
    window.setTimeout(finish, seconds * 1000);
    try {
      rec.start();
    } catch {
      finish();
    }
  });
}

export function wordsOf(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function matchScore(expected: string, heard: string) {
  const want = wordsOf(expected);
  if (!want.length || !heard.trim()) return 0;
  const got = new Set(wordsOf(heard));
  const hits = want.filter((word) => got.has(word)).length;
  return Math.round((hits / want.length) * 100);
}
