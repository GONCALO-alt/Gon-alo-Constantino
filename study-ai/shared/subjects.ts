// Catálogo de disciplinas e anos escolares (sistema de ensino português).

export interface Subject {
  id: string;
  name: string;
  /** Nome curto para cartões e horários. */
  short: string;
  /** Chave do ícone (ver src/components/SubjectIcon.tsx). */
  icon: string;
  color: string;
  /** Disciplinas «nucleares» recebem mais tempo de estudo no plano. */
  core: boolean;
}

const C = {
  yellow: '#FFD400',
  orange: '#FF9F1C',
  coral: '#FF6B6B',
  pink: '#F472B6',
  violet: '#A78BFA',
  blue: '#60A5FA',
  cyan: '#22D3EE',
  teal: '#2DD4BF',
  green: '#4ADE80',
  lime: '#A3E635',
};

const list: Subject[] = [
  { id: 'portugues', name: 'Português', short: 'Português', icon: 'book', color: C.coral, core: true },
  { id: 'matematica', name: 'Matemática', short: 'Matemática', icon: 'sigma', color: C.yellow, core: true },
  { id: 'matematica-a', name: 'Matemática A', short: 'Matemática A', icon: 'sigma', color: C.yellow, core: true },
  { id: 'macs', name: 'MACS', short: 'MACS', icon: 'chart', color: C.yellow, core: true },
  { id: 'ingles', name: 'Inglês', short: 'Inglês', icon: 'languages', color: C.blue, core: true },
  { id: 'frances', name: 'Francês', short: 'Francês', icon: 'languages', color: C.violet, core: true },
  { id: 'espanhol', name: 'Espanhol', short: 'Espanhol', icon: 'languages', color: C.orange, core: true },
  { id: 'alemao', name: 'Alemão', short: 'Alemão', icon: 'languages', color: C.lime, core: true },
  { id: 'estudo-meio', name: 'Estudo do Meio', short: 'Estudo do Meio', icon: 'leaf', color: C.green, core: true },
  { id: 'hgp', name: 'História e Geografia de Portugal', short: 'HGP', icon: 'landmark', color: C.orange, core: true },
  { id: 'historia', name: 'História', short: 'História', icon: 'landmark', color: C.orange, core: true },
  { id: 'historia-a', name: 'História A', short: 'História A', icon: 'landmark', color: C.orange, core: true },
  { id: 'geografia', name: 'Geografia', short: 'Geografia', icon: 'globe', color: C.teal, core: true },
  { id: 'geografia-a', name: 'Geografia A', short: 'Geografia A', icon: 'globe', color: C.teal, core: true },
  { id: 'ciencias', name: 'Ciências Naturais', short: 'Ciências', icon: 'leaf', color: C.green, core: true },
  { id: 'fisico-quimica', name: 'Físico-Química', short: 'Físico-Química', icon: 'flask', color: C.cyan, core: true },
  { id: 'fisica-quimica-a', name: 'Física e Química A', short: 'FQ A', icon: 'atom', color: C.cyan, core: true },
  { id: 'fisica', name: 'Física', short: 'Física', icon: 'atom', color: C.cyan, core: true },
  { id: 'quimica', name: 'Química', short: 'Química', icon: 'flask', color: C.teal, core: true },
  { id: 'biologia-geologia', name: 'Biologia e Geologia', short: 'BG', icon: 'microscope', color: C.green, core: true },
  { id: 'biologia', name: 'Biologia', short: 'Biologia', icon: 'dna', color: C.lime, core: true },
  { id: 'filosofia', name: 'Filosofia', short: 'Filosofia', icon: 'brain', color: C.violet, core: true },
  { id: 'economia', name: 'Economia', short: 'Economia', icon: 'trending', color: C.lime, core: true },
  { id: 'geometria-descritiva', name: 'Geometria Descritiva', short: 'GD', icon: 'shapes', color: C.pink, core: true },
  { id: 'psicologia', name: 'Psicologia', short: 'Psicologia', icon: 'heart', color: C.pink, core: true },
  { id: 'sociologia', name: 'Sociologia', short: 'Sociologia', icon: 'users', color: C.blue, core: true },
  { id: 'programacao', name: 'Programação', short: 'Programação', icon: 'code', color: C.blue, core: true },
  { id: 'tic', name: 'TIC', short: 'TIC', icon: 'laptop', color: C.blue, core: false },
  { id: 'educacao-visual', name: 'Educação Visual', short: 'EV', icon: 'palette', color: C.pink, core: false },
  { id: 'educacao-tecnologica', name: 'Educação Tecnológica', short: 'ET', icon: 'wrench', color: C.orange, core: false },
  { id: 'educacao-musical', name: 'Educação Musical', short: 'Música', icon: 'music', color: C.violet, core: false },
  { id: 'expressoes', name: 'Expressões Artísticas', short: 'Expressões', icon: 'palette', color: C.pink, core: false },
  { id: 'educacao-fisica', name: 'Educação Física', short: 'EF', icon: 'dumbbell', color: C.green, core: false },
  { id: 'cidadania', name: 'Cidadania e Desenvolvimento', short: 'Cidadania', icon: 'users', color: C.teal, core: false },
];

