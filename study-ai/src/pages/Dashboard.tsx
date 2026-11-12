import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CalendarDays, Check, ClipboardCheck, Clock, Flame, Info, Plus, Sparkles, Star, Target, Timer, Trash2, TrendingUp,
} from 'lucide-react';
import { api } from '../api';
import { Promo } from '../components/Promo';
import { SessionRow } from '../components/SessionRow';
import { SubjectIcon } from '../components/SubjectIcon';
import { Button, Empty, IconButton, Progress, Ring, Skeleton } from '../components/ui';
import { greeting, usePlanWeek } from '../planData';
import { invalidate, useMe, useQuery } from '../state';
import { daysBetween, formatDateLong, formatDateShort, formatMinutes, relativeDay, today } from '../../shared/dates';
import { AI_PLANS, imagesLeft, questionsLeft } from '../../shared/plans';
import { getSubject } from '../../shared/subjects';
import type { DailyGoal } from '../../shared/types';

interface Stats {
  streak: number;
  weekMinutes: number;
  days: { date: string; minutes: number }[];
}

export function DashboardPage() {
  const me = useMe();
  const navigate = useNavigate();
  const date = today();
  const q = me.profile.questionnaire;
  const custom = q?.customSubjects;
  const pw = usePlanWeek(date);
  const stats = useQuery<Stats>(`/stats?date=${date}`);
  const goalsQ = useQuery<{ goals: DailyGoal[] }>(`/goals?date=${date}`);
  const [newGoal, setNewGoal] = useState('');

  const sessions = pw.sessionsFor(date);
  const doneToday = sessions.filter((s) => pw.doneKeys.has(s.key)).length;
  const minutesToday = pw.logs.filter((l) => l.date === date).reduce((a, l) => a + l.minutes, 0);
  const plannedToday = sessions.reduce((a, s) => a + s.minutes, 0);
  const upcoming = pw.events.filter((e) => daysBetween(date, e.date) >= 0).slice(0, 5);
  const nextTest = upcoming.find((e) => e.type === 'teste');
  const plan = AI_PLANS[me.usage.plan];
  const left = questionsLeft(me.usage);
  const imgLeft = imagesLeft(me.usage);
  const favorites = me.profile.favorites.length ? me.profile.favorites : (q?.difficult ?? []).slice(0, 4);
  const firstName = me.user.name.split(' ')[0];

  let subline = 'Pronto para mais um dia de estudo?';
  if (nextTest) {
    const n = daysBetween(date, nextTest.date);
    subline = `${nextTest.title} ${n === 0 ? 'é hoje — boa sorte!' : n === 1 ? 'é amanhã. Hora da revisão final!' : `é ${relativeDay(nextTest.date, date)}.`}`;
  } else if (sessions.length) subline = `Hoje tens ${sessions.length} ${sessions.length === 1 ? 'sessão' : 'sessões'} de estudo no teu plano (${formatMinutes(plannedToday)}).`;
  else subline = 'Hoje não tens sessões no plano. Aproveita para rever ou falar com a IA.';

  async function addGoal(e: FormEvent) {
    e.preventDefault();
    if (!newGoal.trim()) return;
    await api('/goals', { method: 'POST', body: { date, text: newGoal.trim() } });
    setNewGoal('');
    invalidate('/goals');
  }

  async function toggleGoal(g: DailyGoal) {
    await api(`/goals/${g.id}`, { method: 'PUT', body: { done: !g.done } });
    invalidate('/goals');
  }

  async function removeGoal(g: DailyGoal) {
    await api(`/goals/${g.id}`, { method: 'DELETE' });
    invalidate('/goals');
  }

  const autoGoals = [
    sessions.length ? { text: `Fazer as ${sessions.length} sessões do plano de hoje`, done: doneToday >= sessions.length, extra: `${doneToday}/${sessions.length}` } : null,
    { text: `Estudar ${formatMinutes(plannedToday || q?.dailyMinutes || 30)} hoje`, done: minutesToday >= (plannedToday || q?.dailyMinutes || 30), extra: formatMinutes(minutesToday) },
  ].filter(Boolean) as { text: string; done: boolean; extra: string }[];

  return (
    <div>
      <section className="hero-card fade-up">
        <div className="row between top wrap">
          <div>
            <div className="small muted">{formatDateLong(date).replace(/^./, (c) => c.toUpperCase())}</div>
            <h1 style={{ marginTop: 6 }}>
              {greeting()}, {firstName}!
            </h1>
            <p className="hero-sub">{subline}</p>
          </div>
          <div className="row">
            <Link to="/estudar" className="btn btn-secondary btn-sm"><Timer /> Modo de estudo</Link>
            <Link to="/testes" className="btn btn-secondary btn-sm"><ClipboardCheck /> Criar teste</Link>
          </div>
        </div>
        <button type="button" className="hero-ai" onClick={() => navigate('/chat')}>
          <span className="ai-ic"><Sparkles /></span>
          <span>
            <b>Falar com a IA</b>
            <span>Tira dúvidas, resolve exercícios, faz resumos e prepara testes · {plan.name}</span>
          </span>
          <ArrowRight />
        </button>
      </section>

      {!me.ai.configured && (
        <div className="notice fade-up" style={{ marginTop: 16, ['--i' as string]: 1 }}>
          <Info />
          <div>
            <b>A IA ainda não está ligada.</b> {me.ai.message}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }} className="slot-gap"><Promo slot="inicio" /></div>

      <div className="stats-row" style={{ marginTop: 18 }}>
        <div className="stat fade-up" style={{ ['--i' as string]: 1 }}>
          <span className="stat-label"><Clock /> Hoje</span>
          <span className="stat-value">{minutesToday}<small>/ {plannedToday || q?.dailyMinutes || 0} min</small></span>
        </div>
        <div className="stat fade-up" style={{ ['--i' as string]: 2 }}>
          <span className="stat-label"><Flame /> Sequência</span>
          <span className="stat-value">{stats.data?.streak ?? 0}<small>{stats.data?.streak === 1 ? 'dia' : 'dias'}</small></span>
        </div>
        <div className="stat fade-up" style={{ ['--i' as string]: 3 }}>
          <span className="stat-label"><TrendingUp /> Esta semana</span>
          <span className="stat-value">{formatMinutes(stats.data?.weekMinutes ?? 0)}</span>
        </div>
        <Link to="/planos" className="stat fade-up" style={{ ['--i' as string]: 4 }}>
          <span className="stat-label"><Sparkles /> Perguntas disponíveis</span>
          <span className="stat-value">{left === null ? '∞' : left}<small>{left === null ? 'ilimitadas' : `de ${me.usage.questionsLimit} hoje`}</small></span>
        </Link>
      </div>

      <div className="dash">
        <div className="stack lg">
          <section className="card fade-up" style={{ ['--i' as string]: 2 }}>
            <div className="card-head">
              <span className="card-title"><CalendarDays /> Plano de hoje</span>
              <Link to="/plano" className="btn btn-ghost btn-sm">Ver semana <ArrowRight /></Link>
            </div>
            {pw.loading ? (
              <div className="stack"><Skeleton height={56} /><Skeleton height={56} /></div>
            ) : sessions.length ? (
              <div className="stack" style={{ gap: 8 }}>
                <div className="row between small muted" style={{ marginBottom: 2 }}>
                  <span>{doneToday} de {sessions.length} feitas</span>
                  <span>{formatMinutes(plannedToday)}</span>
                </div>
                <Progress value={doneToday} max={sessions.length} thin />
                <div className="stack" style={{ gap: 8, marginTop: 6 }}>
                  {sessions.map((s) => (
                    <SessionRow key={s.key} s={s} custom={custom} done={pw.doneKeys.has(s.key)} busy={pw.busy === s.key} onToggle={() => pw.toggleDone(s)} showHint />
                  ))}
                </div>
              </div>
            ) : (
              <Empty icon={<CalendarDays />} title="Dia livre" text="Hoje não há sessões no teu plano. Podes adicionar uma no Plano de estudos." action={<Link to="/plano" className="btn btn-secondary btn-sm">Abrir plano</Link>} />
            )}
          </section>

          <section className="card fade-up" style={{ ['--i' as string]: 3 }}>
            <div className="card-head">
              <span className="card-title"><Target /> Objetivos da semana</span>
              <span className="tiny faint">{formatDateShort(pw.week)} – {formatDateShort(pw.weekEnd)}</span>
            </div>
            {pw.plan?.weeklyGoals.length ? (
              <div className="stack" style={{ gap: 14 }}>
                {pw.plan.weeklyGoals.map((g) => {
                  const p = pw.goalProgress(g);
                  return (
                    <div key={g.id}>
                      <div className="row between" style={{ marginBottom: 7 }}>
                        <span className="row" style={{ gap: 10 }}>
                          {g.kind === 'check' ? (
                            <button type="button" className={`check round ${p.done ? 'on' : ''}`} onClick={() => pw.toggleCheck(g.id, !p.done)} aria-label="Marcar objetivo">
                              <Check />
                            </button>
                          ) : (
                            <span className={`check round ${p.done ? 'on' : ''}`} aria-hidden><Check /></span>
                          )}
                          <span className={p.done ? 'faint' : ''} style={p.done ? { textDecoration: 'line-through' } : undefined}>{g.text}</span>
                        </span>
                        {g.kind !== 'check' && <span className="tiny muted nowrap">{g.kind === 'minutes' ? `${p.value}/${p.target} min` : `${p.value}/${p.target}`}</span>}
                      </div>
                      {g.kind !== 'check' && <Progress value={p.value} max={p.target} thin green={p.done} />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted small">Sem objetivos para esta semana.</p>
            )}
          </section>
        </div>

        <div className="stack lg">
          <section className="card fade-up" style={{ ['--i' as string]: 3 }}>
            <div className="card-head">
              <span className="card-title"><ClipboardCheck /> Próximos testes e trabalhos</span>
              <Link to="/plano/calendario" className="icon-btn sm" aria-label="Abrir calendário"><Plus /></Link>
            </div>
            {upcoming.length ? (
              <div>
                {upcoming.map((e) => {
                  const n = daysBetween(date, e.date);
                  return (
                    <div key={e.id} className="list-item">
                      <SubjectIcon id={e.subject} custom={custom} size="sm" />
                      <div className="grow">
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div>
                        <div className="tiny muted">{e.type === 'teste' ? 'Teste' : e.type === 'trabalho' ? 'Trabalho' : 'Evento'} · {formatDateShort(e.date)}</div>
                      </div>
                      <span className={`badge ${n <= 3 ? 'yellow' : ''}`}>{n === 0 ? 'Hoje' : n === 1 ? 'Amanhã' : `${n} dias`}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted small">Sem testes marcados. <Link to="/plano/calendario" className="yellow">Marcar no calendário</Link></p>
            )}
          </section>

          <section className="card fade-up" style={{ ['--i' as string]: 4 }}>
            <div className="card-head"><span className="card-title"><Check /> Objetivos de hoje</span></div>
            {autoGoals.map((g) => (
              <div key={g.text} className={`goal-item ${g.done ? 'done' : ''}`}>
                <span className={`check round ${g.done ? 'on' : ''}`} aria-hidden><Check /></span>
                <span className="goal-text grow">{g.text}</span>
                <span className="tiny faint">{g.extra}</span>
              </div>
            ))}
            {(goalsQ.data?.goals ?? []).map((g) => (
              <div key={g.id} className={`goal-item ${g.done ? 'done' : ''}`}>
                <button type="button" className={`check round ${g.done ? 'on' : ''}`} onClick={() => toggleGoal(g)} aria-label="Marcar objetivo"><Check /></button>
                <span className="goal-text grow">{g.text}</span>
                <IconButton label="Apagar objetivo" small onClick={() => removeGoal(g)}><Trash2 /></IconButton>
              </div>
            ))}
            <form onSubmit={addGoal} className="row" style={{ marginTop: 10 }}>
              <input className="input" style={{ height: 38 }} value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Novo objetivo para hoje…" maxLength={140} />
              <Button type="submit" variant="secondary" size="sm" disabled={!newGoal.trim()} icon={<Plus />}>Adicionar</Button>
            </form>
          </section>

          <section className="card fade-up" style={{ ['--i' as string]: 5 }}>
            <div className="card-head">
              <span className="card-title"><Star /> Disciplinas favoritas</span>
              <Link to="/disciplinas" className="btn btn-ghost btn-sm">Todas</Link>
            </div>
            {favorites.length ? (
              <div className="row wrap">
                {favorites.map((id) => (
                  <Link key={id} to={`/disciplinas/${id}`} className="chip">
                    <SubjectIcon id={id} custom={custom} size="sm" />
                    {getSubject(id, custom).name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted small">Marca disciplinas com ☆ na página Disciplinas.</p>
            )}
          </section>

          <Link to="/planos" className="card interactive fade-up" style={{ ['--i' as string]: 6 }}>
            <div className="row" style={{ gap: 16 }}>
              <Ring value={left ?? 1} max={me.usage.questionsLimit ?? 1} size={68}>
                <span style={{ fontSize: left === null ? 22 : 17 }}>{left === null ? '∞' : left}</span>
              </Ring>
              <div className="grow">
                <div className="row between">
                  <b>{plan.name}</b>
                  <span className="badge yellow">{plan.price}</span>
                </div>
                <div className="small muted" style={{ marginTop: 4 }}>
                  {left === null ? 'Perguntas ilimitadas' : `${left} de ${me.usage.questionsLimit} perguntas disponíveis hoje`}
                </div>
                <div className="tiny faint" style={{ marginTop: 2 }}>
                  {imgLeft === 0 && me.usage.imagesLimit === 0
                    ? 'Sem envio de imagens'
                    : imgLeft === null
                      ? `Imagens ilimitadas${me.usage.files ? ' · ficheiros' : ''}`
                      : `${imgLeft} de ${me.usage.imagesLimit} imagens hoje`}
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
