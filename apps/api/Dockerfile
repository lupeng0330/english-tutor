# 乐学英语 后端 API（CloudBase 云托管 / 通用容器部署）
# 本地阶段：容器内 SQLite（prisma db push 自动建表），跑通链路；
# 生产阶段：切云 PostgreSQL/MySQL 时仅需改 schema provider + DATABASE_URL 环境变量。
FROM node:20-slim

# Prisma 引擎需要 openssl
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先装依赖（利用镜像层缓存）
COPY package.json ./
# 若存在 package-lock.json 则一并复制；npm install 容忍缺失
COPY package*.json ./
# 国内构建可换镜像源；Prisma 引擎走 npmmirror
ENV PRISMA_ENGINES_MIRROR=https://npmmirror.com/mirrors/prisma
RUN npm install --registry=https://registry.npmmirror.com

# 复制源码与 Prisma schema
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# 生成 Prisma Client + 编译 TS → dist/
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 启动：先对齐数据库结构（SQLite 自动建库建表），再起服务
CMD npx prisma db push --skip-generate && node dist/server.js
