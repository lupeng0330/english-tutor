// 强制重置/创建默认管理员账号，确保可登录。
// 运行：ts-node --transpile-only scripts/reset-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME || 'admin';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123456';
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { username } });
  if (!existing) {
    await prisma.user.create({
      data: {
        username,
        displayName: '超级管理员',
        role: 'admin',
        status: 'active',
        passwordHash,
      },
    });
    console.log(`[reset-admin] created admin: ${username}`);
  } else {
    await prisma.user.update({
      where: { username },
      data: { passwordHash, status: 'active', role: 'admin', displayName: existing.displayName || '超级管理员' },
    });
    console.log(`[reset-admin] updated admin: ${username}`);
  }
  console.log(`[reset-admin] password is now: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
