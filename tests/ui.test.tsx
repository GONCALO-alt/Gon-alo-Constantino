/**
 * Testes de interface (jsdom): navegação, desbloqueio e uma lição completa
 * respondida como um utilizador, com gravação real do progresso (IndexedDB simulado).
 */
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../src/domain/schemas.ts';
import { contentRepo } from '../src/data/contentRepo.ts';
import * as repo from '../src/data/progressRepo.ts';
import { expandAnswerPattern } from '../src/engine/answers.ts';
import { App } from '../src/ui/App.tsx';
import { parseRoute } from '../src/ui/router.ts';
import { fetcherFor, lessonOf, realFiles, realStructure } from './helpers.ts';

const fetcher = fetcherFor();

beforeEach(async () => {
  await repo.deleteAllData();
  contentRepo.clear();
  vi.stubGlobal('fetch', (url: string) => fetcher(url));
  vi.stubGlobal('scrollTo', () => {});
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function go(hash: string) {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

describe('router', () => {
  it('interpreta as rotas', () => {
    expect(parseRoute('#/')).toEqual({ name: 'home' });
    expect(parseRoute('#/curso/s3')).toEqual({ name: 'course', sectionId: 's3' });
    expect(parseRoute('#/licao/s1-u01-l001')).toEqual({ name: 'lesson', lessonId: 's1-u01-l001' });
    expect(parseRoute('#/revisao/sessao/gramatica')).toEqual({ name: 'reviewSession', mode: 'grammar' });
    expect(parseRoute('#/xpto').name).toBe('notFound');
  });
});

describe('navegação', () => {
  it('ecrã inicial e mapa com as 7 secções', async () => {
    await go('#/');
    render(<App />);
    expect(await screen.findByText(/Começar a primeira lição/)).toBeTruthy();
    await go('#/curso');
    const items = await screen.findAllByRole('link', { name: /Secção|Primeiros passos|A vida quotidiana|Viver nos|Comunicação|Fluência|avançado|Domínio/ });
    expect(items.length).toBeGreaterThanOrEqual(7);
  });

  it('secção 1: primeira unidade aberta, segunda bloqueada', async () => {
    await go('#/curso/s1');
    render(<App />);
    expect(await screen.findByRole('link', { name: /Olá e adeus — disponível/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Unidade 2: Apresentações pessoais/ }).textContent).toMatch(/Bloqueada/);
    expect(screen.getByLabelText(/Bom dia, boa tarde, boa noite — bloqueada/)).toBeTruthy();
    // Unidades sem conteúdo aparecem como "em preparação" (se ainda houver alguma na secção 1)
    const withContent = new Set(realFiles().map((f) => f.unitId));
    const empty = realStructure().sections[0]!.units.find((u) => !withContent.has(u.id));
    if (empty) expect(screen.getByRole('button', { name: new RegExp(`Unidade ${empty.order}:`) }).textContent).toMatch(/Em preparação/);
  });

  it('uma lição bloqueada não pode ser aberta pelo endereço', async () => {
    await go('#/licao/s1-u02-l001');
    render(<App />);
    expect(await screen.findByText(/ainda está bloqueada/)).toBeTruthy();
  });
});

/** Responde corretamente a um exercício, interagindo como o utilizador. */
async function answerCorrectly(user: ReturnType<typeof userEvent.setup>, ex: Exercise) {
  const first = (xs: string[]) => expandAnswerPattern(xs[0]!)[0]!;
  switch (ex.type) {
    case 'multipleChoice':
    case 'expression':
    case 'dialogue':
      await user.click(screen.getByRole('radio', { name: new RegExp(`^\\d?${escape(ex.options.find((o) => o.correct)!.text)}$`) }));
      break;
    case 'fillBlank':
      if (ex.choices) await user.click(screen.getByRole('radio', { name: new RegExp(`^\\d?${escape(first(ex.answers))}$`) }));
      else await user.type(screen.getByRole('textbox'), expandAnswerPattern(ex.answers[0]!)[0]!);
      break;
    case 'translate':
      if (ex.wordBank) { await clickTokens(user, first(ex.answers)); break; }
      await user.type(screen.getByRole('textbox'), expandAnswerPattern(ex.answers[0]!)[0]!);
      break;
    case 'conjugation':
      await user.type(screen.getByRole('textbox'), expandAnswerPattern(ex.answers[0]!)[0]!);
      break;
    case 'buildSentence':
      await clickTokens(user, first(ex.answers));
      break;
    case 'wordOrder':
      for (const t of ex.tokens) await user.click(screen.getByRole('button', { name: `Acrescentar ${t}` }));
      break;
    case 'articleChoice':
      await user.click(screen.getByRole('radio', { name: new RegExp(`^\\d?${ex.article}$`) }));
      break;
    case 'findError':
      await user.click(screen.getAllByRole('radio')[ex.errorIndex]!);
      break;
    case 'match':
      for (const p of ex.pairs) {
        await user.click(within(screen.getByLabelText('Neerlandês')).getByRole('button', { name: p.nl }));
        await user.click(within(screen.getByLabelText('Português')).getByRole('button', { name: p.pt }));
      }
      break;
    case 'comprehension':
      for (const q of ex.questions) {
        const group = screen.getByRole('group', { name: q.prompt });
        await user.click(within(group).getByRole('radio', { name: new RegExp(`^${escape(q.options.find((o) => o.correct)!.text)}$`) }));
      }
      break;
    case 'listening':
      // jsdom não tem síntese de voz: o exercício oferece saltar sem penalização.
      await user.click(screen.getByRole('button', { name: /Saltar este exercício/ }));
      return 'skipped';
    case 'shortWriting':
      // Escrita livre: confirma-se com Enter.
      await user.type(screen.getByRole('textbox'), first(ex.referenceAnswers));
      await user.keyboard('{Enter}');
      break;
  }
  // Nada é corrigido antes de carregar em «Verificar» (a escrita livre verifica-se com Enter).
  if (ex.type !== 'shortWriting') {
    expect(screen.queryByRole('status')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
  }
  return 'answered';
}

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function clickTokens(user: ReturnType<typeof userEvent.setup>, sentence: string) {
  const available = screen.getAllByRole('button', { name: /^Acrescentar / });
  const norm = (s: string) => s.toLowerCase().replace(/[.,!?]/g, '');
  for (const word of sentence.split(' ')) {
    const btn = available.find((b) => !b.hasAttribute('disabled') && norm(b.textContent ?? '') === norm(word) && !(b as HTMLButtonElement).dataset.used);
    if (!btn) throw new Error(`Peça não encontrada: ${word}`);
    (btn as HTMLButtonElement).dataset.used = '1';
    await user.click(btn);
  }
}

describe('lição completa', () => {
  it('responde a todos os exercícios, guarda o progresso e desbloqueia a lição seguinte', async () => {
    const user = userEvent.setup();
    const lesson = lessonOf(realFiles(), 's1-u01-l001');
    await go('#/licao/s1-u01-l001');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Olá e adeus' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Começar/ }));

    for (const ex of lesson.exercises) {
      await screen.findByRole('heading', { name: ex.instruction });
      const r = await answerCorrectly(user, ex);
      if (r === 'skipped') continue;
      const status = await screen.findByRole('status');
      expect(status.textContent, `${ex.id} (${ex.type})`).not.toMatch(/Ainda não|Não é bem|incorreta/);
      await user.click(screen.getByRole('button', { name: 'Continuar' }));
    }

    expect(await screen.findByText('Lição concluída!')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    await waitFor(async () => expect((await repo.getCompletedLessonIds()).has('s1-u01-l001')).toBe(true));
    expect((await repo.getProfile()).totalXp).toBeGreaterThan(0);
    expect((await repo.getAllReviews()).length).toBe(lesson.newVocabulary.length);
    expect(await screen.findByRole('link', { name: /Próxima lição/ })).toBeTruthy();
  }, 60_000);

  // Amostra: a primeira lição de cada unidade (todas as lições são verificadas sem interface em content-answers.test.ts),
  // mais duas lições de revisão geradas (ordenar palavras e construir frases passam pela interface real).
  const generatedSample = realFiles()
    .flatMap((f) => f.lessons.filter((l) => (l.provenance.generator ?? '').includes('review_gen')))
    .filter((l) => l.exercises.some((e) => e.type === 'wordOrder'))
    .map((l) => l.id);
  it.each([
    ...realFiles().map((f) => f.lessons.find((l) => l.status === 'published')?.id).filter((x): x is string => !!x).slice(0, 25),
    ...[generatedSample[0], generatedSample.at(-1)].filter((x): x is string => !!x),
  ])(
    'a resposta de referência de cada exercício é aceite pela interface: %s',
    async (id) => {
      const user = userEvent.setup();
      const lesson = lessonOf(realFiles(), id);
      await repo.saveSettings({ ...(await repo.getSettings()), freeNavigation: true });
      await go(`#/licao/${id}`);
      render(<App />);
      await user.click(await screen.findByRole('button', { name: /Começar/ }));
      for (const ex of lesson.exercises) {
        await screen.findByRole('heading', { name: ex.instruction });
        if ((await answerCorrectly(user, ex)) === 'skipped') continue;
        expect((await screen.findByRole('status')).textContent, `${ex.id} (${ex.type})`).not.toMatch(/Ainda não|Não é bem|incorreta/);
        await user.click(screen.getByRole('button', { name: 'Continuar' }));
      }
      expect(await screen.findByText('Lição concluída!')).toBeTruthy();
    },
    60_000,
  );

  it('uma resposta errada mostra a correção e repete o exercício no fim', async () => {
    const user = userEvent.setup();
    await go('#/licao/s1-u01-l001');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Começar/ }));
    await user.click(screen.getByRole('radio', { name: /doei/ }));
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    const fb = await screen.findByRole('status');
    expect(fb.textContent).toMatch(/hoi/);
    expect(fb.textContent).toMatch(/despedida/); // feedback específico da opção
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByRole('heading', { name: 'Traduza para português.' })).toBeTruthy();
  });
});

describe('«Não me lembro»', () => {
  it('mostra a resposta, deixa responder e repete o exercício no fim', async () => {
    const user = userEvent.setup();
    const lesson = lessonOf(realFiles(), 's1-u01-l001');
    const first = lesson.exercises[0]!;
    if (first.type !== 'multipleChoice') throw new Error('o teste espera escolha múltipla no 1.º exercício');
    const correct = first.options.find((o) => o.correct)!;
    await go('#/licao/s1-u01-l001');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Começar/ }));
    await user.click(screen.getByRole('button', { name: 'Não me lembro' }));
    // A resposta aparece antes de responder, e o botão desaparece.
    expect((await screen.findByText('Resposta certa:')).parentElement!.textContent).toContain(correct.text);
    expect(screen.queryByRole('button', { name: 'Não me lembro' })).toBeNull();
    // O aluno responde com a resposta que acabou de ver.
    await user.click(screen.getByRole('radio', { name: new RegExp(correct.text) }));
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    expect((await screen.findByRole('status')).textContent).toMatch(/volta a aparecer no fim/);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    // O botão volta a estar disponível no exercício seguinte.
    expect(await screen.findByRole('button', { name: 'Não me lembro' })).toBeTruthy();
  });
});

