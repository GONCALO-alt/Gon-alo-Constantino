/* Montra 3D do menu principal: o carro a rodar num estúdio com luzes e chão brilhante. */
'use strict';

const MENU3D = (() => {
  let rd = null, scene, cam, car = null, raf = 0, cv = null, t0 = 0, cat = null, key = '';
  function studio() {
    scene = new THREE.Scene();
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#05070b'); gr.addColorStop(0.55, '#141a24'); gr.addColorStop(1, '#0a0d12'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    for (const x of [90, 256, 422]) { const lg = g.createRadialGradient(x, 40, 2, x, 40, 70); lg.addColorStop(0, 'rgba(255,255,255,.9)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.fillRect(x - 70, 0, 140, 110); }
    const bg = new THREE.CanvasTexture(c); if ('encoding' in bg) bg.encoding = THREE.sRGBEncoding; bg.mapping = THREE.EquirectangularReflectionMapping;
    const pm = new THREE.PMREMGenerator(rd), es = new THREE.Scene(); es.background = bg; const env = pm.fromScene(es, 0.02).texture; CARS3D.setEnv(env);
    scene.background = new THREE.Color(0x07090d); scene.fog = new THREE.Fog(0x07090d, 9, 22);
    scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x15110d, 0.55));
    const key1 = new THREE.SpotLight(0xffffff, 2.2, 30, 0.55, 0.6); key1.position.set(3, 7, 4); key1.castShadow = true; key1.shadow.mapSize.set(1024, 1024); key1.shadow.bias = -0.0004; scene.add(key1); scene.add(key1.target);
    const rim = new THREE.DirectionalLight(0xff3b30, 0.9); rim.position.set(-5, 2, -4); scene.add(rim);
    const fill = new THREE.DirectionalLight(0x9cc7ff, 0.5); fill.position.set(-4, 3, 5); scene.add(fill);
    // chão: plataforma giratória escura e brilhante com anel de luz
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: 0x0c0f14, metalness: 0.6, roughness: 0.35, envMap: env }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.5, 0.08, 72), new THREE.MeshStandardMaterial({ color: 0x1a1e25, metalness: 0.8, roughness: 0.25, envMap: env })); plat.position.y = 0.04; plat.receiveShadow = true; scene.add(plat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.45, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: 0xe10600 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.085; scene.add(ring);
    cam = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  }
  function setCar(d) {
    const k = [d.cat, d.c1, d.c2, d.num, d.helmet && d.helmet.c1, d.helmet && d.helmet.pattern].join('|');
    if (k === key && car) return; key = k;
    if (car) { scene.remove(car.group); car.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
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
    if (car) car.group.rotation.y = t * 0.35;
    const dist = cat === "kart" ? 4.6 : Math.max(7.5, L * 1.75), wide = cam.aspect < 1.2 ? 1.5 : 1;
    cam.position.set(Math.sin(0.6) * dist * wide, (cat === 'kart' ? 1.4 : 1.8) + Math.sin(t * 0.3) * 0.08, Math.cos(0.6) * dist * wide);
    cam.lookAt(cam.aspect > 1.2 ? -L * 0.2 - 0.4 : 0, cat === 'kart' ? 0.35 : 0.45, 0); // carro um pouco à direita, deixa espaço para o menu
    rd.render(scene, cam);
    raf = requestAnimationFrame(frame);
  }
  function start(canvas, d) {
    if (!window.THREE) return false;
    try {
      if (!rd || cv !== canvas) {
        stop(); cv = canvas;
        rd = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        if ('outputEncoding' in rd) rd.outputEncoding = THREE.sRGBEncoding;
        rd.toneMapping = THREE.ACESFilmicToneMapping; rd.toneMappingExposure = 1.1;
        rd.setPixelRatio(Math.min(1.75, devicePixelRatio || 1)); rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;
        studio(); key = ''; car = null;
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
