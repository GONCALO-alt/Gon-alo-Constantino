/* Desenho em 3D (Three.js): pista com relevo, cenário, carros, chuva, retrovisores, câmaras de cockpit, perseguição e TV.
   O x e o y do mapa (metros) passam a x e z; a altura é o y. */
'use strict';

const R3D = (() => {
  let renderer = null, scene, camera, cv, VW = 0, VH = 0, Q = null;
  let B = null; // tudo o que pertence à pista construída
  const tex = {};
  const QUAL = {
    baixa: { pr: 1, shadow: 0, mirrors: false, trees: 0.45, far: 0.75 },
    media: { pr: 1.3, shadow: 1024, mirrors: true, trees: 0.8, far: 1 },
    alta: { pr: 1.75, shadow: 2048, mirrors: true, trees: 1, far: 1.2 },
  };
  const cs = { roll: 0, pitch: 0, x: 0, z: 0, y: 0 };

  function canvasTex(w, h, draw, repeat = true, srgb = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (srgb && 'encoding' in t) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
    return t;
  }
  function noise(g, w, h, base, amp, seed, speck = 0) {
    const im = g.createImageData(w, h), r = mulberry32(seed);
    for (let i = 0; i < w * h; i++) {
      let v = (r() - 0.5) * amp;
      if (speck && r() < speck) v += (r() - 0.3) * amp * 2.5;
      im.data[i * 4] = base[0] + v; im.data[i * 4 + 1] = base[1] + v; im.data[i * 4 + 2] = base[2] + v; im.data[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  }
  function makeTextures() {
    tex.asphalt = canvasTex(512, 512, (g, w, h) => {
      noise(g, w, h, [74, 76, 80], 26, 3, 0.08);
      const r = mulberry32(8);
      g.strokeStyle = 'rgba(25,25,28,.35)'; g.lineWidth = 1.2;
      for (let k = 0; k < 7; k++) { g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (r() - 0.5) * 40; y += r() * 30; g.lineTo(x, y); } g.stroke(); }
      for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(30,30,34,${0.08 + r() * 0.12})`; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 40, 6 + r() * 20, r() * 3, 0, 7); g.fill(); }
      g.fillStyle = '#ededea'; g.fillRect(6, 0, 9, h); g.fillRect(w - 15, 0, 9, h);
    });
    tex.kerb = canvasTex(64, 256, (g, w, h) => { noise(g, w, h, [200, 30, 30], 20, 2); g.fillStyle = '#efefec'; g.fillRect(0, h / 2, w, h / 2); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 2); });
    tex.grass = canvasTex(512, 512, (g, w, h) => {
      noise(g, w, h, [74, 122, 56], 22, 5);
      const r = mulberry32(6);
      for (let k = 0; k < 400; k++) { g.fillStyle = r() < 0.5 ? 'rgba(40,80,30,.25)' : 'rgba(130,170,80,.18)'; g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 10, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(0, 0, w / 2, h);
    });
    tex.gravel = canvasTex(256, 256, (g, w, h) => { noise(g, w, h, [196, 178, 140], 70, 9, 0.2); });
    tex.apron = canvasTex(256, 256, (g, w, h) => noise(g, w, h, [128, 132, 136], 18, 4, 0.05));
    tex.concrete = canvasTex(128, 64, (g, w, h) => { noise(g, w, h, [190, 190, 186], 24, 12, 0.05); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, 2, h); });
    tex.armco = canvasTex(128, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#dfe3e8'); gr.addColorStop(0.5, '#a9aeb6'); gr.addColorStop(1, '#d4d8de'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, h * 0.5, w, 2); for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 3, h); });
    tex.tyres = canvasTex(128, 64, (g, w, h) => { for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#e8e8e8' : '#c91d1d'; g.fillRect((k * w) / 4, 0, w / 4, h); } for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y, w, 3); } });
    tex.fence = canvasTex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(170,175,180,.85)'; g.lineWidth = 1; for (let k = -w; k < w * 2; k += 8) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke(); g.beginPath(); g.moveTo(k + h, 0); g.lineTo(k, h); g.stroke(); } });
    tex.crowd = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#5b616a'; g.fillRect(0, 0, w, h); const r = mulberry32(7); for (let y = 2; y < h; y += 6) for (let x = 1; x < w; x += 4) { g.fillStyle = ['#e63946', '#f1faee', '#ffb703', '#219ebc', '#8ecae6', '#fb8500', '#2a2a2a', '#d9d9d9', '#2d6a4f'][Math.floor(r() * 9)]; g.fillRect(x, y, 3, 4); } });
    tex.brick = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#8f8a82'; g.fillRect(0, 0, w, h); const r = mulberry32(4); for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < w; x += 32) { const v = 70 + r() * 40; g.fillStyle = `rgb(${v + 30},${v + 22},${v + 10})`; g.fillRect(x + 1, y + 1, 30, 14); } });
    tex.panel = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#6f9e5e'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x + 4, 0, 6, h); } });
    tex.window = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#d9dcdf'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#5d6670'); gr.addColorStop(0.5, '#8a96a3'); gr.addColorStop(1, '#4b535c'); g.fillStyle = gr; g.fillRect(8, 8, w / 2 - 12, h - 16); g.fillRect(w / 2 + 4, 8, w / 2 - 12, h - 16); });
    tex.smoke = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(235,235,235,.85)'); gr.addColorStop(1, 'rgba(235,235,235,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }, false);
    tex.tree = [0, 1, 2].map((k) => canvasTex(128, 192, (g, w, h) => {
      g.clearRect(0, 0, w, h); const r = mulberry32(31 + k);
      g.fillStyle = '#5b4028'; g.fillRect(w / 2 - 4, h * 0.6, 8, h * 0.4);
      const cols = k === 2 ? ['#2c5a2a', '#3c7232', '#4f8a3c', '#23481f'] : ['#2f6a2c', '#447f36', '#5f9a45', '#284e22'];
      for (let i = 0; i < 160; i++) { const a = r() * 6.28, rr = Math.sqrt(r()) * (k === 1 ? 46 : 54); const x = w / 2 + Math.cos(a) * rr * (k === 1 ? 0.7 : 1), y = (k === 1 ? h * 0.38 : h * 0.4) + Math.sin(a) * rr * (k === 1 ? 1.3 : 0.9); g.fillStyle = cols[Math.floor(r() * 4)]; g.beginPath(); g.arc(x, y, 5 + r() * 9, 0, 7); g.fill(); }
    }, false));
  }
  function skyTexture(rain) {
    return canvasTex(512, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      if (rain) { gr.addColorStop(0, '#59616b'); gr.addColorStop(0.6, '#8d959e'); gr.addColorStop(1, '#b4bac0'); }
      else { gr.addColorStop(0, '#2c6cc2'); gr.addColorStop(0.55, '#86bdef'); gr.addColorStop(1, '#dcecf7'); }
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = mulberry32(rain ? 3 : 9);
      for (let k = 0; k < (rain ? 90 : 30); k++) { const x = r() * w, y = r() * h * 0.6, s = 20 + r() * 60; const cg = g.createRadialGradient(x, y, 1, x, y, s); const a = rain ? 0.35 : 0.5; cg.addColorStop(0, `rgba(${rain ? 120 : 255},${rain ? 125 : 255},${rain ? 130 : 255},${a})`); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.fillRect(x - s, y - s, s * 2, s * 2); }
    }, false);
  }
  function init(canvas, gfx) {
    cv = canvas; Q = QUAL[gfx] || QUAL.media;
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
      if ('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      makeTextures();
    }
    renderer.setPixelRatio(Math.min(Q.pr, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = !!Q.shadow; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    B = null; // reconstruir com a qualidade escolhida
    resize();
  }
  function resize() {
    if (!renderer) return;
    const r = cv.getBoundingClientRect(); VW = r.width; VH = r.height;
    renderer.setSize(VW, VH, false);
    if (camera) { camera.aspect = VW / Math.max(1, VH); camera.updateProjectionMatrix(); }
  }

  // ---------- relevo do terreno ----------
  function vnoise(seed) {
    const r = mulberry32(seed), N = 64, g = new Float32Array(N * N); for (let i = 0; i < N * N; i++) g[i] = r();
    const at = (x, y) => g[(((y % N) + N) % N) * N + (((x % N) + N) % N)];
    return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), tx = x - xi, ty = y - yi, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty); return lerp(lerp(at(xi, yi), at(xi + 1, yi), sx), lerp(at(xi, yi + 1), at(xi + 1, yi + 1), sx), sy); };
  }
  function terrainFn(T) {
    const cell = 40, grid = new Map(), key = (a, b) => a * 100003 + b;
    for (let i = 0; i < T.n; i += 2) { const k = key(Math.floor(T.x[i] / cell), Math.floor(T.y[i] / cell)); let a = grid.get(k); if (!a) grid.set(k, (a = [])); a.push(i); }
    const n1 = vnoise(trackSeed(T.name, T.cat) & 0xffff), n2 = vnoise(77);
    let avg = 0; for (let i = 0; i < T.n; i++) avg += T.h[i]; avg /= T.n;
    const near = T.W / 2 + T.runoff + 12, blend = T.kart ? 60 : 130, hill = T.kart ? 26 : 70;
    return (x, z) => {
      const cx = Math.floor(x / cell), cz = Math.floor(z / cell);
      let bd = 1e18, bi = -1;
      for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++) { const arr = grid.get(key(cx + a, cz + b)); if (!arr) continue; for (const i of arr) { const d = (T.x[i] - x) ** 2 + (T.y[i] - z) ** 2; if (d < bd) { bd = d; bi = i; } } }
      const d = bi < 0 ? 1e9 : Math.sqrt(bd);
      const base = bi < 0 ? avg : T.h[bi];
      const far = avg - 1 + (n1(x / 260, z / 260) - 0.35) * hill * 1.4 + n2(x / 70, z / 70) * hill * 0.15;
      if (d < near) return base - 0.35;
      const t = clamp((d - near) / blend, 0, 1), s = t * t * (3 - 2 * t);
      return lerp(base - 0.35, Math.max(far, lerp(base - 0.35, far, 0.3)), s);
    };
  }

  // ---------- fitas ao longo da pista (seguem o relevo) ----------
  function ribbon(T, run, a, b, dy, mat, vScale, closed, opt = {}) {
    const n = run.length + (closed ? 1 : 0);
    const pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = [];
    let v = 0;
    for (let k = 0; k < n; k++) {
      const i = run[k % run.length];
      const oa = typeof a === 'function' ? a(i) : a, ob = typeof b === 'function' ? b(i) : b, y = T.h[i] + dy;
      pos.set([T.x[i] + T.nx[i] * oa, y + (opt.tiltA || 0), T.y[i] + T.ny[i] * oa, T.x[i] + T.nx[i] * ob, y + (opt.tiltB || 0), T.y[i] + T.ny[i] * ob], k * 6);
      if (k > 0) v += T.ds / vScale;
      uv.set([0, v, opt.uMax || 1, v], k * 4);
      if (k < n - 1) { const q = k * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const nr = g.attributes.normal; let flip = 0; for (let k = 0; k < nr.count; k++) if (nr.getY(k) < 0) flip++;
    if (flip > nr.count / 2) { for (let k = 0; k < idx.length; k += 3) { const t = idx[k]; idx[k] = idx[k + 1]; idx[k + 1] = t; } g.setIndex(idx); g.computeVertexNormals(); }
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.matrixAutoUpdate = false; m.updateMatrix();
    return m;
  }
  function wall(T, run, off, h, mat, vScale, y0 = 0) {
    const n = run.length, pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = [];
    let v = 0;
    for (let k = 0; k < n; k++) {
      const i = run[k], x = T.x[i] + T.nx[i] * off, z = T.y[i] + T.ny[i] * off, y = T.h[i] + y0;
      pos.set([x, y, z, x, y + h, z], k * 6);
      if (k > 0) v += T.ds / vScale;
      uv.set([v, 0, v, 1], k * 4);
      if (k < n - 1) { const q = k * 2; idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; m.matrixAutoUpdate = false; m.updateMatrix();
    return m;
  }
  const runsOf = (n, flag) => { const out = []; let cur = null; for (let k = 0; k <= n; k++) { const i = k % n; if (k < n && flag(i)) { if (!cur) { cur = []; out.push(cur); } cur.push(i); } else if (cur) { cur.push(i); cur = null; } } return out; };
  const allIdx = (T) => Array.from({ length: T.n }, (_, i) => i);
  const mat = (t, rep, o = {}) => { const tt = t.clone(); tt.needsUpdate = true; if (rep) tt.repeat.set(rep[0], rep[1]); return new THREE.MeshStandardMaterial({ map: tt, roughness: 0.95, metalness: 0, ...o }); };
  function mergeGeos(list) {
    const pos = [], uv = [], nrm = [], idx = []; let off = 0;
    for (const g of list) { const p = g.attributes.position, u = g.attributes.uv, nn = g.attributes.normal; for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); uv.push(u.getX(i), u.getY(i)); nrm.push(nn.getX(i), nn.getY(i), nn.getZ(i)); } for (const v of g.index.array) idx.push(v + off); off += p.count; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setIndex(idx); return g;
  }

  function build(R, teams, weather) {
    const T = R.T;
    if (B && scene) scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    scene = new THREE.Scene();
    const rain = weather && weather.start > 0.3;
    B = { T, R, rainLook: rain };
    scene.background = skyTexture(rain);
    scene.fog = new THREE.Fog(rain ? 0x9aa1a8 : 0xcfe2f1, T.kart ? 140 : 300, (T.kart ? 900 : 2200) * Q.far);
    { const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene(); es.background = scene.background; B.env = pm.fromScene(es, 0.04).texture; CARS3D.setEnv(B.env); }
    camera = new THREE.PerspectiveCamera(72, VW / Math.max(1, VH), 0.05, 6000); scene.add(camera);
    scene.add(new THREE.HemisphereLight(rain ? 0xbcc4cc : 0xdcefff, 0x56704a, rain ? 0.85 : 0.65));
    const sun = new THREE.DirectionalLight(rain ? 0xdde3ea : 0xfff1db, rain ? 0.45 : 1.15);
    B.sunDir = new THREE.Vector3(0.45, 0.8, 0.35).normalize();
    if (Q.shadow) {
      sun.castShadow = true; sun.shadow.mapSize.set(Q.shadow, Q.shadow);
      const e = T.kart ? 28 : 55; Object.assign(sun.shadow.camera, { left: -e, right: e, top: e, bottom: -e, near: 1, far: 400 });
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
    }
    scene.add(sun); scene.add(sun.target); B.sun = sun;
    const half = T.W / 2, H = terrainFn(T); B.H = H;
    const [bx0, bz0, bx1, bz1] = T.bbox, pad = T.kart ? 350 : 900;
    {
      const sx = bx1 - bx0 + pad * 2, sz = bz1 - bz0 + pad * 2, step = T.kart ? 6 : 16;
      const geo = new THREE.PlaneGeometry(sx, sz, Math.ceil(sx / step), Math.ceil(sz / step)); geo.rotateX(-Math.PI / 2);
      const p = geo.attributes.position, ox = (bx0 + bx1) / 2, oz = (bz0 + bz1) / 2;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i) + ox, z = p.getZ(i) + oz; p.setXYZ(i, x, H(x, z), z); }
      geo.computeVertexNormals();
      const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 22, p.getZ(i) / 22);
      const m = new THREE.Mesh(geo, mat(tex.grass, null)); m.receiveShadow = true; scene.add(m);
    }
    const all = allIdx(T), apronW = T.kart ? 2.5 : 7;
    scene.add(ribbon(T, all, -half - T.runoff - 16, half + T.runoff + 16, -0.06, mat(tex.grass, null), 22, true, { uMax: 4 }));
    scene.add(ribbon(T, all, -half - apronW, half + apronW, 0.0, mat(tex.apron, null), 8, true, { uMax: apronW / 3 }));
    for (const sd of [-1, 1]) for (const run of runsOf(T.n, (i) => T.gravel[i] === sd)) {
      const a = sd * (half + apronW * 0.7), b = sd * (half + T.runoff - 0.5);
      scene.add(ribbon(T, run, Math.min(a, b), Math.max(a, b), 0.02, mat(tex.gravel, null), 6, false, { uMax: 3 }));
    }
    B.asph = new THREE.MeshStandardMaterial({ map: (() => { const t = tex.asphalt.clone(); t.needsUpdate = true; return t; })(), roughness: 0.92, metalness: 0.0, envMap: B.env, envMapIntensity: 0.2 });
    scene.add(ribbon(T, all, -half, half, 0.04, B.asph, 14, true));
    scene.add(ribbon(T, all, (i) => T.off[i] - (T.kart ? 0.8 : 1.2), (i) => T.off[i] + (T.kart ? 0.8 : 1.2), 0.045, new THREE.MeshBasicMaterial({ color: 0x0f0f11, transparent: true, opacity: 0.2, depthWrite: false }), 10, true));
    const kmat = mat(tex.kerb, null, { roughness: 0.7 });
    for (const sd of [-1, 1]) for (const run of runsOf(T.n, (i) => T.kerb[i])) {
      const a = sd * (half - 0.2), b = sd * (half + 1.0);
      scene.add(ribbon(T, run, Math.min(a, b), Math.max(a, b), 0.05, kmat, 3.2, false, sd > 0 ? { tiltB: 0.07 } : { tiltA: 0.07 }));
    }
    const pitEx = (sd, i) => T.pit && sd === T.pit.side && R.relIdx(i) > T.pit.i0 - 25 && R.relIdx(i) < T.pit.i1 + 25;
    if (T.kart) {
      // blocos de plástico azuis e brancos, como nos kartódromos
      const list = []; const st = Math.max(1, Math.round(1.45 / T.ds));
      for (const sd of [-1, 1]) for (let i = 0; i < T.n; i += st) list.push([i, sd]);
      const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.65, 0.5), new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 }), list.length);
      inst.castShadow = inst.receiveShadow = true;
      const M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3(), col = new THREE.Color(), up = new THREE.Vector3(0, 1, 0);
      list.forEach(([i, sd], k) => { const off = sd * (half + T.runoff); p.set(T.x[i] + T.nx[i] * off, T.h[i] + 0.32, T.y[i] + T.ny[i] * off); q.setFromAxisAngle(up, -Math.atan2(T.ty[i], T.tx[i])); M.compose(p, q, sc); inst.setMatrixAt(k, M); inst.setColorAt(k, col.set(k % 2 ? 0x2f6fd0 : 0xe9ecef)); });
      scene.add(inst);
    } else {
      const arm = mat(tex.armco, null, { roughness: 0.45, metalness: 0.6, side: THREE.DoubleSide });
      const tyr = mat(tex.tyres, null, { side: THREE.DoubleSide });
      const fen = new THREE.MeshStandardMaterial({ map: (() => { const t = tex.fence.clone(); t.needsUpdate = true; return t; })(), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.6 });
      for (const sd of [-1, 1]) for (const run of runsOf(T.n, (i) => !pitEx(sd, i))) {
        scene.add(wall(T, run, sd * (half + T.runoff), 0.9, arm, 4));
        scene.add(wall(T, run, sd * (half + T.runoff + 0.3), 3.2, fen, 3, 0.9));
        for (const r2 of runsOf(run.length, (k) => T.gravel[run[k]] === sd)) scene.add(wall(T, r2.map((k) => run[k % run.length]), sd * (half + T.runoff - 0.6), 0.8, tyr, 2.4));
      }
    }
    // postes de luz
    {
      const poleM = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.7, roughness: 0.4 });
      const step = Math.round((T.kart ? 45 : 110) / T.ds);
      for (let i = 0; i < T.n; i += step) {
        const sd = T.k[i] > 0 ? 1 : -1, off = sd * (half + T.runoff + (T.kart ? 3 : 6));
        const x = T.x[i] + T.nx[i] * off, z = T.y[i] + T.ny[i] * off, y = H(x, z), ph = T.kart ? 9 : 14;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, ph, 6), poleM); pole.position.set(x, y + ph / 2, z); pole.castShadow = true; scene.add(pole);
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.5), poleM); head.position.set(x - T.nx[i] * sd * 0.5, y + ph, z - T.ny[i] * sd * 0.5); scene.add(head);
      }
    }
    // edifícios
    const building = (x, z, y, th, w, d, h2) => {
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = -th;
      const base = new THREE.Mesh(new THREE.BoxGeometry(w, 1.4, d), mat(tex.brick, [w / 6, 1])); base.position.y = 0.7; g.add(base);
      const up = new THREE.Mesh(new THREE.BoxGeometry(w, h2, d), mat(tex.panel, [w / 8, h2 / 8])); up.position.y = 1.4 + h2 / 2; g.add(up);
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, h2 * 0.55), mat(tex.window, [w / 4, 1], { roughness: 0.2, metalness: 0.3, envMap: B.env })); glass.position.set(0, 1.4 + h2 * 0.45, d / 2 + 0.02); g.add(glass);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.4, d + 2), new THREE.MeshStandardMaterial({ color: 0xd8d8d4, roughness: 0.8 })); roof.position.y = 1.4 + h2 + 0.2; g.add(roof);
      const rail = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 0.6, roughness: 0.4 });
      for (let k = -w / 2; k <= w / 2; k += 2.5) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), rail); p.position.set(k, 1.4 + h2 + 0.95, d / 2 + 0.8); g.add(p); }
      const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.06), rail); top.position.set(0, 1.4 + h2 + 1.5, d / 2 + 0.8); g.add(top);
      g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      scene.add(g);
    };
    if (T.pit) {
      const pit = T.pit, sd = pit.side, idx = []; for (let i = pit.i0 - 25; i <= pit.i1 + 25; i++) idx.push((i + T.n) % T.n);
      scene.add(ribbon(T, idx, sd > 0 ? half + 1 : -(pit.off + 6), sd > 0 ? pit.off + 6 : -(half + 1), 0.035, B.asph, 14, false));
      const wl = []; for (let i = pit.i0; i <= pit.i1; i++) wl.push((i + T.n) % T.n);
      scene.add(wall(T, wl, sd * (half + 3.4), 1.1, mat(tex.concrete, null, { side: THREE.DoubleSide }), 4));
      const mid = (Math.round((pit.i0 + pit.i1) / 2) + T.n) % T.n, len = (pit.i1 - pit.i0) * T.ds;
      building(T.x[mid] + T.nx[mid] * sd * (pit.off + 16), T.y[mid] + T.ny[mid] * sd * (pit.off + 16), T.h[mid], Math.atan2(T.ty[mid], T.tx[mid]) + (sd > 0 ? Math.PI : 0), len * 0.9, 12, 6);
      const step = Math.max(1, Math.round(((pit.i1 - pit.i0) * 0.85) / 10));
      for (let k = 0; k < 10; k++) {
        const i = (pit.i0 + Math.round((pit.i1 - pit.i0) * 0.07) + k * step + T.n) % T.n;
        const col = teams && teams[k] ? new THREE.Color(teams[k][1]) : new THREE.Color(0x666666);
        const bx = new THREE.Mesh(new THREE.BoxGeometry(step * T.ds * 0.85, 1.2, 0.2), new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }));
        bx.position.set(T.x[i] + T.nx[i] * sd * (pit.off + 9.8), T.h[i] + 5.2, T.y[i] + T.ny[i] * sd * (pit.off + 9.8)); bx.rotation.y = -Math.atan2(T.ty[i], T.tx[i]); scene.add(bx);
      }
    } else {
      const i = Math.round(T.n * 0.02), sd = -1, d = half + T.runoff + 14;
      building(T.x[i] + T.nx[i] * sd * d, T.y[i] + T.ny[i] * sd * d, T.h[i], Math.atan2(T.ty[i], T.tx[i]), 34, 10, 4.5);
    }
    // pórtico com as luzes
    {
      const i = Math.round(-6 / T.ds + T.n) % T.n, th = Math.atan2(T.ty[i], T.tx[i]);
      const g = new THREE.Group(); g.position.set(T.x[i], T.h[i], T.y[i]); g.rotation.y = -th;
      const metal = new THREE.MeshStandardMaterial({ color: 0x2b2f36, metalness: 0.6, roughness: 0.45 });
      const wd = T.W + 4, hh = T.kart ? 4 : 6.3;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, wd), metal); bar.position.set(0, hh, 0); bar.castShadow = true; g.add(bar);
      for (const sd of [-1, 1]) { const pole = new THREE.Mesh(new THREE.BoxGeometry(0.45, hh + 0.6, 0.45), metal); pole.position.set(0, (hh + 0.6) / 2, (sd * wd) / 2); pole.castShadow = true; g.add(pole); }
      B.gantry = [];
      for (let k = 0; k < 5; k++) for (const row of [-0.25, 0.25]) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.2, 18), new THREE.MeshBasicMaterial({ color: 0x2a0606 })); m.position.set(-0.36, hh + row, (k - 2) * 0.75); m.rotation.y = -Math.PI / 2; g.add(m); B.gantry.push([m, k]); }
      scene.add(g);
      const fin = canvasTex(64, 8, (q) => { for (let a = 0; a < 16; a++) for (let b = 0; b < 2; b++) { q.fillStyle = (a + b) & 1 ? '#111' : '#fff'; q.fillRect(a * 4, b * 4, 4, 4); } }, false);
      const line = new THREE.Mesh(new THREE.PlaneGeometry(T.W, 1.2), new THREE.MeshStandardMaterial({ map: fin, roughness: 0.8 }));
      line.rotation.x = -Math.PI / 2; line.rotation.z = -th + Math.PI / 2; line.position.set(T.x[0], T.h[0] + 0.055, T.y[0]); line.receiveShadow = true; scene.add(line);
    }
    // lugares da grelha
    {
      const gap = T.kart ? 6.5 : 8, mm = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let k = 0; k < Math.max(20, R.cars.length); k++) {
        const s = T.len - 12 - k * gap + (T.kart ? 1 : 2), pt = trackPoint(T, s, (k % 2 ? 1 : -1) * T.W * 0.22);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.25, T.kart ? 3 : 4.2), mm);
        m.rotation.x = -Math.PI / 2; m.rotation.z = -pt.th; m.position.set(pt.x, heightAt(T, s) + 0.055, pt.y); scene.add(m);
      }
    }
    // placas de travagem
    {
      const prof = R.me.prof, boards = [];
      for (let i = 0; i < T.n; i++) { const v0 = prof.v[i], v1 = prof.v[(i + Math.round(60 / T.ds)) % T.n]; if (v0 - v1 > (T.kart ? 4 : 12) && (!boards.length || i - boards[boards.length - 1] > 300 / T.ds)) boards.push(i); }
      for (const i0 of boards) for (const d of T.kart ? [50, 25] : [150, 100, 50]) {
        const apex = (i0 + Math.round(60 / T.ds)) % T.n, i = (apex - Math.round(d / T.ds) + T.n) % T.n, sd = T.k[apex] > 0 ? -1 : 1;
        const t = canvasTex(64, 48, (q, w, h) => { q.fillStyle = '#fff'; q.fillRect(0, 0, w, h); q.fillStyle = '#111'; q.font = 'bold 30px sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(String(d), w / 2, h / 2 + 2); }, false);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.05), new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide }));
        const off = sd * (half + (T.kart ? 2.2 : 5));
        m.position.set(T.x[i] + T.nx[i] * off, T.h[i] + 1.0, T.y[i] + T.ny[i] * off); m.rotation.y = -Math.atan2(T.ty[i], T.tx[i]) + Math.PI / 2; scene.add(m);
      }
    }
    // bancadas
    for (const st of T.stands) {
      const i = st.i, sd = st.side, th = Math.atan2(T.ty[i], T.tx[i]);
      const g = new THREE.Group(), d = st.dist + 8;
      g.position.set(T.x[i] + T.nx[i] * sd * d, T.h[i], T.y[i] + T.ny[i] * sd * d); g.rotation.y = -th;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(st.length, 10), mat(tex.crowd, [st.length / 14, 1], { side: THREE.DoubleSide }));
      face.position.set(0, 5, 0); face.rotation.x = sd * 0.55; g.add(face);
      const back = new THREE.Mesh(new THREE.BoxGeometry(st.length, 10, 0.4), new THREE.MeshStandardMaterial({ color: 0x80868e })); back.position.set(0, 5, sd * 5); g.add(back);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(st.length, 0.3, 9), new THREE.MeshStandardMaterial({ color: 0xeeeeee })); roof.position.set(0, 11, sd * 2.5); g.add(roof);
      g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      scene.add(g);
    }
    // árvores: planos cruzados com folhagem
    {
      const list = T.trees.filter((_, k) => (k * 0.618) % 1 < Q.trees);
      for (let v = 0; v < 3; v++) {
        const sub = list.filter((t) => Math.floor(t[3] * 3) === v); if (!sub.length) continue;
        const geo = new THREE.PlaneGeometry(1, 1.5); geo.translate(0, 0.75, 0);
        const g2 = geo.clone(); g2.rotateY(Math.PI / 2);
        const inst = new THREE.InstancedMesh(mergeGeos([geo, g2]), new THREE.MeshStandardMaterial({ map: tex.tree[v], alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }), sub.length);
        inst.castShadow = !!Q.shadow;
        const M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
        sub.forEach((t, k) => { const s = (T.kart ? 5 : 8) + t[2] * 2.2; sc.set(s, s, s); p.set(t[0], H(t[0], t[1]) - 0.2, t[1]); q.setFromAxisAngle(up, t[3] * 20); M.compose(p, q, sc); inst.setMatrixAt(k, M); });
        scene.add(inst);
      }
    }
    // trajetória ideal (ajuda)
    {
      const n = T.n, pos = new Float32Array((n + 1) * 6), col = new Float32Array((n + 1) * 6), idx = [], prof = R.me.prof;
      for (let k = 0; k <= n; k++) {
        const i = k % n, o = T.off[i], w = T.kart ? 0.22 : 0.35, y = T.h[i] + 0.07;
        pos.set([T.x[i] + T.nx[i] * (o - w), y, T.y[i] + T.ny[i] * (o - w), T.x[i] + T.nx[i] * (o + w), y, T.y[i] + T.ny[i] * (o + w)], k * 6);
        const v = prof.v, brake = v[(i + 6) % n] < v[i] - 0.4, coast = !brake && v[(i + 3) % n] < v[i] + 0.05;
        const c = brake ? [1, 0.23, 0.19] : coast ? [1, 0.84, 0.04] : [0.19, 0.82, 0.35]; col.set([...c, ...c], k * 6);
        if (k < n) { const q2 = k * 2; idx.push(q2, q2 + 1, q2 + 2, q2 + 1, q2 + 3, q2 + 2); }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx);
      B.line = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }));
      scene.add(B.line);
    }
    // fumo e spray
    B.smoke = [];
    for (let k = 0; k < 90; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.smoke, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; scene.add(s); B.smoke.push({ s, life: 0, t: 0, max: 1, scale: 1 }); }
    // chuva
    {
      const N = 1400, g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 6), 3));
      B.rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xbfd3e6, transparent: true, opacity: 0.55 }));
      B.rain.frustumCulled = false; B.rain.visible = false; scene.add(B.rain);
      B.drops = Array.from({ length: N }, () => [Math.random() * 60 - 30, Math.random() * 22, Math.random() * 60 - 30]);
    }
    // câmaras de televisão
    B.tv = [];
    for (let i = 0; i < T.n; i += Math.round((T.kart ? 70 : 170) / T.ds)) {
      const sd = T.k[i] > 0 ? -1 : 1, off = sd * (half + T.runoff + 6);
      B.tv.push({ x: T.x[i] + T.nx[i] * off, z: T.y[i] + T.ny[i] * off, y: T.h[i] + (T.kart ? 4 : 7) });
    }
    // retrovisores
    if (Q.mirrors && !T.kart) {
      B.mirrorRT = new THREE.WebGLRenderTarget(256, 112);
      B.mirrorCam = new THREE.PerspectiveCamera(42, 256 / 112, 0.5, 600);
      B.mirrorRT.texture.wrapS = THREE.RepeatWrapping; B.mirrorRT.texture.repeat.x = -1;
      B.mirrorMat = new THREE.MeshBasicMaterial({ map: B.mirrorRT.texture });
    }
    // safety car
    {
      const g = new THREE.Group();
      const body = new THREE.MeshPhysicalMaterial({ color: 0xd7dbe0, metalness: 0.7, roughness: 0.25, clearcoat: 1, envMap: B.env });
      const m1 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.6, 1.9), body); m1.position.y = 0.55; g.add(m1);
      const m2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.6), new THREE.MeshPhysicalMaterial({ color: 0x1b232c, metalness: 0.5, roughness: 0.1, envMap: B.env })); m2.position.set(-0.3, 1.05, 0); g.add(m2);
      B.scLights = [];
      for (const sd of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.5), new THREE.MeshBasicMaterial({ color: 0xff9900 })); l.position.set(-0.3, 1.36, sd * 0.4); g.add(l); B.scLights.push(l); }
      for (const [x, z] of [[1.4, -0.85], [1.4, 0.85], [-1.4, -0.85], [-1.4, 0.85]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0x111111 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.34, z); g.add(w); }
      g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      g.visible = false; scene.add(g); B.sc = g;
    }
    B.cars = new Map();
    for (const c of R.cars) {
      const m = CARS3D.make(R.T.cat, R.C, c.d.c1, c.d.c2, c.d.helmet, c.d.num, c.d.sponsor);
      m.spin = 0; m.tyre = null;
      if (c.isPlayer && B.mirrorMat) for (const gl of m.mirrors) gl.material = B.mirrorMat;
      scene.add(m.group); B.cars.set(c.id, m);
    }
  }
  function updateDisplay(m, st) {
    const d = m.disp, now = performance.now(); if (now - d.last < 120) return; d.last = now;
    const g = d.c.getContext('2d');
    g.fillStyle = '#05070a'; g.fillRect(0, 0, 128, 64);
    const k = clamp((st.rpm - st.rpmRange[0]) / (st.rpmRange[1] - st.rpmRange[0]), 0, 1), n = Math.round(k * 12);
    for (let i = 0; i < 12; i++) { g.fillStyle = i < n ? (i < 4 ? '#30d158' : i < 8 ? '#ff3b30' : '#3a8dff') : '#1b1e24'; g.fillRect(6 + i * 10, 4, 8, 6); }
    g.fillStyle = '#ffd60a'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center'; g.fillText(st.speed < 0.5 ? 'N' : String(st.gear), 64, 48);
    g.fillStyle = '#fff'; g.font = 'bold 15px sans-serif'; g.textAlign = 'left'; g.fillText(String(Math.round(st.speed * 3.6)), 5, 59);
    g.textAlign = 'right'; g.fillText('P' + st.pos, 123, 59);
    if (st.flag) { g.fillStyle = st.flag === 'amarela' ? '#ffd60a' : st.flag === 'azul' ? '#3a8dff' : '#ff3b30'; g.fillRect(0, 14, 6, 50); g.fillRect(122, 14, 6, 50); }
    d.t.needsUpdate = true;
  }
  // st: { T, R, cars:[{id,x,y,th,v,s,i,steer,tyreColor,wing,slide}], focus, phase, lightsN, rain, wet, sc, weather, ... }
  function frame(st, view, dt) {
    const T = st.T;
    if (!B || B.T !== T) build(st.R, view.teams, st.weather);
    const rainK = st.rain || 0, wet = st.wet || 0;
    let focusM = null, focusC = null;
    for (const c of st.cars) {
      const m = B.cars.get(c.id); if (!m) continue;
      const y = heightAt(T, c.s);
      m.group.position.set(c.x, y, c.y); m.group.rotation.order = 'YZX'; m.group.rotation.y = -c.th;
      m.group.rotation.z = Math.atan(gradeAt(T, c.i) * (Math.cos(c.th) * T.tx[c.i] + Math.sin(c.th) * T.ty[c.i]));
      m.spin += ((c.v || 0) * dt) / 0.33;
      for (const w of m.wheels) w.rotation.z = -m.spin;
      for (const w of m.front) w.rotation.y = -(c.steer || 0);
      if (m.sw) m.sw.rotation.x = (c.steer || 0) * (T.kart ? 2.2 : 6);
      if (c.tyreColor && m.tyre !== c.tyreColor) { m.tyre = c.tyreColor; CARS3D.setCompound(m, c.tyreColor); }
      if (m.fwingParts) for (const p of m.fwingParts) { p.rotation.x = c.wing > 0.4 ? 0.3 * Math.sign(p.position.z || 1) : 0; p.visible = (c.wing || 0) < 0.9; }
      if (m.light) m.light.material.color.setHex(wet > 0.2 ? (Math.floor(performance.now() / 250) % 2 ? 0xff2222 : 0x400000) : 0x400000);
      if (c.id === st.focus) { focusM = m; focusC = c; }
    }
    const cockpit = view.cam === 'cockpit' && focusC;
    if (focusM) { focusM.helm.visible = !cockpit; if (focusM.torso) focusM.torso.visible = !cockpit; }
    for (const [l, k] of B.gantry) l.material.color.setHex(st.phase === 'lights' && k < st.lightsN ? 0xff1a1a : 0x2a0606);
    B.line.visible = !!view.line;
    B.sc.visible = !!st.sc;
    if (st.sc) { B.sc.position.set(st.sc.x, heightAt(T, st.sc.s), st.sc.y); B.sc.rotation.y = -st.sc.th; const on = Math.floor(performance.now() / 200) % 2; B.scLights[0].material.color.setHex(on ? 0xffaa00 : 0x332200); B.scLights[1].material.color.setHex(on ? 0x332200 : 0xffaa00); }
    B.asph.roughness = lerp(0.92, 0.16, wet); B.asph.envMapIntensity = lerp(0.2, 1.5, wet); B.asph.color.setScalar(lerp(1, 0.6, wet));
    const spawn = (x, z, y, max, scale) => { const sp = B.smoke.find((q) => q.life <= 0); if (!sp) return; sp.life = max; sp.max = max; sp.t = 0; sp.scale = scale; sp.s.position.set(x, y, z); sp.s.visible = true; };
    for (const c of st.cars) {
      if ((c.slide || 0) > 0.35 && c.v > 6 && Math.random() < c.slide) spawn(c.x - Math.cos(c.th) * 1.5, c.y - Math.sin(c.th) * 1.5, heightAt(T, c.s) + 0.4, 1.1, 1);
      if (wet > 0.2 && c.v > 12 && Math.random() < wet * 0.45) spawn(c.x - Math.cos(c.th) * 2.6, c.y - Math.sin(c.th) * 2.6, heightAt(T, c.s) + 0.5, 0.8, 1.9);
    }
    for (const sp of B.smoke) {
      if (sp.life <= 0) continue;
      sp.t += dt; sp.life -= dt; sp.s.position.y += dt * 0.6;
      const k = sp.t / sp.max; sp.s.scale.setScalar((1 + k * 4) * sp.scale); sp.s.material.opacity = 0.42 * (1 - k);
      if (sp.life <= 0) sp.s.visible = false;
    }
    if (focusC) {
      const c = focusC, fx = Math.cos(c.th), fz = Math.sin(c.th), hy = heightAt(T, c.s);
      if (view.cam === 'cockpit') {
        cs.roll = lerp(cs.roll, -clamp(st.latG || 0, -3, 3) * 0.01, Math.min(1, dt * 6));
        cs.pitch = lerp(cs.pitch, clamp(st.longG || 0, -4, 3) * 0.007, Math.min(1, dt * 6));
        const rough = (st.surf === 'corretor' ? 0.012 : st.surf === 'gravilha' || st.surf === 'relva' ? 0.03 : 0) + (c.v || 0) * 0.00004;
        const [ex, ey] = focusM.eye;
        camera.position.set(c.x + fx * ex + (Math.random() - 0.5) * rough, hy + ey + (Math.random() - 0.5) * rough + (view.shake || 0) * 0.05 * (Math.random() - 0.5), c.y + fz * ex);
        camera.rotation.order = 'YXZ';
        const grade = Math.atan(gradeAt(T, c.i) * (fx * T.tx[c.i] + fz * T.ty[c.i]));
        camera.rotation.set((T.kart ? -0.27 : -0.08) - cs.pitch + grade, -c.th - Math.PI / 2, cs.roll);
        const fov = (T.kart ? 74 : 70) + clamp((c.v || 0) / 90, 0, 1) * 10;
        if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 3)); camera.updateProjectionMatrix(); }
        updateDisplay(focusM, st);
      } else if (view.cam === 'tv') {
        let best = 0, bd = 1e18;
        B.tv.forEach((t, k) => { const d = (t.x - c.x) ** 2 + (t.z - c.y) ** 2; if (d < bd) { bd = d; best = k; } });
        const t = B.tv[best];
        camera.position.set(t.x, t.y, t.z); camera.lookAt(c.x, hy + 0.6, c.y);
        const fov = clamp(2 * Math.atan(9 / Math.max(10, Math.sqrt(bd))) * 57.3, 8, 60);
        camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 4)); camera.updateProjectionMatrix();
      } else {
        const back = T.kart ? 4.2 : 8.5, up = T.kart ? 1.7 : 2.6;
        cs.x = lerp(cs.x, c.x - fx * back, Math.min(1, dt * 7)); cs.z = lerp(cs.z, c.y - fz * back, Math.min(1, dt * 7)); cs.y = lerp(cs.y, hy + up, Math.min(1, dt * 5));
        camera.position.set(cs.x, cs.y, cs.z); camera.lookAt(c.x + fx * 6, hy + 0.8, c.y + fz * 6);
        if (Math.abs(camera.fov - 65) > 0.05) { camera.fov = 65; camera.updateProjectionMatrix(); }
      }
      B.sun.position.set(c.x + B.sunDir.x * 200, hy + B.sunDir.y * 200, c.y + B.sunDir.z * 200); B.sun.target.position.set(c.x, hy, c.y); B.sun.target.updateMatrixWorld();
      if (B.mirrorRT && cockpit && (B.mf = (B.mf || 0) + 1) % 2 === 0) {
        B.mirrorCam.position.set(c.x - fx * 2.6, hy + 1.15, c.y - fz * 2.6);
        B.mirrorCam.lookAt(c.x - fx * 40, hy + 0.6, c.y - fz * 40);
        B.rain.visible = false;
        renderer.setRenderTarget(B.mirrorRT); renderer.render(scene, B.mirrorCam); renderer.setRenderTarget(null);
      }
    }
    B.rain.visible = rainK > 0.02;
    if (B.rain.visible) {
      const p = B.rain.geometry.attributes.position, cp = camera.position, n = Math.floor(B.drops.length * clamp(rainK, 0.1, 1));
      const vx = focusC ? Math.cos(focusC.th) * (focusC.v || 0) : 0, vz = focusC ? Math.sin(focusC.th) * (focusC.v || 0) : 0;
      for (let k = 0; k < B.drops.length; k++) {
        const d = B.drops[k];
        d[1] -= dt * 14; d[0] -= vx * dt * 0.3; d[2] -= vz * dt * 0.3;
        if (d[1] < -2 || Math.abs(d[0]) > 30 || Math.abs(d[2]) > 30) { d[0] = Math.random() * 60 - 30; d[1] = 18 + Math.random() * 4; d[2] = Math.random() * 60 - 30; }
        if (k >= n) { p.setXYZ(k * 2, 0, -999, 0); p.setXYZ(k * 2 + 1, 0, -999, 0); continue; }
        const x = cp.x + d[0], y = cp.y + d[1] - 4, z = cp.z + d[2];
        p.setXYZ(k * 2, x, y, z); p.setXYZ(k * 2 + 1, x + vx * 0.012, y + 0.5, z + vz * 0.012);
      }
      p.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }
  return { init, resize, frame, get built() { return B; } };
})();