describe('botão «Verificar»', () => {
  it('fica desativado sem resposta e só corrige quando se carrega nele', async () => {
    const user = userEvent.setup();
    await go('#/licao/s1-u01-l001');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Começar/ }));
    const btn = screen.getByRole('button', { name: 'Verificar' });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('radio', { name: /hoi/ }));
    expect(screen.queryByRole('status')).toBeNull(); // escolher não corrige
    expect((btn as HTMLButtonElement).disabled).toBe(false);
    await user.click(btn);
    expect((await screen.findByRole('status')).textContent).toMatch(/Certo|Muito bem|Exatamente|Correto/);
  });

  it('texto escrito verifica-se com Enter, mesmo quando está certo', async () => {
    const user = userEvent.setup();
    const lesson = lessonOf(realFiles(), 's1-u01-l001');
    const idx = lesson.exercises.findIndex((e) => e.type === 'translate' && !e.wordBank);
    const ex = lesson.exercises[idx]!;
    if (ex.type !== 'translate') throw new Error('o teste espera uma tradução escrita');
    await go('#/licao/s1-u01-l001');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Começar/ }));
    for (const e of lesson.exercises.slice(0, idx)) {
      await screen.findByRole('heading', { name: e.instruction });
      await answerCorrectly(user, e);
      await user.click(await screen.findByRole('button', { name: 'Continuar' }));
    }
    await screen.findByRole('heading', { name: ex.instruction });
    await user.type(screen.getByRole('textbox'), expandAnswerPattern(ex.answers[0]!)[0]!);
    await new Promise((r) => setTimeout(r, 700));
    expect(screen.queryByRole('status')).toBeNull(); // certo, mas não avança sozinho
    await user.keyboard('{Enter}');
    expect((await screen.findByRole('status')).textContent).toMatch(/Certo|Muito bem|Exatamente|Correto/);
  }, 30_000);
});

