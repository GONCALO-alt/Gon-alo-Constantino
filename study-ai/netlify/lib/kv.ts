// Armazenamento chave→valor da versão Netlify (Netlify Blobs), com uma versão em memória
// para os testes e para correr no computador.

export interface KV {
  getJSON<T>(key: string): Promise<{ data: T; etag: string } | null>;
  /** Grava JSON. Com `onlyIfMatch`/`onlyIfNew` só grava se ninguém mudou o valor; devolve se gravou. */
  setJSON(key: string, value: unknown, opts?: { onlyIfMatch?: string; onlyIfNew?: boolean }): Promise<boolean>;
  getBytes(key: string): Promise<Uint8Array | null>;
  setBytes(key: string, data: Uint8Array): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

/** Subconjunto do `Store` de @netlify/blobs usado aqui. */
interface BlobStore {
  getWithMetadata(key: string, opts: { type: 'json' }): Promise<{ data: any; etag?: string } | null>;
  setJSON(key: string, value: unknown, opts?: { onlyIfMatch?: string } | { onlyIfNew?: boolean }): Promise<{ modified: boolean }>;
  get(key: string, opts: { type: 'arrayBuffer' }): Promise<ArrayBuffer | null>;
  set(key: string, data: ArrayBuffer): Promise<unknown>;
  delete(key: string): Promise<void>;
  list(opts: { prefix: string }): Promise<{ blobs: { key: string }[] }>;
}

export function blobsKV(store: BlobStore): KV {
  return {
    async getJSON(key) {
      const r = await store.getWithMetadata(key, { type: 'json' });
      return r && r.data !== null ? { data: r.data, etag: r.etag ?? '' } : null;
    },
    async setJSON(key, value, opts) {
      const o = opts?.onlyIfMatch ? { onlyIfMatch: opts.onlyIfMatch } : opts?.onlyIfNew ? { onlyIfNew: true } : undefined;
      const r = await store.setJSON(key, value, o);
      return r?.modified !== false;
    },
    async getBytes(key) {
      const r = await store.get(key, { type: 'arrayBuffer' });
      return r ? new Uint8Array(r) : null;
    },
    async setBytes(key, data) {
      await store.set(key, data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer);
    },
    delete: (key) => store.delete(key),
    async list(prefix) {
      return (await store.list({ prefix })).blobs.map((b) => b.key);
    },
  };
}

/** Em memória (testes e desenvolvimento). As cópias evitam partilhar objetos entre pedidos. */
export function memoryKV(): KV & { dump(): Map<string, string | Uint8Array> } {
  const data = new Map<string, string | Uint8Array>();
  let counter = 0;
  const etags = new Map<string, string>();
  return {
    dump: () => data,
    async getJSON(key) {
      const v = data.get(key);
      return typeof v === 'string' ? { data: JSON.parse(v), etag: etags.get(key)! } : null;
    },
    async setJSON(key, value, opts) {
      if (opts?.onlyIfNew && data.has(key)) return false;
      if (opts?.onlyIfMatch && etags.get(key) !== opts.onlyIfMatch) return false;
      data.set(key, JSON.stringify(value));
      etags.set(key, `"${++counter}"`);
      return true;
    },
    async getBytes(key) {
      const v = data.get(key);
      return v instanceof Uint8Array ? new Uint8Array(v) : null;
    },
    async setBytes(key, value) {
      data.set(key, new Uint8Array(value));
    },
    async delete(key) {
      data.delete(key);
      etags.delete(key);
    },
    async list(prefix) {
      return [...data.keys()].filter((k) => k.startsWith(prefix));
    },
  };
}
