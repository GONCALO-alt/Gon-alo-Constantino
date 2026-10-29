import { useEffect, useMemo, useState } from 'react';
import { contentRepo } from '../../data/contentRepo.ts';
import { currentStreak, localDate, nextLesson, studyDaysInLastWeek } from '../../engine/progression.ts';
import { useAppData } from '../AppState.tsx';
import { Card, Icon, ProgressBar } from '../components/common.tsx';
import { href } from '../router.ts';

function greeting(d = new Date()): string {
  const h = d.getHours();
  return h < 12 ? 'Bom dia' : h < 20 ? 'Boa tarde' : 'Boa noite';
}

export function HomeScreen() {
  const app = useAppData();
  const { index, profile, settings, completed } = app;
  const today = localDate();
  const streak = currentStreak(profile.studyDays, today);
  const week = studyDaysInLastWeek(profile.studyDays, today);
  const next = useMemo(() => nextLesson(index, completed, settings.freeNavigation), [index, completed, settings.freeNavigation]);
  const [nextTitle, setNextTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!next) return;
    contentRepo.loadLesson(next.lessonId).then((l) => setNextTitle(l.title), () => setNextTitle(null));
  }, [next]);

  const section = index.sections.find((s) => s.units.some((u) => u.id === (next?.unitId ?? ''))) ?? index.sections[0]!;
  const sectionPublished = section.units.reduce((n, u) => n + u.lessonIds.length, 0);
  const sectionDone = section.units.reduce((n, u) => n + u.lessonIds.filter((id) => completed.has(id)).length, 0);
  const unit = section.units.find((u) => u.id === next?.unitId);
  const goalPct = Math.min(1, app.todayXp / settings.dailyGoalXp);
  const isContinuing = !!profile.lastLessonId && completed.size > 0;

  return (
    <div className="page home">
      <header className="home-head">
        <h1>{greeting()}{profile.displayName ? `, ${profile.displayName}` : ''}!</h1>
        <p className="muted">{completed.size === 0 ? 'Bem-vindo! Vamos começar pelo início.' : 'Pronto para mais um pouco de neerlandês?'}</p>
      </header>

      <div className="stat-cards">
        <Card className="stat-card">
          <p className="stat-label"><Icon name="target" size={18} /> Objetivo diário</p>
          <p className="stat-value">{app.todayXp} / {settings.dailyGoalXp} XP</p>
          <ProgressBar value={goalPct} label="Objetivo diário" tone={goalPct >= 1 ? 'ok' : 'accent'} />
          {goalPct >= 1 && <p className="small ok-text">Objetivo de hoje cumprido!</p>}
        </Card>
        <Card className="stat-card">
          <p className="stat-label"><Icon name="sun" size={18} /> Sequência</p>
          <p className="stat-value">{streak} {streak === 1 ? 'dia' : 'dias'}</p>
          <p className="small muted">{week} de 7 dias com estudo esta semana</p>
        </Card>
        <Card className="stat-card">
          <p className="stat-label"><Icon name="star" size={18} /> Experiência</p>
          <p className="stat-value">{profile.totalXp} XP</p>
          <p className="small muted">{completed.size} {completed.size === 1 ? 'lição concluída' : 'lições concluídas'}</p>
        </Card>
      </div>

      {next ? (
        <Card className="cta-card">
          <p className="eyebrow">{isContinuing ? 'Continuar' : 'Comece aqui'} · {section.title}</p>
          <h2>{nextTitle ?? 'A carregar…'}</h2>
          {unit && <p className="muted">Unidade {unit.order}: {unit.title}</p>}
          <a className="btn btn-primary btn-wide" href={href.lesson(next.lessonId)}>
            {isContinuing ? 'Continuar' : 'Começar a primeira lição'} <Icon name="arrow" size={18} />
          </a>
        </Card>
      ) : (
        <Card className="cta-card">
          <h2>Concluiu todas as lições publicadas!</h2>
          <p className="muted">Novas lições estão em preparação. Entretanto, a revisão mantém o vocabulário fresco.</p>
        </Card>
      )}

      <div className="two-col">
        <Card>
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
        </Card>
        <Card>
          <h2><Icon name="map" size={20} /> {section.title}</h2>
          <p className="muted small">Secção {section.order} · {section.cefr}</p>
          <ProgressBar value={sectionPublished ? sectionDone / sectionPublished : 0} label={`Progresso na secção ${section.title}`} />
          <p className="small muted">{sectionDone} de {sectionPublished} lições disponíveis ({section.plannedLessons} previstas)</p>
          <a className="link" href={href.course(section.id)}>Ver mapa da secção</a>
        </Card>
      </div>
    </div>
  );
}
