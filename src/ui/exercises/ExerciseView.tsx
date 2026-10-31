/**
 * Apresentação dos exercícios. Cada componente apenas RECOLHE a resposta e
 * comunica-a com `onResponse` (null = ainda incompleta). A correção é feita
 * fora (engine/grading.ts), o que permite testá-la sem interface.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AnswerOption, Exercise, ExerciseOf } from '../../domain/schemas.ts';
import type { ExerciseResponse } from '../../engine/grading.ts';
import { joinTokens } from '../../engine/answers.ts';
import { seededRandom, shuffle } from '../../engine/session.ts';
import { canSpeak, hasDutchVoice, speak } from '../../services/speech.ts';
import { playSound } from '../../services/sounds.ts';
import { Icon, RichText, SpeakButton } from '../components/common.tsx';
import { GlossText } from '../components/Gloss.tsx';
import { gradeSpeech, type SpeechWord } from '../../engine/speech.ts';
import { canRecognizeSpeech, listenOnce, RecognitionError, RECOGNITION_ERROR_TEXT, type RecognitionHandle } from '../../services/speechRecognition.ts';

export interface ExerciseProps<E extends Exercise = Exercise> {
  exercise: E;
  /** Depois de verificar, a resposta fica bloqueada. */
  locked: boolean;
  onResponse: (r: ExerciseResponse | null) => void;
  /** Pedido para verificar (Enter). */
  onSubmit: () => void;
  /** Saltar sem penalização (ex.: sem áudio). */
  onSkip: () => void;
  speechRate: number;
  audioEnabled: boolean;
}

/** Semente estável por exercício: a ordem baralhada não muda a cada renderização. */
function seedOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0;
  return h;
}

export function ExerciseView(props: ExerciseProps) {
  const ex = props.exercise;
  switch (ex.type) {
    case 'translate':
      return ex.wordBank ? <TokenExercise {...props} prompt={ex.prompt} tokens={ex.wordBank} speakPrompt={ex.direction === 'nl-pt'} /> : <TranslateText {...props} exercise={ex} />;
    case 'buildSentence':
      return <TokenExercise {...props} prompt={ex.prompt} tokens={ex.tokens} speakPrompt={false} />;
    case 'wordOrder':
      return <TokenExercise {...props} prompt={ex.translation} tokens={ex.tokens} speakPrompt={false} />;
    case 'multipleChoice':
      return <OptionsExercise {...props} prompt={<p className="prompt">{ex.prompt}</p>} options={ex.options} />;
    case 'expression':
      return (
        <OptionsExercise {...props} options={ex.options}
          prompt={<>
            <p className="prompt-nl"><SpeakIf {...props} text={ex.expression} /> <GlossText text={ex.expression} /></p>
            {ex.literal && <p className="muted">À letra: «{ex.literal}»</p>}
            <p className="prompt">{ex.prompt}</p>
          </>} />
      );
    case 'dialogue':
      return <DialogueExercise {...props} exercise={ex} />;
    case 'fillBlank':
      return <FillBlankExercise {...props} exercise={ex} />;
    case 'articleChoice':
      return (
        <OptionsExercise {...props} shuffleOptions={false}
          prompt={<p className="prompt-nl">___ {ex.noun} <span className="muted">({ex.pt})</span></p>}
          options={[{ id: 'de', text: 'de', correct: ex.article === 'de' }, { id: 'het', text: 'het', correct: ex.article === 'het' }]} />
      );
    case 'conjugation':
      return <ConjugationExercise {...props} exercise={ex} />;
    case 'match':
      return <MatchExercise {...props} exercise={ex} />;
    case 'findError':
      return <FindErrorExercise {...props} exercise={ex} />;
    case 'comprehension':
      return <ComprehensionExercise {...props} exercise={ex} />;
    case 'speaking':
      return <SpeakingExercise {...props} exercise={ex} />;
    case 'listening':
      return <ListeningExercise {...props} exercise={ex} />;
    case 'shortWriting':
      return <WritingExercise {...props} exercise={ex} />;
  }
}

function SpeakIf({ text, speechRate, audioEnabled, audio }: { text: string; speechRate: number; audioEnabled: boolean; audio?: string }) {
  if (!audioEnabled) return null;
  return <SpeakButton text={text} rate={speechRate} audio={audio} />;
}

