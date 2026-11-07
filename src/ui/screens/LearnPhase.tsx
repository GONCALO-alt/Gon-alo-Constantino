/**
 * Fase «Aprender» (antes dos exercícios): o professor apresenta primeiro.
 * Um cartão por palavra nova — palavra, áudio, significado, pronúncia aproximada,
 * nota de uso, exemplo da lição com tradução e, nas expressões, palavra a palavra —
 * depois a gramática da lição, e só então os exercícios.
 */
import { useEffect, useMemo, useState } from 'react';
import type { GrammarNote, PublishedLesson, VocabularyItem } from '../../domain/schemas.ts';
import { lemmaCandidates, normalizeWord, wordsOf } from '../../engine/glossary.ts';
import { approxPronunciation } from '../../engine/teach.ts';
import { speak, stopSpeaking } from '../../services/speech.ts';
import { playSound } from '../../services/sounds.ts';
import { useSavedWords } from '../AppState.tsx';
import { Icon, ProgressBar, RichText, SpeakButton } from '../components/common.tsx';
import { GlossaryProvider, useGlossary } from '../components/Gloss.tsx';
import { Mascot } from '../components/Mascot.tsx';

type Card = { kind: 'word'; v: VocabularyItem } | { kind: 'grammar'; g: GrammarNote } | { kind: 'ready' };

/** Há alguma coisa para ensinar antes dos exercícios? */
export function hasLearnContent(l: PublishedLesson): boolean {
  return l.newVocabulary.length > 0 || l.grammar.length > 0;
}

const head = (v: VocabularyItem) => (v.article ? `${v.article} ${v.nl}` : v.nl);

/** Exemplo da lição que usa a palavra (também em formas conjugadas: woon → wonen). */
function exampleOf(v: VocabularyItem, examples: readonly { nl: string; pt: string }[]) {
  const target = wordsOf(v.nl.replace(/\s*\(.*?\)\s*/g, ' '));
  if (!target.length) return null;
  return examples.find((e) => {
    const ws = wordsOf(e.nl);
    if (target.length > 1) return ws.join(' ').includes(target.join(' '));
    return ws.some((w) => w === target[0] || lemmaCandidates(w).includes(target[0]!) || (v.plural && w === normalizeWord(v.plural)));
  }) ?? null;
}

export function LearnPhase(props: { lesson: PublishedLesson; speechRate: number; audioEnabled: boolean; onDone: () => void; onExit: () => void }) {
  return <GlossaryProvider><LearnCards {...props} /></GlossaryProvider>;
}

