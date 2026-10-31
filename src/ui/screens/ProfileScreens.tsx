import { useEffect, useState } from 'react';
import type { Achievement, DailyStat, ExerciseAttempt, ReviewSchedule, StudySession } from '../../domain/progress.ts';
import {
  ACHIEVEMENTS, deleteAllData, exportAllData, getAchievements, getAllReviews, getDailyStats, getRecentAttempts, getSessions, importAllData, saveProfile,
} from '../../data/progressRepo.ts';
import { contentRepo } from '../../data/contentRepo.ts';
import { currentStreak, lastNDays, localDate, longestStreak, orderedUnits } from '../../engine/progression.ts';
import { isMastered } from '../../engine/srs.ts';
import { hasDutchVoice, loadVoices, speak } from '../../services/speech.ts';
import { configureSounds, playSound } from '../../services/sounds.ts';
import { APP_CONFIG } from '../../config/app.ts';
import { useAppData } from '../AppState.tsx';
import { Card, formatMinutes, Icon } from '../components/common.tsx';
import { href } from '../router.ts';
import { exerciseTypeLabel } from './ReviewScreens.tsx';

// ---------------------------------------------------------------------------
// Perfil
// ---------------------------------------------------------------------------
export function ProfileScreen() {
  const app = useAppData();
  const { profile, completed } = app;
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [reviews, setReviews] = useState<ReviewSchedule[]>([]);
  const [name, setName] = useState(profile.displayName);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    void getAchievements().then(setAchievements);
    void getAllReviews().then(setReviews);
  }, [profile.totalXp]);
  const today = localDate();
  const unlocked = new Map(achievements.map((a) => [a.id, a]));
  const unitsDone = app.countUnits(completed);
  const published = orderedUnits(app.index).reduce((n, u) => n + u.lessonIds.length, 0);

  return (
    <div className="page">
      <h1>Perfil</h1>
      <Card>
        <form className="row" onSubmit={async (e) => {
          e.preventDefault();
          await saveProfile({ ...profile, displayName: name.trim().slice(0, 40) });
          setSaved(true);
          await app.refresh();
        }}>
          <label className="field grow">
            <span>Como quer ser tratado/a? (opcional)</span>
            <input className="text-input" value={name} maxLength={40} onChange={(e) => { setName(e.target.value); setSaved(false); }} placeholder="O seu nome" />
          </label>
          <button className="btn btn-secondary" type="submit">Guardar</button>
          {saved && <span className="small ok-text" role="status">Guardado.</span>}
        </form>
        <p className="muted small">O nome fica apenas neste dispositivo.</p>
      </Card>
      <dl className="stat-grid">
        <div><dt>XP total</dt><dd>{profile.totalXp}</dd></div>
        <div><dt>Lições concluídas</dt><dd>{completed.size}<span className="muted small"> / {published}</span></dd></div>
        <div><dt>Unidades concluídas</dt><dd>{unitsDone}</dd></div>
        <div><dt>Tempo de estudo</dt><dd>{formatMinutes(profile.totalStudySeconds)}</dd></div>
        <div><dt>Palavras praticadas</dt><dd>{reviews.length}</dd></div>
        <div><dt>Palavras consolidadas</dt><dd>{reviews.filter(isMastered).length}</dd></div>
        <div><dt>Sequência atual</dt><dd>{currentStreak(profile.studyDays, today)} d</dd></div>
        <div><dt>Melhor sequência</dt><dd>{longestStreak(profile.studyDays)} d</dd></div>
        <div><dt>Dias com estudo</dt><dd>{profile.studyDays.length}</dd></div>
      </dl>
      <Card>
        <h2>Conquistas</h2>
        <ul className="achievements">
          {ACHIEVEMENTS.map((a) => {
            const u = unlocked.get(a.id);
            return (
              <li key={a.id} className={u ? 'unlocked' : 'locked'}>
                <span className="ach-icon" aria-hidden="true">{u ? a.icon : '·'}</span>
                <span><strong>{a.title}</strong><span className="muted small block">{a.description}</span>
                  {u && <span className="small ok-text block">Desbloqueada em {new Date(u.unlockedAt).toLocaleDateString('pt-PT')}</span>}</span>
              </li>
            );
          })}
        </ul>
      </Card>
      <div className="row">
        <a className="btn btn-secondary" href={href.stats()}><Icon name="chart" size={18} /> Estatísticas</a>
        <a className="btn btn-secondary" href={href.settings()}><Icon name="settings" size={18} /> Definições</a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estatísticas
// ---------------------------------------------------------------------------
export function StatsScreen() {
  const app = useAppData();
  const [daily, setDaily] = useState<DailyStat[] | null>(null);
  const [attempts, setAttempts] = useState<ExerciseAttempt[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const today = localDate();
  useEffect(() => {
    void getDailyStats().then(setDaily);
    void getRecentAttempts(lastNDays(today, 90)[0]!).then(setAttempts);
    void getSessions(20).then(setSessions);
  }, [today]);
  if (!daily) return <div className="page"><p className="loading" aria-busy="true">A carregar…</p></div>;

  const byDate = new Map(daily.map((d) => [d.date, d]));
  const days = lastNDays(today, 7);
  const maxXp = Math.max(app.settings.dailyGoalXp, ...days.map((d) => byDate.get(d)?.xp ?? 0));
  const total = daily.reduce((a, d) => ({ answers: a.answers + d.answers, correct: a.correct + d.correctAnswers }), { answers: 0, correct: 0 });

  const byType = groupAccuracy(attempts, (a) => a.exerciseType);
  const unitTitle = new Map(orderedUnits(app.index).map((u) => [u.id, u.title]));
  const byTopic = groupAccuracy(attempts.filter((a) => a.topic), (a) => a.topic!).filter((t) => t.n >= 5);
  const strong = [...byTopic].sort((a, b) => b.acc - a.acc).slice(0, 3);
  const weak = [...byTopic].filter((t) => t.acc < 0.8).sort((a, b) => a.acc - b.acc).slice(0, 3);
  const weekday = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('pt-PT', { weekday: 'short' });

  return (
    <div className="page">
      <h1>Estatísticas</h1>
      <p className="muted small">Estes números descrevem a sua prática nesta aplicação. Não são uma avaliação certificada de competência.</p>
      <Card>
        <h2>Últimos 7 dias</h2>
        <div className="bars" role="img" aria-label={`XP por dia: ${days.map((d) => `${weekday(d)} ${byDate.get(d)?.xp ?? 0}`).join(', ')}`}>
          {days.map((d) => {
            const xp = byDate.get(d)?.xp ?? 0;
            return (
              <div key={d} className="bar-col">
                <span className="bar-val">{xp || ''}</span>
                <div className={`bar ${xp >= app.settings.dailyGoalXp ? 'goal' : ''}`} style={{ height: `${Math.round((xp / maxXp) * 100)}%` }} />
                <span className="bar-label">{weekday(d)}</span>
              </div>
            );
          })}
        </div>
        <p className="muted small">Linha de objetivo: {app.settings.dailyGoalXp} XP/dia. Barras escuras = objetivo cumprido.</p>
      </Card>
      <dl className="stat-grid">
        <div><dt>Precisão global</dt><dd>{total.answers ? Math.round((total.correct / total.answers) * 100) : 0}%</dd></div>
        <div><dt>Respostas</dt><dd>{total.answers}</dd></div>
        <div><dt>Dias com estudo</dt><dd>{app.profile.studyDays.length}</dd></div>
      </dl>
      <div className="two-col">
        <Card>
          <h2>Temas fortes</h2>
          {strong.length ? <ul>{strong.map((t) => <li key={t.key}>{unitTitle.get(t.key) ?? t.key} — {Math.round(t.acc * 100)}%</li>)}</ul> : <p className="muted small">Precisa de mais respostas para calcular.</p>}
        </Card>
        <Card>
          <h2>Temas a rever</h2>
          {weak.length ? <ul>{weak.map((t) => <li key={t.key}>{unitTitle.get(t.key) ?? t.key} — {Math.round(t.acc * 100)}%</li>)}</ul> : <p className="muted small">Nenhum tema abaixo de 80% (com dados suficientes).</p>}
        </Card>
      </div>
      <Card>
        <h2>Precisão por tipo de exercício (90 dias)</h2>
        {byType.length ? (
          <table className="table">
            <thead><tr><th scope="col">Tipo</th><th scope="col">Respostas</th><th scope="col">Precisão</th></tr></thead>
            <tbody>{byType.map((t) => <tr key={t.key}><td>{exerciseTypeLabel(t.key)}</td><td>{t.n}</td><td>{Math.round(t.acc * 100)}%</td></tr>)}</tbody>
          </table>
        ) : <p className="muted small">Ainda sem dados.</p>}
      </Card>
      <Card>
        <h2>Histórico de sessões</h2>
        {sessions.length ? (
          <ul className="session-list">
            {sessions.map((s) => (
              <li key={s.id}>
                <span>{new Date(s.startedAt).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span>{s.kind === 'lesson' ? `Lição ${s.lessonId}` : 'Revisão'}</span>
                <span>+{s.xp} XP · {Math.round(s.accuracy * 100)}%</span>
              </li>
            ))}
          </ul>
        ) : <p className="muted small">Ainda sem sessões.</p>}
      </Card>
    </div>
  );
}

function groupAccuracy<T extends { correct: boolean }>(xs: T[], key: (x: T) => string) {
  const m = new Map<string, { n: number; c: number }>();
  for (const x of xs) {
    const k = key(x);
    const v = m.get(k) ?? { n: 0, c: 0 };
    v.n++;
    if (x.correct) v.c++;
    m.set(k, v);
  }
  return [...m].map(([k, v]) => ({ key: k, n: v.n, acc: v.c / v.n })).sort((a, b) => b.n - a.n);
}

// ---------------------------------------------------------------------------
// Definições
// ---------------------------------------------------------------------------
export function SettingsScreen() {
  const app = useAppData();
  const s = app.settings;
  const [voiceOk, setVoiceOk] = useState<boolean | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  useEffect(() => { void loadVoices().then(() => setVoiceOk(hasDutchVoice())); }, []);

  const download = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dutchpath-copia-${localDate()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('Cópia de segurança descarregada.');
  };

  return (
    <div className="page settings">
      <h1>Definições</h1>
      {msg && <p className="notice" role="status">{msg}</p>}

      <Card>
        <h2>Aprendizagem</h2>
        <label className="field">
          <span>Idioma da interface</span>
          <select className="text-input" value={s.interfaceLanguage} disabled><option value="pt-PT">Português (Portugal)</option></select>
        </label>
        <fieldset className="field">
          <legend>Objetivo diário</legend>
          <div className="row wrap">
            {[10, 20, 30, 50].map((g) => (
              <button key={g} type="button" className={`chip ${s.dailyGoalXp === g ? 'selected' : ''}`} aria-pressed={s.dailyGoalXp === g}
                onClick={() => app.updateSettings({ dailyGoalXp: g })}>
                {g} XP <span className="muted small">{g === 10 ? 'leve' : g === 20 ? 'regular' : g === 30 ? 'sério' : 'intenso'}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <Toggle label="Navegação livre" hint="Desbloqueia todas as unidades (útil se já tem conhecimentos)." checked={s.freeNavigation} onChange={(v) => app.updateSettings({ freeNavigation: v })} />
        <Toggle label="Tolerância a acentos" hint="Aceita respostas sem acentos, com um aviso." checked={s.lenientAccents} onChange={(v) => app.updateSettings({ lenientAccents: v })} />
        <Toggle label="Reduzir animações" checked={s.reducedMotion} onChange={(v) => app.updateSettings({ reducedMotion: v })} />
      </Card>

      <Card>
        <h2>Áudio</h2>
        <Toggle label="Pronúncia e exercícios de áudio" checked={s.audioEnabled} onChange={(v) => app.updateSettings({ audioEnabled: v })} />
        <Toggle label="Ler a resposta certa em voz alta" hint="Depois de cada exercício, ouve a frase certa em neerlandês." checked={s.speakAnswers} disabled={!s.audioEnabled} onChange={(v) => app.updateSettings({ speakAnswers: v })} />
        <Toggle label="Efeitos sonoros" hint="Sons curtos para resposta certa, quase certa, errada e lição concluída." checked={s.soundEffects} onChange={(v) => { app.updateSettings({ soundEffects: v }); if (v) { configureSounds({ enabled: true }); playSound('correct'); } }} />
        <label className="field">
          <span>Velocidade da voz: {s.speechRate.toFixed(2)}×</span>
          <input type="range" min={0.5} max={1.2} step={0.05} value={s.speechRate} onChange={(e) => app.updateSettings({ speechRate: Number(e.target.value) })} />
        </label>
        <button type="button" className="btn btn-secondary" onClick={() => speak('Goedemorgen! Hoe gaat het?', s.speechRate)}><Icon name="sound" size={18} /> Testar voz</button>
        <p className="muted small">
          {voiceOk === null ? 'A verificar vozes…' : voiceOk
            ? 'Foi encontrada uma voz neerlandesa neste dispositivo.'
            : 'Não foi encontrada uma voz neerlandesa. Pode instalá-la nas definições de voz/acessibilidade do sistema; até lá a pronúncia pode não ser fiel.'}
        </p>
      </Card>

      <Card>
        <h2>Notificações</h2>
        <Toggle label="Lembretes de estudo" hint="Ainda não disponível: lembretes fiáveis exigem instalar a aplicação ou um servidor de notificações. Nenhum dado é enviado." checked={false} disabled onChange={() => {}} />
      </Card>

      <Card>
        <h2>Privacidade e dados</h2>
        <p className="small">Todo o progresso fica guardado <strong>apenas neste navegador</strong> (IndexedDB). Não há conta, nem envio de dados pessoais para servidores.</p>
        <div className="row wrap">
          <button type="button" className="btn btn-secondary" onClick={download}>Exportar os meus dados</button>
          <label className="btn btn-secondary">
            Restaurar cópia…
            <input type="file" accept="application/json" className="visually-hidden" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                await importAllData(JSON.parse(await f.text()));
                setMsg('Cópia restaurada.');
                await app.refresh();
              } catch (err) { setMsg(`Erro: ${(err as Error).message}`); }
            }} />
          </label>
        </div>
        <details className="danger-zone">
          <summary>Apagar todos os dados</summary>
          <p className="small">Isto apaga definitivamente o progresso, revisões, conquistas e definições deste navegador. Escreva <strong>APAGAR</strong> para confirmar.</p>
          <div className="row">
            <input className="text-input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} aria-label="Escreva APAGAR para confirmar" />
            <button type="button" className="btn btn-danger" disabled={confirmText !== 'APAGAR'} onClick={async () => {
              await deleteAllData();
              contentRepo.clear();
              setConfirmText('');
              setMsg('Todos os dados foram apagados.');
              await app.refresh();
            }}>Apagar</button>
          </div>
        </details>
      </Card>

      <Card>
        <h2>Sobre</h2>
        <p className="small">{APP_CONFIG.name} · conteúdo {app.index.contentHash} · estrutura v{app.index.structureVersion}</p>
        <p className="small muted">O conteúdo atual é uma amostra inicial redigida com apoio de IA e ainda não revista por um falante nativo. Os níveis QECR são indicativos.</p>
      </Card>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`toggle ${disabled ? 'disabled' : ''}`}>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden="true" />
      <span><span className="toggle-label">{label}</span>{hint && <span className="muted small block">{hint}</span>}</span>
    </label>
  );
}
