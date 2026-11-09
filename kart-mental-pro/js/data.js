/* KART MENTAL PRO — registo de exercícios, sessões, níveis e estatísticas. */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;

  KMP.EX = {};
  KMP.EX_ORDER = [];
  KMP.registerEx = (def) => {
    KMP.EX[def.id] = def;
    KMP.EX_ORDER.push(def.id);
    KMP.EX_ORDER.sort((a, b) => a - b);
  };
  KMP.LEVELS = { 1: 'Base', 2: 'Competição', 3: 'Elite' };

  const st = () => KMP.store.state;
  const D = (KMP.data = {});

  D.sessions = () => st().sessions;
  D.sessionsOf = (ex) => st().sessions.filter((s) => s.ex === ex);
  D.sessionsOn = (day) => st().sessions.filter((s) => U.ymd(s.t) === day);

  D.levelOf = (ex) => (st().levels[ex] && st().levels[ex].lv) || 1;

  /** Valor de recorde de uma sessão (segundo a definição do exercício). */
  D.recVal = (ex, s) => {
    const r = KMP.EX[ex] && KMP.EX[ex].record;
    if (!r || !s.m) return null;
    const v = s.m[r.key];
    return v == null || Number.isNaN(v) ? null : v;
  };
  D.best = (ex, list) => {
    const r = KMP.EX[ex] && KMP.EX[ex].record;
    if (!r) return null;
    let best = null;
    (list || D.sessionsOf(ex)).forEach((s) => {
      const v = D.recVal(ex, s);
      if (v == null) return;
      if (best == null || (r.lower ? v < best : v > best)) best = v;
    });
    return best;
  };
  D.fmtRec = (ex, v) => {
    const r = KMP.EX[ex].record;
    if (v == null) return '—';
    return r.fmt ? r.fmt(v) : U.num(v, r.dec || 0) + (r.unit ? ' ' + r.unit : '');
  };

  /** Todas as medições de reação (reflexos + partidas), da mais antiga à mais recente. */
  D.reactionTimes = () => {
    const out = [];
    st().sessions.forEach((s) => {
      if ((s.ex === 1 || s.ex === 5) && s.m && Array.isArray(s.m.times)) s.m.times.forEach((t) => out.push(t));
    });
    return out;
  };
  D.bestReaction = () => {
    const t = D.reactionTimes();
    return t.length ? Math.min(...t) : null;
  };
  D.avgReaction = (n) => {
    const t = D.reactionTimes().slice(-(n || 50));
    return t.length ? Math.round(U.mean(t)) : null;
  };
  /** Precisão média das últimas 20 sessões que medem precisão. */
  D.accuracy = (ex) => {
    const list = st().sessions.filter((s) => s.acc != null && (ex == null || s.ex === ex)).slice(-20);
    return list.length ? U.mean(list.map((s) => s.acc)) : null;
  };
  D.totalTime = () => st().sessions.reduce((s, x) => s + (x.dur || 0), 0);

  /** Dias com atividade: exercícios, treino de pista ou análise de domingo. */
  D.activeDays = () => {
    const set = new Set();
    st().sessions.forEach((s) => set.add(U.ymd(s.t)));
    st().track.forEach((t) => set.add(t.date));
    Object.keys(st().analysis || {}).forEach((d) => set.add(d));
    return set;
  };
  /** Dias consecutivos de treino (hoje ainda pode contar). */
  D.streak = () => {
    const days = D.activeDays();
    let d = U.ymd();
    if (!days.has(d)) d = U.addDays(d, -1);
    let n = 0;
    while (days.has(d)) {
      n++;
      d = U.addDays(d, -1);
    }
    return n;
  };
  D.bestStreak = () => {
    const days = Array.from(D.activeDays()).sort();
    let best = 0;
    let cur = 0;
    let prev = null;
    days.forEach((d) => {
      cur = prev && U.diffDays(prev, d) === 1 ? cur + 1 : 1;
      best = Math.max(best, cur);
      prev = d;
    });
    return best;
  };

  /** Média das pontuações das últimas n sessões de um exercício. */
  D.recentScore = (ex, n) => {
    const l = D.sessionsOf(ex).slice(-(n || 3));
    return l.length ? Math.round(U.mean(l.map((s) => s.score))) : null;
  };

  /**
   * Ajuste automático do nível: sobe quando as 2 últimas sessões no nível atual têm ≥ 80 pontos,
   * desce quando ambas ficam abaixo de 45. No máximo uma mudança por dia, para não sobrecarregar.
   */
  D.adaptLevel = (ex) => {
    const today = U.ymd();
    const cur = st().levels[ex] || { lv: 1, changedOn: null };
    if (cur.changedOn === today) return 0;
    const last = D.sessionsOf(ex)
      .filter((s) => s.level === cur.lv)
      .slice(-2);
    if (last.length < 2) return 0;
    let delta = 0;
    if (last.every((s) => s.score >= 80) && cur.lv < 3) delta = 1;
    else if (last.every((s) => s.score < 45) && cur.lv > 1) delta = -1;
    if (delta) st().levels[ex] = { lv: cur.lv + delta, changedOn: today };
    return delta;
  };

  /**
   * Guarda o resultado de um exercício. Devolve informação para o ecrã de feedback.
   */
  D.addSession = (s) => {
    const ex = s.ex;
    const prevBest = D.best(ex);
    const prevCount = D.sessionsOf(ex).length;
    const session = Object.assign({ id: U.uid(), t: Date.now() }, s);
    st().sessions.push(session);
    const v = D.recVal(ex, session);
    const rec = KMP.EX[ex].record;
    const isRecord = v != null && prevCount > 0 && prevBest != null && (rec.lower ? v < prevBest : v > prevBest);
    let levelChange = 0;
    if (session.level === D.levelOf(ex)) levelChange = D.adaptLevel(ex);
    const prog = KMP.program ? KMP.program.onSession(session) : null;
    KMP.store.save();
    const newAch = KMP.ach ? KMP.ach.check() : [];
    const chal = KMP.challenge ? KMP.challenge.check() : false;
    return { session, isRecord, prevBest, first: prevCount === 0, levelChange, newAch, chal, prog };
  };

  /** Resumo semanal: minutos, sessões e pontuação média por semana (últimas n semanas). */
  D.weekly = (n) => {
    const thisWeek = U.weekStart(U.ymd());
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const ws = U.addDays(thisWeek, -7 * i);
      const we = U.addDays(ws, 7);
      const list = st().sessions.filter((s) => {
        const d = U.ymd(s.t);
        return d >= ws && d < we;
      });
      out.push({
        ws,
        n: list.length,
        min: Math.round(list.reduce((a, s) => a + s.dur, 0) / 60000),
        score: list.length ? Math.round(U.mean(list.map((s) => s.score))) : null,
      });
    }
    return out;
  };
})();
