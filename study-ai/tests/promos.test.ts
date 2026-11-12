import { describe, expect, it } from 'vitest';
import { emptyStore, pickPromo, PROMOS, recordDismissed, recordShown, type PromoContext } from '../src/promos.ts';

const base: PromoContext = {
  today: '2026-11-12',
  plan: 'claudio-6',
  aiConfigured: true,
  questionsLeft: null,
  nextTest: null,
  eventsCount: 2,
  conversations: 5,
  aiAnswersInConversation: 0,
  cardsTotal: 10,
  timerMinutes: 50,
  installed: true,
  phone: false,
  testResult: null,
};

describe('anúncios da STUDY AI', () => {
  it('não mostra nada quando nada faz sentido', () => {
    for (const slot of ['inicio', 'chat', 'plano', 'resumos', 'progresso', 'testes'] as const) {
      expect(pickPromo(slot, base, emptyStore())).toBeNull();
    }
  });

  it('perto do limite do Cláudio 5.5 sugere o Cláudio 6 (prioridade máxima)', () => {
    const ctx = { ...base, plan: 'claudio-5-5' as const, questionsLeft: 0, cardsTotal: 0 };
    const p = pickPromo('chat', ctx, emptyStore());
    expect(p?.id).toBe('limite-cl6');
    expect(p?.action).toEqual({ kind: 'plan', plan: 'claudio-6' });
    expect(p?.text).toContain('Grátis');
  });

  it('teste nos próximos dias leva ao gerador de testes dessa disciplina', () => {
    const ctx = { ...base, nextTest: { days: 2, subject: 'historia', subjectName: 'História', title: 'Teste de História' } };
    const p = pickPromo('inicio', ctx, emptyStore());
    expect(p?.id).toBe('teste-proximo');
    expect(p?.action).toEqual({ kind: 'link', to: '/testes?subject=historia' });
    expect(pickPromo('inicio', { ...ctx, nextTest: { ...ctx.nextTest, days: 9 } }, emptyStore())).toBeNull();
  });

  it('sem IA ligada não anuncia funcionalidades de IA', () => {
    const ctx = { ...base, aiConfigured: false, plan: 'claudio-5' as const, conversations: 0, questionsLeft: 0 };
    const ids = PROMOS.filter((p) => p.when(ctx)).map((p) => p.id);
    expect(ids).not.toContain('fotos-cl55');
    expect(ids).not.toContain('primeira-pergunta');
    expect(ids).not.toContain('limite-cl6');
  });

  it('fechar esconde o anúncio durante o período de pausa', () => {
    const ctx = { ...base, cardsTotal: 0 };
    expect(pickPromo('resumos', ctx, emptyStore())?.id).toBe('flashcards');
    const store = recordDismissed(emptyStore(), 'flashcards', '2026-11-12');
    expect(pickPromo('resumos', ctx, store)).toBeNull();
    expect(pickPromo('resumos', { ...ctx, today: '2026-11-18' }, store)).toBeNull();
    expect(pickPromo('resumos', { ...ctx, today: '2026-11-19' }, store)?.id).toBe('flashcards');
  });

  it('cada anúncio aparece num número limitado de dias', () => {
    const ctx = { ...base, cardsTotal: 0 };
    let store = emptyStore();
    for (const day of ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05']) store = recordShown(store, 'resumos', 'flashcards', day);
    expect(pickPromo('resumos', ctx, store)).toBeNull();
    // no último dia em que apareceu, continua a aparecer (não desaparece a meio do dia)
    expect(pickPromo('resumos', { ...ctx, today: '2026-11-05' }, store)?.id).toBe('flashcards');
  });

  it('a escolha mantém-se durante o dia, salvo se surgir algo bem mais importante', () => {
    const ctx = { ...base, cardsTotal: 0, timerMinutes: 0 };
    let store = recordShown(emptyStore(), 'inicio', 'modo-estudo', ctx.today);
    // «flashcards» (40) é só um pouco mais importante que «modo de estudo» (30): mantém-se o de hoje
    expect(pickPromo('inicio', ctx, store)?.id).toBe('modo-estudo');
    // um teste daqui a 2 dias (90) passa à frente
    const urgent = { ...ctx, nextTest: { days: 2, subject: null, subjectName: 'X', title: 'Teste' } };
    expect(pickPromo('inicio', urgent, store)?.id).toBe('teste-proximo');
    store = recordShown(store, 'inicio', 'teste-proximo', ctx.today);
    expect(pickPromo('inicio', urgent, store)?.id).toBe('teste-proximo');
  });

  it('depois de um teste, sugere conforme a nota', () => {
    const low = pickPromo('teste-resultado', { ...base, testResult: { pct: 30, subject: 'matematica', subjectName: 'Matemática' } }, emptyStore());
    expect(low?.id).toBe('nota-baixa');
    expect(low?.text).toContain('Matemática');
    const high = pickPromo('teste-resultado', { ...base, testResult: { pct: 90, subject: null, subjectName: 'esta matéria' } }, emptyStore());
    expect(high?.id).toBe('nota-alta');
    expect(pickPromo('teste-resultado', { ...base, testResult: { pct: 65, subject: null, subjectName: 'x' } }, emptyStore())).toBeNull();
  });

  it('o anúncio de instalar só aparece em telemóveis sem a app instalada', () => {
    expect(pickPromo('inicio', { ...base, phone: true, installed: false }, emptyStore())?.id).toBe('instalar');
    expect(pickPromo('inicio', { ...base, phone: true, installed: true }, emptyStore())).toBeNull();
    expect(pickPromo('inicio', { ...base, phone: false, installed: false }, emptyStore())).toBeNull();
  });
});
