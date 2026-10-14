export type Phrase = { id: string; line: string; when: string };
export type Deck = { id: string; title: string; blurb: string; phrases: Phrase[] };

export const DECKS: Deck[] = [
  {
    id: "calls",
    title: "On the phone",
    blurb: "The lines you actually need before the system, the policy, and the close.",
    phrases: [
      { id: "c1", line: "Thank you for calling. My name is Ahmed. How can I help you today?", when: "Open every call with your name." },
      { id: "c2", line: "I'm sorry that happened. Let me look at it with you.", when: "They are upset. Apology first, then the screen." },
      { id: "c3", line: "Can I have the order number, please?", when: "One question. Then wait." },
      { id: "c4", line: "Let me make sure I understood. You were charged twice, and the second charge is still there.", when: "Repeat their problem in one sentence." },
      { id: "c5", line: "I can't refund it today, but I can send a replacement.", when: "The limit, then the thing you can do." },
      { id: "c6", line: "The refund will show in three to five days.", when: "A time they can picture." },
      { id: "c7", line: "I'll stay on the line while you check your email.", when: "Don't vanish into a hold." },
      { id: "c8", line: "I'm going to transfer you to the team that can change the address.", when: "Say who, and why." },
      { id: "c9", line: "Is there anything else I can help you with?", when: "Ask before you close." },
      { id: "c10", line: "Thank you for your patience. Have a good day.", when: "Close. Then stop talking." },
    ],
  },
  {
    id: "travel",
    title: "Travel pocket",
    blurb: "Airport, hotel, street. Short lines. Same mouth you use at work.",
    phrases: [
      { id: "t1", line: "I'd like a window seat if you have one.", when: "At the desk. One request." },
      { id: "t2", line: "My bag didn't arrive. Here's my tag.", when: "Lost luggage. Fact, then the paper." },
      { id: "t3", line: "The booking is under Ahmed, for two nights.", when: "Hotel. Name and length." },
      { id: "t4", line: "I'd rather have a quiet room, if you have one.", when: "A preference, not a complaint." },
      { id: "t5", line: "What time is checkout, and is breakfast included?", when: "Two facts. Stop there." },
      { id: "t6", line: "Excuse me, how do I get to the station from here?", when: "Directions. Then listen." },
      { id: "t7", line: "Could you say that more slowly, please?", when: "Better than pretending you heard it." },
      { id: "t8", line: "Is this the right bus for the old city?", when: "Check before you sit down." },
      { id: "t9", line: "I'd like this, please. Can I pay by card?", when: "A shop. Point, then pay." },
      { id: "t10", line: "I need a pharmacy. Is there one nearby?", when: "Health. Direct, calm." },
    ],
  },
  {
    id: "room",
    title: "Break room",
    blurb: "Small talk that is not a speech. One line, then a question back.",
    phrases: [
      { id: "r1", line: "How was your shift?", when: "The easiest opener." },
      { id: "r2", line: "I'm on nights this week. What about you?", when: "A fact, then their turn." },
      { id: "r3", line: "The late bus didn't come, so I walked.", when: "A small story. One sentence." },
      { id: "r4", line: "I'm trying to speak more slowly on calls.", when: "Honest, not a confession." },
      { id: "r5", line: "Have you tried that place near the station?", when: "Food. Easy to continue." },
      { id: "r6", line: "I'm heading out. See you tomorrow.", when: "Leave cleanly." },
      { id: "r7", line: "Sorry, I missed that. What did you mean?", when: "On Discord or in the room." },
      { id: "r8", line: "That's funny. Say it again?", when: "You heard the joke and still want the words." },
    ],
  },
];

export type MailJob = {
  id: string;
  title: string;
  situation: string;
  model: string;
};

export const MAILS: MailJob[] = [
  {
    id: "swap",
    title: "Ask for a shift swap",
    situation: "You need Saturday morning off. You can take Sunday night. Write to a teammate, not a speech to the whole floor.",
    model:
      "Hi Sara,\n\nCould you take my Saturday morning shift? I can cover your Sunday night in return.\n\nIf that doesn't work, no problem. Tell me today so I can ask someone else.\n\nThanks,\nAhmed",
  },
  {
    id: "late",
    title: "You replied late",
    situation: "A customer emailed yesterday. You answer today. No long story about the shift.",
    model:
      "Hello,\n\nI'm sorry for the late reply. I checked your order, and the replacement left today.\n\nYou should see it in two days. Reply to this email if it doesn't arrive.\n\nThank you,\nAhmed",
  },
  {
    id: "lead",
    title: "Tell your lead the truth",
    situation: "A caller asked for a refund you cannot give. You followed the policy. You want the lead to know before the caller writes in.",
    model:
      "Hi,\n\nA caller asked for a refund on order 4419. I couldn't give it. I offered a replacement today, and they accepted.\n\nI'm writing so you have it if they contact you later.\n\nThanks,\nAhmed",
  },
  {
    id: "apply",
    title: "A short note with an application",
    situation: "Later, when you apply. Four lines. Job, one proof, one ask. Not your whole life.",
    model:
      "Hello,\n\nI'm applying for the English support role. I take customer calls now, and I practice spoken English every day.\n\nI can start on nights. May I send a short voice note?\n\nThank you,\nAhmed",
  },
];

