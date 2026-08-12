import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../db';
import { asyncHandler, badRequest } from '../../middleware/error';
import { AuthedRequest } from '../../types';
import { writeAudit } from '../../services/audit';
import { checksum, countItems, getParsedDocument, importContentFiles } from '../../services/content';
import { containsCI } from '../../utils/query';

const router = Router();
const pageQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  kind: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  search: z.string().max(100).optional(),
});

router.get('/content', asyncHandler(async (req, res) => {
  const parsed = pageQuery.safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const { page, pageSize, kind, status, search } = parsed.data;
  const where = {
    ...(kind ? { kind } : {}),
    ...(status ? { status } : {}),
    ...(search ? { path: containsCI(search) } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.contentDocument.count({ where }),
    prisma.contentDocument.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, path: true, kind: true, version: true, status: true, checksum: true, itemCount: true, publishedAt: true, createdAt: true, updatedAt: true },
    }),
  ]);
  res.json({ total, page, pageSize, items });
}));

router.post('/content/import', asyncHandler(async (req: AuthedRequest, res) => {
  const parsed = z.object({ paths: z.array(z.string()).max(200).optional() }).safeParse(req.body || {});
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const result = await importContentFiles(parsed.data.paths);
  await writeAudit(req.user!.sub, 'content.import', null, {
    requested: parsed.data.paths?.length || 'all',
    imported: result.imported.length,
    errors: result.errors.length,
  }, req.ip);
  res.json(result);
}));

router.get('/content/export', asyncHandler(async (req, res) => {
  const parsed = z.object({ kind: z.string().optional(), status: z.enum(['draft', 'published']).optional() }).safeParse(req.query);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const documents = await prisma.contentDocument.findMany({
    where: parsed.data,
    orderBy: { path: 'asc' },
  });
  res.json({
    exportedAt: new Date().toISOString(),
    count: documents.length,
    documents: documents.map(({ payload, ...meta }) => ({ ...meta, payload: JSON.parse(payload) })),
  });
}));

router.get('/content/:id', asyncHandler(async (req, res) => {
  const { document, payload } = await getParsedDocument(req.params.id);
  res.json({ ...document, payload });
}));

const updateSchema = z.object({
  payload: z.unknown().optional(),
  status: z.enum(['draft', 'published']).optional(),
}).refine((value) => value.payload !== undefined || value.status !== undefined, '没有可更新字段');

router.put('/content/:id', asyncHandler(async (req: AuthedRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0].message);
  const { document } = await getParsedDocument(req.params.id);
  const hasPayload = parsed.data.payload !== undefined;
  const payload = hasPayload ? parsed.data.payload : JSON.parse(document.payload);
  const status = parsed.data.status || (hasPayload ? 'draft' : document.status);
  const updated = await prisma.contentDocument.update({
    where: { id: document.id },
    data: {
      ...(hasPayload ? {
        payload: JSON.stringify(payload),
        checksum: checksum(payload),
        itemCount: countItems(payload),
        version: { increment: 1 },
      } : {}),
      status,
      publishedAt: status === 'published' ? new Date() : null,
    },
  });
  await writeAudit(req.user!.sub, 'content.update', document.id, {
    path: document.path,
    version: updated.version,
    status,
  }, req.ip);
  res.json({ ...updated, payload });
}));

export default router;
