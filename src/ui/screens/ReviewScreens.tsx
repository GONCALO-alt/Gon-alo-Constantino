import { useEffect, useMemo, useState } from 'react';
import type { Exercise } from '../../domain/schemas.ts';
import type { ExerciseAttempt, ReviewSchedule } from '../../domain/progress.ts';
import { contentRepo } from '../../data/contentRepo.ts';
import { getAllReviews, getRecentAttempts, recordReviewSession, type CompletionOutcome } from '../../data/progressRepo.ts';
import { encouragement, lastNDays, localDate, XP_RULES } from '../../engine/progression.ts';
import { buildReviewExercise, seededRandom, shuffle, type ReviewVocab } from '../../engine/session.ts';
import { isDue, isHard, isMastered, pickDue } from '../../engine/srs.ts';
import { celebrate } from '../../services/sounds.ts';
import { useAppData, type AppData } from '../AppState.tsx';
import { Card, EmptyState, Icon } from '../components/common.tsx';
import { ExerciseRunner, type RunnerAnswer } from '../exercises/ExerciseRunner.tsx';
import { href, navigate } from '../router.ts';

/** Carrega o vocabulário das secções com conteúdo publicado. */
async function loadVocabMap(index: AppData['index']): Promise<Map<string, ReviewVocab>> {
  const ids = index.sections.filter((s) => s.units.some((u) => u.lessonIds.length)).map((s) => s.id);
  const bundles = await Promise.all(ids.map((id) => contentRepo.loadVocab(id)));
  const map = new Map<string, ReviewVocab>();
  for (const b of bundles) for (const it of b?.items ?? []) map.set(it.id, it);
  return map;
}

function useReviewData() {
  const app = useAppData();
  const [state, setState] = useState<{ reviews: ReviewSchedule[]; vocab: Map<string, ReviewVocab>; attempts: ExerciseAttempt[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const since = lastNDays(localDate(), 7)[0]!;
    Promise.all([getAllReviews(), loadVocabMap(app.index), getRecentAttempts(since)])
      .then(([reviews, vocab, attempts]) => setState({ reviews, vocab, attempts }), (e: Error) => setError(e.message));
  }, [app.index, app.profile.totalXp]);
  return { app, state, error };
}

export function ReviewScreen() {
  const { state, error } = useReviewData();
  if (error) return <div className="page"><p className="notice" role="alert">{error}</p></div>;
  if (!state) return <div className="page"><p className="loading" aria-busy="true">A carregar…</p></div>;
  const now = Date.now();
  const { reviews, vocab, attempts } = state;
  const due = reviews.filter((r) => isDue(r, now));
  const hard = reviews.filter(isHard);
  const forgotten = reviews.filter((r) => r.lapses > 0).sort((a, b) => b.lapses - a.lapses);
  const mastered = reviews.filter(isMastered).length;
  const recentErrors = dedupeErrors(attempts.filter((a) => !a.correct)).slice(0, 12);
  const word = (id: string) => {
    const v = vocab.get(id);
    return v ? <><strong lang="nl">{v.article ? `${v.article} ` : ''}{v.nl}</strong> — {v.pt[0]}</> : <span className="muted">{id}</span>;
  };

  return (
    <div className="page">
      <h1>Revisão</h1>
      <p className="muted">A revisão espaçada volta a mostrar cada palavra pouco antes de a esquecer. Os erros fazem-na voltar mais cedo.</p>
      <dl className="stat-grid">
        <div><dt>Para rever agora</dt><dd>{due.length}</dd></div>
        <div><dt>Palavras no calendário</dt><dd>{reviews.length}</dd></div>
        <div><dt>Bem consolidadas</dt><dd>{mastered}</dd></div>
      </dl>
      {reviews.length === 0 ? (
        <EmptyState title="Ainda não há palavras para rever.">
          <p className="muted">Conclua uma lição e as palavras novas aparecem aqui.</p>
          <a className="btn btn-primary" href={href.course()}>Ir para o curso</a>
        </EmptyState>
      ) : (
        <div className="row wrap">
          <a className="btn btn-primary" href={href.reviewSession('vocab')}><Icon name="review" size={18} /> {due.length ? `Rever ${Math.min(due.length, 15)} palavras` : 'Praticar vocabulário'}</a>
          <a className={`btn btn-secondary ${hard.length + forgotten.length ? '' : 'disabled'}`} aria-disabled={!(hard.length + forgotten.length)} href={hard.length + forgotten.length ? href.reviewSession('hard') : undefined}>Palavras difíceis</a>
          <a className="btn btn-secondary" href={href.reviewSession('grammar')}><Icon name="book" size={18} /> Praticar gramática</a>
        </div>
      )}
      <div className="two-col">
        <Card>
          <h2>Palavras difíceis</h2>
          {hard.length ? <ul className="word-list">{hard.slice(0, 15).map((r) => <li key={r.itemId}>{word(r.itemId)}</li>)}</ul> : <p className="muted small">Nenhuma por agora.</p>}
        </Card>
        <Card>
          <h2>Palavras esquecidas</h2>
          {forgotten.length ? <ul className="word-list">{forgotten.slice(0, 15).map((r) => <li key={r.itemId}>{word(r.itemId)} <span className="muted small">({r.lapses}×)</span></li>)}</ul> : <p className="muted small">Nenhuma — boa memória!</p>}
        </Card>
      </div>
      <Card>
        <h2>Erros recentes (7 dias)</h2>
        {recentErrors.length ? (
          <ul className="error-list">
            {recentErrors.map((a) => (
              <li key={a.id}>
                <span className="muted small">{a.lessonId ? `Lição ${a.lessonId}` : 'Revisão'} · {exerciseTypeLabel(a.exerciseType)}</span>
                {a.answer && <span> — respondeu «<span lang="nl">{a.answer}</span>»</span>}
              </li>
            ))}
          </ul>
        ) : <p className="muted small">Sem erros nos últimos 7 dias.</p>}
      </Card>
    </div>
  );
}

