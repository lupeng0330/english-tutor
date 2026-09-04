// Prisma 客户端单例。
// 注意：SCF 单实例单并发，PG 连接串建议带 connection_limit=1（Supabase 用 pooler:6543 + pgbouncer=true），
// 避免多实例冷启动把免费档连接数打满。
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({ log: ['warn', 'error'] });
