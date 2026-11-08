/**
 * «✨ Palavra nova»: na primeira vez que uma palavra aparece (o aluno nunca a acertou),
 * o próprio exercício mostra o significado. É aí que se aprende; nas vezes seguintes já é teste.
 */
import type { NewWordSource } from '../../engine/teach.ts';
import { cleanPt } from '../../engine/session.ts';
import { SpeakButton } from './common.tsx';

export function NewWordBanner({ words, speechRate, audioEnabled }: { words: readonly NewWordSource[]; speechRate: number; audioEnabled: boolean }) {
  if (!words.length) return null;
  return (
    <div className="new-banner" role="note" aria-label={words.length > 1 ? 'Palavras novas' : 'Palavra nova'}>
      <p className="new-banner-label">✨ {words.length > 1 ? 'Palavras novas' : 'Palavra nova'}</p>
      <ul>
        {words.map((v) => {
          const head = v.article ? `${v.article} ${v.nl}` : v.nl;
          return (
            <li key={v.id}>
              {audioEnabled && <SpeakButton text={head} rate={speechRate} />}
              <strong lang="nl" className="new-word">{head}</strong>
              <span> — {[...new Set(v.pt.slice(0, 3).map(cleanPt))].join(', ')}</span>
              {v.note && <span className="muted small block">{v.note}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
