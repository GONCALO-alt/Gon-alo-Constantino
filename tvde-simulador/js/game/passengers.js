// Geração de passageiros: nome, personalidade, avaliação, aparência e fotografia de perfil.
import { mulberry32, pick, rr, weighted } from '../util.js';
import { SKINS } from '../world/pedestrians.js';

const M_NAMES = ['João', 'Tiago', 'Miguel', 'Pedro', 'Rui', 'André', 'Ricardo', 'Duarte', 'Gonçalo', 'Francisco', 'Diogo', 'Bruno', 'Nuno', 'Hugo', 'Paulo', 'Carlos', 'Luís', 'Vasco', 'Rodrigo', 'Martim', 'Afonso', 'Tomás', 'José', 'António', 'Manuel', 'Filipe', 'Sérgio', 'Rafael', 'Henrique', 'Fábio'];
const F_NAMES = ['Ana', 'Maria', 'Inês', 'Beatriz', 'Mariana', 'Catarina', 'Sofia', 'Joana', 'Rita', 'Carolina', 'Leonor', 'Matilde', 'Marta', 'Teresa', 'Sara', 'Patrícia', 'Cláudia', 'Helena', 'Raquel', 'Filipa', 'Daniela', 'Vera', 'Lúcia', 'Francisca', 'Margarida', 'Diana', 'Íris', 'Laura', 'Madalena', 'Rosa'];
const SURN = ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes', 'Marques', 'Alves', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho', 'Teixeira', 'Moreira', 'Correia', 'Mendes', 'Nunes', 'Soares', 'Vieira', 'Monteiro', 'Cardoso', 'Rocha', 'Neves'];
const TOURIST = [['Emma', 'f', 'Müller'], ['Lucas', 'm', 'Martin'], ['Olivia', 'f', 'Smith'], ['Liam', 'm', 'Johnson'], ['Chloé', 'f', 'Dubois'], ['Matteo', 'm', 'Rossi'], ['Sophie', 'f', 'Jansen'], ['Noah', 'm', 'Brown'], ['Yuki', 'f', 'Tanaka'], ['Erik', 'm', 'Larsen']];

export const PERSONALITIES = {
  simpatico: { label: 'Simpático', mood: 72, tip: 0.3, chat: 2, desc: 'Bem-disposto e educado.' },
  calado: { label: 'Reservado', mood: 64, tip: 0.15, chat: 0, desc: 'Prefere viajar em silêncio.' },
  conversador: { label: 'Conversador', mood: 66, tip: 0.28, chat: 3, desc: 'Adora uma boa conversa.' },
  apressado: { label: 'Apressado', mood: 52, tip: 0.22, chat: 1, desc: 'Está sempre atrasado.' },
  generoso: { label: 'Generoso', mood: 74, tip: 0.8, chat: 2, desc: 'Costuma deixar gorjeta.' },
  exigente: { label: 'Exigente', mood: 55, tip: 0.18, chat: 2, desc: 'Tem pedidos especiais.' },
  rude: { label: 'Mal-humorado', mood: 38, tip: 0.04, chat: 2, desc: 'Pouco paciente e mal-educado.' },
  festivo: { label: 'Festivo', mood: 70, tip: 0.35, chat: 2, desc: 'Vem de uma noite animada.' },
  turista: { label: 'Turista', mood: 75, tip: 0.5, chat: 2, desc: 'Está a visitar a cidade.' },
  executivo: { label: 'Executivo', mood: 60, tip: 0.4, chat: 1, desc: 'Profissional e ocupado.' },
};

const NOTES = [
  { text: 'Tenho uma mala grande.', tag: 'luggage' },
  { text: 'Vou com o meu cão (é pequeno e educado).', tag: 'pet' },
  { text: 'Por favor, ligue quando chegar.', tag: 'call' },
  { text: 'Somos 4 pessoas.', tag: 'group' },
  { text: 'Tenho alguma pressa, obrigado!', tag: 'hurry' },
  { text: 'Levo compras, vou demorar 1 minutinho.', tag: 'shopping' },
  { text: 'Estou à porta principal.', tag: 'door' },
];

