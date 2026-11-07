/**
 * Painel «Traduções» (sempre disponível durante os exercícios, sem sair do exercício):
 *  - a frase do exercício, com áudio e tradução;
 *  - expressões que não se traduzem à letra (significado + palavra a palavra);
 *  - todas as palavras neerlandesas do exercício: significado, pronúncia aproximada, áudio, exemplo da lição;
 *  - a gramática da lição.
 * O que for a própria resposta fica tapado; se o aluno o abrir, o exercício volta no fim para consolidar.
 */
import { useMemo, useState } from 'react';
import type { Exercise, GrammarNote } from '../../domain/schemas.ts';
import { normalizeWord, wordsOf, type GlossEntry, type Glossary } from '../../engine/glossary.ts';
import { approxPronunciation, exampleFor, exerciseHelp } from '../../engine/teach.ts';
import { useSavedWords } from '../AppState.tsx';
import { Icon, RichText, SpeakButton } from './common.tsx';
import { useGlossary } from './Gloss.tsx';

export interface TeachInfo {
  examples: readonly { nl: string; pt: string }[];
  grammar: readonly GrammarNote[];
}

const stripArticle = (h: string) => h.replace(/^(de|het)\s+/i, '');

/** Um texto é neerlandês se a maior parte das palavras (sem nomes próprios) estiver no dicionário do curso. */
export function makeIsDutch(g: Glossary | null) {
  return (text: string): boolean => {
    if (!g) return false;
    const covered = new Set(g.expressions(text).flatMap((e) => wordsOf(e.headword)));
    const ws = text.split(/\s+/).filter((w) => /\p{L}/u.test(w));
    const counted = ws.filter((w, i) => i === 0 || !/^\p{Lu}/u.test(w)); // nomes próprios a meio não contam
    if (!counted.length) return false;
    const known = counted.filter((w) => covered.has(normalizeWord(w)) || g.lookup(w).length > 0).length;
    return known / counted.length >= 0.5;
  };
}

