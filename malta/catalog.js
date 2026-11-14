// Catálogo partilhado entre o servidor e o navegador.
// price: 0 = grátis; > 0 = custa moedas (as moedas compram-se com dinheiro real).
(function (root) {
  const CATALOG = {
    avatar: {
      skin: [
        { id: 'skin1', value: '#f5d0b0', price: 0 },
        { id: 'skin2', value: '#e0ac7e', price: 0 },
        { id: 'skin3', value: '#b97a4f', price: 0 },
        { id: 'skin4', value: '#7a4a2c', price: 0 },
        { id: 'skin5', value: '#4a2c1a', price: 0 },
        { id: 'skinAlien', value: '#8be08b', price: 150, name: 'Alien' },
        { id: 'skinGold', value: '#f2c94c', price: 400, name: 'Dourado' },
      ],
      hair: [
        { id: 'hairNone', value: 'none', price: 0, name: 'Careca' },
        { id: 'hairShort', value: 'short', price: 0, name: 'Curto' },
        { id: 'hairLong', value: 'long', price: 0, name: 'Comprido' },
        { id: 'hairCurly', value: 'curly', price: 0, name: 'Encaracolado' },
        { id: 'hairMohawk', value: 'mohawk', price: 120, name: 'Crista' },
        { id: 'hairBuns', value: 'buns', price: 120, name: 'Puxinhos' },
      ],
      hairColor: [
        { id: 'hcBlack', value: '#1d1d1d', price: 0 },
        { id: 'hcBrown', value: '#6b3e1f', price: 0 },
        { id: 'hcBlond', value: '#e8c26a', price: 0 },
        { id: 'hcRed', value: '#b5432a', price: 0 },
        { id: 'hcPink', value: '#ff5fa2', price: 80, name: 'Rosa' },
        { id: 'hcBlue', value: '#3d7bff', price: 80, name: 'Azul' },
        { id: 'hcPurple', value: '#9b5cff', price: 80, name: 'Roxo' },
      ],
      eyes: [
        { id: 'eyesDot', value: 'dot', price: 0, name: 'Normais' },
        { id: 'eyesHappy', value: 'happy', price: 0, name: 'Felizes' },
        { id: 'eyesWink', value: 'wink', price: 60, name: 'Piscadela' },
        { id: 'eyesStar', value: 'star', price: 200, name: 'Estrelas' },
      ],
      accessory: [
        { id: 'accNone', value: 'none', price: 0, name: 'Nada' },
        { id: 'accGlasses', value: 'glasses', price: 100, name: 'Óculos' },
        { id: 'accShades', value: 'shades', price: 150, name: 'Óculos de sol' },
        { id: 'accCap', value: 'cap', price: 150, name: 'Boné' },
        { id: 'accHeadphones', value: 'headphones', price: 250, name: 'Headphones' },
        { id: 'accCrown', value: 'crown', price: 800, name: 'Coroa' },
      ],
      outfit: [
        { id: 'outBlue', value: '#3d7bff', price: 0 },
        { id: 'outGreen', value: '#2bb673', price: 0 },
        { id: 'outGrey', value: '#777777', price: 0 },
        { id: 'outNeon', value: '#c6ff00', price: 100, name: 'Néon' },
        { id: 'outHot', value: '#ff2e63', price: 100, name: 'Hot pink' },
      ],
      bg: [
        { id: 'bgDark', value: '#2a2d3e', price: 0 },
        { id: 'bgSky', value: '#8fd3ff', price: 0 },
        { id: 'bgSunset', value: 'sunset', price: 200, name: 'Pôr do sol' },
        { id: 'bgGalaxy', value: 'galaxy', price: 350, name: 'Galáxia' },
      ],
    },
    reactions: [
      { id: 'r_heart', value: '❤️', price: 0 },
      { id: 'r_laugh', value: '😂', price: 0 },
      { id: 'r_fire', value: '🔥', price: 0 },
      { id: 'r_like', value: '👍', price: 0 },
      { id: 'r_wow', value: '😮', price: 0 },
      { id: 'r_skull', value: '💀', price: 50 },
      { id: 'r_party', value: '🎉', price: 50 },
      { id: 'r_mind', value: '🤯', price: 80 },
      { id: 'r_goat', value: '🐐', price: 120 },
      { id: 'r_crown', value: '👑', price: 150 },
      { id: 'r_rocket', value: '🚀', price: 150 },
      { id: 'r_rain', value: '💸', price: 300, name: 'Chuva de dinheiro', big: true },
    ],
    emotes: [
      { id: 'e_wave', value: '👋', anim: 'wave', price: 0, name: 'Acenar' },
      { id: 'e_jump', value: '⬆️', anim: 'jump', price: 0, name: 'Saltar' },
      { id: 'e_dance', value: '🕺', anim: 'dance', price: 100, name: 'Dançar' },
      { id: 'e_spin', value: '🌀', anim: 'spin', price: 150, name: 'Rodopio' },
      { id: 'e_love', value: '😍', anim: 'love', price: 200, name: 'Apaixonado' },
      { id: 'e_flip', value: '🤸', anim: 'flip', price: 250, name: 'Mortal' },
      { id: 'e_shake', value: '💃', anim: 'shake', price: 300, name: 'Abanar' },
    ],
    themes: [
      { id: 't_default', value: '#14151f', price: 0, name: 'Noite' },
      { id: 't_forest', value: 'linear-gradient(160deg,#0b2b1a,#1f5130)', price: 200, name: 'Floresta' },
      { id: 't_beach', value: 'linear-gradient(180deg,#0f4c75,#1b6f8a 60%,#b9853f)', price: 300, name: 'Praia' },
      { id: 't_neon', value: 'linear-gradient(135deg,#12002b,#3a0066 50%,#00334d)', price: 300, name: 'Néon' },
      { id: 't_sunset', value: 'linear-gradient(180deg,#2b1055,#8a2d55 70%,#b8562f)', price: 350, name: 'Pôr do sol' },
      { id: 't_space', value: 'radial-gradient(circle at 30% 20%,#3b1f6e,#0b0b2b 60%)', price: 400, name: 'Espaço' },
      { id: 't_arcade', value: 'repeating-linear-gradient(45deg,#1a0f2e 0 22px,#22143d 22px 44px)', price: 500, name: 'Arcade' },
    ],
    decor: [
      { id: 'd_plant', value: '🪴', price: 50, name: 'Planta' },
      { id: 'd_candle', value: '🕯️', price: 60, name: 'Vela' },
      { id: 'd_frame', value: '🖼️', price: 80, name: 'Quadro' },
      { id: 'd_sofa', value: '🛋️', price: 100, name: 'Sofá' },
      { id: 'd_ball', value: '🏀', price: 100, name: 'Bola' },
      { id: 'd_teddy', value: '🧸', price: 120, name: 'Peluche' },
      { id: 'd_tv', value: '📺', price: 150, name: 'TV' },
      { id: 'd_console', value: '🎮', price: 150, name: 'Consola' },
      { id: 'd_cat', value: '🐱', price: 200, name: 'Gato' },
      { id: 'd_guitar', value: '🎸', price: 200, name: 'Guitarra' },
      { id: 'd_disco', value: '🪩', price: 250, name: 'Bola de espelhos' },
      { id: 'd_rainbow', value: '🌈', price: 300, name: 'Arco-íris' },
    ],
    badges: {
      first_win: { icon: '🏆', name: 'Primeira vitória', desc: 'Ganha um jogo' },
      chatty: { icon: '💬', name: 'Tagarela', desc: '500 mensagens no chat' },
      cinema: { icon: '🍿', name: 'Cinéfilo', desc: '60 min a ver vídeos juntos' },
      caller: { icon: '📞', name: 'Sempre em linha', desc: '60 min em chamada' },
      social: { icon: '🤝', name: 'Social', desc: 'Ter 5 amigos' },
      streak7: { icon: '🔥', name: 'Inseparáveis', desc: 'Streak de 7 dias com um amigo' },
      generous: { icon: '🎁', name: 'Generoso', desc: 'Oferecer uma prenda' },
      artist: { icon: '🎨', name: 'Artista', desc: 'Adivinharam 10 desenhos teus' },
      dj: { icon: '🎧', name: 'DJ', desc: 'Pôr 10 músicas a tocar' },
      level10: { icon: '⭐', name: 'Veterano', desc: 'Chegar ao nível 10' },
    },
    extras: [
      { id: 'x_nameGold', price: 250, name: 'Nome dourado no chat' },
      { id: 'x_nameRainbow', price: 500, name: 'Nome arco-íris no chat' },
      { id: 'x_bigReact', price: 300, name: 'Reações gigantes' },
    ],
    coinPacks: [
      { id: 'pack_s', coins: 300, eur: 0.99 },
      { id: 'pack_m', coins: 1000, eur: 2.99, tag: 'Popular' },
      { id: 'pack_l', coins: 2500, eur: 5.99, tag: '+25%' },
      { id: 'pack_xl', coins: 6000, eur: 11.99, tag: 'Melhor valor' },
    ],
    vip: { id: 'vip', eur: 3.99, name: 'Malta+ (mensal)', perks: ['Todas as reações', '200 moedas por semana', 'Salas até 12 pessoas', 'Emblema VIP'] },
  };

  function findItem(id) {
    for (const slot of Object.keys(CATALOG.avatar)) {
      const it = CATALOG.avatar[slot].find((i) => i.id === id);
      if (it) return { ...it, slot };
    }
    const r = CATALOG.reactions.find((i) => i.id === id);
    if (r) return { ...r, slot: 'reaction' };
    for (const slot of ['emotes', 'themes', 'decor', 'extras']) {
      const x = CATALOG[slot].find((i) => i.id === id);
      if (x) return { ...x, slot: slot === 'extras' ? 'extra' : slot.replace(/s$/, '') };
    }
    return null;
  }

  function defaultAvatar() {
    return { skin: 'skin2', hair: 'hairShort', hairColor: 'hcBrown', eyes: 'eyesDot', accessory: 'accNone', outfit: 'outBlue', bg: 'bgDark' };
  }

  // Níveis: nível n precisa de 40·(n-1)² XP
  function levelFor(xp) { return Math.floor(Math.sqrt((xp || 0) / 40)) + 1; }
  function xpForLevel(l) { return 40 * (l - 1) * (l - 1); }

  const api = { CATALOG, findItem, defaultAvatar, levelFor, xpForLevel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Catalog = api;
})(typeof window !== 'undefined' ? window : globalThis);
