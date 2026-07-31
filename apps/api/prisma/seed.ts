// 初始化种子数据：管理员账号 + 默认权益点 + 默认套餐（含权益绑定）+ 系统/AI 设置。
// 运行：npm run seed
//
// ⚠️ 数据与逻辑的单一事实源在 `scripts/seed-core.js`（CommonJS，仅依赖生产依赖），
// 目的是让**云函数冷启动**也能直接 `node scripts/seed-core.js` 种数据（ts-node/typescript 不入部署包）。
// 本文件只是保留 `npm run seed` 入口的薄壳，并保持"本地执行会强制重置 admin 默认密码"的既有行为。
import dotenv from 'dotenv';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { runSeed } = require('../scripts/seed-core');

dotenv.config();

runSeed({ resetAdminPassword: true })
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
