/**
 * Mini-jogos com as palavras já aprendidas: corrida contra o relógio, memória,
 * «de of het?» e ouvir e tocar. Sem vidas nem castigos; guarda só o recorde
 * de cada jogo neste dispositivo.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { contentRepo } from '../../data/contentRepo.ts';
import {
  articleWords, choiceRound, gameWords, memoryDeck, raceScore,
  type ChoiceRound, type GameWord, type MemoryCard, type VocabSource,
} from '../../engine/games.ts';
import { canSpeak, speak, stopSpeaking } from '../../services/speech.ts';
import { playCorrect, playSound } from '../../services/sounds.ts';
import { useAppData } from '../AppState.tsx';
import { Confetti } from '../components/Celebrate.tsx';
import { Icon } from '../components/common.tsx';
import { Mascot } from '../components/Mascot.tsx';

type GameId = 'race' | 'memory' | 'article' | 'listen';

const GAMES: { id: GameId; emoji: string; title: string; nl: string; desc: string; best: 'high' | 'low' }[] = [
  { id: 'race', emoji: '⏱️', title: 'Corrida de palavras', nl: 'Woordenrace', desc: '60 segundos: escolha a tradução certa o mais depressa possível.', best: 'high' },
  { id: 'memory', emoji: '🃏', title: 'Memória', nl: 'Geheugen', desc: 'Vire as cartas e junte cada palavra à sua tradução.', best: 'low' },
  { id: 'article', emoji: '🔤', title: 'De of het?', nl: 'Lidwoorden', desc: '45 segundos: toque no artigo certo de cada palavra.', best: 'high' },
  { id: 'listen', emoji: '👂', title: 'Ouve e toca', nl: 'Luister en tik', desc: 'Ouça a palavra e toque na que ouviu. 10 rondas.', best: 'high' },
];

const BEST_KEY = 'dutchpath.games.best';

function readBest(): Partial<Record<GameId, number>> {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}') as Partial<Record<GameId, number>>; } catch { return {}; }
}
/** Guarda o recorde; devolve true se for novo. */
function saveBest(id: GameId, value: number): boolean {
  const best = readBest();
  const lower = GAMES.find((g) => g.id === id)!.best === 'low';
  const old = best[id];
  const isNew = old === undefined || (lower ? value < old : value > old);
  if (isNew) {
    try { localStorage.setItem(BEST_KEY, JSON.stringify({ ...best, [id]: value })); } catch { /* sem armazenamento */ }
  }
  return isNew;
}

