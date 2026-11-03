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
    const tread = new THREE.MeshStandardMaterial({ map: treadTex(), roughness: 0.95 });
    const geo = new THREE.CylinderGeometry(r, r, w, 28, 1);
    const m = new THREE.Mesh(geo, [tread, side, side]);
    m.rotation.x = Math.PI / 2;
    const g = new THREE.Group(); g.add(m); g.userData.tyre = m; g.userData.side = side;
    m.castShadow = true;
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
  function helmetMesh(h, r) {
    const t = ctex('helm' + h.c1 + h.c2 + h.c3 + h.pattern, 256, 128, (g, w, hh) => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      RENDER.drawHelmet(c.getContext('2d'), 64, 64, 60, { ...h, flagImg: h.flagImg }, false);
      g.fillStyle = h.c1; g.fillRect(0, 0, w, hh);
      g.drawImage(c, 0, 0, 128, 128, 0, 0, w / 2, hh); g.drawImage(c, 0, 0, 128, 128, w / 2, 0, w / 2, hh);
    });
    const g = new THREE.Group();
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), new THREE.MeshPhysicalMaterial({ map: t, clearcoat: 1, roughness: 0.3, metalness: 0.2, envMap }));
    s.scale.set(1.1, 1, 0.95); s.castShadow = true; g.add(s);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(r * 1.01, 18, 8, -0.9, 1.8, 1.15, 0.5), new THREE.MeshPhysicalMaterial({ color: 0x0c0f16, metalness: 0.9, roughness: 0.1, envMap }));
    visor.rotation.y = -Math.PI / 2; g.add(visor);
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
    // halo
    if (cat === 'f2' || cat === 'f1' || cat === 'f3') {
      const mk = (pts) => { const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))); const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.032, 8), cf); m.castShadow = true; g.add(m); };
      mk([[L * 0.16, 0.6, 0], [L * 0.135, 0.8, 0], [L * 0.1, 0.9, 0]]);
      for (const sd of [-1, 1]) mk([[L * 0.1, 0.9, 0], [L * 0.05, 0.92, sd * W * 0.11], [-L * 0.03, 0.87, sd * W * 0.13], [-L * 0.05, 0.62, sd * W * 0.13]]);
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
    const sw = new THREE.Group(); sw.position.set(L * 0.09, 0.6, 0); sw.rotation.z = 0.35; g.add(sw);
    box(sw, 0.04, 0.13, 0.3, 0, 0, 0, new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.6 }));
    for (const sd of [-1, 1]) box(sw, 0.05, 0.16, 0.06, 0, 0, sd * 0.16, new THREE.MeshStandardMaterial({ color: 0x232528, roughness: 0.95 }));
    const dc = document.createElement('canvas'); dc.width = 128; dc.height = 64; const dt = new THREE.CanvasTexture(dc);
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.075), new THREE.MeshBasicMaterial({ map: dt })); disp.position.set(-0.022, 0.005, 0); disp.rotation.y = -Math.PI / 2; sw.add(disp);
    // número no nariz
    if (num != null) { const np = textPlane(String(num), 0.26, 0.17, null, '#ffffff'); np.rotation.x = -Math.PI / 2; np.rotation.z = Math.PI / 2; np.position.set(L * 0.3, 0.335, 0); g.add(np); }
    // piloto
    const helm = helmetMesh(helmet, 0.135); helm.position.set(L * 0.03, 0.73, 0); g.add(helm);
    return { group: g, wheels, front, mirrors, sw, disp: { c: dc, t: dt, last: 0 }, helm, rwing: rwg, fwingParts: g.children.filter((o) => o.position && o.position.x > L * 0.43 && o.position.y < 0.3), light, eye: [L * 0.02, 0.86], L, W };
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
    const sw = new THREE.Group(); sw.position.set(L * 0.16, 0.5, 0); sw.rotation.z = 0.55; g.add(sw);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.017, 8, 30), black); rim.rotation.y = Math.PI / 2; sw.add(rim);
    box(sw, 0.02, 0.03, 0.28, 0, 0, 0, chrome);
    rod(g, V(L * 0.16, 0.5, 0), V(L * 0.32, 0.18, 0), 0.015, chrome);
    const dc = document.createElement('canvas'); dc.width = 128; dc.height = 64; const dt = new THREE.CanvasTexture(dc);
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.05), new THREE.MeshBasicMaterial({ map: dt })); disp.position.set(-0.02, 0.04, 0); disp.rotation.y = -Math.PI / 2; sw.add(disp);
    // piloto: tronco, braços e capacete
    const suit = new THREE.MeshStandardMaterial({ color: new THREE.Color(c1), roughness: 0.85 });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.5, 12), suit); torso.position.set(-L * 0.08, 0.6, 0); torso.rotation.z = 0.25; torso.castShadow = true; g.add(torso);
    for (const sd of [-1, 1]) rod(g, V(-L * 0.06, 0.78, sd * 0.18), V(L * 0.15, 0.52, sd * 0.13), 0.045, suit);
    const helm = helmetMesh(helmet, 0.15); helm.position.set(-L * 0.03, 0.97, 0); g.add(helm);
    return { group: g, wheels, front, mirrors: [], sw, disp: { c: dc, t: dt, last: 0 }, helm, torso, eye: [-L * 0.12, 0.92], L, W };
  }
  function make(cat, C, c1, c2, helmet, num, sponsor) { return cat === 'kart' ? kart(C, c1, c2, helmet, num, sponsor) : formula(cat, C, c1, c2, helmet, num, sponsor); }
  return { make, setEnv, setCompound };
})();
