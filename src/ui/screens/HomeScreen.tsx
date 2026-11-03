/**
 * Ecrã inicial: o caminho da unidade atual, com uma lição por círculo.
 * Em cima, as estatísticas do dia e a faixa da unidade; a lição atual tem «Começar».
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { IndexedUnit, PublishedLesson } from '../../domain/schemas.ts';
import { contentRepo } from '../../data/contentRepo.ts';
import { computeLessonStates, currentStreak, localDate, nextLesson, orderedUnits, type LessonState, type UnitState } from '../../engine/progression.ts';
import { useAppData } from '../AppState.tsx';
import { Card, Icon } from '../components/common.tsx';
import { Mascot } from '../components/Mascot.tsx';
import { SeasonDeco, SeasonFx, useSeason } from '../components/Season.tsx';
import { SEASON_INFO } from '../../engine/season.ts';
import { href } from '../router.ts';

function greeting(d = new Date()): string {
  const h = d.getHours();
  return h < 12 ? 'Bom dia' : h < 20 ? 'Boa tarde' : 'Boa noite';
}

/** Tipo de lição, para o ícone do círculo. */
type LessonKind = 'lesson' | 'practice' | 'review' | 'challenge' | 'story';
export function kindOf(l: PublishedLesson | undefined): LessonKind {
  if (!l) return 'lesson';
  if (l.title.startsWith('Prática:')) return 'practice';
  if (l.title.startsWith('Desafio')) return 'challenge';
  if (/^(Revisão|Prática mista)/.test(l.title)) return 'review';
  // História: um texto para ler (com perguntas) ou «história/conto/relato» no título.
  if (/hist[óo]ria|conto|relato/i.test(l.title) || l.exercises.some((e) => e.type === 'comprehension' && e.kind === 'text')) return 'story';
  return 'lesson';
}
const KIND_ICON: Record<LessonKind, string> = { lesson: 'star', practice: 'dumbbell', review: 'review', challenge: 'trophy', story: 'book' };
const KIND_LABEL: Record<LessonKind, string> = { lesson: 'Lição', practice: 'Prática', review: 'Revisão', challenge: 'Desafio', story: 'História' };

/** Ziguezague do caminho (deslocamento horizontal de cada círculo, em passos). */
const WAVE = [0, 1, 2, 1, 0, -1, -2, -1];

