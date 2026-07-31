import { Router } from 'express';
import { Readable } from 'stream';
import { z } from 'zod';
import { asyncHandler, badRequest, unauthorized } from '../middleware/error';
import { requireEntitlement } from '../middleware/entitlement';
import { AuthedRequest } from '../types';
import { getAiConfig, chatStream, transcribe, scoreEssay, type ChatMessage } from '../services/ai';

const router = Router();

// GET /api/ai/status —— 返回 AI 是否启用及模型信息（不含密钥），需登录。
router.get(
  '/status',
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!req.user) throw unauthorized();
    const cfg = await getAiConfig();
    res.json({ enabled: cfg.enabled, provider: cfg.provider, model: cfg.model });
  })
);

// POST /api/ai/chat —— 流式对话（SSE），需 ai_chat 权益。
const chatSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(['system', 'user', 'assistant']), content: z.string() }))
    .min(1),
  model: z.string().optional(),
});
router.post(
  '/chat',
  requireEntitlement('ai_chat'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('messages 格式错误');
    const messages = parsed.data.messages as ChatMessage[];

    const result = await chatStream(messages, {
      model: parsed.data.model,
      role: req.user!.role,
    });
    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    const upstream = result.res;
    if (!upstream.ok) {
      const txt = await upstream.text().catch(() => '');
      res.status(upstream.status).json({ error: `AI 上游错误：${txt.slice(0, 300)}` });
      return;
    }
    // 转发上游 SSE 到客户端
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const ac = new AbortController();
    req.on('close', () => ac.abort());
    try {
      if (upstream.body) {
        const nodeStream = Readable.fromWeb(upstream.body as any);
        nodeStream.on('error', () => res.end());
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch {
      res.end();
    }
  })
);

// POST /api/ai/transcribe —— 语音转写（ASR），需 ai_speaking 权益。
const transcribeSchema = z.object({
  audio: z.string().min(1),
  mime: z.string().min(1),
  model: z.string().optional(),
});
router.post(
  '/transcribe',
  requireEntitlement('ai_speaking'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = transcribeSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('audio/mime 格式错误');
    const result = await transcribe(parsed.data.audio, parsed.data.mime, {
      model: parsed.data.model,
    });
    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.json({ text: result.text });
  })
);

// POST /api/ai/essay —— 作文评分，需 ai_essay 权益。
const essaySchema = z.object({
  text: z.string().min(1),
  prompt: z.string().optional(),
  title: z.string().optional(),
  language: z.enum(['en', 'zh']).optional(),
  model: z.string().optional(),
});
router.post(
  '/essay',
  requireEntitlement('ai_essay'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = essaySchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('text 格式错误');
    const result = await scoreEssay({
      text: parsed.data.text,
      prompt: parsed.data.prompt,
      title: parsed.data.title,
      language: parsed.data.language,
      opts: { model: parsed.data.model, role: req.user!.role },
    });
    if ('error' in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.json({ result: result.result });
  })
);

export default router;
