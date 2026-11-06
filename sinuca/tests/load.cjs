// Carrega os scripts do jogo num contexto Node (sem DOM) para testes.
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function load(files) {
  const ctx = { console, Math, JSON, Date, performance, localStorage: undefined, module: undefined };
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8') + '\n;this.__last=1;', ctx, { filename: f });
  // as constantes de topo ficam no contexto via 'const' — expomo-las
  vm.runInContext('for (const k of ["U","PHYS","RULES","AI","CHARACTERS","CHALLENGES","CUPS","ACHIEVEMENTS","DAILY_TEMPLATES","SCENES","PROG"]) { try { this[k] = eval(k); } catch (e) {} }', ctx);
  return ctx;
};
