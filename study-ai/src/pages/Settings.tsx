import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, KeyRound, LogOut, Pencil, ShieldCheck, Smartphone, Sparkles, SlidersHorizontal, Trash2, UserRound } from 'lucide-react';
import { InstallButton } from '../components/Install';
import { DEMO } from '../env';
import { invalidate, clearCache } from '../state';
import { api } from '../api';
import { Button, Field, FormError, Modal, PageHead, Toggle } from '../components/ui';
import { useApp, useMe } from '../state';
import { formatMinutes, WEEKDAYS_SHORT } from '../../shared/dates';
import { AI_PLANS } from '../../shared/plans';
import { getSubject, yearLabel } from '../../shared/subjects';
import { GOAL_LABELS, STYLE_LABELS, type MeResponse } from '../../shared/types';

export function SettingsPage() {
  const me = useMe();
  const { setMe, logout, toast } = useApp();
  const q = me.profile.questionnaire;
  const plan = AI_PLANS[me.profile.aiPlan];
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [exporting, setExporting] = useState(false);
  const names = (ids: string[]) => (ids.length ? ids.map((id) => getSubject(id, q?.customSubjects).name).join(', ') : '—');

  async function setSetting(patch: Record<string, unknown>) {
    try {
      setMe(await api<MeResponse>('/profile/settings', { method: 'PUT', body: patch }));
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }

  async function changePassword() {
    setPwError('');
    setPwSaving(true);
    try {
      await api('/auth/password', { method: 'POST', body: pw });
      setPw({ current: '', next: '' });
      toast('Palavra-passe alterada. As outras sessões foram terminadas.');
    } catch (err) {
      setPwError((err as Error).message);
    } finally {
      setPwSaving(false);
    }
  }

  async function exportData() {
    setExporting(true);
    try {
      const data = await api<unknown>('/account/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'study-ai-os-meus-dados.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    setDeleteError('');
    try {
      await api('/account', { method: 'DELETE', body: { password: deletePw } });
      setMe(null);
    } catch (err) {
      setDeleteError((err as Error).message);
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <PageHead title="Definições" sub="O teu perfil de estudante, o plano de IA, as preferências e a conta." />
      <div className="stack lg">
        <section className="card pad-lg">
          <div className="card-head">
            <span className="card-title"><UserRound /> Perfil de estudante</span>
            <Link to="/questionario" className="btn btn-secondary btn-sm"><Pencil /> Alterar respostas do questionário</Link>
          </div>
          {q ? (
            <dl className="kv">
              <dt>Nome</dt><dd>{q.name}</dd>
              <dt>Ano escolar</dt><dd>{yearLabel(q.year)}</dd>
              <dt>Disciplinas</dt><dd>{names(q.subjects)}</dd>
              <dt>Mais dificuldades</dt><dd>{names(q.difficult)}</dd>
              <dt>Mais facilidade</dt><dd>{names(q.easy)}</dd>
              <dt>Tempo de estudo</dt><dd>{formatMinutes(q.dailyMinutes)} por dia · {q.studyDays.map((d) => WEEKDAYS_SHORT[d]).join(', ')} · a partir das {q.startTime}</dd>
              <dt>Objetivo</dt><dd>{GOAL_LABELS[q.goal]}</dd>
              <dt>Como aprende</dt><dd>{q.styles.map((s) => STYLE_LABELS[s]).join(', ') || '—'}</dd>
            </dl>
          ) : (
            <p className="muted">Ainda não respondeste ao questionário.</p>
          )}
          <p className="tiny faint" style={{ marginTop: 14 }}>Ao alterar as respostas podes criar um plano de estudos novo. Os testes marcam-se no calendário.</p>
        </section>

        <section className="card pad-lg">
          <div className="card-head">
            <span className="card-title"><Sparkles /> Plano de IA</span>
            <Link to="/planos" className="btn btn-primary btn-sm">Escolhe a tua IA</Link>
          </div>
          <div className="settings-list">
            <div className="setting">
              <div><div className="s-title">{plan.name} <span className="badge yellow" style={{ marginLeft: 6 }}>{plan.price}</span></div><div className="s-desc">{plan.tagline}</div></div>
            </div>
            <div className="setting">
              <div>
                <div className="s-title">Estado da IA</div>
                <div className="s-desc">
                  {me.ai.configured ? 'A IA está ligada e pronta a responder.' : `A IA ainda não está ligada. ${me.ai.message}`}
                  {me.ai.provider && <> Fornecida por: {me.ai.provider}.</>}
                  {me.ai.configured && me.ai.notice && <div className="tiny faint" style={{ marginTop: 4 }}>{me.ai.notice}</div>}
                </div>
              </div>
              <span className={`badge ${me.ai.configured ? 'green' : 'red'}`}>{me.ai.configured ? 'Ligada' : 'Não configurada'}</span>
            </div>
          </div>
          <p className="tiny faint" style={{ marginTop: 10 }}>Demonstração: os preços dos planos são apenas informativos. Não há pagamentos nem subscrições.</p>
        </section>

        <section className="card pad-lg">
          <div className="card-head"><span className="card-title"><SlidersHorizontal /> Preferências</span></div>
          <div className="settings-list">
            <div className="setting">
              <div><div className="s-title">Reduzir animações</div><div className="s-desc">Desliga as transições e os efeitos de movimento.</div></div>
              <Toggle on={me.profile.settings.reduceMotion} onChange={(v) => setSetting({ reduceMotion: v })} label="Reduzir animações" />
            </div>
            <div className="setting">
              <div><div className="s-title">Modo de estudo</div><div className="s-desc">Duração por omissão do foco e da pausa.</div></div>
              <div className="row">
                <select className="select" style={{ width: 110 }} value={me.profile.settings.focusMinutes} onChange={(e) => setSetting({ focusMinutes: Number(e.target.value) })} aria-label="Minutos de foco">
                  {[15, 20, 25, 30, 40, 45, 50, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
                </select>
                <select className="select" style={{ width: 110 }} value={me.profile.settings.breakMinutes} onChange={(e) => setSetting({ breakMinutes: Number(e.target.value) })} aria-label="Minutos de pausa">
                  {[3, 5, 10, 15].map((m) => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {!DEMO && (
        <section className="card pad-lg">
          <div className="card-head"><span className="card-title"><Smartphone /> Aplicação no telemóvel</span></div>
          <div className="setting" style={{ padding: 0, flexWrap: 'wrap' }}>
            <div className="grow" style={{ minWidth: 220 }}>
              <div className="s-title">Instalar a STUDY AI</div>
              <div className="s-desc">Fica no ecrã principal do telemóvel (ou do computador) e abre como uma aplicação, em ecrã inteiro.</div>
            </div>
            <InstallButton />
          </div>
        </section>
        )}

        {DEMO ? (
        <DemoData />
        ) : (
        <section className="card pad-lg">
          <div className="card-head"><span className="card-title"><KeyRound /> Conta</span></div>
          <div className="settings-list">
            <div className="setting"><div><div className="s-title">Email</div><div className="s-desc">{me.user.email}</div></div></div>
            <div className="setting" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="grid-2 grow" style={{ gap: 10, minWidth: 260 }}>
                <Field label="Palavra-passe atual"><input className="input" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
                <Field label="Nova palavra-passe"><input className="input" type="password" autoComplete="new-password" placeholder="Pelo menos 8 caracteres" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
              </div>
              <Button variant="secondary" onClick={changePassword} loading={pwSaving} disabled={!pw.current || pw.next.length < 8}>Alterar</Button>
            </div>
            {pwError && <FormError>{pwError}</FormError>}
            <div className="setting">
              <div><div className="s-title">Exportar os meus dados</div><div className="s-desc">Perfil, plano, conversas, resumos, flashcards, testes e progresso num ficheiro JSON.</div></div>
              <Button variant="secondary" icon={<Download />} loading={exporting} onClick={exportData}>Exportar</Button>
            </div>
            <div className="setting">
              <div><div className="s-title">Terminar sessão</div><div className="s-desc">Sai da conta neste dispositivo.</div></div>
              <Button variant="secondary" icon={<LogOut />} onClick={logout}>Sair</Button>
            </div>
            <div className="setting">
              <div><div className="s-title">Apagar conta</div><div className="s-desc">Apaga para sempre a conta e todos os dados, incluindo as imagens e ficheiros enviados.</div></div>
              <Button variant="danger" icon={<Trash2 />} onClick={() => setDeleteOpen(true)}>Apagar</Button>
            </div>
          </div>
        </section>
        )}

        {!DEMO && (
        <section className="card">
          <div className="row" style={{ gap: 12 }}>
            <ShieldCheck size={20} color="var(--yellow)" />
            <p className="small muted">
              As palavras-passe são guardadas cifradas (scrypt) e as sessões usam cookies seguros. Os teus dados só são acessíveis à tua conta.
              As perguntas enviadas à IA são processadas pelo fornecedor do modelo configurado no servidor.
            </p>
          </div>
        </section>
        )}
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Apagar a conta?"
        footer={<><Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="danger" onClick={deleteAccount} disabled={!deletePw}>Apagar para sempre</Button></>}>
        <div className="stack">
          <p className="muted">Isto não pode ser desfeito. Escreve a tua palavra-passe para confirmar.</p>
          <input className="input" type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} autoComplete="current-password" />
          <FormError>{deleteError}</FormError>
        </div>
      </Modal>
    </div>
  );
}

/** Versão de demonstração (artefacto): onde ficam os dados e como recomeçar. */
function DemoData() {
  const { setMe, toast } = useApp();
  const [info, setInfo] = useState<{ storage: 'conta' | 'navegador' | 'memoria' } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ storage: 'conta' | 'navegador' | 'memoria' }>('/demo/info').then(setInfo).catch(() => {});
  }, []);
  const where = {
    conta: 'Na tua conta do claude.ai, numa área privada desta página: só tu os vês, em qualquer dispositivo onde a abras.',
    navegador: 'Neste navegador, só neste dispositivo. Se limpares os dados do navegador, perdem-se.',
    memoria: 'Só enquanto esta página estiver aberta (o navegador não deixa guardar).',
  };
  async function reset() {
    setBusy(true);
    try {
      clearCache();
      setMe(await api<MeResponse>('/demo/reset', { method: 'POST' }));
      invalidate('/');
      toast('Dados apagados. Podes começar de novo.');
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }
  return (
    <section className="card pad-lg">
      <div className="card-head"><span className="card-title"><ShieldCheck /> Os teus dados nesta página</span></div>
      <div className="settings-list">
        <div className="setting">
          <div>
            <div className="s-title">Onde ficam guardados</div>
            <div className="s-desc">{info ? where[info.storage] : 'A verificar…'}</div>
          </div>
        </div>
        <div className="setting">
          <div>
            <div className="s-title">IA</div>
            <div className="s-desc">As respostas usam o Claude da conta de quem abre a página. As imagens enviadas no chat ficam só durante a sessão.</div>
          </div>
        </div>
        <div className="setting">
          <div><div className="s-title">Começar de novo</div><div className="s-desc">Apaga o questionário, o plano, as conversas e tudo o resto desta página.</div></div>
          <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirm(true)}>Apagar dados</Button>
        </div>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Apagar todos os dados?"
        footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Cancelar</Button><Button variant="danger" loading={busy} onClick={reset}>Apagar e recomeçar</Button></>}>
        <p className="muted">O questionário, o plano de estudos, as conversas, os resumos, os flashcards, os testes e o progresso são apagados. Isto não pode ser desfeito.</p>
      </Modal>
    </section>
  );
}
