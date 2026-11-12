import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Camera, ClipboardCheck, Crown, Layers, MessagesSquare, Smartphone, Sparkles, Timer, Trophy, X, type LucideIcon } from 'lucide-react';
import { api } from '../api';
import { isPhoneOrTablet, useInstall } from '../pwa';
import { emptyStore, pickPromo, recordDismissed, recordShown, type PromoContext, type PromoSlot, type PromoStore, type PromoView } from '../promos';
import { useApp, useMe, useQuery } from '../state';
import { daysBetween, today } from '../../shared/dates';
import { AI_PLANS, questionsLeft } from '../../shared/plans';
import { getSubject } from '../../shared/subjects';
import type { CalendarEvent, MeResponse } from '../../shared/types';
import { InstallHelp } from './Install';
import { Button, IconButton } from './ui';

const ICONS: Record<PromoView['icon'], LucideIcon> = {
  crown: Crown, camera: Camera, sparkles: Sparkles, clipboard: ClipboardCheck, layers: Layers, timer: Timer,
  smartphone: Smartphone, calendar: CalendarDays, message: MessagesSquare, trophy: Trophy,
};

const KEY = 'study-ai:anuncios';

function loadStore(): PromoStore {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<PromoStore>) : null;
    return { records: parsed?.records ?? {}, picks: parsed?.picks ?? {} };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: PromoStore) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* sem armazenamento local: os anúncios continuam a funcionar, só sem memória */
  }
}

interface Stats {
  conversations: number;
  timerMinutes?: number;
  cards: { total: number };
}

/** Lugar para um anúncio da própria STUDY AI. Não mostra nada se nenhum fizer sentido agora. */
export function Promo({
  slot,
  aiAnswers = 0,
  testResult = null,
}: {
  slot: PromoSlot;
  aiAnswers?: number;
  testResult?: { pct: number; subject: string | null } | null;
}) {
  const me = useMe();
  const { setMe, toast } = useApp();
  const navigate = useNavigate();
  const install = useInstall();
  const date = today();
  const stats = useQuery<Stats>(`/stats?date=${date}`);
  const events = useQuery<{ events: CalendarEvent[] }>('/events');
  const [store] = useState(loadStore);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);
  const custom = me.profile.questionnaire?.customSubjects;

  const promo = useMemo(() => {
    if (!stats.data || !events.data) return null;
    const next = events.data.events
      .filter((e) => e.type === 'teste' && daysBetween(date, e.date) >= 0)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const ctx: PromoContext = {
      today: date,
      plan: me.profile.aiPlan,
      aiConfigured: me.ai.configured,
      questionsLeft: questionsLeft(me.usage),
      nextTest: next
        ? { days: daysBetween(date, next.date), subject: next.subject, subjectName: next.subject ? getSubject(next.subject, custom).name : next.title, title: next.title }
        : null,
      eventsCount: events.data.events.length,
      conversations: stats.data.conversations,
      aiAnswersInConversation: aiAnswers,
      cardsTotal: stats.data.cards.total,
      timerMinutes: stats.data.timerMinutes ?? 0,
      installed: install.installed,
      phone: isPhoneOrTablet(),
      testResult: testResult
        ? { ...testResult, subjectName: testResult.subject ? getSubject(testResult.subject, custom).name : 'esta matéria' }
        : null,
    };
    return pickPromo(slot, ctx, store);
    // A escolha fica fixa enquanto a página está aberta; só muda com o plano ou os dados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot, !!stats.data, !!events.data, me.profile.aiPlan, me.usage.questionsUsed, aiAnswers >= 3, testResult?.pct, install.installed]);

  useEffect(() => {
    if (promo) saveStore(recordShown(loadStore(), slot, promo.id, date));
  }, [promo?.id, slot, date]);

  if (!promo || hidden) return null;
  const Icon = ICONS[promo.icon];

  async function act() {
    if (!promo) return;
    const a = promo.action;
    if (a.kind === 'link') navigate(a.to);
    else if (a.kind === 'install') {
      if (install.canPrompt) {
        if (await install.prompt()) toast('A STUDY AI foi instalada.');
      } else setHelp(true);
    } else {
      setBusy(true);
      try {
        setMe(await api<MeResponse>('/profile/ai-plan', { method: 'PUT', body: { plan: a.plan } }));
        toast(`${AI_PLANS[a.plan].name} ativado — grátis nesta versão.`);
        setHidden(true);
      } catch (err) {
        toast((err as Error).message, 'error');
      } finally {
        setBusy(false);
      }
    }
  }

  function dismiss() {
    if (!promo) return;
    saveStore(recordDismissed(loadStore(), promo.id, date));
    setHidden(true);
  }

  return (
    <aside className={`promo fade-up ${promo.featured ? 'featured' : ''}`} aria-label="Anúncio da STUDY AI" data-promo={promo.id}>
      <span className="promo-ic">
        <Icon />
      </span>
      <div className="promo-body">
        <span className="promo-tag">Anúncio · STUDY AI</span>
        <b>{promo.title}</b>
        <p>{promo.text}</p>
      </div>
      <div className="promo-cta">
        <Button size="sm" variant={promo.featured ? 'primary' : 'secondary'} loading={busy} onClick={act}>
          {promo.cta}
        </Button>
      </div>
      <IconButton label="Fechar anúncio" small className="promo-x" onClick={dismiss}>
        <X />
      </IconButton>
      <InstallHelp open={help} onClose={() => setHelp(false)} />
    </aside>
  );
}
