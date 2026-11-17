// Servidor: serve o site e trata das salas em tempo real (Socket.IO).
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import * as R from './rooms.js';

const here = dirname(fileURLToPath(import.meta.url));

export function startServer({ port = 3000, dataFile = join(here, 'data', 'rooms.json'), log = true } = {}) {
  const app = express();
  const http = createServer(app);
  const io = new Server(http, { maxHttpBufferSize: 64 * 1024 });
  const store = new R.RoomStore(dataFile);
  const timers = new Map(); // code -> timeout do temporizador
  const duelTimers = new Map();

  app.use(express.static(join(here, 'public')));
  app.get('/health', (_req, res) => res.json({ ok: true }));

  const emitMembers = room => io.to(room.code).emit('members', R.membersList(room));
  const emitTimer = room => io.to(room.code).emit('timer', room.timer);

  function scheduleTimer(room) {
    clearTimeout(timers.get(room.code));
    if (room.timer.state === 'idle') return;
    const ms = Math.max(0, room.timer.endsAt - Date.now());
    timers.set(room.code, setTimeout(() => {
      if (room.timer.state === 'focus') {
        const { minutes, rewarded } = R.finishFocus(room);
        io.to(room.code).emit('focusDone', { minutes, rewarded, stats: room.stats });
        R.startBreak(room);
      } else {
        R.stopTimer(room);
        io.to(room.code).emit('breakDone');
      }
      store.save();
      emitTimer(room);
      emitMembers(room);
      scheduleTimer(room);
    }, ms));
  }

  function runDuelQuestion(room) {
    const q = R.nextQuestion(room);
    if (!q) {
      const ranking = R.endDuel(room);
      io.to(room.code).emit('duelEnd', { ranking, stats: room.stats });
      store.save();
      return;
    }
    io.to(room.code).emit('duelQuestion', q);
    duelTimers.set(room.code, setTimeout(() => {
      io.to(room.code).emit('duelReveal', R.revealAnswer(room));
      duelTimers.set(room.code, setTimeout(() => runDuelQuestion(room), 3000));
    }, R.DUEL.perQuestionMs));
  }

  io.on('connection', socket => {
    let room = null;
    let me = null;
    const ack = (cb, data) => typeof cb === 'function' && cb(data);

    function join(target, profile, cb) {
      if (!target) return ack(cb, { error: 'Não encontrei nenhuma sala com esse código.' });
      const res = R.addMember(target, socket.id, profile);
      if (res.error) return ack(cb, res);
      room = target;
      me = res.member;
      socket.join(room.code);
      ack(cb, { room: R.publicRoom(room), me });
      socket.to(room.code).emit('system', `${me.name} entrou na sala.`);
      emitMembers(room);
    }

    socket.on('createRoom', ({ name, profile } = {}, cb) => {
      if (room) return ack(cb, { error: 'Já estás numa sala.' });
      const target = store.create(name, profile?.name);
      join(target, profile, cb);
    });

    socket.on('joinRoom', ({ code, profile } = {}, cb) => {
      if (room) return ack(cb, { error: 'Já estás numa sala.' });
      join(store.get(code), profile, cb);
    });

    // A partir daqui é preciso estar numa sala.
    const inRoom = fn => (...args) => { if (room && me) fn(...args); };

    socket.on('chat', inRoom(text => {
      const msg = R.addMessage(room, me.name, text);
      if (msg) { io.to(room.code).emit('chat', msg); store.save(); }
    }));

    socket.on('status', inRoom(status => {
      R.setStatus(room, socket.id, status);
      emitMembers(room);
    }));

    socket.on('profile', inRoom(p => {
      me.avatar = String(p?.avatar ?? me.avatar).slice(0, 8);
      me.frame = String(p?.frame ?? me.frame).slice(0, 20);
      emitMembers(room);
    }));

    socket.on('timerStart', inRoom(minutes => {
      R.startFocus(room, Date.now(), minutes);
      io.to(room.code).emit('system', `${me.name} começou ${room.timer.focusMin} min de foco. Bora! 💪`);
      emitTimer(room); emitMembers(room); scheduleTimer(room);
    }));

    socket.on('timerStop', inRoom(() => {
      R.stopTimer(room);
      io.to(room.code).emit('system', `${me.name} parou o temporizador.`);
      emitTimer(room); emitMembers(room); scheduleTimer(room);
    }));

    socket.on('addNote', inRoom(({ title, text } = {}, cb) => {
      const note = R.addNote(room, me.name, title, text);
      if (!note) return ack(cb, { error: 'Não deu para guardar o apontamento.' });
      io.to(room.code).emit('note', note); store.save(); ack(cb, { ok: true });
    }));

    socket.on('removeNote', inRoom(id => {
      if (R.removeNote(room, id, me.name)) { io.to(room.code).emit('noteRemoved', id); store.save(); }
    }));

    socket.on('addQuestion', inRoom((q, cb) => {
      const res = R.addQuestion(room, me.name, q);
      if (res.error) return ack(cb, res);
      const { id, author, question } = res.question;
      io.to(room.code).emit('question', { id, author, question });
      store.save(); ack(cb, { ok: true });
    }));

    socket.on('removeQuestion', inRoom(id => {
      if (R.removeQuestion(room, id, me.name)) { io.to(room.code).emit('questionRemoved', id); store.save(); }
    }));

    socket.on('duelStart', inRoom((_x, cb) => {
      const res = R.startDuel(room);
      if (res.error) return ack(cb, res);
      ack(cb, { ok: true });
      io.to(room.code).emit('duelStarting', { by: me.name, total: res.duel.questions.length });
      duelTimers.set(room.code, setTimeout(() => runDuelQuestion(room), 3000));
    }));

    socket.on('duelAnswer', inRoom((choice, cb) => {
      const res = R.answerDuel(room, me.name, choice);
      if (res) { ack(cb, res); io.to(room.code).emit('duelAnswered', me.name); }
    }));

    socket.on('report', inRoom(({ messageId } = {}) => {
      const msg = room.messages.find(m => m.id === messageId);
      if (msg) console.warn(`[DENÚNCIA] sala ${room.code}: ${me.name} denunciou "${msg.text}" de ${msg.author}`);
    }));

    socket.on('disconnect', () => {
      if (!room || !me) return;
      room.members.delete(socket.id);
      io.to(room.code).emit('system', `${me.name} saiu da sala.`);
      emitMembers(room);
    });
  });

  return new Promise(resolve => {
    http.listen(port, () => {
      const actual = http.address().port;
      if (log) console.log(`📚 Estudo com Amigos a correr em http://localhost:${actual}`);
      resolve({
        port: actual, io, store,
        close: () => new Promise(r => {
          for (const t of [...timers.values(), ...duelTimers.values()]) clearTimeout(t);
          store.saveNow();
          io.close(() => r());
        }),
      });
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer({ port: Number(process.env.PORT) || 3000 });
}
