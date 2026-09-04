# 临时记录 · 错题同步修复 + 后端部署腾讯云 CloudBase（2026-07-10）

> 本文件为开发过程临时记录，供随时（含新开对话）接续。完成部署并稳定后可删除。

---

## 一、主线任务
1. （已完成）修复「错题同步不过来 / 登录转圈」——属 Phase 3 云同步。
2. （进行中）把后端 `apps/api`（Express+Prisma）部署到**腾讯云 CloudBase**，让错题同步对公网用户可用。
   - 前端仍保留 GitHub Pages（用户澄清：不弃用 GitHub，只是后端用国内平台）。

---

## 二、已完成并「真实落盘 + 验证」的修复（错题同步）

| # | 问题 | 修复 | 文件 |
|---|---|---|---|
| 1 | 存量错题不上云、多设备互相覆盖 | `onLogin`/`pullAll` 改为本地↔云端**合并**（错题按题目并集、`wrongCount` 取大；统计数值取大/对象并集/日期取新），并回推云端 | `js/sync-client.js` |
| 2 | 登录后一直转圈 | `doLogin` 登录成功**立即更新 UI**，云同步后台化 + 10s 超时兜底 | `app.js`（约 526-544 行） |
| 3 | 同秒重复登录后端 500 | `signRefreshToken` 加唯一 `jti`（randomUUID） | `apps/api/src/utils/jwt.ts` |
| 4 | 线上误连本机 127.0.0.1 会转圈 | `api-client.js` 重写：`_detectApiBase()` 按环境判断（本地/局域网连 127.0.0.1:4000，其他留空）+ 请求 8s AbortController 超时 + 后端未配置快速失败 + 导出 `isBackendAvailable()` | `js/api-client.js` |
| 5 | 线上登录入口误导 | `_renderCloudAuthHTML` 后端不可用时显示「☁️ 云同步（即将上线）」降级提示，不显示登录框 | `app.js`（约 477-485 行） |
| — | 本地 `dev.db` 会误入仓 | `.gitignore` 修正：`apps/api/prisma/dev.db` + `**/*.db` + `**/*.db-journal` | `.gitignore` |

- 真实浏览器（Playwright）端到端验证通过：登录 68~71ms、`onLogin OK`、存量错题跨设备同步 count=2、无 PAGEERR。
- ⚠️ 教训：本会话多次出现「replace 回执显示成功但实际没落盘」，务必**读回校验**；`api-client.js` 最终用 `write_to_file` 整文件重写才落盘。
- ❗ 这批修复**尚未提交/上线**（等用户双端验收通过后按铁律 dev-push）。
  - 验收链接（需服务在跑 + 带时间戳）：`http://localhost:8765/index.html?v=<epoch>`、`.../mobile.html?v=<epoch>`
  - 本地后端：`apps/api` 用 `ts-node src/server.ts` 起在 4000；静态服务 8765。

---

## 三、部署准备（已落盘，不依赖授权）

| 产物 | 状态 | 说明 |
|---|---|---|
| `apps/api/Dockerfile` | ✅ | Node20-slim + openssl + `npm install` + `prisma generate` + `npm run build`；CMD: `prisma db push --skip-generate && node dist/server.js`；EXPOSE 3000 |
| `apps/api/.dockerignore` | ✅ | 排除 node_modules/dist/dev.db/.env |
| 后端环境变量 | ✅ | `config.ts` 已支持 `PORT`、`CORS_ORIGINS`（部署时把线上前端域名加进 CORS_ORIGINS） |
| 前端 API 注入 | ✅ | `api-client.js` 支持 `window.__API_BASE`；部署出后端 URL 后，在前端注入该地址即可让线上前端连云端后端 |

---

## 四、当前阻塞 / 环境问题

1. **CloudBase MCP 工具不可用**：用户已在 IDE 连接 CloudBase MCP，但其 MCP 工具（envQuery、cloudrun 部署等）**未出现在 AI 可调用的工具集**里 → 无法走 MCP 部署。可能需**新开对话**才注入。
2. **曾出现工具通道被阻断**：连接 MCP 后一段时间内，所有工具调用（execute_command/read_file）都返回 “cloud service not connected / MCP connection failed”，`echo` 都失败；后已自行恢复。
3. **本地 tcb CLI 未安装**：`Get-Command tcb` = 不存在。走 CLI 路线需先 `npm i -g @cloudbase/cli`。

---

## 五、部署待决事项（需用户确认）

1. **授权方式**（三选一）：
   - A. IDE「集成」面板连接 CloudBase（最安全，凭证不过对话）
   - B. 本地 `tcb login` 扫码（交互式，必须用户本人操作），之后 AI 用 CLI 部署
   - C. 提供 SecretId/SecretKey（❌不建议明文贴对话）
2. **CloudBase 环境ID（envId）**：需真实值（形如 `xxx-1gxxxxxx`）。用户上一次给的是占位符 `xxxxxx`。
3. **数据库方案**（影响费用）：
   - A. 先用容器内临时 SQLite 跑通链路（最快见效，数据不持久）【推荐先做】→ Prisma 不改
   - B. 腾讯云 PostgreSQL（持久、与计划一致，需开实例、有费用）→ 改 `schema.prisma` provider=postgresql + `url=env("DATABASE_URL")`
   - C. CloudBase MySQL（同生态 Serverless）→ 改 provider=mysql

> 注意：Prisma 当前 `provider="sqlite"`、`url="file:./dev.db"`（`apps/api/prisma/schema.prisma`）。切 PG/MySQL 会影响本地 SQLite 开发流程，需处理「本地 SQLite / 云端 PG」双环境（构建时替换 provider 或本地也用容器 PG）。

---

## 六、下一步（工具恢复后可执行）

1. 走 CLI：`npm i -g @cloudbase/cli` → 用户 `tcb login` 扫码 → `tcb env:list` 确认环境 → 云托管部署 Dockerfile → 拿到公网 URL。
2. 部署成功后：把公网 URL 注入前端 `window.__API_BASE`（线上环境）+ 后端 `CORS_ORIGINS` 加入 `https://lupeng0330.github.io`。
3. 双端验收（错题跨设备同步走公网后端）→ 通过后按铁律更新 `PROJECT_STATUS.md` + `dev-push.ps1` 上线。

---

## 七、环境备注
- Node: `%USERPROFILE%\.workbuddy\binaries\node\versions\22.12.0`（v22.12.0 + npm 10.9.0）。
- 本地起后端：`cd apps/api; ts-node --transpile-only src/server.ts`（端口 4000）。
- 本地静态：`python -m http.server 8765`（项目根）。
- PowerShell 输出常被 CLIXML 包裹/截断，读结果建议 `Out-File` 到临时 txt 再读。
