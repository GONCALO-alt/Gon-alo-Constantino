// Arranque do jogo: cena 3D, ciclo principal, entrada do jogador, menus e ecrãs de início/fim de dia.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CFG, VEHICLES, CITY_NAME } from './config.js';
import { esc, eur, hhmm, dur, weekday, kmStr } from './util.js';
import { RoadNetwork } from './world/roads.js';
import { City } from './world/city.js';
import { Environment, WEATHERS } from './world/sky.js';
import { Traffic } from './world/traffic.js';
import { Pedestrians } from './world/pedestrians.js';
import { shared } from './world/materials.js';
import { PlayerCar } from './car/vehicle.js';
import { Autopilot } from './car/autopilot.js';
import { PaxActor } from './game/paxactor.js';
import { Sound } from './audio.js';
import { Game } from './game/game.js';
import { HUD } from './ui/hud.js';
import { Phone } from './ui/phone.js';
import { MapRenderer } from './ui/mapdraw.js';
import { avatar } from './game/passengers.js';
import { makeObjectives } from './game/economy.js';
import { Radio, STATIONS } from './radio.js';
import { pickupDemand } from './game/economy.js';
import { eventStatus } from './game/events.js';

const $ = (id) => document.getElementById(id);
const setLoad = (t) => { const e = $('loadTxt'); if (e) e.textContent = t; };
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

function savedQuality() {
  try { const s = JSON.parse(localStorage.getItem(CFG.SAVE_KEY) || '{}'); return s.settings?.quality || 'auto'; } catch { return 'auto'; }
}
function detectQuality() {
  const q = savedQuality(); if (q !== 'auto') return q;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || matchMedia('(pointer: coarse)').matches;
  return mobile ? 'med' : 'high';
}