export const SUBJECTS: Record<string, Subject> = Object.fromEntries(list.map((s) => [s.id, s]));
export const SUBJECT_LIST = list;

export const SCHOOL_YEARS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'superior',
] as const;
export type SchoolYear = (typeof SCHOOL_YEARS)[number];

export function yearLabel(year: string | undefined | null): string {
  if (!year) return '—';
  if (year === 'superior') return 'Ensino superior';
  return `${year}.º ano`;
}

export function cycleLabel(year: string): string {
  if (year === 'superior') return 'Ensino superior';
  const n = Number(year);
  if (n <= 4) return '1.º ciclo';
  if (n <= 6) return '2.º ciclo';
  if (n <= 9) return '3.º ciclo';
  return 'Ensino secundário';
}

/** Disciplinas habituais em cada ano (pré-selecionadas no questionário). */
export function defaultSubjectsForYear(year: string): string[] {
  const n = Number(year);
  if (year === 'superior') return [];
  if (n <= 2) return ['portugues', 'matematica', 'estudo-meio', 'expressoes', 'educacao-fisica'];
  if (n <= 4) return ['portugues', 'matematica', 'estudo-meio', 'ingles', 'expressoes', 'educacao-fisica'];
  if (n <= 6)
    return [
      'portugues', 'ingles', 'hgp', 'matematica', 'ciencias', 'educacao-visual',
      'educacao-tecnologica', 'educacao-musical', 'educacao-fisica', 'cidadania',
    ];
  if (n <= 9)
    return [
      'portugues', 'ingles', 'frances', 'historia', 'geografia', 'matematica', 'ciencias',
      'fisico-quimica', 'educacao-visual', 'tic', 'educacao-fisica', 'cidadania',
    ];
  if (n <= 11)
    return ['portugues', 'ingles', 'filosofia', 'matematica-a', 'fisica-quimica-a', 'biologia-geologia', 'educacao-fisica'];
  return ['portugues', 'matematica-a', 'biologia', 'quimica', 'educacao-fisica'];
}

/** Disciplinas sugeridas para o ano (as pré-selecionadas primeiro). */
export function suggestedSubjectsForYear(year: string): string[] {
  const base = defaultSubjectsForYear(year);
  const n = Number(year);
  let extra: string[] = [];
  if (year === 'superior')
    extra = ['matematica', 'economia', 'programacao', 'fisica', 'quimica', 'biologia', 'psicologia', 'sociologia', 'filosofia', 'ingles', 'historia'];
  else if (n <= 4) extra = ['ingles'];
  else if (n <= 6) extra = ['frances', 'espanhol'];
  else if (n <= 9) extra = ['espanhol', 'alemao'];
  else
    extra = [
      'economia', 'historia-a', 'geografia-a', 'macs', 'geometria-descritiva', 'psicologia',
      'sociologia', 'fisica', 'quimica', 'biologia', 'espanhol', 'frances', 'alemao', 'filosofia', 'ingles',
    ];
  return [...new Set([...base, ...extra])];
}

export type CustomSubjects = Record<string, string>;

export function customSubjectId(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `custom-${slug || 'disciplina'}`;
}

const CUSTOM_COLORS = [C.yellow, C.blue, C.pink, C.teal, C.violet, C.orange, C.lime, C.cyan];

export function getSubject(id: string, custom?: CustomSubjects | null): Subject {
  const known = SUBJECTS[id];
  if (known) return known;
  const name = custom?.[id] ?? id.replace(/^custom-/, '').replace(/-/g, ' ');
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return {
    id,
    name,
    short: name.length > 16 ? `${name.slice(0, 15)}…` : name,
    icon: 'book',
    color: CUSTOM_COLORS[h % CUSTOM_COLORS.length] ?? C.yellow,
    core: true,
  };
}
