import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { currentAccount, profileKey } from "@/lib/academy/accounts";
import { cloudLoggedIn, signOutAll } from "@/lib/academy/cloud";
import { setSound, soundOn } from "@/lib/academy/sfx";
import { useAcademy } from "@/lib/academy/store";
import { RecordingList } from "./record";

const row =
  "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm font-semibold hover:opacity-70";

export function AppMenu() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [sound, setSoundState] = useState(true);
  const [note, setNote] = useState("");
  const recordings = useAcademy((s) => s.recordings);
  const account = currentAccount();
  const online = cloudLoggedIn();

  useEffect(() => {
    setSoundState(soundOn());
  }, []);

  function backup() {
    const text = localStorage.getItem(profileKey());
    if (!text) {
      setNote("Nothing to back up yet.");
      return;
    }
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNote("Backup downloaded.");
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          setNote("");
        }}
        className="inline-flex min-h-11 items-center rounded-xl border border-line bg-card px-3 text-sm font-semibold"
      >
        Menu ☰
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="view-in absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-line bg-card p-2 shadow-xl">
            <p className="px-3 py-2 text-xs text-muted">
              {account
                ? `Signed in as ${account.name}${online ? " · online save on" : " · saved on this device"}`
                : "Guest · saved on this device only"}
            </p>
            <button
              type="button"
              className={row}
              onClick={() => {
                setPanel(true);
                setOpen(false);
              }}
            >
              My recordings <span className="text-muted">{recordings.length}</span>
            </button>
            <Link to="/dashboard" className={row} onClick={() => setOpen(false)}>
              Dashboard
            </Link>
            <button
              type="button"
              className={row}
              onClick={() => {
                setSound(!sound);
                setSoundState(!sound);
              }}
            >
              Sound <span className="text-muted">{sound ? "On" : "Off"}</span>
            </button>
            <button type="button" className={row} onClick={backup}>
              Download backup
            </button>
            {note && <p className="px-3 py-1 text-xs font-semibold">{note}</p>}
            <button
              type="button"
              className={`${row} text-warn`}
              onClick={() => {
                signOutAll();
                window.location.reload();
              }}
            >
              {account ? "Sign out" : "Log in"}
            </button>
          </div>
        </>
      )}
      {panel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setPanel(false)}>
          <div
            className="view-in max-h-[80vh] w-full max-w-lg overflow-auto rounded-2xl border border-line bg-card p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold">My recordings</h2>
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-xl border border-line px-3 text-sm font-semibold"
                onClick={() => setPanel(false)}
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-muted">
              {online
                ? "Saved on this device and online. You can play them after you log in on any phone."
                : "Saved on this device only. Log in with online save to keep a copy online."}
            </p>
            <RecordingList items={recordings} empty="No recordings yet. Press Record in a lesson." />
          </div>
        </div>
      )}
    </div>
  );
}
