/**
 * Texto neerlandês com palavras clicáveis: ao tocar numa palavra, aparece a tradução
 * por baixo da frase (sem janelas a tapar o exercício).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { buildGlossary, normalizeWord, type GlossEntry, type Glossary } from '../../engine/glossary.ts';
import { contentRepo } from '../../data/contentRepo.ts';

const SECTIONS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
let glossaryPromise: Promise<Glossary> | null = null;

/** Carrega (uma vez) o vocabulário de todas as secções e constrói o dicionário. */
export function loadGlossary(): Promise<Glossary> {
  if (!glossaryPromise) {
    glossaryPromise = Promise.all(SECTIONS.map((s) => contentRepo.loadVocab(s).catch(() => null)))
      .then((bundles) => buildGlossary(bundles.flatMap((b) => b?.items ?? [])))
      .catch(() => {
        glossaryPromise = null;
        return buildGlossary([]);
      });
  }
  return glossaryPromise;
}

const GlossaryContext = createContext<Glossary | null>(null);

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
  const [open, setOpen] = useState<{ i: number; word: string; entries: GlossEntry[] } | null>(null);
  if (!glossary) return <Tag className={className} lang="nl">{text}</Tag>;
  const parts = text.split(/(\s+)/);
  return (
    <>
      <Tag className={className} lang="nl">
        {parts.map((p, i) => {
          if (!p || /^\s+$/.test(p) || !isWord(p)) return <span key={i}>{p}</span>;
          const word = normalizeWord(p);
          return (
            <button key={i} type="button" className={`gloss-word ${open?.i === i ? 'active' : ''}`}
              aria-label={`Tradução de «${word}»`} aria-expanded={open?.i === i}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(open?.i === i ? null : { i, word, entries: glossary.lookup(p) });
              }}>{p}</button>
          );
        })}
      </Tag>
      {open && (
        <span className="gloss-card" role="status">
          <strong lang="nl">{open.word}</strong>{' → '}
          {open.entries.length ? (
            open.entries.map((e, k) => (
              <span key={k} className="gloss-entry">
                {k > 0 && ' · '}
                {e.pt.slice(0, 3).join(', ')}
                {normalizeWord(e.headword) !== open.word && <span className="muted"> ({e.headword})</span>}
              </span>
            ))
          ) : (
            <span className="muted">sem tradução no dicionário do curso</span>
          )}
          <button type="button" className="gloss-close" aria-label="Fechar tradução" onClick={() => setOpen(null)}>×</button>
        </span>
      )}
    </>
  );
}
