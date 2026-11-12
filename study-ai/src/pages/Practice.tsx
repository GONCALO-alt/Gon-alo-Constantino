import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardCheck, History, Info, Layers, Pencil, Plus, Sparkles, Trash2, WandSparkles } from 'lucide-react';
import { api } from '../api';
import { SubjectIcon } from '../components/SubjectIcon';
import { Button, Confirm, Empty, Field, FormError, IconButton, Modal, PageHead, Progress, Skeleton, Tabs } from '../components/ui';
import { invalidate, setCached, useApp, useMe, useQuery } from '../state';
import { formatDayMonth, today, toISODate } from '../../shared/dates';
import type { UsageSnapshot } from '../../shared/plans';
import { getSubject } from '../../shared/subjects';
import { QUESTION_KIND_LABELS, type Deck, type PracticeTest, type QuestionKind } from '../../shared/types';

type Tab = 'gerador' | 'historico' | 'flashcards';

function SubjectSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const me = useMe();
  const q = me.profile.questionnaire;
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Escolhe a disciplina…</option>
      {(q?.subjects ?? []).map((id) => <option key={id} value={id}>{getSubject(id, q?.customSubjects).name}</option>)}
    </select>
  );
}

function Generator({ initialSubject }: { initialSubject: string }) {
  const me = useMe();
  const { setUsage } = useApp();
  const navigate = useNavigate();
  const q = me.profile.questionnaire;
  const [subject, setSubject] = useState(initialSubject || q?.difficult[0] || q?.subjects[0] || '');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [kinds, setKinds] = useState<QuestionKind[]>(['escolha-multipla', 'verdadeiro-falso', 'resposta-curta']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setError('');
    setLoading(true);
    try {
      const r = await api<{ test: PracticeTest; usage: UsageSnapshot }>('/tests/generate', {
        method: 'POST',
        body: { subject: subject || null, topic, count, difficulty, kinds },
      });
      setUsage(r.usage);
      setCached(`/tests/${r.test.id}`, { test: r.test });
      invalidate('/tests');
      navigate(`/testes/${r.test.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dash" style={{ marginTop: 0 }}>
      <div className="card pad-lg">
        <div className="card-head"><span className="card-title"><WandSparkles /> Gerador de testes personalizados</span></div>
        {!me.ai.configured && (
          <div className="notice" style={{ marginBottom: 18 }}><Info /><div><b>A IA ainda não está ligada.</b> {me.ai.message}</div></div>
        )}
        <div className="stack lg">
          <div className="grid-2">
            <Field label="Disciplina"><SubjectSelect value={subject} onChange={setSubject} /></Field>
            <Field label="Número de perguntas">
              <select className="select" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[5, 8, 10, 15, 20].map((n) => <option key={n} value={n}>{n} perguntas</option>)}
              </select>
            </Field>
          </div>
          <Field label="Matéria">
            <input className="input" value={topic} maxLength={300} onChange={(e) => setTopic(e.target.value)} placeholder="Ex.: Funções afins; Os Descobrimentos; Present Perfect" />
          </Field>
          <div>
            <div className="small muted" style={{ fontWeight: 550, marginBottom: 8 }}>Dificuldade</div>
            <div className="row wrap">
              {([['facil', 'Fácil'], ['medio', 'Média'], ['dificil', 'Difícil']] as const).map(([v, l]) => (
                <button key={v} type="button" className={`chip ${difficulty === v ? 'on' : ''}`} onClick={() => setDifficulty(v)}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="small muted" style={{ fontWeight: 550, marginBottom: 8 }}>Tipos de pergunta</div>
            <div className="row wrap">
              {(Object.keys(QUESTION_KIND_LABELS) as QuestionKind[]).map((k) => (
                <button key={k} type="button" className={`chip ${kinds.includes(k) ? 'on' : ''}`}
                  onClick={() => setKinds(kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k])}>{QUESTION_KIND_LABELS[k]}</button>
              ))}
            </div>
          </div>
          <FormError>{error}</FormError>
          <div>
            <Button size="lg" icon={<Sparkles />} loading={loading} onClick={generate} disabled={!me.ai.configured || topic.trim().length < 2 || !kinds.length}>
              {loading ? 'A IA está a preparar o teste…' : 'Gerar teste'}
            </Button>
            <p className="tiny faint" style={{ marginTop: 10 }}>Conta como 1 pergunta do teu plano. A correção das respostas abertas pela IA conta como mais 1.</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><span className="card-title"><ClipboardCheck /> Como funciona</span></div>
        <ul className="insights">
          <li><Sparkles />A IA cria um teste adaptado ao teu ano, à disciplina e à matéria que escolheres.</li>
          <li><Sparkles />As perguntas de escolha múltipla e verdadeiro/falso são corrigidas logo.</li>
          <li><Sparkles />As respostas abertas são corrigidas pela IA, que explica os erros e mostra a resposta certa.</li>
          <li><Sparkles />Os resultados entram nas tuas estatísticas de progresso.</li>
        </ul>
        <div className="divider" style={{ margin: '18px 0' }} />
        <p className="small muted">Preferes outra forma de treinar? Pede no <Link to="/chat" className="yellow">Chat IA</Link> uma ficha de exercícios ou cria <Link to="/testes/flashcards" className="yellow">flashcards</Link>.</p>
      </div>
    </div>
  );
}

function TestHistory() {
  const me = useMe();
  const custom = me.profile.questionnaire?.customSubjects;
  const list = useQuery<{ tests: PracticeTest[] }>('/tests');
  const [deleting, setDeleting] = useState<PracticeTest | null>(null);
  if (list.loading) return <Skeleton height={200} />;
  const tests = list.data?.tests ?? [];
  if (!tests.length) return <Empty icon={<History />} title="Ainda não fizeste testes" text="Gera o primeiro teste de preparação no separador «Gerar teste»." />;
  return (
    <div className="card">
      {tests.map((t) => {
        const pct = t.score !== null ? Math.round((t.score / t.maxScore) * 100) : null;
        return (
          <div key={t.id} className="list-item">
            <SubjectIcon id={t.subject} custom={custom} size="sm" />
            <Link to={`/testes/${t.id}`} className="grow">
              <div style={{ fontWeight: 600 }}>{t.title}</div>
              <div className="tiny muted">{t.subject ? getSubject(t.subject, custom).name : 'Geral'} · {t.questions.length} perguntas · {formatDayMonth(toISODate(new Date(t.createdAt)))}</div>
            </Link>
            {pct !== null ? <span className={`badge ${pct >= 50 ? 'green' : 'red'}`}>{pct}%</span> : <Link to={`/testes/${t.id}`} className="badge yellow">Fazer</Link>}
            <IconButton label="Apagar teste" small onClick={() => setDeleting(t)}><Trash2 /></IconButton>
          </div>
        );
      })}
      <Confirm open={!!deleting} onClose={() => setDeleting(null)} title="Apagar teste?" text="O teste e o resultado são apagados."
        onConfirm={async () => { await api(`/tests/${deleting!.id}`, { method: 'DELETE' }); invalidate('/tests', '/stats'); setDeleting(null); }} />
    </div>
  );
}

function NewDeckModal({ onClose, initialSubject }: { onClose: () => void; initialSubject: string }) {
  const me = useMe();
  const { setUsage, toast } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'ia' | 'manual'>(me.ai.configured ? 'ia' : 'manual');
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [title, setTitle] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setLoading(true);
    try {
      let deck: Deck;
      if (mode === 'ia') {
        const r = await api<{ deck: Deck; usage: UsageSnapshot }>('/decks/generate', { method: 'POST', body: { subject: subject || null, topic, count } });
        setUsage(r.usage);
        deck = r.deck;
      } else {
        const r = await api<{ deck: Deck }>('/decks', {
          method: 'POST',
          body: { subject: subject || null, title, cards: cards.filter((c) => c.front.trim() && c.back.trim()) },
        });
        deck = r.deck;
      }
      invalidate('/decks', '/stats');
      toast('Baralho criado.');
      navigate(`/flashcards/${deck.id}`);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Novo baralho de flashcards" wide
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={submit} loading={loading} disabled={mode === 'ia' ? !me.ai.configured || topic.trim().length < 2 : !title.trim()}>
          {mode === 'ia' ? 'Criar com IA' : 'Criar baralho'}
        </Button></>}>
      <div className="stack">
        <Tabs value={mode} onChange={setMode} items={[{ value: 'ia', label: 'Criar com IA', icon: <Sparkles /> }, { value: 'manual', label: 'Escrever eu', icon: <Pencil /> }]} />
        <Field label="Disciplina"><SubjectSelect value={subject} onChange={setSubject} /></Field>
        {mode === 'ia' ? (
          <div className="grid-2">
            <Field label="Matéria"><input className="input" value={topic} maxLength={300} onChange={(e) => setTopic(e.target.value)} placeholder="Ex.: Capitais da Europa; verbos irregulares" /></Field>
            <Field label="Quantos cartões">
              <select className="select" value={count} onChange={(e) => setCount(Number(e.target.value))}>{[6, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}</select>
            </Field>
          </div>
        ) : (
          <>
            <Field label="Título do baralho"><input className="input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} /></Field>
            {cards.map((c, i) => (
              <div key={i} className="grid-2" style={{ gap: 8 }}>
                <input className="input" placeholder={`Frente ${i + 1} (pergunta)`} value={c.front} maxLength={500} onChange={(e) => setCards(cards.map((x, j) => (j === i ? { ...x, front: e.target.value } : x)))} />
                <input className="input" placeholder="Verso (resposta)" value={c.back} maxLength={2000} onChange={(e) => setCards(cards.map((x, j) => (j === i ? { ...x, back: e.target.value } : x)))} />
              </div>
            ))}
            <div><Button variant="ghost" size="sm" icon={<Plus />} onClick={() => setCards([...cards, { front: '', back: '' }])}>Mais um cartão</Button></div>
          </>
        )}
        <FormError>{error}</FormError>
      </div>
    </Modal>
  );
}

function DeckList({ initialSubject }: { initialSubject: string }) {
  const me = useMe();
  const custom = me.profile.questionnaire?.customSubjects;
  const list = useQuery<{ decks: Deck[] }>(`/decks?date=${today()}`);
  const [creating, setCreating] = useState(false);
  const decks = (list.data?.decks ?? []).filter((d) => !initialSubject || d.subject === initialSubject);
  return (
    <>
      <div className="row between wrap" style={{ marginBottom: 16 }}>
        <p className="muted small">Flashcards com revisão espaçada: os cartões que já sabes aparecem cada vez menos.</p>
        <Button icon={<Plus />} onClick={() => setCreating(true)}>Novo baralho</Button>
      </div>
      {list.loading ? <Skeleton height={160} /> : decks.length ? (
        <div className="grid-auto">
          {decks.map((d, i) => (
            <Link key={d.id} to={`/flashcards/${d.id}`} className="card interactive fade-up stack" style={{ ['--i' as string]: i }}>
              <div className="row between">
                <SubjectIcon id={d.subject} custom={custom} size="sm" />
                {d.dueCount > 0 ? <span className="badge yellow">{d.dueCount} para rever</span> : <span className="badge green">Em dia</span>}
              </div>
              <h3>{d.title}</h3>
              <span className="tiny muted">{d.subject ? getSubject(d.subject, custom).name : 'Geral'} · {d.cardCount} cartões</span>
              <div>
                <div className="row between tiny faint" style={{ marginBottom: 5 }}><span>Dominados</span><span>{d.masteredCount}/{d.cardCount}</span></div>
                <Progress value={d.masteredCount} max={d.cardCount || 1} thin green />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty icon={<Layers />} title="Sem flashcards" text="Cria um baralho com a IA a partir de uma matéria, ou escreve os teus cartões." action={<Button icon={<Plus />} onClick={() => setCreating(true)}>Novo baralho</Button>} />
      )}
      {creating && <NewDeckModal onClose={() => setCreating(false)} initialSubject={initialSubject} />}
    </>
  );
}

export function PracticePage({ tab = 'gerador' }: { tab?: Tab }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [subject, setSubject] = useState(params.get('subject') ?? '');
  useEffect(() => setSubject(params.get('subject') ?? ''), [params]);
  return (
    <div>
      <PageHead title="Testes e exercícios" sub="Gera testes de preparação, revê os teus resultados e memoriza a matéria com flashcards."
        actions={
          <Tabs value={tab} onChange={(v) => navigate(v === 'gerador' ? '/testes' : `/testes/${v}`)}
            items={[
              { value: 'gerador', label: 'Gerar teste', icon: <WandSparkles /> },
              { value: 'historico', label: 'Os meus testes', icon: <History /> },
              { value: 'flashcards', label: 'Flashcards', icon: <Layers /> },
            ]} />
        } />
      {tab === 'gerador' && <Generator initialSubject={subject} />}
      {tab === 'historico' && <TestHistory />}
      {tab === 'flashcards' && <DeckList initialSubject={subject} />}
    </div>
  );
}
