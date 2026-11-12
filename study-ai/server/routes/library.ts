import { Router } from 'express';
import { z } from 'zod';
import { structuredSystemPrompt, summarySystemPrompt } from '../ai/prompts.ts';
import { assertAllowed, getUsage, recordUsage } from '../ai/usage.ts';
import type { AiUsage } from '../ai/client.ts';
import { type Ctx, loadProfile, uid, validate } from '../context.ts';
import { nowIso, parseJson } from '../db.ts';
import { HttpError, newId, RateLimiter } from '../security.ts';
import { addDays, isISODate } from '../../shared/dates.ts';
import { getSubject, yearLabel } from '../../shared/subjects.ts';
import type { Deck, Flashcard, PracticeTest, QuestionResult, Summary, TestQuestion } from '../../shared/types.ts';

const subjectId = z.string().regex(/^[a-z0-9-]{1,60}$/, 'disciplina inválida');

/** Intervalos de revisão das caixas de Leitner (dias). */
const BOX_INTERVAL = [0, 1, 2, 4, 7, 14];

interface SummaryRow {
  id: string; subject: string | null; title: string; content: string; source: 'ia' | 'manual'; created_at: string; updated_at: string;
}
const toSummary = (s: SummaryRow): Summary => ({
  id: s.id, subject: s.subject, title: s.title, content: s.content, source: s.source, createdAt: s.created_at, updatedAt: s.updated_at,
});

interface CardRow {
  id: string; deck_id: string; front: string; back: string; box: number; due: string; reviews: number; correct: number;
}
const toCard = (c: CardRow): Flashcard => ({
  id: c.id, deckId: c.deck_id, front: c.front, back: c.back, box: c.box, due: c.due, reviews: c.reviews, correct: c.correct,
});

interface TestRow {
  id: string; subject: string | null; topic: string; difficulty: PracticeTest['difficulty']; title: string; questions: string;
  answers: string | null; results: string | null; score: number | null; max_score: number; created_at: string; completed_at: string | null;
}
const toTest = (t: TestRow): PracticeTest => ({
  id: t.id,
  subject: t.subject,
  topic: t.topic,
  difficulty: t.difficulty,
  title: t.title,
  questions: parseJson<TestQuestion[]>(t.questions, []),
  answers: parseJson(t.answers, null),
  results: parseJson(t.results, null),
  score: t.score,
  maxScore: t.max_score,
  createdAt: t.created_at,
  completedAt: t.completed_at,
});

// Esquemas das respostas estruturadas da IA.
const FlashcardsOut = z.object({
  title: z.string(),
  cards: z.array(z.object({ front: z.string(), back: z.string() })),
});

const TestOut = z.object({
  title: z.string(),
  questions: z.array(
    z.object({
      kind: z.enum(['escolha-multipla', 'verdadeiro-falso', 'resposta-curta', 'desenvolvimento']),
      prompt: z.string(),
      options: z.array(z.string()),
      correct_option: z.number().int(),
      model_answer: z.string(),
      explanation: z.string(),
      points: z.number().int(),
    }),
  ),
});

const GradeOut = z.object({
  grades: z.array(z.object({ index: z.number().int(), score: z.number(), feedback: z.string() })),
});

const DIFFICULTY_LABEL = { facil: 'fácil', medio: 'médio', dificil: 'difícil' } as const;

