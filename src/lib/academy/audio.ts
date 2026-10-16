import { cloudLoggedIn, downloadClip, removeCloudClip, uploadClip } from "./cloud";

const DB_NAME = "eng-academy-audio";
const STORE = "clips";
const PENDING_KEY = "abdeen-pending-clips";
const UPLOADED_KEY = "abdeen-uploaded-clips";

function readList(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}
function writeList(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify([...new Set(ids)]));
  } catch {
    /* ignore */
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Could not open recordings"));
  });
}

function transactionDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Recording save failed"));
    tx.onabort = () => reject(tx.error ?? new Error("Recording save aborted"));
  });
}

async function putLocal(id: string, blob: Blob) {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    await transactionDone(tx);
  } finally {
    db.close();
  }
}

async function getLocal(id: string): Promise<Blob | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
      req.onerror = () => reject(req.error ?? new Error("Could not load recording"));
    });
    await transactionDone(tx);
    return blob;
  } finally {
    db.close();
  }
}

async function upload(id: string, blob: Blob) {
  if (!cloudLoggedIn()) return;
  if (await uploadClip(id, blob)) {
    writeList(UPLOADED_KEY, [...readList(UPLOADED_KEY), id]);
    writeList(PENDING_KEY, readList(PENDING_KEY).filter((x) => x !== id));
  } else {
    writeList(PENDING_KEY, [...readList(PENDING_KEY), id]);
  }
}

/** Saves on this device first, then copies the audio online when logged in. */
export async function saveClip(id: string, blob: Blob) {
  await putLocal(id, blob);
  void upload(id, blob);
}

/** Loads from this device. If it is missing here, fetches the online copy and keeps it. */
export async function loadClip(id: string): Promise<Blob | null> {
  const local = await getLocal(id).catch(() => null);
  if (local) return local;
  const remote = await downloadClip(id);
  if (remote) await putLocal(id, remote).catch(() => undefined);
  return remote;
}

export async function deleteClip(id: string) {
  writeList(PENDING_KEY, readList(PENDING_KEY).filter((x) => x !== id));
  writeList(UPLOADED_KEY, readList(UPLOADED_KEY).filter((x) => x !== id));
  void removeCloudClip(id);
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    await transactionDone(tx);
  } finally {
    db.close();
  }
}

/** Marks recordings that were never uploaded, so they are copied online soon. */
export function queueClips(ids: string[]) {
  const done = new Set(readList(UPLOADED_KEY));
  writeList(PENDING_KEY, [...readList(PENDING_KEY), ...ids.filter((id) => !done.has(id))]);
}

export async function flushPendingClips() {
  if (!cloudLoggedIn()) return;
  for (const id of readList(PENDING_KEY)) {
    const blob = await getLocal(id).catch(() => null);
    if (!blob) {
      writeList(PENDING_KEY, readList(PENDING_KEY).filter((x) => x !== id));
      continue;
    }
    await upload(id, blob);
  }
}
