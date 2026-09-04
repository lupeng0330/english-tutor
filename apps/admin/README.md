# 乐学英语管理后台

Phase 4 管理端，技术栈为 React 18、TypeScript 5、Vite 5、Tailwind CSS 3.4。

## 启动

```bash
cd apps/admin
npm install
npm run dev
```

开发服务器默认监听所有网卡地址。API 默认地址为 `http://localhost:4000/api`，可创建 `.env.local` 覆盖：

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## 默认管理员

- 用户名：`admin`
- 密码：`admin123456`

请先启动 `apps/api` 并完成数据库初始化与种子数据写入。

## 生产构建

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`。