// ---------------------------------------------------------------------------
// Texto livre
// ---------------------------------------------------------------------------
const NL_CHARS = ['é', 'ë', 'è', 'ï', 'ö', 'ü', "'"];
const PT_CHARS = ['á', 'à', 'â', 'ã', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'];

function TextAnswer({ locked, onResponse, onSubmit, lang, label, multiline = false, placeholder }: {
  locked: boolean; onResponse: (r: ExerciseResponse | null) => void; onSubmit: () => void;
  lang: 'nl' | 'pt'; label: string; multiline?: boolean; placeholder?: string;
}) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const update = (v: string) => {
    setValue(v);
    onResponse(v.trim() ? { kind: 'text', value: v } : null);
  };
  const insert = (c: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    update(value.slice(0, start) + c + value.slice(end));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(start + c.length, start + c.length); });
  };
  const common = {
    ref, value, disabled: locked, lang: lang === 'nl' ? 'nl-NL' : 'pt-PT', 'aria-label': label, placeholder: placeholder ?? 'Escreva aqui…',
    autoComplete: 'off', autoCorrect: 'off', autoCapitalize: 'off', spellCheck: false, className: 'text-input',
  } as const;
  return (
    <div className="text-answer">
      {multiline ? (
        <textarea {...common} rows={3} enterKeyHint="done" onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); } }} />
      ) : (
        <input {...common} type="text" enterKeyHint="done" onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit(); } }} />
      )}
      {!locked && (
        <div className="char-row" aria-label="Caracteres especiais">
          {(lang === 'nl' ? NL_CHARS : PT_CHARS).map((c) => (
            <button key={c} type="button" className="char-btn" onClick={() => insert(c)} aria-label={`Inserir ${c}`}>{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function TranslateText(props: ExerciseProps<ExerciseOf<'translate'>>) {
  const ex = props.exercise;
  const fromNl = ex.direction === 'nl-pt';
  return (
    <div className="exercise">
      <p className={fromNl ? 'prompt-nl' : 'prompt'}>{fromNl && <SpeakIf {...props} text={ex.prompt} />} {fromNl ? <GlossText text={ex.prompt} /> : ex.prompt}</p>
      <TextAnswer {...props} lang={fromNl ? 'pt' : 'nl'} label={fromNl ? 'Tradução em português' : 'Tradução em neerlandês'} />
    </div>
  );
}

function ConjugationExercise(props: ExerciseProps<ExerciseOf<'conjugation'>>) {
  const ex = props.exercise;
  return (
    <div className="exercise">
      <p className="muted">Verbo <strong lang="nl">{ex.verb}</strong> · {ex.pronoun} · {ex.tense.replace('-', ' ')}</p>
      {ex.sentence && <p className="prompt-nl" lang="nl"><GlossText text={ex.sentence} /></p>}
      <TextAnswer {...props} lang="nl" label={`Forma de ${ex.verb} para ${ex.pronoun}`} placeholder="Forma do verbo…" />
    </div>
  );
}

function FillBlankExercise(props: ExerciseProps<ExerciseOf<'fillBlank'>>) {
  const ex = props.exercise;
  const [before, after] = ex.sentence.split('___') as [string, string];
  const sentence = (
    <>
      <p className="prompt-nl" lang="nl"><GlossText text={before} /><span className="blank" aria-label="espaço em branco">____</span><GlossText text={after} /></p>
      {ex.translation && <p className="muted">{ex.translation}</p>}
    </>
  );
  if (ex.choices) {
    const options = ex.choices.map((c, i) => ({ id: 'abcdef'[i]!, text: c, correct: false }));
    return <OptionsExercise {...props} prompt={sentence} options={options} textResponse />;
  }
  return (
    <div className="exercise">
      {sentence}
      <TextAnswer {...props} lang="nl" label="Palavra em falta" placeholder="Palavra em falta…" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Escolhas
// ---------------------------------------------------------------------------
function OptionsExercise({ exercise, locked, onResponse, prompt, options, shuffleOptions = true, textResponse = false }: ExerciseProps & {
  prompt: React.ReactNode; options: AnswerOption[]; shuffleOptions?: boolean; textResponse?: boolean;
}) {
  const ordered = useMemo(() => (shuffleOptions ? shuffle(options, seededRandom(seedOf(exercise.id))) : options), [exercise.id, options, shuffleOptions]);
  const [selected, setSelected] = useState<string | null>(null);
  const choose = (o: AnswerOption) => {
    if (locked) return;
    setSelected(o.id);
    onResponse(textResponse ? { kind: 'text', value: o.text } : { kind: 'option', id: o.id });
  };
  return (
    <div className="exercise">
      {prompt}
      <div role="radiogroup" aria-label="Opções de resposta" className="options">
        {ordered.map((o, i) => (
          <button key={o.id} type="button" role="radio" aria-checked={selected === o.id} disabled={locked}
            className={`option ${selected === o.id ? 'selected' : ''}`} onClick={() => choose(o)}>
            <span className="option-key" aria-hidden="true">{i + 1}</span>
            <span lang={exercise.type === 'multipleChoice' || exercise.type === 'expression' ? undefined : 'nl'}>{o.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DialogueExercise(props: ExerciseProps<ExerciseOf<'dialogue'>>) {
  const ex = props.exercise;
  return (
    <OptionsExercise {...props} options={ex.options}
      prompt={
        <ol className="dialogue" aria-label="Diálogo">
          {ex.lines.map((l, i) => (
            <li key={i} className={`bubble ${i % 2 ? 'right' : 'left'}`}>
              <span className="speaker">{l.speaker}</span>
              {i === ex.blankLine ? <span className="blank">…</span> : (
                <span lang="nl"><GlossText text={l.nl} /> {props.audioEnabled && <SpeakButton text={l.nl} rate={props.speechRate} />}</span>
              )}
              {l.pt && i !== ex.blankLine && <span className="muted small">{l.pt}</span>}
            </li>
          ))}
        </ol>
      } />
  );
}

// ---------------------------------------------------------------------------
// Peças (banco de palavras / ordenação)
// ---------------------------------------------------------------------------
function TokenExercise({ exercise, locked, onResponse, prompt, tokens, speakPrompt, speechRate, audioEnabled }: ExerciseProps & { prompt: string; tokens: string[]; speakPrompt: boolean }) {
  const bank = useMemo(() => shuffle(tokens.map((t, i) => ({ t, i })), seededRandom(seedOf(exercise.id))), [exercise.id, tokens]);
  const [chosen, setChosen] = useState<number[]>([]);
  const update = (next: number[]) => {
    playSound(next.length >= chosen.length ? 'tap' : 'untap');
    setChosen(next);
    onResponse(next.length ? { kind: 'text', value: joinTokens(next.map((i) => tokens[i]!)) } : null);
  };
  return (
    <div className="exercise">
      <p className={speakPrompt ? 'prompt-nl' : 'prompt'}>{speakPrompt && audioEnabled && <SpeakButton text={prompt} rate={speechRate} />} {prompt}</p>
      <div className="token-line" aria-label="A sua resposta" aria-live="polite">
        {chosen.length === 0 && <span className="muted small">Toque nas palavras abaixo para construir a frase.</span>}
        {chosen.map((i, pos) => (
          <button key={`${i}-${pos}`} type="button" className="token chosen" disabled={locked} lang="nl"
            aria-label={`Remover ${tokens[i]}`} onClick={() => update(chosen.filter((_, p) => p !== pos))}>{tokens[i]}</button>
        ))}
      </div>
      <div className="token-bank" aria-label="Palavras disponíveis">
        {bank.map(({ t, i }) => {
          const used = chosen.includes(i);
          return (
            <button key={i} type="button" className={`token ${used ? 'used' : ''}`} disabled={locked || used} lang="nl"
              aria-label={used ? `${t} (usada)` : `Acrescentar ${t}`} onClick={() => update([...chosen, i])}>{t}</button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Associação
// ---------------------------------------------------------------------------
function MatchExercise({ exercise, locked, onResponse, speechRate, audioEnabled }: ExerciseProps<ExerciseOf<'match'>>) {
  const rnd = useMemo(() => seededRandom(seedOf(exercise.id)), [exercise.id]);
  const left = useMemo(() => shuffle(exercise.pairs.map((p, i) => ({ text: p.nl, i })), rnd), [exercise.pairs, rnd]);
  const right = useMemo(() => shuffle(exercise.pairs.map((p, i) => ({ text: p.pt, i })), rnd), [exercise.pairs, rnd]);
  const [sel, setSel] = useState<{ side: 'l' | 'r'; i: number } | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  const pick = (side: 'l' | 'r', i: number) => {
    if (locked || done.has(i)) return;
    // Ao tocar numa palavra neerlandesa, ouve-se a pronúncia.
    if (side === 'l' && audioEnabled) void speak(exercise.pairs[i]!.nl, speechRate);
    if (!sel || sel.side === side) return setSel({ side, i });
    if (sel.i === i) {
      const next = new Set(done).add(i);
      if (next.size < exercise.pairs.length) playSound('pairMatch');
      setDone(next);
      setSel(null);
      if (next.size === exercise.pairs.length) onResponse({ kind: 'match', mistakes });
    } else {
      setMistakes((m) => m + 1);
      playSound('pairMiss');
      setFlash(`${sel.side}${sel.i}-${side}${i}`);
      setTimeout(() => setFlash(null), 500);
      setSel(null);
    }
  };
  const cls = (side: 'l' | 'r', i: number) =>
    `option match-item ${done.has(i) ? 'matched' : ''} ${sel?.side === side && sel.i === i ? 'selected' : ''} ${flash?.includes(`${side}${i}`) ? 'wrong-flash' : ''}`;
  return (
    <div className="exercise">
      <p className="muted small" aria-live="polite">{done.size} de {exercise.pairs.length} pares{mistakes ? ` · ${mistakes} tentativas erradas` : ''}</p>
      <div className="match-grid">
        <div className="match-col" aria-label="Neerlandês">
          {left.map(({ text, i }) => (
            <button key={i} type="button" lang="nl" className={cls('l', i)} disabled={locked || done.has(i)} aria-pressed={sel?.side === 'l' && sel.i === i} onClick={() => pick('l', i)}>{text}</button>
          ))}
        </div>
        <div className="match-col" aria-label="Português">
          {right.map(({ text, i }) => (
            <button key={i} type="button" className={cls('r', i)} disabled={locked || done.has(i)} aria-pressed={sel?.side === 'r' && sel.i === i} onClick={() => pick('r', i)}>{text}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Encontrar o erro
// ---------------------------------------------------------------------------
function FindErrorExercise({ exercise, locked, onResponse }: ExerciseProps<ExerciseOf<'findError'>>) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="exercise">
      <div className="token-line findable" role="radiogroup" aria-label="Palavras da frase">
        {exercise.tokens.map((t, i) => (
          <button key={i} type="button" role="radio" aria-checked={sel === i} lang="nl" disabled={locked}
            className={`token ${sel === i ? 'selected' : ''}`} onClick={() => { setSel(i); onResponse({ kind: 'index', index: i }); }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compreensão de texto / diálogo
// ---------------------------------------------------------------------------
function ComprehensionExercise({ exercise, locked, onResponse, speechRate, audioEnabled }: ExerciseProps<ExerciseOf<'comprehension'>>) {
  const [answers, setAnswers] = useState<(string | undefined)[]>(() => exercise.questions.map(() => undefined));
  const choose = (q: number, id: string) => {
    if (locked) return;
    const next = [...answers];
    next[q] = id;
    setAnswers(next);
    onResponse(next.every(Boolean) ? { kind: 'options', ids: next as string[] } : null);
  };
  return (
    <div className="exercise">
      <article className="reading" lang="nl">
        {exercise.title && <h3 lang="pt-PT">{exercise.title} {audioEnabled && <SpeakButton text={exercise.text.replace(/^[^:\n]+:/gm, '')} rate={speechRate} label="Ouvir o texto" />}</h3>}
        {exercise.text.split('\n').map((line, i) => <GlossText key={i} as="p" text={line} />)}
      </article>
      {exercise.questions.map((q, qi) => (
        <fieldset key={qi} className="question">
          <legend>{q.prompt}</legend>
          <div className="options compact">
            {q.options.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={answers[qi] === o.id} disabled={locked}
                className={`option ${answers[qi] === o.id ? 'selected' : ''}`} onClick={() => choose(qi, o.id)}>{o.text}</button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compreensão auditiva
// ---------------------------------------------------------------------------
function ListeningExercise(props: ExerciseProps<ExerciseOf<'listening'>>) {
  const ex = props.exercise;
  const available = props.audioEnabled && (!!ex.audio || canSpeak());
  const [played, setPlayed] = useState(false);
  if (!available) {
    return (
      <div className="exercise">
        <p className="notice">O áudio está desligado ou não é suportado neste dispositivo.</p>
        <button type="button" className="btn btn-secondary" onClick={props.onSkip}>Saltar este exercício (sem penalização)</button>
      </div>
    );
  }
  return (
    <div className="exercise">
      <div className="listen-row" onClickCapture={() => setPlayed(true)}>
        <SpeakButton text={ex.audioText} rate={props.speechRate} audio={ex.audio} size="lg" label="Ouvir a frase" />
        <SpeakButton text={ex.audioText} rate={Math.max(0.5, props.speechRate - 0.35)} audio={ex.audio} label="Ouvir devagar" />
      </div>
      {!hasDutchVoice() && !ex.audio && (
        <p className="muted small">Este dispositivo não tem uma voz neerlandesa instalada; a pronúncia pode não ser fiel.</p>
      )}
      {!played && <p className="muted small">Toque no altifalante para ouvir.</p>}
      <TextAnswer {...props} lang="nl" label="O que ouviu, em neerlandês" placeholder="Escreva em neerlandês…" />
      <button type="button" className="link-btn" onClick={props.onSkip}>Não posso ouvir agora</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ler em voz alta (pronúncia)
// ---------------------------------------------------------------------------
function SpeakingExercise(props: ExerciseProps<ExerciseOf<'speaking'>>) {
  const ex = props.exercise;
  const [state, setState] = useState<'idle' | 'listening' | 'done'>('idle');
  const [words, setWords] = useState<SpeechWord[] | null>(null);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handle = useRef<RecognitionHandle | null>(null);
  useEffect(() => () => handle.current?.stop(), []);

  if (!canRecognizeSpeech()) {
    return (
      <div className="exercise">
        <p className="prompt-nl"><GlossText text={ex.text} /></p>
        <p className="notice">{RECOGNITION_ERROR_TEXT.unsupported}</p>
        <button type="button" className="btn btn-secondary" onClick={props.onSkip}>Saltar este exercício (sem penalização)</button>
      </div>
    );
  }

  const start = () => {
    if (props.locked) return;
    if (state === 'listening') { handle.current?.stop(); return; }
    setError(null);
    setState('listening');
    const h = listenOnce('nl-NL');
    handle.current = h;
    h.result.then(
      (alts) => {
        const g = gradeSpeech(ex.text, alts);
        setWords(g.words);
        setHeard(g.best);
        setState('done');
        props.onResponse({ kind: 'speech', alternatives: alts });
      },
      (e: unknown) => {
        setState('idle');
        setError(RECOGNITION_ERROR_TEXT[e instanceof RecognitionError ? e.kind : 'other']);
      },
    );
  };

  return (
    <div className="exercise speaking">
      <p className="prompt-nl speak-target">
        {props.audioEnabled && <SpeakButton text={ex.text} rate={props.speechRate} label="Ouvir o modelo" />}{' '}
        {words ? (
          <span lang="nl">{words.map((w, i) => <span key={i} className={w.heard ? 'heard' : 'missed'}>{w.word}{i < words.length - 1 ? ' ' : ''}</span>)}</span>
        ) : <GlossText text={ex.text} />}
      </p>
      <p className="muted">{ex.translation}</p>
      <button type="button" className={`mic-btn ${state === 'listening' ? 'on' : ''}`} disabled={props.locked}
        aria-label={state === 'listening' ? 'Parar de gravar' : 'Falar'} onClick={start}>
        <Icon name="mic" size={34} />
      </button>
      <p className="muted small" aria-live="polite">
        {state === 'listening' ? 'A ouvir… leia a frase em voz alta.' : state === 'done' ? `Ouvi: «${heard}». Pode tentar outra vez ou carregar em «Verificar».` : 'Toque no microfone e leia a frase em voz alta.'}
      </p>
      {error && <p className="notice" role="alert">{error}</p>}
      <button type="button" className="link-btn" onClick={props.onSkip}>Não posso falar agora</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Escrita curta
// ---------------------------------------------------------------------------
function WritingExercise(props: ExerciseProps<ExerciseOf<'shortWriting'>>) {
  const ex = props.exercise;
  return (
    <div className="exercise">
      <p className="prompt">{ex.prompt}</p>
      <details className="hint">
        <summary>Ver o que deve incluir</summary>
        <ul>{ex.checklist.map((c, i) => <li key={i}><RichText text={c} /></li>)}</ul>
      </details>
      <TextAnswer {...props} lang="nl" multiline label="A sua resposta em neerlandês" placeholder="Escreva em neerlandês…" />
      <p className="muted small">Mínimo de {ex.minWords} palavras. Carregue em «Verificar» ou Enter (Shift+Enter muda de linha).</p>
    </div>
  );
}
