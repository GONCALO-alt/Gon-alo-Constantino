// Constantes globais do jogo. Alterar aqui para afinar a experiência.
export const CFG = {
  GRID: 9,            // intersecções por lado
  SPACING: 84,        // distância entre intersecções (m, mundo 3D)
  ROADW: 12,          // largura da estrada
  LANE: 3.0,          // centro da faixa a partir do eixo da via
  CURB: 5.0,          // posição quando encosta ao passeio
  SIDEWALK: 4,
  DIST_SCALE: 11,     // 1 m no mundo = 11 m na app (distâncias realistas)
  TIME_SCALE: 20,     // segundos de jogo por segundo real (x1)
  DAY_START: 6 * 60,  // 06:00
  DAY_END: 26 * 60,   // 02:00 do dia seguinte
  START_BALANCE: 100,
  COMMISSION: 0.25,
  REQUEST_TIMEOUT: 15,
  MAX_SPEED: 12.5, TURN_SPEED: 5.2, ACC: 2.0, DEC: 3.0,
  SAVE_KEY: 'tvde-sim-save-v1',
  FARE: { base: 1.8, perKm: 0.62, perMin: 0.14, min: 4.0, waitPerMin: 0.25, cancelFee: 3.5, airportFee: 2.0 },
};

export const VEHICLES = {
  compacto: { id: 'compacto', name: 'Citadino Compacto', cat: 'RIDO X', price: 0, level: 1, fareMult: 1.0, tipBonus: 0, moodBonus: 0,
    energy: 'Gasolina', per100: 6.2, tank: 45, unitPrice: 1.78, unit: 'L', daily: 15,
    paint: 0xe9eaec, interior: 0x2b2d31, seat: 0x1d1f23, accent: 0x4aa3ff, eye: 1.16, desc: 'Económico e fiável. Ideal para começar.' },
  hibrido: { id: 'hibrido', name: 'Berlina Híbrida', cat: 'RIDO Comfort', price: 1200, level: 3, fareMult: 1.25, tipBonus: 0.05, moodBonus: 3,
    energy: 'Híbrido', per100: 4.3, tank: 43, unitPrice: 1.78, unit: 'L', daily: 18,
    paint: 0x1f2a3a, interior: 0x3a3430, seat: 0x6b5644, accent: 0xffb35a, eye: 1.14, desc: 'Mais conforto, tarifa mais alta e menos consumo.' },
  eletrico: { id: 'eletrico', name: 'Elétrico Aurora', cat: 'RIDO Green', price: 2600, level: 5, fareMult: 1.3, tipBonus: 0.08, moodBonus: 5,
    energy: 'Elétrico', per100: 16, tank: 62, unitPrice: 0.32, unit: 'kWh', daily: 17,
    paint: 0xb3262e, interior: 0xd9d6cf, seat: 0xeeeae3, accent: 0x37e2c4, eye: 1.15, desc: 'Silencioso, moderno e barato de carregar.' },
  suv: { id: 'suv', name: 'SUV Executivo', cat: 'RIDO Black', price: 5200, level: 8, fareMult: 1.8, tipBonus: 0.15, moodBonus: 8,
    energy: 'Gasóleo', per100: 7.4, tank: 65, unitPrice: 1.62, unit: 'L', daily: 26,
    paint: 0x0d0e10, interior: 0x1a1714, seat: 0x2a211b, accent: 0xd7b46a, eye: 1.32, desc: 'Categoria premium. Clientes exigentes, gorjetas generosas.' },
};

// Mapa de bairros (8x8 quarteirões). Linha = norte→sul, coluna = oeste→este.
// R residencial · C centro · D negócios · H hotel · r restaurante · N noite
// V Vila Velha · E estádio · B praia
// S estação · M centro comercial · X hospital · A aeroporto · G posto · P parque · U universidade
export const DMAP = [
  'RRPRGRUR',
  'RrCCCHRR',
  'RCDDCrXR',
  'SCDDHCER',
  'RNNCDCrR',
  'RNrCMCRR',
  'RRRCCGAA',
  'RRRRRRAA',
];

export const DISTRICTS = {
  R: { name: 'Residencial', map: '#262c34' }, C: { name: 'Centro', map: '#2e343e' }, D: { name: 'Negócios', map: '#333a47' },
  H: { name: 'Hotel', map: '#363044' }, r: { name: 'Restauração', map: '#3a322c' }, N: { name: 'Vida noturna', map: '#3b2940' },
  S: { name: 'Estação', map: '#2c3848' }, M: { name: 'Centro comercial', map: '#38382a' }, X: { name: 'Hospital', map: '#3d2b2e' },
  A: { name: 'Aeroporto', map: '#2a383e' }, V: { name: 'Vila Velha', map: '#3e3424' }, E: { name: 'Estádio', map: '#24402e' }, B: { name: 'Praia', map: '#4a4430' }, G: { name: 'Posto', map: '#303d2b' }, P: { name: 'Parque', map: '#1d3624' }, U: { name: 'Universidade', map: '#2b3044' },
};

export const STREETS_NS = ['Rua do Farol', 'Avenida Atlântica', 'Rua das Gaivotas', 'Avenida da República', 'Avenida Central',
  'Rua do Comércio', 'Avenida dos Navegadores', 'Rua da Estação Velha', 'Rua do Aeroporto'];
export const STREETS_EW = ['Rua das Laranjeiras', 'Avenida do Mar', 'Rua dos Poetas', 'Avenida da Liberdade', 'Rua Augusta Nova',
  'Rua da Prata', 'Avenida dos Descobrimentos', 'Rua do Sol', 'Rua das Acácias'];

export const CITY_NAME = 'Porto Azul';
export const APP_NAME = 'RIDO Driver';
