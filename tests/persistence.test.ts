import { beforeEach, describe, expect, it } from 'vitest';
import { openDB } from 'idb';
import { closeDB, DB_NAME, getDB, MIGRATIONS } from '../src/data/db.ts';
import * as repo from '../src/data/progressRepo.ts';

const T = Date.UTC(2026, 9, 29, 10);

function completion(lessonId = 's1-u01-l001', verdicts: ('correct' | 'incorrect' | 'almost')[] = ['correct', 'incorrect', 'correct']): repo.LessonCompletion {
  return {
    lessonId, unitId: lessonId.slice(0, 6), contentVersion: 1, difficulty: 2, xp: 15, startedAt: T - 300_000, endedAt: T,
    newVocabIds: ['v-hallo', 'v-hoi'],
    answers: verdicts.map((v, i) => ({ exerciseId: `${lessonId}-e0${i + 1}`, exerciseType: 'translate', verdict: v, answer: 'x', vocabRefs: i === 1 ? ['v-hallo'] : [] })),
  };
}

beforeEach(async () => {
  await repo.deleteAllData();
});

describe('progresso persistente', () => {
  it('cria perfil e definições por omissão', async () => {
    const p = await repo.getProfile();
    expect(p.totalXp).toBe(0);
    const s = await repo.getSettings();
    expect(s.dailyGoalXp).toBe(30);
  });

  it('grava uma lição concluída e recupera tudo depois de "reabrir" a aplicação', async () => {
    await repo.getProfile();
    const out = await repo.recordLessonCompletion(completion());
    expect(out.isRepeat).toBe(false);
    expect(out.newAchievements.map((a) => a.id)).toContain('first-lesson');
    await closeDB(); // simula fechar e voltar a abrir
    expect(await repo.getCompletedLessonIds()).toEqual(new Set(['s1-u01-l001']));
    const p = await repo.getProfile();
    expect(p.totalXp).toBe(15);
    expect(p.studyDays).toHaveLength(1);
    expect(p.lastLessonId).toBe('s1-u01-l001');
    const reviews = await repo.getAllReviews();
    expect(reviews.map((r) => r.itemId).sort()).toEqual(['v-hallo', 'v-hoi']);
    const attempts = await repo.getRecentAttempts('2000-01-01');
    expect(attempts).toHaveLength(3);
    expect(attempts.filter((a) => !a.correct)).toHaveLength(1);
    expect((await repo.getAchievements()).map((a) => a.id)).toContain('first-lesson');
  });

  it('um erro numa lição antecipa a revisão da palavra', async () => {
    await repo.getProfile();
    await repo.recordLessonCompletion(completion());
    const [hallo, hoi] = (await repo.getAllReviews()).sort((a, b) => a.itemId.localeCompare(b.itemId));
    expect(hallo!.incorrect).toBe(1);
    expect(hallo!.dueAt).toBeLessThan(hoi!.dueAt);
  });

  it('repetir uma lição atualiza a melhor precisão sem duplicar o registo', async () => {
    await repo.getProfile();
    await repo.recordLessonCompletion(completion());
    const again = await repo.recordLessonCompletion({ ...completion('s1-u01-l001', ['correct', 'correct', 'correct']), endedAt: T + 1000 });
    expect(again.isRepeat).toBe(true);
    const lp = await repo.getAllLessonProgress();
    expect(lp).toHaveLength(1);
    expect(lp[0]!.timesCompleted).toBe(2);
    expect(lp[0]!.bestAccuracy).toBe(1);
  });

  it('a sessão de revisão atualiza o calendário (só a primeira resposta por item)', async () => {
    await repo.getProfile();
    await repo.recordLessonCompletion(completion());
    const before = (await repo.getAllReviews()).find((r) => r.itemId === 'v-hoi')!;
    await repo.recordReviewSession([
      { itemId: 'v-hoi', verdict: 'correct', answer: 'olá', exerciseType: 'translate' },
      { itemId: 'v-hoi', verdict: 'incorrect', answer: '?', exerciseType: 'translate' },
    ], 5, T, T + 60_000);
    const after = (await repo.getAllReviews()).find((r) => r.itemId === 'v-hoi')!;
    expect(after.box).toBe(before.box + 1);
    expect(after.reviews).toBe(1);
    expect((await repo.getProfile()).totalXp).toBe(20);
  });

  it('exporta, apaga e restaura os dados', async () => {
    await repo.getProfile();
    await repo.recordLessonCompletion(completion());
    const backup = await repo.exportAllData();
    await repo.deleteAllData();
    expect((await repo.getCompletedLessonIds()).size).toBe(0);
    await repo.importAllData(JSON.parse(JSON.stringify(backup)));
    expect((await repo.getCompletedLessonIds()).size).toBe(1);
    await expect(repo.importAllData({ app: 'outra' })).rejects.toThrow(/inválido/);
  });

  it('opções novas nas definições recebem valores por omissão', async () => {
    const db = await getDB();
    await db.put('settings', { id: 'local', dailyGoalXp: 50 } as never);
    const s = await repo.getSettings();
    expect(s.dailyGoalXp).toBe(50);
    expect(s.audioEnabled).toBe(true);
  });
});

describe('migrações da base de dados', () => {
  it('atualiza da versão 1 para a atual sem perder dados', async () => {
    await closeDB();
    const v1 = await openDB(DB_NAME, 1, { upgrade: (db, _o, _n, tx) => MIGRATIONS[0]!(db as never, tx as never) });
    await v1.put('profile', { id: 'local', displayName: 'Ana', createdAt: '', totalXp: 42, studyDays: [], totalStudySeconds: 0 });
    await v1.put('lessonProgress', { lessonId: 's1-u01-l001', unitId: 's1-u01', completedAt: '', contentVersion: 1, bestAccuracy: 1, timesCompleted: 1, xpEarned: 10 });
    v1.close();
    const db = await getDB();
    expect(db.version).toBeGreaterThan(1);
    expect(db.objectStoreNames.contains('sessions')).toBe(true);
    expect((await repo.getProfile()).totalXp).toBe(42);
    expect((await repo.getCompletedLessonIds()).has('s1-u01-l001')).toBe(true);
  });
});
