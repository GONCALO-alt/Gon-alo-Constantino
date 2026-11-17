// Ponto de entrada da DEMO: põe o servidor a correr dentro da página e arranca a app.
import './env.js';
import * as R from '../rooms.js';
import { attachHandlers } from '../handlers.js';
import { FakeHub } from './fake-io.js';
import { startBots, seedLeague, seedStreak } from './bots.js';

R.LIMITS.minFocus = 1; // na demo dá para fazer focos de 1 minuto

const hub = new FakeHub();
const store = new R.RoomStore(null);
attachHandlers(hub, store, { duelPauseMs: 2500 });
seedLeague(store);

// quando a pessoa cria uma sala, o Rui e a Eva entram
const create = store.create.bind(store);
let botsStarted = false;
store.create = (...args) => {
  const room = create(...args);
  if (!botsStarted && args[1] !== 'demo') {
    botsStarted = true;
    seedStreak(room);
    startBots(hub, store, room.code);
  }
  return room;
};

window.io = () => hub.connect();
window.confirm = () => true; // os artefactos não mostram janelas de confirmação

// opção de 1 minuto para experimentar o foco
const sel = document.querySelector('#focusMin');
sel.insertAdjacentHTML('afterbegin', '<option value="1">1 min (demo)</option>');
sel.value = '1';

await import('../public/app.js');
