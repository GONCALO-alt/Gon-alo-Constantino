// Modo ditado: lê um resumo frase a frase, devagar e com pausas, para escrever (ou decorar)
// sem ter de olhar para o ecrã.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Repeat, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { canSpeak, dictationChunks, speakOne, stopSpeaking, unlockSpeech } from '../speech';
import { Button, IconButton, Modal } from './ui';

const SPEEDS = [
  { id: 'lenta', label: 'Lenta', rate: 0.7 },
  { id: 'normal', label: 'Normal', rate: 0.9 },
  { id: 'rapida', label: 'Rápida', rate: 1.1 },
] as const;
const PAUSES = [
  { id: 'sem', label: 'Sem pausa', perWord: 0 },
  { id: 'curta', label: 'Curta', perWord: 0.45 },
  { id: 'longa', label: 'Longa', perWord: 0.9 },
] as const;
type SpeedId = (typeof SPEEDS)[number]['id'];
type PauseId = (typeof PAUSES)[number]['id'];

const KEY = 'study-ai:ditado';
function loadPrefs(): { speed: SpeedId; pause: PauseId; twice: boolean } {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return {
      speed: SPEEDS.some((s) => s.id === p.speed) ? p.speed : 'lenta',
      pause: PAUSES.some((s) => s.id === p.pause) ? p.pause : 'curta',
      twice: !!p.twice,
    };
  } catch {
    return { speed: 'lenta', pause: 'curta', twice: false };
  }
}

/** Mantém o ecrã ligado durante o ditado (onde o navegador deixa). */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let lock: { release(): Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<{ release(): Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});
    return () => void lock?.release().catch(() => {});
  }, [active]);
}

export function DictationModal({ text, title, onClose }: { text: string | null; title?: string; onClose: () => void }) {
  const chunks = useMemo(() => (text ? dictationChunks(text) : []), [text]);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<'a-ler' | 'a-escrever' | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const run = useRef(0);
  const open = text !== null;
  useWakeLock(open && playing);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      /* sem armazenamento */
    }
  }, [prefs]);

  const halt = useCallback(() => {
    run.current++;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    stopSpeaking();
    setPhase(null);
  }, []);

  /** Lê a frase `i` (duas vezes, se escolhido), espera o tempo de escrever e passa à seguinte. */
  const playFrom = useCallback(
    (i: number) => {
      halt();
      if (i >= chunks.length) {
        setPlaying(false);
        setIndex(chunks.length - 1);
        return;
      }
      const id = run.current;
      setIndex(i);
      setPlaying(true);
      const rate = SPEEDS.find((s) => s.id === prefs.speed)!.rate;
      const perWord = PAUSES.find((p) => p.id === prefs.pause)!.perWord;
      const sentence = chunks[i]!;
      const words = sentence.split(/\s+/).length;
      const read = (times: number) => {
        setPhase('a-ler');
        speakOne(sentence, {
          rate,
          onEnd: () => {
            if (id !== run.current) return;
            if (times > 1) {
              timer.current = setTimeout(() => id === run.current && read(times - 1), 700);
              return;
            }
            const wait = perWord ? Math.max(1500, words * perWord * 1000 * (0.9 / rate)) : 250;
            setPhase(perWord ? 'a-escrever' : 'a-ler');
            timer.current = setTimeout(() => id === run.current && playFrom(i + 1), wait);
          },
        });
      };
      read(prefs.twice ? 2 : 1);
    },
    [chunks, prefs, halt],
  );

  // Ao abrir: volta ao início e espera pelo «Começar» (o iPhone só fala depois de um toque).
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
    halt();
  }, [text, halt]);
  useEffect(() => halt, [halt]);

  function close() {
    halt();
    setPlaying(false);
    onClose();
  }

  function toggle() {
    if (playing) {
      halt();
      setPlaying(false);
    } else {
      unlockSpeech();
      playFrom(index >= chunks.length - 1 && phase === null && index > 0 ? 0 : index);
    }
  }

  const go = (i: number) => {
    const j = Math.max(0, Math.min(chunks.length - 1, i));
    if (playing) playFrom(j);
    else setIndex(j);
  };

  const change = (patch: Partial<typeof prefs>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    if (playing) {
      halt();
      setPlaying(false);
    }
  };

  const atEnd = !playing && index === chunks.length - 1 && chunks.length > 1;
  return (
    <Modal open={open} onClose={close} title={title ? `Ditado · ${title}` : 'Modo ditado'}>
      {!canSpeak() ? (
        <p className="muted">Este navegador não consegue ler em voz alta. Experimenta o Safari ou o Chrome.</p>
      ) : (
        <div className="dictation">
          <div className="dictation-progress tiny faint">
            Frase {Math.min(index + 1, chunks.length)} de {chunks.length}
            {phase === 'a-escrever' && <span className="yellow"> · tempo para escrever ✍️</span>}
          </div>
          <div className="dictation-now" aria-live="polite">{chunks[index] ?? ''}</div>
          {chunks[index + 1] && <div className="dictation-next">{chunks[index + 1]}</div>}

          <div className="dictation-controls">
            <IconButton label="Frase anterior" onClick={() => go(index - 1)} disabled={index === 0}><SkipBack /></IconButton>
            <IconButton label="Repetir esta frase" onClick={() => (playing ? playFrom(index) : (unlockSpeech(), playFrom(index)))}><RotateCcw /></IconButton>
            <button type="button" className="dictation-play" onClick={toggle} aria-label={playing ? 'Pausar' : atEnd ? 'Ler de novo' : 'Começar'}>
              {playing ? <Pause /> : <Play />}
            </button>
            <IconButton label="Frase seguinte" onClick={() => go(index + 1)} disabled={index >= chunks.length - 1}><SkipForward /></IconButton>
            <IconButton label="Ler cada frase duas vezes" active={prefs.twice} onClick={() => change({ twice: !prefs.twice })}><Repeat /></IconButton>
          </div>
          <div className="center small muted">{playing ? 'A ler… podes escrever sem olhar.' : atEnd ? 'Chegaste ao fim. Toca para ler de novo.' : 'Toca em ▶ para começar.'}</div>

          <div className="dictation-options">
            <div>
              <div className="tiny faint">Velocidade</div>
              <div className="seg">
                {SPEEDS.map((s) => (
                  <button key={s.id} type="button" className={prefs.speed === s.id ? 'on' : ''} onClick={() => change({ speed: s.id })}>{s.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="tiny faint">Pausa para escrever</div>
              <div className="seg">
                {PAUSES.map((p) => (
                  <button key={p.id} type="button" className={prefs.pause === p.id ? 'on' : ''} onClick={() => change({ pause: p.id })}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>
          <p className="tiny faint center">Para decorar: ouve uma vez a ler, depois tenta dizer cada frase antes de a IA a ler. 🧠</p>
          <Button variant="ghost" block onClick={close}>Fechar</Button>
        </div>
      )}
    </Modal>
  );
}
