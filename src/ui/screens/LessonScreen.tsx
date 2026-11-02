import { useEffect, useMemo, useState } from 'react';
import type { PublishedLesson } from '../../domain/schemas.ts';
import { contentRepo } from '../../data/contentRepo.ts';
import { recordLessonCompletion, type CompletionOutcome } from '../../data/progressRepo.ts';
import { computeLessonStates, encouragement, lessonXp, nextLesson, orderedUnits } from '../../engine/progression.ts';
import { celebrate } from '../../services/sounds.ts';
import { canRecognizeSpeech } from '../../services/speechRecognition.ts';
import { speakingExercisesFor, withSpeaking } from '../../engine/speech.ts';
import { useAppData } from '../AppState.tsx';
import { Icon } from '../components/common.tsx';
import { Confetti, useCountUp } from '../components/Celebrate.tsx';
import { Mascot } from '../components/Mascot.tsx';
import { ExerciseRunner, type RunnerAnswer } from '../exercises/ExerciseRunner.tsx';
import { href, navigate } from '../router.ts';

/** Ao abrir a lição entra-se logo nos exercícios (sem ecrã de apresentação). */
type Phase = 'running' | 'saving' | 'done';

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const app = useAppData();
  const [lesson, setLesson] = useState<PublishedLesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('running');
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [outcome, setOutcome] = useState<{ correct: number; total: number; xp: number; seconds: number; result: CompletionOutcome } | null>(null);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLesson(null);
    setError(null);
    setPhase('running');
    setStartedAt(Date.now());
    contentRepo.loadLesson(lessonId).then((l) => alive && setLesson(l), (e: Error) => alive && setError(e.message));
    return () => { alive = false; };
  }, [lessonId]);

  const unit = useMemo(() => orderedUnits(app.index).find((u) => u.lessonIds.includes(lessonId)), [app.index, lessonId]);
  const lessonState = useMemo(() => {
    if (!unit) return 'locked';
    return computeLessonStates(unit, app.unitStates.get(unit.id) ?? 'locked', app.completed, app.settings.freeNavigation).get(lessonId) ?? 'locked';
  }, [unit, app.unitStates, app.completed, app.settings.freeNavigation, lessonId]);

  /**
   * Exercícios da lição + leitura em voz alta (se o navegador tiver reconhecimento de voz).
   * Sem internet não há microfone: o reconhecimento de voz do navegador precisa de rede.
   */
  const runExercises = useMemo(() => {
    if (!lesson) return [];
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (!app.settings.speakingExercises || offline || !canRecognizeSpeech()) return lesson.exercises;
    return withSpeaking(lesson.exercises, speakingExercisesFor(lesson));
  }, [lesson, app.settings.speakingExercises]);

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
      <ExerciseRunner key={runKey} title={lesson.title} exercises={runExercises}
        speechRate={app.settings.speechRate} audioEnabled={app.settings.audioEnabled} speakAnswers={app.settings.speakAnswers} lenientAccents={app.settings.lenientAccents}
        onExit={() => navigate(href.home())}
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
            celebrate(result.newAchievements.length > 0, correct === answers.length);
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
        <Confetti count={acc === 1 ? 48 : 28} />
        <div className="summary-hero" aria-hidden="true">
          <Mascot size={110} mood="cheer" />
          <div className="summary-badge"><Icon name="star" size={44} /></div>
        </div>
        <h1>Lição concluída!</h1>
        <p className="lead">{msg}</p>
        <SummaryStats acc={acc} xp={outcome.xp} minutes={Math.max(1, Math.round(outcome.seconds / 60))} />
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

  return null;
}

/** Números do resumo, a subir até ao valor final. */
function SummaryStats({ acc, xp, minutes }: { acc: number; xp: number; minutes: number }) {
  const pct = useCountUp(Math.round(acc * 100));
  const xpShown = useCountUp(xp);
  return (
    <dl className="stat-grid">
      <div><dt>Precisão</dt><dd>{pct}%</dd></div>
      <div><dt>XP ganho</dt><dd>+{xpShown}</dd></div>
      <div><dt>Tempo</dt><dd>{minutes} min</dd></div>
    </dl>
  );
}