export function HelpSheet({ exercise, teach, onClose, onHelped, speechRate, audioEnabled }: {
  exercise: Exercise; teach?: TeachInfo; onClose: () => void; onHelped: () => void; speechRate: number; audioEnabled: boolean;
}) {
  const g = useGlossary();
  const saved = useSavedWords();
  const [shown, setShown] = useState<Set<string>>(new Set());
  const help = useMemo(() => exerciseHelp(exercise, makeIsDutch(g)), [exercise, g]);
  const reveal = (key: string) => {
    if (shown.has(key)) return;
    setShown(new Set(shown).add(key));
    onHelped();
  };
  const hiddenNl = help.sentences.filter((s) => s.hide === 'nl').map((s) => normalizeWord(s.nl.replace(/\s+/g, '')));
  const examples = (teach?.examples ?? []).concat(teach?.grammar.flatMap((gr) => gr.examples) ?? [])
    .filter((e) => !hiddenNl.includes(normalizeWord(e.nl.replace(/\s+/g, ''))));
  const visibleText = [...help.sentences.filter((s) => s.hide !== 'nl').map((s) => s.nl), help.words.join(' ')].join(' ');
  const expressions = g ? g.expressions(visibleText) : [];
  const wordKeys = new Set(help.words.map(normalizeWord));
  const extraVocab = g ? help.vocabIds.map((id) => g.byId(id)).filter((e): e is GlossEntry => !!e)
    .filter((e) => !wordKeys.has(normalizeWord(stripArticle(e.headword))) && !expressions.some((x) => x.headword === e.headword)) : [];
  const speak = (text: string) => audioEnabled && <SpeakButton text={text} rate={speechRate} />;
  const star = (e: GlossEntry) => saved && e.id && (
    <button type="button" className={`save-star ${saved.saved.has(e.id) ? 'on' : ''}`} aria-pressed={saved.saved.has(e.id)}
      aria-label={saved.saved.has(e.id) ? `Tirar «${e.headword}» do meu dicionário` : `Guardar «${e.headword}» no meu dicionário`}
      onClick={() => void saved.toggle(e.id!)}>{saved.saved.has(e.id) ? '★' : '☆'}</button>
  );
  const Spoiler = ({ id, children, label = 'Ver significado' }: { id: string; children: React.ReactNode; label?: string }) =>
    shown.has(id) ? <>{children}</> : (
      <button type="button" className="spoiler-btn" onClick={() => reveal(id)}>
        <Icon name="lock" size={14} /> {label}
      </button>
    );
  const meaning = (e: GlossEntry) => e.pt.slice(0, 3).join(', ');

  const WordCard = ({ w }: { w: string }) => {
    const key = normalizeWord(w);
    const entries = g?.lookup(w) ?? [];
    const e = entries[0];
    const spoiler = help.spoilerWords.has(key);
    const head = e ? (help.hideArticles ? stripArticle(e.headword) : e.headword) : w;
    const ex = e ? exampleFor((x) => g?.lookup(x)[0]?.headword === e.headword, examples) : null;
    return (
      <li className="help-word">
        <div className="help-word-head">
          {speak(help.hideArticles ? stripArticle(w) : w)}
          <strong lang="nl">{w.replace(/[.,!?;:«»"]/g, '')}</strong>
          <span className="help-pron" title="Pronúncia aproximada">[{approxPronunciation(w)}]</span>
          {e && star(e)}
        </div>
        {!e ? (
          <p className="muted small">{/^\p{Lu}/u.test(w) ? 'Nome próprio ou palavra que não está no dicionário do curso.' : 'Sem tradução no dicionário do curso.'}</p>
        ) : spoiler ? (
          <Spoiler id={`w:${key}`}><p className="help-meaning">{meaning(e)}{normalizeWord(stripArticle(head)) !== key && <span className="muted"> (de «{head}»)</span>}</p></Spoiler>
        ) : (
          <p className="help-meaning">{entries.map((x, i) => <span key={i}>{i > 0 && ' · '}{meaning(x)}</span>)}{normalizeWord(stripArticle(head)) !== key && <span className="muted"> (de «{head}»)</span>}</p>
        )}
        {e?.note && (!spoiler || shown.has(`w:${key}`)) && <p className="muted small">{e.note}</p>}
        {ex && (!spoiler || shown.has(`w:${key}`)) && (
          <p className="help-example small">{speak(ex.nl)}<span lang="nl">{ex.nl}</span> <span className="muted">— {ex.pt}</span></p>
        )}
      </li>
    );
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="sheet" role="dialog" aria-modal="true" aria-label="Traduções e explicações" onClick={(e) => e.stopPropagation()}>
        <header className="sheet-head">
          <h2><Icon name="book" size={22} /> Traduções</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar traduções"><Icon name="close" /></button>
        </header>
        <div className="sheet-body">
          {!g && <p className="loading" aria-busy="true">A carregar o dicionário…</p>}
          {(help.spoilerWords.size > 0 || help.vocabSpoiler || help.spoilerExpressions || help.sentences.some((s) => s.hide)) && (
            <p className="help-hint small"><Icon name="lock" size={14} /> O que está tapado é a resposta deste exercício. Pode vê-lo, se precisar: nesse caso o exercício volta no fim, para consolidar.</p>
          )}

          {help.sentences.length > 0 && (
            <section className="help-section">
              <h3>Frase{help.sentences.length > 1 ? 's' : ''}</h3>
              {help.sentences.map((s, i) => (
                <div key={i} className="help-sentence">
                  {s.hide === 'nl' ? (
                    <>
                      {s.pt && <p>{s.pt}</p>}
                      <Spoiler id={`s:${i}`} label="Mostrar a frase em neerlandês"><p lang="nl"><strong>{speak(s.nl)}{s.nl}</strong></p></Spoiler>
                    </>
                  ) : (
                    <>
                      <p lang="nl"><strong>{speak(s.nl)}{s.nl}</strong></p>
                      {s.pt && (s.hide === 'pt'
                        ? <Spoiler id={`s:${i}`} label="Mostrar a tradução da frase"><p className="help-meaning">{s.pt}</p></Spoiler>
                        : <p className="help-meaning">{s.pt}</p>)}
                    </>
                  )}
                </div>
              ))}
              {help.literal && <p className="small muted">À letra: «{help.literal}»</p>}
            </section>
          )}

          {expressions.length > 0 && (
            <section className="help-section">
              <h3>Expressões</h3>
              <ul className="help-list">
                {expressions.map((e) => (
                  <li key={e.headword} className="help-word">
                    <div className="help-word-head">{speak(e.headword)}<strong lang="nl">{e.headword}</strong>{star(e)}</div>
                    {help.spoilerExpressions
                      ? <Spoiler id={`e:${e.headword}`}><p className="help-meaning">{meaning(e)}</p></Spoiler>
                      : <p className="help-meaning">{meaning(e)}</p>}
                    {e.note && <p className="muted small">{e.note}</p>}
                    <p className="small muted">Palavra a palavra: {wordsOf(e.headword).map((w) => `${w} = ${g?.lookup(w)[0]?.pt[0] ?? '…'}`).join(' · ')}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {help.words.length > 0 && (
            <section className="help-section">
              <h3>Palavra a palavra</h3>
              <ul className="help-list">{help.words.map((w) => <WordCard key={w} w={w} />)}</ul>
              <p className="muted small">Entre parênteses retos: pronúncia aproximada para quem fala português. O áudio é a referência.</p>
            </section>
          )}

          {extraVocab.length > 0 && (
            <section className="help-section">
              <h3>Palavras deste exercício</h3>
              <ul className="help-list">
                {extraVocab.map((e) => (
                  <li key={e.headword} className="help-word">
                    <div className="help-word-head">{speak(e.headword)}<strong lang="nl">{help.hideArticles ? stripArticle(e.headword) : e.headword}</strong>
                      <span className="help-pron">[{approxPronunciation(stripArticle(e.headword))}]</span>{star(e)}</div>
                    {help.vocabSpoiler
                      ? <Spoiler id={`v:${e.headword}`}><p className="help-meaning">{meaning(e)}</p></Spoiler>
                      : <p className="help-meaning">{meaning(e)}</p>}
                    {e.note && <p className="muted small">{e.note}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {teach && teach.grammar.length > 0 && (
            <section className="help-section">
              <h3>Gramática desta lição</h3>
              {teach.grammar.map((gr) => (
                <details key={gr.id} className="help-grammar">
                  <summary>{gr.title}</summary>
                  <p><RichText text={gr.body} /></p>
                  {gr.examples.length > 0 && (
                    <ul className="examples">{gr.examples.map((x, i) => <li key={i}>{speak(x.nl)}<span lang="nl">{x.nl}</span> <span className="muted">— {x.pt}</span></li>)}</ul>
                  )}
                  {gr.contrastWithPt && <p className="contrast"><strong>Comparação com o português:</strong> {gr.contrastWithPt}</p>}
                </details>
              ))}
            </section>
          )}

          {shown.size > 0 && <p className="note small">Viu parte da resposta: este exercício volta no fim, para consolidar.</p>}
        </div>
      </section>
    </div>
  );
}
