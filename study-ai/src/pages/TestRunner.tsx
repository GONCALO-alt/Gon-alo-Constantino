import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ClipboardCheck, MessagesSquare, RotateCcw, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { api } from '../api';
import { Markdown } from '../components/Markdown';
import { Promo } from '../components/Promo';
import { Button, Empty, FormError, Ring, Skeleton } from '../components/ui';
import { invalidate, setCached, useApp, useMe, useQuery } from '../state';
import type { UsageSnapshot } from '../../shared/plans';
import { getSubject } from '../../shared/subjects';
import { QUESTION_KIND_LABELS, type PracticeTest } from '../../shared/types';

const LETTERS = 'ABCDEF';
type Answer = string | number | null;

export function TestPage() {
  const { id = '' } = useParams();
  const me = useMe();
  const { setUsage, toast } = useApp();
  const custom = me.profile.questionnaire?.customSubjects;
  const q = useQuery<{ test: PracticeTest }>(`/tests/${id}`);
  const test = q.data?.test;
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [retake, setRetake] = useState(false);
  const [pending, setPending] = useState<number[] | null>(null);
  const [selfGrades, setSelfGrades] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (test) setAnswers(test.answers && !retake ? test.answers : test.questions.map(() => null));
  }, [test, retake]);

  if (q.loading) return <Skeleton height={320} />;
  if (!test) return <Empty icon={<ClipboardCheck />} title="Teste não encontrado" action={<Link to="/testes" className="btn btn-secondary">Voltar</Link>} />;

  const completed = !!test.completedAt && !retake && !pending;
  const answered = answers.filter((a) => a !== null && a !== '').length;

  async function submit(grades?: Record<string, boolean>) {
    setError('');
    setSubmitting(true);
    try {
      const r = await api<{ test: PracticeTest; usage?: UsageSnapshot; pendingSelfGrade?: number[]; notice?: string }>(`/tests/${id}/submit`, {
        method: 'POST',
        body: { answers, ...(grades ? { selfGrades: grades } : {}) },
      });
      if (r.usage) setUsage(r.usage);
      if (r.pendingSelfGrade) {
        setPending(r.pendingSelfGrade);
        setNotice(r.notice ?? '');
        return;
      }
      setPending(null);
      setRetake(false);
      setCached(`/tests/${id}`, { test: r.test });
      invalidate('/tests', '/stats');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast('Teste corrigido.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const pct = test.score !== null ? Math.round((test.score / test.maxScore) * 100) : 0;
  const wrong = test.results ? test.questions.map((x, i) => ({ x, i })).filter(({ i }) => !test.results![i]?.correct) : [];
  const explainPrompt = `Fiz um teste de preparação («${test.title}») e errei estas perguntas. Explica-me cada uma e o que devia ter respondido:\n\n${wrong
    .map(({ x, i }) => `${i + 1}. ${x.prompt}\nA minha resposta: ${x.options.length ? x.options[Number(test.answers?.[i])] ?? '(sem resposta)' : test.answers?.[i] ?? '(sem resposta)'}`)
    .join('\n\n')}`;

  return (
    <div style={{ maxWidth: 860 }}>
      <Link to="/testes/historico" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}><ArrowLeft /> Os meus testes</Link>
      <div className="card card-glow pad-lg fade-up" style={{ marginBottom: 18 }}>
        <div className="row between top wrap" style={{ gap: 20 }}>
          <div>
            <span className="badge yellow" style={{ marginBottom: 10 }}><Sparkles /> Teste de preparação</span>
            <h1 style={{ fontSize: 26 }}>{test.title}</h1>
            <p className="muted small" style={{ marginTop: 6 }}>
              {test.subject ? getSubject(test.subject, custom).name : 'Geral'} · {test.topic} · {test.questions.length} perguntas · cotação {test.maxScore} pontos
            </p>
          </div>
          {completed && (
            <div className="row pop" style={{ gap: 16 }}>
              <Ring value={pct} max={100} size={96} stroke={9} color={pct >= 50 ? 'var(--success)' : 'var(--danger)'}>
                <span style={{ fontSize: 22 }}>{pct}%</span>
              </Ring>
              <div>
                <div className="score-big">{test.score}<span className="muted" style={{ fontSize: 22 }}>/{test.maxScore}</span></div>
                <div className="small muted">{pct >= 90 ? 'Excelente!' : pct >= 70 ? 'Muito bem!' : pct >= 50 ? 'Positiva — continua a treinar.' : 'Vamos rever a matéria.'}</div>
              </div>
            </div>
          )}
        </div>
        {completed && (
          <div className="row wrap" style={{ marginTop: 18 }}>
            <Button variant="secondary" icon={<RotateCcw />} onClick={() => { setRetake(true); setPending(null); window.scrollTo({ top: 0 }); }}>Repetir teste</Button>
            {wrong.length > 0 && (
              <Link to={`/chat?q=${encodeURIComponent(explainPrompt)}${test.subject ? `&subject=${test.subject}` : ''}`} className="btn btn-secondary"><MessagesSquare /> Explicar os erros com a IA</Link>
            )}
            <Link to={`/testes${test.subject ? `?subject=${test.subject}` : ''}`} className="btn btn-ghost">Novo teste</Link>
          </div>
        )}
      </div>

      {completed && (
        <div style={{ marginBottom: 18 }} className="slot-gap">
          <Promo slot="teste-resultado" testResult={{ pct, subject: test.subject }} />
        </div>
      )}

      <div className="stack lg">
        {test.questions.map((question, i) => {
          const result = completed ? test.results?.[i] : null;
          const a = answers[i];
          const closed = question.options.length > 0;
          const needsSelf = pending?.includes(i);
          return (
            <div key={i} className="card q-card fade-up" style={{ ['--i' as string]: Math.min(i, 8) }}>
              <div className="row top" style={{ gap: 12 }}>
                <span className="q-num">{i + 1}</span>
                <div className="grow">
                  <div className="row between wrap tiny faint" style={{ marginBottom: 6 }}>
                    <span>{QUESTION_KIND_LABELS[question.kind]}</span>
                    <span>{result ? `${result.score}/${result.max}` : `${question.points} ${question.points === 1 ? 'ponto' : 'pontos'}`}</span>
                  </div>
                  <Markdown text={question.prompt} compact />
                </div>
              </div>
              {closed ? (
                <div className="q-opts">
                  {question.options.map((opt, j) => {
                    let cls = a === j ? 'on' : '';
                    if (completed) cls = j === question.correctOption ? 'right' : a === j ? 'wrong' : '';
                    return (
                      <button key={j} type="button" className={`q-opt ${cls}`} disabled={completed || !!pending}
                        onClick={() => setAnswers(answers.map((x, k) => (k === i ? j : x)))}>
                        <span className="letter">{LETTERS[j]}</span>
                        <span className="grow"><Markdown text={opt} compact /></span>
                        {completed && j === question.correctOption && <Check size={18} color="var(--success)" />}
                        {completed && a === j && j !== question.correctOption && <X size={18} color="var(--danger)" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <textarea className="textarea" style={{ marginTop: 14, minHeight: question.kind === 'desenvolvimento' ? 140 : 80 }} placeholder="Escreve a tua resposta…"
                  value={typeof a === 'string' ? a : ''} disabled={completed || !!pending} maxLength={5000}
                  onChange={(e) => setAnswers(answers.map((x, k) => (k === i ? e.target.value : x)))} />
              )}
              {needsSelf && (
                <div className="q-feedback fade-in">
                  <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>Resposta-modelo</div>
                  <Markdown text={question.modelAnswer} compact />
                  <div className="row wrap" style={{ marginTop: 12 }}>
                    <span className="small muted grow">Compara com a tua resposta:</span>
                    <Button size="sm" variant={selfGrades[i] === true ? 'primary' : 'secondary'} icon={<ThumbsUp />} onClick={() => setSelfGrades({ ...selfGrades, [i]: true })}>Acertei</Button>
                    <Button size="sm" variant={selfGrades[i] === false ? 'danger' : 'secondary'} icon={<ThumbsDown />} onClick={() => setSelfGrades({ ...selfGrades, [i]: false })}>Errei</Button>
                  </div>
                </div>
              )}
              {result && (
                <div className="q-feedback">
                  <div className="row" style={{ gap: 8, fontWeight: 600, marginBottom: 6, color: result.correct ? 'var(--success)' : 'var(--danger)' }}>
                    {result.correct ? <Check size={17} /> : <X size={17} />} {result.correct ? 'Certo' : 'A rever'}
                  </div>
                  {!closed && <><Markdown text={result.feedback} compact /><div className="tiny faint" style={{ margin: '10px 0 4px' }}>Resposta-modelo</div><Markdown text={question.modelAnswer} compact /></>}
                  {question.explanation && <div style={{ marginTop: 8 }}><Markdown text={`**Explicação:** ${question.explanation}`} compact /></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!completed && (
        <div className="card" style={{ marginTop: 18, position: 'sticky', bottom: 90 }}>
          {notice && <p className="small" style={{ marginBottom: 10, color: 'var(--yellow)' }}>{notice}</p>}
          <FormError>{error}</FormError>
          <div className="row between wrap" style={{ marginTop: error ? 12 : 0 }}>
            <span className="small muted">{pending ? 'Avalia as tuas respostas abertas para ver a nota.' : `${answered} de ${test.questions.length} respondidas`}</span>
            {pending ? (
              <Button loading={submitting} disabled={pending.some((i) => selfGrades[i] === undefined)} onClick={() => submit(selfGrades)}>Ver resultado</Button>
            ) : (
              <Button loading={submitting} disabled={answered === 0} onClick={() => submit()} icon={<Check />}>
                {submitting ? 'A corrigir…' : 'Entregar e corrigir'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