async function boot() {
  const Q = detectQuality();
  const canvas = $('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: Q !== 'low', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q === 'high' ? 2 : Q === 'med' ? 1.5 : 1));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = Q !== 'low'; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(innerWidth < innerHeight ? 78 : 66, innerWidth / innerHeight, 0.03, 2200);

  setLoad('A desenhar as ruas de Porto Azul...'); await nextFrame();
  const net = new RoadNetwork([7 * CFG.GRID + 7]);
  const city = new City(scene, net, Q);
  setLoad('A acender o céu...'); await nextFrame();
  const env = new Environment(renderer, scene, Q);
  setLoad('A pôr o trânsito a circular...'); await nextFrame();
  const traffic = new Traffic(scene, net, Q === 'high' ? 80 : Q === 'med' ? 56 : 32, Q === 'low' ? 3 : 6);
  const peds = new Pedestrians(scene, city, Q === 'high' ? 90 : Q === 'med' ? 55 : 30);
  const car = new PlayerCar(scene, camera, Q);
  car.build(VEHICLES.compacto);
  const ap = new Autopilot(net); ap.traffic = traffic;
  const pax = new PaxActor(scene, car), pax2 = new PaxActor(scene, car);
  const sound = new Sound();
  const radio = new Radio(sound);
  const hud = new HUD();
  const world = { scene, net, city, env, traffic, peds, car, ap, pax, pax2, sound, radio, jolt: (k) => { car.sway.z += 0.07 * k; shake = 0.25; } };
  const game = new Game(world, hud);
  hud.getTime = () => (game.state ? game.state.time : 0);
  radio.game = game;
  traffic.onHorn = (pos, bus) => { if (mode === 'play') sound.horn3d(pos.distanceTo(ap.pos), bus); };
  game.mapPins = () => {
    const st = game.state; const pins = [];
    const r = st?.ride;
    if (r) {
      const P = city.locations[r.pickup], D = city.locations[r.dest];
      if (r.phase === 'toPickup' || r.phase === 'waiting') pins.push({ x: P.pos.x, z: P.pos.z, color: '#22c55e', label: r.pax.first });
      pins.push({ x: D.pos.x, z: D.pos.z, color: '#ffffff', label: '' });
    }
    if (game.serviceTrip) pins.push({ x: game.serviceTrip.pos.x, z: game.serviceTrip.pos.z, color: '#ffb020', label: '⛽' });
    if (r && r.pool && r.pool.leg !== 'done') { const L = city.locations[r.pool.leg === 'wait' ? r.pool.pickup : r.pool.dest]; pins.push({ x: L.pos.x, z: L.pos.z, color: r.pool.leg === 'wait' ? '#22c55e' : '#c9b6ff', label: r.pool.pax.first }); }
    for (const e of st?.today?.events || []) {
      const st2 = eventStatus(e, st.time); if (st2 === 'terminou') continue;
      const L = city.locations.find((l) => l.district === e.venue && l.kind === 'poi'); if (L) pins.push({ x: L.pos.x, z: L.pos.z, color: st2.startsWith('a terminar') ? '#ff5a5a' : '#ff9f1a', label: e.icon });
    }
    for (const id of st?.today?.works || []) { const e = net.edges[id]; const v = net.edgePoint(e, e.len / 2, 0, new THREE.Vector3()); pins.push({ x: v.x, z: v.z, color: '#d42a20', label: '🚧' }); }
    return pins;
  };
  const map = new MapRenderer(city);
  const phone = new Phone(game, map);

  // pós-processamento (brilho das luzes) só em qualidade alta
  let composer = null;
  if (Q === 'high') {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.45, 0.5, 0.86));
    composer.addPass(new OutputPass());
  }

  // ---------- entrada ----------
  let mode = 'menu', shake = 0, drag = null, lastTap = 0, intro = 0;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; sound.init(); if (phone.open && innerWidth < 700) { phone.hide(); drag = null; return; } const now = performance.now(); if (now - lastTap < 300) car.recenter(); lastTap = now; });
  addEventListener('pointermove', (e) => { if (!drag || e.pointerId !== drag.id) return; const k = 0.0055 * (66 / camera.fov); car.look((e.clientX - drag.x) * k, (e.clientY - drag.y) * k); drag.x = e.clientX; drag.y = e.clientY; });
  addEventListener('pointerup', () => { drag = null; });
  addEventListener('pointercancel', () => { drag = null; });
  canvas.addEventListener('wheel', (e) => car.look(e.deltaX * 0.002, 0), { passive: true });
  addEventListener('keydown', (e) => {
    sound.init();
    if (mode !== 'play') return;
    const k = e.key.toLowerCase();
    if (k === 'escape') { if (phone.open) phone.hide(); else togglePause(); }
    else if (k === 'p' || k === 'tab') { e.preventDefault(); phone.toggle(); }
    else if (k === ' ') { e.preventDefault(); hud._actFn && hud._actFn(); }
    else if (k >= '1' && k <= '4') hud.choose(+k - 1);
    else if (k === 'o') { game.state.online ? game.goOffline() : game.goOnline(); }
    else if (k === 'c') car.recenter();
    else if (k === 'r') cycleRadio();
    else if (k === 'arrowleft') car.look(-0.25, 0); else if (k === 'arrowright') car.look(0.25, 0);
  });
  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.fov = innerWidth < innerHeight ? 78 : 66; camera.updateProjectionMatrix();
    if (composer) composer.setSize(innerWidth, innerHeight);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && game.state) game.save(); });
  addEventListener('beforeunload', () => { if (game.state && mode === 'play') game.save(); });
  function cycleRadio() { sound.init(); const st = radio.next(); hud.toast(st.icon, st.id === 'off' ? 'Rádio desligado' : `${st.name} · ${st.freq} FM`, st.desc || ''); }
  $('radioBtn').addEventListener('click', (e) => { e.stopPropagation(); cycleRadio(); });
  game.cycleRadio = cycleRadio;
  $('phoneBtn').addEventListener('click', (e) => { e.stopPropagation(); sound.init(); phone.toggle(); });
  $('btnPause').addEventListener('click', (e) => { e.stopPropagation(); togglePause(); });

  // ---------- menus ----------
  function togglePause() {
    if (hud.el.modal.classList.contains('hidden')) {
      game.paused = true;
      hud.modal(`<div class="icon">⏸️</div><h2>Pausa</h2><p>Dia ${game.state.day} · ${weekday(game.state.day)} · ${hhmm(game.state.time)}<br>Saldo: <b>${eur(game.state.balance)}</b></p>`, [
        { label: '▶ Continuar', cls: 'primary', fn: () => { game.paused = !game.state.dayActive; } },
        { label: '📊 Estatísticas', fn: () => { game.paused = !game.state.dayActive; phone.show('driver'); phone.tab = 'ganhos'; phone._dirty = true; phone.render(); } },
        { label: '⚙️ Definições', fn: () => { game.paused = !game.state.dayActive; phone.show('settings'); } },
        { label: '💾 Guardar e voltar ao menu', fn: () => { game.save(); location.reload(); } },
      ]);
    } else { hud.closeModal(); game.paused = !game.state.dayActive; }
  }
  function showMenu() {
    mode = 'menu';
    const has = Game.hasSave();
    let info = '';
    if (has) { try { const s = JSON.parse(localStorage.getItem(CFG.SAVE_KEY)); info = `Dia ${s.day} · ${eur(s.balance)} · ${s.stats.trips} viagens`; } catch { /* */ } }
    $('menu').innerHTML = `<div class="menu-card"><h1>Motorista<br><span>TVDE</span></h1>
      <div class="sub">Simulador de motorista em ${CITY_NAME}. Fica online, aceita viagens, conversa com os passageiros e gere o teu dia de trabalho. O carro conduz sozinho — tu tomas as decisões.</div>
      ${has ? `<button class="btn primary" id="mContinue">▶ Continuar <span class="meta">${esc(info)}</span></button>` : ''}
      <button class="btn ${has ? '' : 'primary'}" id="mNew">✨ Novo jogo</button>
      <button class="btn" id="mHelp">❓ Como jogar</button></div>`;
    $('menu').classList.remove('hidden');
    if (has) $('mContinue').onclick = () => { sound.init(); if (game.load()) startPlay(); };
    $('mNew').onclick = () => {
      sound.init();
      hud.modal(`<div class="icon">🚗</div><h2>Novo motorista</h2><p>Começas com <b>${eur(CFG.START_BALANCE)}</b> de saldo e um ${VEHICLES.compacto.name}.${has ? ' <br><span class="neg">O progresso atual será substituído.</span>' : ''}</p><input class="txt" id="nameIn" maxlength="24" placeholder="O teu nome" value="Gonçalo">`, [
        { label: 'Começar a trabalhar', cls: 'primary', fn: () => { const n = ($('nameIn')?.value || '').trim() || 'Motorista'; game.reset(); game.newGame(n); startPlay(true); } },
        { label: 'Cancelar', fn: () => {} },
      ]);
      setTimeout(() => $('nameIn')?.focus(), 50);
    };
    $('mHelp').onclick = () => hud.modal(`<div class="icon">❓</div><h2>Como jogar</h2><p style="font-size:14px">
      📱 Abre o <b>telemóvel</b> (botão em baixo à direita ou tecla P) e fica <b>online</b> na app RIDO Driver.<br><br>
      🔔 Vais receber <b>pedidos</b>: vê o passageiro, a avaliação, a distância e o valor. Tens 15 segundos para aceitar ou recusar.<br><br>
      🚗 O carro <b>conduz sozinho</b> até à recolha. Quando o passageiro entrar, toca em <b>Iniciar viagem</b>.<br><br>
      💬 Durante a viagem, os passageiros falam contigo e acontecem situações. As tuas <b>respostas e decisões</b> afetam a avaliação, as gorjetas e a reputação.<br><br>
      💶 No destino toca em <b>Terminar viagem</b> para receber. Gere o combustível, a limpeza e a manutenção na Garagem.<br><br>
      🕕 O dia começa às 06:00 e termina, no máximo, às 02:00. Podes terminar a sessão quando quiseres em Conta → Terminar sessão.<br><br>
      👀 Arrasta no ecrã para olhar à volta (olha para trás para veres o passageiro!).</p>`, [{ label: 'Percebi', cls: 'primary' }], { dismiss: true });
  }
  function startPlay(fresh = false) {
    $('menu').classList.add('hidden');
    hud.el.hud.classList.remove('hidden');
    sound.setEnabled(game.state.settings.sound); sound.voice = game.state.settings.voice;
    radio._ensure(); radio.set(game.state.settings.radio || 'off');
    game.begin();
    mode = 'play';
    if (!game.state.dayActive) showDayStart(fresh);
    else { intro = 1.6; car.targetYaw = 0; }
  }
  function showDayStart(fresh) {
    game.paused = true;
    const st = game.state; const w = WEATHERS[st.weather.type];
    const objs = makePreviewObjectives();
    hud.modal(`<div class="icon">🌅</div><h2>Dia ${st.day} · ${weekday(st.day)}</h2>
      <p>São <b>06:00</b> em ${CITY_NAME}. ${w.icon} Previsão: <b>${w.label}</b>.<br>Saldo: <b>${eur(st.balance)}</b> · Nível ${st.level} · ★ ${game.ratingAvg().toFixed(2)}</p>
      ${fresh ? '<p style="font-size:14px">💡 Abre o telemóvel e fica <b>online</b> para receber o primeiro pedido. Arrasta o ecrã para olhar à volta.</p>' : ''}
      <div class="card" style="background:rgba(255,255,255,0.04)"><h4 style="margin:0 0 6px;font-size:12px;color:var(--mut)">OBJETIVOS DO DIA</h4>${objs}</div>`, [
      { label: '🚗 Entrar no carro', cls: 'primary', fn: () => { game.startDay(); intro = 2.2; car.targetYaw = 0; game.paused = false; setTimeout(() => { if (!game.state.online) hud.toast('📱', 'Pronto para trabalhar?', 'Abre o telemóvel e toca em «Ficar online».'); }, 2600); } },
    ]);
  }
  function makePreviewObjectives() {
    // os objetivos reais são gerados no startDay com a mesma semente
    const st = game.state;
    return makeObjectives(st.level, st.day * 7 + st.level).map((o) => `<div class="kv"><span>🎯 ${esc(o.text)}</span><b class="pos">+${eur(o.reward)}</b></div>`).join('');
  }
  game.on('dayEnd', (s) => {
    phone.hide(); hud.closeDialog();
    const e = s.exp;
    hud.modal(`<div class="icon">🌙</div><h2>Resumo do dia ${s.day}</h2><p>${s.weekday} · terminaste às ${hhmm(s.endedAt)} · ${dur(s.minutes)} de trabalho</p>
      <div class="row"><span>Viagens</span><b>${s.trips}</b></div>
      <div class="row"><span>Tarifas (bruto)</span><b>${eur(s.gross)}</b></div>
      <div class="row"><span>Comissão da plataforma</span><b class="neg">${eur(-s.commission)}</b></div>
      <div class="row"><span>Dinheiro recebido</span><b class="pos">${eur(s.net)}</b></div>
      <div class="row"><span>Gorjetas</span><b class="pos">${eur(s.tips)}</b></div>
      <div class="row"><span>Bónus</span><b class="pos">${eur(s.bonus)}</b></div>
      <div class="row"><span>Despesas</span><b class="neg">${eur(-s.expenses)}</b></div>
      <div class="row" style="font-size:12.5px"><span>&nbsp;&nbsp;⛽ ${eur(e.fuel)} · 🔧 ${eur(e.maint)} · 🧽 ${eur(e.wash)} · 🚨 ${eur(e.fines)} · 📄 ${eur(e.fixed)} · 💶 ${eur(e.other)}</span></div>
      <div class="row"><span>Avaliação média</span><b>${s.rating ? '★ ' + s.rating.toFixed(2) : '—'}</b></div>
      <div class="row"><span>Distância · consumo</span><b>${s.km.toFixed(1).replace('.', ',')} km · ${eur(s.fuelCost)}</b></div>
      <div class="row"><span>Objetivos</span><b>${s.objectives.filter((o) => o.done).length}/${s.objectives.length}</b></div>
      <div class="row total"><span>Lucro do trabalho</span><b class="${s.profit >= 0 ? 'pos' : 'neg'}">${eur(s.profit)}</b></div>
      ${(s.personal || []).map(([d, v]) => `<div class="row"><span>🏠 ${esc(d)}</span><b class="neg">${eur(-v)}</b></div>`).join('')}
      <div class="row total"><span>Saldo do dia</span><b class="${s.profit - (s.personalTotal || 0) >= 0 ? 'pos' : 'neg'}">${eur(s.profit - (s.personalTotal || 0))}</b></div>
      <p class="muted" style="margin-top:8px">Saldo atual: <b>${eur(game.state.balance)}</b></p>`, [
      { label: '🌅 Começar novo dia (06:00)', cls: 'primary', fn: () => showDayStart(false) },
      { label: '💾 Guardar e sair', fn: () => location.reload() },
    ]);
  });
  game.on('service', () => {
    const q = game.serviceQuote(); const v = game.vehicle;
    hud.modal(`<div class="icon">⛽</div><h2>${esc(game.atStation ? game.atStation.name : 'Posto de abastecimento')}</h2><p>Preço hoje: <b>${q.fuel.price.toFixed(3).replace('.', ',')} €/${v.unit}</b><br>Saldo: <b>${eur(game.state.balance)}</b> · ${v.unit === 'kWh' ? 'Bateria' : 'Depósito'} ${Math.round(game.fuelPct())}% · Estado ${Math.round(game.state.condition)}% · Limpeza ${Math.round(game.state.clean)}%</p>`, [
      { label: `${v.unit === 'kWh' ? '🔌 Carregar' : '⛽ Abastecer'} — ${q.fuel.units.toFixed(1)} ${v.unit} · ${eur(q.fuel.cost)} <span class="meta">${q.fuel.min} min</span>`, cls: 'primary', fn: () => game.doService('fuel') },
      { label: `🧽 Lavagem completa — ${eur(q.wash.cost)} <span class="meta">${q.wash.min} min</span>`, fn: () => game.doService('wash') },
      { label: `🔧 Revisão — ${eur(q.maint.cost)} <span class="meta">${q.maint.min} min</span>`, fn: () => game.doService('maint') },
      { label: 'Sair', fn: () => {} },
    ], { dismiss: true });
  });
  game.on('request', () => { if (!phone.open) phone._reqShown = false; });

  // ---------- HUD ----------
  let hudT = 0, miniT = 0, screenT = 0, phoneT = 0, tickT = 0, frame = 0;
  const mini = $('minimap'), miniX = mini.getContext('2d');
  function updateHud(dt) {
    const st = game.state; if (!st) return;
    hudT -= dt; if (hudT > 0) return; hudT = 0.12;
    const w = WEATHERS[st.weather.type];
    hud.el.clock.innerHTML = `🕒 ${hhmm(st.time)} <span style="opacity:.6;font-weight:500">· ${weekday(st.day).slice(0, 3)} · Dia ${st.day}</span> ${w.icon}`;
    hud.el.status.className = 'pill' + (st.online ? ' on' : '');
    hud.el.status.innerHTML = `<span class="dot"></span>${st.ride ? (st.ride.phase === 'onTrip' ? 'Em viagem' : st.ride.phase === 'arrived' ? 'No destino' : 'Recolha') : st.online ? 'Online' : 'Offline'}`;
    hud.el.money.innerHTML = `💶 ${eur(st.balance)}`;
    const un = phone.unread() + (game.rides.req ? 1 : 0);
    hud.el.phoneBtn.innerHTML = `📱${un ? `<span class="badge">${un}</span>` : ''}`;
    // navegação
    const r = st.ride; const nt = ap.nextTurn();
    const navOn = nt && (r && (r.phase === 'toPickup' || r.phase === 'onTrip') || game.serviceTrip);
    if (navOn) {
      const arrow = nt.type === 'L' ? '↰' : nt.type === 'R' ? '↱' : nt.type === 'U' ? '↶' : '⬆';
      const dm = Math.round(nt.dist * CFG.DIST_SCALE / 10) * 10;
      const label = nt.type === 'F' ? (r && r.phase === 'toPickup' ? 'Recolha' : 'Destino') : nt.street ? city.streetOf(nt.street) : '';
      hud.el.nav.innerHTML = `<span class="arrow">${arrow}</span><span class="dist">${dm >= 1000 ? (dm / 1000).toFixed(1).replace('.', ',') + ' km' : dm + ' m'}</span><span class="street">${esc(label)}</span>`;
      hud.el.nav.classList.remove('hidden');
    } else hud.el.nav.classList.add('hidden');
    // ação contextual
    if (!st.dayActive) hud.setAction(null);
    else if (r && r.phase === 'boarded') hud.setAction('▶ Iniciar viagem', '', () => game.rides.startTrip());
    else if (r && r.phase === 'arrived') hud.setAction('🏁 Terminar viagem', '', () => game.rides.endTrip());
    else if (!st.online && !r && !game.skip && !phone.open) hud.setAction('🟢 Ficar online', 'blue', () => game.goOnline());
    else hud.setAction(null);
    // pedido compacto
    const q = game.rides.req;
    const rm = hud.el.reqMini;
    if (q && !phone.open) {
      if (rm.dataset.seed !== String(q.seed)) {
        rm.dataset.seed = q.seed;
        const P = city.locations[q.pickup], D = city.locations[q.dest];
        rm.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><img src="${avatar(q.pax)}" style="width:46px;height:46px;border-radius:50%"><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between"><b>${esc(q.pax.name)} · ★ ${q.pax.rating.toFixed(2)}</b><b style="font-size:18px">${eur(q.net)}</b></div>
          <div class="muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">📍 ${esc(P.name)} · ${Math.max(1, Math.round(q.pickMin))} min</div><div class="muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🏁 ${esc(D.name)} · ${kmStr(q.tripDist)} · ${Math.round(q.estMin)} min</div></div></div>
          ${q.pax.note ? `<div class="note" style="margin:8px 0 0">📝 ${esc(q.pax.note.text)}</div>` : ''}
          <div class="btnrow" style="margin-top:10px"><button class="btn small" id="rmNo" style="flex:1">Recusar</button><button class="btn small" id="rmMore" style="flex:1">📱 Detalhes</button><button class="btn small primary" id="rmYes" style="flex:2">Aceitar · <span id="rmT"></span>s</button></div>`;
        $('rmNo').onclick = (e) => { e.stopPropagation(); game.rides.reject(false); };
        $('rmYes').onclick = (e) => { e.stopPropagation(); game.rides.accept(); };
        $('rmMore').onclick = (e) => { e.stopPropagation(); phone.show('driver'); };
      }
      const t = $('rmT'); if (t) t.textContent = Math.ceil(q.timer);
      rm.classList.remove('hidden');
    } else { rm.classList.add('hidden'); rm.dataset.seed = ''; }
    mini.classList.toggle('hidden', !st.settings.minimap || phone.open && innerWidth < 700);
  }

  // ---------- sons da cidade ----------
  let ambT = 0, lastHour = -1, sirenT = 120;
  const nearest = (types, maxD) => { let best = Infinity; for (const b of city.blocks) if (types.includes(b.type)) { const d = Math.hypot(b.cx - ap.pos.x, b.cz - ap.pos.z); if (d < best) best = d; } return best <= maxD ? best : Infinity; };
  function updateAmbience(st, o) {
    if (!sound.ctx) return;
    const h = (st.time / 60) % 24, day = o.night < 0.5;
    const beachD = net.half - ap.pos.z, waves = Math.max(0, 1 - Math.abs(beachD) / 80) * (ap.pos.z > -net.half ? 1 : 0);
    const riverD = Math.min(Math.abs(ap.pos.x - city.river.x0), Math.abs(ap.pos.x - city.river.x1));
    const club = nearest(['N'], 120) < Infinity && (h >= 21 || h < 3) ? 1 - nearest(['N'], 120) / 120 : 0;
    let crowd = 0; for (const e of st.today.events || []) { const s2 = eventStatus(e, st.time); if (s2 === 'a decorrer' || s2.startsWith('a terminar')) { const L = city.locations.find((l) => l.district === e.venue && l.kind === 'poi'); if (L) crowd = Math.max(crowd, 1 - Math.hypot(L.pos.x - ap.pos.x, L.pos.z - ap.pos.z) / 220); } }
    let works = 0; for (const id of st.today.works || []) { const v = net.edgePoint(net.edges[id], 10, 3, new THREE.Vector3()); works = Math.max(works, 1 - v.distanceTo(ap.pos) / 90); }
    sound.ambience({ waves: Math.max(waves, Math.max(0, 1 - riverD / 60) * 0.5), crowd: Math.max(0, crowd), works: day && h > 7 && h < 19 ? Math.max(0, works) : 0, club: Math.max(0, club) });
    if (day && waves > 0.3 && Math.random() < 0.08) sound.seagull();
    if (day && nearest(['P', 'V', 'R'], 70) < Infinity && Math.random() < 0.06) sound.birds();
    const hr = Math.floor(st.time / 60);
    if (hr !== lastHour) { if (lastHour >= 0 && nearest(['V'], 320) < Infinity && h >= 8 && h <= 22) sound.bells(hr % 12 || 12); lastHour = hr; }
    sirenT -= 0.5 * st.settings.speed; if (sirenT <= 0) { sirenT = 160 + Math.random() * 260; if (nearest(['X'], 400) < Infinity || Math.random() < 0.5) sound.siren(); }
    // ondulação da bandeira do castelo
    if (city.flag) city.flag.rotation.y = Math.sin(performance.now() * 0.003) * 0.3;
  }

  // ---------- ciclo principal ----------
  let last = performance.now(), menuT = 8.5 * 60, indicatorT = 0;
  const camW = new THREE.Vector3();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now; frame++;
    shared.uTime.value += dt;
    if (mode === 'menu') {
      menuT += dt * 4;
      const a = now * 0.00004;
      camera.parent && camera.parent !== scene && (scene.add(camera));
      camera.position.set(Math.cos(a) * 330, 120, Math.sin(a) * 330); camera.lookAt(0, 10, 0);
      net.time += dt; traffic.buildOcc(null); traffic.update(dt); peds.update(dt); city.updateLights(dt); city.update(dt);
      const o = env.update(dt * 3, 19.4 * 60 + Math.sin(now * 0.00005) * 40, WEATHERS.limpo, camera.position, new THREE.Vector3());
      city.setNight(o.night, 0); traffic.night = o.night;
      if (composer) composer.render(); else renderer.render(scene, camera);
      return;
    }
    if (camera.parent !== car.headPitch) { car.headPitch.add(camera); camera.position.set(0, 0, 0); camera.rotation.set(0, 0, 0); }
    const st = game.state;
    const mul = window.__simMul || 1;
    game.tick(dt * mul);
    const sim = game.paused || !st.dayActive ? 0 : dt * mul * st.settings.speed;
    const steps = Math.max(1, Math.ceil(sim / 0.08));
    for (let i = 0; i < steps; i++) {
      const s = sim / steps;
      net.time += s;
      traffic.buildOcc(ap); ap.update(s); traffic.update(s); pax.update(s); pax2.update(s);
    }
    peds.update(sim);
    car.root.position.copy(ap.pos); car.root.rotation.y = ap.heading; car.root.updateMatrixWorld(true);
    // intro: entrar no carro
    if (intro > 0) {
      intro = Math.max(0, intro - dt); const k = 1 - Math.pow(intro / 2.2, 2);
      const kk = Math.min(1, k);
      camera.position.set(-1.6 * (1 - kk), 0.3 * (1 - kk), 0.9 * (1 - kk)); camera.rotation.y = 0.9 * (1 - kk);
    } else if (shake > 0) { shake -= dt; camera.position.set((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0); } else { camera.position.set(0, 0, 0); camera.rotation.y = 0; }
    const wt = WEATHERS[st.weather.type];
    camera.getWorldPosition(camW);
    const o = env.update(game.paused ? dt * 0.2 : Math.max(dt, sim), st.time, wt, camW, ap.pos);
    city.setNight(o.night, env.state.rain); city.updateLights(dt); city.update(sim);
    traffic.night = o.night;
    car.update(dt, { speed: ap.v, yawRate: ap.yawRate, accel: ap.accel, night: o.night, rain: env.state.rain, fog: env.state.fog });
    sound.update(ap.v, env.state.rain * 0.6, game.vehicle.energy === 'Elétrico');
    radio.update(dt);
    traffic.focus.copy(ap.pos);
    { const hh = (st.time / 60) % 24; traffic.setDensity(hh < 6 ? 0.3 : hh < 7 ? 0.55 : hh < 9.5 ? 1 : hh < 16.5 ? 0.7 : hh < 20 ? 1 : hh < 23 ? 0.6 : 0.4); }
    ambT -= dt; if (ambT <= 0) { ambT = 0.5; updateAmbience(st, o); }
    // piscas
    const nt = ap.path ? ap.nextTurn() : null;
    const ind = nt && (nt.type === 'L' || nt.type === 'R') && nt.dist < 30 ? nt.type : null;
    if (ind) { indicatorT -= dt; if (indicatorT <= 0) { indicatorT = 0.76; sound.tick(); } }
    // ecrãs do carro
    screenT -= dt; if (screenT <= 0) {
      screenT = 0.22;
      const v = game.vehicle;
      car.drawCluster({ speed: ap.v * 3.6, fuelPct: game.fuelPct(), energyIcon: v.unit === 'kWh' ? '🔋' : '⛽', odo: `${Math.round(st.odo).toLocaleString('pt-PT')} km`, temp: `${Math.round(14 + 8 * Math.sin((st.time / 60 - 9) / 24 * Math.PI * 2) - env.state.rain * 3)} °C`,
        clock: hhmm(st.time), gear: ap.v > 0.2 ? 'D' : 'P', online: st.online, indicator: ind, warn: game.fuelPct() < 12 ? '⚠ COMBUSTÍVEL BAIXO' : st.condition < 35 ? '⚠ REVISÃO NECESSÁRIA' : '' });
      const sx = car.screenX; const W = 512, H = 320;
      map.draw(sx, W, H, { cx: ap.pos.x, cz: ap.pos.z, zoom: 1.5, rot: -ap.heading, path: ap.path, pathFrom: ap.d, car: { x: ap.pos.x, z: ap.pos.z, h: ap.heading }, pins: game.mapPins() });
      sx.fillStyle = 'rgba(8,10,14,0.85)'; sx.fillRect(0, 0, W, 52);
      sx.fillStyle = '#fff'; sx.font = 'bold 26px Arial'; sx.textAlign = 'left';
      const hn = hud.el.nav.classList.contains('hidden') ? `${hhmm(st.time)}  ${radio.station !== 'off' ? '📻 ' + radio.info().name : WEATHERS[st.weather.type].label}` : hud.el.nav.textContent.replace(/(\d)([A-Za-zÀ-ú])/, '$1  $2');
      sx.fillText(hn.slice(0, 34), 16, 35);
      car.screenT.needsUpdate = true;
    }
    phoneT -= dt; if (phoneT <= 0) {
      phoneT = 0.5; const r = st.ride; const T = st.today;
      car.drawPhone({ online: st.online, earn: eur(T.net + T.tips + T.bonus), clock: hhmm(st.time), status: game.rides.req ? 'NOVO PEDIDO!' : r ? ({ toPickup: 'A caminho da recolha', waiting: 'À espera', boarded: 'Iniciar viagem', onTrip: 'Em viagem', arrived: 'Terminar viagem' })[r.phase] : '', flash: !!game.rides.req });
    }
    // minimapa
    miniT -= dt; if (miniT <= 0 && !mini.classList.contains('hidden')) {
      miniT = 0.15;
      const dpr = Math.min(2, devicePixelRatio || 1); const w = mini.clientWidth;
      if (mini.width !== Math.round(w * dpr)) { mini.width = mini.height = Math.round(w * dpr); }
      miniX.setTransform(dpr, 0, 0, dpr, 0, 0);
      map.draw(miniX, w, w, { cx: ap.pos.x, cz: ap.pos.z, zoom: w / 150 * 0.9, rot: -ap.heading, path: ap.path, pathFrom: ap.d, car: { x: ap.pos.x, z: ap.pos.z, h: ap.heading }, pins: game.mapPins(), heat: !st.ride && st.online ? { h: Math.floor(st.time / 60) % 24, wk: game.isWeekend() } : null });
    }
    updateHud(dt);
    tickT -= dt; phone.tick(dt);
    car.renderMirror(renderer, scene, frame);
    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  $('loading').classList.add('hidden');
  showMenu();
  requestAnimationFrame(loop);
  window.__game = game; window.__world = world;
}

boot().catch((e) => {
  console.error(e);
  const l = document.getElementById('loading');
  if (l) l.innerHTML = `<div class="logo">Ups!</div><div>Não foi possível iniciar o jogo: ${esc(e.message || e)}</div><div class="muted">Este jogo precisa de WebGL. Experimenta outro navegador.</div>`;
});
