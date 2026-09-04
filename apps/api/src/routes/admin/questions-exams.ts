import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db';
import { asyncHandler, badRequest, notFound } from '../../middleware/error';
import { AuthedRequest } from '../../types';
import { writeAudit } from '../../services/audit';
import { checksum, getParsedDocument } from '../../services/content';

const router = Router();
type JsonRecord = Record<string, unknown>;

function questionType(filePath: string, item: JsonRecord): string {
  if (typeof item.type === 'string') return item.type;
  return filePath.split('/').pop()!.replace(/\.json$/, '').replace(/^(jk|hj|gzk)_/, '');
}

router.get('/questions', asyncHandler(async (req, res) => {
  const parsed = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    type: z.string().optional(),
    grade: z.coerce.number().int().optional(),
    search: z.string().max(100).optional(),
  }).safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const documents = await prisma.contentDocument.findMany({ where: { kind: 'questions' }, orderBy: { path: 'asc' } });
  const flat: Array<JsonRecord & { documentId: string; path: string; index: number; questionType: string }> = [];
  for (const document of documents) {
    const payload = JSON.parse(document.payload) as unknown;
    if (!Array.isArray(payload)) continue;
    payload.forEach((raw, index) => {
      if (!raw || typeof raw !== 'object') return;
      const item = raw as JsonRecord;
      flat.push({ ...item, documentId: document.id, path: document.path, index, questionType: questionType(document.path, item) });
    });
  }
  const { page, pageSize, type, grade, search } = parsed.data;
  const needle = search?.toLowerCase();
  const filtered = flat.filter((item) =>
    (!type || item.questionType === type) &&
    (grade === undefined || Number(item.grade) === grade) &&
    (!needle || [item.q, item.prompt, item.topic, item.passage, item.code].some((value) => String(value || '').toLowerCase().includes(needle)))
  );
  res.json({ total: filtered.length, page, pageSize, items: filtered.slice((page - 1) * pageSize, page * pageSize) });
}));

router.put('/questions/:documentId/items/:index', asyncHandler(async (req: AuthedRequest, res) => {
  const index = z.coerce.number().int().nonnegative().safeParse(req.params.index);
  const body = z.record(z.unknown()).safeParse(req.body);
  if (!index.success || !body.success) throw badRequest('题目索引或内容无效');
  const { document, payload } = await getParsedDocument(req.params.documentId);
  if (document.kind !== 'questions' || !Array.isArray(payload)) throw badRequest('目标不是题库文件');
  if (index.data >= payload.length) throw notFound('题目不存在');
  payload[index.data] = body.data;
  const updated = await prisma.contentDocument.update({
    where: { id: document.id },
    data: {
      payload: JSON.stringify(payload), checksum: checksum(payload), itemCount: payload.length,
      version: { increment: 1 }, status: 'draft', publishedAt: null,
    },
  });
  await writeAudit(req.user!.sub, 'question.update', document.id, { path: document.path, index: index.data, version: updated.version }, req.ip);
  res.json({ ...body.data, documentId: document.id, path: document.path, index: index.data, version: updated.version });
}));

router.get('/exam-templates', asyncHandler(async (_req, res) => {
  const document = await prisma.contentDocument.findUnique({ where: { path: 'data/exams/exam_templates.json' } });
  if (!document) throw notFound('考试模板尚未导入');
  const payload = JSON.parse(document.payload) as JsonRecord;
  const templates = payload.templates && typeof payload.templates === 'object' ? payload.templates as JsonRecord : {};
  res.json({ documentId: document.id, version: document.version, templates: Object.entries(templates).map(([key, value]) => ({ key, ...(value as JsonRecord) })) });
}));

const preflightSchema = z.object({
  templateKey: z.string().optional(),
  template: z.record(z.unknown()).optional(),
}).refine((value) => value.templateKey || value.template, 'templateKey 或 template 必填');

router.post('/exam-templates/preflight', asyncHandler(async (req, res) => {
  const parsed = preflightSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  let template = parsed.data.template;
  if (parsed.data.templateKey) {
    const document = await prisma.contentDocument.findUnique({ where: { path: 'data/exams/exam_templates.json' } });
    if (!document) throw notFound('考试模板尚未导入');
    const templates = (JSON.parse(document.payload) as JsonRecord).templates as JsonRecord | undefined;
    template = templates?.[parsed.data.templateKey] as JsonRecord | undefined;
    if (!template) throw notFound('考试模板不存在');
  }
  const questionDocuments = await prisma.contentDocument.findMany({ where: { kind: 'questions' } });
  const available: Record<string, number> = {};
  for (const document of questionDocuments) {
    const payload = JSON.parse(document.payload) as unknown;
    if (!Array.isArray(payload)) continue;
    for (const raw of payload) {
      if (!raw || typeof raw !== 'object') continue;
      const type = questionType(document.path, raw as JsonRecord);
      available[type] = (available[type] || 0) + 1;
    }
  }
  const sections = Array.isArray(template!.sections) ? template!.sections as JsonRecord[] : [];
  const checks = sections.map((section) => {
    const type = String(section.type || '');
    const required = Number(section.count || 0);
    const count = available[type] || 0;
    return { type, required, available: count, ok: count >= required, shortage: Math.max(0, required - count) };
  });
  res.json({ ok: checks.every((item) => item.ok), checks, totalPoints: template!.totalPoints ?? null });
}));

export default router;
