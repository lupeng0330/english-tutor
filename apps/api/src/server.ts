// Express API 入口：中间件 → 路由 → 错误处理。
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/error';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import membershipRouter from './routes/membership';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        // 允许无 origin（如 curl/移动壳）与白名单来源
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));

  // 健康检查
  app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

  // 路由
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api', membershipRouter); // /api/me/entitlements, /api/plans, /api/admin/*

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
