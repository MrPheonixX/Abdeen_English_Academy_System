import { LESSON_COUNT, lessonsFrom, type Lesson } from "./lessons";

export type DayMode = "s" | "n" | "o";

export type TaskId =
  | "review"
  | "te"
  | "tw"
  | "news1"
  | "news2"
  | "news3"
  | "vocab"
  | "shadow"
  | "msa"
  | "game"
  | "discord"
  | "mock";

export const FLOW: TaskId[] = [
  "review",
  "te",
  "news1",
  "news2",
  "news3",
  "vocab",
  "tw",
  "msa",
  "shadow",
  "game",
  "mock",
  "discord",
];

const RECOVERY_REQUIRED: TaskId[] = ["review", "te", "tw", "discord"];
const NORMAL_REQUIRED: TaskId[] = [
  ...RECOVERY_REQUIRED,
  "news1",
  "news2",
  "news3",
  "vocab",
  "shadow",
  "msa",
];

export function taskSplit(mode: DayMode): { required: TaskId[]; bonus: TaskId[] } {
  if (mode === "s") {
    return { required: RECOVERY_REQUIRED, bonus: ["shadow", "msa", "game"] };
  }
  if (mode === "n") {
    return { required: NORMAL_REQUIRED, bonus: ["game"] };
  }
  return { required: [...NORMAL_REQUIRED, "game", "mock"], bonus: [] };
}

export function orderedTasks(mode: DayMode) {
  const { required, bonus } = taskSplit(mode);
  const inMode = new Set([...required, ...bonus]);
  return FLOW.filter((id) => inMode.has(id)).map((id) => ({
    id,
    optional: bonus.includes(id),
  }));
}

export const MODES: { id: DayMode; name: string; time: string; line: string }[] = [
  {
    id: "s",
    name: "Recovery",
    time: "50–60 min",
    line: "Four things: yesterday’s words, 3 lessons, tongue twisters, 30 minutes on Discord.",
  },
  {
    id: "n",
    name: "Normal",
    time: "1–2 h",
    line: "Add the articles, your sentences, a short shadow, and My Story Animated in blocks.",
  },
  {
    id: "o",
    name: "Day off",
    time: "3–4 h",
    line: "Full hour of My Story Animated, a customer-call drill, then Discord.",
  },
];

export function modeMeta(mode: DayMode) {
  return MODES.find((m) => m.id === mode) ?? MODES[1];
}

export type TaskCopy = {
  title: string;
  detail: string;
  links: { href: string; label: string }[];
};