export function makePassenger(seed, ctx) {
  const r = mulberry32(seed);
  const { hour, district, destDistrict } = ctx;
  const night = hour >= 22 || hour < 3;
  const pers = weighted(Object.keys(PERSONALITIES), (k) => {
    const base = { simpatico: 25, calado: 18, conversador: 15, apressado: 10, generoso: 8, exigente: 9, rude: 7, festivo: 2, turista: 3, executivo: 4 }[k];
    let w = base;
    if (k === 'festivo') w += night && (district === 'N' || district === 'r') ? 45 : night ? 8 : 0;
    if (k === 'turista') w += district === 'A' || district === 'H' || destDistrict === 'A' ? 25 : 0;
    if (k === 'executivo') w += district === 'D' || destDistrict === 'D' || destDistrict === 'A' ? 22 : 0;
    if (k === 'apressado') w += (hour >= 7 && hour <= 9) || destDistrict === 'S' || destDistrict === 'A' ? 10 : 0;
    if (k === 'rude') w += night ? 4 : 0;
    if (ctx.premium && (k === 'executivo' || k === 'exigente')) w += 15;
    return w;
  }, r);
  let first, last, gender;
  if (pers === 'turista') { const t = pick(TOURIST, r); first = t[0]; gender = t[1]; last = t[2]; }
  else { gender = r() < 0.5 ? 'f' : 'm'; first = pick(gender === 'f' ? F_NAMES : M_NAMES, r); last = pick(SURN, r); }
  const age = r() < 0.15 ? 'senior' : r() < 0.4 ? 'young' : 'adult';
  const baseRating = pers === 'rude' ? rr(3.7, 4.5, r) : pers === 'festivo' ? rr(4.3, 4.85, r) : pers === 'exigente' ? rr(4.5, 4.95, r) : rr(4.6, 5.0, r);
  const hairCols = [0x1b1410, 0x3a2617, 0x5e3b22, 0x8a5a33, 0xc9a26b, 0x2a2a2a, 0x7a2e1a];
  const look = {
    gender, skin: pick(SKINS, r),
    hair: age === 'senior' ? pick([0xb9b6b0, 0xdedbd5, 0x8f8b85], r) : pick(hairCols, r),
    hairStyle: gender === 'f' ? pick(['long', 'long', 'bun', 'curly', 'short'], r) : pick(['short', 'short', 'curly', 'bald'], r),
    shirt: pick([0x2d4a7a, 0xb53a3a, 0xe8e2d0, 0x2f2f33, 0x3f7a4a, 0xd9a441, 0x7a4a8a, 0x5a7fa8, 0xc96f4a, 0xf0f0f0, 0x1c3f5f], r),
    pants: pick([0x22252b, 0x2d3a55, 0x4a4036, 0x1a1a1c, 0x6b6157], r),
    glasses: r() < (age === 'senior' ? 0.6 : 0.22), beard: gender === 'm' && r() < 0.35,
    height: gender === 'f' ? rr(0.92, 0.99, r) : rr(0.97, 1.05, r),
    sleeves: r() < 0.5 ? 'short' : 'long', phoneUser: age !== 'senior' && r() < 0.6,
  };
  const p = {
    seed, first, last: last[0] + '.', name: `${first} ${last[0]}.`, gender, age, pers,
    rating: Math.round(baseRating * 100) / 100, trips: Math.floor(rr(3, 420, r)), look,
    late: pers !== 'apressado' && r() < 0.16 ? Math.round(rr(3, 9, r)) : 0,
    cancels: r() < 0.06,
    note: r() < 0.14 ? pick(NOTES, r) : null,
  };
  if (pers === 'apressado' && !p.note && r() < 0.5) p.note = NOTES[4];
  return p;
}

