/**
 * Texto neerlandês com palavras clicáveis: ao tocar numa palavra, aparece a tradução
 * por baixo da frase (sem janelas a tapar o exercício).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { buildGlossary, normalizeWord, wordsOf, type Glossary } from '../../engine/glossary.ts';
import { contentRepo } from '../../data/contentRepo.ts';
import { useIsNewWord } from './NewWords.tsx';

let glossaryPromise: Promise<Glossary> | null = null;

/** Carrega (uma vez) o vocabulário de todas as secções e constrói o dicionário. */
export function loadGlossary(): Promise<Glossary> {
  if (!glossaryPromise) {
    glossaryPromise = contentRepo.loadAllVocab()
      .then((items) => buildGlossary(items))
      .catch(() => {
        glossaryPromise = null;
        return buildGlossary([]);
      });
  }
  return glossaryPromise;
}

const GlossaryContext = createContext<Glossary | null>(null);
/** Dicionário do curso (null enquanto carrega). */
export const useGlossary = () => useContext(GlossaryContext);

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const [glossary, setGlossary] = useState<Glossary | null>(null);
  useEffect(() => {
    let alive = true;
    void loadGlossary().then((g) => { if (alive) setGlossary(g); });
    return () => { alive = false; };
  }, []);
  return <GlossaryContext.Provider value={glossary}>{children}</GlossaryContext.Provider>;
}

/** Só se pode tocar em palavras com letras (não em «___», números ou pontuação). */
const isWord = (t: string) => /\p{L}/u.test(t) && !/^_+$/.test(t);

export function GlossText({ text, className, as: Tag = 'span' }: { text: string; className?: string; as?: 'span' | 'p' | 'div' }) {
  const glossary = useContext(GlossaryContext);
  const isNew = useIsNewWord();
  const [open, setOpen] = useState<{ i: number; meanings: string[] } | null>(null);
  // Fecha o balão ao tocar noutro sítio.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  if (!glossary) return <Tag className={className} lang="nl">{text}</Tag>;
  const parts = text.split(/(\s+)/);
  const meaningsOf = (p: string): string[] => {
    const word = normalizeWord(p);
    // Numa expressão de várias palavras (ex.: «tot straks»), o significado da expressão inteira.
    const exprs = glossary.expressions(text).filter((x) => wordsOf(x.headword).includes(word));
    const entries = [...exprs, ...glossary.lookup(p)];
    const out: string[] = [];
    for (const e of entries) for (const m of e.pt) {
      const clean = m.replace(/\s*\([^)]*\)/g, '').trim();
      if (clean && !out.includes(clean)) out.push(clean);
    }
    return out.slice(0, 3);
  };
  return (
    <Tag className={className} lang="nl">
      {parts.map((p, i) => {
        if (!p || /^\s+$/.test(p) || !isWord(p)) return <span key={i}>{p}</span>;
        const word = normalizeWord(p);
        const isOpen = open?.i === i;
        return (
          <span key={i} className="gloss-wrap">
            <button type="button" className={`gloss-word ${isOpen ? 'active' : ''} ${isNew(p) ? 'new-word' : ''}`}
              aria-label={`Tradução de «${word}»`} aria-expanded={isOpen}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(isOpen ? null : { i, meanings: meaningsOf(p) });
              }}>{p}</button>
            {/* Só a tradução, num balão por baixo da palavra. */}
            {isOpen && (
              <span className="gloss-card" role="tooltip" lang="pt">
                {open.meanings.length ? open.meanings.map((m, k) => <span key={k} className="gloss-meaning">{m}</span>) : <span className="muted">—</span>}
              </span>
            )}
          </span>
        );
      })}
    </Tag>
  );
}