function LearnCards({ lesson, speechRate, audioEnabled, onDone, onExit }: { lesson: PublishedLesson; speechRate: number; audioEnabled: boolean; onDone: () => void; onExit: () => void }) {
  const cards = useMemo<Card[]>(() => [
    ...lesson.newVocabulary.map((v) => ({ kind: 'word' as const, v })),
    ...lesson.grammar.map((g) => ({ kind: 'grammar' as const, g })),
    { kind: 'ready' as const },
  ], [lesson]);
  const [i, setI] = useState(0);
  const g = useGlossary();
  const saved = useSavedWords();
  const examples = useMemo(() => [...lesson.examples, ...lesson.grammar.flatMap((gr) => gr.examples)], [lesson]);
  const card = cards[i]!;

  // Cada palavra nova é lida em voz alta quando aparece.
  useEffect(() => {
    if (card.kind === 'word' && audioEnabled) void speak(head(card.v), speechRate);
    return () => stopSpeaking();
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (d: number) => {
    playSound(d > 0 ? 'tap' : 'untap');
    setI((x) => Math.max(0, Math.min(cards.length - 1, x + d)));
  };

  return (
    <div className="runner learn">
      <header className="runner-header">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Sair"><Icon name="close" /></button>
        <ProgressBar value={(i + 1) / cards.length} label="Apresentação da lição" tone="go" />
        <button type="button" className="link-btn learn-skip" onClick={onDone}>Saltar</button>
      </header>
      <main className="runner-body" id="conteudo">
        <p className="eyebrow">{card.kind === 'word' ? `Palavra nova ${i + 1} de ${lesson.newVocabulary.length}` : card.kind === 'grammar' ? 'Como funciona' : 'Pronto!'}</p>
        <div key={i} className="learn-card ex-stage">
          {card.kind === 'word' && (() => {
            const v = card.v;
            const ex = exampleOf(v, examples);
            const words = wordsOf(v.nl.replace(/\s*\(.*?\)\s*/g, ' '));
            return (
              <>
                <div className="learn-word">
                  {audioEnabled && <SpeakButton text={head(v)} rate={speechRate} />}
                  <h1 lang="nl">{head(v)}</h1>
                  {saved && (
                    <button type="button" className={`save-star big ${saved.saved.has(v.id) ? 'on' : ''}`} aria-pressed={saved.saved.has(v.id)}
                      aria-label={saved.saved.has(v.id) ? `Tirar «${head(v)}» do meu dicionário` : `Guardar «${head(v)}» no meu dicionário`}
                      onClick={() => void saved.toggle(v.id)}>{saved.saved.has(v.id) ? '★' : '☆'}</button>
                  )}
                </div>
                <dl className="learn-facts">
                  <div><dt>Significado</dt><dd className="learn-meaning">{v.pt.join(', ')}</dd></div>
                  <div><dt>Pronúncia (aproximada)</dt><dd>[{approxPronunciation(v.nl.replace(/\s*\(.*?\)\s*/g, ' '))}]</dd></div>
                  {v.plural && <div><dt>Plural</dt><dd lang="nl">{v.plural}</dd></div>}
                  {v.article && <div><dt>Artigo</dt><dd>«{v.article}» — {v.article === 'het' ? 'palavra «het» (neutra): aprenda-a sempre com o artigo.' : 'palavra «de»: aprenda-a sempre com o artigo.'}</dd></div>}
                </dl>
                {words.length > 1 && g && (
                  <div className="learn-box">
                    <p className="learn-box-title">Palavra a palavra</p>
                    <p>{words.map((w, k) => <span key={k} className="learn-literal"><strong lang="nl">{w}</strong> = {g.lookup(w)[0]?.pt[0] ?? '…'}</span>)}</p>
                    <p className="muted small">Uma expressão nem sempre se traduz à letra: aprenda-a como um bloco.</p>
                  </div>
                )}
                {v.note && <div className="learn-box"><p className="learn-box-title">Nota</p><p>{v.note}</p></div>}
                {ex && (
                  <div className="learn-box learn-example">
                    <p className="learn-box-title">Exemplo</p>
                    <p lang="nl"><strong>{audioEnabled && <SpeakButton text={ex.nl} rate={speechRate} />}{ex.nl}</strong></p>
                    <p className="muted">{ex.pt}</p>
                  </div>
                )}
              </>
            );
          })()}
          {card.kind === 'grammar' && (
            <>
              <h1>{card.g.title}</h1>
              <p className="learn-body"><RichText text={card.g.body} /></p>
              {card.g.examples.length > 0 && (
                <ul className="examples learn-examples">
                  {card.g.examples.map((x, k) => (
                    <li key={k}>{audioEnabled && <SpeakButton text={x.nl} rate={speechRate} />}<span lang="nl"><strong>{x.nl}</strong></span> <span className="muted">— {x.pt}</span></li>
                  ))}
                </ul>
              )}
              {card.g.contrastWithPt && <p className="contrast"><strong>Comparação com o português:</strong> {card.g.contrastWithPt}</p>}
            </>
          )}
          {card.kind === 'ready' && (
            <div className="learn-ready">
              <Mascot size={96} mood="cheer" />
              <h1>Agora vamos praticar!</h1>
              {lesson.newVocabulary.length > 0 && (
                <ul className="learn-recap">
                  {lesson.newVocabulary.map((v) => <li key={v.id}><strong lang="nl">{head(v)}</strong> — {v.pt[0]}</li>)}
                </ul>
              )}
              <p className="muted">Durante os exercícios, o botão <strong>Traduções</strong> mostra sempre o significado das palavras.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="runner-footer">
        <div className="footer-inner check-row">
          {i > 0 && <button type="button" className="btn btn-secondary" onClick={() => go(-1)}>Anterior</button>}
          {card.kind === 'ready'
            ? <button type="button" className="btn btn-go btn-wide" onClick={onDone}>Começar os exercícios</button>
            : <button type="button" className="btn btn-go btn-wide" onClick={() => go(1)}>Seguinte</button>}
        </div>
      </footer>
    </div>
  );
}
