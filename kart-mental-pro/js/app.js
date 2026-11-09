/* KART MENTAL PRO — arranque, navegação e ações. */
(function () {
  'use strict';
  const KMP = window.KMP;
  const U = KMP.u;
  const P = KMP.program;
  const V = KMP.views;
  const st = () => KMP.store.state;

  const TABS = [
    ['#/', 'home', 'Início'],
    ['#/programa', 'calendar', 'Programa'],
    ['#/exercicios', 'dumbbell', 'Exercícios'],
    ['#/stats', 'chart', 'Estatísticas'],
    ['#/perfil', 'user', 'Perfil'],
  ];
  const ROUTES = {
    '': 'home',
    programa: 'programa',
    dia: 'programa',
    exercicios: 'exercicios',
    circuitos: 'exercicios',
    stats: 'stats',
    historico: 'stats',
    conquistas: 'stats',
    perfil: 'perfil',
    pista: 'programa',
  };

  const app = (KMP.app = {});
  let main;
  let lastRoute = '';

  const parse = () => {
    const h = (location.hash || '#/').replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    return { name: parts[0] || '', params: parts.slice(1) };
  };

  app.render = () => {
    const r = parse();
    const key = r.name in ROUTES ? r.name : '';
    const view = V[key === '' ? 'home' : key];
    const route = location.hash;
    const html = view(r.params);
    main.innerHTML = html;
    if (route !== lastRoute) {
      window.scrollTo(0, 0);
      main.classList.remove('enter');
      void main.offsetWidth;
      main.classList.add('enter');
    }
    lastRoute = route;
    const tab = ROUTES[key];
    U.$$('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === tab));
  };

  const go = (hash) => {
    if (location.hash === hash) app.render();
    else location.hash = hash;
  };

  /* ---------- Ações (cliques) ---------- */
  const actions = {
    'start-program': () => {
      P.start(U.ymd());
      KMP.toast('Programa de 21 dias iniciado. Boa sorte, piloto!', 'ok');
      KMP.runner.guided(1);
    },
    'start-monday': () => {
      const d = new Date();
      const add = (8 - d.getDay()) % 7 || 7;
      P.start(U.addDays(U.ymd(), add));
      KMP.toast('O programa começa na segunda-feira, ' + U.fmtDate(st().program.start) + '.', 'ok');
      app.render();
    },
    'restart-program': async () => {
      const ok = await KMP.confirm('Reiniciar o programa de 21 dias a partir de hoje? O histórico, as estatísticas e os recordes mantêm-se.', 'Reiniciar', true);
      if (!ok) return;
      P.start(U.ymd());
      KMP.toast('Programa reiniciado.', 'ok');
      go('#/programa');
    },
    'guided-today': () => {
      if (!P.active()) return actions['start-program']();
      const t = P.todayIndex();
      if (t < 1) return KMP.toast('O programa ainda não começou.');
      if (t > 21) return go('#/programa');
      const day = P.day(t);
      if (day.kind === 'rest') return go('#/dia/' + t);
      KMP.runner.guided(t);
    },
    'finish-rest': (b) => {
      const d = Number(b.dataset.d);
      const note = (U.$('#an-note') || {}).value || '';
      const first = P.completeRest(d, note);
      KMP.ach.check();
      KMP.toast(first ? 'Análise concluída. Bom descanso!' : 'Notas guardadas.', 'ok');
      go('#/programa');
    },
    'save-track': (b) => {
      const d = Number(b.dataset.d);
      const feel = U.$$('#tk-feel .on').length;
      const date = U.$('#tk-date').value || U.ymd();
      const entry = {
        id: U.uid(),
        t: Date.now(),
        date,
        circuit: U.$('#tk-circ').value.trim(),
        laps: Number(U.$('#tk-laps').value) || null,
        best: U.$('#tk-best').value.trim(),
        feel: feel || null,
        notes: U.$('#tk-notes').value.trim(),
      };
      st().track.push(entry);
      KMP.store.save();
      if (d) P.completeTrack(d);
      else {
        // Se hoje for sábado do programa, conta como dia de revisão/pista.
        const t = P.active() ? P.todayIndex() : 0;
        if (t >= 1 && t <= 21 && P.day(t).kind === 'review' && date === U.ymd()) P.completeTrack(t);
      }
      KMP.ach.check().forEach((a) => KMP.toast(`${a.icon} Conquista: ${a.name}`, 'ok'));
      KMP.toast('Treino de pista guardado.', 'ok');
      go(d ? '#/dia/' + d : '#/historico');
    },
    'stat-ex': (b) => {
      V.__setStatEx(Number(b.dataset.id));
      const y = window.scrollY;
      app.render();
      window.scrollTo(0, y);
    },
    export: () => {
      const blob = new Blob([KMP.store.export()], { type: 'application/json' });
      const name = 'kart-mental-pro-' + U.ymd() + '.json';
      const file = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'Cópia de segurança KART MENTAL PRO' }).catch(() => {});
      } else download(blob, name);
    },
    ics: () => {
      const [hh, mm] = st().settings.reminder.time.split(':');
      const d = U.ymd().replace(/-/g, '');
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//KART MENTAL PRO//PT',
        'BEGIN:VEVENT',
        'UID:kmp-' + U.uid() + '@kartmentalpro',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        `DTSTART:${d}T${hh}${mm}00`,
        'DURATION:PT15M',
        'RRULE:FREQ=DAILY',
        'SUMMARY:🏎️ Treino mental — KART MENTAL PRO',
        'DESCRIPTION:Hora do teu treino mental de karting (15 minutos).',
        'BEGIN:VALARM',
        'TRIGGER:PT0M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Treino mental de karting',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');
      download(new Blob([ics], { type: 'text/calendar' }), 'lembrete-kart-mental-pro.ics');
    },
    wipe: async () => {
      const ok = await KMP.confirm('Apagar todos os dados (sessões, recordes, programa, circuitos)? Esta ação não pode ser desfeita.', 'Apagar tudo', true);
      if (!ok) return;
      KMP.store.reset();
      KMP.toast('Dados apagados.');
      go('#/');
    },
    'del-circ': async (b) => {
      const ok = await KMP.confirm('Apagar este circuito?', 'Apagar', true);
      if (!ok) return;
      st().circuits = st().circuits.filter((c) => c.id !== b.dataset.id);
      KMP.store.save();
      app.render();
    },
    'ce-s': (b) => {
      V._editor.addS(Number(b.dataset.l));
      V._refreshEditor();
    },
    'ce-c': () => {
      V._editor.addC();
      V._refreshEditor();
    },
    'ce-zone': () => {
      if (!V._editor.zone()) KMP.toast('Adiciona primeiro uma reta.');
      V._refreshEditor();
    },
    'ce-undo': () => {
      V._editor.undo();
      V._refreshEditor();
    },
    'ce-clear': () => {
      V._editor.clear();
      V._refreshEditor();
    },
    'ce-save': () => {
      const d = V._editor.draft;
      d.name = (U.$('#ce-name').value || '').trim();
      if (!d.name) return KMP.toast('Dá um nome ao circuito.', 'err');
      const corners = d.segs.filter((s) => s.t === 'C').length;
      if (corners < 3) return KMP.toast('O circuito precisa de pelo menos 3 curvas.', 'err');
      const clean = { id: d.id, name: d.name, segs: d.segs.map((s) => Object.assign({}, s)) };
      const list = st().circuits || (st().circuits = []);
      const i = list.findIndex((c) => c.id === clean.id);
      if (i >= 0) list[i] = clean;
      else list.push(clean);
      KMP.store.save();
      KMP.ach.check().forEach((a) => KMP.toast(`${a.icon} Conquista: ${a.name}`, 'ok'));
      V._editor.reset();
      KMP.toast('Circuito guardado.', 'ok');
      go('#/circuitos');
    },
  };

  const download = (blob, name) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  };

  /* ---------- Lembretes ---------- */
  const checkReminder = () => {
    const r = st().settings.reminder;
    if (!r.on) return;
    const today = U.ymd();
    if (st().settings.lastReminder === today) return;
    const now = new Date();
    const [hh, mm] = r.time.split(':').map(Number);
    if (now.getHours() * 60 + now.getMinutes() < hh * 60 + mm) return;
    if (KMP.data.sessionsOn(today).length) return;
    st().settings.lastReminder = today;
    KMP.store.save();
    const msg = 'Ainda não treinaste hoje. 15 minutos de treino mental fazem a diferença na pista!';
    if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((reg) => reg.showNotification('KART MENTAL PRO', { body: msg, icon: 'icons/icon-192.png', tag: 'kmp-daily' })).catch(() => KMP.toast(msg));
    } else KMP.toast('🏎️ ' + msg);
  };

  /* ---------- Boas-vindas ---------- */
  const onboarding = () => {
    const m = KMP.modal(
      `<div class="onb"><div class="logo big"><span class="logo-k">KART</span><span class="logo-m">MENTAL</span><span class="logo-p">PRO</span></div>
      <p class="muted">Preparação mental e cognitiva para pilotos de karting: 12 exercícios, programa de 21 dias e estatísticas da tua evolução.</p>
      <label class="field"><span>Como te chamas? (nome ou alcunha)</span><input class="input" id="onb-name" maxlength="24" placeholder="Piloto" autocomplete="nickname"></label>
      <div class="onb-prof"><div><span>Modalidade</span><b>Karting de aluguer</b></div><div><span>Frequência</span><b>1 a 2 vezes por semana</b></div><div><span>Nível</span><b>Já participa em corridas</b></div><div><span>Objetivo</span><b>Todas as capacidades mentais</b></div></div>
      <p class="muted small">Podes alterar o perfil a qualquer momento em «Perfil».</p>
      <button class="btn primary big full" id="onb-go">Começar programa hoje</button>
      <button class="btn ghost full mt" id="onb-later">Explorar primeiro</button></div>`,
      { locked: true }
    );
    const save = () => {
      const n = U.$('#onb-name').value.trim();
      if (n) st().profile.name = n;
      st().settings.onboarded = true;
      KMP.store.save();
      m.close();
    };
    U.$('#onb-go').addEventListener('click', () => {
      save();
      P.start(U.ymd());
      app.render();
    });
    U.$('#onb-later').addEventListener('click', () => {
      save();
      app.render();
    });
  };

  /* ---------- Arranque ---------- */
  const init = () => {
    KMP.store.load();
    document.body.insertAdjacentHTML(
      'beforeend',
      `<main id="main" class="main"></main>
      <nav class="tabbar" aria-label="Navegação principal">${TABS.map((t) => `<button class="tab" data-go="${t[0]}" data-tab="${ROUTES[t[0].replace('#/', '')] || 'home'}">${KMP.icon(t[1])}<span>${t[2]}</span></button>`).join('')}</nav>`
    );
    main = U.$('#main');

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-go],[data-ex],[data-guided],[data-act]');
      if (!t || t.disabled) return;
      if (t.closest('#run')) return;
      if (t.dataset.act && actions[t.dataset.act]) return actions[t.dataset.act](t);
      if (t.dataset.go) return go(t.dataset.go);
      if (t.dataset.guided) {
        const d = Number(t.dataset.guided);
        return KMP.runner.guided(d);
      }
      if (t.dataset.ex) {
        const opts = t.dataset.pday ? { mode: 'guided', queue: [Number(t.dataset.ex)], pos: 0, pday: Number(t.dataset.pday) } : { mode: 'free' };
        return KMP.runner.start(Number(t.dataset.ex), opts);
      }
    });
    // Estrelas (avaliação)
    document.addEventListener('click', (e) => {
      const b = e.target.closest('#tk-feel button');
      if (!b) return;
      const v = Number(b.dataset.v);
      U.$$('#tk-feel button').forEach((x) => x.classList.toggle('on', Number(x.dataset.v) <= v));
    });
    // Seletores do editor de circuitos
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ce] button');
      if (!b) return;
      const g = b.parentElement;
      U.$$('button', g).forEach((x) => x.classList.toggle('on', x === b));
      V._editor.set(g.dataset.ce, b.dataset.v);
    });
    document.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset.prof === 'name') {
        st().profile.name = t.value.trim() || 'Piloto';
        KMP.store.save();
      }
      if (t.id === 'ce-name' && V._editor.draft) V._editor.draft.name = t.value;
    });
    document.addEventListener('change', async (e) => {
      const t = e.target;
      if (t.dataset.prof && t.dataset.prof !== 'name') {
        st().profile[t.dataset.prof] = t.value;
        KMP.store.save();
        app.render();
      }
      if (t.dataset.set) {
        const k = t.dataset.set;
        if (k === 'reminder') {
          st().settings.reminder.on = t.checked;
          if (t.checked && 'Notification' in window && Notification.permission === 'default') {
            try {
              await Notification.requestPermission();
            } catch (er) {}
          }
        } else st().settings[k] = t.checked;
        KMP.store.save();
        app.render();
      }
      if (t.dataset.actIn === 'rem-time') {
        st().settings.reminder.time = t.value || '19:00';
        st().settings.lastReminder = null;
        KMP.store.save();
      }
      if (t.dataset.actIn === 'import' && t.files[0]) {
        try {
          KMP.store.import(await t.files[0].text());
          KMP.toast('Dados importados.', 'ok');
          go('#/');
        } catch (er) {
          KMP.toast('Ficheiro inválido.', 'err');
        }
      }
    });

    window.addEventListener('hashchange', () => {
      if (KMP.runner.open) KMP.runner.close();
      app.render();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (!KMP.runner.open) app.render();
        checkReminder();
      }
    });

    app.render();
    if (!st().settings.onboarded) onboarding();
    setTimeout(checkReminder, 1500);

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
