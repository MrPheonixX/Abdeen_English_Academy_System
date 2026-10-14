export type Badge = {
  id: string;
  title: string;
  detail: string;
  on: boolean;
};

export function badgeList(input: {
  xp: number;
  words: number;
  streak: number;
  studio: number;
  reads: number;
  scenes: number;
  bestTalk: number;
  recordings: number;
  lessons: number;
  lines?: number;
  mails?: number;
}): Badge[] {
  return [
    { id: "first-word", title: "First phrase", detail: "One phrase and a sentence of your own.", on: input.words >= 1 },
    { id: "ten-words", title: "Ten phrases", detail: "A pocket journal, not a word list.", on: input.words >= 10 },
    { id: "studio-3", title: "Three patterns", detail: "Practiced inside the page, out loud.", on: input.studio >= 3 },
    { id: "studio-20", title: "Twenty patterns", detail: "The reflex is starting to stick.", on: input.studio >= 20 },
    { id: "streak-7", title: "Seven-day streak", detail: "A full core, or an honest rest day.", on: input.streak >= 7 },
    { id: "read-1", title: "Read aloud", detail: "Finished a desk article and its questions.", on: input.reads >= 1 },
    { id: "talk-1", title: "Held a scene", detail: "Finished a conversation in the dojo.", on: input.scenes >= 1 },
    { id: "talk-clean", title: "Clean close", detail: "Scored 80 or better on a scene.", on: input.bestTalk >= 80 },
    { id: "mic", title: "On tape", detail: "One recording saved in this browser.", on: input.recordings >= 1 },
    { id: "basics", title: "Basics moving", detail: "Thirty TalkEnglish lessons checked off.", on: input.lessons >= 30 },
    { id: "xp", title: "Speaker rank", detail: "700 XP. Still the same daily size.", on: input.xp >= 700 },
    { id: "lines", title: "Lines in the mouth", detail: "Said ten booth lines out loud.", on: (input.lines ?? 0) >= 10 },
    { id: "mail", title: "A real email", detail: "Wrote one short mail with a next step.", on: (input.mails ?? 0) >= 1 },
  ];
}