export function taskCopy(id: TaskId, mode: DayMode, teNext: number): TaskCopy {
  const batch = lessonsFrom(teNext);
  const range =
    batch.length === 0
      ? ""
      : batch.length === 1
        ? `Lesson ${batch[0].n}`
        : `Lessons ${batch[0].n}–${batch[batch.length - 1].n}`;

  switch (id) {
    case "review":
      return {
        title: "Morning: review yesterday’s words",
        detail: "Say the word and your own sentence out loud. Do not reread in silence.",
        links: [],
      };
    case "te":
      if (batch.length === 0) {
        return {
          title: "TalkEnglish: 3 Regular English lessons",
          detail: `Speaking Basics is finished (${LESSON_COUNT}/${LESSON_COUNT}). Same rule: listen to each sentence, repeat it, then say it without looking.`,
          links: [
            {
              href: "https://www.talkenglish.com/speaking/listregular.aspx",
              label: "Open Regular English",
            },
          ],
        };
      }
      return {
        title: `TalkEnglish: 3 lessons in order — ${range}`,
        detail:
          "Open each lesson here in the studio, or on TalkEnglish. Listen, repeat, then say it without looking. Do not only read.",
        links: batch.map((lesson) => ({
          href: `https://www.talkenglish.com/lessondetails.aspx?ALID=${lesson.alid}`,
          label: `${lesson.n}. ${lesson.title}`,
        })),
      };
    case "tw":
      return {
        title: "Tongue twisters on the way",
        detail:
          "engVid 1, 2, 3, 21 and 22, plus your two starters. Hear it, copy it slowly, then at normal speed. Clean sound before fast speed.",
        links: [
          {
            href: "https://www.engvid.com/english-resource/50-tongue-twisters-improve-pronunciation/",
            label: "engVid list",
          },
        ],
      };
    case "news1":
    case "news2":
    case "news3": {
      const n = id === "news1" ? 1 : id === "news2" ? 2 : 3;
      return {
        title: `News in Levels, Level 2 — article ${n}`,
        detail:
          n === 1
            ? "Open today's article on this page, or on News in Levels. Read it aloud. Record your voice."
            : n === 2
              ? "Read aloud and record. Do not chase every unknown word."
              : "Read aloud and record. Keep useful phrases, not single words.",
        links:
          n === 1
            ? [{ href: "https://www.newsinlevels.com/level/level-2/", label: "Level 2" }]
            : [],
      };
    }
    case "vocab":
      return {
        title: "Write a sentence for each phrase you keep",
        detail: "One natural sentence, in the Words tab. Yours, not a copied example.",
        links: [],
      };
    case "msa":
      return {
        title:
          mode === "o"
            ? "My Story Animated — full 60 minutes"
            : "My Story Animated — listening block",
        detail:
          mode === "o"
            ? "One full hour. English only. Pause and imitate how they speak. No Arabic subtitles."
            : mode === "s"
              ? "Optional. One short story if you still have energy. Imitate a few lines."
              : "Target 60 minutes, split into 20–30 minute blocks around the shift. Imitate short lines. No Arabic subtitles.",
        links: [
          {
            href: "https://www.youtube.com/results?search_query=my+story+animated",
            label: "Open My Story Animated",
          },
        ],
      };
    case "shadow":
      return {
        title: "5-minute shadow",
        detail:
          "Friends, English-dubbed anime, American animation, or your clip. Copy rhythm and pauses. Do not translate.",
        links: [
          { href: "https://youtu.be/vHBrMxIEEwY", label: "Your clip" },
          {
            href: "https://www.youtube.com/playlist?list=PLp22-4PivYmIiXGqtQMrfE_tzmqE6r7Tc",
            label: "Playlist",
          },
        ],
      };
    case "game":
      return {
        title: "Game or show, English only",
        detail:
          "Arabic subtitles stay off. Meaning comes from the scene, the words, and what people do. Tick this only if you actually kept the rule.",
        links: [],
      };
    case "discord":
      return {
        title: "Discord — at least 30 minutes, last",
        detail:
          "Talk with foreigners. No script. This is the daily speaking check. Scrolling the server does not count.",
        links: [],
      };
    case "mock":
      return {
        title: "Customer-call drill — 3 to 10 minutes",
        detail:
          "Record it, or run the same call in Talk. Greeting, question, explanation, empathy, close. Then listen back for th, speed, and long pauses.",
        links: [],
      };
  }
}

export const RANKS: { xp: number; name: string }[] = [
  { xp: 0, name: "Rookie" },
  { xp: 250, name: "Explorer" },
  { xp: 700, name: "Speaker" },
  { xp: 1600, name: "Storyteller" },
  { xp: 3200, name: "Job Ready" },
];

export function rankFor(xp: number) {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (xp >= rank.xp) index = i;
  });
  const current = RANKS[index];
  const next = RANKS[index + 1];
  const span = next ? next.xp - current.xp : 1;
  const into = next ? xp - current.xp : 1;
  const pct = next ? Math.max(0, Math.min(100, (into / span) * 100)) : 100;
  return { current, next, pct };
}

export const LEVELS: { name: string; body: string; test: string }[] = [
  {
    name: "Foundation",
    body: "Get the speaking reflex back. TalkEnglish every day, sound work, reading aloud, a short shadow, and a real conversation.",
    test: "Record 2 minutes of unscripted speech. th and s/z are clear enough to understand.",
  },
  {
    name: "Rebuild",
    body: "Turn recognition back into automatic speech. Keep the 3-lesson routine. Shadow more. Talk to people, not only to a screen.",
    test: "Hold a 15-minute Discord conversation without switching to Arabic.",
  },
  {
    name: "Job Ready",
    body: "Call-centre English: faster listening, simple customer phrases, empathy, questions, explanations, and a clean close.",
    test: "Record a 10-minute customer call. Listen back for pauses, pronunciation, and clarity.",
  },
];

