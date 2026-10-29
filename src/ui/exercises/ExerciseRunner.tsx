/**
 * Executa uma sequência de exercícios: mostra o exercício, verifica a resposta,
 * dá feedback imediato com explicação e repete os errados no fim (uma vez).
 * Usado tanto pelas lições como pelas sessões de revisão.
 */
import { useEffect, useRef, useState } from 'react';
import type { Exercise } from '../../domain/schemas.ts';
import { gradeExercise, needsSelfAssessment, type ExerciseResponse, type ExerciseResult } from '../../engine/grading.ts';
import { expandAnswerPattern } from '../../engine/answers.ts';
import { advance, answer, currentExercise, isFinished, progressFraction, startSession, type SessionState } from '../../engine/session.ts';
import { Icon, ProgressBar, RichText } from '../components/common.tsx';
import { ExerciseView } from './ExerciseView.tsx';

export interface RunnerAnswer {
  exercise: Exercise;
  result: ExerciseResult;
}

export interface RunnerProps {
  exercises: Exercise[];
  speechRate: number;
  audioEnabled: boolean;
  lenientAccents: boolean;
  onFinish: (firstAttempts: RunnerAnswer[], skipped: string[]) => void;
  onExit: () => void;
  title: string;
}

const VERDICT_TEXT = {
  correct: ['Certo!', 'Muito bem!', 'Exatamente!', 'Correto!'],
  almost: ['Quase!', 'Aceite, com um reparo.'],
  incorrect: ['Ainda não.', 'Não é bem assim.', 'Resposta incorreta.'],
} as const;

export function ExerciseRunner({ exercises, speechRate, audioEnabled, lenientAccents, onFinish, onExit, title }: RunnerProps) {
  const [session, setSession] = useState<SessionState>(() => startSession(exercises));
  const [response, setResponse] = useState<ExerciseResponse | null>(null);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [selfCheck, setSelfCheck] = useState<string | null>(null);
  const firstAttempts = useRef(new Map<string, RunnerAnswer>());
  const skipped = useRef<string[]>([]);
  const continueRef = useRef<HTMLButtonElement>(null);
  const ex = currentExercise(session);
  const opts = { lenientAccents };

  useEffect(() => {
    if (result) continueRef.current?.focus();
  }, [result]);

  useEffect(() => {
    if (isFinished(session)) onFinish([...firstAttempts.current.values()], skipped.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!ex) return null;

  const finalize = (r: ExerciseResult) => {
    setResult(r);
    if (!firstAttempts.current.has(ex.id)) firstAttempts.current.set(ex.id, { exercise: ex, result: r });
    setSession((s) => answer(s, r.verdict));
  };

  const check = () => {
    if (!response || result) return;
    if (ex.type === 'shortWriting' && response.kind === 'text' && needsSelfAssessment(ex, response.value, opts)) {
      setSelfCheck(response.value);
      return;
    }
    finalize(gradeExercise(ex, response, opts));
  };

  const next = () => {
    setResult(null);
    setResponse(null);
    setSelfCheck(null);
    setSession((s) => advance(s));
  };

  const skip = () => {
    skipped.current.push(ex.id);
    next();
  };

  const verdictText = result ? VERDICT_TEXT[result.verdict][session.position % VERDICT_TEXT[result.verdict].length] : '';
  const isRetry = session.position >= exercises.length;

  return (
    <div className="runner">
      <header className="runner-header">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Sair (o progresso desta lição não é guardado)">
          <Icon name="close" />
        </button>
        <ProgressBar value={progressFraction(session)} label={`Progresso em ${title}`} />
      </header>

      <main className="runner-body" id="conteudo">
        {isRetry && <p className="retry-tag">Vamos rever este outra vez</p>}
        <h1 className="instruction">{ex.instruction}</h1>
        <ExerciseView key={`${ex.id}-${session.position}`} exercise={ex} locked={!!result || !!selfCheck}
          onResponse={setResponse} onSubmit={check} onSkip={skip}
          speechRate={speechRate} audioEnabled={audioEnabled} />
      </main>

      <footer className={`runner-footer ${result ? `fb-${result.verdict}` : ''}`}>
        <div className="footer-inner">
          {selfCheck !== null && !result && ex.type === 'shortWriting' && (
            <div className="selfcheck" role="region" aria-label="Autoavaliação">
              <p><strong>A sua resposta é diferente da resposta-modelo — isso não quer dizer que esteja errada.</strong></p>
              <p className="muted small">Resposta-modelo:</p>
              <p className="model" lang="nl">{expandAnswerPattern(ex.referenceAnswers[0]!)[0]}</p>
              <p className="muted small">Confirme com a lista:</p>
              <ul>{ex.checklist.map((c, i) => <li key={i}><RichText text={c} /></li>)}</ul>
              <div className="row">
                <button type="button" className="btn btn-ok" onClick={() => finalize(gradeExercise(ex, { kind: 'self', text: selfCheck, ok: true }, opts))}>A minha resposta está correta</button>
                <button type="button" className="btn btn-secondary" onClick={() => finalize(gradeExercise(ex, { kind: 'self', text: selfCheck, ok: false }, opts))}>Tinha erros</button>
              </div>
            </div>
          )}

          {result && (
            <div className="feedback" role="status" aria-live="assertive">
              <p className="verdict">
                <Icon name={result.verdict === 'incorrect' ? 'close' : 'check'} size={26} /> {verdictText}
              </p>
              {result.verdict !== 'correct' && (
                <p className="expected">
                  <span className="muted small">{ex.type === 'shortWriting' ? 'Resposta-modelo:' : 'Resposta certa:'}</span>{' '}
                  <span lang="nl">{result.expected}</span>
                </p>
              )}
              {result.note && <p className="note">{result.note}</p>}
              {result.optionFeedback && <p className="note">{result.optionFeedback}</p>}
              <p className="explanation"><RichText text={ex.explanation} /></p>
            </div>
          )}

          {selfCheck === null && (
            result ? (
              <button ref={continueRef} type="button" className="btn btn-primary btn-wide" onClick={next}>Continuar</button>
            ) : (
              <button type="button" className="btn btn-primary btn-wide" disabled={!response} onClick={check}>Verificar</button>
            )
          )}
          {selfCheck !== null && result && (
            <button ref={continueRef} type="button" className="btn btn-primary btn-wide" onClick={next}>Continuar</button>
          )}
        </div>
      </footer>
    </div>
  );
}
