import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, CalendarClock, Check, CircleCheck, ClipboardCheck, Clock, FileText, GraduationCap,
  Lightbulb, MessageCircleQuestion, NotebookPen, PenLine, Plus, Sparkles, Target, Trash2, TrendingUp, X,
} from 'lucide-react';
import { api } from '../api';
import { DEMO } from '../env';
import { Logo } from '../components/Logo';
import { SubjectIcon, subjectColor } from '../components/SubjectIcon';
import { Button, FormError, Progress } from '../components/ui';
import { invalidate, useApp, useMe } from '../state';
import { addDays, formatMinutes, today, WEEKDAYS, WEEKDAYS_SHORT } from '../../shared/dates';
import {
  customSubjectId, cycleLabel, defaultSubjectsForYear, getSubject, SUBJECT_LIST, suggestedSubjectsForYear, yearLabel,
} from '../../shared/subjects';
import {
  ACTIVITY_LABELS, GOAL_LABELS, STYLE_LABELS, type LearningStyle, type MainGoal, type MeResponse, type Questionnaire, type StudyPlan,
} from '../../shared/types';

const STEPS = ['nome', 'ano', 'disciplinas', 'dificuldades', 'facilidade', 'tempo', 'objetivo', 'estilo', 'testes'] as const;
type Step = (typeof STEPS)[number];

const GOALS: { id: MainGoal; icon: typeof Target; desc: string }[] = [
  { id: 'melhorar-notas', icon: TrendingUp, desc: 'Subir as notas nas disciplinas mais difíceis' },
  { id: 'preparar-testes', icon: ClipboardCheck, desc: 'Chegar aos testes bem preparado' },
  { id: 'trabalhos-casa', icon: NotebookPen, desc: 'Fazer os TPC sem ficar preso' },
  { id: 'aprender-melhor', icon: Lightbulb, desc: 'Perceber a matéria a sério' },
  { id: 'organizar-tempo', icon: CalendarClock, desc: 'Ter uma rotina de estudo' },
  { id: 'exames', icon: GraduationCap, desc: 'Preparar os exames nacionais' },
];

const STYLES: { id: LearningStyle; icon: typeof Target; desc: string }[] = [
  { id: 'resumos', icon: FileText, desc: 'A matéria organizada em pouco espaço' },
  { id: 'exercicios', icon: PenLine, desc: 'Aprender a fazer, praticando' },
  { id: 'explicacoes', icon: BookOpen, desc: 'Perceber o porquê de tudo' },
  { id: 'perguntas', icon: MessageCircleQuestion, desc: 'Testar-me com perguntas e flashcards' },
  { id: 'exemplos', icon: Lightbulb, desc: 'Ver a matéria aplicada ao dia a dia' },
];

const MINUTES = [
  { v: 20, l: 'Pouco tempo' },
  { v: 30, l: 'Meia hora' },
  { v: 45, l: '45 minutos' },
  { v: 60, l: '1 hora' },
  { v: 90, l: '1 h 30' },
  { v: 120, l: '2 horas' },
  { v: 180, l: '3 horas' },
];

const TIMES = Array.from({ length: 31 }, (_, i) => {
  const m = 7 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
});

const YEAR_GROUPS: { label: string; years: string[] }[] = [
  { label: '1.º ciclo', years: ['1', '2', '3', '4'] },
  { label: '2.º ciclo', years: ['5', '6'] },
  { label: '3.º ciclo', years: ['7', '8', '9'] },
  { label: 'Secundário', years: ['10', '11', '12'] },
];

function emptyQuestionnaire(name: string): Questionnaire {
  return {
    name,
    year: '',
    subjects: [],
    customSubjects: {},
    difficult: [],
    easy: [],
    dailyMinutes: 60,
    studyDays: [0, 1, 2, 3, 4],
    startTime: '17:30',
    goal: 'melhorar-notas',
    styles: [],
    tests: [],
  };
}

