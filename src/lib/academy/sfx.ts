const SOUND_KEY = "abdeen-sound";
let ctx: AudioContext | null = null;

export function soundOn() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}
export function setSound(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}

function tone(freq: number, at: number, length: number, volume: number, type: OscillatorType = "sine") {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + at;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

export type Sfx = "tap" | "done" | "undo" | "start" | "stop" | "win";

/** Short synthesized sounds. No audio files, so nothing extra to load. */
export function playSfx(kind: Sfx) {
  if (typeof window === "undefined" || !soundOn()) return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    ctx = ctx ?? new Ctx();
    if (ctx.state === "suspended") void ctx.resume();
    if (kind === "tap") tone(520, 0, 0.06, 0.04);
    if (kind === "done") {
      tone(660, 0, 0.12, 0.07);
      tone(880, 0.09, 0.18, 0.07);
    }
    if (kind === "undo") tone(380, 0, 0.12, 0.05);
    if (kind === "start") {
      tone(600, 0, 0.1, 0.07);
      tone(800, 0.1, 0.14, 0.07);
    }
    if (kind === "stop") {
      tone(800, 0, 0.1, 0.07);
      tone(560, 0.1, 0.16, 0.07);
    }
    if (kind === "win") [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 0.07, "triangle"));
  } catch {
    /* sound is optional */
  }
}
