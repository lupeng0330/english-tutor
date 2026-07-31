// AI 服务端代理：密钥只留服务端，客户端通过 /api/ai/* 调用。
// 支持 OpenAI 兼容接口（openai / deepseek / qwen / moonshot / custom）。
import { prisma } from '../db';
import type { Role } from '../types';

const PROVIDER_BASE: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  moonshot: 'https://api.moonshot.cn/v1',
};

export interface AiConfig {
  enabled: boolean;
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export async function getAiConfig(): Promise<AiConfig> {
  const keys = ['aiEnabled', 'aiProvider', 'aiModel', 'aiApiKey', 'aiBaseUrl'];
  const rows = await prisma.systemSetting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, unknown> = {};
  for (const r of rows) {
    try {
      map[r.key] = JSON.parse(r.value);
    } catch {
      map[r.key] = r.value;
    }
  }
  const provider = (typeof map.aiProvider === 'string' && map.aiProvider) || 'openai';
  const model = (typeof map.aiModel === 'string' && map.aiModel) || 'gpt-4o-mini';
  const apiKey = (typeof map.aiApiKey === 'string' && map.aiApiKey) || '';
  const enabled = map.aiEnabled === true && !!apiKey;
  const baseUrl =
    (typeof map.aiBaseUrl === 'string' && map.aiBaseUrl) ||
    PROVIDER_BASE[provider] ||
    PROVIDER_BASE.openai;
  return { enabled, provider, baseUrl, model, apiKey };
}

function buildAuthHeaders(cfg: AiConfig): Record<string, string> {
  // 通义/部分国内厂商用 Bearer 即可（兼容模式）
  return {
    Authorization: `Bearer ${cfg.apiKey}`,
    'Content-Type': 'application/json',
  };
}

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** 流式对话：返回上游 fetch Response，由路由层转发 SSE。未启用时返回 null。 */
export async function chatStream(
  messages: ChatMessage[],
  opts?: { model?: string; temperature?: number; role?: Role }
): Promise<{ cfg: AiConfig; res: Response } | { error: string; status: number }> {
  const cfg = await getAiConfig();
  if (!cfg.enabled) return { error: 'AI 服务未开启或密钥未配置', status: 503 };
  const model = opts?.model || cfg.model;
  const sysExtra =
    opts?.role === 'student'
      ? '\n你正在辅导一名中小学生学习英语，请用鼓励、易懂、分步骤的中文讲解，必要时给出例句。'
      : '';
  const payload: Record<string, unknown> = {
    model,
    messages: [
      ...(sysExtra ? [{ role: 'system' as const, content: sysExtra }] : []),
      ...messages,
    ],
    temperature: opts?.temperature ?? 0.7,
    stream: true,
  };
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: buildAuthHeaders(cfg),
    body: JSON.stringify(payload),
    signal: withTimeout(120_000),
  });
  return { cfg, res };
}

/** 语音转写（ASR）：接收 base64 音频，手动构造 multipart 转发到 OpenAI 兼容 /audio/transcriptions。 */
export async function transcribe(
  audioBase64: string,
  mime: string,
  opts?: { model?: string }
): Promise<{ text: string } | { error: string; status: number }> {
  const cfg = await getAiConfig();
  if (!cfg.enabled) return { error: 'AI 服务未开启或密钥未配置', status: 503 };
  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const model = opts?.model || 'whisper-1';
  const boundary = `----yxyyBoundary${Date.now()}`;
  const enc = (s: string) => Buffer.from(s, 'utf8');
  const parts: Buffer[] = [];
  parts.push(enc(`--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\n${model}\r\n`));
  parts.push(
    enc(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio"\r\nContent-Type: ${mime}\r\n\r\n`
    )
  );
  parts.push(audioBuffer);
  parts.push(enc(`\r\n--${boundary}--\r\n`));
  const body = Buffer.concat(parts);
  const res = await fetch(`${cfg.baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
    signal: withTimeout(120_000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    return { error: `ASR 上游错误(${res.status}): ${txt.slice(0, 200)}`, status: res.status };
  }
  const data = (await res.json().catch(() => ({}))) as { text?: string };
  return { text: data.text || '' };
}

/** 作文评分：非流式，调用 LLM 输出结构化评分。 */
export async function scoreEssay(input: {
  prompt?: string;
  title?: string;
  text: string;
  language?: 'en' | 'zh';
  opts?: { model?: string; role?: Role };
}): Promise<{ result: unknown } | { error: string; status: number }> {
  const cfg = await getAiConfig();
  if (!cfg.enabled) return { error: 'AI 服务未开启或密钥未配置', status: 503 };
  const lang = input.language || 'en';
  const sys =
    '你是一名严谨的英语作文评分老师。请按满分 100 评分，并给出分项与建议。' +
    '你必须只输出一个 JSON 对象，不要包含任何额外文字，格式：' +
    '{"score":<0-100整数>,"breakdown":{"content":<0-25>,"language":<0-25>,"structure":<0-25>,"task":<0-25>},' +
    '"comment":"<总体评语>","suggestions":["<建议1>","<建议2>"]}。';
  const userPrompt = [
    input.prompt ? `写作题目/要求：${input.prompt}` : '',
    input.title ? `作文标题：${input.title}` : '',
    `学生作文（${lang === 'en' ? '英文' : '中文'}）：\n${input.text}`,
  ]
    .filter(Boolean)
    .join('\n');
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: buildAuthHeaders(cfg),
    body: JSON.stringify({
      model: input.opts?.model || cfg.model,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      stream: false,
    }),
    signal: withTimeout(120_000),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    return { error: `评分上游错误(${res.status}): ${txt.slice(0, 200)}`, status: res.status };
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content || '{}';
  let parsed: unknown;
  try {
    parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
  } catch {
    parsed = { score: 0, comment: '评分结果解析失败', suggestions: [], raw: content.slice(0, 500) };
  }
  return { result: parsed };
}
