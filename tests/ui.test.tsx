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
import { fetcherFor, lessonOf, realFiles } from './helpers.ts';

const fetcher = fetcherFor();

beforeEach(async () => {
  await repo.deleteAllData();
  contentRepo.clear();
  vi.stubGlobal('fetch', (url: string) => fetcher(url));
  vi.stubGlobal('scrollTo', () => {});
  window.confirm = () => true;
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
    // Unidades sem conteúdo aparecem como "em preparação"
    expect(screen.getByRole('button', { name: /Unidade 3: Sons e pronúncia/ }).textContent).toMatch(/Em preparação/);
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
      await user.click(screen.getByRole('radio', { name: new RegExp(escape(ex.options.find((o) => o.correct)!.text)) }));
      break;
    case 'fillBlank':
      if (ex.choices) await user.click(screen.getByRole('radio', { name: new RegExp(`^\\d?${escape(first(ex.answers))}$`) }));
      else await user.type(screen.getByRole('textbox'), first(ex.answers));
      break;
    case 'translate':
      if (ex.wordBank) { await clickTokens(user, first(ex.answers)); break; }
      await user.type(screen.getByRole('textbox'), first(ex.answers));
      break;
    case 'conjugation':
      await user.type(screen.getByRole('textbox'), first(ex.answers));
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
        await user.click(within(group).getByRole('radio', { name: q.options.find((o) => o.correct)!.text }));
      }
      break;
    case 'listening':
      // jsdom não tem síntese de voz: o exercício oferece saltar sem penalização.
      await user.click(screen.getByRole('button', { name: /Saltar este exercício/ }));
      return 'skipped';
    case 'shortWriting':
      await user.type(screen.getByRole('textbox'), first(ex.referenceAnswers));
      break;
  }
  await user.click(screen.getByRole('button', { name: 'Verificar' }));
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

  it.each(realFiles().flatMap((f) => f.lessons).filter((l) => l.status === 'published').map((l) => l.id))(
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
