import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Coffee, MessagesSquare, Pause, Play, RotateCcw, SkipForward, Square, Timer } from 'lucide-react';
import { api } from '../api';
import { Button, Field, PageHead } from '../components/ui';
import { invalidate, useApp, useMe } from '../state';
import { today } from '../../shared/dates';
import { getSubject } from '../../shared/subjects';
import type { MeResponse } from '../../shared/types';

type Mode = 'foco' | 'pausa';

function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((t, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = i === 2 ? 880 : 660;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.25);
    });
  } catch {
    /* sem áudio */
  }
}

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export function StudyTimerPage() {
  const me = useMe();
  const { toast, setMe } = useApp();
  const [params] = useSearchParams();
  const q = me.profile.questionnaire;
  const sessionKey = params.get('session');
  const sessionMinutes = Number(params.get('minutes')) || null;
  const sessionDate = params.get('date') ?? today();
  const [subject, setSubject] = useState(params.get('subject') ?? q?.difficult[0] ?? q?.subjects[0] ?? '');
  const [focus, setFocus] = useState(sessionMinutes ?? me.profile.settings.focusMinutes);
  const [pause, setPause] = useState(me.profile.settings.breakMinutes);
  const [mode, setMode] = useState<Mode>('foco');
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(focus * 60_000);
  const [cycles, setCycles] = useState(0);
  const [studied, setStudied] = useState(0);
  const endAt = useRef<number | null>(null);
  const sessionUsed = useRef(false);
  const total = (mode === 'foco' ? focus : pause) * 60_000;

  useEffect(() => {
    if (!running) setRemaining((mode === 'foco' ? focus : pause) * 60_000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, pause, mode]);

  async function log(minutes: number) {
    if (minutes < 1) return;
    // Só o primeiro foco completo conta como a sessão do plano; os seguintes são tempo extra.
    const useSession = !!sessionKey && !sessionUsed.current && mode === 'foco';
    if (useSession) sessionUsed.current = true;
    await api('/logs', {
      method: 'POST',
      body: { date: useSession ? sessionDate : today(), subject: subject || null, minutes, source: 'timer', sessionKey: useSession ? sessionKey : null },
    }).catch(() => {});
    setStudied((s) => s + minutes);
    invalidate('/logs', '/stats');
  }

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const left = (endAt.current ?? Date.now()) - Date.now();
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        endAt.current = null;
        beep();
        if (mode === 'foco') {
          log(focus);
          setCycles((c) => c + 1);
          toast(sessionKey ? 'Sessão concluída e marcada como feita!' : `Muito bem! +${focus} min de estudo.`);
          setMode('pausa');
        } else {
          toast('Pausa terminada. Vamos a mais uma sessão?');
          setMode('foco');
        }
      }
    }, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  useEffect(() => {
    document.title = running ? `${fmt(remaining)} · ${mode === 'foco' ? 'Foco' : 'Pausa'} — STUDY AI` : 'STUDY AI';
    return () => {
      document.title = 'STUDY AI';
    };
  }, [remaining, running, mode]);

  function start() {
    endAt.current = Date.now() + remaining;
    setRunning(true);
  }

  function pauseTimer() {
    setRunning(false);
    endAt.current = null;
  }

  function reset() {
    pauseTimer();
    setRemaining(total);
  }

  async function finishEarly() {
    const minutes = Math.floor((total - remaining) / 60_000);
    pauseTimer();
    if (mode === 'foco' && minutes >= 1) {
      await log(minutes);
      toast(`Guardados ${minutes} min de estudo.`);
    }
    setMode('pausa');
  }

  async function saveSettings() {
    try {
      setMe(await api<MeResponse>('/profile/settings', { method: 'PUT', body: { focusMinutes: focus, breakMinutes: pause } }));
    } catch {
      /* fica só nesta sessão */
    }
  }

  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const subjName = subject ? getSubject(subject, q?.customSubjects).name : 'Estudo geral';

  return (
    <div>
      <PageHead title="Modo de estudo" sub="Concentra-te com o temporizador: foco, pausa curta e repete. O tempo conta para o teu progresso." />
      <div className="dash" style={{ marginTop: 0 }}>
        <div className="card pad-lg">
          <div className="timer-wrap">
            <span className={`badge ${mode === 'foco' ? 'yellow' : 'green'}`}>{mode === 'foco' ? <Timer /> : <Coffee />} {mode === 'foco' ? subjName : 'Pausa'}</span>
            <div className={`timer-ring ${mode === 'pausa' ? 'break' : ''}`}>
              <svg viewBox="0 0 100 100" aria-hidden>
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="4" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={mode === 'foco' ? 'var(--yellow)' : 'var(--success)'} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: running ? 'stroke-dashoffset 0.25s linear' : 'stroke-dashoffset 0.5s ease' }} />
              </svg>
              <div className="t-center">
                <span className="t-mode">{mode === 'foco' ? 'Foco' : 'Pausa'}</span>
                <span className="t-time" aria-live="polite">{fmt(remaining)}</span>
                <span className="small muted">{cycles} {cycles === 1 ? 'sessão feita' : 'sessões feitas'}</span>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
              <Button variant="ghost" size="lg" icon={<RotateCcw />} onClick={reset} aria-label="Recomeçar" />
              {running ? (
                <Button size="lg" icon={<Pause />} onClick={pauseTimer} style={{ minWidth: 150 }}>Pausar</Button>
              ) : (
                <Button size="lg" icon={<Play />} onClick={start} style={{ minWidth: 150 }}>{remaining < total ? 'Continuar' : 'Começar'}</Button>
              )}
              {mode === 'foco' ? (
                <Button variant="ghost" size="lg" icon={<Square />} onClick={finishEarly} aria-label="Terminar e guardar" title="Terminar e guardar o tempo" />
              ) : (
                <Button variant="ghost" size="lg" icon={<SkipForward />} onClick={() => { pauseTimer(); setMode('foco'); }} aria-label="Saltar pausa" title="Saltar pausa" />
              )}
            </div>
          </div>
        </div>
        <div className="stack lg">
          <div className="card">
            <div className="card-head"><span className="card-title"><Timer /> Configurar</span></div>
            <div className="stack">
              <Field label="Disciplina">
                <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={running}>
                  <option value="">Estudo geral</option>
                  {(q?.subjects ?? []).map((id) => <option key={id} value={id}>{getSubject(id, q?.customSubjects).name}</option>)}
                </select>
              </Field>
              <div className="grid-2" style={{ gap: 10 }}>
                <Field label="Foco (min)">
                  <select className="select" value={focus} disabled={running} onChange={(e) => setFocus(Number(e.target.value))} onBlur={saveSettings}>
                    {[...new Set([10, 15, 20, 25, 30, 40, 45, 50, 60, 90, focus])].sort((a, b) => a - b).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Pausa (min)">
                  <select className="select" value={pause} disabled={running} onChange={(e) => setPause(Number(e.target.value))} onBlur={saveSettings}>
                    {[3, 5, 10, 15, 20].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
              </div>
              {sessionKey && <p className="tiny faint">Sessão do plano: no fim do foco fica marcada como feita.</p>}
            </div>
          </div>
          <div className="card">
            <div className="row between"><span className="muted small">Estudado agora</span><b>{studied} min</b></div>
            <div className="divider" style={{ margin: '14px 0' }} />
            <p className="small muted">Ficaste com uma dúvida durante o estudo?</p>
            <Link to={`/chat${subject ? `?subject=${subject}` : ''}`} className="btn btn-secondary btn-block" style={{ marginTop: 10 }}><MessagesSquare /> Perguntar à IA</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
