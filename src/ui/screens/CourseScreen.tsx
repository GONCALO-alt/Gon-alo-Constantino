import { useEffect, useMemo, useState } from 'react';
import type { IndexedUnit, PublishedLesson } from '../../domain/schemas.ts';
import { contentRepo } from '../../data/contentRepo.ts';
import { computeLessonStates, nextLesson, type LessonState, type UnitState } from '../../engine/progression.ts';
import { useAppData } from '../AppState.tsx';
import { Icon, ProgressBar } from '../components/common.tsx';
import { href } from '../router.ts';

const UNIT_STATE_LABEL: Record<UnitState, string> = {
  completed: 'Concluída',
  'in-progress': 'Em curso',
  available: 'Disponível',
  locked: 'Bloqueada',
  'coming-soon': 'Em preparação',
};

export function CourseScreen({ sectionId }: { sectionId?: string }) {
  const { index, completed, unitStates } = useAppData();
  if (!sectionId) {
    return (
      <div className="page">
        <h1>Mapa do curso</h1>
        <p className="muted">Sete secções, do nível A1 ao B2. Os níveis são indicativos e não constituem uma certificação.</p>
        <ol className="section-list">
          {index.sections.map((s) => {
            const published = s.units.reduce((n, u) => n + u.lessonIds.length, 0);
            const done = s.units.reduce((n, u) => n + u.lessonIds.filter((id) => completed.has(id)).length, 0);
            const anyOpen = s.units.some((u) => ['available', 'in-progress', 'completed'].includes(unitStates.get(u.id) ?? ''));
            return (
              <li key={s.id}>
                <a className={`section-card ${anyOpen ? '' : 'dim'}`} href={href.course(s.id)}>
                  <span className="section-num" aria-hidden="true">{s.order}</span>
                  <span className="section-body">
                    <span className="section-title">{s.title} <span className="badge">{s.cefr}</span></span>
                    <span className="muted small">{s.goal}</span>
                    <ProgressBar value={published ? done / published : 0} label={`Progresso: ${s.title}`} />
                    <span className="muted small">{done}/{published} lições disponíveis concluídas · {s.units.length} unidades · {s.plannedLessons} lições previstas</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
  return <SectionView sectionId={sectionId} />;
}

function SectionView({ sectionId }: { sectionId: string }) {
  const { index, completed, unitStates, settings } = useAppData();
  const section = index.sections.find((s) => s.id === sectionId);
  const next = useMemo(() => nextLesson(index, completed, settings.freeNavigation), [index, completed, settings.freeNavigation]);
  const [open, setOpen] = useState<Set<string>>(() => {
    const initial = section?.units.find((u) => u.id === next?.unitId) ?? section?.units.find((u) => u.lessonIds.length > 0);
    return new Set(initial ? [initial.id] : []);
  });

  if (!section) return <div className="page"><p className="notice">Secção não encontrada.</p><a href={href.course()}>Voltar</a></div>;
  const idx = index.sections.indexOf(section);
  const prev = index.sections[idx - 1];
  const nextSec = index.sections[idx + 1];

  return (
    <div className="page">
      <a className="back-link" href={href.course()}><Icon name="back" size={18} /> Todas as secções</a>
      <p className="eyebrow">Secção {section.order} · {section.cefr}</p>
      <h1>{section.title}</h1>
      <p className="lead">{section.goal}</p>
      <ol className="unit-list">
        {section.units.map((u) => {
          const st = unitStates.get(u.id) ?? 'locked';
          const isOpen = open.has(u.id);
          const done = u.lessonIds.filter((id) => completed.has(id)).length;
          return (
            <li key={u.id} className={`unit unit-${st}`}>
              <button type="button" className="unit-head" aria-expanded={isOpen} aria-controls={`unit-${u.id}`}
                onClick={() => setOpen((o) => { const n = new Set(o); if (n.has(u.id)) n.delete(u.id); else n.add(u.id); return n; })}>
                <span className="unit-num" aria-hidden="true">{st === 'completed' ? <Icon name="check" size={18} /> : st === 'locked' ? <Icon name="lock" size={16} /> : u.order}</span>
                <span className="unit-body">
                  <span className="unit-title">Unidade {u.order}: {u.title}</span>
                  <span className="muted small">{UNIT_STATE_LABEL[st]}{u.lessonIds.length ? ` · ${done}/${u.lessonIds.length} lições` : ` · ${u.plannedLessons} lições previstas`}</span>
                </span>
              </button>
              {isOpen && (
                <div id={`unit-${u.id}`} className="unit-panel">
                  <p className="muted small">{u.description}</p>
                  {st === 'locked' && <p className="small"><Icon name="lock" size={14} /> Conclua {u.prerequisites.length ? 'as unidades indicadas' : 'a unidade anterior'} para desbloquear. Pode rever sempre as lições concluídas.</p>}
                  {u.lessonIds.length > 0 ? <UnitLessons unit={u} state={st} currentId={next?.lessonId} /> : <p className="small">As lições desta unidade ainda estão a ser preparadas e revistas.</p>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <nav className="row section-nav" aria-label="Outras secções">
        {prev && <a className="btn btn-secondary" href={href.course(prev.id)}><Icon name="back" size={18} /> {prev.title}</a>}
        {nextSec && <a className="btn btn-secondary" href={href.course(nextSec.id)}>{nextSec.title} <Icon name="arrow" size={18} /></a>}
      </nav>
    </div>
  );
}

function UnitLessons({ unit, state, currentId }: { unit: IndexedUnit; state: UnitState; currentId?: string }) {
  const { completed, settings } = useAppData();
  const [lessons, setLessons] = useState<PublishedLesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    contentRepo.loadUnit(unit.id).then((b) => setLessons(b.lessons), (e: Error) => setError(e.message));
  }, [unit.id]);
  const states = useMemo(() => computeLessonStates(unit, state, completed, settings.freeNavigation), [unit, state, completed, settings.freeNavigation]);
  if (error) return <p className="notice" role="alert">{error}</p>;
  if (!lessons) return <p className="loading small" aria-busy="true">A carregar lições…</p>;
  const byId = new Map(lessons.map((l) => [l.id, l]));
  return (
    <ol className="path" aria-label={`Lições da unidade ${unit.title}`}>
      {unit.lessonIds.map((id, i) => {
        const l = byId.get(id);
        const ls: LessonState = states.get(id) ?? 'locked';
        const label = `${l?.title ?? id} — ${ls === 'completed' ? 'concluída' : ls === 'available' ? 'disponível' : 'bloqueada'}`;
        const node = (
          <>
            <span className={`path-node node-${ls} ${id === currentId ? 'current' : ''}`} aria-hidden="true">
              {ls === 'completed' ? <Icon name="check" size={20} /> : ls === 'locked' ? <Icon name="lock" size={18} /> : <Icon name="play" size={18} />}
            </span>
            <span className="path-text">
              <span className="path-title">{l?.title ?? id}</span>
              <span className="muted small">{l ? `~${l.estimatedMinutes} min · ${l.exercises.length} exercícios` : ''}</span>
            </span>
          </>
        );
        return (
          <li key={id} className={`path-item offset-${i % 4}`}>
            {ls === 'locked' ? <span className="path-link locked" aria-label={label}>{node}</span> : <a className="path-link" href={href.lesson(id)} aria-label={label}>{node}</a>}
          </li>
        );
      })}
    </ol>
  );
}