export function HomeScreen() {
  const app = useAppData();
  const { index, profile, settings, completed, unitStates } = app;
  const today = localDate();
  const streak = currentStreak(profile.studyDays, today);
  const studiedToday = profile.studyDays.includes(today);
  const next = useMemo(() => nextLesson(index, completed, settings.freeNavigation), [index, completed, settings.freeNavigation]);
  const units = useMemo(() => orderedUnits(index).filter((u) => u.lessonIds.length > 0), [index]);
  // Unidade a mostrar: a da próxima lição; se o curso publicado estiver concluído, a última.
  const unit = units.find((u) => u.id === next?.unitId) ?? units[units.length - 1];
  const section = index.sections.find((s) => s.units.some((u) => u.id === unit?.id)) ?? index.sections[0]!;
  const nextUnit = unit ? units[units.indexOf(unit) + 1] : undefined;
  const season = useSeason();

  return (
    <div className="page home">
      <h1 className="visually-hidden">{greeting()}{profile.displayName ? `, ${profile.displayName}` : ''}!</h1>

      {season && <SeasonFx season={season} />}
      {season && (
        <p className="season-chip">
          <span aria-hidden="true">{SEASON_INFO[season].decorations[0]}</span>
          <strong lang="nl">{SEASON_INFO[season].nl}</strong> <span className="muted">{SEASON_INFO[season].pt}</span>
        </p>
      )}
      <div className="home-stats" role="list" aria-label="O seu dia">
        <a role="listitem" className="home-stat" href={href.course()} aria-label={`Neerlandês, nível ${section.cefr}`}>
          <DutchFlag /> <span>{section.cefr}</span>
        </a>
        <span role="listitem" className={`home-stat stat-streak ${studiedToday ? 'on' : ''}`} aria-label={`Sequência: ${streak} ${streak === 1 ? 'dia' : 'dias'}`}>
          <Icon name="sun" size={24} /> <span>{streak}</span>
        </span>
        <span role="listitem" className="home-stat stat-xp" aria-label={`${profile.totalXp} XP no total`}>
          <Icon name="star" size={24} /> <span>{profile.totalXp}</span>
        </span>
        <span role="listitem" className={`home-stat stat-goal ${app.todayXp >= settings.dailyGoalXp ? 'on' : ''}`} aria-label={`Objetivo diário: ${app.todayXp} de ${settings.dailyGoalXp} XP`}>
          <Icon name="target" size={24} /> <span>{app.todayXp}/{settings.dailyGoalXp}</span>
        </span>
      </div>

      {unit ? (
        <>
          <UnitBanner unit={unit} sectionOrder={section.order} sectionId={section.id} />
          <UnitTrail unit={unit} currentId={next?.lessonId} state={unitStates.get(unit.id) ?? 'available'} />
          {!next && <p className="notice">Concluiu todas as lições publicadas! A revisão mantém o vocabulário fresco.</p>}
          {nextUnit && (
            <a className="next-unit" href={href.course(index.sections.find((s) => s.units.some((u) => u.id === nextUnit.id))?.id)}>
              <span className="next-unit-lock" aria-hidden="true"><Icon name="lock" size={20} /></span>
              <span>
                <span className="small muted block">A seguir · Unidade {nextUnit.order}</span>
                <strong>{nextUnit.title}</strong>
              </span>
            </a>
          )}
        </>
      ) : (
        <p className="notice">Ainda não há lições publicadas.</p>
      )}

      <Card className="home-review">
        <h2><Icon name="review" size={20} /> Revisão</h2>
        {app.totalReviews === 0 ? (
          <p className="muted">As palavras que aprender aparecem aqui para revisão espaçada.</p>
        ) : app.dueReviews > 0 ? (
          <>
            <p><strong>{app.dueReviews}</strong> {app.dueReviews === 1 ? 'palavra pronta' : 'palavras prontas'} para rever.</p>
            <a className="btn btn-secondary" href={href.reviewSession('vocab')}>Rever agora</a>
          </>
        ) : (
          <p className="muted">Nada para rever agora. {app.totalReviews} palavras no seu calendário de revisão.</p>
        )}
        <a className="link small" href={href.course()}>Ver o curso todo</a>
      </Card>
    </div>
  );
}

/** Bandeira dos Países Baixos (desenho simples). */
function DutchFlag() {
  return (
    <svg width="30" height="22" viewBox="0 0 30 22" aria-hidden="true" className="flag">
      <rect width="30" height="22" rx="4" fill="#ffffff" />
      <path d="M0 4a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v3.33H0Z" fill="#ae1c28" />
      <path d="M0 14.67h30V18a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4Z" fill="#21468b" />
    </svg>
  );
}

function UnitBanner({ unit, sectionOrder, sectionId }: { unit: IndexedUnit; sectionOrder: number; sectionId: string }) {
  return (
    <div className={`unit-banner banner-s${sectionOrder}`}>
      <div className="unit-banner-text">
        <p className="unit-banner-eyebrow">Secção {sectionOrder}, unidade {unit.order}</p>
        <p className="unit-banner-title">{unit.title}</p>
      </div>
      <a className="unit-banner-guide" href={href.course(sectionId)} aria-label={`Ver todas as lições da unidade ${unit.title}`}>
        <Icon name="book" size={26} />
      </a>
    </div>
  );
}

