import { describe, expect, it, vi } from 'vitest';
import { ContentError, ContentRepository } from '../src/data/contentRepo.ts';
import { fetcherFor } from './helpers.ts';

describe('carregamento de conteúdo', () => {
  it('carrega o índice uma vez e as unidades só quando necessário', async () => {
    const repo = new ContentRepository('/content/', fetcherFor());
    await repo.loadIndex();
    await repo.loadIndex();
    expect(repo.requests).toBe(1);
    await Promise.all([repo.loadUnit('s1-u01'), repo.loadUnit('s1-u01'), repo.loadLesson('s1-u01-l002')]);
    expect(repo.requests).toBe(2); // pedidos simultâneos partilham a mesma promessa
  });
  it('lição inexistente dá um erro claro', async () => {
    const repo = new ContentRepository('/content/', fetcherFor());
    await expect(repo.loadLesson('s1-u01-l999')).rejects.toBeInstanceOf(ContentError);
  });
  it('recupera de uma falha de rede numa nova tentativa', async () => {
    const ok = fetcherFor();
    let fail = true;
    const repo = new ContentRepository('/content/', async (u) => {
      if (fail) { fail = false; throw new Error('offline'); }
      return ok(u);
    });
    await expect(repo.loadIndex()).rejects.toThrow(/ligação/);
    await expect(repo.loadIndex()).resolves.toBeTruthy();
  });
  it('rejeita conteúdo corrompido com uma mensagem útil', async () => {
    const repo = new ContentRepository('/content/', async () => ({ ok: true, status: 200, json: async () => ({ lixo: true }) }));
    await expect(repo.loadIndex()).rejects.toThrow(/inválido/);
  });
  it('vocabulário de secção sem conteúdo devolve null', async () => {
    const repo = new ContentRepository('/content/', fetcherFor());
    expect(await repo.loadVocab('s7')).toBeNull();
    expect((await repo.loadVocab('s1'))!.items.length).toBeGreaterThan(10);
  });
  it('limita o número de unidades em cache', async () => {
    const f = vi.fn(fetcherFor());
    const repo = new ContentRepository('/content/', f, 1);
    await repo.loadUnit('s1-u01');
    await repo.loadUnit('s1-u02');
    await repo.loadUnit('s1-u01');
    expect(f).toHaveBeenCalledTimes(3);
  });
});
