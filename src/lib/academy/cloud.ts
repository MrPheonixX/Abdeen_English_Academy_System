import { adoptCloudUser, profileKey, signOut } from "./accounts";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./cloud-config";

/** Online accounts and automatic progress sync through Supabase (plain fetch, no SDK). */
export const cloudEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const CLOUD_KEY = "abdeen-cloud";

interface CloudSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string; email: string };
}
export type AuthResult = { ok: true } | { ok: false; error: string };

function readSession(): CloudSession | null {
  try {
    return JSON.parse(localStorage.getItem(CLOUD_KEY) ?? "null");
  } catch {
    return null;
  }
}
export const cloudLoggedIn = () => cloudEnabled && readSession() !== null;

function emit(status: "syncing" | "ok" | "error") {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("academy-cloud", { detail: { status } }));
}

async function auth(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error_description || json.msg || json.message || "Request failed");
  return json;
}

function keep(json: any): CloudSession {
  const session: CloudSession = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_at ?? Math.floor(Date.now() / 1000) + (json.expires_in ?? 3600),
    user: { id: json.user.id, email: json.user.email },
  };
  localStorage.setItem(CLOUD_KEY, JSON.stringify(session));
  adoptCloudUser(session.user.id, session.user.email.split("@")[0]);
  return session;
}

export async function cloudSignUp(email: string, password: string): Promise<AuthResult> {
  try {
    const json = await auth("signup", { email: email.trim(), password });
    if (!json.access_token) return { ok: false, error: "Check your email to confirm the account, then log in." };
    keep(json);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not sign up." };
  }
}

export async function cloudSignIn(email: string, password: string): Promise<AuthResult> {
  try {
    keep(await auth("token?grant_type=password", { email: email.trim(), password }));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not log in." };
  }
}

async function token() {
  let session = readSession();
  if (!session) throw new Error("Not logged in");
  if (session.expires_at - 60 < Date.now() / 1000) {
    session = keep(await auth("token?grant_type=refresh_token", { refresh_token: session.refresh_token }));
  }
  return session;
}

async function rest(path: string, init: RequestInit) {
  const session = await token();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Sync failed (${res.status})`);
  return { res, session };
}

/** Remember when the local copy last changed, so the newer copy wins. */
export function markChanged(key: string) {
  try {
    localStorage.setItem(`${key}:at`, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

async function pushNow(text: string) {
  const at = localStorage.getItem(`${profileKey()}:at`) ?? new Date().toISOString();
  const { session } = await token().then((s) => ({ session: s }));
  await rest("academy_progress?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ user_id: session.user.id, data: JSON.parse(text), updated_at: at }),
  });
}

let pushTimer = 0;
export function queueCloudPush(text: string) {
  if (!cloudLoggedIn()) return;
  window.clearTimeout(pushTimer);
  emit("syncing");
  pushTimer = window.setTimeout(() => {
    pushNow(text).then(() => emit("ok"), () => emit("error"));
  }, 2500);
}

/** Compare this device with the online copy. Returns "pulled" when newer online data was saved here. */
export async function cloudSync(): Promise<"pulled" | "pushed" | "none" | "error"> {
  if (!cloudLoggedIn()) return "none";
  try {
    emit("syncing");
    const { res } = await rest("academy_progress?select=data,updated_at&limit=1", { method: "GET" });
    const rows = (await res.json()) as { data: unknown; updated_at: string }[];
    const remote = rows[0];
    const key = profileKey();
    const localText = localStorage.getItem(key);
    const localAt = Date.parse(localStorage.getItem(`${key}:at`) ?? "") || 0;
    if (remote && (Date.parse(remote.updated_at) || 0) > localAt) {
      localStorage.setItem(key, JSON.stringify(remote.data));
      localStorage.setItem(`${key}:at`, remote.updated_at);
      emit("ok");
      return "pulled";
    }
    if (localText) {
      await pushNow(localText);
      emit("ok");
      return "pushed";
    }
    emit("ok");
    return "none";
  } catch {
    emit("error");
    return "error";
  }
}

export function signOutAll() {
  try {
    localStorage.removeItem(CLOUD_KEY);
  } catch {
    /* ignore */
  }
  signOut();
}

// ---- Recordings in Supabase Storage (private bucket, one folder per user) ----
const BUCKET = "recordings";

async function clipRequest(method: string, id: string, extra: RequestInit = {}, authenticated = false) {
  const session = await token();
  const route = authenticated ? "object/authenticated" : "object";
  return fetch(`${SUPABASE_URL}/storage/v1/${route}/${BUCKET}/${session.user.id}/${id}`, {
    method,
    ...extra,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      ...(extra.headers ?? {}),
    },
  });
}

export async function uploadClip(id: string, blob: Blob): Promise<boolean> {
  if (!cloudLoggedIn()) return false;
  try {
    const res = await clipRequest("POST", id, {
      headers: { "Content-Type": blob.type || "audio/webm", "x-upsert": "true" },
      body: blob,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function downloadClip(id: string): Promise<Blob | null> {
  if (!cloudLoggedIn()) return null;
  try {
    const res = await clipRequest("GET", id, {}, true);
    return res.ok ? await res.blob() : null;
  } catch {
    return null;
  }
}

export async function removeCloudClip(id: string) {
  if (!cloudLoggedIn()) return;
  try {
    await clipRequest("DELETE", id);
  } catch {
    /* ignore */
  }
}