/** Vocabulário de todo o curso, pela ordem do curso. */
function useVocab(): VocabSource[] | null {
  const [items, setItems] = useState<VocabSource[] | null>(null);
  useEffect(() => {
    let alive = true;
    contentRepo.loadAllVocab().then((items) => { if (alive) setItems(items); }, () => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, []);
  return items;
}

export function GamesScreen() {
  const { completed, settings } = useAppData();
  const vocab = useVocab();
  const [game, setGame] = useState<GameId | null>(null);
  const [best, setBest] = useState(readBest);
  const words = useMemo(() => (vocab ? gameWords(vocab, completed) : []), [vocab, completed]);
  const nouns = useMemo(() => (vocab ? articleWords(gameWords(vocab.filter((v) => v.article), completed, 10)) : []), [vocab, completed]);
  const learned = useMemo(() => (vocab ? vocab.filter((v) => completed.has(v.lessonId)).length : 0), [vocab, completed]);
  const listenOk = settings.audioEnabled && canSpeak();

  if (!vocab) return <div className="page"><p className="loading" aria-busy="true">A preparar os jogos…</p></div>;

  if (game) {
    const done = (score: number) => { saveBest(game, score); setBest(readBest()); };
    const exit = () => { stopSpeaking(); setGame(null); };
    const props = { onExit: exit, onDone: done, best: best[game] };
    return (
      <div className="page games-play">
        {game === 'race' && <RaceGame words={words} {...props} />}
        {game === 'memory' && <MemoryGame words={words} {...props} />}
        {game === 'article' && <ArticleGame words={nouns} {...props} />}
        {game === 'listen' && <ListenGame words={words} rate={settings.speechRate} {...props} />}
      </div>
    );
  }

  return (
    <div className="page games">
      <div className="games-head">
        <div>
          <h1>Mini-jogos</h1>
          <p className="muted">{learned > 0
            ? `Com as ${learned} palavras que já aprendeu.`
            : 'Ainda não concluiu lições: os jogos usam as primeiras palavras do curso.'}</p>
        </div>
        <Mascot size={70} mood="cheer" />
      </div>
      <ul className="game-list">
        {GAMES.map((g) => {
          const disabled = g.id === 'listen' && !listenOk;
          const b = best[g.id];
          return (
            <li key={g.id}>
              <button type="button" className={`game-card game-${g.id}`} disabled={disabled} onClick={() => setGame(g.id)}>
                <span className="game-emoji" aria-hidden="true">{g.emoji}</span>
                <span className="game-text">
                  <span className="game-title">{g.title} <span className="game-nl" lang="nl">· {g.nl}</span></span>
                  <span className="game-desc">{disabled ? 'Precisa do áudio ligado e de uma voz no dispositivo.' : g.desc}</span>
                  {b !== undefined && <span className="game-best"><Icon name="trophy" size={14} /> Recorde: {g.id === 'memory' ? `${b} jogadas` : `${b} pontos`}</span>}
                </span>
                <Icon name="arrow" size={20} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface GameProps {
  words: GameWord[];
  onExit: () => void;
  onDone: (score: number) => void;
  best?: number;
}

/** Contagem decrescente em segundos; pára quando chega a 0. */
function useCountdown(seconds: number, running: boolean): number {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (!running) return;
    const end = Date.now() + left * 1000;
    const t = setInterval(() => setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000))), 200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  return left;
}

function GameHeader({ title, onExit, children }: { title: string; onExit: () => void; children?: React.ReactNode }) {
  return (
    <header className="game-head">
      <button type="button" className="icon-btn" onClick={onExit} aria-label="Sair do jogo"><Icon name="close" /></button>
      <h1 className="game-head-title">{title}</h1>
      <div className="game-head-info">{children}</div>
    </header>
  );
}

function GameOver({ title, score, unit, best, lowerIsBetter = false, onAgain, onExit, detail }: {
  title: string; score: number; unit: string; best?: number; lowerIsBetter?: boolean; onAgain: () => void; onExit: () => void; detail?: string;
}) {
  // `best` é o recorde ANTES deste jogo.
  const isNew = best === undefined || (lowerIsBetter ? score < best : score > best);
  useEffect(() => { playSound(isNew ? 'lessonPerfect' : 'lessonComplete'); }, [isNew]);
  return (
    <div className="game-over">
      {isNew && <Confetti count={40} />}
      <Mascot size={100} mood="cheer" />
      <h2>{isNew ? 'Novo recorde!' : 'Fim do jogo!'}</h2>
      <p className="game-score"><strong>{score}</strong> {unit}</p>
      {detail && <p className="muted">{detail}</p>}
      {!isNew && best !== undefined && <p className="muted small">Recorde: {best} {unit}</p>}
      <div className="row center">
        <button type="button" className="btn btn-go" onClick={onAgain}>Jogar outra vez</button>
        <button type="button" className="btn btn-secondary" onClick={onExit}>Outros jogos</button>
      </div>
      <p className="visually-hidden" role="status">{title}: {score} {unit}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Corrida de palavras: 60 s, escolher a tradução.
// ---------------------------------------------------------------------------
function RaceGame({ words, onExit, onDone, best }: GameProps) {
  const [run, setRun] = useState(0);
  return <RaceRun key={run} words={words} onExit={onExit} onDone={onDone} best={best} onAgain={() => setRun((r) => r + 1)} />;
}

function RaceRun({ words, onExit, onDone, best, onAgain }: GameProps & { onAgain: () => void }) {
  const [round, setRound] = useState<ChoiceRound | null>(() => choiceRound(words, Math.random));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [bestBefore] = useState(best);
  const left = useCountdown(60, true);
  const over = left === 0;
  useEffect(() => { if (over) onDone(score); }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!round) return <p className="notice">Precisa de mais palavras para este jogo. Faça mais umas lições!</p>;
  if (over) return <GameOver title="Corrida de palavras" score={score} unit="pontos" best={bestBefore} detail={`${hits} palavras certas`} onAgain={onAgain} onExit={onExit} />;

  const choose = (w: GameWord) => {
    if (picked) return;
    setPicked(w.id);
    const ok = w.id === round.word.id;
    if (ok) { const s = streak + 1; setStreak(s); setScore((x) => x + raceScore(streak)); setHits((h) => h + 1); playCorrect(s); }
    else { setStreak(0); playSound('incorrect'); }
    setTimeout(() => { setPicked(null); setRound(choiceRound(words, Math.random, round.word.id)); }, ok ? 350 : 900);
  };
  return (
    <>
      <GameHeader title="Corrida de palavras" onExit={onExit}>
        <span className={`game-timer ${left <= 10 ? 'low' : ''}`} aria-label={`${left} segundos`}><Icon name="clock" size={18} /> {left}</span>
        <span className="game-points" aria-label={`${score} pontos`}><Icon name="star" size={18} /> {score}</span>
      </GameHeader>
      <div className="game-bar" aria-hidden="true"><span style={{ width: `${(left / 60) * 100}%` }} /></div>
      {streak >= 3 && <p className="game-combo" key={streak}>{streak} seguidas! +{raceScore(streak)}</p>}
      <p className="game-word" lang="nl" key={round.word.id}>{round.word.nl}</p>
      <div className="game-options">
        {round.options.map((o) => (
          <button key={o.id} type="button" className={`game-option ${picked ? (o.id === round.word.id ? 'right' : o.id === picked ? 'wrong' : 'dim') : ''}`}
            onClick={() => choose(o)}>{o.pt}</button>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Memória: virar cartas e juntar pares (neerlandês ↔ português).
// ---------------------------------------------------------------------------
function MemoryGame({ words, onExit, onDone, best }: GameProps) {
  const [run, setRun] = useState(0);
  return <MemoryRun key={run} words={words} onExit={onExit} onDone={onDone} best={best} onAgain={() => setRun((r) => r + 1)} />;
}

function MemoryRun({ words, onExit, onDone, best, onAgain }: GameProps & { onAgain: () => void }) {
  const [deck] = useState<MemoryCard[]>(() => memoryDeck(words, Math.random));
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [bestBefore] = useState(best);
  const busy = useRef(false);
  const pairs = deck.length / 2;
  const over = pairs > 0 && found.size === pairs;
  useEffect(() => { if (over) onDone(moves); }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (pairs < 3) return <p className="notice">Precisa de mais palavras para este jogo. Faça mais umas lições!</p>;
  if (over) return <GameOver title="Memória" score={moves} unit="jogadas" best={bestBefore} lowerIsBetter onAgain={onAgain} onExit={onExit} detail={`${pairs} pares encontrados`} />;

  const flip = (c: MemoryCard) => {
    if (busy.current || open.includes(c.key) || found.has(c.wordId)) return;
    playSound('tap');
    if (c.side === 'nl') void speak(c.text, 0.9);
    const next = [...open, c.key];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((k) => deck.find((d) => d.key === k)!);
    if (a!.wordId === b!.wordId) {
      playSound('pairMatch');
      setFound((f) => new Set(f).add(a!.wordId));
      setOpen([]);
    } else {
      busy.current = true;
      playSound('pairMiss');
      setTimeout(() => { setOpen([]); busy.current = false; }, 850);
    }
  };
  return (
    <>
      <GameHeader title="Memória" onExit={onExit}>
        <span className="game-points">{found.size}/{pairs} pares</span>
        <span className="game-points">{moves} jogadas</span>
      </GameHeader>
      <div className="memory-grid">
        {deck.map((c) => {
          const shown = open.includes(c.key) || found.has(c.wordId);
          return (
            <button key={c.key} type="button" className={`memory-card ${shown ? 'shown' : ''} ${found.has(c.wordId) ? 'found' : ''} side-${c.side}`}
              onClick={() => flip(c)} aria-label={shown ? c.text : 'Carta virada para baixo'} lang={shown && c.side === 'nl' ? 'nl' : undefined}>
              <span className="memory-inner">
                <span className="memory-back" aria-hidden="true"><Icon name="star" size={22} /></span>
                <span className="memory-front">{c.text}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// De of het?: 45 s, escolher o artigo.
// ---------------------------------------------------------------------------
function ArticleGame({ words, onExit, onDone, best }: GameProps) {
  const [run, setRun] = useState(0);
  return <ArticleRun key={run} words={words} onExit={onExit} onDone={onDone} best={best} onAgain={() => setRun((r) => r + 1)} />;
}

function ArticleRun({ words, onExit, onDone, best, onAgain }: GameProps & { onAgain: () => void }) {
  const pick = (avoid?: string) => {
    const pool = words.filter((w) => w.id !== avoid);
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const [word, setWord] = useState<GameWord | undefined>(() => pick());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [bestBefore] = useState(best);
  const left = useCountdown(45, true);
  const over = left === 0;
  useEffect(() => { if (over) onDone(score); }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!word || words.length < 4) return <p className="notice">Precisa de mais substantivos para este jogo. Faça mais umas lições!</p>;
  if (over) return <GameOver title="De of het?" score={score} unit="pontos" best={bestBefore} onAgain={onAgain} onExit={onExit} />;

  const choose = (a: 'de' | 'het') => {
    if (flash) return;
    const ok = a === word.article;
    if (ok) { const s = streak + 1; setStreak(s); setScore((x) => x + 1); playCorrect(s); }
    else { setStreak(0); playSound('incorrect'); }
    setFlash({ ok, text: `${word.article} ${word.bare}` });
    setTimeout(() => { setFlash(null); setWord(pick(word.id)); }, ok ? 450 : 1100);
  };
  return (
    <>
      <GameHeader title="De of het?" onExit={onExit}>
        <span className={`game-timer ${left <= 10 ? 'low' : ''}`} aria-label={`${left} segundos`}><Icon name="clock" size={18} /> {left}</span>
        <span className="game-points" aria-label={`${score} pontos`}><Icon name="star" size={18} /> {score}</span>
      </GameHeader>
      <div className="game-bar" aria-hidden="true"><span style={{ width: `${(left / 45) * 100}%` }} /></div>
      <div className={`article-card ${flash ? (flash.ok ? 'ok' : 'bad') : ''}`} key={word.id}>
        <p className="game-word" lang="nl">{flash ? flash.text : `___ ${word.bare}`}</p>
        <p className="muted">{word.pt}</p>
      </div>
      <div className="article-buttons">
        <button type="button" className="article-btn de" onClick={() => choose('de')} lang="nl">de</button>
        <button type="button" className="article-btn het" onClick={() => choose('het')} lang="nl">het</button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Ouve e toca: ouvir a palavra e tocar na que se ouviu (10 rondas).
// ---------------------------------------------------------------------------
const LISTEN_ROUNDS = 10;

function ListenGame({ words, rate, onExit, onDone, best }: GameProps & { rate: number }) {
  const [run, setRun] = useState(0);
  return <ListenRun key={run} words={words} rate={rate} onExit={onExit} onDone={onDone} best={best} onAgain={() => setRun((r) => r + 1)} />;
}

function ListenRun({ words, rate, onExit, onDone, best, onAgain }: GameProps & { rate: number; onAgain: () => void }) {
  const [n, setN] = useState(0);
  const [round, setRound] = useState<ChoiceRound | null>(() => choiceRound(words, Math.random));
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [bestBefore] = useState(best);
  const over = n >= LISTEN_ROUNDS;
  useEffect(() => { if (round && !over) void speak(round.word.nl, rate); }, [round, over, rate]);
  useEffect(() => { if (over) onDone(score); }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!round) return <p className="notice">Precisa de mais palavras para este jogo. Faça mais umas lições!</p>;
  if (over) return <GameOver title="Ouve e toca" score={score} unit={`de ${LISTEN_ROUNDS}`} best={bestBefore} onAgain={onAgain} onExit={onExit} />;

  const choose = (w: GameWord) => {
    if (picked) return;
    setPicked(w.id);
    const ok = w.id === round.word.id;
    if (ok) { setScore((s) => s + 1); playSound('correct'); } else playSound('incorrect');
    setTimeout(() => { setPicked(null); setN((x) => x + 1); setRound(choiceRound(words, Math.random, round.word.id)); }, ok ? 600 : 1300);
  };
  return (
    <>
      <GameHeader title="Ouve e toca" onExit={onExit}>
        <span className="game-points">{Math.min(n + 1, LISTEN_ROUNDS)}/{LISTEN_ROUNDS}</span>
        <span className="game-points" aria-label={`${score} certas`}><Icon name="check" size={18} /> {score}</span>
      </GameHeader>
      <button type="button" className="listen-big" onClick={() => void speak(round.word.nl, rate)} aria-label="Ouvir outra vez">
        <Icon name="sound" size={44} />
      </button>
      <p className="muted center small">Toque no altifalante para ouvir outra vez.</p>
      <div className="game-options">
        {round.options.map((o) => (
          <button key={o.id} type="button" lang="nl" className={`game-option ${picked ? (o.id === round.word.id ? 'right' : o.id === picked ? 'wrong' : 'dim') : ''}`}
            onClick={() => choose(o)}>{o.nl}{picked && <span className="game-option-pt"> · {o.pt}</span>}</button>
        ))}
      </div>
    </>
  );
}
