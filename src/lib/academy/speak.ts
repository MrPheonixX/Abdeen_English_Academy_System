let token = 0;
let keepAlive = 0;

function englishVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((v) => /en-US/i.test(v.lang) && /natural|google|samantha|aria|jenny/i.test(v.name)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en-us")) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
    null
  );
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function armKeepAlive() {
  window.clearInterval(keepAlive);
  keepAlive = window.setInterval(() => {
    if (!canSpeak()) return;
    const synth = window.speechSynthesis;
    if (!synth.speaking) {
      window.clearInterval(keepAlive);
      return;
    }
    if (synth.paused) synth.resume();
  }, 8000);
}

function loadVoices() {
  const synth = window.speechSynthesis;
  const existing = synth.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const finish = () => resolve(synth.getVoices());
    synth.addEventListener("voiceschanged", finish, { once: true });
    window.setTimeout(finish, 350);
  });
}

export function stopSpeak() {
  token += 1;
  window.clearInterval(keepAlive);
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
}

export function speak(text: string, rate = 0.82) {
  void speakLines([text], rate, 0);
}

export async function speakLines(lines: string[], rate = 0.82, gapMs = 220) {
  if (!canSpeak() || lines.length === 0) return false;
  const my = ++token;
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = await loadVoices();
  if (my !== token) return false;
  const voice = englishVoice(voices);
  let index = 0;
  const next = () => {
    if (my !== token || index >= lines.length) return;
    const utter = new SpeechSynthesisUtterance(lines[index]);
    index += 1;
    utter.lang = "en-US";
    utter.rate = rate;
    if (voice) utter.voice = voice;
    utter.onend = () => {
      if (index >= lines.length || my !== token) return;
      window.setTimeout(next, gapMs);
    };
    synth.speak(utter);
  };
  window.setTimeout(() => {
    if (my !== token) return;
    armKeepAlive();
    next();
  }, 60);
  return true;
}
