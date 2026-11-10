// Armazenamento local do navegador (IndexedDB): projetos, ficheiros de média e histórico.
// Tudo fica neste navegador; se o armazenamento estiver bloqueado, a app continua a funcionar em memória.
const DB = 'corte-studio';
const STORES = ['files', 'projects', 'history', 'kv'] as const;
type Store = (typeof STORES)[number];

let dbp: Promise<IDBDatabase | null> | null = null;
function open(): Promise<IDBDatabase | null> {
  if (!dbp) {
    dbp = new Promise((res) => {
      try {
        const r = indexedDB.open(DB, 1);
        r.onupgradeneeded = () => { for (const s of STORES) if (!r.result.objectStoreNames.contains(s)) r.result.createObjectStore(s); };
        r.onsuccess = () => res(r.result);
        r.onerror = () => res(null);
      } catch { res(null); }
    });
  }
  return dbp;
}

const memory = new Map<string, unknown>();

export async function put(store: Store, key: string, value: unknown): Promise<void> {
  memory.set(`${store}:${key}`, value);
  const db = await open();
  if (!db) return;
  await new Promise<void>((res) => {
    try {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(value, key);
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    } catch { res(); }
  });
}

export async function get<T>(store: Store, key: string): Promise<T | undefined> {
  const m = memory.get(`${store}:${key}`);
  if (m !== undefined) return m as T;
  const db = await open();
  if (!db) return undefined;
  return new Promise((res) => {
    try {
      const r = db.transaction(store).objectStore(store).get(key);
      r.onsuccess = () => res(r.result as T);
      r.onerror = () => res(undefined);
    } catch { res(undefined); }
  });
}

export async function del(store: Store, key: string): Promise<void> {
  memory.delete(`${store}:${key}`);
  const db = await open();
  if (!db) return;
  await new Promise<void>((res) => {
    try {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(key);
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    } catch { res(); }
  });
}

export async function keys(store: Store): Promise<string[]> {
  const db = await open();
  const mem = Array.from(memory.keys()).filter((k) => k.startsWith(store + ':')).map((k) => k.slice(store.length + 1));
  if (!db) return mem;
  const stored: string[] = await new Promise((res) => {
    try {
      const r = db.transaction(store).objectStore(store).getAllKeys();
      r.onsuccess = () => res((r.result as IDBValidKey[]).map(String));
      r.onerror = () => res([]);
    } catch { res([]); }
  });
  return Array.from(new Set([...stored, ...mem]));
}
