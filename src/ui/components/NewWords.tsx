/**
 * Palavras novas desta lição (ainda não aprendidas): aparecem a roxo em todos os exercícios.
 */
import { createContext, useContext } from 'react';

/** Diz se uma palavra é nova nesta lição (por omissão: nenhuma). */
export const NewWordsContext = createContext<(word: string) => boolean>(() => false);
export const useIsNewWord = () => useContext(NewWordsContext);

/** Texto com as palavras novas marcadas a roxo. */
export function NewMark({ text }: { text: string }) {
  const isNew = useIsNewWord();
  const parts = text.split(/(\s+)/);
  if (!parts.some((p) => /\p{L}/u.test(p) && isNew(p))) return <>{text}</>;
  return <>{parts.map((p, i) => (/\p{L}/u.test(p) && isNew(p) ? <span key={i} className="new-word">{p}</span> : <span key={i}>{p}</span>))}</>;
}