function Option({ on, onClick, icon, title, desc }: { on: boolean; onClick: () => void; icon: ReactNode; title: string; desc?: string }) {
  return (
    <button type="button" className={`option ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}>
      <span className="opt-icon">{icon}</span>
      <span className="grow">
        <span className="opt-title" style={{ display: 'block' }}>{title}</span>
        {desc && <span className="opt-desc" style={{ display: 'block' }}>{desc}</span>}
      </span>
      {on && (
        <span className="opt-check">
          <Check />
        </span>
      )}
    </button>
  );
}

function SubjectOption({ id, q, on, onClick }: { id: string; q: Questionnaire; on: boolean; onClick: () => void }) {
  const s = getSubject(id, q.customSubjects);
  return (
    <button type="button" className={`option ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}>
      <SubjectIcon id={id} custom={q.customSubjects} size="sm" />
      <span className="opt-title grow">{s.name}</span>
      {on && (
        <span className="opt-check">
          <Check />
        </span>
      )}
    </button>
  );
}

const GEN_STEPS = [
  'A analisar as tuas disciplinas',
  'A dar mais tempo às mais difíceis',
  'A distribuir as sessões pela semana',
  'A marcar revisões antes dos testes',
  'A definir os objetivos da semana',
];

export function OnboardingPage() {
  const me = useMe();
  const { setMe, toast } = useApp();
  const navigate = useNavigate();
  const editing = me.profile.onboarded;
  const [q, setQ] = useState<Questionnaire>(() => {
    const saved = me.profile.questionnaire;
    return saved ? { ...saved, tests: [] } : emptyQuestionnaire(me.user.name);
  });
  const [step, setStep] = useState(0);
  const [touchedSubjects, setTouchedSubjects] = useState(editing);
  const [showAll, setShowAll] = useState(false);
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');
  const [regenerate, setRegenerate] = useState(true);
  const [phase, setPhase] = useState<'form' | 'generating' | 'reveal'>('form');
  const [genIndex, setGenIndex] = useState(0);
  const [result, setResult] = useState<{ me: MeResponse; plan: StudyPlan | null } | null>(null);
  const [saving, setSaving] = useState(false);

  const current: Step = STEPS[step]!;
  const update = (patch: Partial<Questionnaire>) => {
    setError('');
    setQ((prev) => ({ ...prev, ...patch }));
  };

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  function chooseYear(year: string) {
    const patch: Partial<Questionnaire> = { year };
    if (!touchedSubjects) {
      patch.subjects = defaultSubjectsForYear(year);
      patch.difficult = [];
      patch.easy = [];
    }
    update(patch);
  }

  function toggleSubject(id: string) {
    setTouchedSubjects(true);
    const subjects = toggle(q.subjects, id);
    update({
      subjects,
      difficult: q.difficult.filter((x) => subjects.includes(x)),
      easy: q.easy.filter((x) => subjects.includes(x)),
    });
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    const id = customSubjectId(name);
    setTouchedSubjects(true);
    update({ customSubjects: { ...q.customSubjects, [id]: name }, subjects: q.subjects.includes(id) ? q.subjects : [...q.subjects, id] });
    setCustomName('');
  }

  function validateStep(): string {
    switch (current) {
      case 'nome':
        return q.name.trim() ? '' : 'Escreve o teu nome.';
      case 'ano':
        return q.year ? '' : 'Escolhe o teu ano.';
      case 'disciplinas':
        return q.subjects.length ? '' : 'Escolhe pelo menos uma disciplina.';
      case 'tempo':
        return q.studyDays.length ? '' : 'Escolhe pelo menos um dia para estudar.';
      case 'estilo':
        return q.styles.length ? '' : 'Escolhe pelo menos uma forma de aprender.';
      case 'testes':
        return q.tests.some((t) => !t.subject || !t.date) ? 'Completa a disciplina e a data de cada teste (ou remove-o).' : '';
      default:
        return '';
    }
  }

  function next() {
    const err = validateStep();
    if (err) return setError(err);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else submit();
  }

  function back() {
    setError('');
    if (step > 0) setStep(step - 1);
    else if (editing) navigate(-1);
  }

  async function submit() {
    setSaving(true);
    if (!editing || regenerate) {
      setPhase('generating');
      setGenIndex(0);
    }
    const started = Date.now();
    try {
      const res = await api<{ me: MeResponse; plan: StudyPlan | null }>('/profile/questionnaire', {
        method: 'PUT',
        body: { questionnaire: q, regenerate: !editing || regenerate },
      });
      invalidate('/plan', '/events', '/stats');
      if (editing && !regenerate) {
        setMe(res.me);
        toast('Respostas guardadas.');
        navigate('/definicoes');
        return;
      }
      const wait = Math.max(0, 3200 - (Date.now() - started));
      setTimeout(() => {
        setResult(res);
        setPhase('reveal');
      }, wait);
    } catch (err) {
      setPhase('form');
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (phase !== 'generating') return;
    const t = setInterval(() => setGenIndex((i) => Math.min(GEN_STEPS.length, i + 1)), 620);
    return () => clearInterval(t);
  }, [phase]);

  function finish() {
    if (!result) return;
    window.scrollTo({ top: 0 });
    setMe(result.me);
    navigate(editing ? '/plano' : '/planos?inicio=1');
  }

  const suggested = useMemo(() => (q.year ? suggestedSubjectsForYear(q.year) : []), [q.year]);
  const others = SUBJECT_LIST.map((s) => s.id).filter((id) => !suggested.includes(id));
  const customIds = q.subjects.filter((id) => id.startsWith('custom-'));

  if (phase === 'generating') {
    return (
      <div className="onb">
        <div className="onb-top">
          <Logo />
        </div>
        <div className="onb-body">
          <div className="gen">
            <div className="gen-orb">
              <div className="ring" />
              <div className="ring r2" />
              <div className="core">
                <Sparkles />
              </div>
            </div>
            <h1 style={{ fontSize: 30 }}>A criar o teu plano de estudos…</h1>
            <p className="muted" style={{ marginTop: 8 }}>A analisar as tuas respostas, {q.name.split(' ')[0]}.</p>
            <div className="gen-steps">
              {GEN_STEPS.map((s, i) => (
                <div key={s} className={`gen-step ${i < genIndex ? 'done' : i === genIndex ? 'doing' : ''}`}>
                  <span className="dot">{i < genIndex && <Check />}</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'reveal' && result) {
    return <PlanReveal plan={result.plan} q={q} me={result.me} onContinue={finish} editing={editing} />;
  }

  return (
    <div className="onb">
      <div className="onb-top">
        <Logo />
        <div className="onb-progress">
          <div className="row between tiny muted" style={{ marginBottom: 6 }}>
            <span>{editing ? 'Alterar respostas' : 'Vamos conhecer-te'}</span>
            <span>
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <Progress value={step + 1} max={STEPS.length} thin />
        </div>
        {editing && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/definicoes')} icon={<X />}>
            Sair
          </Button>
        )}
      </div>

      <div className="onb-body">
        <div className="onb-step" key={current}>
          {current === 'nome' && (
            <>
              <div className="onb-kicker"><Sparkles size={15} /> Bem-vindo à STUDY AI</div>
              <h1>Olá! Vamos criar o teu plano de estudos.</h1>
              <p className="lead">
                São 9 perguntas rápidas. Com as tuas respostas, a STUDY AI organiza o teu horário de estudo e adapta as explicações ao teu
                ano e à forma como aprendes melhor.
              </p>
              <label className="field" style={{ maxWidth: 420 }}>
                <span>Como queres que te trate?</span>
                <input className="input" style={{ height: 52, fontSize: 17 }} value={q.name} maxLength={60} autoFocus
                  onChange={(e) => update({ name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && next()} placeholder="O teu nome" />
              </label>
            </>
          )}

          {current === 'ano' && (
            <>
              <div className="onb-kicker">Pergunta 1</div>
              <h1>Em que ano estás?</h1>
              <p className="lead">As explicações da IA são adaptadas ao teu ano escolar.</p>
              {YEAR_GROUPS.map((g) => (
                <div key={g.label}>
                  <div className="section-label">{g.label}</div>
                  <div className="year-grid">
                    {g.years.map((y) => (
                      <button key={y} type="button" className={`year-btn ${q.year === y ? 'on' : ''}`} onClick={() => chooseYear(y)}>
                        <b>{y}.º</b>
                        <span>ano</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="section-label">Ensino superior</div>
              <div className="year-grid">
                <button type="button" className={`year-btn wide ${q.year === 'superior' ? 'on' : ''}`} onClick={() => chooseYear('superior')}>
                  <b style={{ fontSize: 16 }}>Universidade</b>
                  <span>ou politécnico</span>
                </button>
              </div>
            </>
          )}

          {current === 'disciplinas' && (
            <>
              <div className="onb-kicker">Pergunta 2</div>
              <h1>Que disciplinas tens?</h1>
              <p className="lead">
                {q.year && q.year !== 'superior'
                  ? `Já escolhemos as disciplinas habituais do ${yearLabel(q.year)}. Toca para tirar ou acrescentar.`
                  : 'Escolhe as tuas disciplinas ou escreve outras.'}
              </p>
              <div className="option-grid">
                {[...suggested, ...customIds.filter((id) => !suggested.includes(id))].map((id) => (
                  <SubjectOption key={id} id={id} q={q} on={q.subjects.includes(id)} onClick={() => toggleSubject(id)} />
                ))}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Esconder outras disciplinas' : 'Ver todas as disciplinas'}
              </button>
              {showAll && (
                <div className="option-grid fade-in" style={{ marginTop: 10 }}>
                  {others.map((id) => (
                    <SubjectOption key={id} id={id} q={q} on={q.subjects.includes(id)} onClick={() => toggleSubject(id)} />
                  ))}
                </div>
              )}
              <div className="section-label">Outra disciplina</div>
              <div className="row" style={{ maxWidth: 460 }}>
                <input className="input" value={customName} maxLength={40} placeholder="Ex.: Latim, Direito, Contabilidade…"
                  onChange={(e) => setCustomName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())} />
                <Button variant="secondary" onClick={addCustom} icon={<Plus />}>Adicionar</Button>
              </div>
              <p className="small faint" style={{ marginTop: 14 }}>{q.subjects.length} disciplinas escolhidas</p>
            </>
          )}

          {current === 'dificuldades' && (
            <>
              <div className="onb-kicker">Pergunta 3</div>
              <h1>Em que disciplinas tens mais dificuldades?</h1>
              <p className="lead">Estas disciplinas vão ter mais tempo no teu plano. Podes escolher várias — ou nenhuma.</p>
              <div className="option-grid">
                {q.subjects.map((id) => (
                  <SubjectOption key={id} id={id} q={q} on={q.difficult.includes(id)}
                    onClick={() => update({ difficult: toggle(q.difficult, id), easy: q.easy.filter((x) => x !== id) })} />
                ))}
              </div>
            </>
          )}

          {current === 'facilidade' && (
            <>
              <div className="onb-kicker">Pergunta 4</div>
              <h1>E em quais tens mais facilidade?</h1>
              <p className="lead">Nestas o plano faz sessões mais leves, só para manter a matéria em dia.</p>
              <div className="option-grid">
                {q.subjects.filter((id) => !q.difficult.includes(id)).map((id) => (
                  <SubjectOption key={id} id={id} q={q} on={q.easy.includes(id)} onClick={() => update({ easy: toggle(q.easy, id) })} />
                ))}
              </div>
            </>
          )}

          {current === 'tempo' && (
            <>
              <div className="onb-kicker">Pergunta 5</div>
              <h1>Quanto tempo tens para estudar por dia?</h1>
              <p className="lead">Sê realista: é melhor um plano curto que cumpres do que um longo que não consegues seguir.</p>
              <div className="big-choice">
                {MINUTES.map((m) => (
                  <button key={m.v} type="button" className={q.dailyMinutes === m.v ? 'on' : ''} onClick={() => update({ dailyMinutes: m.v })}>
                    <b>{m.v < 60 ? `${m.v}′` : formatMinutes(m.v).replace(' min', '')}</b>
                    <span>{m.l}</span>
                  </button>
                ))}
              </div>
              <div className="section-label" style={{ marginTop: 28 }}>Em que dias vais estudar?</div>
              <div className="day-row">
                {WEEKDAYS_SHORT.map((d, i) => (
                  <button key={d} type="button" className={`day-btn ${q.studyDays.includes(i) ? 'on' : ''}`} aria-pressed={q.studyDays.includes(i)}
                    aria-label={WEEKDAYS[i]} onClick={() => update({ studyDays: q.studyDays.includes(i) ? q.studyDays.filter((x) => x !== i) : [...q.studyDays, i].sort() })}>
                    {d}
                  </button>
                ))}
              </div>
              <div className="section-label" style={{ marginTop: 28 }}><Clock size={16} /> A que horas costumas começar?</div>
              <select className="select" style={{ maxWidth: 200 }} value={q.startTime} onChange={(e) => update({ startTime: e.target.value })}>
                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </>
          )}

          {current === 'objetivo' && (
            <>
              <div className="onb-kicker">Pergunta 6</div>
              <h1>Qual é o teu principal objetivo?</h1>
              <p className="lead">Escolhe o que é mais importante para ti agora.</p>
              <div className="option-grid wide">
                {GOALS.map((g) => (
                  <Option key={g.id} on={q.goal === g.id} onClick={() => update({ goal: g.id })} icon={<g.icon />} title={GOAL_LABELS[g.id]} desc={g.desc} />
                ))}
              </div>
            </>
          )}

          {current === 'estilo' && (
            <>
              <div className="onb-kicker">Pergunta 7</div>
              <h1>Como preferes aprender?</h1>
              <p className="lead">Podes escolher várias. O plano e a IA vão usar estas formas de estudar.</p>
              <div className="option-grid wide">
                {STYLES.map((s) => (
                  <Option key={s.id} on={q.styles.includes(s.id)} onClick={() => update({ styles: toggle(q.styles, s.id) as LearningStyle[] })}
                    icon={<s.icon />} title={STYLE_LABELS[s.id]} desc={s.desc} />
                ))}
              </div>
            </>
          )}

          {current === 'testes' && (
            <>
              <div className="onb-kicker">Pergunta 8</div>
              <h1>Quando tens os próximos testes?</h1>
              <p className="lead">
                O plano marca revisões nos 3 dias antes de cada teste. {editing ? 'Os testes que já marcaste continuam no calendário.' : 'Se ainda não sabes, podes saltar — dá para marcar depois no calendário.'}
              </p>
              <div className="stack">
                {q.tests.map((t, i) => (
                  <div key={i} className="test-row fade-in">
                    <select className="select" value={t.subject} aria-label="Disciplina"
                      onChange={(e) => update({ tests: q.tests.map((x, j) => (j === i ? { ...x, subject: e.target.value } : x)) })}>
                      <option value="">Disciplina…</option>
                      {q.subjects.map((id) => <option key={id} value={id}>{getSubject(id, q.customSubjects).name}</option>)}
                    </select>
                    <input className="input" type="date" value={t.date} min={today()} aria-label="Data"
                      onChange={(e) => update({ tests: q.tests.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) })} />
                    <input className="input topic" value={t.topic ?? ''} placeholder="Matéria (opcional)" maxLength={120} aria-label="Matéria"
                      onChange={(e) => update({ tests: q.tests.map((x, j) => (j === i ? { ...x, topic: e.target.value } : x)) })} />
                    <button type="button" className="icon-btn" aria-label="Remover teste" onClick={() => update({ tests: q.tests.filter((_, j) => j !== i) })}>
                      <Trash2 />
                    </button>
                  </div>
                ))}
                <div>
                  <Button variant="secondary" icon={<Plus />}
                    onClick={() => update({ tests: [...q.tests, { subject: q.difficult[0] ?? q.subjects[0] ?? '', date: addDays(today(), 7), topic: '' }] })}>
                    Adicionar teste
                  </Button>
                </div>
              </div>
              {editing && (
                <label className="row" style={{ marginTop: 28, gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={regenerate} onChange={(e) => setRegenerate(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#FFD400' }} />
                  <span>
                    <b>Criar um plano de estudos novo com estas respostas</b>
                    <span className="small muted" style={{ display: 'block' }}>As alterações que fizeste à mão no plano atual são substituídas.</span>
                  </span>
                </label>
              )}
            </>
          )}

          {error && <div style={{ marginTop: 20 }}><FormError>{error}</FormError></div>}
        </div>
      </div>

      <div className="onb-foot">
        <div className="onb-foot-inner">
          <Button variant="ghost" onClick={back} icon={<ArrowLeft />} disabled={step === 0 && !editing}>
            Voltar
          </Button>
          <div className="row">
            {current === 'testes' && !q.tests.length && !editing && (
              <Button variant="secondary" onClick={submit} loading={saving}>Ainda não sei</Button>
            )}
            <Button onClick={next} loading={saving} size="lg">
              {step === STEPS.length - 1 ? (editing ? 'Guardar respostas' : 'Criar o meu plano') : 'Continuar'}
              {step < STEPS.length - 1 ? <ArrowRight /> : <Sparkles />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanReveal({ plan, q, me, onContinue, editing }: { plan: StudyPlan | null; q: Questionnaire; me: MeResponse; onContinue: () => void; editing: boolean }) {
  if (!plan) return null;
  const weekly = plan.sessions.reduce((a, s) => a + s.minutes, 0);
  const subjects = new Set(plan.sessions.map((s) => s.subject).filter(Boolean));
  return (
    <div className="onb">
      <div className="onb-top">
        <Logo />
      </div>
      <div className="onb-body" style={{ maxWidth: 980 }}>
        <div className="onb-step">
          <div className="onb-kicker"><CircleCheck size={15} /> Plano criado</div>
          <h1>O teu plano está pronto, {q.name.split(' ')[0]}!</h1>
          <p className="lead">
            Criado a partir das tuas respostas para o {yearLabel(q.year)} ({cycleLabel(q.year)}). Podes editá-lo sempre que quiseres em «Plano de estudos».
          </p>
          <div className="stats-row" style={{ marginBottom: 18 }}>
            <div className="stat fade-up" style={{ ['--i' as string]: 1 }}><span className="stat-label"><CalendarClock /> Dias por semana</span><span className="stat-value">{plan.meta.studyDays.length}</span></div>
            <div className="stat fade-up" style={{ ['--i' as string]: 2 }}><span className="stat-label"><Clock /> Por semana</span><span className="stat-value">{formatMinutes(weekly)}</span></div>
            <div className="stat fade-up" style={{ ['--i' as string]: 3 }}><span className="stat-label"><BookOpen /> Disciplinas</span><span className="stat-value">{subjects.size}</span></div>
            <div className="stat fade-up" style={{ ['--i' as string]: 4 }}><span className="stat-label"><Target /> Sessões</span><span className="stat-value">{plan.sessions.length}</span></div>
          </div>

          <div className="week" style={{ marginBottom: 18 }}>
            {WEEKDAYS.map((d, i) => {
              const items = plan.sessions.filter((s) => s.weekday === i).sort((a, b) => a.start.localeCompare(b.start));
              return (
                <div key={d} className="week-day fade-up" style={{ ['--i' as string]: i + 3, minHeight: 0 }}>
                  <div className="week-day-head"><b>{d}</b><span>{items.length ? formatMinutes(items.reduce((a, s) => a + s.minutes, 0)) : 'Livre'}</span></div>
                  {items.map((s) => (
                    <div key={s.id} className="wsession" style={{ ['--c' as string]: subjectColor(s.subject, q.customSubjects) }}>
                      <div className="ws-time">{s.start} · {s.minutes} min</div>
                      <div className="ws-title">{s.subject ? getSubject(s.subject, q.customSubjects).short : 'Trabalhos de casa'}</div>
                      <div className="ws-act">{ACTIVITY_LABELS[s.activity]}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-head"><span className="card-title"><Target /> Objetivos da semana</span></div>
              <div className="stack sm">
                {plan.weeklyGoals.map((g) => (
                  <div key={g.id} className="goal-item"><span className="check round" /><span className="goal-text">{g.text}</span></div>
                ))}
              </div>
            </div>
            <div className="card card-glow">
              <div className="card-head"><span className="card-title"><Sparkles /> Porque é que o plano é assim</span></div>
              <ul className="insights">
                {plan.insights.map((t) => <li key={t}><Check />{t}</li>)}
              </ul>
              <p className="tiny faint" style={{ marginTop: 14 }}>
                {me.ai.configured
                  ? DEMO
                    ? 'No Plano de estudos podes pedir à IA conselhos personalizados para as disciplinas difíceis.'
                    : 'A IA está a preparar conselhos personalizados — vais vê-los no teu Plano de estudos.'
                  : 'Plano criado pelo motor de planeamento da STUDY AI. A análise por IA aparece quando a IA estiver ligada.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="onb-foot">
        <div className="onb-foot-inner" style={{ justifyContent: 'flex-end' }}>
          <Button size="lg" onClick={onContinue}>
            {editing ? 'Ver o meu plano' : 'Escolher a minha IA'} <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
