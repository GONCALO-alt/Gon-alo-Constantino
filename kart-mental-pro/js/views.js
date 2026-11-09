/* KART MENTAL PRO — ecrãs da aplicação. */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const D = KMP.data;
  const P = KMP.program;
  const I = (n, c) => KMP.icon(n, c);
  const st = () => KMP.store.state;
  const V = (KMP.views = {});

  const greeting = () => {
    const h = new Date().getHours();
    return h < 6 ? 'Boa noite' : h < 13 ? 'Bom dia' : h < 20 ? 'Boa tarde' : 'Boa noite';
  };
  const topbar = (title, back) => `<header class="topbar">${back ? `<button class="icon-btn" data-go="${back}" aria-label="Voltar">${I('back')}</button>` : '<span class="brand-dot"></span>'}<h1>${title}</h1><span class="spacer"></span></header>`;
  const lvDots = (id) => {
    const l = D.levelOf(id);
    return `<span class="lvdots" title="${KMP.LEVELS[l]}">${[1, 2, 3].map((k) => `<i class="${k <= l ? 'on' : ''}"></i>`).join('')}</span>`;
  };
  const exTile = (id) => {
    const ex = KMP.EX[id];
    const best = D.best(id);
    return `<button class="ex-tile" data-ex="${id}"><span class="ex-num mono">${String(id).padStart(2, '0')}</span>${I(ex.icon)}<b>${ex.short}</b><small class="pb">${best != null ? D.fmtRec(id, best) : 'novo'}</small>${lvDots(id)}</button>`;
  };

  /** Painel de luzes (estilo volante de F1) com os 21 dias. */
  const shiftLights = () => {
    const t = P.todayIndex();
    return `<div class="shift">${Array.from({ length: 21 }, (_, i) => {
      const d = i + 1;
      const zone = d <= 7 ? 'z1' : d <= 14 ? 'z2' : 'z3';
      const cls = P.isDone(d) ? 'on' : d === t ? 'today' : d < t ? 'miss' : '';
      return `<span class="led ${zone} ${cls}" title="Dia ${d}"></span>`;
    }).join('')}</div>`;
  };

  const kpi = (label, value, sub, cls) => `<div class="kpi ${cls || ''}"><span class="kpi-l">${label}</span><b class="kpi-v mono">${value}</b>${sub ? `<span class="kpi-s">${sub}</span>` : ''}</div>`;

  /** Exercício recomendado: o próximo por fazer hoje; senão, o mais fraco ou ainda não experimentado. */
  const recommended = () => {
    const t = P.todayIndex();
    if (P.active() && t >= 1 && t <= 21) {
      const day = P.day(t);
      const left = day.ex.filter((id) => !day.rec.ex.includes(id));
      if (left.length) return { id: left[0], why: 'Faz parte do treino de hoje.' };
    }
    const never = KMP.EX_ORDER.filter((id) => !D.sessionsOf(id).length);
    if (never.length) return { id: never[0], why: 'Ainda não experimentaste este exercício.' };
    const worst = KMP.EX_ORDER.filter((id) => id !== 12)
      .map((id) => ({ id, s: D.recentScore(id, 3) }))
      .sort((a, b) => a.s - b.s)[0];
    return { id: worst.id, why: `É o teu ponto mais fraco neste momento (${worst.s} pontos de média).` };
  };

  /* ======================= INÍCIO ======================= */
  V.home = () => {
    const p = st().profile;
    const t = P.todayIndex();
    const done = P.doneCount();
    const best = D.bestReaction();
    const avg = D.avgReaction(50);
    const acc = D.accuracy();
    const streak = D.streak();
    const rec = recommended();
    const chal = KMP.challenge.today();
    const today = new Date();
    let todayCard = '';
    if (!P.active()) {
      todayCard = `<div class="card today"><div class="eyebrow red">Programa de 21 dias</div><h2>Pronto para começar?</h2><p class="muted">Um plano diário que distribui os 12 exercícios ao longo de três semanas e se adapta à tua evolução.</p>
        <button class="btn primary big full" data-act="start-program">${I('play')} COMEÇAR TREINO</button></div>`;
    } else if (t > 21) {
      todayCard = `<div class="card today"><div class="eyebrow red">Programa terminado</div><h2>${done}/21 dias concluídos</h2><p class="muted">Podes reiniciar o programa para um novo ciclo — o histórico e os recordes mantêm-se.</p>
        <button class="btn primary big full" data-act="restart-program">Reiniciar programa</button></div>`;
    } else if (t === 0) {
      todayCard = `<div class="card today"><div class="eyebrow red">Programa agendado</div><h2>Começa a ${U.fmtDate(st().program.start)}</h2><button class="btn ghost full" data-go="#/programa">Ver plano</button></div>`;
    } else {
      const day = P.day(t);
      const pending = P.nextPending();
      const exList = day.ex
        .map((id) => `<li class="${day.rec.ex.includes(id) ? 'done' : ''}">${day.rec.ex.includes(id) ? I('check') : I(KMP.EX[id].icon)}<span>${KMP.EX[id].name}</span>${lvDots(id)}</li>`)
        .join('');
      const btn =
        day.kind === 'rest'
          ? `<button class="btn primary big full" data-go="#/dia/${t}">${day.done ? I('check') + ' ANÁLISE FEITA' : I('chart') + ' FAZER ANÁLISE DA SEMANA'}</button>`
          : day.done
          ? `<button class="btn ghost big full" data-guided="${t}">${I('check')} DIA CONCLUÍDO · TREINAR DE NOVO</button>`
          : `<button class="btn primary big full" data-guided="${t}">${I('play')} COMEÇAR TREINO</button>`;
      todayCard = `<div class="card today">
        <div class="today-h"><div><div class="eyebrow red">Hoje · Dia ${t} de 21</div><h2>${day.theme}</h2></div><span class="pill">${I('clock')} ~${day.est} min</span></div>
        <p class="muted small">${day.goal}</p>
        ${exList ? `<ul class="today-ex">${exList}</ul>` : ''}
        ${btn}
        ${day.kind === 'review' && !day.done ? `<button class="btn ghost full mt" data-go="#/pista/${t}">${I('helmet')} Fui à pista: registar treino real</button>` : ''}
        ${pending && pending < t ? `<button class="link mt" data-go="#/dia/${pending}">Tens dias por fazer · recuperar o dia ${pending} →</button>` : ''}
      </div>`;
    }
    return `<section class="view home">
      <header class="hero">
        <div class="logo"><span class="logo-k">KART</span><span class="logo-m">MENTAL</span><span class="logo-p">PRO</span></div>
        <div class="greet"><span>${greeting()},</span><b>${U.esc(p.name)}</b><small>${U.WEEKDAYS[today.getDay()]}, ${today.getDate()} ${U.MONTHS[today.getMonth()]}</small></div>
      </header>

      <div class="card dash">
        <div class="dash-top">
          <div class="dash-ring">${ring(done / 21)}<div class="dash-ring-t"><b class="mono">${done}</b><span>/21</span></div></div>
          <div class="dash-info">
            <div class="eyebrow">Programa 21 dias</div>
            <div class="dash-big mono">${P.active() && t >= 1 && t <= 21 ? 'DIA ' + String(t).padStart(2, '0') : P.active() && t > 21 ? 'FIM' : '—'}</div>
            <div class="dash-streak">${I('fire')} <b>${streak}</b> ${streak === 1 ? 'dia seguido' : 'dias seguidos'}</div>
          </div>
        </div>
        ${shiftLights()}
        <div class="shift-l"><span>Semana 1</span><span>Semana 2</span><span>Semana 3</span></div>
      </div>

      ${todayCard}

      <div class="kpis">
        ${kpi('Melhor reação', best != null ? best + '<small>ms</small>' : '—', 'recorde pessoal', 'pb-k')}
        ${kpi('Média de reação', avg != null ? avg + '<small>ms</small>' : '—', 'últimas 50')}
        ${kpi('Precisão', acc != null ? Math.round(acc * 100) + '<small>%</small>' : '—', 'últimas 20 sessões')}
        ${kpi('Tempo de treino', U.fmtDur(D.totalTime()), st().sessions.length + ' exercícios')}
      </div>

      <div class="card rec" data-ex="${rec.id}">
        <div class="rec-ic">${I(KMP.EX[rec.id].icon)}</div>
        <div class="rec-t"><div class="eyebrow green">Recomendado para hoje</div><b>${KMP.EX[rec.id].name}</b><small class="muted">${rec.why}</small></div>
        ${I('chev')}
      </div>

      <div class="card chal ${chal.done ? 'done' : ''}" ${chal.ex ? `data-ex="${chal.ex}"` : ''}>
        <div class="chal-ic">${chal.done ? '✓' : '⭐'}</div>
        <div><div class="eyebrow yellow">Desafio do dia</div><b>${chal.text}</b><small class="muted">${chal.done ? 'Concluído hoje!' : 'Fica marcado automaticamente quando o conseguires.'}</small></div>
      </div>

      <div class="sec-h"><h3>Exercícios</h3><button class="link" data-go="#/exercicios">Ver todos</button></div>
      <div class="ex-grid">${KMP.EX_ORDER.map(exTile).join('')}</div>
    </section>`;
  };

  const ring = (f) => {
    const C = 2 * Math.PI * 44;
    return `<svg viewBox="0 0 100 100" class="ring"><circle cx="50" cy="50" r="44" class="ring-bg"/><circle cx="50" cy="50" r="44" class="ring-fg" style="stroke-dasharray:${C};stroke-dashoffset:${C * (1 - f)}"/>
      ${Array.from({ length: 21 }, (_, i) => {
        const a = (i / 21) * Math.PI * 2 - Math.PI / 2;
        return `<line x1="${50 + Math.cos(a) * 36}" y1="${50 + Math.sin(a) * 36}" x2="${50 + Math.cos(a) * 33}" y2="${50 + Math.sin(a) * 33}" class="ring-tick"/>`;
      }).join('')}</svg>`;
  };

  /* ======================= PROGRAMA ======================= */
  V.programa = () => {
    if (!P.active())
      return `<section class="view">${topbar('Programa 21 dias')}
        <div class="card"><h2>Programa de 21 dias</h2><p class="muted">Cada dia da semana tem um tema. Os exercícios distribuem-se de forma equilibrada pelas 3 semanas e o nível de cada um ajusta-se aos teus resultados, no máximo um passo por dia.</p>
        ${weekLegend()}<button class="btn primary big full" data-act="start-program">Começar hoje</button><button class="btn ghost full mt" data-act="start-monday">Começar na próxima segunda-feira</button></div></section>`;
    const t = P.todayIndex();
    const done = P.doneCount();
    let weeks = '';
    for (let w = 0; w < 3; w++) {
      weeks += `<div class="sec-h"><h3>Semana ${w + 1}</h3><span class="muted small">${w === 0 ? 'adaptação · 2 exercícios por dia' : w === 1 ? 'desenvolvimento' : 'consolidação'}</span></div><div class="days">`;
      for (let d = w * 7 + 1; d <= w * 7 + 7; d++) {
        const day = P.day(d);
        const prog = P.dayProgress(d);
        const status = day.done ? 'done' : d === t ? 'today' : d < t ? 'miss' : 'future';
        weeks += `<button class="day ${status}" data-go="#/dia/${d}">
          <div class="day-n"><span class="mono">${String(d).padStart(2, '0')}</span><small>${U.WD_SHORT[day.wd]}</small></div>
          <div class="day-c"><b>${day.theme}</b><small>${U.fmtDate(day.date)} · ${day.kind === 'rest' ? 'descanso' : day.kind === 'review' ? 'revisão ou pista' : '~' + day.est + ' min'}</small>
            <div class="day-ex">${day.ex.map((id) => `<span class="${day.rec.ex.includes(id) ? 'ok' : ''}">${I(KMP.EX[id].icon)}</span>`).join('')}</div>
            <div class="bar"><span style="width:${prog * 100}%"></span></div></div>
          <div class="day-s">${day.done ? I('check') : d === t ? '<span class="pill red">HOJE</span>' : d < t ? '<span class="pill">em falta</span>' : ''}</div>
        </button>`;
      }
      weeks += '</div>';
    }
    return `<section class="view">${topbar('Programa 21 dias')}
      <div class="card dash"><div class="dash-top"><div class="dash-ring">${ring(done / 21)}<div class="dash-ring-t"><b class="mono">${done}</b><span>/21</span></div></div>
        <div class="dash-info"><div class="eyebrow">Início</div><b>${U.fmtDate(st().program.start)}</b><div class="muted small">Fim: ${U.fmtDate(P.dateOf(21))}</div><div class="muted small">${Math.round((done / 21) * 100)}% concluído</div></div></div>${shiftLights()}</div>
      ${weeks}
      <details class="card"><summary>Como funciona o plano</summary>${weekLegend()}<p class="muted small">Adaptação: cada exercício sobe de nível quando tens duas sessões seguidas com 80 pontos ou mais, e desce quando ficam abaixo de 45. Para não aumentar a carga em excesso, o nível muda no máximo uma vez por dia e, se na semana anterior fizeste menos de metade dos dias, o plano mantém 2 exercícios por dia.</p></details>
      <button class="btn danger-ghost full" data-act="restart-program">Reiniciar programa de 21 dias</button>
    </section>`;
  };
  const weekLegend = () =>
    `<ul class="legend">${[
      ['Seg', 'Reflexos, visão e memória'],
      ['Ter', 'Partidas e decisões'],
      ['Qua', 'Concentração e memória'],
      ['Qui', 'Visão periférica e reflexos'],
      ['Sex', 'Circuitos e visualização mental'],
      ['Sáb', 'Revisão ou treino real de kart'],
      ['Dom', 'Descanso e análise'],
    ]
      .map((r) => `<li><b>${r[0]}</b><span>${r[1]}</span></li>`)
      .join('')}</ul>`;

  /* ---------- Dia do programa ---------- */
  V.dia = (params) => {
    const d = Number(params[0]);
    if (!P.active() || !(d >= 1 && d <= 21)) return V.programa();
    const t = P.todayIndex();
    const day = P.day(d);
    const future = d > t;
    let body = '';
    if (day.kind === 'rest') body = analysis(day, future);
    else {
      body = `<div class="card"><div class="card-t">Exercícios ${day.kind === 'review' ? '(os teus pontos mais fracos)' : ''}</div>
        <ul class="ex-list">${day.ex
          .map((id) => {
            const ex = KMP.EX[id];
            const ok = day.rec.ex.includes(id);
            return `<li><button class="ex-row ${ok ? 'done' : ''}" ${future ? 'disabled' : `data-ex="${id}" data-pday="${d}"`}>${I(ex.icon)}<div><b>${ex.name}</b><small>${KMP.LEVELS[D.levelOf(id)]} · ~${ex.est} min</small></div>${ok ? I('check', 'ok') : I('chev')}</button></li>`;
          })
          .join('')}</ul></div>
        ${
          future
            ? `<div class="note">Disponível a partir de ${U.fmtDate(day.date)}.</div>`
            : `<button class="btn primary big full" data-guided="${d}">${I('play')} ${day.done ? 'TREINAR DE NOVO' : d < t ? 'RECUPERAR ESTE DIA' : 'COMEÇAR TREINO'}</button>`
        }
        ${day.kind === 'review' && !future ? `<div class="or">ou</div><button class="btn ghost big full" data-go="#/pista/${d}">${I('helmet')} Registar treino real de kart</button>` : ''}`;
    }
    return `<section class="view">${topbar('Dia ' + d, '#/programa')}
      <div class="card"><div class="eyebrow red">${U.WEEKDAYS[day.wd]} · ${U.fmtDate(day.date)} · Semana ${day.week}</div><h2>${day.theme}</h2>
      <div class="kv"><span>Objetivo do dia</span></div><p>${day.goal}</p>
      <div class="row gap wrap"><span class="pill">${I('clock')} ~${day.est} min</span><span class="pill ${day.done ? 'green' : ''}">${day.done ? 'Concluído' + (day.rec.kind ? ' · ' + day.rec.kind : '') : Math.round(P.dayProgress(d) * 100) + '% feito'}</span></div></div>
      ${body}
    </section>`;
  };

  /** Análise semanal (domingo). */
  const analysis = (day, future) => {
    const end = day.date;
    const start = U.addDays(end, -6);
    const pStart = U.addDays(start, -7);
    const inRange = (s, a, b) => {
      const k = U.ymd(s.t);
      return k >= a && k <= b;
    };
    const cur = st().sessions.filter((s) => inRange(s, start, end));
    const prev = st().sessions.filter((s) => inRange(s, pStart, U.addDays(start, -1)));
    const byEx = (list) => {
      const m = {};
      list.forEach((s) => (m[s.ex] = m[s.ex] || []).push(s.score));
      return m;
    };
    const a = byEx(cur);
    const b = byEx(prev);
    const rows = Object.keys(a)
      .map(Number)
      .sort((x, y) => x - y)
      .map((id) => {
        const avg = Math.round(U.mean(a[id]));
        const pv = b[id] ? Math.round(U.mean(b[id])) : null;
        const df = pv == null ? '' : avg - pv >= 0 ? `<span class="up">▲${avg - pv}</span>` : `<span class="down">▼${pv - avg}</span>`;
        return { id, avg, row: `<div class="kv"><span>${KMP.EX[id].name}</span><b>${avg} ${df}</b></div>` };
      });
    const sorted = rows.slice().sort((x, y) => y.avg - x.avg);
    const track = st().track.filter((t) => t.date >= start && t.date <= end);
    const mins = Math.round(cur.reduce((s, x) => s + x.dur, 0) / 60000);
    const done = day.done;
    return `<div class="card"><div class="card-t">A tua semana (${U.fmtDate(start)} – ${U.fmtDate(end)})</div>
      <div class="kpis three">${kpi('Exercícios', cur.length)}${kpi('Minutos', mins)}${kpi('Pista', track.length)}</div>
      ${rows.length ? `<div class="card-t mt">Pontuação média por exercício</div>${rows.map((r) => r.row).join('')}` : '<p class="muted">Sem exercícios nesta semana.</p>'}
      ${sorted.length >= 2 ? `<div class="note up">Ponto forte: <b>${KMP.EX[sorted[0].id].name}</b></div><div class="note">A treinar mais: <b>${KMP.EX[sorted[sorted.length - 1].id].name}</b></div>` : ''}
      </div>
      <div class="card"><div class="card-t">Descanso</div><p class="muted">Hoje não há exercícios. Descansa, dorme bem e reflete: o que correu melhor? O que queres melhorar na próxima semana?</p>
      <textarea class="input" id="an-note" rows="3" placeholder="As minhas notas (opcional)" ${future ? 'disabled' : ''}>${U.esc(day.rec.note || '')}</textarea>
      ${future ? `<div class="note">Disponível a partir de ${U.fmtDate(day.date)}.</div>` : `<button class="btn primary big full mt" data-act="finish-rest" data-d="${day.d}">${done ? 'Guardar notas' : 'Concluir análise'}</button>`}</div>`;
  };

  /* ======================= EXERCÍCIOS ======================= */
  V.exercicios = () => {
    const cats = {};
    KMP.EX_ORDER.forEach((id) => (cats[KMP.EX[id].cat] = cats[KMP.EX[id].cat] || []).push(id));
    return `<section class="view">${topbar('Exercícios')}
      <div class="modes">
        <div class="mode"><b>${I('calendar')} Treino guiado</b><small>Segue o plano do dia: exercícios em sequência, nível ajustado automaticamente.</small><button class="btn primary small" data-act="guided-today">Começar</button></div>
        <div class="mode"><b>${I('dumbbell')} Treino livre</b><small>Escolhe qualquer exercício e o nível. Os resultados contam para as estatísticas.</small></div>
      </div>
      ${KMP.EX_ORDER.map((id) => {
        const ex = KMP.EX[id];
        const n = D.sessionsOf(id).length;
        return `<button class="ex-card" data-ex="${id}"><div class="ex-card-i">${I(ex.icon)}<span class="mono">${String(id).padStart(2, '0')}</span></div>
          <div class="ex-card-c"><div class="eyebrow">${ex.cat}</div><b>${ex.name}</b><small>${ex.desc}</small>
          <div class="ex-card-m"><span>${lvDots(id)} ${KMP.LEVELS[D.levelOf(id)]}</span><span class="pb">${D.fmtRec(id, D.best(id))}</span><span>${n} ${n === 1 ? 'sessão' : 'sessões'}</span></div></div></button>`;
      }).join('')}
      <button class="btn ghost full" data-go="#/circuitos">${I('track')} Gerir circuitos personalizados</button>
    </section>`;
  };

  /* ======================= ESTATÍSTICAS ======================= */
  let statEx = 1;
  V.__setStatEx = (id) => (statEx = id);
  V.stats = () => {
    const rts = D.reactionTimes();
    const weeks = D.weekly(8);
    const acc = KMP.EX_ORDER.map((id) => ({ id, a: D.accuracy(id) })).filter((o) => o.a != null);
    const list = D.sessionsOf(statEx);
    const exR = KMP.EX[statEx].record;
    return `<section class="view">${topbar('Estatísticas')}
      <div class="kpis">
        ${kpi('Melhor reação', D.bestReaction() != null ? D.bestReaction() + '<small>ms</small>' : '—', 'reflexos e partidas', 'pb-k')}
        ${kpi('Reação média', D.avgReaction(50) != null ? D.avgReaction(50) + '<small>ms</small>' : '—', 'últimas 50 medições')}
        ${kpi('Tempo total', U.fmtDur(D.totalTime()), st().sessions.length + ' exercícios')}
        ${kpi('Dias concluídos', P.active() ? P.doneCount() + '<small>/21</small>' : '—', 'programa atual')}
        ${kpi('Sequência', D.streak() + '<small>dias</small>', 'melhor: ' + D.bestStreak())}
        ${kpi('Precisão geral', D.accuracy() != null ? Math.round(D.accuracy() * 100) + '<small>%</small>' : '—', 'últimas 20 sessões')}
      </div>

      <div class="card"><div class="card-t">Evolução do tempo de reação (ms) <span class="muted small">— mais baixo é melhor</span></div>
        ${KMP.chart.line(rts.slice(-40), { invert: true, color: 'var(--green)' })}</div>

      <div class="card"><div class="card-t">Evolução semanal · minutos de treino</div>
        ${KMP.chart.bars(weeks.map((w) => ({ v: w.min, label: U.fmtDate(w.ws) })), { color: 'var(--red)' })}</div>
      <div class="card"><div class="card-t">Evolução semanal · pontuação média</div>
        ${KMP.chart.line(weeks.map((w) => w.score), { min: 0, max: 100, color: 'var(--yellow)', empty: 'Aparece quando tiveres treinado em pelo menos 2 semanas.' })}</div>

      <div class="card"><div class="card-t">Evolução por exercício</div>
        <div class="chips scroll-x">${KMP.EX_ORDER.map((id) => `<button class="chip ${id === statEx ? 'on' : ''}" data-act="stat-ex" data-id="${id}">${KMP.EX[id].short}</button>`).join('')}</div>
        <div class="row between small muted mt"><span>Pontuação (0–100)</span><span>${list.length} ${list.length === 1 ? 'sessão' : 'sessões'}</span></div>
        ${KMP.chart.line(list.slice(-20).map((s) => s.score), { min: 0, max: 100, color: 'var(--green)' })}
        <div class="row between small muted mt"><span>${exR.label}${exR.lower ? ' (mais baixo é melhor)' : ''}</span><span class="pb">Recorde: ${D.fmtRec(statEx, D.best(statEx))}</span></div>
        ${KMP.chart.line(list.slice(-20).map((s) => D.recVal(statEx, s)), { invert: exR.lower, color: 'var(--purple)', dec: exR.key === 'timeMs' ? 0 : 0 })}
      </div>

      <div class="card"><div class="card-t">Precisão por exercício</div>
        ${acc.length ? acc.map((o) => `<div class="hbar"><span>${KMP.EX[o.id].short}</span><div class="bar"><span style="width:${o.a * 100}%;background:${o.a >= 0.85 ? 'var(--green)' : o.a >= 0.6 ? 'var(--yellow)' : 'var(--red)'}"></span></div><b class="mono">${Math.round(o.a * 100)}%</b></div>`).join('') : '<div class="chart-empty">Sem dados ainda.</div>'}
      </div>

      <div class="card"><div class="card-t">Recordes pessoais</div>
        ${KMP.EX_ORDER.map((id) => `<div class="kv"><span>${KMP.EX[id].name}<small> · ${KMP.EX[id].record.label}</small></span><b class="pb">${D.fmtRec(id, D.best(id))}</b></div>`).join('')}
      </div>

      <div class="row gap"><button class="btn ghost full" data-go="#/historico">${I('history')} Histórico</button><button class="btn ghost full" data-go="#/conquistas">${I('medal')} Conquistas</button></div>
    </section>`;
  };

  /* ---------- Histórico ---------- */
  V.historico = () => {
    const items = st()
      .sessions.map((s) => ({ t: s.t, k: 's', s }))
      .concat(st().track.map((t) => ({ t: t.t || U.parseYmd(t.date).getTime(), k: 't', s: t })))
      .sort((a, b) => b.t - a.t)
      .slice(0, 300);
    let lastDay = '';
    const rows = items
      .map((it) => {
        const day = U.ymd(it.t);
        const head = day !== lastDay ? `<div class="hist-d">${U.WEEKDAYS[U.parseYmd(day).getDay()]}, ${U.fmtDate(day)}</div>` : '';
        lastDay = day;
        if (it.k === 't') {
          const t = it.s;
          return `${head}<div class="hist track">${I('helmet')}<div><b>Treino de pista${t.circuit ? ' · ' + U.esc(t.circuit) : ''}</b><small>${t.laps ? t.laps + ' voltas · ' : ''}${t.best ? 'melhor volta ' + U.esc(t.best) + ' · ' : ''}sensação ${t.feel || '—'}/5</small>${t.notes ? `<small class="muted">${U.esc(t.notes)}</small>` : ''}</div></div>`;
        }
        const s = it.s;
        const ex = KMP.EX[s.ex];
        return `${head}<div class="hist">${I(ex.icon)}<div><b>${ex.name}</b><small>${U.fmtDateTime(s.t).split(' · ')[1]} · ${KMP.LEVELS[s.level]} · ${U.fmtDur(s.dur)}${s.mode === 'guided' ? ' · guiado' : ''} · ${ex.record.label.toLowerCase()}: ${D.fmtRec(s.ex, D.recVal(s.ex, s))}</small></div><span class="hist-s mono" style="color:${s.score >= 75 ? 'var(--green)' : s.score >= 50 ? 'var(--yellow)' : 'var(--red)'}">${s.score}</span></div>`;
      })
      .join('');
    return `<section class="view">${topbar('Histórico', '#/stats')}${rows || '<div class="card"><p class="muted">Ainda não há sessões. Começa um exercício!</p></div>'}</section>`;
  };

  /* ---------- Conquistas ---------- */
  V.conquistas = () => {
    const got = st().ach;
    const n = KMP.ach.list.filter((a) => got[a.id]).length;
    return `<section class="view">${topbar('Conquistas', '#/stats')}
      <div class="card"><div class="row between"><b>${n} de ${KMP.ach.list.length} medalhas</b><span class="muted small">${Object.keys(st().challenges).length} desafios diários concluídos</span></div><div class="bar mt"><span style="width:${(n / KMP.ach.list.length) * 100}%"></span></div></div>
      <div class="ach-grid">${KMP.ach.list
        .map((a) => `<div class="ach ${got[a.id] ? 'on' : ''}"><span class="ach-i">${a.icon}</span><b>${a.name}</b><small>${a.desc}</small>${got[a.id] ? `<small class="green">${U.fmtDate(U.ymd(got[a.id]))}</small>` : '<small class="muted">bloqueada</small>'}</div>`)
        .join('')}</div></section>`;
  };

  /* ======================= PERFIL ======================= */
  const OPT = {
    kartType: [
      ['aluguer', 'Karting de aluguer'],
      ['competicao', 'Karting de competição'],
      ['outro', 'Outro'],
    ],
    freq: [
      ['0-1', 'Menos de 1 vez por semana'],
      ['1-2', '1 a 2 vezes por semana'],
      ['3+', '3 ou mais vezes por semana'],
    ],
    goal: [
      ['todas', 'Melhorar todas as capacidades mentais'],
      ['reacao', 'Reação e partidas'],
      ['consistencia', 'Consistência nas voltas'],
      ['concentracao', 'Concentração em corrida'],
      ['circuitos', 'Conhecer melhor os circuitos'],
    ],
    level: [
      ['iniciante', 'Iniciante'],
      ['regular', 'Piloto regular'],
      ['corridas', 'Piloto que já participa em corridas'],
      ['federado', 'Piloto de competição federado'],
    ],
  };
  const sel = (k, label) => `<label class="field"><span>${label}</span><select class="input" data-prof="${k}">${OPT[k].map((o) => `<option value="${o[0]}" ${st().profile[k] === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></label>`;
  const sw = (k, label, on) => `<label class="switch-row"><span>${label}</span><input type="checkbox" data-set="${k}" ${on ? 'checked' : ''}><i></i></label>`;

  V.perfil = () => {
    const s = st().settings;
    const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    return `<section class="view">${topbar('Perfil do piloto')}
      <div class="card prof-h"><div class="avatar">${I('helmet')}</div><div><b>${U.esc(st().profile.name)}</b><small class="muted">${OPT.level.find((o) => o[0] === st().profile.level)[1]}</small></div></div>
      <div class="card"><div class="card-t">Perfil</div>
        <label class="field"><span>Nome ou alcunha</span><input class="input" data-prof="name" maxlength="24" value="${U.esc(st().profile.name)}"></label>
        ${sel('kartType', 'Tipo de karting')}${sel('freq', 'Frequência de idas à pista')}${sel('goal', 'Objetivo principal')}${sel('level', 'Nível de experiência')}
      </div>
      <div class="card"><div class="card-t">Definições</div>
        ${sw('sound', 'Sons nos exercícios', s.sound)}
        ${sw('voice', 'Voz na visualização mental', s.voice)}
        ${sw('reminder', 'Lembrete diário para treinar', s.reminder.on)}
        <div class="rem ${s.reminder.on ? '' : 'hidden'}">
          <label class="field"><span>Hora do lembrete</span><input type="time" class="input" data-act-in="rem-time" value="${s.reminder.time}"></label>
          <p class="muted small">No iPhone, uma app web só pode mostrar notificações quando está instalada no ecrã principal e aberta recentemente. Para um lembrete garantido todos os dias, adiciona-o ao Calendário:</p>
          <button class="btn ghost full" data-act="ics">${I('bell')} Adicionar lembrete ao Calendário</button>
        </div>
      </div>
      <div class="card"><div class="card-t">Circuitos</div><button class="btn ghost full" data-go="#/circuitos">${I('track')} Os meus circuitos (${(st().circuits || []).length})</button></div>
      <div class="card"><div class="card-t">Instalar no iPhone</div>
        ${standalone ? '<p class="green">✓ A aplicação está instalada no ecrã principal.</p>' : `<ol class="how small"><li>Abre esta página no <b>Safari</b>.</li><li>Toca no botão <b>Partilhar</b> (quadrado com seta para cima).</li><li>Escolhe <b>«Adicionar ao ecrã principal»</b> e confirma.</li></ol>`}
      </div>
      <div class="card"><div class="card-t">Dados</div>
        <p class="muted small">Os resultados ficam guardados apenas neste dispositivo. Faz uma cópia de segurança de vez em quando.</p>
        <div class="row gap"><button class="btn ghost full" data-act="export">Exportar</button><label class="btn ghost full">Importar<input type="file" accept="application/json,.json" data-act-in="import" hidden></label></div>
        <button class="btn danger-ghost full mt" data-act="restart-program">Reiniciar programa de 21 dias</button>
        <button class="btn danger-ghost full mt" data-act="wipe">Apagar todos os dados</button>
      </div>
      <p class="muted small center">KART MENTAL PRO · versão 1.0 · funciona sem internet</p>
    </section>`;
  };

  /* ---------- Registo de treino real ---------- */
  V.pista = (params) => {
    const d = Number(params[0]) || 0;
    return `<section class="view">${topbar('Treino de pista', d ? '#/dia/' + d : '#/')}
      <div class="card"><p class="muted">Regista a tua ida à pista. Conta como dia de treino e fica no histórico.</p>
        <label class="field"><span>Data</span><input type="date" class="input" id="tk-date" value="${U.ymd()}"></label>
        <label class="field"><span>Circuito</span><input class="input" id="tk-circ" maxlength="40" placeholder="Ex.: kartódromo onde corres"></label>
        <div class="row gap"><label class="field"><span>Voltas</span><input type="number" inputmode="numeric" class="input" id="tk-laps" min="0" max="500"></label>
        <label class="field"><span>Melhor volta</span><input class="input" id="tk-best" inputmode="decimal" placeholder="0:45.320"></label></div>
        <div class="rate-row"><span>Sensação geral</span><div class="stars" id="tk-feel">${[1, 2, 3, 4, 5].map((n) => `<button data-v="${n}">★</button>`).join('')}</div></div>
        <label class="field"><span>Notas</span><textarea class="input" id="tk-notes" rows="3" placeholder="Pontos de travagem, ultrapassagens, o que melhorar…"></textarea></label>
        <button class="btn primary big full" data-act="save-track" data-d="${d}">Guardar treino</button>
      </div></section>`;
  };

  /* ======================= CIRCUITOS ======================= */
  V.circuitos = (params) => {
    if (params[0] === 'novo' || params[0] === 'editar') return editor(params[1]);
    const all = KMP.circuits.all();
    return `<section class="view">${topbar('Circuitos', '#/exercicios')}
      <p class="muted small pad-x">Os circuitos são usados na Memorização de Circuitos e na Visualização Mental. Cria o traçado da pista onde corres, curva a curva.</p>
      ${all
        .map(
          (c) => `<div class="card cir-row"><div class="cir-thumb">${KMP.circuits.svg(c, { labels: false }).html}</div><div class="cir-row-c"><b>${U.esc(c.name)}</b><small class="muted">${c.custom ? 'Personalizado' : U.esc(c.desc)} · ${KMP.circuits.geometry(c).corners.length} curvas</small>
          ${c.custom ? `<div class="row gap mt"><button class="btn ghost small" data-go="#/circuitos/editar/${c.id}">Editar</button><button class="btn danger-ghost small" data-act="del-circ" data-id="${c.id}">Apagar</button></div>` : ''}</div></div>`
        )
        .join('')}
      <button class="btn primary big full" data-go="#/circuitos/novo">${I('plus')} Criar circuito</button>
    </section>`;
  };

  let draft = null;
  let cDir = 'R';
  let cAng = 90;
  let cBrake = 1;
  const editor = (id) => {
    if (!draft || draft._for !== (id || 'novo')) {
      const src = id ? (st().circuits || []).find((c) => c.id === id) : null;
      draft = src ? JSON.parse(JSON.stringify(src)) : { id: 'c' + U.uid(), name: '', segs: [{ t: 'S', l: 150, zone: 'ultrapassagem' }] };
      draft._for = id || 'novo';
    }
    return `<section class="view">${topbar(id ? 'Editar circuito' : 'Novo circuito', '#/circuitos')}
      <label class="field"><span>Nome do circuito</span><input class="input" id="ce-name" maxlength="30" value="${U.esc(draft.name)}" placeholder="Ex.: Kartódromo de casa"></label>
      <div class="card ce-prev" id="ce-prev">${previewHtml()}</div>
      <div class="card"><div class="card-t">Adicionar reta</div>
        <div class="row gap"><button class="btn ghost full" data-act="ce-s" data-l="50">Curta</button><button class="btn ghost full" data-act="ce-s" data-l="100">Média</button><button class="btn ghost full" data-act="ce-s" data-l="180">Longa</button></div>
        <button class="btn ghost small full mt" data-act="ce-zone">Marcar última reta como zona de ultrapassagem</button>
      </div>
      <div class="card"><div class="card-t">Adicionar curva</div>
        <div class="seg-ctl" data-ce="dir"><button data-v="L" class="${cDir === 'L' ? 'on' : ''}">↰ Esquerda</button><button data-v="R" class="${cDir === 'R' ? 'on' : ''}">↱ Direita</button></div>
        <div class="seg-ctl" data-ce="ang">${[45, 90, 135, 180].map((a) => `<button data-v="${a}" class="${cAng === a ? 'on' : ''}">${a}°</button>`).join('')}</div>
        <div class="seg-ctl" data-ce="brake">${['Sem travagem', 'Média', 'Forte'].map((b, i) => `<button data-v="${i}" class="${cBrake === i ? 'on' : ''}">${b}</button>`).join('')}</div>
        <button class="btn primary full" data-act="ce-c">${I('plus')} Adicionar curva</button>
      </div>
      <div class="row gap"><button class="btn ghost full" data-act="ce-undo">Desfazer</button><button class="btn ghost full" data-act="ce-clear">Limpar</button></div>
      <p class="muted small">O traçado fecha-se automaticamente até à meta. Precisas de pelo menos 3 curvas.</p>
      <button class="btn primary big full" data-act="ce-save">Guardar circuito</button>
    </section>`;
  };
  const previewHtml = () => {
    const g = KMP.circuits.geometry(draft);
    return `${KMP.circuits.svg(draft).html}<div class="muted small center">${draft.segs.length} segmentos · ${g.corners.length} curvas</div>`;
  };
  V._refreshEditor = () => {
    const p = U.$('#ce-prev');
    if (p) p.innerHTML = previewHtml();
  };
  V._editor = {
    get draft() {
      return draft;
    },
    set: (k, v) => {
      if (k === 'dir') cDir = v;
      if (k === 'ang') cAng = Number(v);
      if (k === 'brake') cBrake = Number(v);
    },
    addS: (l) => draft.segs.push({ t: 'S', l }),
    addC: () => draft.segs.push({ t: 'C', d: cDir, a: cAng, r: cAng >= 180 ? 25 : cAng >= 135 ? 28 : cAng >= 90 ? 30 : 40, brake: cBrake }),
    zone: () => {
      for (let i = draft.segs.length - 1; i >= 0; i--)
        if (draft.segs[i].t === 'S') {
          draft.segs[i].zone = draft.segs[i].zone ? undefined : 'ultrapassagem';
          return true;
        }
      return false;
    },
    undo: () => draft.segs.length > 1 && draft.segs.pop(),
    clear: () => (draft.segs = [{ t: 'S', l: 150, zone: 'ultrapassagem' }]),
    reset: () => (draft = null),
  };
})();