export function libraryRouter(ctx: Ctx): Router {
  const r = Router();
  const aiLimiter = new RateLimiter(8, 60 * 1000);

  /** Prepara um pedido à IA que conta como 1 pergunta do plano. */
  function startAiRequest(userId: string) {
    if (!ctx.ai.configured) throw new HttpError(503, ctx.ai.status().message, 'ai_not_configured');
    if (!aiLimiter.take(userId)) throw new HttpError(429, 'Muitos pedidos seguidos. Espera um pouco.', 'rate_limited');
    const profile = loadProfile(ctx.db, userId);
    const day = ctx.today();
    assertAllowed(getUsage(ctx.db, userId, profile.aiPlan, day));
    return {
      profile,
      done: (tokens: AiUsage) => recordUsage(ctx.db, userId, profile.aiPlan, day, { questions: 1, tokens }),
    };
  }

  // ---------- Resumos ----------

  r.get('/summaries', (req, res) => {
    const userId = uid(res);
    const subject = typeof req.query.subject === 'string' ? req.query.subject : null;
    const rows = subject
      ? ctx.db.all<SummaryRow>('SELECT * FROM summaries WHERE user_id = ? AND subject = ? ORDER BY updated_at DESC', userId, subject)
      : ctx.db.all<SummaryRow>('SELECT * FROM summaries WHERE user_id = ? ORDER BY updated_at DESC', userId);
    res.json({ summaries: rows.map(toSummary) });
  });

  const summaryBody = z.object({
    subject: subjectId.nullable(),
    title: z.string().trim().min(1, 'escreve um título').max(140),
    content: z.string().trim().min(1, 'o resumo está vazio').max(60000),
    source: z.enum(['ia', 'manual']).default('manual'),
  });

  r.post('/summaries', (req, res) => {
    const userId = uid(res);
    const body = validate(summaryBody, req.body);
    const id = newId();
    const now = nowIso();
    ctx.db.run(
      'INSERT INTO summaries (id, user_id, subject, title, content, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      id, userId, body.subject, body.title, body.content, body.source, now, now,
    );
    res.status(201).json({ summary: toSummary(ctx.db.one<SummaryRow>('SELECT * FROM summaries WHERE id = ?', id)!) });
  });

  r.put('/summaries/:id', (req, res) => {
    const userId = uid(res);
    const body = validate(summaryBody.omit({ source: true }), req.body);
    const result = ctx.db.run(
      'UPDATE summaries SET subject = ?, title = ?, content = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      body.subject, body.title, body.content, nowIso(), req.params.id, userId,
    );
    if (!result.changes) throw new HttpError(404, 'Resumo não encontrado.', 'not_found');
    res.json({ summary: toSummary(ctx.db.one<SummaryRow>('SELECT * FROM summaries WHERE id = ?', req.params.id)!) });
  });

  r.delete('/summaries/:id', (req, res) => {
    ctx.db.run('DELETE FROM summaries WHERE id = ? AND user_id = ?', req.params.id, uid(res));
    res.json({ ok: true });
  });

  r.post('/summaries/generate', async (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ subject: subjectId.nullable(), topic: z.string().trim().min(2, 'indica a matéria').max(300) }), req.body);
    const { profile, done } = startAiRequest(userId);
    const q = profile.questionnaire;
    const subjectName = body.subject ? getSubject(body.subject, q?.customSubjects).name : null;
    const { text, usage } = await ctx.ai.generateText({
      plan: profile.aiPlan,
      system: summarySystemPrompt(profile.aiPlan, q),
      prompt: `Faz um resumo de ${subjectName ?? 'estudo'} sobre: ${body.topic}`,
    });
    done(usage);
    const id = newId();
    const now = nowIso();
    const title = `${body.topic.charAt(0).toUpperCase()}${body.topic.slice(1)}`.slice(0, 140);
    ctx.db.run(
      'INSERT INTO summaries (id, user_id, subject, title, content, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      id, userId, body.subject, title, text.trim(), 'ia', now, now,
    );
    res.status(201).json({
      summary: toSummary(ctx.db.one<SummaryRow>('SELECT * FROM summaries WHERE id = ?', id)!),
      usage: getUsage(ctx.db, userId, profile.aiPlan, ctx.today()),
    });
  });

  // ---------- Flashcards ----------

  function deckStats(userId: string, today: string): Deck[] {
    return ctx.db
      .all<{ id: string; subject: string | null; title: string; created_at: string; total: number; due: number | null; mastered: number | null }>(
        `SELECT d.id, d.subject, d.title, d.created_at,
           COUNT(c.id) AS total,
           SUM(CASE WHEN c.due <= ? THEN 1 ELSE 0 END) AS due,
           SUM(CASE WHEN c.box >= 4 THEN 1 ELSE 0 END) AS mastered
         FROM decks d LEFT JOIN cards c ON c.deck_id = d.id
         WHERE d.user_id = ? GROUP BY d.id ORDER BY d.created_at DESC`,
        today,
        userId,
      )
      .map((d) => ({
        id: d.id, subject: d.subject, title: d.title, createdAt: d.created_at,
        cardCount: d.total, dueCount: d.due ?? 0, masteredCount: d.mastered ?? 0,
      }));
  }

  function ownDeck(userId: string, id: string) {
    const d = ctx.db.one<{ id: string }>('SELECT id FROM decks WHERE id = ? AND user_id = ?', id, userId);
    if (!d) throw new HttpError(404, 'Baralho não encontrado.', 'not_found');
    return d;
  }

  const clientDate = (v: unknown) => (typeof v === 'string' && isISODate(v) ? v : ctx.today());

  r.get('/decks', (req, res) => {
    res.json({ decks: deckStats(uid(res), clientDate(req.query.date)) });
  });

  const cardInput = z.object({ front: z.string().trim().min(1).max(500), back: z.string().trim().min(1).max(2000) });

  function createDeck(userId: string, subject: string | null, title: string, cards: { front: string; back: string }[]) {
    const id = newId();
    const now = nowIso();
    const today = ctx.today();
    ctx.db.tx(() => {
      ctx.db.run('INSERT INTO decks (id, user_id, subject, title, created_at) VALUES (?, ?, ?, ?, ?)', id, userId, subject, title, now);
      for (const c of cards)
        ctx.db.run(
          'INSERT INTO cards (id, deck_id, user_id, front, back, box, due, reviews, correct, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, 0, 0, ?)',
          newId(), id, userId, c.front, c.back, today, now,
        );
    });
    return id;
  }

  r.post('/decks', (req, res) => {
    const userId = uid(res);
    const body = validate(
      z.object({ subject: subjectId.nullable(), title: z.string().trim().min(1, 'escreve um título').max(120), cards: z.array(cardInput).max(200).default([]) }),
      req.body,
    );
    const id = createDeck(userId, body.subject, body.title, body.cards);
    res.status(201).json({ deck: deckStats(userId, ctx.today()).find((d) => d.id === id) });
  });

  r.post('/decks/generate', async (req, res) => {
    const userId = uid(res);
    const body = validate(
      z.object({
        subject: subjectId.nullable(),
        topic: z.string().trim().max(300).default(''),
        count: z.number().int().min(4).max(30).default(10),
        summaryId: z.string().uuid().optional(),
      }),
      req.body,
    );
    let source = '';
    if (body.summaryId) {
      const s = ctx.db.one<SummaryRow>('SELECT * FROM summaries WHERE id = ? AND user_id = ?', body.summaryId, userId);
      if (!s) throw new HttpError(404, 'Resumo não encontrado.', 'not_found');
      source = `\n\nUsa este resumo como base:\n"""\n${s.content.slice(0, 30000)}\n"""`;
    } else if (body.topic.length < 2) throw new HttpError(400, 'Indica a matéria dos flashcards.', 'invalid');
    const { profile, done } = startAiRequest(userId);
    const q = profile.questionnaire;
    const subjectName = body.subject ? getSubject(body.subject, q?.customSubjects).name : 'estudo';
    const { data, usage } = await ctx.ai.generateStructured({
      plan: profile.aiPlan,
      system: structuredSystemPrompt(q),
      prompt: `Cria ${body.count} flashcards de ${subjectName}${body.topic ? ` sobre «${body.topic}»` : ''} para um estudante do ${yearLabel(q?.year)}.
Frente: uma pergunta ou conceito curto. Verso: a resposta, clara e curta (no máximo 2 frases). Sem repetições.
"title" é um título curto para o baralho.${source}`,
      schema: FlashcardsOut,
    });
    done(usage);
    const cards = data.cards
      .filter((c) => c.front.trim() && c.back.trim())
      .slice(0, body.count)
      .map((c) => ({ front: c.front.trim().slice(0, 500), back: c.back.trim().slice(0, 2000) }));
    if (!cards.length) throw new HttpError(502, 'A IA não devolveu flashcards. Tenta novamente.', 'ai_empty');
    const id = createDeck(userId, body.subject, (data.title || body.topic || 'Flashcards').slice(0, 120), cards);
    res.status(201).json({
      deck: deckStats(userId, ctx.today()).find((d) => d.id === id),
      usage: getUsage(ctx.db, userId, profile.aiPlan, ctx.today()),
    });
  });

  r.get('/decks/:id', (req, res) => {
    const userId = uid(res);
    ownDeck(userId, req.params.id);
    const deck = deckStats(userId, clientDate(req.query.date)).find((d) => d.id === req.params.id);
    const cards = ctx.db.all<CardRow>('SELECT * FROM cards WHERE deck_id = ? AND user_id = ? ORDER BY created_at', req.params.id, userId);
    res.json({ deck, cards: cards.map(toCard) });
  });

  r.put('/decks/:id', (req, res) => {
    const userId = uid(res);
    ownDeck(userId, req.params.id);
    const body = validate(z.object({ subject: subjectId.nullable(), title: z.string().trim().min(1).max(120) }), req.body);
    ctx.db.run('UPDATE decks SET subject = ?, title = ? WHERE id = ? AND user_id = ?', body.subject, body.title, req.params.id, userId);
    res.json({ ok: true });
  });

  r.delete('/decks/:id', (req, res) => {
    ctx.db.run('DELETE FROM decks WHERE id = ? AND user_id = ?', req.params.id, uid(res));
    res.json({ ok: true });
  });

  r.post('/decks/:id/cards', (req, res) => {
    const userId = uid(res);
    ownDeck(userId, req.params.id);
    const body = validate(cardInput, req.body);
    const id = newId();
    ctx.db.run(
      'INSERT INTO cards (id, deck_id, user_id, front, back, box, due, reviews, correct, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, 0, 0, ?)',
      id, req.params.id, userId, body.front, body.back, ctx.today(), nowIso(),
    );
    res.status(201).json({ card: toCard(ctx.db.one<CardRow>('SELECT * FROM cards WHERE id = ?', id)!) });
  });

  r.put('/cards/:id', (req, res) => {
    const userId = uid(res);
    const body = validate(cardInput, req.body);
    ctx.db.run('UPDATE cards SET front = ?, back = ? WHERE id = ? AND user_id = ?', body.front, body.back, req.params.id, userId);
    res.json({ ok: true });
  });

  r.delete('/cards/:id', (req, res) => {
    ctx.db.run('DELETE FROM cards WHERE id = ? AND user_id = ?', req.params.id, uid(res));
    res.json({ ok: true });
  });

  /** Resposta a um flashcard: sobe de caixa se acertou, volta à caixa 1 se errou. */
  r.post('/cards/:id/review', (req, res) => {
    const userId = uid(res);
    const body = validate(z.object({ known: z.boolean(), date: z.string().refine(isISODate) }), req.body);
    const card = ctx.db.one<CardRow>('SELECT * FROM cards WHERE id = ? AND user_id = ?', req.params.id, userId);
    if (!card) throw new HttpError(404, 'Flashcard não encontrado.', 'not_found');
    const box = body.known ? Math.min(5, card.box + 1) : 1;
    const due = addDays(body.date, body.known ? (BOX_INTERVAL[box] ?? 14) : 0);
    ctx.db.tx(() => {
      ctx.db.run(
        'UPDATE cards SET box = ?, due = ?, reviews = reviews + 1, correct = correct + ? WHERE id = ? AND user_id = ?',
        box, due, body.known ? 1 : 0, card.id, userId,
      );
      ctx.db.run(
        `INSERT INTO card_reviews (user_id, date, count) VALUES (?, ?, 1)
         ON CONFLICT (user_id, date) DO UPDATE SET count = count + 1`,
        userId, body.date,
      );
    });
    res.json({ card: toCard(ctx.db.one<CardRow>('SELECT * FROM cards WHERE id = ?', card.id)!) });
  });

  // ---------- Testes de preparação ----------

  r.get('/tests', (_req, res) => {
    const rows = ctx.db.all<TestRow>('SELECT * FROM tests WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', uid(res));
    res.json({ tests: rows.map(toTest) });
  });

  function ownTest(userId: string, id: string): TestRow {
    const t = ctx.db.one<TestRow>('SELECT * FROM tests WHERE id = ? AND user_id = ?', id, userId);
    if (!t) throw new HttpError(404, 'Teste não encontrado.', 'not_found');
    return t;
  }

  r.get('/tests/:id', (req, res) => {
    res.json({ test: toTest(ownTest(uid(res), req.params.id)) });
  });

  r.delete('/tests/:id', (req, res) => {
    ctx.db.run('DELETE FROM tests WHERE id = ? AND user_id = ?', req.params.id, uid(res));
    res.json({ ok: true });
  });

  r.post('/tests/generate', async (req, res) => {
    const userId = uid(res);
    const body = validate(
      z.object({
        subject: subjectId.nullable(),
        topic: z.string().trim().min(2, 'indica a matéria do teste').max(300),
        count: z.number().int().min(3).max(20).default(8),
        difficulty: z.enum(['facil', 'medio', 'dificil']).default('medio'),
        kinds: z
          .array(z.enum(['escolha-multipla', 'verdadeiro-falso', 'resposta-curta', 'desenvolvimento']))
          .min(1, 'escolhe pelo menos um tipo de pergunta')
          .default(['escolha-multipla', 'resposta-curta']),
      }),
      req.body,
    );
    const { profile, done } = startAiRequest(userId);
    const q = profile.questionnaire;
    const subjectName = body.subject ? getSubject(body.subject, q?.customSubjects).name : 'estudo';
    const { data, usage } = await ctx.ai.generateStructured({
      plan: profile.aiPlan,
      system: structuredSystemPrompt(q),
      prompt: `Cria um teste de preparação de ${subjectName} sobre «${body.topic}» para um estudante do ${yearLabel(q?.year)}.
- ${body.count} perguntas, dificuldade ${DIFFICULTY_LABEL[body.difficulty]}.
- Tipos permitidos (varia entre eles): ${body.kinds.join(', ')}.
- escolha-multipla: 4 opções em "options", só uma certa; "correct_option" é o índice (0 a 3) da opção certa.
- verdadeiro-falso: "options" = ["Verdadeiro", "Falso"]; "correct_option" = 0 ou 1.
- resposta-curta e desenvolvimento: "options" = [] e "correct_option" = -1.
- "model_answer": a resposta certa completa (para as perguntas abertas, os pontos que uma boa resposta deve ter).
- "explanation": porque é que essa é a resposta certa (1 a 3 frases).
- "points": 1 nas perguntas fechadas, 2 nas de resposta curta, 4 nas de desenvolvimento.
- "title": título curto do teste.`,
      schema: TestOut,
      maxTokens: 24000,
    });
    done(usage);
    const questions: TestQuestion[] = data.questions
      .slice(0, body.count)
      .map((x): TestQuestion => {
        const closed = x.kind === 'escolha-multipla' || x.kind === 'verdadeiro-falso';
        const options = x.kind === 'verdadeiro-falso' ? ['Verdadeiro', 'Falso'] : closed ? x.options.slice(0, 6) : [];
        const correct = closed && x.correct_option >= 0 && x.correct_option < options.length ? x.correct_option : closed ? 0 : -1;
        return {
          kind: x.kind,
          prompt: x.prompt.trim(),
          options,
          correctOption: correct,
          modelAnswer: x.model_answer.trim(),
          explanation: x.explanation.trim(),
          points: Math.min(10, Math.max(1, x.points || 1)),
        };
      })
      .filter((x) => x.prompt && (x.kind === 'resposta-curta' || x.kind === 'desenvolvimento' || x.options.length >= 2));
    if (!questions.length) throw new HttpError(502, 'A IA não devolveu perguntas válidas. Tenta novamente.', 'ai_empty');
    const id = newId();
    const max = questions.reduce((a, x) => a + x.points, 0);
    ctx.db.run(
      `INSERT INTO tests (id, user_id, subject, topic, difficulty, title, questions, answers, results, score, max_score, created_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, NULL)`,
      id, userId, body.subject, body.topic, body.difficulty, (data.title || `Teste de ${subjectName}`).slice(0, 140), JSON.stringify(questions), max, nowIso(),
    );
    res.status(201).json({ test: toTest(ownTest(userId, id)), usage: getUsage(ctx.db, userId, profile.aiPlan, ctx.today()) });
  });

  /**
   * Correção: as perguntas fechadas são corrigidas automaticamente. As abertas são
   * corrigidas pela IA (conta 1 pergunta) ou, sem IA, por autoavaliação do estudante.
   */
  r.post('/tests/:id/submit', async (req, res) => {
    const userId = uid(res);
    const t = ownTest(userId, req.params.id);
    const test = toTest(t);
    const body = validate(
      z.object({
        answers: z.array(z.union([z.string().max(5000), z.number().int(), z.null()])).length(test.questions.length, 'responde a todas as perguntas'),
        selfGrades: z.record(z.string(), z.boolean()).optional(),
        useAi: z.boolean().default(true),
      }),
      req.body,
    );
    const results: (QuestionResult | null)[] = test.questions.map((question, i) => {
      if (question.kind === 'escolha-multipla' || question.kind === 'verdadeiro-falso') {
        const ok = body.answers[i] === question.correctOption;
        return {
          score: ok ? question.points : 0,
          max: question.points,
          correct: ok,
          feedback: ok ? 'Certo!' : `A resposta certa é: ${question.options[question.correctOption] ?? ''}.`,
        };
      }
      return null;
    });
    const open = test.questions.map((question, i) => ({ question, i })).filter(({ i }) => results[i] === null);
    let usageOut = undefined;
    if (open.length) {
      const self = body.selfGrades;
      if (self && open.every(({ i }) => typeof self[String(i)] === 'boolean')) {
        for (const { question, i } of open) {
          const ok = self[String(i)]!;
          results[i] = { score: ok ? question.points : 0, max: question.points, correct: ok, feedback: 'Autoavaliação.' };
        }
      } else if (body.useAi && ctx.ai.configured) {
        let request: ReturnType<typeof startAiRequest>;
        try {
          request = startAiRequest(userId);
        } catch (err) {
          // Limite do plano atingido: a correção passa a ser feita pelo estudante.
          if (err instanceof HttpError && (err.code === 'limit_questions' || err.code === 'rate_limited')) {
            res.json({ pendingSelfGrade: open.map(({ i }) => i), test, notice: err.message });
            return;
          }
          throw err;
        }
        const { profile, done } = request;
        const { data, usage } = await ctx.ai.generateStructured({
          plan: profile.aiPlan,
          system: structuredSystemPrompt(profile.questionnaire),
          prompt: `Corrige as respostas abertas deste teste de preparação («${test.title}»). Para cada uma, dá uma pontuação entre 0 e a cotação (podes usar meios pontos) e um comentário curto, em «tu»: o que está certo, o que falta ou está errado, e como melhorar.

${open
  .map(
    ({ question, i }) => `## Pergunta ${i} (cotação ${question.points})
${question.prompt}
Resposta-modelo: ${question.modelAnswer}
Resposta do estudante: ${String(body.answers[i] ?? '').trim() || '(sem resposta)'}`,
  )
  .join('\n\n')}

Em "grades", "index" é o número da pergunta indicado acima.`,
          schema: GradeOut,
        });
        done(usage);
        usageOut = getUsage(ctx.db, userId, profile.aiPlan, ctx.today());
        for (const { question, i } of open) {
          const g = data.grades.find((x) => x.index === i);
          const score = Math.min(question.points, Math.max(0, Math.round((g?.score ?? 0) * 2) / 2));
          results[i] = {
            score,
            max: question.points,
            correct: score >= question.points * 0.75,
            feedback: g?.feedback?.trim() || 'Sem comentário.',
          };
        }
      } else {
        // Sem IA (ou sem perguntas disponíveis): o estudante compara com a resposta-modelo.
        res.json({ pendingSelfGrade: open.map(({ i }) => i), test });
        return;
      }
    }
    const final = results as QuestionResult[];
    const score = final.reduce((a, x) => a + x.score, 0);
    ctx.db.run(
      'UPDATE tests SET answers = ?, results = ?, score = ?, completed_at = ? WHERE id = ? AND user_id = ?',
      JSON.stringify(body.answers), JSON.stringify(final), score, nowIso(), t.id, userId,
    );
    res.json({ test: toTest(ownTest(userId, t.id)), ...(usageOut ? { usage: usageOut } : {}) });
  });

  return r;
}
