/**
 * Local accounts for the static GitHub Pages site. There is no server, so the
 * account and its progress live in this browser on this device only. The
 * password is stored as a salted PBKDF2 hash, never as plain text.
 */
const ACCOUNTS_KEY = "abdeen-accounts";
const SESSION_KEY = "abdeen-session";
export const GUEST_KEY = "eng-academy-v3";

export interface Account {
  id: string;
  name: string;
  salt: string;
  hash: string;
}
export type Session = { kind: "none" } | { kind: "guest" } | { kind: "account"; account: Account };
export type AuthResult = { ok: true } | { ok: false; error: string };

const hasStorage = () => typeof localStorage !== "undefined";

function readAccounts(): Account[] {
  if (!hasStorage()) return [];
  try {
    const raw = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as Account[]) : [];
  } catch {
    return [];
  }
}

function toHex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function fromHex(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function hashPassword(password: string, saltHex: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromHex(saltHex), iterations: 150000 },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

export function sessionState(): Session {
  if (!hasStorage()) return { kind: "none" };
  const id = localStorage.getItem(SESSION_KEY);
  if (id === "guest") return { kind: "guest" };
  const account = readAccounts().find((a) => a.id === id);
  return account ? { kind: "account", account } : { kind: "none" };
}
export function currentAccount(): Account | null {
  const s = sessionState();
  return s.kind === "account" ? s.account : null;
}
/** The localStorage key that holds the active profile's progress. */
export function profileKey() {
  const account = currentAccount();
  return account ? `${GUEST_KEY}:${account.id}` : GUEST_KEY;
}
export function hasAccounts() {
  return readAccounts().length > 0;
}

export async function signUp(rawName: string, password: string): Promise<AuthResult> {
  const name = rawName.trim();
  if (name.length < 2 || name.length > 24) return { ok: false, error: "Use a name of 2 to 24 characters." };
  if (password.length < 6) return { ok: false, error: "Use a password of at least 6 characters." };
  const list = readAccounts();
  if (list.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: "That name is already used on this device." };
  }
  try {
    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
    const id = toHex(crypto.getRandomValues(new Uint8Array(8)));
    const account: Account = { id, name, salt, hash: await hashPassword(password, salt) };
    if (list.length === 0) {
      // The first account keeps the progress that was already saved here.
      const old = localStorage.getItem(GUEST_KEY);
      if (old) localStorage.setItem(`${GUEST_KEY}:${id}`, old);
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...list, account]));
    localStorage.setItem(SESSION_KEY, id);
    return { ok: true };
  } catch {
    return { ok: false, error: "This browser cannot create accounts. Use the guest option." };
  }
}

export async function signIn(rawName: string, password: string): Promise<AuthResult> {
  const name = rawName.trim().toLowerCase();
  const account = readAccounts().find((a) => a.name.toLowerCase() === name);
  const wrong: AuthResult = { ok: false, error: "Wrong name or password." };
  if (!account) return wrong;
  try {
    const hash = await hashPassword(password, account.salt);
    let diff = hash.length ^ account.hash.length;
    for (let i = 0; i < hash.length; i += 1) diff |= hash.charCodeAt(i) ^ (account.hash.charCodeAt(i) || 0);
    if (diff !== 0) return wrong;
    localStorage.setItem(SESSION_KEY, account.id);
    return { ok: true };
  } catch {
    return { ok: false, error: "This browser cannot check passwords. Use the guest option." };
  }
}

export function continueAsGuest() {
  if (hasStorage()) localStorage.setItem(SESSION_KEY, "guest");
}
export function signOut() {
  if (hasStorage()) localStorage.removeItem(SESSION_KEY);
}

/** Make an online user the active local profile (progress key follows the user id). */
export function adoptCloudUser(id: string, name: string) {
  if (!hasStorage()) return;
  const list = readAccounts();
  if (!list.some((a) => a.id === id)) {
    if (list.length === 0) {
      const old = localStorage.getItem(GUEST_KEY);
      if (old) localStorage.setItem(`${GUEST_KEY}:${id}`, old);
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...list, { id, name, salt: "", hash: "" }]));
  }
  localStorage.setItem(SESSION_KEY, id);
}
