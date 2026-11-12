// Armazenamento da versão de demonstração.
// 1.º: base de dados do artefacto, na pasta privada de cada pessoa (data/users/<id>/),
//      acessível só a ela, em qualquer dispositivo onde abra a página.
// 2.º: se não for possível (sem sessão ou sem permissão de escrita), o navegador (localStorage).
// 3.º: em último caso, só na memória (perde-se ao fechar a página).
// Os dados são guardados em vários documentos pequenos (limite de 256 KiB por documento).

import type {
  CalendarEvent, ChatMessage, Conversation, DailyGoal, Flashcard, PracticeTest, Profile, StudyLog, StudyPlan, Summary,
} from '../../shared/types';

export interface DeckRow {
  id: string;
  subject: string | null;
  title: string;
  createdAt: string;
}

export interface DemoState {
  user: { id: string; name: string; email: string; createdAt: string };
  profile: Profile;
  plan: StudyPlan | null;
  checks: Record<string, string[]>;
  usage: Record<string, { questions: number; images: number }>;
  cardReviews: Record<string, number>;
  events: CalendarEvent[];
  logs: StudyLog[];
  goals: DailyGoal[];
  conversations: Record<string, { conversation: Conversation; messages: ChatMessage[] }>;
  summaries: Record<string, Summary>;
  decks: Record<string, { deck: DeckRow; cards: Flashcard[] }>;
  tests: Record<string, PracticeTest>;
}

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
      for (const d of snap.docs) out[d.id] = d.data()?.v;
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

const month = (date: string) => date.slice(0, 7);

/** Converte o estado em documentos: chave → valor. */
function toDocs(s: DemoState): Record<string, unknown> {
  const docs: Record<string, unknown> = {
    main: { user: s.user, profile: s.profile, plan: s.plan, checks: s.checks, usage: s.usage, cardReviews: s.cardReviews, events: s.events },
  };
  for (const [id, c] of Object.entries(s.conversations)) docs[`conv_${id}`] = trimConversation(c);
  for (const [id, x] of Object.entries(s.summaries)) docs[`sum_${id}`] = x;
  for (const [id, x] of Object.entries(s.decks)) docs[`deck_${id}`] = x;
  for (const [id, x] of Object.entries(s.tests)) docs[`test_${id}`] = x;
  for (const l of s.logs) ((docs[`logs_${month(l.date)}`] ??= []) as StudyLog[]).push(l);
  for (const g of s.goals) ((docs[`goals_${month(g.date)}`] ??= []) as DailyGoal[]).push(g);
  return docs;
}

/** Uma conversa muito longa guarda só as mensagens mais recentes (limite do documento). */
function trimConversation(c: { conversation: Conversation; messages: ChatMessage[] }) {
  let messages = c.messages;
  while (messages.length > 2 && JSON.stringify(messages).length > 200_000) messages = messages.slice(2);
  return { conversation: c.conversation, messages };
}

function fromDocs(docs: Record<string, unknown>): DemoState | null {
  const main = docs.main as Partial<DemoState> | undefined;
  if (!main?.user || !main.profile) return null;
  const s: DemoState = {
    user: main.user,
    profile: main.profile,
    plan: main.plan ?? null,
    checks: main.checks ?? {},
    usage: main.usage ?? {},
    cardReviews: main.cardReviews ?? {},
    events: main.events ?? [],
    logs: [],
    goals: [],
    conversations: {},
    summaries: {},
    decks: {},
    tests: {},
  };
  for (const [key, value] of Object.entries(docs)) {
    if (!value) continue;
    const id = key.slice(key.indexOf('_') + 1);
    if (key.startsWith('conv_')) s.conversations[id] = value as DemoState['conversations'][string];
    else if (key.startsWith('sum_')) s.summaries[id] = value as Summary;
    else if (key.startsWith('deck_')) s.decks[id] = value as DemoState['decks'][string];
    else if (key.startsWith('test_')) s.tests[id] = value as PracticeTest;
    else if (key.startsWith('logs_')) s.logs.push(...(value as StudyLog[]));
    else if (key.startsWith('goals_')) s.goals.push(...(value as DailyGoal[]));
  }
  return s;
}

export class DemoStore {
  state!: DemoState;
  private backend: Backend = memoryBackend();
  private saved: Record<string, string> = {};
  private timer: ReturnType<typeof setTimeout> | null = null;
  private chain: Promise<void> = Promise.resolve();

  get kind(): StorageKind {
    return this.backend.kind;
  }

  async init(db: DbLike | null, uid: string | null, fresh: () => DemoState) {
    const candidates: Backend[] = [];
    if (db && uid) candidates.push(dbBackend(db, uid));
    const local = localBackend();
    if (local) candidates.push(local);
    candidates.push(memoryBackend());
    for (const b of candidates) {
      try {
        const docs = await withTimeout(b.load(), 8000);
        this.backend = b;
        const loaded = fromDocs(docs);
        this.state = loaded ?? fresh();
        this.saved = Object.fromEntries(Object.entries(toDocs(this.state)).map(([k, v]) => [k, JSON.stringify(v)]));
        if (!loaded) for (const k of Object.keys(this.saved)) this.saved[k] = '';
        if (!loaded) this.save();
        return;
      } catch {
        /* tenta o seguinte */
      }
    }
  }

  /** Guarda (com um pequeno atraso) os documentos que mudaram. */
  save() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.chain = this.chain.then(() => this.flush()).catch(() => {});
    }, 300);
  }

  private async flush() {
    const docs = Object.fromEntries(Object.entries(toDocs(this.state)).map(([k, v]) => [k, JSON.stringify(v)]));
    const changed = Object.keys(docs).filter((k) => docs[k] !== this.saved[k]);
    const removed = Object.keys(this.saved).filter((k) => !(k in docs));
    try {
      for (const k of changed) {
        await this.backend.write(k, JSON.parse(docs[k]!));
        this.saved[k] = docs[k]!;
      }
      for (const k of removed) {
        await this.backend.remove(k);
        delete this.saved[k];
      }
    } catch {
      // Sem permissão para escrever na conta (por exemplo, só com acesso de leitura):
      // passa a guardar neste navegador.
      if (this.backend.kind === 'conta') {
        this.backend = localBackend() ?? memoryBackend();
        this.saved = {};
        await this.flush();
      }
    }
  }

  async reset(fresh: () => DemoState) {
    const keys = Object.keys(this.saved);
    this.state = fresh();
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
