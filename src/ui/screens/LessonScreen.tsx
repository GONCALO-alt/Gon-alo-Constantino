import { useEffect, useMemo, useState } from 'react';
import type { PublishedLesson } from '../../domain/schemas.ts';
import { contentRepo } from '../../data/contentRepo.ts';
import { recordLessonCompletion, type CompletionOutcome } from '../../data/progressRepo.ts';
import { computeLessonStates, encouragement, lessonXp, nextLesson, orderedUnits } from '../../engine/progression.ts';
import { celebrate } from '../../services/sounds.ts';
import { useAppData } from '../AppState.tsx';
import { Icon, RichText, SpeakButton } from '../components/common.tsx';
import { ExerciseRunner, type RunnerAnswer } from '../exercises/ExerciseRunner.tsx';
import { href, navigate } from '../router.ts';

type Phase = 'intro' | 'running' | 'saving' | 'done';

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const app = useAppData();
  const [lesson, setLesson] = useState<PublishedLesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [startedAt, setStartedAt] = useState(0);
  const [outcome, setOutcome] = useState<{ correct: number; total: number; xp: number; seconds: number; result: CompletionOutcome } | null>(null);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLesson(null);
    setError(null);
    setPhase('intro');
    contentRepo.loadLesson(lessonId).then((l) => alive && setLesson(l), (e: Error) => alive && setError(e.message));
    return () => { alive = false; };
  }, [lessonId]);

  const unit = useMemo(() => orderedUnits(app.index).find((u) => u.lessonIds.includes(lessonId)), [app.index, lessonId]);
  const lessonState = useMemo(() => {
    if (!unit) return 'locked';
    return computeLessonStates(unit, app.unitStates.get(unit.id) ?? 'locked', app.completed, app.settings.freeNavigation).get(lessonId) ?? 'locked';
  }, [unit, app.unitStates, app.completed, app.settings.freeNavigation, lessonId]);

  if (error) {
    return (
      <div className="page">
        <p className="notice" role="alert">{error}</p>
        <a className="btn btn-secondary" href={href.course()}>Voltar ao mapa do curso</a>
      </div>
    );
  }
  if (!lesson || !unit) return <div className="page"><p className="loading" aria-busy="true">A carregar a lição…</p></div>;

  if (lessonState === 'locked') {
    return (
      <div className="page">
        <h1>{lesson.title}</h1>
        <p className="notice"><Icon name="lock" size={18} /> Esta lição ainda está bloqueada. Conclua as lições anteriores primeiro (ou ative a navegação livre nas Definições).</p>
        <a className="btn btn-secondary" href={href.course(unit.sectionId)}>Ver o mapa do curso</a>
      </div>
    );
  }

  if (phase === 'running') {
    return (
      <ExerciseRunner key={runKey} title={lesson.title} exercises={lesson.exercises}
        speechRate={app.settings.speechRate} audioEnabled={app.settings.audioEnabled} speakAnswers={app.settings.speakAnswers} lenientAccents={app.settings.lenientAccents}
        onExit={() => navigate(href.course(unit.sectionId))}
        onFinish={async (answers: RunnerAnswer[]) => {
          setPhase('saving');
          const endedAt = Date.now();
          const correct = answers.filter((a) => a.result.verdict !== 'incorrect').length;
          const isRepeat = app.completed.has(lesson.id);
          const xp = lessonXp(correct, answers.length, isRepeat);
          try {
            const result = await recordLessonCompletion({
              lessonId: lesson.id, unitId: unit.id, contentVersion: lesson.version, difficulty: lesson.difficulty,
              answers: answers.map((a) => ({ exerciseId: a.exercise.id, exerciseType: a.exercise.type, verdict: a.result.verdict, answer: a.result.given, vocabRefs: a.exercise.vocabRefs })),
              newVocabIds: lesson.newVocabulary.map((v) => v.id), xp, startedAt, endedAt,
            }, app.countUnits);
            setOutcome({ correct, total: answers.length, xp, seconds: Math.round((endedAt - startedAt) / 1000), result });
            setPhase('done');
            celebrate(result.newAchievements.length > 0);
            await app.refresh();
          } catch (e) {
            setError(`Não foi possível guardar o progresso: ${(e as Error).message}`);
          }
        }} />
    );
  }

  if (phase === 'saving') return <div className="page"><p className="loading" aria-busy="true">A guardar o progresso…</p></div>;

  if (phase === 'done' && outcome) {
    const acc = outcome.total ? outcome.correct / outcome.total : 1;
    const msg = encouragement(acc === 1 ? 'perfect' : acc >= 0.7 ? 'good' : 'tough', outcome.seconds);
    const upcoming = nextLesson(app.index, app.completed, app.settings.freeNavigation);
    return (
      <div className="page summary">
        <div className="summary-badge" aria-hidden="true"><Icon name="star" size={44} /></div>
        <h1>Lição concluída!</h1>
        <p className="lead">{msg}</p>
        <dl className="stat-grid">
          <div><dt>Precisão</dt><dd>{Math.round(acc * 100)}%</dd></div>
          <div><dt>XP ganho</dt><dd>+{outcome.xp}</dd></div>
          <div><dt>Tempo</dt><dd>{Math.max(1, Math.round(outcome.seconds / 60))} min</dd></div>
        </dl>
        {outcome.result.isRepeat && <p className="muted small">Repetir lições dá menos XP, mas ajuda a consolidar.</p>}
        {lesson.newVocabulary.length > 0 && (
          <section className="card">
            <h2>Palavras desta lição</h2>
            <ul className="word-list">
              {lesson.newVocabulary.map((v) => (
                <li key={v.id}><span lang="nl"><strong>{v.article ? `${v.article} ` : ''}{v.nl}</strong></span> — {v.pt.join(', ')}</li>
              ))}
            </ul>
            <p className="muted small">Estas palavras foram acrescentadas à sua revisão espaçada.</p>
          </section>
        )}
        {outcome.result.newAchievements.length > 0 && (
          <section className="card achievement-new" aria-live="polite">
            <h2>Nova conquista</h2>
            {outcome.result.newAchievements.map((a) => <p key={a.id}><span aria-hidden="true">{a.icon}</span> <strong>{a.title}</strong> — {a.description}</p>)}
          </section>
        )}
        <div className="row">
          {upcoming && upcoming.lessonId !== lesson.id ? (
            <a className="btn btn-primary" href={href.lesson(upcoming.lessonId)}>Próxima lição <Icon name="arrow" size={18} /></a>
          ) : null}
          <a className="btn btn-secondary" href={href.course(unit.sectionId)}>Mapa do curso</a>
          <button type="button" className="btn btn-secondary" onClick={() => { setRunKey((k) => k + 1); setStartedAt(Date.now()); setPhase('running'); }}>Repetir</button>
        </div>
      </div>
    );
  }

  // Introdução
  return (
    <div className="page lesson-intro">
      <a className="back-link" href={href.course(unit.sectionId)}><Icon name="back" size={18} /> {unit.title}</a>
      <p className="eyebrow">Lição {lesson.order} · {lesson.cefr} · ~{lesson.estimatedMinutes} min</p>
      <h1>{lesson.title}</h1>
      <p className="lead">{lesson.description}</p>
      <section className="card">
        <h2>Objetivos</h2>
        <ul>{lesson.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
      </section>
      {lesson.newVocabulary.length > 0 && (
        <section className="card">
          <h2>Palavras novas</h2>
          <ul className="word-list">
            {lesson.newVocabulary.map((v) => (
              <li key={v.id}>
                {app.settings.audioEnabled && <SpeakButton text={v.article ? `${v.article} ${v.nl}` : v.nl} rate={app.settings.speechRate} audio={v.audio} />}
                <span lang="nl"><strong>{v.article ? `${v.article} ` : ''}{v.nl}</strong></span> — {v.pt.join(', ')}
                {v.note && <span className="muted small block">{v.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {lesson.grammar.map((g) => (
        <section key={g.id} className="card grammar">
          <h2>{g.title}</h2>
          <p><RichText text={g.body} /></p>
          {g.examples.length > 0 && (
            <ul className="examples">{g.examples.map((e, i) => <li key={i}><span lang="nl">{e.nl}</span> <span className="muted">— {e.pt}</span></li>)}</ul>
          )}
          {g.contrastWithPt && <p className="contrast"><strong>Comparação com o português:</strong> {g.contrastWithPt}</p>}
        </section>
      ))}
      <section className="card">
        <h2>Exemplos</h2>
        <ul className="examples">
          {lesson.examples.map((e, i) => (
            <li key={i}>
              {app.settings.audioEnabled && <SpeakButton text={e.nl} rate={app.settings.speechRate} />}
              <span lang="nl">{e.nl}</span> <span className="muted">— {e.pt}</span>
              {e.note && <span className="muted small block">{e.note}</span>}
            </li>
          ))}
        </ul>
      </section>
      <div className="sticky-cta">
        <button type="button" className="btn btn-primary btn-wide" onClick={() => { setStartedAt(Date.now()); setPhase('running'); }}>
          {app.completed.has(lesson.id) ? 'Rever lição' : 'Começar'} · {lesson.exercises.length} exercícios
        </button>
      </div>
    </div>
  );
}
