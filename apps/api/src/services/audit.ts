// 审计日志写入工具。
import { prisma } from '../db';

export async function writeAudit(
  actorId: string | null,
  action: string,
  target?: string | null,
  detail?: unknown,
  ip?: string | null
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        action,
        target: target || null,
        detail: detail ? JSON.stringify(detail) : null,
        ip: ip || null,
      },
    });
  } catch (e) {
    // 审计失败不应阻断主流程
    console.error('[audit] failed', e);
  }
}
