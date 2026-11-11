// Gera js/tracks-real.js a partir do ficheiro f1-circuits.geojson (github.com/bacinger/f1-circuits, licença MIT).
// Uso: node tools/import-f1.mjs caminho/para/f1-circuits.geojson
// Os traçados começam na linha de partida/chegada e seguem o sentido da corrida.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(process.argv[2], 'utf8'));

// [id do ficheiro, id na app, grupo, nome, local]
const PICK = [
  ['pt-2008', 'portimao', 'pt', 'Autódromo Internacional do Algarve', 'Portimão'],
  ['pt-1972', 'estoril', 'pt', 'Autódromo do Estoril', 'Estoril'],
  ['mc-1929', 'monaco', 'f1', 'Mónaco', 'Monte Carlo'],
  ['it-1922', 'monza', 'f1', 'Monza', 'Itália'],
  ['gb-1948', 'silverstone', 'f1', 'Silverstone', 'Reino Unido'],
  ['be-1925', 'spa', 'f1', 'Spa-Francorchamps', 'Bélgica'],
  ['jp-1962', 'suzuka', 'f1', 'Suzuka', 'Japão'],
  ['br-1940', 'interlagos', 'f1', 'Interlagos', 'São Paulo, Brasil'],
  ['it-1953', 'imola', 'f1', 'Imola', 'Itália'],
  ['es-1991', 'barcelona', 'f1', 'Barcelona-Catalunha', 'Espanha'],
  ['nl-1948', 'zandvoort', 'f1', 'Zandvoort', 'Países Baixos'],
  ['at-1969', 'redbullring', 'f1', 'Red Bull Ring', 'Áustria'],
  ['hu-1986', 'hungaroring', 'f1', 'Hungaroring', 'Hungria'],
  ['au-1953', 'albertpark', 'f1', 'Albert Park', 'Melbourne, Austrália'],
  ['bh-2002', 'bahrain', 'f1', 'Bahrain', 'Sakhir, Bahrain'],
  ['ca-1978', 'montreal', 'f1', 'Gilles-Villeneuve', 'Montreal, Canadá'],
  ['us-2012', 'cota', 'f1', 'Circuito das Américas', 'Austin, EUA'],
  ['ae-2009', 'yasmarina', 'f1', 'Yas Marina', 'Abu Dhabi'],
];

const out = PICK.map(([fid, id, group, name, place]) => {
  const f = src.features.find((x) => x.properties.id === fid);
  if (!f) throw new Error('Não encontrado: ' + fid);
  const c = f.geometry.coordinates;
  const [lon0, lat0] = c[0];
  const kx = Math.cos((lat0 * Math.PI) / 180) * 111320;
  // Metros, com y para baixo (como no ecrã).
  let pts = c.map(([lon, lat]) => [Math.round((lon - lon0) * kx), Math.round(-(lat - lat0) * 110540)]);
  if (Math.hypot(pts[0][0] - pts.at(-1)[0], pts[0][1] - pts.at(-1)[1]) < 5) pts = pts.slice(0, -1);
  return { id, group, name, place, length: f.properties.length, firstgp: f.properties.firstgp, pts };
});

const js = `/* KART MENTAL PRO — traçados reais (gerado por tools/import-f1.mjs; não editar à mão).
 * Fonte: github.com/bacinger/f1-circuits — MIT License, Copyright (c) 2019-2025 Tomislav Bacinger.
 * Dados não oficiais; F1 e marcas relacionadas pertencem à Formula One Licensing B.V.
 * Coordenadas em metros a partir da linha de meta, no sentido da corrida (y para baixo). */
window.KMP_REAL_TRACKS = ${JSON.stringify(out)};
`;
writeFileSync(join(root, 'js/tracks-real.js'), js);
console.log('Escrito js/tracks-real.js:', out.length, 'circuitos,', (js.length / 1024).toFixed(1), 'KB');
