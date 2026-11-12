import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronRight, Trophy } from 'lucide-react';
import { earnedKeys, level, medals, TIER_LABEL, weeklyChallenges, type AchievementStats, type MedalView } from '../achievements';
import { useMe, useQuery } from '../state';
import { today, weekStart } from '../../shared/dates';
import { Button, Modal, Progress } from './ui';

type Stats = AchievementStats & { today: string };

/** Medalhas, nível e desafios do estudante (a partir de GET /stats). */
export function useAchievements() {
  const me = useMe();
  const date = today();
  const stats = useQuery<Stats>(`/stats?date=${date}`);
  const q = me.profile.questionnaire;
  return useMemo(() => {
    const s = stats.data;
    if (!s?.achievements) return null;
    const list = medals(s);
    return {
      medals: list,
      level: level(s, list),
      challenges: weeklyChallenges(s, weekStart(date), q ? q.dailyMinutes * q.studyDays.length : null),
      earned: list.filter((m) => m.tier).length,
    };
  }, [stats.data, date, q]);
}

const unit = (m: MedalView) => (m.id === 'tempo' || m.id === 'foco' ? ' min' : '');

function MedalCard({ m }: { m: MedalView }) {
  return (
    <div className={`medal ${m.tier ?? 'locked'}`}>
      <span className="medal-badge" aria-hidden>{m.emoji}</span>
      <div className="medal-title">{m.title}</div>
      <div className="medal-tier">{m.tier ? `Medalha de ${TIER_LABEL[m.tier].toLowerCase()}` : 'Por ganhar'}</div>
      {m.next ? (
        <>
          <Progress value={m.value} max={m.next.goal} thin />
          <div className="tiny faint">
            {m.next.text} · {Math.min(m.value, m.next.goal)}/{m.next.goal}
            {unit(m)}
          </div>
        </>
      ) : (
        <div className="tiny yellow">Completa — {m.text.toLowerCase()} 🏆</div>
      )}
    </div>
  );
}

/** Secção «Medalhas e pontos» da página Progresso. */
export function AchievementsPanel() {
  const a = useAchievements();
  if (!a) return null;
  const { level: l, challenges } = a;
  const toNext = l.to === null ? 100 : ((l.xp - l.from) / (l.to - l.from)) * 100;
  const doneChallenges = challenges.filter((c) => c.done).length;
  return (
    <section className="card" id="medalhas" style={{ marginTop: 18 }}>
      <div className="card-head wrap">
        <span className="card-title"><Trophy /> Medalhas e pontos</span>
        <span className="tiny faint">{a.earned} de {a.medals.length} medalhas</span>
      </div>
      <div className="level-row">
        <div className="level-badge" aria-hidden>{l.level}</div>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="row between">
            <b>Nível {l.level} · {l.name}</b>
            <span className="small yellow">{l.xp} XP</span>
          </div>
          <Progress value={toNext} max={100} thin />
          <div className="tiny faint" style={{ marginTop: 4 }}>
            {l.to === null ? 'Chegaste ao nível máximo!' : `${l.to - l.xp === 1 ? 'Falta 1 XP' : `Faltam ${l.to - l.xp} XP`} para o nível ${l.level + 1}. Ganhas pontos a estudar, a fazer testes, a rever flashcards e com as medalhas.`}
          </div>
        </div>
      </div>

      <h3 className="section-label" style={{ marginTop: 22 }}>Desafios da semana · {doneChallenges}/3</h3>
      <div className="stack" style={{ gap: 10 }}>
        {challenges.map((c) => (
          <div key={c.id} className={`challenge ${c.done ? 'done' : ''}`}>
            <span className="challenge-emoji" aria-hidden>{c.done ? '✅' : c.emoji}</span>
            <div className="grow" style={{ minWidth: 0 }}>
              <div className="row between small">
                <span>{c.title}</span>
                <span className="faint nowrap">{c.value}/{c.goal} {c.unit}</span>
              </div>
              <Progress value={c.value} max={c.goal} thin green={c.done} />
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-label" style={{ marginTop: 22 }}>Medalhas</h3>
      <div className="medals">
        {a.medals.map((m) => <MedalCard key={m.id} m={m} />)}
      </div>
    </section>
  );
}

/** Resumo no Início: nível, desafios e medalhas, com ligação para o Progresso. */
export function LevelStrip() {
  const a = useAchievements();
  if (!a) return null;
  const done = a.challenges.filter((c) => c.done).length;
  return (
    <Link to="/progresso#medalhas" className="level-strip fade-up">
      <span className="level-badge sm" aria-hidden>{a.level.level}</span>
      <span className="grow" style={{ minWidth: 0 }}>
        <b>Nível {a.level.level} · {a.level.name}</b>
        <span className="tiny faint" style={{ display: 'block' }}>{a.level.xp} XP · {a.earned} medalhas · desafios da semana {done}/3</span>
      </span>
      <ChevronRight size={18} />
    </Link>
  );
}

/** Mostra uma celebração quando o estudante ganha medalhas novas (em qualquer página). */
export function MedalCelebration() {
  const me = useMe();
  const a = useAchievements();
  const [fresh, setFresh] = useState<MedalView[]>([]);
  const key = `study-ai:medalhas:${me.user.id}`;

  useEffect(() => {
    if (!a) return;
    const now = earnedKeys(a.medals);
    let seen: string[] | null = null;
    try {
      seen = JSON.parse(localStorage.getItem(key) ?? 'null');
    } catch {
      seen = null;
    }
    try {
      localStorage.setItem(key, JSON.stringify(now));
    } catch {
      return; // sem armazenamento não dá para saber o que é novo: não incomoda
    }
    // Primeira vez neste dispositivo: só regista o que já existe (não celebra medalhas antigas).
    if (seen === null) return;
    const isNew = now.filter((k) => !seen!.includes(k));
    if (!isNew.length) return;
    const ids = new Set(isNew.map((k) => k.split(':')[0]));
    setFresh(a.medals.filter((m) => ids.has(m.id)));
  }, [a, key]);

  return (
    <Modal
      open={fresh.length > 0}
      onClose={() => setFresh([])}
      title={fresh.length === 1 ? 'Nova medalha!' : `${fresh.length} medalhas novas!`}
      footer={
        <>
          <Link to="/progresso#medalhas" className="btn btn-secondary" onClick={() => setFresh([])}><Award /> Ver todas</Link>
          <Button onClick={() => setFresh([])}>Continuar</Button>
        </>
      }
    >
      <div className="celebrate">
        {fresh.map((m) => (
          <div key={m.id} className={`celebrate-item ${m.tier}`}>
            <span className="medal-badge big" aria-hidden>{m.emoji}</span>
            <div>
              <b>{m.title}</b>
              <div className="small muted">{m.tier ? `Medalha de ${TIER_LABEL[m.tier].toLowerCase()}` : ''} · {m.text}</div>
            </div>
          </div>
        ))}
        <p className="small muted center">Continua assim! 💪</p>
      </div>
    </Modal>
  );
}
