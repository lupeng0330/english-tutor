// Express API 入口：中间件 → 路由 → 错误处理。
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { prisma } from './db';
import { errorHandler } from './middleware/error';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import membershipRouter from './routes/membership';
import syncRouter from './routes/sync';
import adminRouter from './routes/admin';
import aiRouter from './routes/ai';
import paymentRouter from './routes/payment';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        // 允许无 origin（如 curl/移动壳）、白名单来源，以及本地所有 localhost 来源（开发期多端口预览）
        if (!origin) return cb(null, true);
        if (config.corsOrigins.includes(origin)) return cb(null, true);
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));

  // 兼容 CloudBase HTTP 路由「路径透传」：网关把 /yxyy-api 前缀原样传给函数，剥掉再进路由
  app.use((req, _res, next) => {
    if (req.url === '/yxyy-api') req.url = '/';
    else if (req.url.startsWith('/yxyy-api/')) req.url = req.url.slice('/yxyy-api'.length);
    next();
  });

  // 健康检查：附数据库连通性探测（SELECT 1），便于发现 PG 连接问题
  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRawUnsafe('SELECT 1');
      res.json({ ok: true, db: 'up', provider: config.db.provider, ts: Date.now() });
    } catch (e) {
      res.status(503).json({ ok: false, db: 'down', provider: config.db.provider, ts: Date.now() });
    }
  });

  // 路由
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/admin', adminRouter);
  // 注意顺序：membershipRouter 挂在 /api 且含 router.use(authRequired)，会拦截所有 /api/*；
  // 公共/独立鉴权的路由必须挂在它前面。
  app.use('/api/payment', paymentRouter); // 支付渠道骨架：/channels 清单 + /callback/:channel 桩（501）
  app.use('/api', membershipRouter); // /api/me/entitlements, /api/plans, /api/admin/*
  app.use('/api', syncRouter); // /api/sync, /api/sync/:key
  app.use('/api/ai', aiRouter); // 服务端 AI 代理（对话/转写/作文评分，密钥留服务端）

  // 错误处理（最后）
  app.use(errorHandler);

  return app;
}

// 直接运行时启动服务
if (require.main === module) {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[api] listening on http://127.0.0.1:${config.port}`);
  });
}
