/* Modelos 3D dos carros (Three.js): monolugares com nariz afilado, pontões, halo, asas e suspensão; karts com chassis tubular.
   Coordenadas do carro: +x para a frente, +y para cima, +z para a direita. */
'use strict';

const CARS3D = (() => {
  let envMap = null;
  const texCache = new Map();
  function setEnv(e) { envMap = e; }
  function ctex(key, w, h, draw) {
    if (texCache.has(key)) return texCache.get(key);
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); if ('encoding' in t) t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    texCache.set(key, t); return t;
  }
  const paint = (col) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(col), metalness: 0.35, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, envMap, envMapIntensity: 0.9 });
  const carbonTex = () => ctex('carbon', 64, 64, (g, w) => { g.fillStyle = '#16181c'; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 8) for (let x = 0; x < w; x += 8) { g.fillStyle = (x + y) % 16 ? '#1f2227' : '#121418'; g.fillRect(x, y, 8, 4); g.fillStyle = (x + y) % 16 ? '#121418' : '#1f2227'; g.fillRect(x, y + 4, 8, 4); } });
  const carbon = () => { const t = carbonTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return new THREE.MeshStandardMaterial({ map: t, metalness: 0.4, roughness: 0.4, envMap, envMapIntensity: 0.5 }); };
  // pneu: banda de rodagem e flanco com a cor do composto e a jante
  function tyreTex(color) {
    return ctex('tyre' + color, 256, 256, (g, w) => {
      const c = w / 2;
      g.fillStyle = '#111214'; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
      g.strokeStyle = color; g.lineWidth = 7; g.beginPath(); g.arc(c, c, c * 0.8, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#e8e8e8'; g.font = 'bold 18px sans-serif'; g.textAlign = 'center';
      for (const a of [0, Math.PI]) { g.save(); g.translate(c, c); g.rotate(a); g.fillText('PISTA', 0, -c * 0.86 + 6); g.restore(); }
      // jante com raios
      const gr = g.createRadialGradient(c, c, 4, c, c, c * 0.66); gr.addColorStop(0, '#d8dce2'); gr.addColorStop(1, '#6b7078');
      g.fillStyle = gr; g.beginPath(); g.arc(c, c, c * 0.66, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#1b1d21'; for (let k = 0; k < 10; k++) { g.save(); g.translate(c, c); g.rotate((k * Math.PI) / 5); g.beginPath(); g.moveTo(-6, c * 0.18); g.lineTo(6, c * 0.18); g.lineTo(11, c * 0.6); g.lineTo(-11, c * 0.6); g.fill(); g.restore(); }
      g.fillStyle = '#2a2d33'; g.beginPath(); g.arc(c, c, c * 0.16, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#c9ccd2'; g.beginPath(); g.arc(c, c, c * 0.07, 0, Math.PI * 2); g.fill();
    });
  }
  const treadTex = () => ctex('tread', 64, 32, (g, w, h) => { g.fillStyle = '#18191b'; g.fillRect(0, 0, w, h); g.fillStyle = '#202124'; for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 2, h); });
  function makeWheel(r, w, color) {
    const side = new THREE.MeshStandardMaterial({ map: tyreTex(color), roughness: 0.8, metalness: 0.1 });
    const tt = treadTex(); tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(8, 1);
    const tread = new THREE.MeshStandardMaterial({ map: tt, roughness: 0.92 });
    // pneu com ombros arredondados (perfil rodado à volta do eixo)
    const t = Math.min(r * 0.2, w * 0.3), hw = w / 2, pts = [], seg = 7;
    pts.push(new THREE.Vector2(r * 0.6, -hw));
    for (let k = 0; k <= seg; k++) { const a = -Math.PI / 2 + (k / seg) * (Math.PI / 2); pts.push(new THREE.Vector2(r - t + Math.cos(a) * t, -hw + t + Math.sin(a) * t)); }
    for (let k = 0; k <= seg; k++) { const a = (k / seg) * (Math.PI / 2); pts.push(new THREE.Vector2(r - t + Math.cos(a) * t, hw - t + Math.sin(a) * t)); }
    pts.push(new THREE.Vector2(r * 0.6, hw));
    const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 56), tread); body.castShadow = true;
    const m = new THREE.Group(); m.add(body);
    for (const sd of [-1, 1]) { // flanco com a cor do composto e a jante
      const disc = new THREE.Mesh(new THREE.CircleGeometry(r - t * 0.55, 56), side);
      disc.rotation.x = sd * Math.PI / 2; disc.position.y = sd * (hw + 0.002); if (sd < 0) disc.rotation.z = Math.PI; m.add(disc);
    }
    m.rotation.x = Math.PI / 2;
    const g = new THREE.Group(); g.add(m); g.userData.tyre = m; g.userData.side = side;
    return g;
  }
  function setCompound(car, color) { for (const w of car.wheels) w.userData.side.map = tyreTex(color); }
  // forma extrudida (perfil lateral em x/y, largura em z) que afila com uma função f(x)
  function profileMesh(pts, depth, mat, taper, bevel = 0.03) {
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) sh.lineTo(p[0], p[1]);
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 8 });
    geo.translate(0, 0, -depth / 2);
    if (taper) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) * taper(p.getX(i))); geo.computeVertexNormals(); }
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m;
  }
  // forma vista de cima (x/z), extrudida em altura
  function planMesh(pts, height, mat, yScale, bevel = 0.04) {
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) sh.lineTo(p[0], p[1]);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: height, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 8 });
    geo.rotateX(Math.PI / 2); // a forma passa para o plano x/z, a altura para baixo
    geo.translate(0, height, 0);
    if (yScale) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) * yScale(p.getX(i))); geo.computeVertexNormals(); }
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m;
  }
  const box = (g, w, h, d, x, y, z, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  const rod = (g, a, b, r, mat) => { const v = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, v.length(), 6), mat); m.position.copy(a).addScaledVector(v, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); g.add(m); return m; };
  function textPlane(text, w, h, bg, fg, font) {
    const t = ctex('txt' + text + bg + fg, 256, Math.round((256 * h) / w), (g, cw, ch) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, cw, ch); } else g.clearRect(0, 0, cw, ch); g.fillStyle = fg; g.font = `bold ${Math.round(ch * 0.62)}px ${font || 'sans-serif'}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, cw / 2, ch / 2 + 2); });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: !bg, roughness: 0.4 }));
  }
  // textura do capacete à volta da esfera: x = volta (0 atrás, 0,25 direita, 0,5 frente, 0,75 esquerda), y = de cima para baixo
  function helmTexture(h) {
    const key = 'helm2' + JSON.stringify([h.c1, h.c2, h.c3, h.pattern, h.showNum, h.showName, h.showFlag, h.sponsorTxt, h.num, h.name, h.nat, !!h.flagImg, !!h.hi]);
    return ctex(key, h.hi ? 1024 : 512, h.hi ? 512 : 256, (g, cw) => {
      const sc = cw / 1024, w = 1024, H = 512; g.scale(sc, sc);
      const c1 = h.c1, c2 = h.c2, c3 = h.c3 || '#1b1b1b', p = h.pattern, r = mulberry32(5);
      if (p === 'degrade') { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, c1); gr.addColorStop(0.75, c2); gr.addColorStop(1, c3); g.fillStyle = gr; } else g.fillStyle = c1;
      g.fillRect(0, 0, w, H);
      const both = (fn) => { fn(w * 0.25, 1); fn(w * 0.75, -1); }; // um desenho em cada lado
      g.fillStyle = c2; g.strokeStyle = c2;
      if (p === 'faixa') { for (const x of [0, w * 0.5, w]) g.fillRect(x - w * 0.035, 0, w * 0.07, H * 0.62); g.fillStyle = c3; for (const x of [0, w * 0.5, w]) { g.fillRect(x - w * 0.045, 0, w * 0.01, H * 0.62); g.fillRect(x + w * 0.035, 0, w * 0.01, H * 0.62); } }
      else if (p === 'duplo') for (const x of [0, w * 0.5, w]) { g.fillRect(x - w * 0.07, 0, w * 0.035, H * 0.6); g.fillRect(x + w * 0.035, 0, w * 0.035, H * 0.6); }
      else if (p === 'coroa') { g.fillRect(0, 0, w, H * 0.16); g.fillStyle = c3; g.fillRect(0, H * 0.16, w, H * 0.025); }
      else if (p === 'diagonal') { g.save(); g.beginPath(); g.rect(0, H * 0.2, w, H * 0.6); g.clip(); for (let x = -H; x < w + H; x += 90) { g.fillStyle = (x / 90) % 2 ? c2 : c3; g.beginPath(); g.moveTo(x, H); g.lineTo(x + 34, H); g.lineTo(x + 34 + H * 0.6, 0); g.lineTo(x + H * 0.6, 0); g.fill(); } g.restore(); }
      else if (p === 'estrelas') { const star = (x, y, rr) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, q = k & 1 ? rr * 0.45 : rr; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); }; for (let k = 0; k < 26; k++) { g.fillStyle = k % 3 ? c2 : c3; star(r() * w, H * (0.08 + r() * 0.62), 14 + r() * 26); } }
      else if (p === 'raio') both((x, sd) => { g.beginPath(); const pts = [[-60, 80], [30, 80], [-10, 170], [70, 170], [-50, 330], [-10, 210], [-70, 210]]; pts.forEach(([a, b], k) => (k ? g.lineTo : g.moveTo).call(g, x + a * sd, b)); g.closePath(); g.fill(); g.lineWidth = 6; g.strokeStyle = c3; g.stroke(); });
      else if (p === 'ondas') for (let k = 0; k < 3; k++) { g.fillStyle = k === 1 ? c3 : c2; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= w; x += 8) g.lineTo(x, H * (0.42 + k * 0.1) + Math.sin((x / w) * Math.PI * 8 + k) * 18); g.lineTo(w, H); g.fill(); }
      else if (p === 'xadrez') { const q = 40; for (let y = 0; y < H * 0.45; y += q) for (let x = 0; x < w; x += q) if (((x + y) / q) & 1) g.fillRect(x, y, q, q); g.fillStyle = c3; g.fillRect(0, H * 0.45, w, 10); }
      else if (p === 'circulos') { both((x) => { for (const [rr, col] of [[110, c2], [80, c3], [52, c2], [26, c1]]) { g.fillStyle = col; g.beginPath(); g.arc(x, H * 0.45, rr, 0, 7); g.fill(); } }); g.fillStyle = c2; g.beginPath(); g.ellipse(w / 2, 0, w * 0.5, H * 0.1, 0, 0, 7); g.fill(); }
      else if (p === 'chamas') { for (const [col, top] of [[c2, 0.25], [c3, 0.45]]) { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= w; x += 32) { const k = x / 32; g.quadraticCurveTo(x + 8, H * (top + 0.25), x + 16, H * (top + (k % 3) * 0.06)); g.quadraticCurveTo(x + 22, H * (top + 0.3), x + 32, H * (top + 0.32)); } g.lineTo(w, H); g.fill(); } }
      else if (p === 'camuflado') for (let k = 0; k < 140; k++) { g.fillStyle = k % 2 ? c2 : c3; g.beginPath(); g.ellipse(r() * w, r() * H * 0.85, 20 + r() * 50, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
      else if (p === 'bandeira' && h.flagImg) both((x) => g.drawImage(h.flagImg, x - 130, H * 0.2, 260, 195));
      // anel de baixo e protetor do queixo
      g.fillStyle = c3; g.fillRect(0, H * 0.86, w, H * 0.14);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, H * 0.86, w, 4);
      // faixa por cima da viseira (patrocinador)
      if (h.sponsorTxt) { g.fillStyle = '#111'; g.fillRect(w * 0.38, H * 0.3, w * 0.24, H * 0.07); g.fillStyle = '#fff'; g.font = 'bold 26px "Saira Condensed","Arial Narrow",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(h.sponsorTxt).toUpperCase(), w * 0.5, H * 0.335); }
      // número nos lados e nome atrás
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (h.showNum !== false && h.num != null) both((x, sd) => { const nx = x - sd * 75; g.font = 'italic 900 88px "Saira Condensed","Arial Narrow",sans-serif'; g.lineWidth = 10; g.strokeStyle = c3; g.strokeText(String(h.num), nx, H * 0.68); g.fillStyle = '#fff'; g.fillText(String(h.num), nx, H * 0.68); });
      if (h.showName !== false && h.name) { g.font = 'bold 44px "Saira Condensed","Arial Narrow",sans-serif'; for (const x of [0, w]) { g.lineWidth = 6; g.strokeStyle = c3; g.strokeText(h.name.toUpperCase(), x, H * 0.55); g.fillStyle = '#fff'; g.fillText(h.name.toUpperCase(), x, H * 0.55); } }
      if (h.showFlag && h.flagImg) for (const x of [0, w]) g.drawImage(h.flagImg, x - 40, H * 0.66, 80, 60);
    });
  }
  const VISOR = { escura: [0x10141c, 0.85, 0.12], clara: [0x9fb3c4, 0.2, 0.05], espelho: [0xeef2f6, 0.95, 0.12], dourada: [0xf0b429, 0.95, 0.12], azul: [0x3d7dff, 0.95, 0.12], arco: [0xffffff, 1, 0.06] };
  const visorRainbow = () => ctex('visorArco', 128, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); ['#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#0a84ff', '#5e5ce6', '#bf5af2'].forEach((c, k, a) => gr.addColorStop(k / (a.length - 1), c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  function helmetMesh(h, r) {
    const fin = h.finish || 'brilho';
    const shellMat = new THREE.MeshPhysicalMaterial({ map: helmTexture(h), clearcoat: fin === 'mate' ? 0 : 1, clearcoatRoughness: 0.08, roughness: fin === 'mate' ? 0.78 : fin === 'metal' ? 0.28 : 0.32, metalness: fin === 'metal' ? 0.65 : 0.15, envMap });
    const g = new THREE.Group(), SC = [1.12, 1, 0.94];
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28, 0, Math.PI * 2, 0, Math.PI * 0.84), shellMat);
    s.scale.set(...SC); s.castShadow = true; g.add(s);
    // abertura em baixo, com espuma escura
    const pad = new THREE.Mesh(new THREE.CircleGeometry(r * 0.5, 24), new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 1 })); pad.rotation.x = Math.PI / 2; pad.position.y = -r * 0.87; pad.scale.set(1.12, 0.94, 1); g.add(pad);
    // queixeira por baixo da viseira, um pouco saliente
    const chin = new THREE.Mesh(new THREE.SphereGeometry(r * 1.05, 32, 8, -0.85, 1.7, Math.PI * 0.55, Math.PI * 0.3), shellMat);
    chin.rotation.y = Math.PI; chin.scale.set(...SC); chin.castShadow = true; g.add(chin);
    const vs = VISOR[h.visor] || VISOR.escura;
    const vmat = new THREE.MeshPhysicalMaterial({ color: vs[0], map: h.visor === 'arco' ? visorRainbow() : null, metalness: vs[1], roughness: vs[2], clearcoat: 1, envMap, envMapIntensity: 1.6, transparent: h.visor === 'clara', opacity: 0.75, side: THREE.DoubleSide });
    const visor = new THREE.Mesh(new THREE.SphereGeometry(r * 1.03, 32, 10, -0.95, 1.9, 1.08, 0.5), vmat);
    visor.rotation.y = Math.PI; visor.scale.set(...SC); g.add(visor);
    // aro da viseira
    const rimM = new THREE.MeshStandardMaterial({ color: 0x1b1d21, roughness: 0.5 });
    for (const th of [1.08, 1.58]) { const ring = new THREE.Mesh(new THREE.SphereGeometry(r * 1.035, 32, 1, -0.97, 1.94, th - 0.012, 0.024), rimM); ring.rotation.y = Math.PI; ring.scale.set(...SC); g.add(ring); }
    const dark = new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.6 });
    for (const sd of [-1, 1]) { const piv = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.12, r * 0.04, 16), dark); piv.rotation.x = Math.PI / 2; piv.position.set(r * 0.05, -r * 0.08, sd * r * 0.96); g.add(piv); }
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(r * 0.35, r * 0.06, r * 0.9), shellMat); spoiler.position.set(-r * 1.0, r * 0.32, 0); spoiler.rotation.z = -0.35; g.add(spoiler);
    const vent = new THREE.Mesh(new THREE.BoxGeometry(r * 0.3, r * 0.08, r * 0.3), dark); vent.position.set(r * 0.25, r * 0.96, 0); g.add(vent);
    return g;
  }
  // ---------- monolugar ----------
  function formula(cat, C, c1, c2, helmet, num, sponsor) {
    const g = new THREE.Group(), L = C.carLen, W = C.carW, wheels = [], front = [];
    const body = paint(c1), body2 = paint(c2), cf = carbon(), dark = new THREE.MeshStandardMaterial({ color: 0x1b1d21, roughness: 0.5, metalness: 0.3 });
    const fr = cat === 'f4' ? 0.3 : 0.33, rr = cat === 'f4' ? 0.32 : 0.36, fw = 0.32, rw = 0.4;
    // rodas
    for (const [x, z, r, w, isF] of [[L * 0.3, -W * 0.4, fr, fw, 1], [L * 0.3, W * 0.4, fr, fw, 1], [-L * 0.3, -W * 0.39, rr, rw, 0], [-L * 0.3, W * 0.39, rr, rw, 0]]) {
      const wg = makeWheel(r, w, '#f2c230'); wg.position.set(x, r, z); g.add(wg); wheels.push(wg); if (isF) front.push(wg);
      // suspensão (braços duplos)
      const hub = new THREE.Vector3(x, r, z * 0.88);
      for (const dy of [-0.08, 0.1]) { rod(g, new THREE.Vector3(x + 0.25, 0.3 + dy, Math.sign(z) * W * 0.12), hub.clone().setY(r + dy), 0.018, cf); rod(g, new THREE.Vector3(x - 0.25, 0.3 + dy, Math.sign(z) * W * 0.12), hub.clone().setY(r + dy), 0.018, cf); }
    }
    // fundo plano
    const floor = planMesh([[L * 0.15, -W * 0.18], [L * 0.05, -W * 0.46], [-L * 0.36, -W * 0.36], [-L * 0.45, -W * 0.25], [-L * 0.45, W * 0.25], [-L * 0.36, W * 0.36], [L * 0.05, W * 0.46], [L * 0.15, W * 0.18]], 0.03, cf, null, 0.01);
    floor.position.y = 0.05; g.add(floor);
    // nariz e monocoque (perfil lateral, a afilar para a frente)
    const nose = profileMesh([[L * 0.5, 0.17], [L * 0.38, 0.3], [L * 0.2, 0.44], [L * 0.1, 0.6], [-L * 0.04, 0.6], [-L * 0.06, 0.18], [L * 0.3, 0.13], [L * 0.5, 0.12]], W * 0.3, body,
      (x) => (x > L * 0.08 ? lerp(1, 0.35, clamp((x - L * 0.08) / (L * 0.42), 0, 1)) : 1), 0.04);
    g.add(nose);
    // linha da cor secundária ao longo do nariz
    const stripe = profileMesh([[L * 0.49, 0.2], [L * 0.38, 0.32], [L * 0.2, 0.46], [L * 0.12, 0.6], [L * 0.1, 0.62], [L * 0.19, 0.48], [L * 0.37, 0.34], [L * 0.48, 0.22]], W * 0.08, body2, null, 0.01);
    stripe.position.y = 0.005; g.add(stripe);
    // pontões laterais (vistos de cima, descem para trás)
    for (const sd of [-1, 1]) {
      const sp = planMesh([[L * 0.08, sd * W * 0.15], [L * 0.04, sd * W * 0.44], [-L * 0.1, sd * W * 0.43], [-L * 0.3, sd * W * 0.27], [-L * 0.36, sd * W * 0.13]], 0.36, body, (x) => lerp(0.45, 1, clamp((x + L * 0.36) / (L * 0.38), 0, 1)));
      sp.position.y = 0.08; g.add(sp);
      const inlet = box(g, 0.04, 0.22, W * 0.24, L * 0.06, 0.32, sd * W * 0.3, dark); void inlet;
      // patrocinador no pontão
      if (sponsor) { const tp = textPlane(sponsor, L * 0.2, 0.15, null, '#ffffff'); tp.position.set(-L * 0.09, 0.36, sd * W * 0.44); tp.rotation.y = sd > 0 ? 0 : Math.PI; g.add(tp); }
    }
    // tampa do motor e barbatana
    const cover = profileMesh([[-L * 0.02, 0.6], [-L * 0.04, 1.0], [-L * 0.12, 1.02], [-L * 0.44, 0.66], [-L * 0.44, 0.3], [-L * 0.04, 0.3]], W * 0.22, body,
      (x) => lerp(0.3, 1, clamp((x + L * 0.44) / (L * 0.4), 0, 1)), 0.03);
    g.add(cover);
    box(g, 0.06, 0.22, 0.2, -L * 0.03, 0.88, 0, dark); // entrada de ar
    // asa da frente (3 elementos) e placas laterais
    for (let k = 0; k < 3; k++) box(g, L * 0.05, 0.022, W * (0.98 - k * 0.06), L * (0.475 - k * 0.025), 0.09 + k * 0.035, 0, k === 0 ? body2 : k === 1 ? body : cf);
    for (const sd of [-1, 1]) box(g, L * 0.1, 0.2, 0.025, L * 0.455, 0.16, sd * W * 0.5, cf);
    // asa de trás
    const rwg = new THREE.Group(); g.add(rwg);
    box(rwg, L * 0.075, 0.03, W * 0.76, -L * 0.47, 0.92, 0, body2); box(rwg, L * 0.045, 0.025, W * 0.76, -L * 0.43, 0.99, 0, body);
    for (const sd of [-1, 1]) box(rwg, L * 0.15, 0.62, 0.03, -L * 0.46, 0.7, sd * W * 0.39, body);
    box(rwg, 0.06, 0.55, 0.05, -L * 0.42, 0.62, 0, cf);
    box(g, L * 0.13, 0.15, W * 0.55, -L * 0.45, 0.14, 0, cf); // difusor
    const light = box(g, 0.02, 0.06, 0.18, -L * 0.5, 0.36, 0, new THREE.MeshBasicMaterial({ color: 0x400000 }));
    // halo (todas as fórmulas): pilar central e arco à volta da cabeça
    {
      const hm = cf, tube = (pts, r) => { const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))); const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, r, 12), hm); m.scale.y = 1; m.castShadow = true; g.add(m); return m; };
      const hz = W * 0.15, top = 0.98;
      tube([[L * 0.175, 0.56, 0], [L * 0.16, 0.76, 0], [L * 0.13, 0.93, 0], [L * 0.105, top, 0]], 0.03);
      tube([[-L * 0.07, 0.6, -hz * 0.95], [-L * 0.06, 0.9, -hz], [-L * 0.02, top, -hz], [L * 0.05, top + 0.01, -hz * 0.85], [L * 0.105, top, 0], [L * 0.05, top + 0.01, hz * 0.85], [-L * 0.02, top, hz], [-L * 0.06, 0.9, hz], [-L * 0.07, 0.6, hz * 0.95]], 0.036);
      for (const sd of [-1, 1]) { const ft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.08), cf); ft.position.set(-L * 0.07, 0.6, sd * hz * 0.95); g.add(ft); }
    }
    // barbatana, câmara de TV no topo e placas da asa com a cor da equipa
    { const fin = profileMesh([[-L * 0.12, 1.0], [-L * 0.42, 0.92], [-L * 0.42, 0.7], [-L * 0.2, 0.86]], 0.012, body2, null, 0.004); g.add(fin);
      const tcam = box(g, 0.1, 0.05, 0.16, -L * 0.07, 1.06, 0, new THREE.MeshStandardMaterial({ color: num === 1 || num % 2 ? 0x111214 : 0xf2e600, roughness: 0.4 })); void tcam;
      for (const sd of [-1, 1]) box(g, 0.05, 0.05, 0.03, -L * 0.07, 1.02, sd * 0.05, cf);
      if (sponsor) { for (const sd of [-1, 1]) { const tp = textPlane(sponsor, L * 0.13, 0.12, null, '#ffffff'); tp.position.set(-L * 0.46, 0.72, sd * (W * 0.39 + 0.02)); tp.rotation.y = sd > 0 ? 0 : Math.PI; g.add(tp); }
        const rw = textPlane(sponsor, W * 0.6, 0.12, null, '#ffffff'); rw.rotation.y = -Math.PI / 2; rw.rotation.x = 0; rw.position.set(-L * 0.47 - 0.035, 0.92, 0); g.add(rw); }
      if (num != null) for (const sd of [-1, 1]) { const np = textPlane(String(num), 0.18, 0.14, null, '#ffffff'); np.position.set(-L * 0.44, 0.5, sd * (W * 0.39 + 0.02)); np.rotation.y = sd > 0 ? 0 : Math.PI; g.add(np); }
    }
    // retrovisores
    const mirrors = [];
    for (const sd of [-1, 1]) {
      rod(g, new THREE.Vector3(L * 0.09, 0.58, sd * W * 0.16), new THREE.Vector3(L * 0.09, 0.72, sd * W * 0.3), 0.012, cf);
      box(g, 0.08, 0.07, 0.17, L * 0.09, 0.74, sd * W * 0.32, body);
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.055), new THREE.MeshBasicMaterial({ color: 0x6a7480 }));
      glass.position.set(L * 0.09 - 0.042, 0.74, sd * W * 0.32); glass.rotation.y = -Math.PI / 2; g.add(glass); mirrors.push(glass);
    }
    // volante com ecrã (visível na câmara de dentro)
    const sw = new THREE.Group(); sw.position.set(L * 0.062, 0.7, 0); sw.rotation.z = -0.5; sw.scale.setScalar(1.18); g.add(sw);
    const { dc, dt } = formulaWheel(sw);
    // número no nariz
    if (num != null) { const np = textPlane(String(num), 0.26, 0.17, null, '#ffffff'); np.rotation.x = -Math.PI / 2; np.rotation.z = Math.PI / 2; np.position.set(L * 0.3, 0.335, 0); g.add(np); }
    // piloto
    const helm = helmetMesh(helmet, 0.135); helm.position.set(L * 0.03, 0.73, 0); g.add(helm);
    return { group: g, wheels, front, mirrors, sw, disp: { c: dc, t: dt, last: 0 }, helm, rwing: rwg, fwingParts: g.children.filter((o) => o.position && o.position.x > L * 0.43 && o.position.y < 0.3), light, eye: [-L * 0.005, 0.88], L, W };
  }
  // ---------- kart ----------
  function kart(C, c1, c2, helmet, num, sponsor) {
    const g = new THREE.Group(), L = C.carLen, W = C.carW, wheels = [], front = [];
    const plastic = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(c1), roughness: 0.45, clearcoat: 0.5, envMap });
    const plastic2 = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(c2), roughness: 0.45, clearcoat: 0.5, envMap });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.9, roughness: 0.25, envMap });
    const black = new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.7 });
    for (const [x, z, r, w, isF] of [[L * 0.33, -W * 0.43, 0.13, 0.13, 1], [L * 0.33, W * 0.43, 0.13, 0.13, 1], [-L * 0.34, -W * 0.44, 0.14, 0.21, 0], [-L * 0.34, W * 0.44, 0.14, 0.21, 0]]) {
      const wg = makeWheel(r, w, '#c8c8c8'); wg.position.set(x, r, z); g.add(wg); wheels.push(wg); if (isF) front.push(wg);
    }
    // chassis tubular
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    for (const sd of [-1, 1]) { rod(g, V(L * 0.38, 0.07, sd * W * 0.18), V(-L * 0.38, 0.07, sd * W * 0.22), 0.016, chrome); rod(g, V(L * 0.33, 0.1, sd * W * 0.18), V(L * 0.33, 0.13, sd * W * 0.38), 0.014, chrome); }
    rod(g, V(-L * 0.34, 0.14, -W * 0.44), V(-L * 0.34, 0.14, W * 0.44), 0.02, chrome); // eixo traseiro
    rod(g, V(L * 0.38, 0.07, -W * 0.18), V(L * 0.38, 0.07, W * 0.18), 0.016, chrome);
    // carenagem frontal e painel do número
    const noseK = profileMesh([[L * 0.52, 0.06], [L * 0.52, 0.16], [L * 0.38, 0.22], [L * 0.28, 0.2], [L * 0.28, 0.06]], W * 0.62, plastic, (x) => lerp(1, 0.85, clamp((x - L * 0.28) / (L * 0.24), 0, 1)), 0.03);
    g.add(noseK);
    const nassau = profileMesh([[L * 0.27, 0.1], [L * 0.25, 0.42], [L * 0.2, 0.45], [L * 0.18, 0.12]], W * 0.34, plastic2, null, 0.02); g.add(nassau);
    if (num != null) { const np = textPlane(String(num), 0.22, 0.16, '#ffd400', '#111111'); np.position.set(L * 0.272, 0.3, 0); np.rotation.y = Math.PI / 2; np.rotation.z = -0.08; g.add(np); }
    for (const sd of [-1, 1]) {
      const pod = profileMesh([[L * 0.14, 0.08], [L * 0.1, 0.24], [-L * 0.2, 0.24], [-L * 0.24, 0.08]], 0.18, plastic, null, 0.04);
      pod.position.z = sd * W * 0.44; g.add(pod);
      if (sponsor) { const tp = textPlane(sponsor, 0.42, 0.09, null, '#ffffff'); tp.position.set(-L * 0.04, 0.17, sd * (W * 0.44 + 0.12)); tp.rotation.y = sd > 0 ? 0 : Math.PI; g.add(tp); }
    }
    box(g, 0.1, 0.16, W * 0.95, -L * 0.48, 0.14, 0, black); // para-choques traseiro
    // banco, motor e escape
    const seat = profileMesh([[-L * 0.02, 0.1], [-L * 0.04, 0.5], [-L * 0.12, 0.52], [-L * 0.16, 0.12]], 0.36, black, null, 0.03); g.add(seat);
    box(g, 0.25, 0.24, 0.18, -L * 0.2, 0.25, W * 0.3, new THREE.MeshStandardMaterial({ color: 0x5d6168, metalness: 0.7, roughness: 0.4 }));
    rod(g, V(-L * 0.2, 0.3, W * 0.38), V(-L * 0.42, 0.28, W * 0.38), 0.035, chrome);
    // volante
    const sw = new THREE.Group(); sw.position.set(L * 0.17, 0.52, 0); sw.rotation.z = -0.62; g.add(sw);
    const { dc, dt } = kartWheel(sw);
    rod(g, V(L * 0.17, 0.5, 0), V(L * 0.33, 0.16, 0), 0.016, chrome);
    // piloto: tronco, braços e capacete
    const suit = new THREE.MeshStandardMaterial({ color: new THREE.Color(c1), roughness: 0.85 });
    const torso = new THREE.Group(); g.add(torso);
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.46, 14), suit); chest.position.set(-L * 0.08, 0.6, 0); chest.rotation.z = 0.25; chest.scale.z = 1.25; chest.castShadow = true; torso.add(chest);
    for (const sd of [-1, 1]) { const sh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), suit); sh.position.set(-L * 0.05, 0.8, sd * 0.19); torso.add(sh); }
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.205, 0.08, 14), new THREE.MeshStandardMaterial({ color: new THREE.Color(c2), roughness: 0.85 })); stripe.position.set(-L * 0.075, 0.62, 0); stripe.rotation.z = 0.25; stripe.scale.z = 1.27; torso.add(stripe);
    const neck = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 16), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 })); neck.rotation.x = Math.PI / 2; neck.position.set(-L * 0.04, 0.86, 0); torso.add(neck);
    for (const sd of [-1, 1]) rod(torso, V(-L * 0.05, 0.8, sd * 0.2), V(L * 0.15, 0.55, sd * 0.15), 0.048, suit);
    if (num != null) { const bp = textPlane(String(num), 0.3, 0.13, '#ffd400', '#111111'); bp.position.set(-L * 0.53, 0.2, 0); bp.rotation.y = -Math.PI / 2; g.add(bp); }
    const helm = helmetMesh(helmet, 0.15); helm.position.set(-L * 0.03, 0.97, 0); g.add(helm);
    return { group: g, wheels, front, mirrors: [], sw, disp: { c: dc, t: dt, last: 0 }, helm, torso, eye: [-L * 0.06, 0.9], L, W };
  }
  // ---------- volantes (vista de frente: x direita, y cima, z virado para o piloto) ----------
  const leather = (c) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: 0.75, metalness: 0.05 });
  function face(sw) { const f = new THREE.Group(); f.rotation.y = -Math.PI / 2; sw.add(f); return f; }
  function screen(f, w, h, x, y, z) {
    const dc = document.createElement('canvas'); dc.width = 512; dc.height = Math.round((512 * h) / w);
    const dt = new THREE.CanvasTexture(dc); if ('encoding' in dt) dt.encoding = THREE.sRGBEncoding; dt.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: dt, toneMapped: false })); m.position.set(x, y, z); f.add(m);
    return { dc, dt };
  }
  function glove(f, x, y, ang) {
    const white = new THREE.MeshStandardMaterial({ color: 0xeceef2, roughness: 0.85 }), grey = new THREE.MeshStandardMaterial({ color: 0x9aa0aa, roughness: 0.8 });
    const g = new THREE.Group(); g.position.set(x, y, 0.012); g.rotation.z = ang; f.add(g);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), white); palm.scale.set(0.9, 1.25, 0.75); palm.position.set(0, 0, 0.02); g.add(palm);
    for (let k = 0; k < 4; k++) { const fg = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.012, 6, 10, Math.PI * 1.2), white); fg.position.set(0, 0.035 - k * 0.022, 0); fg.rotation.set(0, Math.PI / 2, 0); g.add(fg); }
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.07, 12), grey); cuff.rotation.x = Math.PI / 2 - 0.5; cuff.position.set(0, -0.04, 0.07); g.add(cuff);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.45, 12), white); arm.rotation.x = Math.PI / 2 - 0.55; arm.position.set(0, -0.14, 0.27); g.add(arm);
    return g;
  }
  function kartWheel(sw) {
    const f = face(sw), R = 0.17;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.021, 12, 56), leather('#202124')); f.add(rim);
    // punhos de cor (como nos volantes de competição)
    for (const [a0, arc, c] of [[Math.PI * 0.58, 0.5, '#d4501e'], [Math.PI * 0.26, 0.5, '#d4501e'], [Math.PI * 1.22, Math.PI * 0.56, '#b8402a']]) {
      const seg = new THREE.Mesh(new THREE.TorusGeometry(R, 0.0225, 12, 24, arc), leather(c)); seg.rotation.z = a0; f.add(seg);
    }
    // placa de três braços em metal escuro, com furos
    const metal = new THREE.MeshStandardMaterial({ color: 0x2a2d33, metalness: 0.75, roughness: 0.38, envMap });
    const plate = new THREE.Shape(); plate.moveTo(-0.07, 0.05); plate.lineTo(0.07, 0.05); plate.lineTo(0.08, -0.03); plate.lineTo(0.025, -0.09); plate.lineTo(-0.025, -0.09); plate.lineTo(-0.08, -0.03); plate.closePath();
    for (const [hx, hy] of [[-0.035, -0.035], [0.035, -0.035], [0, -0.065]]) { const hole = new THREE.Path(); hole.absarc(hx, hy, 0.011, 0, Math.PI * 2, true); plate.holes.push(hole); }
    const pm = new THREE.Mesh(new THREE.ExtrudeGeometry(plate, { depth: 0.006, bevelEnabled: false }), metal); f.add(pm);
    for (const sd of [-1, 1]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.028, 0.006), metal); sp.position.set(sd * 0.115, -0.005, 0.003); sp.rotation.z = -sd * 0.12; f.add(sp); }
    const sb = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.09, 0.006), metal); sb.position.set(0, -0.12, 0.003); f.add(sb);
    for (const [bx, by] of [[-0.05, 0.03], [0.05, 0.03], [0, -0.05]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 10), new THREE.MeshStandardMaterial({ color: 0xd8dce2, metalness: 0.9, roughness: 0.2, envMap })); b.rotation.x = Math.PI / 2; b.position.set(bx, by, 0.01); f.add(b); }
    // aparelho de telemetria no centro
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.03), new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.5 })); body.position.set(0, 0.03, 0.02); f.add(body);
    const scr = screen(f, 0.126, 0.074, 0, 0.034, 0.0355);
    glove(f, -R * 0.97, 0.03, -0.25); glove(f, R * 0.97, 0.03, 0.25);
    return scr;
  }
  function formulaWheel(sw) {
    const f = face(sw);
    const carb = carbon(), rub = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 0.95 });
    const sh = new THREE.Shape(); const w = 0.15, h = 0.075, r = 0.03;
    sh.moveTo(-w + r, -h); sh.lineTo(w - r, -h); sh.quadraticCurveTo(w, -h, w, -h + r); sh.lineTo(w, h - r); sh.quadraticCurveTo(w, h, w - r, h); sh.lineTo(-w + r, h); sh.quadraticCurveTo(-w, h, -w, h - r); sh.lineTo(-w, -h + r); sh.quadraticCurveTo(-w, -h, -w + r, -h);
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }), carb); f.add(body);
    for (const sd of [-1, 1]) {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.17, 14), rub); grip.position.set(sd * 0.155, -0.005, 0.02); grip.rotation.z = sd * 0.12; f.add(grip);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.11, 0.006), new THREE.MeshStandardMaterial({ color: 0x3a3d44, metalness: 0.6, roughness: 0.3 })); pad.position.set(sd * 0.09, 0.0, -0.02); f.add(pad); // patilhas
    }
    const scr = screen(f, 0.13, 0.068, 0, 0.012, 0.0375);
    const cols = [0xe10600, 0xffd400, 0x1e5bc6, 0x30d158, 0xffffff, 0xff8000];
    for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 12), new THREE.MeshStandardMaterial({ color: cols[k], roughness: 0.4 })); b.rotation.x = Math.PI / 2; b.position.set((k < 3 ? -1 : 1) * 0.1, 0.045 - (k % 3) * 0.025, 0.038); f.add(b); }
    for (const sd of [-1, 0, 1]) { const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.014, 16), new THREE.MeshStandardMaterial({ color: 0x8d939c, metalness: 0.8, roughness: 0.3, envMap })); kn.rotation.x = Math.PI / 2; kn.position.set(sd * 0.04, -0.055, 0.04); f.add(kn); }
    glove(f, -0.155, 0.0, -0.1); glove(f, 0.155, 0.0, 0.1);
    return scr;
  }
  function make(cat, C, c1, c2, helmet, num, sponsor) { return cat === 'kart' ? kart(C, c1, c2, helmet, num, sponsor) : formula(cat, C, c1, c2, helmet, num, sponsor); }
  return { make, setEnv, setCompound, helmetMesh };
})();
