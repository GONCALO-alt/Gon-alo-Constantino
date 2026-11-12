import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChartColumn, Check, ClipboardCheck, Clock, Flame, Layers, MessagesSquare, Table2, Target, TrendingUp } from 'lucide-react';
import { Empty, PageHead, Progress, Skeleton, Tabs } from '../components/ui';
import { usePlanWeek } from '../planData';
import { useMe, useQuery } from '../state';
import { formatDateShort, formatMinutes, isoWeekday, today, WEEKDAYS_SHORT } from '../../shared/dates';
import { getSubject } from '../../shared/subjects';

interface Stats {
  today: string;
  days: { date: string; minutes: number }[];
  streak: number;
  weekMinutes: number;
  weekSubjects: { subject: string | null; minutes: number }[];
  allSubjects: { subject: string | null; minutes: number }[];
  weekSessions: number;
  totalMinutes: number;
  questions: number;
  summaries: number;
  conversations: number;
  cards: { total: number; mastered: number };
  reviewsToday: number;
  reviewDays: number;
  tests: { id: string; title: string; subject: string | null; score: number; maxScore: number; completedAt: string }[];
}

/** Gráfico de barras de uma só série (minutos por dia), com tooltip ao passar/tocar. */
function DailyBars({ data, todayDate }: { data: { date: string; minutes: number }[]; todayDate: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = 220;
  const pad = { top: 22, right: 8, bottom: 26, left: 36 };
  const max = Math.max(30, ...data.map((d) => d.minutes));
  const step = max <= 60 ? 15 : max <= 120 ? 30 : max <= 240 ? 60 : 120;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const innerW = Math.max(10, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / data.length;
  const barW = Math.max(3, Math.min(28, slot - 2));
  const y = (v: number) => pad.top + innerH - (v / top) * innerH;
  const maxIdx = data.reduce((best, d, i) => (d.minutes > (data[best]?.minutes ?? 0) ? i : best), 0);
  const labelEvery = data.length > 16 ? Math.ceil(data.length / 8) : 1;
  const hovered = hover !== null ? data[hover] : null;

  const barPath = (x: number, h: number) => {
    const r = Math.min(4, barW / 2, h);
    const b = pad.top + innerH;
    return `M${x},${b} L${x},${b - h + r} Q${x},${b - h} ${x + r},${b - h} L${x + barW - r},${b - h} Q${x + barW},${b - h} ${x + barW},${b - h + r} L${x + barW},${b} Z`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }} onMouseLeave={() => setHover(null)}>
      <svg className="chart" width={width} height={height} role="img" aria-label="Minutos de estudo por dia">
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.left + i * slot + (slot - barW) / 2;
          const h = d.minutes > 0 ? Math.max(3, (d.minutes / top) * innerH) : 0;
          return (
            <g key={d.date}>
              {h > 0 && <path d={barPath(x, h)} className="bar" style={{ opacity: hover === null || hover === i ? 1 : 0.45 }} />}
              {d.minutes === 0 && <rect x={x} y={pad.top + innerH - 2} width={barW} height={2} rx={1} className="bar zero" />}
              {(i % labelEvery === 0 || d.date === todayDate) && (
                <text x={x + barW / 2} y={height - 8} textAnchor="middle" style={d.date === todayDate ? { fill: 'var(--text)', fontWeight: 600 } : undefined}>
                  {data.length <= 7 ? WEEKDAYS_SHORT[isoWeekday(d.date)] : d.date === todayDate ? 'Hoje' : formatDateShort(d.date)}
                </text>
              )}
              {i === maxIdx && d.minutes > 0 && hover === null && (
                <text x={x + barW / 2} y={y(d.minutes) - 7} textAnchor="middle" style={{ fill: 'var(--text-2)', fontWeight: 600 }}>{d.minutes}</text>
              )}
              <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent"
                onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
            </g>
          );
        })}
      </svg>
      {hovered && hover !== null && (
        <div className="chart-tip" style={{ left: pad.left + hover * slot + slot / 2, top: y(hovered.minutes) }}>
          <b>{formatMinutes(hovered.minutes)}</b> <span className="muted">· {formatDateShort(hovered.date)}</span>
        </div>
      )}
    </div>
  );
}