export const MAIL_CHECKS = [
  "It starts with a name or Hello.",
  "The reason is in the first or second line.",
  "There is one clear next step.",
  "It ends. It does not keep explaining.",
];

export type Ask = { id: string; q: string; model: string };

export const ASKS: Ask[] = [
  {
    id: "self",
    q: "Tell me about yourself.",
    model:
      "I'm Ahmed. I work in a call centre, mostly nights. I help people with orders, payments, and sign-in problems. I'm building my English so I can do the same job in English, not only in Arabic.",
  },
  {
    id: "why",
    q: "Why do you want this job?",
    model:
      "I already do this work. I like the part where a person is upset and leaves calmer. I want to do that in English, on a team that trains people instead of only counting calls.",
  },
  {
    id: "hard",
    q: "Tell me about a difficult customer.",
    model:
      "A caller was charged twice and was angry. I let them finish. I said I was sorry, I named the second charge, and I told them the refund takes three to five days. I didn't promise a same-day refund I couldn't send.",
  },
  {
    id: "strength",
    q: "What is your strength?",
    model:
      "I stay calm when someone is loud. I ask one question, I repeat what I heard, and I give one next step. People don't need a speech. They need to know what happens next.",
  },
  {
    id: "weak",
    q: "What is a weakness?",
    model:
      "I used to speak too fast when I was nervous, and I used to go quiet when I missed a word. Now I slow down, and I ask the person to say it again. I'm still working on the th sound.",
  },
  {
    id: "english",
    q: "How is your English?",
    model:
      "I can handle a simple call if I keep the sentences short. I understand more than I used to, especially when I can ask someone to slow down. I practice every day: lessons, reading aloud, and real conversation.",
  },
  {
    id: "hours",
    q: "What hours can you work?",
    model:
      "I can work nights, and I can work rotating shifts. I already do that. Tell me the pattern and I'll plan my practice around it.",
  },
  {
    id: "you",
    q: "Do you have a question for us?",
    model:
      "What does a good first month look like on this team? I want to know which calls I should be able to handle alone, and which ones I should pass to someone else.",
  },
];

export const MINUTE_TOPICS = [
  "Describe your last shift in four or five sentences.",
  "A place you want to see, and why. Stay in the present or the future.",
  "A problem you solved for someone. What was wrong, and what did you do?",
  "Your trip to work. Bus, walk, what you noticed.",
  "A meal you like. Where, who with, and why.",
  "Why you are learning English. No speech. Just the real reason.",
  "A person you helped this week. What did they need?",
  "What you will do on your next day off, hour by hour.",
];

export type Slip = {
  id: string;
  wrong: string;
  options: [string, string, string];
  answer: 0 | 1 | 2;
  why: string;
};

export const SLIPS: Slip[] = [
  {
    id: "agree",
    wrong: "I am agree with you.",
    options: ["I agree with you.", "I am agreeing to you.", "I have agree."],
    answer: 0,
    why: "Agree is a verb. You don't put am in front of it.",
  },
  {
    id: "since",
    wrong: "I am working here since two years.",
    options: ["I work here since two years.", "I have worked here for two years.", "I am work here for two years."],
    answer: 1,
    why: "For a length of time that started in the past and is still true: have + past form, and for.",
  },
  {
    id: "explain",
    wrong: "Please explain me the problem.",
    options: ["Please explain me.", "Please explain the problem to me.", "Please explain to problem."],
    answer: 1,
    why: "Explain something to someone. Not explain me.",
  },
  {
    id: "dont",
    wrong: "The system don't see the payment.",
    options: ["The system doesn't see the payment.", "The system not see the payment.", "The system isn't see the payment."],
    answer: 0,
    why: "He, she, and it take doesn't.",
  },
  {
    id: "age",
    wrong: "I have 25 years.",
    options: ["I am 25.", "I have 25.", "I am having 25 years."],
    answer: 0,
    why: "Age is I am, not I have.",
  },
  {
    id: "days",
    wrong: "The order is late since three days.",
    options: ["The order is late for three days.", "The order is late since three days.", "The order late three days."],
    answer: 0,
    why: "For a length of time. Since needs a starting point, like Monday.",
  },
  {
    id: "suggest",
    wrong: "I suggest you to wait.",
    options: ["I suggest you waiting.", "I suggest you wait.", "I suggest you for wait."],
    answer: 1,
    why: "Suggest someone do something. No to.",
  },
  {
    id: "depend",
    wrong: "It depends of the policy.",
    options: ["It depends from the policy.", "It depends of the policy.", "It depends on the policy."],
    answer: 2,
    why: "Depends on. Not of, not from.",
  },
  {
    id: "listen",
    wrong: "I am hearing you.",
    options: ["I hear you.", "I am listening.", "I listen you."],
    answer: 1,
    why: "On a call, I'm listening means you are paying attention right now.",
  },
  {
    id: "return",
    wrong: "I will return you the money today.",
    options: ["I will return you today.", "I will return the money to you today.", "I return you the money."],
    answer: 1,
    why: "Return something to someone. Or simply: I'll refund you today.",
  },
];