// Fotografia de perfil desenhada num canvas (consistente com o modelo 3D)
const avatarCache = new Map();
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
export function avatar(p, size = 128) {
  const key = p.seed + ':' + size;
  if (avatarCache.has(key)) return avatarCache.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const r = mulberry32(p.seed + 99); const L = p.look; const s = size / 128;
  const bgHue = Math.floor(r() * 360);
  const g = x.createLinearGradient(0, 0, size, size); g.addColorStop(0, `hsl(${bgHue},35%,62%)`); g.addColorStop(1, `hsl(${(bgHue + 40) % 360},40%,40%)`);
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  x.save(); x.scale(s, s);
  // cabelo atrás
  x.fillStyle = hex(L.hair);
  if (L.hairStyle === 'long') { x.beginPath(); x.ellipse(64, 70, 36, 46, 0, 0, Math.PI * 2); x.fill(); }
  // ombros
  x.fillStyle = hex(L.shirt); x.beginPath(); x.ellipse(64, 138, 52, 36, 0, 0, Math.PI * 2); x.fill();
  // pescoço
  x.fillStyle = hex(L.skin); x.fillRect(54, 84, 20, 22);
  x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(54, 96, 20, 8);
  // cara
  x.fillStyle = hex(L.skin); x.beginPath(); x.ellipse(64, 60, 27, 33, 0, 0, Math.PI * 2); x.fill();
  // orelhas
  x.beginPath(); x.ellipse(37, 62, 5, 8, 0, 0, Math.PI * 2); x.ellipse(91, 62, 5, 8, 0, 0, Math.PI * 2); x.fill();
  // cabelo frente
  x.fillStyle = hex(L.hair);
  if (L.hairStyle !== 'bald') {
    x.beginPath(); x.ellipse(64, 38, 29, 18, 0, Math.PI, Math.PI * 2); x.fill();
    if (L.hairStyle === 'curly') { for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(38 + i * 6.5, 33 + Math.sin(i) * 3, 7, 0, Math.PI * 2); x.fill(); } }
    if (L.hairStyle === 'bun') { x.beginPath(); x.arc(64, 18, 10, 0, Math.PI * 2); x.fill(); }
    if (L.hairStyle === 'long') { x.fillRect(35, 38, 8, 40); x.fillRect(85, 38, 8, 40); }
  } else { x.fillStyle = 'rgba(0,0,0,0.08)'; x.beginPath(); x.ellipse(64, 34, 22, 10, 0, Math.PI, Math.PI * 2); x.fill(); }
  // olhos e sobrancelhas
  x.fillStyle = '#fff'; x.beginPath(); x.ellipse(53, 60, 5, 3.4, 0, 0, Math.PI * 2); x.ellipse(75, 60, 5, 3.4, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#2b1d14'; x.beginPath(); x.arc(53, 60, 2.4, 0, Math.PI * 2); x.arc(75, 60, 2.4, 0, Math.PI * 2); x.fill();
  x.strokeStyle = hex(L.hair === 0xdedbd5 ? 0x9a948c : L.hair); x.lineWidth = 2.5;
  const frown = p.pers === 'rude' ? 3 : 0;
  x.beginPath(); x.moveTo(46, 52 - frown * 0.3); x.lineTo(59, 51 + frown); x.moveTo(69, 51 + frown); x.lineTo(82, 52 - frown * 0.3); x.stroke();
  // nariz e boca
  x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 2; x.beginPath(); x.moveTo(64, 62); x.lineTo(61, 72); x.lineTo(65, 73); x.stroke();
  x.strokeStyle = '#8a3b33'; x.lineWidth = 2.6; x.beginPath();
  if (p.pers === 'rude' || p.pers === 'calado') { x.moveTo(55, 82); x.lineTo(73, 82); }
  else x.arc(64, 76, 9, 0.2 * Math.PI, 0.8 * Math.PI);
  x.stroke();
  if (L.beard) { x.fillStyle = hex(L.hair); x.globalAlpha = 0.85; x.beginPath(); x.ellipse(64, 84, 22, 12, 0, 0, Math.PI); x.fill(); x.globalAlpha = 1; }
  if (L.glasses) { x.strokeStyle = '#151515'; x.lineWidth = 2.5; x.strokeRect(44, 54, 18, 12); x.strokeRect(66, 54, 18, 12); x.beginPath(); x.moveTo(62, 59); x.lineTo(66, 59); x.stroke(); }
  x.restore();
  const url = c.toDataURL('image/png');
  avatarCache.set(key, url);
  return url;
}
