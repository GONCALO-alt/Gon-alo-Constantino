import {
  Atom, Book, BookOpen, Brain, ChartColumn, Code, Dna, Dumbbell, FlaskConical, Globe, Heart, Landmark, Languages, Laptop,
  Leaf, Microscope, Music, Palette, Shapes, Sigma, TrendingUp, Users, Wrench, NotebookPen, type LucideIcon,
} from 'lucide-react';
import { getSubject, type CustomSubjects } from '../../shared/subjects';

const ICONS: Record<string, LucideIcon> = {
  book: BookOpen, sigma: Sigma, chart: ChartColumn, languages: Languages, leaf: Leaf, landmark: Landmark, globe: Globe,
  flask: FlaskConical, atom: Atom, microscope: Microscope, dna: Dna, brain: Brain, trending: TrendingUp, shapes: Shapes,
  heart: Heart, users: Users, code: Code, laptop: Laptop, palette: Palette, wrench: Wrench, music: Music, dumbbell: Dumbbell,
};

export function SubjectIcon({ id, custom, size }: { id: string | null | undefined; custom?: CustomSubjects; size?: 'sm' | 'lg' }) {
  if (!id) {
    return (
      <span className={`subject-ic ${size ?? ''}`} style={{ background: 'rgba(255,212,0,0.12)', color: 'var(--yellow)' }}>
        <NotebookPen />
      </span>
    );
  }
  const s = getSubject(id, custom);
  const Icon = ICONS[s.icon] ?? Book;
  return (
    <span className={`subject-ic ${size ?? ''}`} style={{ background: `${s.color}1f`, color: s.color }}>
      <Icon />
    </span>
  );
}

export function subjectColor(id: string | null | undefined, custom?: CustomSubjects): string {
  return id ? getSubject(id, custom).color : '#FFD400';
}