export const CHECKS = [
  "I can say think and this with the right tongue position and voice.",
  "I can speak for 2 minutes without stopping or switching to Arabic.",
  "I can follow an English show or animation without Arabic subtitles most of the time.",
  "I can hold a 15-minute conversation with a stranger in English.",
  "I can handle a customer call in English.",
];

export type Twister = { id: string; label: string; why: string; lines: string[] };

export const DAILY_TWISTERS: Twister[] = [
  {
    id: "1",
    label: "1 — Peter Piper",
    why: "P sound and rhythm. Daily set.",
    lines: [
      "Peter Piper picked a peck of pickled peppers.",
      "A peck of pickled peppers Peter Piper picked.",
      "If Peter Piper picked a peck of pickled peppers,",
      "Where's the peck of pickled peppers Peter Piper picked?",
    ],
  },
  {
    id: "2",
    label: "2 — Betty Botter",
    why: "B and the short vowels. Daily set.",
    lines: [
      "Betty Botter bought some butter",
      "But she said the butter’s bitter",
      "If I put it in my batter, it will make my batter bitter",
      "But a bit of better butter will make my batter better",
      "So ’twas better Betty Botter bought a bit of better butter",
    ],
  },
  {
    id: "3",
    label: "3 — Woodchuck",
    why: "W and speed, only after it is clean. Daily set.",
    lines: [
      "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
      "He would chuck, he would, as much as he could, and chuck as much wood",
      "As a woodchuck would if a woodchuck could chuck wood",
    ],
  },
  {
    id: "21",
    label: "21 — TH drill",
    why: "Tongue tip between the teeth. Your th practice.",
    lines: ["Tom threw Tim three thumbtacks."],
  },
  {
    id: "22",
    label: "22 — TH / F",
    why: "th versus f. Do not let threw become free.",
    lines: ["He threw three free throws."],
  },
];

export const STARTER_TWISTERS: Twister[] = [
  {
    id: "coffee",
    label: "Your starter — copper coffee pot",
    why: "P, and the rhythm of a longer line.",
    lines: [
      "All I want is a proper cup of coffee.",
      "Made in a proper copper coffee pot.",
      "You can believe it or not.",
      "But I want a cup of coffee from a proper copper pot.",
    ],
  },
  {
    id: "thinkers",
    label: "Your starter — thousand thinkers",
    why: "th at the start of a crowded line.",
    lines: [
      "There those thousand thinkers were thinking how did the other three thieves go through.",
    ],
  },
];

export const ALL_TWISTERS = [...DAILY_TWISTERS, ...STARTER_TWISTERS];

export const SOUNDS: { title: string; how: string; words: string[] }[] = [
  {
    title: "th — no voice",
    how: "Tongue tip between the teeth. Air only. No buzz in the throat. think, not sink.",
    words: ["think", "thing", "three", "thank"],
  },
  {
    title: "th — with voice",
    how: "Same tongue. Add a buzz in the throat. this, not dis. Touch your throat: it should vibrate.",
    words: ["this", "that", "those", "the"],
  },
  {
    title: "s versus z",
    how: "Same mouth shape. z adds the buzz. sip / zip. price / prize.",
    words: ["sip", "zip", "sue", "zoo", "price", "prize"],
  },
  {
    title: "b versus p",
    how: "Lips closed. b is voiced and softer. p is a puff of air.",
    words: ["big", "pig", "back", "pack", "bear", "pear"],
  },
];

