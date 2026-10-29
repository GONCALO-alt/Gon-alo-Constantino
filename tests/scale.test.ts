/**
 * Testes de ESCALA com dados sintéticos. Medem desempenho e tamanhos —
 * não dizem nada sobre a qualidade linguística (isso exige revisão humana).
 */
import { describe, expect, it } from 'vitest';
import { ContentRepository } from '../src/data/contentRepo.ts';
import * as repo from '../src/data/progressRepo.ts';
import { getDB } from '../src/data/db.ts';
import { computeLessonStates, computeUnitStates, nextLesson, orderedUnits } from '../src/engine/progression.ts';
import { compileContent } from '../tools/lib/build.ts';
import { syntheticCourse } from '../tools/lib/synthetic.ts';
import { validateContent } from '../tools/lib/validate.ts';
import { asRaw, fetcherFor, realStructure } from './helpers.ts';

const results: Record<string, unknown> = {};
const ms = (t: number) => Math.round(performance.now() - t);

describe.each([500, 1000, 5000])('catálogo com %i lições', (n) => {
  const structure = realStructure();
  const files = syntheticCourse(structure, n);

  it('valida o catálogo inteiro (incluindo semelhança) em tempo razoável', () => {
    const t = performance.now();
    const r = validateContent(structure, asRaw(files));
    const elapsed = ms(t);
    results[`validate_${n}_ms`] = elapsed;
    expect(r.stats.lessons).toBe(n);
    expect(r.errors).toEqual([]);
    expect(elapsed).toBeLessThan(n === 5000 ? 30_000 : 10_000);
  });

  it('compila em pacotes por unidade com um índice pequeno', () => {
    const t = performance.now();
    const c = compileContent(structure, files);
    results[`compile_${n}_ms`] = ms(t);
    const indexBytes = JSON.stringify(c.index).length;
    const maxUnit = Math.max(...[...c.units.values()].map((u) => JSON.stringify(u).length));
    results[`index_${n}_kb`] = Math.round(indexBytes / 1024);
    results[`max_unit_${n}_kb`] = Math.round(maxUnit / 1024);
    expect(c.units.size).toBe(structure.sections.reduce((k, s) => k + s.units.length, 0));
    expect(indexBytes).toBeLessThan(250 * 1024); // o índice nunca inclui exercícios
    expect(maxUnit).toBeLessThan(400 * 1024);
  });

  it('calcula desbloqueios e próxima lição rapidamente, mesmo com tudo concluído', () => {
    const c = compileContent(structure, files);
    const all = orderedUnits(c.index).flatMap((u) => u.lessonIds);
    const half = new Set(all.slice(0, Math.floor(all.length / 2)));
    const t = performance.now();
    for (let i = 0; i < 20; i++) {
      const st = computeUnitStates(c.index, half);
      for (const u of orderedUnits(c.index)) computeLessonStates(u, st.get(u.id)!, half);
      nextLesson(c.index, half);
    }
    const per = (performance.now() - t) / 20;
    results[`unlock_${n}_ms`] = Math.round(per * 10) / 10;
    expect(per).toBeLessThan(50);
    expect(nextLesson(c.index, new Set(all))).toBeNull();
  });

  it('a aplicação só descarrega as unidades que abre', async () => {
    const c = compileContent(structure, files);
    const r = new ContentRepository('/content/', fetcherFor(c));
    const idx = await r.loadIndex();
    const first = idx.sections[0]!.units[0]!;
    await r.loadLesson(first.lessonIds[0]!);
    await r.loadLesson(first.lessonIds.at(-1)!);
    expect(r.requests).toBe(2); // índice + 1 unidade, nunca o catálogo inteiro
  });
});

describe('persistência com muito progresso', () => {
  it('lê 5.000 lições concluídas e 5.000 itens de revisão rapidamente', async () => {
    await repo.deleteAllData();
    const db = await getDB();
    const tx = db.transaction(['lessonProgress', 'reviews'], 'readwrite');
    for (let i = 0; i < 5000; i++) {
      void tx.objectStore('lessonProgress').put({ lessonId: `s1-u01-l${i}`, unitId: 's1-u01', completedAt: '', contentVersion: 1, bestAccuracy: 1, timesCompleted: 1, xpEarned: 10 });
      void tx.objectStore('reviews').put({ itemId: `v-${i}`, kind: 'vocab', firstLearnedAt: '', lastReviewedAt: '', dueAt: i, box: 0, reviews: 0, correct: 0, incorrect: 0, lapses: 0, difficulty: 3 });
    }
    await tx.done;
    const t = performance.now();
    const done = await repo.getCompletedLessonIds();
    const due = await repo.countDueReviews(2500);
    results.read_5000_progress_ms = ms(t);
    expect(done.size).toBe(5000);
    expect(due).toBe(2501);
    // fake-indexeddb é bastante mais lento do que o IndexedDB real dos navegadores.
    expect(performance.now() - t).toBeLessThan(5000);
  });

  it('regista os resultados', () => {
    console.log('\n[escala] ' + JSON.stringify(results, null, 1));
  });
});
