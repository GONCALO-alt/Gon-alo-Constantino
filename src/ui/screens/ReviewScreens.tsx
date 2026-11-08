import { useEffect, useMemo, useState } from 'react';
import type { Exercise } from '../../domain/schemas.ts';
import type { ReviewSchedule } from '../../domain/progress.ts';
import { contentRepo } from '../../data/contentRepo.ts';
import { getAllAttempts, getAllReviews, recordReviewSession, type CompletionOutcome } from '../../data/progressRepo.ts';
import { openMistakes, reviewItemOf, type OpenMistake } from '../../engine/mistakes.ts';
import { withIntroExercises } from '../../engine/teach.ts';
import { encouragement, XP_RULES } from '../../engine/progression.ts';
import { buildReviewExercise, knownPool, seededRandom, shuffle, type ReviewVocab } from '../../engine/session.ts';
import { isDue, isHard, isMastered, pickDue, wordStatus, type WordStatus } from '../../engine/srs.ts';
import { celebrate } from '../../services/sounds.ts';
import { useAppData, type AppData } from '../AppState.tsx';
import { Card, EmptyState, Icon, SpeakButton } from '../components/common.tsx';
import { ExerciseRunner, type RunnerAnswer } from '../exercises/ExerciseRunner.tsx';
import { href, navigate, type ReviewMode } from '../router.ts';

/** Carrega o vocabulário das secções com conteúdo publicado. */
async function loadVocabMap(_index: AppData['index']): Promise<Map<string, ReviewVocab>> {
  const map = new Map<string, ReviewVocab>();
  for (const it of await contentRepo.loadAllVocab()) map.set(it.id, it);
  return map;
}

function useReviewData() {
  const app = useAppData();
  const [state, setState] = useState<{ reviews: ReviewSchedule[]; vocab: Map<string, ReviewVocab>; mistakes: OpenMistake[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([getAllReviews(), loadVocabMap(app.index), getAllAttempts()])
      .then(([reviews, vocab, attempts]) => setState({ reviews, vocab, mistakes: openMistakes(attempts) }), (e: Error) => setError(e.message));
  }, [app.index, app.profile.totalXp]);
  return { app, state, error };
}

export function ReviewScreen() {
  const { app, state, error } = useReviewData();
  if (error) return <div className="page"><p className="notice" role="alert">{error}</p></div>;
  if (!state) return <div className="page"><p className="loading" aria-busy="true">A carregar…</p></div>;
  const now = Date.now();
  const { reviews, vocab, mistakes } = state;
  const due = reviews.filter((r) => isDue(r, now));
  const hard = reviews.filter(isHard);
  const forgotten = reviews.filter((r) => r.lapses > 0);
  const mastered = reviews.filter(isMastered).length;
  const unitOf = (lessonId: string | null) => {
    if (!lessonId) return null;
    for (const sec of app.index.sections) for (const u of sec.units) if (u.lessonIds.includes(lessonId)) return `Secção ${sec.order} · Unidade ${u.order}`;
    return null;
  };
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
      <div className="row wrap review-extra">
        <a className={`btn btn-go ${mistakes.length ? '' : 'disabled'}`} aria-disabled={!mistakes.length} href={mistakes.length ? href.reviewSession('mistakes') : undefined}>
          Treinar os meus erros ({mistakes.length})
        </a>
        <a className="btn btn-secondary" href={href.dictionary()}>★ O meu dicionário ({app.savedWords.size})</a>
        <a className="btn btn-secondary" href={href.search()}><Icon name="search" size={18} /> Pesquisar</a>
      </div>
      <MyWords reviews={reviews} vocab={vocab} />
      <Card>
        <h2>Os meus erros</h2>
        <p className="muted small">Exercícios em que a última resposta foi errada. Quando acertar, saem da lista.</p>
        {mistakes.length ? (
          <ul className="error-list">
            {mistakes.slice(0, 20).map((m) => {
              const item = reviewItemOf(m.exerciseId);
              const v = item ? vocab.get(item) : undefined;
              return (
                <li key={m.exerciseId}>
                  <span className="muted small">{v ? 'Revisão' : unitOf(m.lessonId) ?? 'Lição'} · {exerciseTypeLabel(m.exerciseType)}</span>
                  {v && <span> — {word(v.id)}</span>}
                  {m.answer && <span> — respondeu «<span lang="nl">{m.answer}</span>»</span>}
                </li>
              );
            })}
          </ul>
        ) : <p className="muted small">Não há erros por treinar. Muito bem!</p>}
      </Card>
    </div>
  );
}


