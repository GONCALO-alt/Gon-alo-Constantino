import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

// Base de dados SQLite (módulo nativo do Node, sem dependências externas).
// Cada tabela com dados de um estudante tem `user_id` e todas as consultas filtram por ele.

const MIGRATIONS: string[] = [
  `
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE INDEX sessions_user ON sessions(user_id);
  CREATE TABLE profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    onboarded INTEGER NOT NULL DEFAULT 0,
    questionnaire TEXT,
    ai_plan TEXT NOT NULL DEFAULT 'claudio-5',
    favorites TEXT NOT NULL DEFAULT '[]',
    settings TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL
  );
  CREATE TABLE study_plans (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE weekly_checks (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week TEXT NOT NULL,
    goal_id TEXT NOT NULL,
    PRIMARY KEY (user_id, week, goal_id)
  );
  CREATE TABLE events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    subject TEXT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE INDEX events_user_date ON events(user_id, date);
  CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX conversations_user ON conversations(user_id, updated_at);
  CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    plan TEXT,
    status TEXT NOT NULL DEFAULT 'ok',
    created_at TEXT NOT NULL
  );
  CREATE INDEX messages_conversation ON messages(conversation_id, created_at);
  CREATE TABLE attachments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id TEXT REFERENCES messages(id) ON DELETE SET NULL,
    kind TEXT NOT NULL,
    mime TEXT NOT NULL,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX attachments_message ON attachments(message_id);
  CREATE TABLE usage (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    plan TEXT NOT NULL,
    questions INTEGER NOT NULL DEFAULT 0,
    images INTEGER NOT NULL DEFAULT 0,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day, plan)
  );
  CREATE TABLE summaries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX summaries_user ON summaries(user_id, updated_at);
  CREATE TABLE decks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE cards (
    id TEXT PRIMARY KEY,
    deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    box INTEGER NOT NULL DEFAULT 1,
    due TEXT NOT NULL,
    reviews INTEGER NOT NULL DEFAULT 0,
    correct INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX cards_deck ON cards(deck_id);
  CREATE TABLE card_reviews (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, date)
  );
  CREATE TABLE tests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    title TEXT NOT NULL,
    questions TEXT NOT NULL,
    answers TEXT,
    results TEXT,
    score REAL,
    max_score REAL NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT
  );
  CREATE INDEX tests_user ON tests(user_id, created_at);
  CREATE TABLE study_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    subject TEXT,
    minutes INTEGER NOT NULL,
    source TEXT NOT NULL,
    session_key TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX study_logs_user_date ON study_logs(user_id, date);
  CREATE UNIQUE INDEX study_logs_session ON study_logs(user_id, session_key) WHERE session_key IS NOT NULL;
  CREATE TABLE daily_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    text TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE INDEX daily_goals_user_date ON daily_goals(user_id, date);
  `,
];

export type Row = Record<string, SQLInputValue>;

export class Db {
  readonly raw: DatabaseSync;
  readonly uploadsDir: string;

  constructor(dataDir: string, filename = 'study-ai.sqlite') {
    fs.mkdirSync(dataDir, { recursive: true });
    this.uploadsDir = path.join(dataDir, 'uploads');
    fs.mkdirSync(this.uploadsDir, { recursive: true });
    this.raw = new DatabaseSync(filename === ':memory:' ? ':memory:' : path.join(dataDir, filename));
    this.raw.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    this.migrate();
  }

  private migrate() {
    const row = this.raw.prepare('PRAGMA user_version').get() as { user_version: number };
    let version = row.user_version;
    while (version < MIGRATIONS.length) {
      this.tx(() => {
        this.raw.exec(MIGRATIONS[version]!);
        this.raw.exec(`PRAGMA user_version = ${version + 1}`);
      });
      version++;
    }
  }

  one<T>(sql: string, ...params: SQLInputValue[]): T | undefined {
    return this.raw.prepare(sql).get(...params) as T | undefined;
  }

  all<T>(sql: string, ...params: SQLInputValue[]): T[] {
    return this.raw.prepare(sql).all(...params) as T[];
  }

  run(sql: string, ...params: SQLInputValue[]) {
    return this.raw.prepare(sql).run(...params);
  }

  tx<T>(fn: () => T): T {
    this.raw.exec('BEGIN');
    try {
      const result = fn();
      this.raw.exec('COMMIT');
      return result;
    } catch (err) {
      this.raw.exec('ROLLBACK');
      throw err;
    }
  }

  close() {
    this.raw.close();
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
