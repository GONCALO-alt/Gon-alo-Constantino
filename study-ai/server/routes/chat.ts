import fs from 'node:fs';
import path from 'node:path';
import express, { Router } from 'express';
import { z } from 'zod';
import type { AiContent, AiMessage } from '../ai/client.ts';
import { chatSystemPrompt } from '../ai/prompts.ts';
import { assertAllowed, getUsage, recordUsage } from '../ai/usage.ts';
import { type Ctx, loadEvents, loadProfile, uid, validate } from '../context.ts';
import { nowIso, type Db } from '../db.ts';
import { HttpError, looksLikeText, newId, RateLimiter, sniffMime } from '../security.ts';
import {
  AI_PLANS,
  FILE_TYPES,
  IMAGE_TYPES,
  MAX_ATTACHMENTS_PER_MESSAGE,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  MAX_TEXT_BYTES,
} from '../../shared/plans.ts';
import type { Attachment, ChatMessage, Conversation } from '../../shared/types.ts';

interface AttachmentRow {
  id: string;
  user_id: string;
  message_id: string | null;
  kind: 'image' | 'file';
  mime: string;
  name: string;
  size: number;
  path: string;
  created_at: string;
}

interface MessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  plan: string | null;
  status: ChatMessage['status'];
  created_at: string;
}

interface ConversationRow {
  id: string;
  title: string;
  subject: string | null;
  created_at: string;
  updated_at: string;
}

const toAttachment = (a: AttachmentRow): Attachment => ({ id: a.id, kind: a.kind, mime: a.mime, name: a.name, size: a.size });

const toConversation = (c: ConversationRow, preview?: string): Conversation => ({
  id: c.id,
  title: c.title,
  subject: c.subject,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  ...(preview !== undefined ? { preview } : {}),
});

function messagesWithAttachments(db: Db, userId: string, rows: MessageRow[]): ChatMessage[] {
  if (!rows.length) return [];
  const atts = db.all<AttachmentRow>(
    `SELECT * FROM attachments WHERE user_id = ? AND message_id IN (${rows.map(() => '?').join(',')}) ORDER BY created_at`,
    userId,
    ...rows.map((r) => r.id),
  );
  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    content: r.content,
    plan: (r.plan as ChatMessage['plan']) ?? null,
    status: r.status,
    createdAt: r.created_at,
    attachments: atts.filter((a) => a.message_id === r.id).map(toAttachment),
  }));
}

function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return 'Nova conversa';
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}

/** Converte um anexo guardado num bloco de conteúdo para a API. */
function attachmentBlock(a: AttachmentRow): AiContent | null {
  if (!fs.existsSync(a.path)) return null;
  const buf = fs.readFileSync(a.path);
  if (a.kind === 'image') {
    return {
      type: 'image',
      source: { type: 'base64', media_type: a.mime as (typeof IMAGE_TYPES)[number], data: buf.toString('base64') },
    };
  }
  if (a.mime === 'application/pdf') {
    return { type: 'document', title: a.name, source: { type: 'base64', media_type: 'application/pdf', data: buf.toString('base64') } };
  }
  return { type: 'document', title: a.name, source: { type: 'text', media_type: 'text/plain', data: buf.toString('utf8') } };
}

