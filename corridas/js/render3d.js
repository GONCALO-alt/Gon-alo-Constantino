/* Desenho em 3D (Three.js): pista, cenário, carros e cockpit em primeira pessoa.
   Coordenadas: o x e o y do mapa (metros) passam a x e z; a altura é o y. */
'use strict';

const R3D = (() => {
  let renderer = null, scene, camera, cv, VW = 0, VH = 0;
  let built = null; // { T, group, cars: Map, gantry: [], cockpit, line }
  const tex = {};
  const camState = { fov: 72, x: 0, y: 1, z: 0, look: null, roll: 0, pitch: 0, bob: 0 };

  function canvasTex(w, h, draw, repeat = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    t.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
    return t;
  }
  function noise(g, w, h, base, amp, seed) {
    const im = g.createImageData(w, h), r = mulberry32(seed);
    for (let i = 0; i < w * h; i++) { const v = (r() - 0.5) * amp; im.data[i * 4] = base[0] + v; im.data[i * 4 + 1] = base[1] + v; im.data[i * 4 + 2] = base[2] + v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0);
  }
  function makeTextures() {
    tex.asphalt = canvasTex(256, 512, (g, w, h) => {
      noise(g, w, h, [70, 72, 76], 22, 3);
      // borracha ao centro e linhas brancas nas bermas
      const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(10,10,12,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#ececec'; g.fillRect(3, 0, 5, h); g.fillRect(w - 8, 0, 5, h);
    });
    tex.kerb = canvasTex(32, 128, (g, w, h) => { g.fillStyle = '#d61c1c'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2f2f2'; g.fillRect(0, h / 2, w, h / 2); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, 0, 3, h); });
    tex.grass = canvasTex(256, 256, (g, w, h) => { noise(g, w, h, [64, 118, 52], 18, 5); g.fillStyle = 'rgba(255,255,255,.045)'; g.fillRect(0, 0, w / 2, h); });
    tex.gravel = canvasTex(128, 128, (g, w, h) => noise(g, w, h, [196, 176, 136], 50, 9));
    tex.apron = canvasTex(128, 128, (g, w, h) => noise(g, w, h, [116, 120, 126], 16, 4));
    tex.armco = canvasTex(64, 32, (g, w, h) => { g.fillStyle = '#b9bec6'; g.fillRect(0, 0, w, h); g.fillStyle = '#8b9098'; g.fillRect(0, 10, w, 3); g.fillRect(0, 20, w, 3); g.fillStyle = '#5b6068'; g.fillRect(0, h - 3, w, 3); });
    tex.tyres = canvasTex(64, 32, (g, w, h) => { for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#e8e8e8' : '#c91d1d'; g.fillRect((k * w) / 4, 0, w / 4, h); } g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 4; k++) g.fillRect((k * w) / 4, 0, 2, h); });
    tex.crowd = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#6d737d'; g.fillRect(0, 0, w, h); const r = mulberry32(7); for (let y = 2; y < h; y += 5) for (let x = 1; x < w; x += 3) { g.fillStyle = ['#e63946', '#f1faee', '#ffb703', '#219ebc', '#8ecae6', '#fb8500', '#2a2a2a', '#d9d9d9'][Math.floor(r() * 8)]; g.fillRect(x, y, 2, 3); } });
    tex.blob = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }, false);
    tex.smoke = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(235,235,235,.8)'); gr.addColorStop(1, 'rgba(235,235,235,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }, false);
    tex.sky = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2f6fc4'); gr.addColorStop(0.55, '#8cc0ef'); gr.addColorStop(1, '#d9ebf7'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, false);
    tex.hills = canvasTex(1024, 128, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      const r = mulberry32(21);
      for (const [col, base, amp] of [['#7e9bb3', 60, 50], ['#5f7f6a', 85, 30]]) {
        g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
        let y = base; for (let x = 0; x <= w; x += 8) { y = clamp(y + (r() - 0.5) * 14, base - amp, base + 10); g.lineTo(x, y); }
        g.lineTo(w, h); g.fill();
      }
    });
    tex.hills.wrapT = THREE.ClampToEdgeWrapping;
  }
  function init(canvas) {
    cv = canvas;
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(1.6, window.devicePixelRatio || 1));
      if ('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
      makeTextures();
    }
    resize();
  }
  function resize() {
    if (!renderer) return;
    const r = cv.getBoundingClientRect(); VW = r.width; VH = r.height;
    renderer.setSize(VW, VH, false);
    if (camera) { camera.aspect = VW / Math.max(1, VH); camera.updateProjectionMatrix(); }
  }

  // ---------- geometria da pista ----------
  // fita ao longo da pista entre dois desvios laterais (a e b); runs = listas de índices
  function ribbon(T, run, a, b, y, mat, vScale, closed) {
    const n = run.length + (closed ? 1 : 0);
    const pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = [];
    let v = 0;
    for (let k = 0; k < n; k++) {
      const i = run[k % run.length];
      const oa = typeof a === 'function' ? a(i) : a, ob = typeof b === 'function' ? b(i) : b;
      pos.set([T.x[i] + T.nx[i] * oa, y, T.y[i] + T.ny[i] * oa, T.x[i] + T.nx[i] * ob, y, T.y[i] + T.ny[i] * ob], k * 6);
      if (k > 0) v += T.ds / vScale;
      uv.set([0, v, 1, v], k * 4);
      if (k < n - 1) { const q = k * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    // a normal tem de apontar para cima
    const nrm = g.attributes.normal; for (let k = 0; k < nrm.count; k++) if (nrm.getY(k) < 0) { nrm.setXYZ(k, 0, 1, 0); }
    const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; m.updateMatrix();
    return m;
  }
  function wall(T, run, off, h, mat, vScale) {
    const n = run.length;
    const pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = [];
    let v = 0;
    for (let k = 0; k < n; k++) {
      const i = run[k], x = T.x[i] + T.nx[i] * off, z = T.y[i] + T.ny[i] * off;
      pos.set([x, 0, z, x, h, z], k * 6);
      if (k > 0) v += T.ds / vScale;
      uv.set([v, 0, v, 1], k * 4);
      if (k < n - 1) { const q = k * 2; idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; m.updateMatrix();
    return m;
  }
  const runsOf = (T, flag) => {
    const out = []; let cur = null;
    for (let k = 0; k <= T.n; k++) { const i = k % T.n; if (k < T.n && flag(i)) { if (!cur) { cur = []; out.push(cur); } cur.push(i); } else if (cur) { cur.push(i); cur = null; } }
    return out;
  };
  const allIdx = (T) => Array.from({ length: T.n }, (_, i) => i);
  function lam(t, rep, extra = {}) { t.needsUpdate = true; const m = new THREE.MeshLambertMaterial({ map: t, ...extra }); if (rep) { t.repeat.set(rep[0], rep[1]); } return m; }

  function build(R, teams) {
    const T = R.T;
    if (built && built.T === T) { resetCars(R); return; }
    if (built) { scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    scene = new THREE.Scene();
    scene.background = tex.sky;
    scene.fog = new THREE.Fog(0xcfe3f2, T.kart ? 120 : 260, T.kart ? 700 : 1700);
    camera = new THREE.PerspectiveCamera(72, VW / Math.max(1, VH), 0.05, 4000);
    scene.add(camera);
    scene.add(new THREE.HemisphereLight(0xdfefff, 0x4a6a3a, 0.75));
    const sun = new THREE.DirectionalLight(0xfff4e0, 0.85); sun.position.set(300, 600, 200); scene.add(sun);
    const half = T.W / 2;
    const cx = (T.bbox[0] + T.bbox[2]) / 2, cz = (T.bbox[1] + T.bbox[3]) / 2, span = Math.max(T.bbox[2] - T.bbox[0], T.bbox[3] - T.bbox[1]);
    // relva
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(span + 3000, span + 3000), lam(tex.grass.clone(), null));
    ground.material.map.needsUpdate = true; ground.material.map.repeat.set((span + 3000) / 30, (span + 3000) / 30);
    ground.rotation.x = -Math.PI / 2; ground.position.set(cx, 0, cz); scene.add(ground);
    // montanhas ao longe
    const hills = new THREE.Mesh(new THREE.CylinderGeometry(span * 0.8 + 900, span * 0.8 + 900, 260, 64, 1, true), new THREE.MeshBasicMaterial({ map: tex.hills, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    tex.hills.repeat.set(4, 1); hills.position.set(cx, 120, cz); scene.add(hills);
    const all = allIdx(T);
    // escapatória
    const apronW = T.kart ? 2 : 6;
    scene.add(ribbon(T, all, -half - apronW, half + apronW, 0.01, T.kart ? new THREE.MeshLambertMaterial({ color: 0x5d9a4e }) : lam(tex.apron.clone(), [apronW / 2, 1]), 6, true));
    // gravilha
    for (const sd of [-1, 1]) for (const run of runsOf(T, (i) => T.gravel[i] === sd)) {
      const a = sd * (half + apronW * 0.6), b = sd * (half + T.runoff - 0.4);
      scene.add(ribbon(T, run, Math.min(a, b), Math.max(a, b), 0.015, lam(tex.gravel.clone(), [3, 1]), 5, false));
    }
    // asfalto
    const asp = tex.asphalt.clone(); asp.needsUpdate = true;
    scene.add(ribbon(T, all, -half, half, 0.03, new THREE.MeshLambertMaterial({ map: asp }), 12, true));
    // borracha na trajetória ideal
    scene.add(ribbon(T, all, (i) => T.off[i] - (T.kart ? 0.8 : 1.2), (i) => T.off[i] + (T.kart ? 0.8 : 1.2), 0.035, new THREE.MeshLambertMaterial({ color: 0x141416, transparent: true, opacity: 0.22, depthWrite: false }), 10, true));
    // corretores (ligeiramente acima)
    for (const sd of [-1, 1]) for (const run of runsOf(T, (i) => T.kerb[i])) {
      const a = sd * (half - 0.15), b = sd * (half + 0.95);
      const kt = tex.kerb.clone(); kt.needsUpdate = true;
      scene.add(ribbon(T, run, Math.min(a, b), Math.max(a, b), 0.05, new THREE.MeshLambertMaterial({ map: kt }), 3.2, false));
    }
    // barreiras: rails metálicos, e muro de pneus nas curvas
    const armMat = new THREE.MeshLambertMaterial({ map: tex.armco, side: THREE.DoubleSide });
    const tyreMat = new THREE.MeshLambertMaterial({ map: tex.tyres, side: THREE.DoubleSide });
    for (const sd of [-1, 1]) {
      const ex = (i) => T.pit && sd === T.pit.side && R.relIdx(i) > T.pit.i0 - 25 && R.relIdx(i) < T.pit.i1 + 25;
      for (const run of runsOf(T, (i) => !ex(i))) {
        scene.add(wall(T, run, sd * (half + T.runoff), T.kart ? 0.7 : 1.0, armMat, 4));
        for (const r2 of runsOf({ n: run.length }, (k) => T.gravel[run[k]] === sd)) scene.add(wall(T, r2.map((k) => run[k % run.length]), sd * (half + T.runoff - 0.6), 0.75, tyreMat, 2.2));
      }
    }
    // boxes
    if (T.pit) {
      const pit = T.pit, sd = pit.side, idx = []; for (let i = pit.i0 - 25; i <= pit.i1 + 25; i++) idx.push((i + T.n) % T.n);
      const pa = tex.asphalt.clone(); pa.needsUpdate = true;
      scene.add(ribbon(T, idx, sd > 0 ? half + 1 : -(pit.off + 6), sd > 0 ? pit.off + 6 : -(half + 1), 0.028, new THREE.MeshLambertMaterial({ map: pa }), 12, false));
      const wl = []; for (let i = pit.i0; i <= pit.i1; i++) wl.push((i + T.n) % T.n);
      scene.add(wall(T, wl, sd * (half + 3.4), 1.1, new THREE.MeshLambertMaterial({ color: 0xe9e9e9, side: THREE.DoubleSide }), 4));
      const bw = []; for (let i = pit.i0 - 25; i <= pit.i1 + 25; i++) bw.push((i + T.n) % T.n);
      scene.add(wall(T, bw, sd * (pit.off + 14), 9, new THREE.MeshLambertMaterial({ color: 0xd5d9df, side: THREE.DoubleSide }), 30));
      // garagens
      const step = Math.max(1, Math.round(((pit.i1 - pit.i0) * 0.85) / 10));
      for (let k = 0; k < 10; k++) {
        const i = (pit.i0 + Math.round((pit.i1 - pit.i0) * 0.07) + k * step + T.n) % T.n;
        const col = teams && teams[k] ? new THREE.Color(teams[k][1]) : new THREE.Color(0x666666);
        const box = new THREE.Mesh(new THREE.BoxGeometry(step * T.ds * 0.9, 4.5, 0.3), new THREE.MeshLambertMaterial({ color: col }));
        const x = T.x[i] + T.nx[i] * sd * (pit.off + 13.6), z = T.y[i] + T.ny[i] * sd * (pit.off + 13.6);
        box.position.set(x, 6.2, z); box.rotation.y = -Math.atan2(T.ty[i], T.tx[i]); scene.add(box);
      }
    }
    // pórtico da partida com as 5 luzes
    {
      const i = Math.round(-6 / T.ds + T.n) % T.n, th = Math.atan2(T.ty[i], T.tx[i]);
      const g = new THREE.Group(); g.position.set(T.x[i], 0, T.y[i]); g.rotation.y = -th;
      const metal = new THREE.MeshLambertMaterial({ color: 0x2b2f36 });
      const wd = T.W + 4;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, wd), metal); bar.position.set(0, T.kart ? 4 : 6.3, 0); g.add(bar);
      for (const sd of [-1, 1]) { const pole = new THREE.Mesh(new THREE.BoxGeometry(0.4, T.kart ? 4.5 : 7, 0.4), metal); pole.position.set(0, (T.kart ? 4.5 : 7) / 2, (sd * wd) / 2); g.add(pole); }
      built = { T };
      built.gantry = [];
      for (let k = 0; k < 5; k++) {
        const m = new THREE.Mesh(new THREE.CircleGeometry(0.32, 20), new THREE.MeshBasicMaterial({ color: 0x2a0606 }));
        m.position.set(-0.32, T.kart ? 4 : 6.3, (k - 2) * 0.9); m.rotation.y = -Math.PI / 2; g.add(m); built.gantry.push(m);
      }
      scene.add(g);
      // linha de meta
      const fin = canvasTex(64, 8, (q, w, h) => { for (let a = 0; a < 16; a++) for (let b = 0; b < 2; b++) { q.fillStyle = (a + b) & 1 ? '#111' : '#fff'; q.fillRect(a * 4, b * 4, 4, 4); } }, false);
      const line = new THREE.Mesh(new THREE.PlaneGeometry(T.W, 1.2), new THREE.MeshLambertMaterial({ map: fin }));
      line.rotation.x = -Math.PI / 2; line.rotation.z = -th + Math.PI / 2; line.position.set(T.x[0], 0.045, T.y[0]); scene.add(line);
    }
    // lugares da grelha
    {
      const gap = T.kart ? 6.5 : 8, mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let k = 0; k < R.cars.length; k++) {
        const pt = trackPoint(T, T.len - 12 - k * gap + (T.kart ? 1 : 2), (k % 2 ? 1 : -1) * T.W * 0.22);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.25, T.kart ? 3 : 4.2), mat);
        m.rotation.x = -Math.PI / 2; m.rotation.z = -pt.th; m.position.set(pt.x, 0.04, pt.y); scene.add(m);
      }
    }
    // placas de travagem antes das curvas (150, 100, 50 m)
    {
      const prof = R.me.prof, boards = [];
      for (let i = 0; i < T.n; i++) {
        const v0 = prof.v[i], v1 = prof.v[(i + Math.round(60 / T.ds)) % T.n];
        if (v0 - v1 > (T.kart ? 4 : 12) && (!boards.length || i - boards[boards.length - 1] > 300 / T.ds)) boards.push(i);
      }
      for (const i0 of boards) for (const d of T.kart ? [50, 25] : [150, 100, 50]) {
        const apex = (i0 + Math.round(60 / T.ds)) % T.n, i = (apex - Math.round(d / T.ds) + T.n) % T.n;
        const sd = T.k[apex] > 0 ? -1 : 1;
        const t = canvasTex(64, 48, (q, w, h) => { q.fillStyle = '#fff'; q.fillRect(0, 0, w, h); q.fillStyle = '#111'; q.font = 'bold 30px sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(String(d), w / 2, h / 2 + 2); }, false);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.05), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide }));
        m.position.set(T.x[i] + T.nx[i] * sd * (half + (T.kart ? 2.2 : 5)), 1.0, T.y[i] + T.ny[i] * sd * (half + (T.kart ? 2.2 : 5)));
        m.rotation.y = -Math.atan2(T.ty[i], T.tx[i]) + Math.PI / 2; scene.add(m);
      }
    }
    // bancadas
    for (const st of T.stands) {
      const i = st.i, sd = st.side, th = Math.atan2(T.ty[i], T.tx[i]);
      const crowd = tex.crowd.clone(); crowd.needsUpdate = true; crowd.repeat.set(st.length / 12, 1);
      const g = new THREE.Group();
      const d = st.dist + 6;
      g.position.set(T.x[i] + T.nx[i] * sd * d, 0, T.y[i] + T.ny[i] * sd * d); g.rotation.y = -th;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(st.length, 9), new THREE.MeshLambertMaterial({ map: crowd, side: THREE.DoubleSide }));
      face.position.set(0, 4.5, 0); face.rotation.x = sd * 0.5; g.add(face);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(st.length, 0.3, 8), new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
      roof.position.set(0, 10.5, sd * 3); g.add(roof);
      scene.add(g);
    }
    // árvores (instanciadas)
    {
      const n = T.trees.length;
      const crown = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 2.2, 7), new THREE.MeshLambertMaterial({ color: 0x2f6a30 }), n);
      const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 1, 5), new THREE.MeshLambertMaterial({ color: 0x5b3b22 }), n);
      const M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
      T.trees.forEach((t, k) => {
        const r = t[2];
        sc.set(r, r * (1 + t[3]), r); p.set(t[0], r * 1.1 * (1 + t[3]) + r * 0.6, t[1]); M.compose(p, q, sc); crown.setMatrixAt(k, M);
        sc.set(r, r * 1.4, r); p.set(t[0], r * 0.7, t[1]); M.compose(p, q, sc); trunk.setMatrixAt(k, M);
      });
      scene.add(crown, trunk);
    }
    // trajetória ideal (ajuda)
    {
      const n = T.n, pos = new Float32Array((n + 1) * 6), col = new Float32Array((n + 1) * 6), idx = [];
      const prof = R.me.prof;
      for (let k = 0; k <= n; k++) {
        const i = k % n, o = T.off[i], w = T.kart ? 0.22 : 0.35;
        pos.set([T.x[i] + T.nx[i] * (o - w), 0.06, T.y[i] + T.ny[i] * (o - w), T.x[i] + T.nx[i] * (o + w), 0.06, T.y[i] + T.ny[i] * (o + w)], k * 6);
        const v = prof.v, brake = v[(i + 6) % n] < v[i] - 0.4, coast = !brake && v[(i + 3) % n] < v[i] + 0.05;
        const c = brake ? [1, 0.23, 0.19] : coast ? [1, 0.84, 0.04] : [0.19, 0.82, 0.35];
        col.set([...c, ...c], k * 6);
        if (k < n) { const q2 = k * 2; idx.push(q2, q2 + 1, q2 + 2, q2 + 1, q2 + 3, q2 + 2); }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx);
      built.line = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false, side: THREE.DoubleSide }));
      scene.add(built.line);
    }
    // fumo
    built.smoke = [];
    for (let k = 0; k < 50; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.smoke, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; scene.add(s); built.smoke.push({ s, life: 0, t: 0 }); }
    built.T = T;
    built.cars = new Map();
    resetCars(R);
    built.cockpit = makeCockpit(R);
    camera.add(built.cockpit.group);
  }
  function resetCars(R) {
    for (const [, m] of built.cars) scene.remove(m.group);
    built.cars = new Map();
    for (const c of R.cars) { const m = makeCar(R.T.cat, c.d.c1, c.d.c2, c.d.helmet, R.C); scene.add(m.group); built.cars.set(c.id, m); }
  }
  // ---------- carros em 3D (apontam para +x) ----------
  const matCache = new Map();
  function std(color, rough = 0.45, metal = 0.25) { const k = color + rough + metal; if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: rough, metalness: metal })); return matCache.get(k); }
  function box(g, w, h, d, x, y, z, mat) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); g.add(m); return m; }
  function makeCar(cat, c1, c2, helmet, C) {
    const g = new THREE.Group(), L = C.carLen, W = C.carW, wheels = [];
    const tyre = std('#141414', 0.9, 0), rim = std('#9aa0a8', 0.3, 0.7), body = std(c1), body2 = std(c2), dark = std('#18191c', 0.6, 0.2);
    const wheel = (x, z, r, w) => {
      const wg = new THREE.Group(); wg.position.set(x, r, z);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 16), tyre); t.rotation.x = Math.PI / 2; wg.add(t);
      const h = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w * 1.02, 10), rim); h.rotation.x = Math.PI / 2; wg.add(h);
      g.add(wg); wheels.push(wg); return wg;
    };
    if (cat === 'kart') {
      wheel(L * 0.32, -W * 0.42, 0.13, 0.13); wheel(L * 0.32, W * 0.42, 0.13, 0.13); wheel(-L * 0.33, -W * 0.43, 0.14, 0.2); wheel(-L * 0.33, W * 0.43, 0.14, 0.2);
      box(g, L * 0.85, 0.04, W * 0.55, 0, 0.08, 0, dark);
      box(g, L * 0.22, 0.18, W * 0.5, L * 0.4, 0.18, 0, body);
      box(g, L * 0.4, 0.14, W * 0.12, -L * 0.02, 0.16, -W * 0.42, body); box(g, L * 0.4, 0.14, W * 0.12, -L * 0.02, 0.16, W * 0.42, body);
      box(g, L * 0.08, 0.2, W * 0.75, -L * 0.48, 0.18, 0, dark);
      box(g, L * 0.2, 0.32, W * 0.32, -L * 0.12, 0.3, 0, body2); // banco + piloto
      box(g, L * 0.25, 0.3, W * 0.36, -L * 0.05, 0.55, 0, std(c1, 0.8, 0));
      const hm = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), std(helmet.c1, 0.3, 0.2)); hm.position.set(-L * 0.02, 0.85, 0); g.add(hm);
      box(g, 0.05, 0.06, 0.18, L * 0.06, 0.86, 0, std('#111', 0.2, 0.5));
    } else {
      const fr = 0.33, rr = 0.36;
      wheel(L * 0.3, -W * 0.4, fr, 0.34); wheel(L * 0.3, W * 0.4, fr, 0.34); wheel(-L * 0.3, -W * 0.39, rr, 0.42); wheel(-L * 0.3, W * 0.39, rr, 0.42);
      box(g, L * 0.5, 0.36, W * 0.3, L * 0.02, 0.34, 0, body); // monocoque
      box(g, L * 0.3, 0.2, W * 0.14, L * 0.36, 0.26, 0, body); // nariz
      box(g, L * 0.07, 0.05, W, L * 0.47, 0.12, 0, body2); box(g, L * 0.09, 0.22, 0.04, L * 0.46, 0.18, -W * 0.5, dark); box(g, L * 0.09, 0.22, 0.04, L * 0.46, 0.18, W * 0.5, dark);
      box(g, L * 0.3, 0.34, W * 0.2, -L * 0.06, 0.3, -W * 0.25, body); box(g, L * 0.3, 0.34, W * 0.2, -L * 0.06, 0.3, W * 0.25, body);
      box(g, L * 0.32, 0.4, W * 0.16, -L * 0.24, 0.6, 0, body); // tampa do motor
      box(g, L * 0.06, 0.32, W * 0.12, -L * 0.04, 0.82, 0, body2); // entrada de ar
      box(g, L * 0.09, 0.04, W * 0.78, -L * 0.47, 0.95, 0, body2); box(g, L * 0.09, 0.04, W * 0.78, -L * 0.45, 0.82, 0, body);
      box(g, L * 0.12, 0.6, 0.04, -L * 0.46, 0.68, -W * 0.39, dark); box(g, L * 0.12, 0.6, 0.04, -L * 0.46, 0.68, W * 0.39, dark);
      box(g, 0.1, 0.5, 0.08, -L * 0.43, 0.6, 0, dark);
      box(g, L * 0.14, 0.03, W * 0.55, -L * 0.46, 0.08, 0, dark); // difusor
      const hm = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), std(helmet.c1, 0.3, 0.2)); hm.position.set(L * 0.04, 0.68, 0); g.add(hm);
      if (cat === 'f2' || cat === 'f1') {
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 6, 18, Math.PI), dark); halo.rotation.set(-Math.PI / 2, 0, Math.PI / 2); halo.position.set(L * 0.05, 0.78, 0); g.add(halo);
        box(g, 0.04, 0.2, 0.05, L * 0.12, 0.7, 0, dark);
      }
    }
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(L * 1.15, W * 1.2), new THREE.MeshBasicMaterial({ map: tex.blob, transparent: true, depthWrite: false }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = 0.04; g.add(blob);
    return { group: g, wheels, spin: 0 };
  }
  // ---------- cockpit (no espaço da câmara: x direita, y cima, -z em frente) ----------
  function makeCockpit(R) {
    const cat = R.T.cat, C = R.C, me = R.me, L = C.carLen, W = C.carW;
    const g = new THREE.Group();
    const body = std(me.d.c1), body2 = std(me.d.c2), dark = std('#141518', 0.6, 0.2), tyre = std('#121212', 0.95, 0);
    const eyeX = cat === 'kart' ? -L * 0.05 : L * 0.04; // posição do piloto no carro
    const eyeY = cat === 'kart' ? 1.0 : 0.98;
    const z = (xCar) => -(xCar - eyeX); // de coordenada do carro (para a frente) para a câmara
    const y = (yCar) => yCar - eyeY;
    const wheels = [];
    const fwheel = (xc, zc, r, w) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 18), tyre); t.rotation.z = Math.PI / 2; t.position.set(zc, y(r), z(xc)); g.add(t); wheels.push(t); };
    if (cat === 'kart') {
      fwheel(L * 0.32, -W * 0.42, 0.13, 0.13); fwheel(L * 0.32, W * 0.42, 0.13, 0.13);
      box(g, W * 0.5, 0.18, L * 0.22, 0, y(0.18), z(L * 0.4), body);
      box(g, W * 0.12, 0.14, L * 0.4, -W * 0.42, y(0.16), z(L * 0.05), body); box(g, W * 0.12, 0.14, L * 0.4, W * 0.42, y(0.16), z(L * 0.05), body);
    } else {
      fwheel(L * 0.3, -W * 0.4, 0.33, 0.34); fwheel(L * 0.3, W * 0.4, 0.33, 0.34);
      // nariz visto de dentro
      // nariz: mais estreito à frente, mais largo junto ao cockpit
      box(g, W * 0.13, 0.18, L * 0.26, 0, y(0.34), z(L * 0.36), body);
      box(g, W * 0.2, 0.22, L * 0.16, 0, y(0.4), z(L * 0.17), body);
      box(g, W * 0.04, 0.02, L * 0.4, 0, y(0.5), z(L * 0.28), body2);
      box(g, W, 0.05, L * 0.07, 0, y(0.12), z(L * 0.47), body2);
      // laterais do cockpit (baixas, para não tapar a vista)
      box(g, 0.08, 0.1, L * 0.14, -W * 0.2, y(0.55), z(L * 0.1), body); box(g, 0.08, 0.1, L * 0.14, W * 0.2, y(0.55), z(L * 0.1), body);
      box(g, 0.13, 0.07, 0.05, -W * 0.38, y(0.72), z(L * 0.09), dark); box(g, 0.13, 0.07, 0.05, W * 0.38, y(0.72), z(L * 0.09), dark); // retrovisores
      box(g, 0.02, 0.14, 0.02, -W * 0.33, y(0.64), z(L * 0.09), dark); box(g, 0.02, 0.14, 0.02, W * 0.33, y(0.64), z(L * 0.09), dark);
      if (cat === 'f2' || cat === 'f1') {
        // pilar central do halo, fino, a subir à frente dos olhos
        const pil = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.03), dark); pil.position.set(0, y(0.82), z(L * 0.15)); pil.rotation.x = -0.5; g.add(pil);
      }
    }
    // volante com ecrã
    const sw = new THREE.Group();
    sw.position.set(0, cat === 'kart' ? -0.33 : -0.29, cat === 'kart' ? -0.5 : -0.56); sw.rotation.x = -0.45;
    if (cat === 'kart') {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.018, 8, 28), std('#1b1b1b', 0.8, 0)); sw.add(rim);
      box(sw, 0.28, 0.03, 0.02, 0, 0, 0, std('#333', 0.5, 0.3));
      box(sw, 0.03, 0.15, 0.02, 0, -0.07, 0, std('#333', 0.5, 0.3));
    } else {
      box(sw, 0.3, 0.13, 0.04, 0, 0, 0, std('#1a1a1a', 0.6, 0.1));
      box(sw, 0.06, 0.16, 0.05, -0.16, 0, 0, std('#222', 0.9, 0)); box(sw, 0.06, 0.16, 0.05, 0.16, 0, 0, std('#222', 0.9, 0));
    }
    const dispC = document.createElement('canvas'); dispC.width = 128; dispC.height = 64;
    const dispT = new THREE.CanvasTexture(dispC);
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(cat === 'kart' ? 0.1 : 0.15, cat === 'kart' ? 0.05 : 0.075), new THREE.MeshBasicMaterial({ map: dispT }));
    disp.position.set(0, cat === 'kart' ? 0.04 : 0.01, 0.025); sw.add(disp);
    g.add(sw);
    // mãos (luvas)
    const glove = std('#1a1a1a', 0.9, 0);
    for (const sd of [-1, 1]) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), glove); h.position.set(sd * (cat === 'kart' ? 0.14 : 0.17), 0, 0.02); h.scale.set(1, 1.4, 1); sw.add(h); }
    return { group: g, sw, disp: { c: dispC, t: dispT, last: 0 }, wheels, eyeX, eyeY };
  }
  function updateDisplay(R) {
    const ck = built.cockpit, d = ck.disp, now = performance.now();
    if (now - d.last < 120) return; d.last = now;
    const g = d.c.getContext('2d'), car = R.me.phys;
    g.fillStyle = '#05070a'; g.fillRect(0, 0, 128, 64);
    const k = clamp((car.rpm - car.p.rpm[0]) / (car.p.rpm[1] - car.p.rpm[0]), 0, 1), n = Math.round(k * 12);
    for (let i = 0; i < 12; i++) { g.fillStyle = i < n ? (i < 4 ? '#30d158' : i < 8 ? '#ff3b30' : '#3a8dff') : '#1b1e24'; g.fillRect(6 + i * 10, 4, 8, 6); }
    g.fillStyle = '#ffd60a'; g.font = 'bold 36px sans-serif'; g.textAlign = 'center'; g.fillText(car.speed < 0.5 ? 'N' : String(car.gear), 64, 50);
    g.fillStyle = '#fff'; g.font = 'bold 16px sans-serif'; g.textAlign = 'left'; g.fillText(String(Math.round(car.speed * 3.6)), 6, 58);
    g.textAlign = 'right'; g.fillText('P' + (R.standings().indexOf(R.me) + 1), 122, 58);
    d.t.needsUpdate = true;
  }
  // ---------- quadro ----------
  function frame(R, view, dt, inp) {
    if (!built || built.T !== R.T) build(R, view.teams);
    const T = R.T, me = R.me, car = me.phys;
    // carros
    for (const c of R.cars) {
      const m = built.cars.get(c.id); if (!m) continue;
      const x = c.isPlayer ? car.x : c.x, z = c.isPlayer ? car.y : c.y, th = c.isPlayer ? car.th : c.th;
      m.group.position.set(x, 0, z); m.group.rotation.y = -th;
      const v = c.isPlayer ? car.speed : c.v;
      m.spin += (v * dt) / 0.33;
      for (const w of m.wheels) w.rotation.z = -m.spin;
      m.group.visible = !(c.isPlayer && view.cam === 'cockpit');
    }
    // luzes do pórtico
    built.gantry.forEach((l, k) => l.material.color.setHex(R.phase === 'lights' && k < R.lightsN ? 0xff1a1a : 0x2a0606));
    built.line.visible = !!view.line;
    // fumo
    if (car.slide > 0.35 && car.speed > 6 && Math.random() < car.slide) {
      const sp = built.smoke.find((q) => q.life <= 0);
      if (sp) { sp.life = 1.1; sp.t = 0; sp.s.position.set(car.x - Math.cos(car.th) * car.p.b, 0.4, car.y - Math.sin(car.th) * car.p.b); sp.s.visible = true; }
    }
    for (const sp of built.smoke) {
      if (sp.life <= 0) continue;
      sp.t += dt; sp.life -= dt; sp.s.position.y += dt * 0.6;
      const k = sp.t / 1.1; sp.s.scale.setScalar(1 + k * 4); sp.s.material.opacity = 0.45 * (1 - k);
      if (sp.life <= 0) sp.s.visible = false;
    }
    // câmara
    const ck = built.cockpit;
    ck.group.visible = view.cam === 'cockpit';
    const fx = Math.cos(car.th), fz = Math.sin(car.th);
    if (view.cam === 'cockpit') {
      // cabeça do piloto: segue o carro, com forças G e vibração
      const lat = clamp(car.latG * Math.sign(car.w || 0), -3, 3), lon = clamp(car.longG, -4, 3);
      camState.roll = lerp(camState.roll, -lat * 0.012, Math.min(1, dt * 6));
      camState.pitch = lerp(camState.pitch, lon * 0.008, Math.min(1, dt * 6));
      const rough = (me.surf === 'corretor' ? 0.012 : me.surf === 'gravilha' || me.surf === 'relva' ? 0.03 : 0) + car.speed * 0.00004;
      const ex = car.x + fx * ck.eyeX, ez = car.y + fz * ck.eyeX;
      camera.position.set(ex + (Math.random() - 0.5) * rough, ck.eyeY + (Math.random() - 0.5) * rough + view.shake * 0.05 * (Math.random() - 0.5), ez);
      camera.rotation.order = 'YXZ';
      camera.rotation.set(-0.09 - camState.pitch, -car.th - Math.PI / 2, camState.roll);
      const fov = (T.kart ? 74 : 70) + clamp(car.speed / car.p.vtop, 0, 1) * 10;
      if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 3)); camera.updateProjectionMatrix(); }
      // volante e rodas da frente acompanham a direção
      const steerVis = car.delta * (T.kart ? 2.2 : 6.5);
      ck.sw.rotation.z = -steerVis;
      for (const w of ck.wheels) { w.rotation.y = -car.delta; }
      updateDisplay(R);
    } else {
      // atrás do carro
      const back = T.kart ? 4.2 : 8.5, up = T.kart ? 1.7 : 2.6;
      const tx = car.x - fx * back, tz = car.y - fz * back;
      camState.x = lerp(camState.x, tx, Math.min(1, dt * 7)); camState.z = lerp(camState.z, tz, Math.min(1, dt * 7));
      camera.position.set(camState.x, up, camState.z);
      camera.lookAt(car.x + fx * 6, 0.8, car.y + fz * 6);
      if (Math.abs(camera.fov - 65) > 0.05) { camera.fov = 65; camera.updateProjectionMatrix(); }
    }
    renderer.render(scene, camera);
    void inp;
  }
  return { init, resize, frame, build, get ok() { return !!window.THREE; } };
})();
