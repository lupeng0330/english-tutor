import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '../db';
import { badRequest, notFound } from '../middleware/error';

const EXCLUDED_SEGMENTS = new Set(['data', 'backups', '.backups']);

function isDirectory(candidate: string): Promise<boolean> {
  return fs.stat(candidate).then((stat) => stat.isDirectory()).catch(() => false);
}

let cachedRepoRoot: string | null = null;
export async function getRepositoryRoot(): Promise<string> {
  if (cachedRepoRoot) return cachedRepoRoot;
  let current = path.resolve(__dirname);
  while (true) {
    const dataDir = path.join(current, 'data');
    const apiPackage = path.join(current, 'apps', 'api', 'package.json');
    if (await isDirectory(dataDir) && await fs.access(apiPackage).then(() => true).catch(() => false)) {
      cachedRepoRoot = current;
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) throw new Error('无法定位仓库根目录');
    current = parent;
  }
}

export function normalizeContentPath(input: string): string {
  const normalized = input.trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized.startsWith('data/') || !normalized.endsWith('.json')) {
    throw badRequest('内容路径必须是 data/ 下的 JSON 文件');
  }
  const segments = normalized.split('/');
  if (segments.length < 2 || segments.some((part) => !part || part === '..' || part.startsWith('.'))) {
    throw badRequest('内容路径不安全');
  }
  if (segments.slice(1).some((part) => EXCLUDED_SEGMENTS.has(part.toLowerCase()))) {
    throw badRequest('内容路径位于排除目录');
  }
  return segments.join('/');
}

export async function resolveContentPath(relativePath: string): Promise<string> {
  const safePath = normalizeContentPath(relativePath);
  const root = await getRepositoryRoot();
  const dataRoot = path.resolve(root, 'data');
  const absolute = path.resolve(root, ...safePath.split('/'));
  if (!absolute.startsWith(`${dataRoot}${path.sep}`) && absolute !== dataRoot) {
    throw badRequest('内容路径越界');
  }
  return absolute;
}

export function contentKind(relativePath: string): string {
  const segment = normalizeContentPath(relativePath).split('/')[1];
  return ['questions', 'exams', 'textbooks', 'examples', 'extras', 'grammar'].includes(segment)
    ? segment
    : 'other';
}

export function checksum(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function countItems(payload: unknown): number {
  if (Array.isArray(payload)) return payload.length;
  if (!payload || typeof payload !== 'object') return 1;
  const record = payload as Record<string, unknown>;
  if (record.templates && typeof record.templates === 'object') return Object.keys(record.templates).length;
  if (Array.isArray(record.items)) return record.items.length;
  return Object.keys(record).length;
}

async function walkJsonFiles(directory: string, prefix = 'data'): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const lower = entry.name.toLowerCase();
    if (entry.name.startsWith('.') || EXCLUDED_SEGMENTS.has(lower)) continue;
    const relative = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) results.push(...await walkJsonFiles(path.join(directory, entry.name), relative));
    else if (entry.isFile() && lower.endsWith('.json')) results.push(relative);
  }
  return results;
}

export async function discoverContentFiles(): Promise<string[]> {
  const root = await getRepositoryRoot();
  return (await walkJsonFiles(path.join(root, 'data'))).sort();
}

export async function importContentFiles(paths?: string[]) {
  const selected = paths?.length ? paths.map(normalizeContentPath) : await discoverContentFiles();
  const imported = [];
  const errors: Array<{ path: string; error: string }> = [];
  for (const relativePath of selected) {
    try {
      const raw = await fs.readFile(await resolveContentPath(relativePath), 'utf8');
      const payload = JSON.parse(raw) as unknown;
      const digest = checksum(payload);
      const existing = await prisma.contentDocument.findUnique({ where: { path: relativePath } });
      const document = await prisma.contentDocument.upsert({
        where: { path: relativePath },
        create: {
          path: relativePath,
          kind: contentKind(relativePath),
          payload: JSON.stringify(payload),
          checksum: digest,
          itemCount: countItems(payload),
        },
        update: existing?.checksum === digest ? {} : {
          kind: contentKind(relativePath),
          payload: JSON.stringify(payload),
          checksum: digest,
          itemCount: countItems(payload),
          version: { increment: 1 },
          status: 'draft',
          publishedAt: null,
        },
      });
      imported.push({ id: document.id, path: document.path, version: document.version, changed: existing?.checksum !== digest });
    } catch (error) {
      errors.push({ path: relativePath, error: error instanceof Error ? error.message : '导入失败' });
    }
  }
  return { imported, errors };
}

export async function getParsedDocument(id: string) {
  const document = await prisma.contentDocument.findUnique({ where: { id } });
  if (!document) throw notFound('内容文件不存在');
  return { document, payload: JSON.parse(document.payload) as unknown };
}