function UnitTrail({ unit, currentId, state }: { unit: IndexedUnit; currentId?: string; state: UnitState }) {
  const { completed, settings } = useAppData();
  const season = useSeason();
  const [lessons, setLessons] = useState<Map<string, PublishedLesson>>(new Map());
  const [openId, setOpenId] = useState<string | null>(null);
  const currentRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    let alive = true;
    contentRepo.loadUnit(unit.id).then((b) => { if (alive) setLessons(new Map(b.lessons.map((l) => [l.id, l]))); }, () => {});
    return () => { alive = false; };
  }, [unit.id]);
  // Mostra a lição atual (a meio do ecrã) quando o caminho é comprido.
  useEffect(() => {
    if (lessons.size && currentRef.current && unit.lessonIds.indexOf(currentId ?? '') > 3) {
      currentRef.current.scrollIntoView?.({ block: 'center' });
    }
  }, [lessons.size, currentId, unit.lessonIds]);
  const states = useMemo(() => computeLessonStates(unit, state, completed, settings.freeNavigation), [unit, state, completed, settings.freeNavigation]);
  const allDone = unit.lessonIds.every((id) => completed.has(id));
  // A mascote fica junto à lição atual, do lado contrário ao ziguezague.
  const currentPos = Math.max(0, unit.lessonIds.indexOf(currentId ?? ''));
  const mascotPos = Math.min(unit.lessonIds.length - 1, currentPos + 2);

  return (
    <ol className="trail" aria-label={`Lições da unidade ${unit.title}`}>
      {unit.lessonIds.map((id, i) => {
        const l = lessons.get(id);
        const st: LessonState = states.get(id) ?? 'locked';
        const kind = kindOf(l);
        const isCurrent = id === currentId;
        const title = l?.title ?? `Lição ${i + 1}`;
        const x = WAVE[i % WAVE.length]!;
        const open = openId === id;
        const stateText = st === 'completed' ? 'concluída' : st === 'available' ? 'disponível' : 'bloqueada';
        return (
          <li key={id} ref={isCurrent ? currentRef : undefined} className="trail-item" style={{ '--x': x, '--i': Math.min(i, 12) } as CSSProperties}>
            {isCurrent && (
              <a className="trail-start" href={href.lesson(id)} aria-label={`Começar: ${title}`}>Começar</a>
            )}
            <button type="button" className={`trail-node node-${st} kind-${kind} ${isCurrent ? 'current' : ''}`}
              aria-label={`${KIND_LABEL[kind]}: ${title} — ${stateText}`} aria-expanded={open}
              onClick={() => setOpenId(open ? null : id)}>
              <Icon name={st === 'completed' ? 'check' : st === 'locked' && kind !== 'story' ? 'lock' : KIND_ICON[kind]} size={st === 'locked' && kind !== 'story' ? 26 : 32} />
            </button>
            {open && (
              <div className={`trail-pop pop-${st}`} role="dialog" aria-label={title}>
                <p className="trail-pop-kind">{KIND_LABEL[kind]} {i + 1} de {unit.lessonIds.length}</p>
                <p className="trail-pop-title">{title}</p>
                {st === 'locked' ? (
                  <p className="small">Conclua as lições anteriores para desbloquear esta.</p>
                ) : (
                  <a className="btn btn-go btn-wide" href={href.lesson(id)}>{st === 'completed' ? 'Rever' : kind === 'practice' ? 'Praticar' : kind === 'story' ? 'Ler a história' : 'Começar'}</a>
                )}
              </div>
            )}
            {i === mascotPos && (
              <span className={`trail-mascot ${x > 0 ? 'left' : 'right'}`} aria-hidden="true"><Mascot size={84} mood={allDone ? 'cheer' : 'happy'} /></span>
            )}
            {season && i !== mascotPos && i % 3 === 1 && (
              <span className={`trail-deco ${x > 0 ? 'left' : 'right'}`} aria-hidden="true"><SeasonDeco season={season} index={i} /></span>
            )}
          </li>
        );
      })}
      <li className="trail-item trail-end" style={{ '--x': 0, '--i': Math.min(unit.lessonIds.length, 12) } as CSSProperties}>
        <span className={`trail-chest ${allDone ? 'open' : ''}`} role="img" aria-label={allDone ? 'Unidade concluída' : 'Fim da unidade'}>
          <Icon name="chest" size={38} />
        </span>
      </li>
    </ol>
  );
}