/** Histórico da conversa para enviar ao modelo (as últimas mensagens, com anexos recentes). */
function buildHistory(db: Db, userId: string, conversationId: string): AiMessage[] {
  const rows = db
    .all<MessageRow>(
      `SELECT * FROM (SELECT id, role, content, plan, status, created_at FROM messages
         WHERE conversation_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 40)
       ORDER BY created_at ASC`,
      conversationId,
      userId,
    )
    .filter((m) => m.content.trim() || m.role === 'user');
  while (rows.length && rows[0]!.role !== 'user') rows.shift();
  const withAttachments = new Set(rows.slice(-8).map((r) => r.id));
  const atts = rows.length
    ? db.all<AttachmentRow>(
        `SELECT * FROM attachments WHERE user_id = ? AND message_id IN (${rows.map(() => '?').join(',')}) ORDER BY created_at`,
        userId,
        ...rows.map((r) => r.id),
      )
    : [];
  return rows.map((m): AiMessage => {
    if (m.role === 'assistant') return { role: 'assistant', content: m.content };
    const mine = atts.filter((a) => a.message_id === m.id);
    const blocks: AiContent[] = [];
    for (const a of mine) {
      const block = withAttachments.has(m.id) ? attachmentBlock(a) : null;
      if (block) blocks.push(block);
      else blocks.push({ type: 'text', text: `[Anexo enviado antes: ${a.name}]` });
    }
    blocks.push({ type: 'text', text: m.content.trim() || 'Analisa o que te enviei e ajuda-me.' });
    return { role: 'user', content: blocks };
  });
}

export function cleanupOrphanAttachments(db: Db, olderThanHours = 24) {
  const cutoff = new Date(Date.now() - olderThanHours * 3_600_000).toISOString();
  const rows = db.all<AttachmentRow>('SELECT * FROM attachments WHERE message_id IS NULL AND created_at < ?', cutoff);
  for (const a of rows) {
    fs.rmSync(a.path, { force: true });
    db.run('DELETE FROM attachments WHERE id = ?', a.id);
  }
  return rows.length;
}

function deleteAttachmentFiles(db: Db, userId: string, conversationId: string) {
  const rows = db.all<AttachmentRow>(
    `SELECT a.* FROM attachments a JOIN messages m ON m.id = a.message_id
     WHERE m.conversation_id = ? AND a.user_id = ?`,
    conversationId,
    userId,
  );
  for (const a of rows) {
    fs.rmSync(a.path, { force: true });
    db.run('DELETE FROM attachments WHERE id = ?', a.id);
  }
}

const sendSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  content: z.string().max(20000, 'a mensagem é demasiado longa'),
  attachmentIds: z.array(z.string().uuid()).max(MAX_ATTACHMENTS_PER_MESSAGE).default([]),
  subject: z.string().regex(/^[a-z0-9-]{1,60}$/).nullable().optional(),
});

