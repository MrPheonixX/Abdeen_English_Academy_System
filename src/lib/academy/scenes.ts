export type Choice = {
  text: string;
  quality: "best" | "ok" | "weak";
  reply: string;
};

export type Beat = {
  npc: string;
  choices: [Choice, Choice, Choice];
};

export type Scene = {
  id: string;
  title: string;
  where: string;
  setup: string;
  beats: Beat[];
};

export const SCENES: Scene[] = [
  {
    id: "late-order",
    title: "Late order",
    where: "Customer call",
    setup: "The order is three days late. You cannot refund it. You can send a new one today.",
    beats: [
      {
        npc: "This is ridiculous. My order still isn't here.",
        choices: [
          { text: "Hello, thank you for calling. My name is Ahmed. I'm sorry your order is late. How can I help?", quality: "best", reply: "Finally. Someone is listening. It was supposed to be here on Monday." },
          { text: "What is your order number?", quality: "ok", reply: "You didn't even say hello. The number is 4419." },
          { text: "That is not my fault.", quality: "weak", reply: "Excuse me? I want a person who can actually help." },
        ],
      },
      {
        npc: "It was supposed to be here on Monday. Where is it?",
        choices: [
          { text: "Let me check that for you. Can I get the order number?", quality: "best", reply: "It's 4419. I already waited three days." },
          { text: "I don't know. The system is slow.", quality: "weak", reply: "So you don't know anything?" },
          { text: "Orders are sometimes late.", quality: "ok", reply: "That doesn't help me. Can you look it up?" },
        ],
      },
      {
        npc: "I want my money back. Today.",
        choices: [
          { text: "I'm sorry, I can't give a refund. I can send a new one today.", quality: "best", reply: "Fine. Send the new one. When will it arrive?" },
          { text: "Maybe. I have to ask someone.", quality: "ok", reply: "Then ask. I'll wait." },
          { text: "The policy says no, so no.", quality: "weak", reply: "Don't talk to me like that." },
        ],
      },
      {
        npc: "When will the new one arrive?",
        choices: [
          { text: "It leaves today. You should see it in two days. Is there anything else I can help you with?", quality: "best", reply: "No. Thank you for explaining it." },
          { text: "Soon, I think.", quality: "weak", reply: "Soon is not a day." },
          { text: "Two days. Bye.", quality: "ok", reply: "Okay. Bye." },
        ],
      },
    ],
  },
  {
    id: "double-charge",
    title: "Charged twice",
    where: "Customer call",
    setup: "You can see the second charge. The refund takes three to five days. You cannot send it today.",
    beats: [
      {
        npc: "You charged my card twice. I want that money now.",
        choices: [
          { text: "I'm sorry you were charged twice. Let me look at the payments.", quality: "best", reply: "Please do. I can see both charges in my bank." },
          { text: "Banks do that sometimes.", quality: "weak", reply: "That's not an answer." },
          { text: "What is your email?", quality: "ok", reply: "It's on the account. Can you just look?" },
        ],
      },
      {
        npc: "Can you see the second payment?",
        choices: [
          { text: "Yes. I can see it. The refund will show in three to five days.", quality: "best", reply: "Five days? I need it sooner." },
          { text: "I think so.", quality: "ok", reply: "You think so? Please be sure." },
          { text: "I can't see anything.", quality: "weak", reply: "Then why am I talking to you?" },
        ],
      },
      {
        npc: "I need it sooner. Rent is due.",
        choices: [
          { text: "I understand. I wish I could send it today. I can't. Three to five days is the bank's time.", quality: "best", reply: "Alright. At least you were straight with me." },
          { text: "That's not our problem.", quality: "weak", reply: "Wow. Okay." },
          { text: "Maybe it will be faster.", quality: "ok", reply: "Don't guess. Tell me the real time." },
        ],
      },
      {
        npc: "Will I get an email?",
        choices: [
          { text: "Yes. Please make sure the email on the account is right. Thank you for calling.", quality: "best", reply: "I will. Thanks." },
          { text: "Probably.", quality: "ok", reply: "I'll check later then." },
          { text: "I don't know.", quality: "weak", reply: "You should know that." },
        ],
      },
    ],
  },
  {
    id: "sign-in",
    title: "Can't sign in",
    where: "Customer call",
    setup: "The email is correct. You can send a reset link. You cannot read their password.",
    beats: [
      {
        npc: "I can't sign in. This app is broken.",
        choices: [
          { text: "I'm sorry you can't sign in. I'll help you reset it.", quality: "best", reply: "Okay. I already tried twice." },
          { text: "Did you forget your password?", quality: "ok", reply: "Maybe. Don't make me feel stupid." },
          { text: "It works for everyone else.", quality: "weak", reply: "So I'm the problem?" },
        ],
      },
      {
        npc: "I don't remember the password.",
        choices: [
          { text: "That's okay. I can't see your password. I'll send a reset link.", quality: "best", reply: "Send it. Which email?" },
          { text: "Tell me the password and I'll check.", quality: "weak", reply: "I'm not saying my password out loud." },
          { text: "Try again slowly.", quality: "ok", reply: "I already did that." },
        ],
      },
      {
        npc: "The email on the account is sam@mail.com.",
        choices: [
          { text: "Thank you. Please check that inbox, including spam. The link lets you choose a new one.", quality: "best", reply: "I see it. It says the link expires in an hour." },
          { text: "I'll change the email for you.", quality: "weak", reply: "I didn't ask you to change it." },
          { text: "Okay, done, goodbye.", quality: "ok", reply: "Wait, what do I do with the email?" },
        ],
      },
      {
        npc: "What if the link expires?",
        choices: [
          { text: "Call us again, or tap reset one more time. Is there anything else I can help you with?", quality: "best", reply: "No, that's clear. Thank you." },
          { text: "Then you're stuck.", quality: "weak", reply: "That's not helpful." },
          { text: "It won't.", quality: "ok", reply: "You can't promise that." },
        ],
      },
    ],
  },
  {
    id: "interview",
    title: "Job interview",
    where: "English desk",
    setup: "A short interview for an English-speaking support role. Keep answers to two sentences.",
    beats: [
      {
        npc: "Tell me about your current job.",
        choices: [
          { text: "I work in a call centre. I help customers with orders, payments, and sign-in problems.", quality: "best", reply: "What is hard about that job?" },
          { text: "I talk to people all day and it is very very very long and I do many things.", quality: "ok", reply: "Can you say that in a shorter way?" },
          { text: "It's a job. Normal.", quality: "weak", reply: "I need a real answer." },
        ],
      },
      {
        npc: "What is hard about speaking English at work?",
        choices: [
          { text: "Fast speech. I ask people to repeat, and I keep my sentences short.", quality: "best", reply: "How do you handle an angry customer?" },
          { text: "Everything is hard.", quality: "weak", reply: "That doesn't tell me how you work." },
          { text: "I study grammar at night.", quality: "ok", reply: "Grammar is useful. What do you do on the call?" },
        ],
      },
      {
        npc: "A customer is angry. What do you do first?",
        choices: [
          { text: "I let them finish. Then I say I'm sorry, and I give one next step.", quality: "best", reply: "Why do you want this role?" },
          { text: "I tell them to calm down.", quality: "weak", reply: "That usually makes it worse." },
          { text: "I transfer the call.", quality: "ok", reply: "Sometimes. What can you do yourself?" },
        ],
      },
      {
        npc: "Why do you want an English-speaking role?",
        choices: [
          { text: "I want to use English every day, and I'm not leaving my job until I can do it well.", quality: "best", reply: "That's a clear plan. Thank you." },
          { text: "Because English is important in the world.", quality: "ok", reply: "True, but tell me about you." },
          { text: "I need more money.", quality: "weak", reply: "Everyone does. What else?" },
        ],
      },
    ],
  },
  {
    id: "cover",
    title: "Cover my shift",
    where: "Coworker",
    setup: "You need a coworker to cover two hours. Be direct. Offer something back.",
    beats: [
      {
        npc: "Hey. You look stressed.",
        choices: [
          { text: "A bit. Can I ask you something about tonight's shift?", quality: "best", reply: "Sure. What's up?" },
          { text: "Nothing.", quality: "weak", reply: "Okay then." },
          { text: "The schedule is stupid.", quality: "ok", reply: "Yeah. What do you need?" },
        ],
      },
      {
        npc: "What's up?",
        choices: [
          { text: "I have to leave at eight. Can you cover two hours?", quality: "best", reply: "Maybe. What do I get?" },
          { text: "You should work for me.", quality: "weak", reply: "Don't tell me what I should do." },
          { text: "I'm busy. It's complicated.", quality: "ok", reply: "Say it in one sentence." },
        ],
      },
      {
        npc: "What do I get?",
        choices: [
          { text: "I'll take your Saturday morning. Is that fair?", quality: "best", reply: "Saturday morning is fine." },
          { text: "Nothing. Just help me.", quality: "weak", reply: "No thanks." },
          { text: "I'll owe you.", quality: "ok", reply: "Owe me what?" },
        ],
      },
      {
        npc: "Text me the times so I don't forget.",
        choices: [
          { text: "I will. Eight to ten tonight, and I take Saturday morning. Thank you.", quality: "best", reply: "Got it. See you." },
          { text: "You'll remember.", quality: "weak", reply: "Text me anyway." },
          { text: "Okay, later.", quality: "ok", reply: "Don't forget, seriously." },
        ],
      },
    ],
  },
  {
    id: "hotel",
    title: "Hotel check-in",
    where: "Travel",
    setup: "You are tired from a night bus. The booking is under your name. You want a quiet room.",
    beats: [
      {
        npc: "Good evening. Do you have a reservation?",
        choices: [
          { text: "Yes. It's under Ahmed. I booked a single room for two nights.", quality: "best", reply: "I see it. May I have your passport?" },
          { text: "Room.", quality: "weak", reply: "Sorry, could you say that again?" },
          { text: "I think so. Maybe.", quality: "ok", reply: "What name is it under?" },
        ],
      },
      {
        npc: "May I have your passport?",
        choices: [
          { text: "Of course. Here it is. What time is checkout?", quality: "best", reply: "Checkout is at eleven. The lift is on the left." },
          { text: "Why do you need that?", quality: "ok", reply: "It's just for the booking. It's standard." },
          { text: "I don't have it.", quality: "weak", reply: "Then I can't check you in." },
        ],
      },
      {
        npc: "Your room is on the street side. Is that alright?",
        choices: [
          { text: "I'd rather have a quiet room, if you have one.", quality: "best", reply: "I can move you to the back. Same price." },
          { text: "Whatever.", quality: "ok", reply: "I'll leave it as it is, then." },
          { text: "This hotel is too loud.", quality: "weak", reply: "I'm sorry. Do you want a different room or not?" },
        ],
      },
      {
        npc: "Breakfast is from seven to ten. Do you need anything else?",
        choices: [
          { text: "What time is breakfast, and is the wifi in the room? Thank you.", quality: "best", reply: "Seven to ten, and yes, the wifi is in the room. Enjoy your stay." },
          { text: "No.", quality: "ok", reply: "Alright. Enjoy your stay." },
          { text: "I need many things. The bus was bad and I'm angry.", quality: "weak", reply: "I'm sorry the trip was hard. The room is ready when you are." },
        ],
      },
    ],
  },
];

export function sceneById(id: string) {
  return SCENES.find((scene) => scene.id === id) ?? null;
}