describe('sair de uma lição', () => {
  it('pede confirmação dentro da página e permite continuar ou sair', async () => {
    const user = userEvent.setup();
    await go('#/licao/s1-u01-l001');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Começar/ }));
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(screen.getByRole('alertdialog').textContent).toMatch(/não fica guardado/);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sair' }));
    await waitFor(() => expect(window.location.hash).toBe('#/curso/s1'));
  });
});

describe('revisão', () => {
  it('depois de uma lição, a revisão mostra as palavras e corre uma sessão', async () => {
    const user = userEvent.setup();
    const lesson = lessonOf(realFiles(), 's1-u01-l001');
    await repo.getProfile();
    await repo.recordLessonCompletion({
      lessonId: lesson.id, unitId: lesson.unitId, contentVersion: 1, difficulty: 1, xp: 10,
      startedAt: Date.now() - 60 * 60_000, endedAt: Date.now() - 30 * 60_000,
      newVocabIds: lesson.newVocabulary.map((v) => v.id),
      answers: [{ exerciseId: lesson.exercises[0]!.id, exerciseType: 'multipleChoice', verdict: 'incorrect', answer: 'doei', vocabRefs: ['v-hoi'] }],
    });
    await go('#/revisao');
    render(<App />);
    expect(await screen.findByText('Para rever agora')).toBeTruthy();
    expect(screen.getByText(/Erros recentes/)).toBeTruthy();
    await user.click(screen.getByRole('link', { name: /Rever \d+ palavras/ }));
    expect(await screen.findByRole('button', { name: 'Não me lembro' })).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });
});