export const RESOURCES: { title: string; detail: string; href: string }[] = [
  {
    title: "TalkEnglish — Speaking Basics",
    detail: "89 lessons on the site. Your rule: 3 a day, in order.",
    href: "https://www.talkenglish.com/speaking/listbasics.aspx",
  },
  {
    title: "TalkEnglish — Basics I",
    detail: "Lessons 1–29. Common sentences, from I’m.",
    href: "https://www.talkenglish.com/speaking/basics/speaking_basics_i.aspx",
  },
  {
    title: "TalkEnglish — Basics II",
    detail: "Lessons 30–59.",
    href: "https://www.talkenglish.com/speaking/basics/speaking_basics_ii.aspx",
  },
  {
    title: "TalkEnglish — Basics III",
    detail: "Lessons 60–89.",
    href: "https://www.talkenglish.com/speaking/basics/speaking_basics_iii.aspx",
  },
  {
    title: "TalkEnglish — how to study a lesson",
    detail: "Listen, repeat, then speak as Person A and Person B.",
    href: "https://www.talkenglish.com/instruction.aspx",
  },
  {
    title: "TalkEnglish — Listening",
    detail: "Extra listening. Not a replacement for the 3 speaking lessons.",
    href: "https://www.talkenglish.com/listening/listregular.aspx",
  },
  {
    title: "TalkEnglish — Regular English",
    detail: "Only after Speaking Basics feels automatic.",
    href: "https://www.talkenglish.com/speaking/listregular.aspx",
  },
  {
    title: "TalkEnglish — Pronunciation",
    detail: "Extra sound lessons when one sound keeps breaking.",
    href: "https://www.talkenglish.com/extralessons/pronunciation.aspx",
  },
  {
    title: "TalkEnglish — 5 Rules for Speaking Fluency",
    detail: "Read once. Then go back to speaking.",
    href: "https://www.talkenglish.com/extralessons/speakingrules.aspx",
  },
  {
    title: "TalkEnglish — offline download",
    detail: "For the commute when the signal drops.",
    href: "https://www.talkenglish.com/english-download.aspx",
  },
  {
    title: "engVid — 50 tongue twisters",
    detail: "Your numbers are 1, 2, 3, 21 and 22.",
    href: "https://www.engvid.com/english-resource/50-tongue-twisters-improve-pronunciation/",
  },
  {
    title: "engVid",
    detail: "Video lessons. Open one only when a real gap shows up.",
    href: "https://www.engvid.com/",
  },
  {
    title: "News in Levels — Level 2",
    detail: "Three articles. Computer open, phone recording.",
    href: "https://www.newsinlevels.com/level/level-2/",
  },
  {
    title: "My Story Animated",
    detail: "60 minutes of listening. Imitate. No Arabic subtitles.",
    href: "https://www.youtube.com/results?search_query=my+story+animated",
  },
  {
    title: "Your shadowing clip",
    detail: "The video you saved.",
    href: "https://youtu.be/vHBrMxIEEwY",
  },
  {
    title: "Your shadowing playlist",
    detail: "The playlist you saved.",
    href: "https://www.youtube.com/playlist?list=PLp22-4PivYmIiXGqtQMrfE_tzmqE6r7Tc",
  },
  {
    title: "TalkEnglish — Interview English",
    detail: "Later, when you actually start applying.",
    href: "https://www.talkenglish.com/speaking/listinterview.aspx",
  },
];

export const CALL_STEPS = [
  "Greet them and say your name.",
  "Ask what they need. Let them finish.",
  "Explain the situation in short sentences.",
  "Show you understand that they are upset.",
  "Give the next step, then close and thank them.",
];

export const CALL_SCENES: { title: string; setup: string; model: string[] }[] = [
  {
    title: "Late order",
    setup: "They are upset. The order is three days late. You cannot refund it. You can send a new one today.",
    model: [
      "Hello, thank you for calling. My name is Ahmed. How can I help you today?",
      "I'm sorry your order is late. Let me look at that for you.",
      "I can't give a refund, but I can send a new one today.",
      "Is there anything else I can help you with? Thank you for calling.",
    ],
  },
  {
    title: "Charged twice",
    setup: "They were charged twice. You can see the second charge. The refund takes three to five days.",
    model: [
      "Hello, thank you for calling. My name is Ahmed. How can I help you today?",
      "I'm sorry you were charged twice. I can see the second payment.",
      "The refund will show in three to five days. I can't send it today.",
      "Is there anything else I can help you with? Thank you for calling.",
    ],
  },
  {
    title: "Can't sign in",
    setup: "They can't sign in. The email is correct. You can send a reset link. You cannot read their password.",
    model: [
      "Hello, thank you for calling. My name is Ahmed. How can I help you today?",
      "I'm sorry you can't sign in. I'll send a reset link to your email.",
      "I can't see your password. The link lets you choose a new one.",
      "Is there anything else I can help you with? Thank you for calling.",
    ],
  },
];

export const DEFAULT_REWARDS = [
  "20 minutes of an English-only game",
  "30 minutes on Discord with foreigners",
  "One guilt-free evening off",
];

export type LessonBatch = Lesson[];
