// 学习数据云同步路由（Phase 3 首批：wrongbook / stats）。
//   - GET  /api/sync/:key?profileId=xxx        拉取某 key 的云端 blob + 版本
//   - PUT  /api/sync/:key                       推送某 key（body: {profileId, data, baseVersion}）
//   - GET  /api/sync                            批量拉取当前用户所有 blob 概要（版本表）
//
// 冲突策略（Phase 3 首批，last-write-wins + 版本号）：
//   客户端 PUT 带 baseVersion（上次拉取到的版本）。若服务端当前版本 > baseVersion，
//   说明别处已更新，返回 409 + 服务端最新数据，由客户端决定合并/覆盖（首批：客户端
//   可选择用服务端版本刷新本地）。相等则接受写入并 version+1。
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authRequired } from '../middleware/auth';
import { asyncHandler, badRequest, conflict } from '../middleware/error';
import { AuthedRequest } from '../types';

const router = Router();
router.use(authRequired);

// 允许同步的 key 白名单（错题本 + 统计 + 档案列表；后续增量放开）
// yxyy_profiles_v1 是全局元数据（客户端用固定 profileId='__global__' 存取）
const ALLOWED_KEYS = new Set(['yxyy_wrongbook_v1', 'yxyy_stats_v1', 'yxyy_profiles_v1']);

function assertKey(key: string) {
  if (!ALLOWED_KEYS.has(key)) throw badRequest(`不支持同步的 key：${key}`);
}

// 批量版本概要（客户端登录后先拉这个，决定哪些需要下载）
router.get(
  '/sync',
  asyncHandler(async (req: AuthedRequest, res) => {
    const profileId = (req.query.profileId as string) || 'default';
    const blobs = await prisma.syncBlob.findMany({
      where: { userId: req.user!.sub, profileId },
      select: { key: true, version: true, updatedAt: true },
    });
    res.json({ profileId, blobs });
  })
);

// 拉取单个 key
router.get(
  '/sync/:key',
  asyncHandler(async (req: AuthedRequest, res) => {
    const key = req.params.key;
    assertKey(key);
    const profileId = (req.query.profileId as string) || 'default';
    const blob = await prisma.syncBlob.findUnique({
      where: { userId_profileId_key: { userId: req.user!.sub, profileId, key } },
    });
    if (!blob) {
      res.json({ key, profileId, version: 0, data: null });
      return;
    }
    res.json({
      key,
      profileId,
      version: blob.version,
      data: JSON.parse(blob.data),
      updatedAt: blob.updatedAt,
    });
  })
);

// 推送单个 key
const putSchema = z.object({
  profileId: z.string().default('default'),
  data: z.unknown(),
  baseVersion: z.number().int().nonnegative().default(0),
});
router.put(
  '/sync/:key',
  asyncHandler(async (req: AuthedRequest, res) => {
    const key = req.params.key;
    assertKey(key);
    const parsed = putSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('请求体格式错误');
    const { profileId, data, baseVersion } = parsed.data;
    const userId = req.user!.sub;

    const existing = await prisma.syncBlob.findUnique({
      where: { userId_profileId_key: { userId, profileId, key } },
    });

    if (existing && existing.version > baseVersion) {
      // 服务端更新更晚，冲突：返回最新供客户端决定
      throw conflict(
        JSON.stringify({
          reason: 'version_conflict',
          serverVersion: existing.version,
          serverData: JSON.parse(existing.data),
        })
      );
    }

    const newVersion = (existing?.version || 0) + 1;
    const saved = await prisma.syncBlob.upsert({
      where: { userId_profileId_key: { userId, profileId, key } },
      update: { data: JSON.stringify(data ?? {}), version: newVersion },
      create: { userId, profileId, key, data: JSON.stringify(data ?? {}), version: newVersion },
    });
    res.json({ key, profileId, version: saved.version });
  })
);

export default router;
