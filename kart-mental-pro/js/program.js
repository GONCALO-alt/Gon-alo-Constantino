/* KART MENTAL PRO — programa de 21 dias, desafios diários e conquistas. */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const st = () => KMP.store.state;

  /*
   * Modelo semanal (dia da semana → tema). Cada tema tem 3 variantes, uma por semana do programa,
   * para distribuir os 12 exercícios de forma equilibrada. A 1.ª semana é mais leve (2 exercícios).
   */
  const WEEK = {
    1: { theme: 'Reflexos, visão e memória', goal: 'Acordar os reflexos e treinar a leitura visual e a memória de trabalho.', ex: [[1, 3], [1, 6, 10], [1, 9, 4]] },
    2: { theme: 'Partidas e decisões', goal: 'Arranques rápidos sem falsas partidas e decisões certas sob pressão.', ex: [[5, 7], [5, 8, 7], [5, 7, 8]] },
    3: { theme: 'Concentração e memória', goal: 'Manter o foco e guardar informação, como as referências de uma volta.', ex: [[2, 4], [2, 9, 10], [2, 8, 4]] },
    4: { theme: 'Visão periférica e reflexos', goal: 'Ver mais sem mexer os olhos e reagir depressa ao que aparece.', ex: [[3, 1], [3, 6, 1], [3, 6, 5]] },
    5: { theme: 'Circuitos e visualização mental', goal: 'Conhecer o traçado de memória e ensaiar voltas consistentes.', ex: [[11, 12], [11, 12], [11, 12]] },
    6: { theme: 'Revisão ou treino real de kart', goal: 'Rever os pontos mais fracos da semana, ou levar o treino para a pista.', kind: 'review' },
    0: { theme: 'Descanso e análise', goal: 'Recuperar e analisar a semana: o que melhorou e o que treinar a seguir.', kind: 'rest' },
  };

  const P = (KMP.program = {});
  P.LENGTH = 21;

  P.start = (fromDate) => {
    st().program = { start: fromDate || U.ymd(), days: {}, restarts: (st().program && st().program.restarts + 1) || 0 };
    KMP.store.save();
  };
  P.active = () => !!st().program;
  P.dateOf = (d) => U.addDays(st().program.start, d - 1);
  /** Dia do programa correspondente a hoje (1..21), 0 se ainda não começou, 22 se terminou. */
  P.todayIndex = () => {
    if (!st().program) return 0;
    const n = U.diffDays(st().program.start, U.ymd()) + 1;
    return n < 1 ? 0 : n > P.LENGTH ? P.LENGTH + 1 : n;
  };
  P.rec = (d) => {
    const p = st().program;
    if (!p.days[d]) p.days[d] = { ex: [] };
    return p.days[d];
  };

  /** Escolhe os 3 exercícios a rever ao sábado: os de pior resultado recente (ou ainda não feitos). */
  P.reviewPick = () => {
    const scored = KMP.EX_ORDER.filter((id) => id !== 12).map((id) => ({ id, s: KMP.data.recentScore(id, 3) }));
    scored.sort((a, b) => (a.s == null ? -1 : a.s) - (b.s == null ? -1 : b.s));
    return scored.slice(0, 3).map((o) => o.id);
  };

  /** Plano de um dia do programa. */
  P.day = (d) => {
    const date = P.dateOf(d);
    const wd = U.parseYmd(date).getDay();
    const t = WEEK[wd];
    const week = Math.floor((d - 1) / 7);
    const r = (st().program.days || {})[d] || { ex: [] };
    let ex = [];
    if (t.ex) {
      ex = t.ex[Math.min(week, 2)].slice();
      // Sem aumentar demasiado a carga: se na semana anterior se concluiu menos de metade dos dias, manter 2 exercícios.
      if (week > 0 && ex.length > 2) {
        let done = 0;
        let count = 0;
        const today = P.todayIndex();
        for (let k = d - 7; k < d; k++) {
          if (k < 1 || k >= today) continue; // só conta dias que já passaram
          count++;
          if (P.isDone(k)) done++;
        }
        if (count && done / count < 0.5) ex = ex.slice(0, 2);
      }
    } else if (t.kind === 'review') ex = r.reviewEx || P.reviewPick();
    const est = t.kind === 'rest' ? 5 : ex.reduce((a, id) => a + KMP.EX[id].est, 0) + ex.length;
    return { d, date, wd, week: week + 1, theme: t.theme, goal: t.goal, kind: t.kind || 'train', ex, est, rec: r, done: P.isDone(d) };
  };

  P.isDone = (d) => {
    const p = st().program;
    return !!(p && p.days[d] && p.days[d].completedAt);
  };
  P.doneCount = () => {
    if (!st().program) return 0;
    let n = 0;
    for (let d = 1; d <= P.LENGTH; d++) if (P.isDone(d)) n++;
    return n;
  };
  P.dayProgress = (d) => {
    const day = P.day(d);
    if (day.done) return 1;
    if (day.kind === 'rest') return 0;
    if (!day.ex.length) return 0;
    return day.ex.filter((id) => day.rec.ex.includes(id)).length / day.ex.length;
  };

  const complete = (d, kind) => {
    const r = P.rec(d);
    if (!r.completedAt) {
      r.completedAt = Date.now();
      r.kind = kind;
      return true;
    }
    return false;
  };

  /** Chamado sempre que se guarda uma sessão de exercício. */
  P.onSession = (s) => {
    if (!st().program) return null;
    let d = s.pday;
    if (!d) {
      const t = P.todayIndex();
      if (t >= 1 && t <= P.LENGTH) {
        const day = P.day(t);
        if (day.ex.includes(s.ex)) d = t;
      }
    }
    if (!d) return null;
    const day = P.day(d);
    const r = P.rec(d);
    if (day.kind === 'review' && !r.reviewEx) r.reviewEx = day.ex.slice();
    if (!r.ex.includes(s.ex)) r.ex.push(s.ex);
    let dayDone = false;
    if (day.ex.length && day.ex.every((id) => r.ex.includes(id))) dayDone = complete(d, day.kind === 'review' ? 'revisão' : 'treino');
    return { d, dayDone };
  };

  /** Fixa os exercícios de revisão de sábado quando o dia começa. */
  P.lockReview = (d) => {
    const day = P.day(d);
    if (day.kind === 'review' && !P.rec(d).reviewEx) {
      P.rec(d).reviewEx = day.ex.slice();
      KMP.store.save();
    }
  };

  P.completeTrack = (d) => {
    const ok = complete(d, 'pista');
    KMP.store.save();
    return ok;
  };
  P.completeRest = (d, note) => {
    P.rec(d).note = note || '';
    st().analysis[P.dateOf(d)] = { note: note || '', t: Date.now() };
    const ok = complete(d, 'análise');
    KMP.store.save();
    return ok;
  };

  /** Próximo dia por fazer até hoje (para recuperar dias em atraso). */
  P.nextPending = () => {
    const t = Math.min(P.todayIndex(), P.LENGTH);
    for (let d = 1; d <= t; d++) if (!P.isDone(d)) return d;
    return null;
  };

  /* ---------- Desafios diários ---------- */
  const CHALLENGES = [
    { text: 'Faz uma reação abaixo de 300 ms no Teste de Reflexos', ex: 1, test: (s) => s.m.bestMs < 300 },
    { text: 'Faz 5 partidas sem nenhuma falsa partida', ex: 5, test: (s) => s.m.falseStarts === 0 },
    { text: 'Completa a Tabela de Schulte em menos de 40 s', ex: 2, test: (s) => s.m.timeMs < 40000 },
    { text: 'Memoriza uma sequência de 6 cores', ex: 4, test: (s) => s.m.maxLen >= 6 },
    { text: 'Acerta 90% no Cálculo Mental', ex: 7, test: (s) => s.m.accPct >= 90 },
    { text: 'Acerta 90% no Teste Stroop', ex: 8, test: (s) => s.m.accPct >= 90 },
    { text: 'Encontra todas as diferenças', ex: 9, test: (s) => s.m.found === s.m.total },
    { text: 'Memoriza 7 dígitos seguidos', ex: 10, test: (s) => s.m.maxLen >= 7 },
    { text: 'Acerta 80% na Visão Periférica', ex: 3, test: (s) => s.m.accPct >= 80 },
    { text: 'Acerta 80% no Seguimento Visual', ex: 6, test: (s) => s.m.accPct >= 80 },
    { text: 'Acerta 80% na Memorização de Circuitos', ex: 11, test: (s) => s.m.accPct >= 80 },
    { text: 'Faz uma partida abaixo de 280 ms', ex: 5, test: (s) => s.m.bestMs < 280 },
    { text: 'Completa uma Visualização Mental de 5 minutos', ex: 12, test: (s) => s.m.minutes >= 4.9 },
    { text: 'Completa 3 exercícios diferentes hoje', ex: null, test: null },
  ];
  KMP.challenge = {
    today() {
      const key = U.ymd();
      let h = 0;
      for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      const c = CHALLENGES[h % CHALLENGES.length];
      return Object.assign({ date: key, done: !!st().challenges[key] }, c);
    },
    check() {
      const c = this.today();
      if (c.done) return false;
      const list = KMP.data.sessionsOn(c.date);
      const ok = c.test ? list.some((s) => s.ex === c.ex && s.m && c.test(s)) : new Set(list.map((s) => s.ex)).size >= 3;
      if (ok) {
        st().challenges[c.date] = Date.now();
        KMP.store.save();
      }
      return ok;
    },
  };

  /* ---------- Conquistas e medalhas ---------- */
  const D = () => KMP.data;
  const anyS = (ex, fn) => D().sessionsOf(ex).some((s) => s.m && fn(s));
  const ACH = [
    { id: 'first', icon: '🏁', name: 'Primeira volta', desc: 'Completa o primeiro exercício.', test: () => st().sessions.length >= 1 },
    { id: 'rx300', icon: '⚡', name: 'Reflexos de piloto', desc: 'Reação abaixo de 300 ms.', test: () => (D().bestReaction() || 1e9) < 300 },
    { id: 'rx250', icon: '🔥', name: 'Sub-250', desc: 'Reação abaixo de 250 ms.', test: () => (D().bestReaction() || 1e9) < 250 },
    { id: 'rx200', icon: '🚀', name: 'Sub-200', desc: 'Reação abaixo de 200 ms.', test: () => (D().bestReaction() || 1e9) < 200 },
    { id: 'start', icon: '🚦', name: 'Partida perfeita', desc: 'Sessão de partidas sem falsas partidas e média abaixo de 300 ms.', test: () => anyS(5, (s) => s.m.falseStarts === 0 && s.m.avgMs < 300) },
    { id: 'schulte', icon: '🔢', name: 'Olhar de águia', desc: 'Tabela de Schulte em menos de 30 s.', test: () => anyS(2, (s) => s.m.timeMs < 30000) },
    { id: 'colors', icon: '🎨', name: 'Memória fotográfica', desc: 'Sequência de 8 cores.', test: () => anyS(4, (s) => s.m.maxLen >= 8) },
    { id: 'digits', icon: '🧮', name: 'Cronometrista', desc: 'Memoriza 9 dígitos.', test: () => anyS(10, (s) => s.m.maxLen >= 9) },
    { id: 'calc', icon: '🎯', name: 'Decisão certeira', desc: '100% no Cálculo Mental.', test: () => anyS(7, (s) => s.m.accPct === 100) },
    { id: 'stroop', icon: '🧠', name: 'Foco de aço', desc: '95% no Stroop em nível Elite.', test: () => D().sessionsOf(8).some((s) => s.level === 3 && s.m.accPct >= 95) },
    { id: 'diff', icon: '🔍', name: 'Observador', desc: 'Todas as diferenças sem toques errados.', test: () => anyS(9, (s) => s.m.found === s.m.total && s.m.wrong === 0) },
    { id: 'track', icon: '🗺️', name: 'Conhece a pista', desc: '100% na Memorização de Circuitos.', test: () => anyS(11, (s) => s.m.accPct === 100) },
    { id: 'zen', icon: '🧘', name: 'Mente zen', desc: 'Visualização Mental de 10 minutos.', test: () => anyS(12, (s) => s.m.minutes >= 9.9) },
    { id: 'engineer', icon: '🛠️', name: 'Engenheiro de pista', desc: 'Cria um circuito personalizado.', test: () => (st().circuits || []).length > 0 },
    { id: 'all12', icon: '🏆', name: 'Piloto completo', desc: 'Experimenta os 12 exercícios.', test: () => new Set(st().sessions.map((s) => s.ex)).size >= 12 },
    { id: 'elite', icon: '💎', name: 'Elite', desc: 'Chega ao nível Elite num exercício.', test: () => Object.values(st().levels).some((l) => l.lv === 3) },
    { id: 'streak3', icon: '📅', name: 'Ritmo de corrida', desc: '3 dias seguidos de treino.', test: () => D().bestStreak() >= 3 },
    { id: 'streak7', icon: '🗓️', name: 'Semana completa', desc: '7 dias seguidos de treino.', test: () => D().bestStreak() >= 7 },
    { id: 'week1', icon: '🥉', name: 'Primeira semana', desc: 'Conclui 7 dias do programa.', test: () => P.doneCount() >= 7 },
    { id: 'prog21', icon: '🥇', name: 'Programa 21 dias', desc: 'Conclui os 21 dias do programa.', test: () => P.doneCount() >= 21 },
    { id: 'hour', icon: '⏱️', name: 'Uma hora de treino', desc: '60 minutos de treino acumulado.', test: () => D().totalTime() >= 3600000 },
    { id: 's50', icon: '🎖️', name: 'Veterano', desc: '50 exercícios concluídos.', test: () => st().sessions.length >= 50 },
    { id: 'kart', icon: '🏎️', name: 'Da mente à pista', desc: 'Regista um treino real de kart.', test: () => st().track.length > 0 },
    { id: 'chal5', icon: '⭐', name: 'Caçador de desafios', desc: 'Conclui 5 desafios diários.', test: () => Object.keys(st().challenges).length >= 5 },
  ];
  KMP.ach = {
    list: ACH,
    check() {
      const got = [];
      ACH.forEach((a) => {
        if (!st().ach[a.id]) {
          let ok = false;
          try {
            ok = a.test();
          } catch (e) {}
          if (ok) {
            st().ach[a.id] = Date.now();
            got.push(a);
          }
        }
      });
      if (got.length) KMP.store.save();
      return got;
    },
  };
})();