export function chatRouter(ctx: Ctx): Router {
  const r = Router();
  const aiLimiter = new RateLimiter(15, 60 * 1000);
  const uploadLimiter = new RateLimiter(40, 10 * 60 * 1000);

  // ---------- Conversas ----------

  r.get('/conversations', (req, res) => {
    const userId = uid(res);
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const rows = ctx.db.all<ConversationRow & { preview: string | null }>(
      `SELECT c.*, (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS preview
       FROM conversations c WHERE c.user_id = ?
       ${q ? "AND (c.title LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id AND m.content LIKE ? ESCAPE '\\'))" : ''}
       ORDER BY c.updated_at DESC LIMIT 200`,
      userId,
      ...(q ? [`%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`, `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`] : []),
    );
    res.json({
      conversations: rows.map((c) => toConversation(c, (c.preview ?? '').replace(/[#*_`$>\-]/g, '').replace(/\s+/g, ' ').slice(0, 120))),
    });
  });

  function getConversation(userId: string, id: string): ConversationRow {
    const c = ctx.db.one<ConversationRow>('SELECT * FROM conversations WHERE id = ? AND user_id = ?', id, userId);
    if (!c) throw new HttpError(404, 'Conversa não encontrada.', 'not_found');
    return c;
  }

  r.get('/conversations/:id', (req, res) => {
    const userId = uid(res);
    const c = getConversation(userId, req.params.id);
    const rows = ctx.db.all<MessageRow>(
      'SELECT id, role, content, plan, status, created_at FROM messages WHERE conversation_id = ? AND user_id = ? ORDER BY created_at',
      c.id,
      userId,
    );
    res.json({ conversation: toConversation(c), messages: messagesWithAttachments(ctx.db, userId, rows) });
  });

  r.patch('/conversations/:id', (req, res) => {
    const userId = uid(res);
    const c = getConversation(userId, req.params.id);
    const body = validate(
      z.object({
        title: z.string().trim().min(1).max(80).optional(),
        subject: z.string().regex(/^[a-z0-9-]{1,60}$/).nullable().optional(),
      }),
      req.body,
    );
    ctx.db.run(
      'UPDATE conversations SET title = ?, subject = ? WHERE id = ? AND user_id = ?',
      body.title ?? c.title,
      body.subject === undefined ? c.subject : body.subject,
      c.id,
      userId,
    );
    res.json({ conversation: toConversation(getConversation(userId, c.id)) });
  });

  r.delete('/conversations/:id', (req, res) => {
    const userId = uid(res);
    const c = getConversation(userId, req.params.id);
    deleteAttachmentFiles(ctx.db, userId, c.id);
    ctx.db.run('DELETE FROM conversations WHERE id = ? AND user_id = ?', c.id, userId);
    res.json({ ok: true });
  });

  // ---------- Anexos (imagens e ficheiros) ----------

  r.post('/uploads', express.raw({ type: () => true, limit: MAX_PDF_BYTES + 1024 }), (req, res) => {
    const userId = uid(res);
    if (!uploadLimiter.take(userId)) throw new HttpError(429, 'Demasiados envios. Espera um pouco.', 'rate_limited');
    const profile = loadProfile(ctx.db, userId);
    const plan = AI_PLANS[profile.aiPlan];
    const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    if (!buf.length) throw new HttpError(400, 'O ficheiro está vazio.', 'empty');
    const declared = (req.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
    let name = 'ficheiro';
    try {
      name = decodeURIComponent(req.get('x-file-name') ?? 'ficheiro');
    } catch {
      /* nome inválido: usa o genérico */
    }
    name = name.replace(/[\\/\0\r\n]/g, '_').slice(0, 120) || 'ficheiro';

    const sniffed = sniffMime(buf);
    let kind: 'image' | 'file';
    let mime: string;
    if (sniffed && (IMAGE_TYPES as readonly string[]).includes(sniffed)) {
      kind = 'image';
      mime = sniffed;
      if (plan.dailyImages === 0)
        throw new HttpError(403, `O ${plan.name} não permite carregar imagens. Escolhe o Cláudio 5.5 ou o Cláudio 6.`, 'plan_no_images');
      if (buf.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'A imagem é maior do que 5 MB. Tira uma fotografia mais pequena.', 'too_large');
      const usage = getUsage(ctx.db, userId, profile.aiPlan, ctx.today());
      if (usage.imagesLimit !== null && usage.imagesUsed >= usage.imagesLimit)
        throw new HttpError(429, `Já usaste as ${usage.imagesLimit} imagens de hoje do ${plan.name}.`, 'limit_images');
    } else if (sniffed === 'application/pdf') {
      kind = 'file';
      mime = sniffed;
      if (!plan.files) throw new HttpError(403, `O ${plan.name} não permite carregar ficheiros. Só o Cláudio 6 analisa documentos.`, 'plan_no_files');
      if (buf.length > MAX_PDF_BYTES) throw new HttpError(413, 'O PDF é maior do que 20 MB.', 'too_large');
    } else if ((FILE_TYPES as readonly string[]).includes(declared) && declared !== 'application/pdf') {
      kind = 'file';
      mime = declared;
      if (!plan.files) throw new HttpError(403, `O ${plan.name} não permite carregar ficheiros. Só o Cláudio 6 analisa documentos.`, 'plan_no_files');
      if (buf.length > MAX_TEXT_BYTES) throw new HttpError(413, 'O ficheiro de texto é maior do que 1 MB.', 'too_large');
      if (!looksLikeText(buf)) throw new HttpError(415, 'O ficheiro não parece ser texto.', 'bad_type');
    } else {
      throw new HttpError(
        415,
        'Tipo de ficheiro não suportado. Usa imagens (JPG, PNG, WEBP, GIF), PDF ou ficheiros de texto (TXT, MD, CSV).',
        'bad_type',
      );
    }

    const id = newId();
    const dir = path.join(ctx.db.uploadsDir, userId);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, id);
    fs.writeFileSync(filePath, buf, { mode: 0o600 });
    ctx.db.run(
      'INSERT INTO attachments (id, user_id, message_id, kind, mime, name, size, path, created_at) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)',
      id, userId, kind, mime, name, buf.length, filePath, nowIso(),
    );
    res.status(201).json({ attachment: { id, kind, mime, name, size: buf.length } satisfies Attachment });
  });

  r.get('/attachments/:id', (req, res) => {
    const userId = uid(res);
    const a = ctx.db.one<AttachmentRow>('SELECT * FROM attachments WHERE id = ? AND user_id = ?', req.params.id, userId);
    if (!a || !fs.existsSync(a.path)) throw new HttpError(404, 'Ficheiro não encontrado.', 'not_found');
    res.setHeader('Content-Type', a.mime);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Disposition',
      `${a.kind === 'image' ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(a.name)}`,
    );
    fs.createReadStream(a.path).pipe(res);
  });

  r.delete('/attachments/:id', (req, res) => {
    const userId = uid(res);
    const a = ctx.db.one<AttachmentRow>('SELECT * FROM attachments WHERE id = ? AND user_id = ? AND message_id IS NULL', req.params.id, userId);
    if (a) {
      fs.rmSync(a.path, { force: true });
      ctx.db.run('DELETE FROM attachments WHERE id = ?', a.id);
    }
    res.json({ ok: true });
  });

  // ---------- Enviar mensagem (resposta em streaming, Server-Sent Events) ----------

  r.post('/chat/send', async (req, res) => {
    const userId = uid(res);
    const body = validate(sendSchema, req.body);
    if (!body.content.trim() && !body.attachmentIds.length) throw new HttpError(400, 'Escreve uma pergunta.', 'empty');
    if (!ctx.ai.configured) throw new HttpError(503, ctx.ai.status().message, 'ai_not_configured');
    if (!aiLimiter.take(userId)) throw new HttpError(429, 'Estás a enviar mensagens muito depressa. Espera um pouco.', 'rate_limited');

    const profile = loadProfile(ctx.db, userId);
    const day = ctx.today();
    const usage = getUsage(ctx.db, userId, profile.aiPlan, day);
    const ids = [...new Set(body.attachmentIds)];
    const atts = ids.length
      ? ctx.db.all<AttachmentRow>(
          `SELECT * FROM attachments WHERE user_id = ? AND message_id IS NULL AND id IN (${ids.map(() => '?').join(',')})`,
          userId,
          ...ids,
        )
      : [];
    if (atts.length !== ids.length) throw new HttpError(400, 'Um dos anexos já não existe. Volta a carregá-lo.', 'bad_attachment');
    const images = atts.filter((a) => a.kind === 'image').length;
    assertAllowed(usage, { images, files: atts.length - images });

    let conversation: ConversationRow;
    let created = false;
    if (body.conversationId) {
      conversation = getConversation(userId, body.conversationId);
      if (body.subject !== undefined && body.subject !== conversation.subject) {
        ctx.db.run('UPDATE conversations SET subject = ? WHERE id = ?', body.subject, conversation.id);
        conversation = { ...conversation, subject: body.subject ?? null };
      }
    } else {
      const now = nowIso();
      conversation = {
        id: newId(),
        title: titleFrom(body.content || atts[0]?.name || ''),
        subject: body.subject ?? null,
        created_at: now,
        updated_at: now,
      };
      ctx.db.run(
        'INSERT INTO conversations (id, user_id, title, subject, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        conversation.id, userId, conversation.title, conversation.subject, now, now,
      );
      created = true;
    }

    const userMessageId = newId();
    const userCreatedAt = nowIso();
    ctx.db.tx(() => {
      ctx.db.run(
        'INSERT INTO messages (id, conversation_id, user_id, role, content, plan, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        userMessageId, conversation.id, userId, 'user', body.content, profile.aiPlan, 'ok', userCreatedAt,
      );
      for (const a of atts) ctx.db.run('UPDATE attachments SET message_id = ? WHERE id = ? AND user_id = ?', userMessageId, a.id, userId);
    });

    const history = buildHistory(ctx.db, userId, conversation.id);
    const system = chatSystemPrompt({
      plan: profile.aiPlan,
      questionnaire: profile.questionnaire,
      events: loadEvents(ctx.db, userId, day),
      subject: conversation.subject,
    });

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    const send = (event: string, data: unknown) => {
      if (!res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    const controller = new AbortController();
    let finished = false;
    res.on('close', () => {
      if (!finished) controller.abort();
    });
    const heartbeat = setInterval(() => !res.writableEnded && res.write(': ping\n\n'), 15000);

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: body.content,
      attachments: atts.map(toAttachment),
      plan: profile.aiPlan,
      status: 'ok',
      createdAt: userCreatedAt,
    };
    send('start', { conversation: toConversation(conversation), userMessage });

    /** Sem resposta nenhuma: a pergunta não é guardada nem contada. */
    const rollback = () => {
      ctx.db.tx(() => {
        ctx.db.run('UPDATE attachments SET message_id = NULL WHERE message_id = ? AND user_id = ?', userMessageId, userId);
        ctx.db.run('DELETE FROM messages WHERE id = ? AND user_id = ?', userMessageId, userId);
        if (created) ctx.db.run('DELETE FROM conversations WHERE id = ? AND user_id = ?', conversation.id, userId);
      });
    };

    try {
      const result = await ctx.ai.streamChat({
        plan: profile.aiPlan,
        system,
        messages: history,
        signal: controller.signal,
        onText: (delta) => send('delta', { text: delta }),
      });
      let text = result.text;
      let status: ChatMessage['status'] = 'ok';
      if (result.aborted) status = 'stopped';
      if (result.stopReason === 'refusal') {
        text += `${text ? '\n\n' : ''}_Não posso ajudar com este pedido. Se for uma dúvida de estudo, tenta explicá-la de outra forma._`;
      } else if (result.stopReason === 'max_tokens') {
        text += '\n\n_(A resposta foi cortada por ser muito longa. Pede «continua» para ver o resto.)_';
      }
      if (!text.trim()) {
        rollback();
        finished = true;
        send('error', { message: 'A resposta foi interrompida antes de começar. A pergunta não foi contada.', code: 'empty' });
        return;
      }
      const assistantId = newId();
      const createdAt = nowIso();
      ctx.db.tx(() => {
        ctx.db.run(
          'INSERT INTO messages (id, conversation_id, user_id, role, content, plan, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          assistantId, conversation.id, userId, 'assistant', text, profile.aiPlan, status, createdAt,
        );
        ctx.db.run('UPDATE conversations SET updated_at = ? WHERE id = ?', createdAt, conversation.id);
        recordUsage(ctx.db, userId, profile.aiPlan, day, { questions: 1, images, tokens: result.usage });
      });
      finished = true;
      send('done', {
        message: { id: assistantId, role: 'assistant', content: text, attachments: [], plan: profile.aiPlan, status, createdAt } satisfies ChatMessage,
        usage: getUsage(ctx.db, userId, profile.aiPlan, day),
      });
    } catch (err) {
      rollback();
      finished = true;
      const e = err instanceof HttpError ? err : new HttpError(500, 'Ocorreu um erro ao falar com a IA.', 'ai_error');
      send('error', { message: `${e.message} A pergunta não foi contada.`, code: e.code });
    } finally {
      clearInterval(heartbeat);
      finished = true;
      if (!res.writableEnded) res.end();
    }
  });

  return r;
}
