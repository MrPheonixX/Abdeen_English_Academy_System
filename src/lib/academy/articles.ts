export type Quiz = {
  q: string;
  options: [string, string, string];
  answer: 0 | 1 | 2;
};

export type Article = {
  id: string;
  title: string;
  minutes: number;
  paragraphs: string[];
  glossary: { w: string; d: string }[];
  questions: Quiz[];
};

export const ARTICLES: Article[] = [
  {
    id: "late-bus",
    title: "The late bus",
    minutes: 3,
    paragraphs: [
      "Ahmed finished his shift at six. The bus that usually comes at six-fifteen did not come. A small crowd waited under the sign. Someone said the road was closed because of an accident.",
      "He checked the app. The next bus was at six-fifty. He had two choices. He could wait, or he could walk twenty minutes to another stop. He decided to walk, because standing still made him more tired.",
      "On the way he repeated three lines from the morning lesson. He did not look at his phone. When the second bus arrived, he had a seat, and he had said each line slowly, then at a normal speed.",
    ],
    glossary: [
      { w: "shift", d: "the hours you work" },
      { w: "crowd", d: "a lot of people in one place" },
      { w: "accident", d: "a crash, something that went wrong on the road" },
    ],
    questions: [
      { q: "Why was the first bus late?", options: ["Ahmed missed it", "The road was closed", "He finished work early"], answer: 1 },
      { q: "What did he decide to do?", options: ["Call a taxi", "Walk to another stop", "Go back to work"], answer: 1 },
      { q: "What did he practice on the walk?", options: ["Three spoken lines", "A grammar list", "His order numbers"], answer: 0 },
    ],
  },
  {
    id: "quiet-shift",
    title: "A quiet shift",
    minutes: 3,
    paragraphs: [
      "Tuesday night was quiet. Most of the calls were short. One woman could not find an email. Ahmed asked her to check the spam folder. She found it, and she thanked him before he could read the closing line.",
      "Between calls he did not open a game. He wrote one sentence in his notebook: I was busy helping another customer. Then he said it once, without looking.",
      "At the end of the shift his supervisor said he sounded calmer. Ahmed did not make a speech about it. He nodded, and he kept the same plan for Wednesday.",
    ],
    glossary: [
      { w: "spam folder", d: "the place email hides junk, and sometimes real mail" },
      { w: "supervisor", d: "the person who manages your team" },
      { w: "nodded", d: "moved his head to say yes" },
    ],
    questions: [
      { q: "What was the customer's problem?", options: ["A late parcel", "A missing email", "A double charge"], answer: 1 },
      { q: "What did Ahmed do between calls?", options: ["He played a game", "He wrote and said one sentence", "He left early"], answer: 1 },
      { q: "What did the supervisor notice?", options: ["He sounded calmer", "He took fewer calls", "He spoke Arabic"], answer: 0 },
    ],
  },
  {
    id: "replacement",
    title: "The replacement parcel",
    minutes: 4,
    paragraphs: [
      "A customer called about a kettle that arrived cracked. She did not want a long story. She wanted a new one. Ahmed looked at the order and saw that a replacement was allowed.",
      "He said, I'm sorry the kettle arrived like that. I can send a new one today. I can't refund the delivery fee. The woman asked when it would arrive. He said two days, and he repeated the address to be sure.",
      "After the call he noticed one sound. He had said tree instead of three. He wrote three on a card and put it in his pocket for the bus.",
    ],
    glossary: [
      { w: "cracked", d: "broken with a line in it" },
      { w: "replacement", d: "a new item sent instead of the bad one" },
      { w: "fee", d: "money you pay for a service" },
    ],
    questions: [
      { q: "What was wrong with the kettle?", options: ["It was the wrong color", "It arrived cracked", "It was too small"], answer: 1 },
      { q: "What could Ahmed not do?", options: ["Send a new kettle", "Refund the delivery fee", "Check the address"], answer: 1 },
      { q: "Which sound did he want to fix?", options: ["th in three", "the p in pocket", "the k in kettle"], answer: 0 },
    ],
  },
  {
    id: "day-off",
    title: "A day off in the city",
    minutes: 4,
    paragraphs: [
      "His day off moved again. This week it was Thursday. He slept late, then he took the bus into the city with one rule: if someone spoke to him, he would answer in English.",
      "At a cafe the server asked what he wanted. He said, Can I get a coffee and a cheese sandwich? The server asked him to repeat the sandwich. He did, more slowly, and he did not switch languages.",
      "He sat by the window for twenty minutes. He did not study a list. He listened to the orders around him and copied two of them under his breath.",
    ],
    glossary: [
      { w: "server", d: "the person who takes your order" },
      { w: "under his breath", d: "very quietly, almost to himself" },
      { w: "switch", d: "change from one thing to another" },
    ],
    questions: [
      { q: "What was his rule for the day?", options: ["Speak only at work", "Answer people in English", "Avoid every shop"], answer: 1 },
      { q: "What did he order?", options: ["Tea and cake", "Coffee and a cheese sandwich", "Water only"], answer: 1 },
      { q: "How did he practice at the table?", options: ["He copied two orders quietly", "He opened a grammar book", "He called a friend"], answer: 0 },
    ],
  },
  {
    id: "headset",
    title: "The new headset",
    minutes: 3,
    paragraphs: [
      "The old headset cracked at the mic. People kept saying, sorry, can you repeat that? Ahmed thought it was his English. On Thursday the team got new headsets.",
      "The first call was a man who spoke quickly. Ahmed said, I'm having a hard time hearing you. Could you say that a little slower? The man laughed and slowed down. The new mic was clear. The request was clear too.",
      "He wrote the line on a sticky note and stuck it to the monitor. One good line, used on a real call, was worth more than a page of notes he never said.",
    ],
    glossary: [
      { w: "headset", d: "headphones with a microphone" },
      { w: "sticky note", d: "a small piece of paper that sticks" },
      { w: "monitor", d: "the computer screen" },
    ],
    questions: [
      { q: "Why did people ask him to repeat?", options: ["The old mic was cracked", "He refused to speak", "The calls were in Arabic"], answer: 0 },
      { q: "What did he ask the man to do?", options: ["Call back tomorrow", "Speak a little slower", "Send an email only"], answer: 1 },
      { q: "Where did he put the line?", options: ["In his pocket", "On the monitor", "In a book at home"], answer: 1 },
    ],
  },
  {
    id: "discord-night",
    title: "Thirty minutes, actually talking",
    minutes: 4,
    paragraphs: [
      "After the shift he opened Discord and almost scrolled. He had promised himself thirty minutes of real talk, last thing, not a highlight reel of other people's messages.",
      "He joined a voice channel where two people were talking about a game. He said, Hey, can I ask what you're playing? They told him. He did not understand every joke. He asked, Sorry, what did you mean by that? They explained, and the call kept going.",
      "At minute thirty-two he said he had to sleep. Nobody was impressed. That was not the point. He had stayed in English, and he had asked when he was lost instead of going quiet.",
    ],
    glossary: [
      { w: "scrolled", d: "moved through posts without talking" },
      { w: "channel", d: "a room inside a chat app" },
      { w: "lost", d: "not understanding" },
    ],
    questions: [
      { q: "What almost happened first?", options: ["He only scrolled", "He quit the job", "He wrote an essay"], answer: 0 },
      { q: "What did he do when he missed a joke?", options: ["He left the channel", "He asked what they meant", "He answered in Arabic"], answer: 1 },
      { q: "How long did he stay?", options: ["About ten minutes", "A little over thirty minutes", "All night"], answer: 1 },
    ],
  },
];

export function articlesForDay(day: string): Article[] {
  let hash = 0;
  for (const ch of day) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
  const start = hash % ARTICLES.length;
  return [0, 1, 2].map((offset) => ARTICLES[(start + offset) % ARTICLES.length]);
}