function dedupeErrors(xs: ExerciseAttempt[]): ExerciseAttempt[] {
  const seen = new Set<string>();
  return [...xs].reverse().filter((a) => (seen.has(a.exerciseId) ? false : (seen.add(a.exerciseId), true)));
}

export function exerciseTypeLabel(t: string): string {
  const labels: Record<string, string> = {
    translate: 'Tradução', multipleChoice: 'Escolha múltipla', fillBlank: 'Preencher espaços', buildSentence: 'Construir frase',
    match: 'Associação', wordOrder: 'Ordenar palavras', findError: 'Encontrar o erro', articleChoice: 'De ou het',
    conjugation: 'Conjugação', dialogue: 'Diálogo', comprehension: 'Compreensão', listening: 'Compreensão auditiva',
    expression: 'Expressões', shortWriting: 'Escrita', review: 'Revisão',
  };
  return labels[t] ?? t;
}

// ---------------------------------------------------------------------------
// Sessão de revisão
// ---------------------------------------------------------------------------
const GRAMMAR_TYPES = new Set(['conjugation', 'articleChoice', 'fillBlank', 'findError', 'wordOrder']);

export function ReviewSessionScreen({ mode }: { mode: 'vocab' | 'hard' | 'grammar' }) {
  const { app, state, error } = useReviewData();
  const [exercises, setExercises] = useState<{ list: Exercise[]; itemOf: Map<string, string> } | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [done, setDone] = useState<{ correct: number; total: number; xp: number; outcome: CompletionOutcome } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state || exercises) return;
    const now = Date.now();
    const rnd = seededRandom(now);
    const pool = [...state.vocab.values()];
    const itemOf = new Map<string, string>();
    if (mode === 'grammar') {
      void buildGrammarSet(app, rnd).then((list) => setExercises({ list, itemOf }));
      return;
    }
    const known = state.reviews.filter((r) => state.vocab.has(r.itemId));
    let chosen: ReviewSchedule[];
    if (mode === 'hard') chosen = known.filter((r) => isHard(r) || r.lapses > 0).slice(0, 15);
    else {
      chosen = pickDue(known, now, 15);
      // Sem nada pendente: pratica as que estão mais perto de ficar prontas.
      if (!chosen.length) chosen = [...known].sort((a, b) => a.dueAt - b.dueAt).slice(0, 10);
    }
    const list = shuffle(chosen, rnd).map((r) => {
      const ex = buildReviewExercise(state.vocab.get(r.itemId)!, pool, rnd, r.box);
      itemOf.set(ex.id, r.itemId);
      return ex;
    });
    setExercises({ list, itemOf });
  }, [state, exercises, mode, app]);

  const pctLabel = useMemo(() => (done ? Math.round((done.correct / Math.max(1, done.total)) * 100) : 0), [done]);

  if (error) return <div className="page"><p className="notice" role="alert">{error}</p></div>;
  if (!state || !exercises) return <div className="page"><p className="loading" aria-busy="true">A preparar a revisão…</p></div>;
  if (!exercises.list.length) {
    return (
      <div className="page">
        <EmptyState title={mode === 'grammar' ? 'Ainda não há exercícios de gramática para praticar.' : 'Não há palavras para rever.'}>
          <p className="muted">Conclua mais lições para ter material de revisão.</p>
          <a className="btn btn-primary" href={href.course()}>Ir para o curso</a>
        </EmptyState>
      </div>
    );
  }
  if (saving) return <div className="page"><p className="loading" aria-busy="true">A guardar…</p></div>;
  if (done) {
    return (
      <div className="page summary">
        <div className="summary-badge" aria-hidden="true"><Icon name="review" size={44} /></div>
        <h1>Revisão concluída</h1>
        <p className="lead">{encouragement(pctLabel === 100 ? 'perfect' : pctLabel >= 70 ? 'good' : 'tough', done.total)}</p>
        <dl className="stat-grid">
          <div><dt>Precisão</dt><dd>{pctLabel}%</dd></div>
          <div><dt>XP ganho</dt><dd>+{done.xp}</dd></div>
          <div><dt>Itens</dt><dd>{done.total}</dd></div>
        </dl>
        {done.outcome.newAchievements.map((a) => <p key={a.id} className="card achievement-new"><span aria-hidden="true">{a.icon}</span> <strong>{a.title}</strong> — {a.description}</p>)}
        <div className="row">
          <a className="btn btn-primary" href={href.review()}>Voltar à revisão</a>
          <a className="btn btn-secondary" href={href.home()}>Início</a>
        </div>
      </div>
    );
  }

  return (
    <ExerciseRunner title="Revisão" exercises={exercises.list}
      speechRate={app.settings.speechRate} audioEnabled={app.settings.audioEnabled} speakAnswers={app.settings.speakAnswers} lenientAccents={app.settings.lenientAccents}
      onExit={() => navigate(href.review())}
      onFinish={async (answers: RunnerAnswer[]) => {
        setSaving(true);
        const correct = answers.filter((a) => a.result.verdict !== 'incorrect').length;
        const xp = correct * XP_RULES.reviewPerCorrect + (answers.length ? XP_RULES.reviewSessionBonus : 0);
        const outcome = await recordReviewSession(
          answers.map((a) => ({
            itemId: exercises.itemOf.get(a.exercise.id) ?? a.exercise.vocabRefs[0] ?? a.exercise.id,
            verdict: a.result.verdict, answer: a.result.given, exerciseType: a.exercise.type,
          })),
          xp, startedAt, Date.now(), app.countUnits,
        );
        setDone({ correct, total: answers.length, xp, outcome });
        celebrate(outcome.newAchievements.length > 0, correct === answers.length);
        setSaving(false);
        await app.refresh();
      }} />
  );
}

/** Exercícios de gramática retirados de lições já concluídas (carrega só essas unidades). */
async function buildGrammarSet(app: AppData, rnd: () => number): Promise<Exercise[]> {
  const unitIds = [...new Set([...app.completed].map((id) => id.slice(0, id.lastIndexOf('-'))))].slice(-6);
  const bundles = await Promise.all(unitIds.map((u) => contentRepo.loadUnit(u).catch(() => null)));
  const pool = bundles.flatMap((b) => b?.lessons.filter((l) => app.completed.has(l.id)).flatMap((l) => l.exercises) ?? []).filter((e) => GRAMMAR_TYPES.has(e.type));
  return shuffle(pool, rnd).slice(0, 10);
}
