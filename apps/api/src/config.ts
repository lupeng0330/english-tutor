// 集中读取环境变量，提供带默认值的配置对象。
import dotenv from 'dotenv';

dotenv.config();

// 数据库：provider 由 DATABASE_URL scheme 驱动（file:=sqlite / postgres:=PG）。
// 生产（云函数）通过平台环境变量注入 Supabase PG 连接串（pooler 6543 + pgbouncer），
// 本地开发默认 file:./dev.db。
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPg = /^postgres(?:ql)?:/i.test(databaseUrl);

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  db: {
    url: databaseUrl,
    provider: isPg ? 'postgresql' : 'sqlite',
    isPg,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },
  seed: {
    adminUsername: process.env.SEED_ADMIN_USERNAME || 'admin',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'admin123456',
  },
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8765')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