const STATUS_TABS: { id: WordStatus; label: string; empty: string }[] = [
  { id: 'hard', label: 'Difíceis', empty: 'Nenhuma palavra difícil por agora.' },
  { id: 'learning', label: 'A aprender', empty: 'Nenhuma palavra em aprendizagem.' },
  { id: 'mastered', label: 'Já sei', empty: 'Ainda nenhuma palavra bem consolidada. Continue a rever!' },
];

/** «As minhas palavras»: cada palavra com o estado (difícil / a aprender / já sei) e os acertos e erros. */
function MyWords({ reviews, vocab }: { reviews: ReviewSchedule[]; vocab: Map<string, ReviewVocab> }) {
  const { settings } = useAppData();
  const known = reviews.filter((r) => vocab.has(r.itemId));
  const groups = new Map<WordStatus, ReviewSchedule[]>(STATUS_TABS.map((t) => [t.id, []]));
  for (const r of known) groups.get(wordStatus(r))!.push(r);
  groups.get('hard')!.sort((a, b) => b.incorrect + b.lapses - (a.incorrect + a.lapses));
  groups.get('learning')!.sort((a, b) => a.dueAt - b.dueAt);
  groups.get('mastered')!.sort((a, b) => b.correct - a.correct);
  const [tab, setTab] = useState<WordStatus>(() => (groups.get('hard')!.length ? 'hard' : 'learning'));
  const [limit, setLimit] = useState(30);
  const list = groups.get(tab)!;
  return (
    <Card>
      <h2>As minhas palavras</h2>
      <p className="muted small">Cada resposta conta: as palavras com mais erros voltam mais vezes, também dentro das lições.</p>
      <div className="word-tabs" role="tablist" aria-label="Estado das palavras">
        {STATUS_TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`word-tab tab-${t.id} ${tab === t.id ? 'on' : ''}`}
            onClick={() => { setTab(t.id); setLimit(30); }}>
            {t.label} <span className="word-tab-n">{groups.get(t.id)!.length}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? <p className="muted small">{STATUS_TABS.find((t) => t.id === tab)!.empty}</p> : (
        <ul className="word-status-list" role="tabpanel">
          {list.slice(0, limit).map((r) => {
            const v = vocab.get(r.itemId)!;
            const head = `${v.article ? `${v.article} ` : ''}${v.nl}`;
            return (
              <li key={r.itemId}>
                {settings.audioEnabled && <SpeakButton text={head} rate={settings.speechRate} />}
                <span className="ws-word"><strong lang="nl">{head}</strong> <span className="muted">— {v.pt[0]}</span></span>
                <span className="ws-counts" aria-label={`${r.correct} certas, ${r.incorrect} erradas`}>
                  <span className="ws-ok">✓ {r.correct}</span> <span className="ws-bad">✗ {r.incorrect}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {list.length > limit && <button type="button" className="link-btn" onClick={() => setLimit((l) => l + 50)}>Mostrar mais ({list.length - limit})</button>}
    </Card>
  );
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

export function ReviewSessionScreen({ mode }: { mode: ReviewMode }) {
  const { app, state, error } = useReviewData();
  /** Para cada exercício: o item da revisão espaçada e, no treino dos erros, o exercício original. */
  const [exercises, setExercises] = useState<{ list: Exercise[]; itemOf: Map<string, string>; origin: Map<string, { exerciseId: string; lessonId: string | null }> } | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [done, setDone] = useState<{ correct: number; total: number; xp: number; outcome: CompletionOutcome } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state || exercises) return;
    const now = Date.now();
    const rnd = seededRandom(now);
    // Opções erradas: só palavras que o aluno já conhece.
    const pool = knownPool([...state.vocab.values()], new Set(state.reviews.map((r) => r.itemId)));
    const itemOf = new Map<string, string>();
    const origin = new Map<string, { exerciseId: string; lessonId: string | null }>();
    if (mode === 'grammar') {
      void buildGrammarSet(app, rnd).then((list) => setExercises({ list, itemOf, origin }));
      return;
    }
    if (mode === 'mistakes') {
      void buildMistakeSet(state.mistakes, state.vocab, pool, state.reviews, rnd).then(({ list, items, origins }) => {
        for (const [k, v] of items) itemOf.set(k, v);
        for (const [k, v] of origins) origin.set(k, v);
        setExercises({ list, itemOf, origin });
      });
      return;
    }
    if (mode === 'saved') {
      const boxes = new Map(state.reviews.map((r) => [r.itemId, r.box]));
      const words = shuffle([...app.savedWords].filter((id) => state.vocab.has(id)), rnd).slice(0, 15);
      const list = words.map((id) => {
        const ex = buildReviewExercise(state.vocab.get(id)!, pool, rnd, boxes.get(id) ?? 0);
        itemOf.set(ex.id, id);
        return ex;
      });
      setExercises({ list, itemOf, origin });
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
    setExercises({ list, itemOf, origin });
  }, [state, exercises, mode, app]);

  const pctLabel = useMemo(() => (done ? Math.round((done.correct / Math.max(1, done.total)) * 100) : 0), [done]);

  if (error) return <div className="page"><p className="notice" role="alert">{error}</p></div>;
  if (!state || !exercises) return <div className="page"><p className="loading" aria-busy="true">A preparar a revisão…</p></div>;
  if (!exercises.list.length) {
    return (
      <div className="page">
        <EmptyState title={mode === 'grammar' ? 'Ainda não há exercícios de gramática para praticar.'
          : mode === 'mistakes' ? 'Não há erros por treinar. Muito bem!'
          : mode === 'saved' ? 'Ainda não guardou palavras no seu dicionário.' : 'Não há palavras para rever.'}>
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
    <ExerciseRunner title="Revisão" exercises={withIntroExercises(
      exercises.list,
      app.settings.introNewWords === false ? [] : state.reviews.filter((r) => r.correct === 0).map((r) => state.vocab.get(r.itemId)).filter((v): v is ReviewVocab => !!v),
    )}
      speechRate={app.settings.speechRate} audioEnabled={app.settings.audioEnabled} speakAnswers={app.settings.speakAnswers} lenientAccents={app.settings.lenientAccents}
      onExit={() => navigate(href.review())}
      onFinish={async (answers: RunnerAnswer[]) => {
        setSaving(true);
        const correct = answers.filter((a) => a.result.verdict !== 'incorrect').length;
        const xp = correct * XP_RULES.reviewPerCorrect + (answers.length ? XP_RULES.reviewSessionBonus : 0);
        const outcome = await recordReviewSession(
          answers.map((a) => ({
            itemId: exercises.itemOf.get(a.exercise.id) ?? a.exercise.vocabRefs[0] ?? a.exercise.id,
            ...exercises.origin.get(a.exercise.id),
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

/**
 * Treino dos erros: os exercícios originais das lições (com o mesmo ID, para que, ao acertar,
 * saiam da lista) e, para os erros da revisão, um exercício novo com a mesma palavra.
 */
async function buildMistakeSet(
  mistakes: OpenMistake[], vocab: Map<string, ReviewVocab>, pool: ReviewVocab[], reviews: ReviewSchedule[], rnd: () => number,
): Promise<{ list: Exercise[]; items: Map<string, string>; origins: Map<string, { exerciseId: string; lessonId: string | null }> }> {
  const items = new Map<string, string>();
  const origins = new Map<string, { exerciseId: string; lessonId: string | null }>();
  const boxes = new Map(reviews.map((r) => [r.itemId, r.box]));
  const list: Exercise[] = [];
  for (const m of mistakes.slice(0, 30)) {
    if (list.length >= 15) break;
    const vocabId = reviewItemOf(m.exerciseId);
    if (vocabId) {
      const v = vocab.get(vocabId);
      if (!v) continue;
      const ex = buildReviewExercise(v, pool, rnd, boxes.get(vocabId) ?? 0);
      items.set(ex.id, vocabId);
      origins.set(ex.id, { exerciseId: m.exerciseId, lessonId: null });
      list.push(ex);
      continue;
    }
    if (!m.lessonId) continue;
    const lesson = await contentRepo.loadLesson(m.lessonId).catch(() => null);
    const ex = lesson?.exercises.find((e) => e.id === m.exerciseId);
    if (!ex || list.some((x) => x.id === ex.id)) continue;
    origins.set(ex.id, { exerciseId: ex.id, lessonId: m.lessonId });
    list.push(ex);
  }
  return { list: shuffle(list, rnd), items, origins };
}
