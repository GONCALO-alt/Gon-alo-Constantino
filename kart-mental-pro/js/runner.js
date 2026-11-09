/* KART MENTAL PRO — execução de exercícios: introdução, contagem, exercício e feedback. */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const D = KMP.data;

  const R = (KMP.runner = { open: false });
  let el = null;
  let scope = null;
  let current = null; // { ex, opts }

  const label = (s) => (s >= 90 ? 'Excelente' : s >= 75 ? 'Muito bom' : s >= 55 ? 'Bom' : s >= 35 ? 'Razoável' : 'A melhorar');
  const color = (s) => (s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--yellow)' : 'var(--red)');

  const mount = () => {
    if (!el) {
      el = U.h('<div id="run" class="run" role="dialog" aria-modal="true"></div>');
      document.body.appendChild(el);
    }
    el.classList.add('show');
    document.body.classList.add('running');
    R.open = true;
  };
  R.close = () => {
    if (scope) scope.dispose();
    scope = null;
    KMP.stopSpeak();
    if (el) {
      el.classList.remove('show');
      el.innerHTML = '';
    }
    document.body.classList.remove('running');
    R.open = false;
    current = null;
    KMP.app && KMP.app.render();
  };

  /**
   * Abre um exercício.
   * opts: { mode: 'free'|'guided', queue: [ids], pos: índice, pday: dia do programa }
   */
  R.start = (exId, opts) => {
    opts = Object.assign({ mode: 'free' }, opts || {});
    current = { ex: KMP.EX[exId], opts };
    mount();
    intro();
  };

  /** Treino guiado: corre os exercícios do dia do programa, um após outro. */
  R.guided = (d) => {
    const day = KMP.program.day(d);
    KMP.program.lockReview(d);
    let queue = day.ex.filter((id) => !day.rec.ex.includes(id));
    if (!queue.length) queue = day.ex.slice();
    if (!queue.length) return;
    R.start(queue[0], { mode: 'guided', queue, pos: 0, pday: d });
  };

  const header = (title, hud) =>
    `<div class="run-top"><button class="icon-btn run-x" aria-label="Sair">${KMP.icon('x')}</button><div class="run-title">${title}</div><div class="run-hud mono">${hud || ''}</div></div>`;

  const bindExit = (confirmFirst) => {
    el.querySelector('.run-x').addEventListener('click', async () => {
      if (confirmFirst) {
        const ok = await KMP.confirm('Sair do exercício? Esta tentativa não fica guardada.', 'Sair', true);
        if (!ok) return;
      }
      R.close();
    });
  };

  /* ---------- 1. Introdução ---------- */
  const intro = () => {
    const { ex, opts } = current;
    const adaptive = D.levelOf(ex.id);
    let level = opts.level || adaptive;
    const best = D.best(ex.id);
    const n = D.sessionsOf(ex.id).length;
    const last = D.sessionsOf(ex.id).slice(-1)[0];
    const guided = opts.mode === 'guided';
    el.innerHTML = `${header(guided ? `Dia ${opts.pday} · ${opts.pos + 1} de ${opts.queue.length}` : 'Treino livre')}
      <div class="run-body scroll">
        <div class="intro">
          <div class="intro-icon">${KMP.icon(ex.icon)}</div>
          <div class="eyebrow">Exercício ${ex.id} · ${ex.cat}</div>
          <h1 class="intro-t">${ex.name}</h1>
          <p class="intro-d">${ex.desc}</p>
          <ol class="how">${ex.how.map((h) => `<li>${h}</li>`).join('')}</ol>
          <div class="card lv-card">
            <div class="lv-head"><span>Nível</span>${guided ? '<span class="muted small">ajustado automaticamente</span>' : `<span class="muted small">recomendado: ${KMP.LEVELS[adaptive]}</span>`}</div>
            <div class="seg-ctl lv-ctl ${guided ? 'locked' : ''}">${[1, 2, 3].map((l) => `<button data-l="${l}" class="${l === level ? 'on' : ''}">${KMP.LEVELS[l]}</button>`).join('')}</div>
            <div class="lv-info muted small">${ex.levels[level]}</div>
          </div>
          <div class="intro-stats">
            <div><span>${ex.record.label}</span><b class="pb">${D.fmtRec(ex.id, best)}</b></div>
            <div><span>Sessões</span><b>${n}</b></div>
            <div><span>Última pontuação</span><b>${last ? last.score : '—'}</b></div>
          </div>
        </div>
      </div>
      <div class="run-foot">
        ${guided && opts.pos < opts.queue.length - 1 ? '<button class="btn ghost skip-btn">Saltar</button>' : ''}
        <button class="btn primary big go-btn">${KMP.icon('play')} COMEÇAR</button>
      </div>`;
    bindExit(false);
    if (!guided) {
      el.querySelector('.lv-ctl').addEventListener('click', (e) => {
        const b = e.target.closest('[data-l]');
        if (!b) return;
        level = Number(b.dataset.l);
        U.$$('[data-l]', el).forEach((x) => x.classList.toggle('on', x === b));
        el.querySelector('.lv-info').textContent = ex.levels[level];
      });
    }
    const skip = el.querySelector('.skip-btn');
    if (skip) skip.addEventListener('click', () => nextInQueue());
    el.querySelector('.go-btn').addEventListener('click', () => {
      current.level = level;
      if (ex.noCountdown) run();
      else countdown();
    });
  };

  /* ---------- 2. Contagem decrescente ---------- */
  const countdown = () => {
    el.innerHTML = `${header(current.ex.name)}<div class="run-body"><div class="cd"><div class="cd-n">3</div><div class="muted">Prepara-te</div></div></div>`;
    bindExit(false);
    scope = new KMP.Scope();
    const n = el.querySelector('.cd-n');
    let k = 3;
    KMP.sound.light();
    const iv = scope.interval(() => {
      k--;
      if (k <= 0) {
        scope.clearInterval(iv);
        scope.dispose();
        run();
        return;
      }
      n.textContent = k;
      n.classList.remove('pop');
      void n.offsetWidth;
      n.classList.add('pop');
      KMP.sound.light();
    }, 800);
  };

  /* ---------- 3. Exercício ---------- */
  const run = () => {
    const { ex } = current;
    el.innerHTML = `${header(ex.name)}<div class="run-body stage-host"><div class="stage"></div></div>`;
    bindExit(true);
    const stage = el.querySelector('.stage');
    const hud = el.querySelector('.run-hud');
    scope = new KMP.Scope();
    const t0 = Date.now();
    const ctx = {
      level: current.level,
      scope,
      hud: (t) => (hud.textContent = t),
      exit: (hash) => {
        R.close();
        location.hash = hash;
      },
      finish: (result) => {
        if (!scope || !scope.alive) return;
        scope.dispose();
        const dur = Date.now() - t0;
        const info = D.addSession({
          ex: ex.id,
          level: current.level,
          dur,
          score: Math.round(result.score),
          acc: result.acc == null ? null : Math.round(result.acc * 1000) / 1000,
          m: result.m,
          mode: current.opts.mode,
          pday: current.opts.pday || null,
        });
        result.score === 100 || info.isRecord ? KMP.sound.record() : KMP.sound.finish();
        feedback(result, info);
      },
    };
    try {
      ex.run(stage, ctx);
    } catch (e) {
      console.error(e);
      stage.innerHTML = `<p class="pad">Ocorreu um erro neste exercício. Tenta novamente.</p>`;
    }
  };

  /* ---------- 4. Feedback ---------- */
  const feedback = (res, info) => {
    const { ex, opts } = current;
    const s = info.session;
    const list = D.sessionsOf(ex.id);
    const prev = list.length > 1 ? list[list.length - 2] : null;
    const diff = prev ? s.score - prev.score : null;
    const guided = opts.mode === 'guided';
    const hasNext = guided && opts.pos < opts.queue.length - 1;
    const recVal = D.recVal(ex.id, s);
    const C = 2 * Math.PI * 52;
    const chart = res.chart
      ? `<div class="card"><div class="card-t">${res.chart.label}</div>${KMP.chart.line(res.chart.values, { invert: res.chart.invert, color: 'var(--green)' })}</div>`
      : list.length > 1
      ? `<div class="card"><div class="card-t">Evolução da pontuação</div>${KMP.chart.line(list.slice(-15).map((x) => x.score), { min: 0, max: 100, color: 'var(--green)' })}</div>`
      : '';
    el.innerHTML = `${header(ex.name)}
      <div class="run-body scroll">
        <div class="fb">
          <div class="fb-dial">
            <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="dial-bg"/><circle cx="60" cy="60" r="52" class="dial-fg" style="stroke:${color(s.score)};stroke-dasharray:${C};stroke-dashoffset:${C}" data-off="${C * (1 - s.score / 100)}"/></svg>
            <div class="fb-score"><b class="mono" data-count="${s.score}">0</b><span>pontos</span></div>
          </div>
          <div class="fb-label" style="color:${color(s.score)}">${label(s.score)}</div>
          ${info.isRecord ? `<div class="badge-pb">★ NOVO RECORDE PESSOAL · ${D.fmtRec(ex.id, recVal)}</div>` : ''}
          ${info.first ? `<div class="badge-first">Primeira sessão deste exercício</div>` : ''}
          ${diff != null ? `<div class="fb-diff ${diff >= 0 ? 'up' : 'down'}">${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)} pontos em relação à sessão anterior</div>` : ''}
          <div class="card fb-lines">${res.lines.map((l) => `<div class="kv"><span>${l[0]}</span><b>${l[1]}</b></div>`).join('')}
            <div class="kv"><span>${ex.record.label} (recorde)</span><b class="pb">${D.fmtRec(ex.id, D.best(ex.id))}</b></div>
            <div class="kv"><span>Nível</span><b>${KMP.LEVELS[s.level]}</b></div>
          </div>
          ${res.extraHtml || ''}
          ${info.levelChange > 0 ? `<div class="note up">⬆ Subiste para o nível <b>${KMP.LEVELS[D.levelOf(ex.id)]}</b> neste exercício.</div>` : ''}
          ${info.levelChange < 0 ? `<div class="note">O nível foi ajustado para <b>${KMP.LEVELS[D.levelOf(ex.id)]}</b> para consolidares a base.</div>` : ''}
          ${info.prog && info.prog.dayDone ? `<div class="note up">✓ Dia ${info.prog.d} do programa concluído!</div>` : ''}
          ${info.chal ? `<div class="note up">⭐ Desafio do dia concluído!</div>` : ''}
          ${info.newAch.map((a) => `<div class="note ach">${a.icon} Conquista desbloqueada: <b>${a.name}</b></div>`).join('')}
          ${chart}
          <div class="tip">${KMP.icon('flag')}<p>${res.tip || ''}</p></div>
        </div>
      </div>
      <div class="run-foot">
        <button class="btn ghost again-btn">Repetir</button>
        ${hasNext ? '<button class="btn primary big next-btn">Próximo exercício</button>' : `<button class="btn primary big done-btn">${guided ? 'Concluir treino' : 'Concluir'}</button>`}
      </div>`;
    bindExit(false);
    // animações
    requestAnimationFrame(() => {
      const fg = el.querySelector('.dial-fg');
      if (fg) fg.style.strokeDashoffset = fg.dataset.off;
      const num = el.querySelector('[data-count]');
      const target = Number(num.dataset.count);
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min((t - t0) / 900, 1);
        num.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1 && R.open) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    el.querySelector('.again-btn').addEventListener('click', () => {
      current.opts.level = current.level;
      intro();
    });
    const nx = el.querySelector('.next-btn');
    if (nx) nx.addEventListener('click', nextInQueue);
    const dn = el.querySelector('.done-btn');
    if (dn)
      dn.addEventListener('click', () => {
        R.close();
        if (guided && KMP.program.isDone(opts.pday)) KMP.toast(`Dia ${opts.pday} concluído. Bom trabalho, piloto!`, 'ok');
      });
  };

  const nextInQueue = () => {
    const o = current.opts;
    const pos = o.pos + 1;
    if (pos >= o.queue.length) return R.close();
    current = { ex: KMP.EX[o.queue[pos]], opts: Object.assign({}, o, { pos, level: null }) };
    intro();
  };
})();
