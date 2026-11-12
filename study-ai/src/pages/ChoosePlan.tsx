import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Crown, Info, Sparkles, X, Zap } from 'lucide-react';
import { api } from '../api';
import { Button, PageHead } from '../components/ui';
import { useApp, useMe } from '../state';
import { AI_PLAN_IDS, AI_PLANS, type AiPlanId } from '../../shared/plans';
import type { MeResponse } from '../../shared/types';

const ICONS: Record<AiPlanId, typeof Zap> = { 'claudio-5': Zap, 'claudio-5-5': Sparkles, 'claudio-6': Crown };

/** Características que um plano NÃO tem (mostradas riscadas, para comparar). */
const MISSING: Record<AiPlanId, string[]> = {
  'claudio-5': ['Não permite carregar imagens', 'Sem análise de ficheiros'],
  'claudio-5-5': ['Sem análise de ficheiros (PDF)'],
  'claudio-6': [],
};

export function ChoosePlanPage() {
  const me = useMe();
  const { setMe, toast } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const first = params.get('inicio') === '1';
  const [saving, setSaving] = useState<AiPlanId | null>(null);

  async function choose(id: AiPlanId) {
    setSaving(id);
    try {
      const next = await api<MeResponse>('/profile/ai-plan', { method: 'PUT', body: { plan: id } });
      setMe(next);
      toast(`${AI_PLANS[id].name} selecionado.`);
      if (first) navigate('/');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <PageHead
        title="Escolhe a tua IA"
        sub="Três níveis de inteligência artificial para estudar. Podes mudar de plano quando quiseres."
        actions={first ? <Button variant="ghost" onClick={() => navigate('/')}>Decidir depois <ArrowRight /></Button> : undefined}
      />
      <div className="notice" style={{ marginBottom: 30 }}>
        <Info />
        <div>
          <b>Versão de demonstração:</b> os preços são apenas informativos. Não existe nenhum pagamento, subscrição ou cobrança — todos os
          planos podem ser escolhidos gratuitamente.
        </div>
      </div>
      <div className="plans">
        {AI_PLAN_IDS.map((id, i) => {
          const p = AI_PLANS[id];
          const Icon = ICONS[id];
          const selected = me.profile.aiPlan === id;
          return (
            <div key={id} className={`plan-card fade-up ${p.highlight ? 'featured' : ''} ${selected ? 'selected' : ''}`} style={{ ['--i' as string]: i + 1 }}>
              {p.highlight && <span className="badge solid plan-flag">Mais completo</span>}
              <span className="plan-icon"><Icon /></span>
              <h3>{p.name}</h3>
              <p className="muted small" style={{ marginTop: 4 }}>{p.tagline}</p>
              <div className="plan-price">
                <b>{p.price}</b>
              </div>
              <span className="tiny faint">Preço ilustrativo · demonstração gratuita</span>
              <ul className="plan-features">
                {p.features.map((f) => (
                  <li key={f}><Check />{f}</li>
                ))}
                {MISSING[id].map((f) => (
                  <li key={f} className="no"><X />{f}</li>
                ))}
              </ul>
              <Button
                variant={selected ? 'secondary' : p.highlight ? 'primary' : 'outline'}
                size="lg"
                block
                loading={saving === id}
                disabled={selected}
                onClick={() => choose(id)}
                icon={selected ? <Check /> : undefined}
              >
                {selected ? 'Plano atual' : `Escolher ${p.name}`}
              </Button>
            </div>
          );
        })}
      </div>
      <div className="card" style={{ marginTop: 26 }}>
        <div className="card-title" style={{ marginBottom: 12 }}><Info /> Como funcionam os limites</div>
        <ul className="insights">
          <li><Check />As perguntas e as imagens contam por dia e voltam ao início à meia-noite.</li>
          <li><Check />Cada pedido à IA conta como uma pergunta: mensagens no chat, resumos, flashcards, testes e correções feitos pela IA.</li>
          <li><Check />Se a IA não conseguir responder, a pergunta não é contada.</li>
        </ul>
      </div>
    </div>
  );
}
