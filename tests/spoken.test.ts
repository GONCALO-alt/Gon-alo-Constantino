/**
 * Frase lida em voz alta depois de responder (engine/spoken.ts) e efeitos sonoros.
 */
import { describe, expect, it } from 'vitest';
import type { Exercise } from '../src/domain/schemas.ts';
import { correctedSentence, dutchAnswerText } from '../src/engine/spoken.ts';
import { SOUNDS, configureSounds, playSound } from '../src/services/sounds.ts';
import { realFiles } from './helpers.ts';

const base = { id: 's1-u01-l001-e01', instruction: 'x', explanation: 'y', vocabRefs: [] };

describe('frase neerlandesa a ler depois de responder', () => {
  it('tradução para neerlandês lê a resposta; para português lê o enunciado', () => {
    const toNl: Exercise = { ...base, type: 'translate', direction: 'pt-nl', prompt: 'Obrigado!', answers: ['Dank [je|u]( wel)'] };
    expect(dutchAnswerText(toNl)).toBe('Dank je wel');
    const toPt: Exercise = { ...base, type: 'translate', direction: 'nl-pt', prompt: 'Goedemorgen!', answers: ['Bom dia!'] };
    expect(dutchAnswerText(toPt)).toBe('Goedemorgen!');
  });
  it('preencher o espaço lê a frase completa, com maiúscula no início', () => {
    const ex: Exercise = { ...base, type: 'fillBlank', sentence: '___ jij broers?', answers: ['heb'] } as Exercise;
    expect(dutchAnswerText(ex)).toBe('Heb jij broers?');
  });
  it('encontrar o erro lê a frase corrigida', () => {
    expect(correctedSentence(['De', 'dijken', 'houdt', 'het', 'water', 'tegen.'], 2, 'houden')).toBe('De dijken houden het water tegen.');
    expect(correctedSentence(['Ik', 'heb', 'nergens', 'spijt', 'op.'], 4, 'van.')).toBe('Ik heb nergens spijt van.');
    expect(correctedSentence(['Ik', 'woon', 'in', 'de', 'Frankrijk.'], 3, '(retirar)')).toBe('Ik woon in Frankrijk.');
    expect(correctedSentence(['Ik', 'woon', 'in', 'de', 'Frankrijk.'], 4, '(retirar)')).toBe('Ik woon in de.');
    expect(correctedSentence(['a', 'b'], 0, 'stap … over')).toBeNull();
  });
  it('compreensão auditiva não volta a ler (já foi ouvida)', () => {
    const ex = { ...base, type: 'listening', audioText: 'Hallo', answers: ['Hallo'] } as unknown as Exercise;
    expect(dutchAnswerText(ex)).toBeNull();
  });
});

describe('todo o conteúdo publicado: a frase lida nunca fica partida', () => {
  const exercises = realFiles().flatMap((f) => f.lessons).filter((l) => l.status === 'published').flatMap((l) => l.exercises);
  it(`${exercises.length} exercícios`, () => {
    const bad: string[] = [];
    let spoken = 0;
    for (const ex of exercises) {
      const t = dutchAnswerText(ex);
      if (t === null) continue;
      spoken++;
      if (!t.trim() || t.includes('___') || /[[\]|]/.test(t)) bad.push(`${ex.id}: ${t}`);
    }
    expect(bad).toEqual([]);
    expect(spoken).toBeGreaterThan(exercises.length / 2);
  });
});

describe('efeitos sonoros', () => {
  it('todos os sons têm notas audíveis e curtas', () => {
    for (const [name, notes] of Object.entries(SOUNDS)) {
      expect(notes.length, name).toBeGreaterThan(0);
      for (const n of notes) {
        expect(n.f).toBeGreaterThan(100);
        expect(n.at + n.dur).toBeLessThan(1);
      }
    }
  });
  it('tocar sem Web Audio (ou desligado) não lança erros', () => {
    configureSounds({ enabled: false });
    expect(() => playSound('correct')).not.toThrow();
    configureSounds({ enabled: true });
    expect(() => playSound('incorrect')).not.toThrow();
  });
});
