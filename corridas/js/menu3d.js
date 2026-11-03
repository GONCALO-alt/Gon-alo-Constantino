/* Montra 3D do menu principal: o carro a rodar num estúdio com luzes e chão brilhante. */
'use strict';

const MENU3D = (() => {
  let rd = null, scene, cam, car = null, raf = 0, cv = null, t0 = 0, cat = null, key = '', theme = 'studio';
  const drag = { on: false, x: 0, yaw: -0.33, pitch: 0, last: -1e9 };
  function garageDecor(env) {
    // oficina: chão de cimento, parede com painel de ferramentas, bancada e pneus empilhados
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#5d6168'; g.fillRect(0, 0, 256, 256); for (let k = 0; k < 2500; k++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},.06)`; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, 256, 3); g.fillRect(0, 0, 3, 256); g.fillStyle = '#e5c100'; g.fillRect(0, 120, 256, 10);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); if ('encoding' in t) t.encoding = THREE.sRGBEncoding;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: 0.1, envMap: env })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const wallM = new THREE.MeshStandardMaterial({ color: 0xd8dade, roughness: 0.9 });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), wallM); back.position.set(0, 4, -5.5); back.receiveShadow = true; scene.add(back);
    const side = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), wallM); side.position.set(-6, 4, 0); side.rotation.y = Math.PI / 2; scene.add(side);
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.5), new THREE.MeshStandardMaterial({ color: 0xe10600 })); stripe.position.set(0, 1.4, -5.49); scene.add(stripe);
    // painel de ferramentas
    const pc = document.createElement('canvas'); pc.width = 512; pc.height = 256; const q = pc.getContext('2d');
    q.fillStyle = '#2b2f36'; q.fillRect(0, 0, 512, 256); q.fillStyle = '#3a3f48'; for (let y = 8; y < 256; y += 16) for (let x = 8; x < 512; x += 16) { q.beginPath(); q.arc(x, y, 2, 0, 7); q.fill(); }
    q.strokeStyle = '#c9ccd2'; q.lineWidth = 7; q.lineCap = 'round'; for (let k = 0; k < 11; k++) { const x = 30 + k * 44, l = 60 + (k % 4) * 22; q.beginPath(); q.moveTo(x, 40); q.lineTo(x, 40 + l); q.stroke(); q.beginPath(); q.arc(x, 40, 9, 0, 7); q.stroke(); }
    q.fillStyle = '#e10600'; for (let k = 0; k < 5; k++) q.fillRect(40 + k * 92, 190, 60, 36);
    const pt = new THREE.CanvasTexture(pc); if ('encoding' in pt) pt.encoding = THREE.sRGBEncoding;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.7 })); panel.position.set(-0.5, 2.6, -5.45); scene.add(panel);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.9, 0.8), new THREE.MeshStandardMaterial({ color: 0x8b1a14, roughness: 0.5, metalness: 0.3 })); bench.position.set(-0.5, 0.45, -5); bench.castShadow = bench.receiveShadow = true; scene.add(bench);
    const tyreM = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.85 });
    for (let k = 0; k < 4; k++) { const ty = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.14, 12, 28), tyreM); ty.rotation.x = Math.PI / 2; ty.position.set(3.6, 0.14 + k * 0.28, -4.4); ty.castShadow = true; scene.add(ty); }
    for (const x of [-3, 2]) { const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.25), new THREE.MeshBasicMaterial({ color: 0xffffff })); lamp.position.set(x, 6.5, -1); scene.add(lamp); }
  }
  function studio() {
    scene = new THREE.Scene();
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#05070b'); gr.addColorStop(0.55, '#141a24'); gr.addColorStop(1, '#0a0d12'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    for (const x of [90, 256, 422]) { const lg = g.createRadialGradient(x, 40, 2, x, 40, 70); lg.addColorStop(0, 'rgba(255,255,255,.9)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.fillRect(x - 70, 0, 140, 110); }
    const bg = new THREE.CanvasTexture(c); if ('encoding' in bg) bg.encoding = THREE.sRGBEncoding; bg.mapping = THREE.EquirectangularReflectionMapping;
    const pm = new THREE.PMREMGenerator(rd), es = new THREE.Scene(); es.background = bg; const env = pm.fromScene(es, 0.02).texture; CARS3D.setEnv(env);
    const gar = theme === 'garage';
    scene.background = new THREE.Color(gar ? 0x1a1d22 : 0x07090d); scene.fog = new THREE.Fog(gar ? 0x1a1d22 : 0x07090d, gar ? 12 : 9, gar ? 30 : 22);
    if (gar) { garageDecor(env); scene.add(new THREE.AmbientLight(0xffffff, 0.35)); }
    scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x15110d, 0.55));
    const key1 = new THREE.SpotLight(0xffffff, 2.2, 30, 0.55, 0.6); key1.position.set(3, 7, 4); key1.castShadow = true; key1.shadow.mapSize.set(1024, 1024); key1.shadow.bias = -0.0004; scene.add(key1); scene.add(key1.target);
    const rim = new THREE.DirectionalLight(0xff3b30, 0.9); rim.position.set(-5, 2, -4); scene.add(rim);
    const fill = new THREE.DirectionalLight(0x9cc7ff, 0.5); fill.position.set(-4, 3, 5); scene.add(fill);
    // chão: plataforma giratória escura e brilhante com anel de luz
    if (gar) { cam = new THREE.PerspectiveCamera(32, 1, 0.1, 60); return; }
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: 0x0c0f14, metalness: 0.6, roughness: 0.35, envMap: env }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.5, 0.08, 72), new THREE.MeshStandardMaterial({ color: 0x1a1e25, metalness: 0.8, roughness: 0.25, envMap: env })); plat.position.y = 0.04; plat.receiveShadow = true; scene.add(plat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.45, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: 0xe10600 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.085; scene.add(ring);
    cam = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  }
  function setCar(d) {
    const k = JSON.stringify([d.cat, d.c1, d.c2, d.num, d.helmet && { ...d.helmet, flagImg: !!d.helmet.flagImg }]);
    if (k === key && car) return; key = k;
    if (car) { scene.remove(car.group); car.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    if (!d.cat) { // só o capacete, grande
      cat = 'helmet'; const hm = CARS3D.helmetMesh(d.helmet, 0.5); hm.position.y = 0.9; car = { group: hm, L: 1 };
      car.group.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(car.group); return;
    }
    const C = catById(d.cat); cat = d.cat;
    car = CARS3D.make(d.cat, C, d.c1, d.c2, d.helmet, d.num, d.sponsor);
    car.group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    car.group.position.y = 0.08; scene.add(car.group);
    if (car.disp && car.disp.c) { const g = car.disp.c.getContext('2d'); g.fillStyle = '#0b0d10'; g.fillRect(0, 0, car.disp.c.width, car.disp.c.height); car.disp.t.needsUpdate = true; }
  }
  function size() {
    const w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight;
    rd.setSize(w, h, false); cam.aspect = w / Math.max(1, h); cam.updateProjectionMatrix();
  }
  function frame(now) {
    if (!rd) return;
    const t = (now - t0) / 1000, L = car ? car.L : 4;
    if (cat === 'helmet' && car) { // roda sozinho; com o dedo, gira para onde quiseres
      if (now - drag.last > 4000) drag.yaw += 0.006; car.group.rotation.y = drag.yaw; car.group.rotation.z = drag.pitch;
    } else if (car) car.group.rotation.y = t * 0.35;
    if (cat === 'helmet') { cam.position.set(2.6, 1.25, 0.9); cam.lookAt(0, 0.88, 0); rd.render(scene, cam); raf = requestAnimationFrame(frame); return; }
    if (theme === 'garage') { const dd = cat === 'kart' ? 4.2 : L * 1.25; cam.position.set(dd * 0.75, cat === 'kart' ? 1.7 : 2.3, dd * 0.85); cam.lookAt(0, 0.3, -0.3); if (car) car.group.rotation.y = 0.5 + Math.sin(t * 0.25) * 0.5; rd.render(scene, cam); raf = requestAnimationFrame(frame); return; }
    const dist = cat === "kart" ? 4.6 : Math.max(7.5, L * 1.75), wide = cam.aspect < 1.2 ? 1.5 : 1;
    cam.position.set(Math.sin(0.6) * dist * wide, (cat === 'kart' ? 1.4 : 1.8) + Math.sin(t * 0.3) * 0.08, Math.cos(0.6) * dist * wide);
    cam.lookAt(cam.aspect > 1.2 ? -L * 0.2 - 0.4 : 0, cat === 'kart' ? 0.35 : 0.45, 0); // carro um pouco à direita, deixa espaço para o menu
    rd.render(scene, cam);
    raf = requestAnimationFrame(frame);
  }
  function start(canvas, d, th) {
    if (!window.THREE) return false;
    try {
      if (!rd || cv !== canvas || (th || 'studio') !== theme) {
        theme = th || 'studio';
        stop(); cv = canvas;
        rd = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        if ('outputEncoding' in rd) rd.outputEncoding = THREE.sRGBEncoding;
        rd.toneMapping = THREE.ACESFilmicToneMapping; rd.toneMappingExposure = 1.1;
        rd.setPixelRatio(Math.min(1.75, devicePixelRatio || 1)); rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;
        studio(); key = ''; car = null;
        if (theme === 'helmet') {
          canvas.style.touchAction = 'none'; canvas.style.cursor = 'grab';
          canvas.addEventListener('pointerdown', (e) => { drag.on = true; drag.x = e.clientX; drag.y = e.clientY; drag.last = performance.now(); try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* */ } });
          canvas.addEventListener('pointermove', (e) => { if (!drag.on) return; drag.yaw += (e.clientX - drag.x) * 0.012; drag.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -0.6, 0.6); drag.x = e.clientX; drag.y = e.clientY; drag.last = performance.now(); });
          const up = () => { drag.on = false; drag.last = performance.now(); }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
        }
      }
      setCar(d); size();
      cancelAnimationFrame(raf); t0 = performance.now(); raf = requestAnimationFrame(frame);
      return true;
    } catch (e) { stop(); return false; }
  }
  function stop() {
    cancelAnimationFrame(raf); raf = 0;
    if (rd) { try { rd.dispose(); rd.forceContextLoss && rd.forceContextLoss(); } catch (e) { /* */ } }
    rd = null; car = null; cv = null; key = '';
  }
  addEventListener('resize', () => { if (rd) size(); });
  return { start, stop, setCar: (d) => rd && setCar(d) };
})();
