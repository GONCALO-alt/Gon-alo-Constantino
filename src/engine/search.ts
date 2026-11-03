/**
 * Pesquisa no vocabulário do curso, em neerlandês ou em português.
 * Reconhece formas flexionadas em neerlandês («werkt» → werken, «grote» → groot).
 */
import { stripAccents } from './answers.ts';
import { lemmaCandidates } from './glossary.ts';

export interface SearchItem {
  id: string;
  nl: string;
  pt: readonly string[];
  pos: string;
  article?: 'de' | 'het';
  note?: string;
  lessonId: string;
}

const norm = (s: string) => stripAccents(s.toLowerCase().replace(/\s*\([^)]*\)/g, ' ')).replace(/[.,!?;:«»"'’]/g, '').replace(/\s+/g, ' ').trim();

/** Resultados ordenados: correspondência exata primeiro, depois início de palavra, depois «contém». */
export function searchVocab(items: readonly SearchItem[], query: string, limit = 40): SearchItem[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const lemmas = new Set(q.includes(' ') ? [] : lemmaCandidates(q).map(norm));
  const seen = new Set<string>();
  const scored: { item: SearchItem; score: number; order: number }[] = [];
  items.forEach((item, order) => {
    const key = `${norm(item.nl)}|${norm(item.pt[0] ?? '')}`;
    if (seen.has(key)) return; // a mesma palavra ensinada em várias lições: fica a primeira
    const nl = norm(item.nl);
    const full = norm(item.article ? `${item.article} ${item.nl}` : item.nl);
    const pts = item.pt.map(norm);
    let score = Infinity;
    if (nl === q || full === q) score = 0;
    else if (lemmas.has(nl)) score = 1;
    else if (pts.includes(q)) score = 2;
    else if (nl.startsWith(q) || full.startsWith(q)) score = 3;
    else if (pts.some((p) => p.startsWith(q) || p.split(' ').includes(q))) score = 4;
    else if (nl.includes(q)) score = 5;
    else if (pts.some((p) => p.includes(q))) score = 6;
    if (score === Infinity) return;
    seen.add(key);
    scored.push({ item, score, order });
  });
  return scored.sort((a, b) => a.score - b.score || a.order - b.order).slice(0, limit).map((s) => s.item);
}
