/**
 * Organização do curso apresentada ao aluno: 8 secções e 1005 unidades curtas
 * (10, 30, 30, 60, 255, 260, 180, 180), em vez das 7 secções e 109 unidades temáticas
 * em que as lições são escritas (content/course.json).
 *
 * As lições, os seus IDs e a sua ordem não mudam — só o agrupamento. Cada lição escrita
 * fica sempre na mesma unidade que a sua prática. O progresso dos alunos (guardado por
 * ID de lição) mantém-se.
 */
import type { CourseIndex, IndexedSection, IndexedUnit } from '../../src/domain/schemas.ts';

interface SectionPlan {
  id: string;
  title: string;
  goal: string;
  cefr: IndexedSection['cefr'];
  units: number;
  /** Unidades temáticas (de autoria) que entram nesta secção, pela ordem. */
  from: string[];
}

const range = (sec: string, a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => `${sec}-u${String(a + i).padStart(2, '0')}`);

export const SECTION_PLAN: SectionPlan[] = [
  { id: 's1', title: 'Primeiros passos', goal: 'Cumprimentar, apresentar-se e as primeiras palavras.', cefr: 'Inicial', units: 10, from: range('s1', 1, 3) },
  { id: 's2', title: 'O essencial do dia a dia', goal: 'Números, horas, família, casa e rotinas em frases simples.', cefr: 'A1', units: 30, from: range('s1', 4, 15) },
  { id: 's3', title: 'A vida quotidiana', goal: 'Comunicar em situações familiares e previsíveis.', cefr: 'A1', units: 30, from: range('s2', 1, 15) },
  { id: 's4', title: 'Viver nos Países Baixos', goal: 'Desenvolver autonomia nas situações práticas.', cefr: 'A2', units: 60, from: range('s3', 1, 16) },
  { id: 's5', title: 'Comunicação independente', goal: 'Manter conversas sobre experiências, planos e opiniões.', cefr: 'B1', units: 255, from: [...range('s4', 1, 16), ...range('s5', 1, 1)] },
  { id: 's6', title: 'Fluência prática', goal: 'Falar e escrever com mais fluência no trabalho e no dia a dia.', cefr: 'B1', units: 260, from: range('s5', 2, 16) },
  { id: 's7', title: 'Neerlandês avançado', goal: 'Compreender e produzir textos mais complexos.', cefr: 'B2', units: 180, from: range('s6', 1, 16) },
  { id: 's8', title: 'Domínio e utilização real', goal: 'Usar o neerlandês com à-vontade em situações reais.', cefr: 'B2', units: 180, from: range('s7', 1, 15) },
];

/** Grupos que não se separam: uma lição escrita e a prática que vem logo a seguir (l5xx). */
function groupsOf(lessonIds: readonly string[]): string[][] {
  const groups: string[][] = [];
  for (const id of lessonIds) {
    const isPractice = /-l5\d\d$/.test(id);
    if (isPractice && groups.length) groups[groups.length - 1]!.push(id);
    else groups.push([id]);
  }
  return groups;
}

/** Reparte `n` partes por tamanhos (proporcional, pelo menos 1 cada, total exato). */
export function apportion(sizes: readonly number[], n: number, max: readonly number[]): number[] {
  const total = sizes.reduce((a, b) => a + b, 0);
  const parts = sizes.map((s, i) => Math.min(max[i]!, Math.max(1, Math.floor((s / total) * n))));
  let sum = parts.reduce((a, b) => a + b, 0);
  // Acerta o total: dá (ou tira) partes às unidades com mais (ou menos) lições por parte.
  while (sum < n) {
    let best = -1;
    for (let i = 0; i < sizes.length; i++) if (parts[i]! < max[i]! && (best < 0 || sizes[i]! / parts[i]! > sizes[best]! / parts[best]!)) best = i;
    if (best < 0) break;
    parts[best]!++; sum++;
  }
  while (sum > n) {
    let best = -1;
    for (let i = 0; i < sizes.length; i++) if (parts[i]! > 1 && (best < 0 || sizes[i]! / parts[i]! < sizes[best]! / parts[best]!)) best = i;
    if (best < 0) break;
    parts[best]!--; sum--;
  }
  return parts;
}

/** Divide grupos em `k` blocos seguidos com um número de lições o mais igual possível. */
function chunk(groups: string[][], k: number): string[][] {
  const total = groups.reduce((a, g) => a + g.length, 0);
  const out: string[][] = [];
  let cur: string[] = [];
  let done = 0;
  groups.forEach((g, i) => {
    cur.push(...g);
    done += g.length;
    const target = (total * (out.length + 1)) / k;
    const left = groups.length - i - 1;
    const needed = k - out.length - 1;
    if (out.length < k - 1 && (done >= target || left === needed)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
}

/**
 * Reorganiza o índice compilado (unidades temáticas) nas 8 secções e 1005 unidades.
 * `titles` dá o título de cada lição (para descrever cada unidade pelas lições que tem).
 */
export function layoutCourse(index: CourseIndex, titles: ReadonlyMap<string, string>): CourseIndex {
  const themeById = new Map(index.sections.flatMap((s) => s.units).map((u) => [u.id, u] as const));
  const sections: IndexedSection[] = SECTION_PLAN.map((plan, si) => {
    const themes = plan.from.map((id) => themeById.get(id)).filter((u): u is IndexedUnit => !!u && u.lessonIds.length > 0);
    const groups = themes.map((t) => groupsOf(t.lessonIds));
    const parts = apportion(themes.map((t) => t.lessonIds.length), plan.units, groups.map((g) => g.length));
    const pad = plan.units >= 100 ? 3 : 2;
    const units: IndexedUnit[] = [];
    themes.forEach((t, ti) => {
      const k = parts[ti]!;
      chunk(groups[ti]!, k).forEach((ids, ci) => {
        const order = units.length + 1;
        const written = ids.filter((id) => !/-l5\d\d$/.test(id)).map((id) => titles.get(id)).filter((x): x is string => !!x);
        units.push({
          id: `${plan.id}-u${String(order).padStart(pad, '0')}`,
          sectionId: plan.id,
          order,
          title: k > 1 ? `${t.title} (${ci + 1}/${k})` : t.title,
          description: written.slice(0, 3).join(' · ') || t.description,
          cefr: plan.cefr,
          topics: t.topics.slice(0, 1),
          prerequisites: [],
          plannedLessons: ids.length,
          lessonIds: ids,
        });
      });
    });
    return {
      id: plan.id, order: si + 1, title: plan.title, goal: plan.goal, cefr: plan.cefr,
      plannedLessons: units.reduce((a, u) => a + u.lessonIds.length, 0), units,
    };
  });
  return { ...index, sections, vocabSections: index.sections.map((s) => s.id) };
}
