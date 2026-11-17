// Um "Socket.IO" em memória: o servidor e os clientes vivem na mesma página.
// Só serve para a demo — a app a sério usa o Socket.IO verdadeiro.

const clone = v => (v === undefined ? v : structuredClone(v));
const later = fn => setTimeout(fn, 0);

class Emitter {
  constructor() { this.handlers = new Map(); }
  on(ev, fn) { (this.handlers.get(ev) ?? this.handlers.set(ev, []).get(ev)).push(fn); return this; }
  once(ev, fn) { const w = (...a) => { this.off(ev, w); fn(...a); }; return this.on(ev, w); }
  off(ev, fn) { const l = this.handlers.get(ev); if (l) this.handlers.set(ev, l.filter(f => f !== fn)); return this; }
  fire(ev, args) { for (const fn of [...(this.handlers.get(ev) ?? [])]) fn(...args); }
}

export class FakeHub extends Emitter {
  constructor() {
    super();
    this.rooms = new Map(); // code -> Set<ServerSocket>
    this.count = 0;
  }

  // lado do servidor: io.to(code).emit(...)
  to(code, except = null) {
    return {
      emit: (ev, ...args) => {
        for (const s of this.rooms.get(code) ?? []) if (s !== except) s.client.receive(ev, args);
      },
    };
  }

  // lado do cliente: io() devolve um socket ligado
  connect() {
    const server = new ServerSocket(this, `s${++this.count}`);
    const client = new ClientSocket(server);
    server.client = client;
    later(() => this.fire('connection', [server]));
    return client;
  }
}

class ServerSocket extends Emitter {
  constructor(hub, id) { super(); this.hub = hub; this.id = id; this.joined = new Set(); }
  join(code) {
    this.joined.add(code);
    (this.hub.rooms.get(code) ?? this.hub.rooms.set(code, new Set()).get(code)).add(this);
  }
  to(code) { return this.hub.to(code, this); }
  emit(ev, ...args) { this.client.receive(ev, args); }
  leaveAll() { for (const code of this.joined) this.hub.rooms.get(code)?.delete(this); }
}

class ClientSocket extends Emitter {
  constructor(server) { super(); this.server = server; this.connected = true; }
  emit(ev, ...args) {
    if (!this.connected) return;
    let cb = null;
    if (typeof args.at(-1) === 'function') cb = args.pop();
    const sent = args.map(clone);
    if (cb) sent.push(res => later(() => cb(clone(res))));
    later(() => this.server.fire(ev, sent));
  }
  receive(ev, args) {
    const copy = args.map(clone);
    later(() => this.fire(ev, copy));
  }
  close() {
    if (!this.connected) return;
    this.connected = false;
    this.server.leaveAll();
    later(() => this.server.fire('disconnect', []));
  }
}