export function ProgressPage() {
  const me = useMe();
  const custom = me.profile.questionnaire?.customSubjects;
  const date = today();
  const stats = useQuery<Stats>(`/stats?date=${date}`);
  const pw = usePlanWeek(date);
  const [range, setRange] = useState<'7' | '30'>('7');
  const [scope, setScope] = useState<'semana' | 'sempre'>('semana');
  const [table, setTable] = useState(false);

  if (stats.loading) return <div className="stack"><Skeleton height={100} /><Skeleton height={260} /></div>;
  const s = stats.data;
  if (!s) return <Empty icon={<ChartColumn />} title="Sem dados" text="Não foi possível carregar as estatísticas." />;

  const days = range === '7' ? s.days.slice(-7) : s.days;
  const subjects = (scope === 'semana' ? s.weekSubjects : s.allSubjects).filter((x) => x.minutes > 0);
  const maxSub = Math.max(1, ...subjects.map((x) => x.minutes));
  const avg = s.tests.length ? Math.round((s.tests.reduce((a, t) => a + t.score / t.maxScore, 0) / s.tests.length) * 100) : null;
  const rangeTotal = days.reduce((a, d) => a + d.minutes, 0);
  const goals = pw.plan?.weeklyGoals ?? [];
  const goalsDone = goals.filter((g) => pw.goalProgress(g).done).length;

  return (
    <div>
      <PageHead title="Progresso" sub="O teu tempo de estudo, os objetivos e os resultados dos testes." />
      <div className="stats-row">
        <div className="stat fade-up" style={{ ['--i' as string]: 1 }}><span className="stat-label"><Clock /> Total estudado</span><span className="stat-value">{formatMinutes(s.totalMinutes)}</span></div>
        <div className="stat fade-up" style={{ ['--i' as string]: 2 }}><span className="stat-label"><TrendingUp /> Esta semana</span><span className="stat-value">{formatMinutes(s.weekMinutes)}</span></div>
        <div className="stat fade-up" style={{ ['--i' as string]: 3 }}><span className="stat-label"><Flame /> Sequência</span><span className="stat-value">{s.streak}<small>{s.streak === 1 ? 'dia' : 'dias'}</small></span></div>
        <div className="stat fade-up" style={{ ['--i' as string]: 4 }}><span className="stat-label"><MessagesSquare /> Perguntas à IA</span><span className="stat-value">{s.questions}</span></div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head wrap">
          <span className="card-title"><ChartColumn /> Minutos de estudo por dia</span>
          <div className="row">
            <Tabs value={range} onChange={setRange} items={[{ value: '7', label: '7 dias' }, { value: '30', label: '30 dias' }]} />
            <button type="button" className={`icon-btn ${table ? 'active' : ''}`} aria-label="Ver como tabela" title="Ver como tabela" onClick={() => setTable(!table)}><Table2 /></button>
          </div>
        </div>
        <p className="small muted" style={{ marginBottom: 10 }}>{formatMinutes(rangeTotal)} nos últimos {range} dias · média de {formatMinutes(Math.round(rangeTotal / days.length))} por dia</p>
        {table ? (
          <div style={{ maxHeight: 260, overflow: 'auto' }}>
            <table className="md" style={{ display: 'table', width: '100%', fontSize: 14 }}>
              <thead><tr><th>Dia</th><th style={{ textAlign: 'right' }}>Minutos</th></tr></thead>
              <tbody>{[...days].reverse().map((d) => <tr key={d.date}><td>{formatDateShort(d.date)}</td><td style={{ textAlign: 'right' }}>{d.minutes}</td></tr>)}</tbody>
            </table>
          </div>
        ) : (
          <DailyBars data={days} todayDate={date} />
        )}
        <p className="tiny faint" style={{ marginTop: 8 }}>Conta o tempo das sessões do plano que marcas como feitas e do modo de estudo com temporizador.</p>
      </div>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-head wrap">
            <span className="card-title"><Clock /> Tempo por disciplina</span>
            <Tabs value={scope} onChange={setScope} items={[{ value: 'semana', label: 'Semana' }, { value: 'sempre', label: 'Sempre' }]} />
          </div>
          {subjects.length ? subjects.map((x) => (
            <div key={x.subject ?? 'geral'} className="hbar">
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.subject ? getSubject(x.subject, custom).name : 'Geral / TPC'}</span>
              <span className="track"><div style={{ width: `${(x.minutes / maxSub) * 100}%`, background: 'var(--yellow)' }} /></span>
              <span className="v">{formatMinutes(x.minutes)}</span>
            </div>
          )) : <p className="muted small">Ainda não há tempo registado {scope === 'semana' ? 'esta semana' : ''}. Marca sessões como feitas ou usa o <Link to="/estudar" className="yellow">modo de estudo</Link>.</p>}
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title"><Target /> Objetivos da semana</span>
            <span className="badge yellow">{goalsDone}/{goals.length}</span>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {goals.map((g) => {
              const p = pw.goalProgress(g);
              return (
                <div key={g.id}>
                  <div className="row between small" style={{ marginBottom: 6 }}>
                    <span className="row" style={{ gap: 8 }}>{p.done && <Check size={15} color="var(--success)" />}{g.text}</span>
                    <span className="muted nowrap">{g.kind === 'check' ? (p.done ? 'Feito' : 'Por fazer') : `${p.value}/${p.target}${g.kind === 'minutes' ? ' min' : ''}`}</span>
                  </div>
                  <Progress value={p.value} max={p.target} thin green={p.done} />
                </div>
              );
            })}
            {!goals.length && <p className="muted small">Sem objetivos definidos.</p>}
          </div>
          <div className="divider" style={{ margin: '16px 0' }} />
          <div className="row between small"><span className="muted">Sessões do plano feitas esta semana</span><b>{s.weekSessions}</b></div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title"><ClipboardCheck /> Testes de preparação</span>
            {avg !== null && <span className="badge yellow">Média {avg}%</span>}
          </div>
          {s.tests.length ? s.tests.slice(0, 8).map((t) => {
            const pct = Math.round((t.score / t.maxScore) * 100);
            return (
              <Link key={t.id} to={`/testes/${t.id}`} className="list-item">
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                  <div className="tiny muted">{t.subject ? getSubject(t.subject, custom).name : 'Geral'} · {formatDateShort(t.completedAt.slice(0, 10))}</div>
                </div>
                <span className={`badge ${pct >= 50 ? 'green' : 'red'}`}>{pct >= 50 ? <Check /> : null}{pct}%</span>
              </Link>
            );
          }) : <p className="muted small">Ainda não terminaste nenhum teste. <Link to="/testes" className="yellow">Gerar um teste</Link></p>}
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title"><Layers /> Flashcards e materiais</span></div>
          <div className="stack" style={{ gap: 14 }}>
            <div>
              <div className="row between small" style={{ marginBottom: 6 }}><span>Cartões dominados</span><span className="muted">{s.cards.mastered}/{s.cards.total}</span></div>
              <Progress value={s.cards.mastered} max={s.cards.total || 1} thin green />
            </div>
            <div className="row between small"><span className="muted">Cartões revistos hoje</span><b>{s.reviewsToday}</b></div>
            <div className="row between small"><span className="muted">Dias com revisão esta semana</span><b>{s.reviewDays}</b></div>
            <div className="row between small"><span className="muted">Resumos guardados</span><b>{s.summaries}</b></div>
            <div className="row between small"><span className="muted">Conversas com a IA</span><b>{s.conversations}</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}
