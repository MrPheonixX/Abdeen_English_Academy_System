import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { continueAsGuest, hasAccounts, sessionState, signIn, signUp } from "@/lib/academy/accounts";
import { flushPendingClips, queueClips } from "@/lib/academy/audio";
import { cloudEnabled, cloudLoggedIn, cloudSignIn, cloudSignUp, cloudSync } from "@/lib/academy/cloud";
import { useAcademy } from "@/lib/academy/store";

const inputClass = "mt-1 min-h-11 w-full rounded-xl border border-line bg-paper px-3 text-base";

export function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSignedIn(sessionState().kind !== "none");
    setMode(cloudEnabled || hasAccounts() ? "in" : "up");
    setReady(true);
    // Ask the browser not to delete saved progress and recordings when space is low.
    void navigator.storage?.persist?.();
    if (cloudLoggedIn()) {
      void cloudSync().then((result) => {
        if (result === "pulled") useAcademy.getState().hydrate();
        queueClips(useAcademy.getState().recordings.map((item) => item.id));
        void flushPendingClips();
      });
    }
  }, []);

  async function enter() {
    if (cloudLoggedIn()) await cloudSync();
    useAcademy.getState().hydrate();
    if (cloudLoggedIn()) {
      queueClips(useAcademy.getState().recordings.map((item) => item.id));
      void flushPendingClips();
    }
    setSignedIn(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const up = mode === "up";
    const result = cloudEnabled
      ? up
        ? await cloudSignUp(name, password)
        : await cloudSignIn(name, password)
      : up
        ? await signUp(name, password)
        : await signIn(name, password);
    if (result.ok) await enter();
    else setError(result.error);
    setBusy(false);
  }

  if (!ready) return null;
  if (signedIn) return <>{children}</>;

  return (
    <div className="mx-auto grid min-h-screen max-w-md place-items-center p-4">
      <div className="view-in w-full rounded-2xl border border-line bg-card p-6">
        <p className="text-sm font-semibold text-muted">Speaking practice for shift days</p>
        <h1 className="mt-1 text-3xl font-extrabold">English Academy</h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "up" ? "Create your account to keep your progress." : "Welcome back. Log in to continue."}
        </p>
        <form onSubmit={submit} className="mt-4">
          <label className="block text-sm font-semibold">
            {cloudEnabled ? "Email" : "Name"}
            <input
              className={inputClass}
              type={cloudEnabled ? "email" : "text"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete={cloudEnabled ? "email" : "username"}
            />
          </label>
          <label className="mt-3 block text-sm font-semibold">
            Password
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
            />
          </label>
          {error && <p className="mt-3 text-sm font-semibold text-warn">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-teal bg-teal px-3.5 text-sm font-semibold text-teal-ink disabled:opacity-50"
          >
            {busy ? "Please wait" : mode === "up" ? "Create account" : "Log in"}
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              setMode(mode === "up" ? "in" : "up");
              setError("");
            }}
          >
            {mode === "up" ? "I already have an account" : "Create a new account"}
          </button>
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              continueAsGuest();
              void enter();
            }}
          >
            Continue as guest
          </button>
        </div>
        <p className="mt-4 text-xs text-muted">
          {cloudEnabled
            ? "Your progress is saved on this device and online, so you can log in from another phone. Recordings stay on this device."
            : "Accounts are saved on this device only. There is no password reset. Download a backup in Notes to move your progress to another phone or browser."}
        </p>
      </div>
    </div>
  );
}

/** Small "Saved 14:05" note. It updates every time progress is written, and shows online status. */
export function SavedBadge() {
  const [state, setState] = useState<{ ok: boolean; at: string } | null>(null);
  const [online, setOnline] = useState<"syncing" | "ok" | "error" | null>(null);
  useEffect(() => {
    const onSave = (event: Event) => {
      const ok = (event as CustomEvent<{ ok: boolean }>).detail?.ok !== false;
      setState({ ok, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    };
    const onCloud = (event: Event) => setOnline((event as CustomEvent<{ status: "syncing" | "ok" | "error" }>).detail.status);
    window.addEventListener("academy-save", onSave);
    window.addEventListener("academy-cloud", onCloud);
    return () => {
      window.removeEventListener("academy-save", onSave);
      window.removeEventListener("academy-cloud", onCloud);
    };
  }, []);
  return (
    <>
      {state && (
        <span className={state.ok ? "text-ok" : "text-warn"}>
          {" · "}
          {state.ok ? `Saved ${state.at}` : "Could not save: storage is full or blocked"}
        </span>
      )}
      {online && (
        <span className={online === "error" ? "text-warn" : "text-ok"}>
          {" · "}
          {online === "syncing" ? "Syncing online" : online === "ok" ? "Online ✓" : "Online save failed, will retry"}
        </span>
      )}
    </>
  );
}
