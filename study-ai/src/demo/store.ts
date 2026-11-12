// Armazenamento da versão de demonstração.
// 1.º: base de dados do artefacto, na pasta privada de cada pessoa (data/users/<id>/),
//      acessível só a ela, em qualquer dispositivo onde abra a página.
// 2.º: se não for possível (sem sessão ou sem permissão de escrita), o navegador (localStorage).
// 3.º: em último caso, só na memória (perde-se ao fechar a página).
// Os dados são guardados em vários documentos pequenos (limite de 256 KiB por documento).

import { joinState as fromDocs, splitState as toDocs, type UserState } from '../../core/state';

export type DemoState = UserState;

export type StorageKind = 'conta' | 'navegador' | 'memoria';

interface Backend {
  kind: StorageKind;
  load(): Promise<Record<string, unknown>>;
  write(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

interface DocSnap {
  id: string;
  data(): Record<string, unknown> | undefined;
}
interface Collection {
  limit(n: number): { get(): Promise<{ docs: DocSnap[] }> };
  doc(id: string): { set(d: Record<string, unknown>): Promise<void>; delete(): Promise<void> };
}
interface DbLike {
  collection(path: string): Collection;
}

function dbBackend(db: DbLike, uid: string): Backend {
  const col = db.collection(`data/users/${uid}`);
  return {
    kind: 'conta',
    async load() {
      const snap = await col.limit(1000).get();
      const out: Record<string, unknown> = {};
      // Os documentos chegam congelados (só de leitura): copia-os para os poder alterar.
      for (const d of snap.docs) {
        const v = d.data()?.v;
        out[d.id] = v === undefined ? undefined : JSON.parse(JSON.stringify(v));
      }
      return out;
    },
    write: (key, value) => col.doc(key).set({ v: value as never }),
    remove: (key) => col.doc(key).delete(),
  };
}

const LOCAL_KEY = 'study-ai-demo:v1';

function localBackend(): Backend | null {
  try {
    localStorage.setItem('study-ai-demo:test', '1');
    localStorage.removeItem('study-ai-demo:test');
  } catch {
    return null;
  }
  const read = (): Record<string, unknown> => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}') as Record<string, unknown>;
    } catch {
      return {};
    }
  };
  return {
    kind: 'navegador',
    load: async () => read(),
    async write(key, value) {
      const all = read();
      all[key] = value;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
    },
    async remove(key) {
      const all = read();
      delete all[key];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
    },
  };
}

const memoryBackend = (): Backend => ({ kind: 'memoria', load: async () => ({}), write: async () => {}, remove: async () => {} });

export class DemoStore {
  state!: DemoState;
  /** Onde se guarda: a conta (base de dados do artefacto) ou, sem ela, o navegador. */
  private backend: Backend = memoryBackend();
  /** Cópia de segurança no navegador quando se guarda na conta. */
  private backup: Backend | null = null;
  private saved: Record<string, string> = {};
  private timer: ReturnType<typeof setTimeout> | null = null;
  private chain: Promise<void> = Promise.resolve();
  private diagnostics: { at: string; where: string; message: string }[] = [];

  get kind(): StorageKind {
    return this.backend.kind;
  }

  async init(db: DbLike | null, uid: string | null, fresh: () => DemoState) {
    const local = localBackend();
    const localDocs = local ? await local.load().catch(() => ({})) : {};
    let docs: Record<string, unknown> | null = null;
    if (db && uid) {
      const remote = dbBackend(db, uid);
      try {
        docs = await withTimeout(remote.load(), 10000);
        this.backend = remote;
        this.backup = local;
      } catch (err) {
        this.logError('abrir', err);
      }
    }
    if (!docs) {
      this.backend = local ?? memoryBackend();
      docs = localDocs;
    }
    const remoteState = fromDocs(docs);
    const localState = this.backend.kind === 'conta' ? fromDocs(localDocs) : null;
    // Usa a cópia mais recente; se for a do navegador, volta a gravá-la na conta.
    const useLocal = !!localState && (!remoteState || localState.rev > remoteState.rev);
    const loaded = useLocal ? localState : remoteState;
    this.state = loaded ?? fresh();
    this.saved = useLocal || !loaded ? {} : Object.fromEntries(Object.entries(toDocs(this.state)).map(([k, v]) => [k, JSON.stringify(v)]));
    if (!loaded || useLocal) this.save();
  }

  /** Guarda (com um pequeno atraso) os documentos que mudaram. */
  save() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.chain = this.chain.then(() => this.flush()).catch(() => {});
    }, 300);
  }

  /** Grava já e espera (para passos importantes, como criar o plano). */
  async saveNow() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.chain = this.chain.then(() => this.flush()).catch(() => {});
    await this.chain;
  }

  private async writeWithRetry(key: string, value: unknown) {
    try {
      await this.backend.write(key, value);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code !== 'unavailable' && code !== 'resource_exhausted') throw err;
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));
      await this.backend.write(key, value);
    }
  }

  private async flush() {
    this.state.rev = (this.state.rev || 0) + 1;
    const all = toDocs(this.state);
    const docs = Object.fromEntries(Object.entries(all).map(([k, v]) => [k, JSON.stringify(v)]));
    // Cópia de segurança completa no navegador (rápida), antes de gravar na conta.
    if (this.backup) {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
      } catch {
        this.backup = null;
      }
    }
    const changed = Object.keys(docs).filter((k) => docs[k] !== this.saved[k]);
    const removed = Object.keys(this.saved).filter((k) => !(k in docs));
    try {
      for (const k of changed) {
        await this.writeWithRetry(k, JSON.parse(docs[k]!));
        this.saved[k] = docs[k]!;
      }
      for (const k of removed) {
        await this.backend.remove(k);
        delete this.saved[k];
      }
    } catch (err) {
      this.logError('gravar', err);
      // A conta recusou a escrita (por exemplo, só com acesso de leitura): continua no navegador.
      if (this.backend.kind === 'conta') {
        this.backend = localBackend() ?? memoryBackend();
        this.backup = null;
        this.saved = {};
        await this.flush();
      }
    }
  }

  /** Guarda os últimos erros na área privada da pessoa (para se poder perceber o que falhou). */
  logError(where: string, err: unknown) {
    const e = err as { code?: string; message?: string; stack?: string };
    const message = `${e?.code ? `[${e.code}] ` : ''}${e?.message ?? String(err)}${e?.stack ? `\n${e.stack.split('\n').slice(0, 4).join('\n')}` : ''}`.slice(0, 1500);
    this.diagnostics = [...this.diagnostics, { at: new Date().toISOString(), where, message }].slice(-20);
    const list = this.diagnostics;
    this.chain = this.chain.then(() => this.backend.write('diag', { list })).catch(() => {});
  }

  async reset(fresh: () => DemoState) {
    const keys = Object.keys(this.saved);
    const rev = this.state.rev;
    this.state = fresh();
    this.state.rev = rev; // continua a subir: a cópia antiga do navegador não volta a ganhar
    for (const k of keys) await this.backend.remove(k).catch(() => {});
    this.saved = {};
    this.save();
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}
