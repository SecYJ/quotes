# 常用指令

所有指令都在**项目根目录**执行。套件管理器为 pnpm（版本见根目录 `package.json` 的 `packageManager`），Node.js 需 `>=22.12.0`。

## 根目录（monorepo）

| 指令 | 作用 |
| --- | --- |
| `pnpm install` | 安装所有 workspace 的依赖 |
| `pnpm dev` | 同时启动 client（Vite）和 server（`wrangler dev`） |
| `pnpm build` | build client，输出到 `client/dist`（Worker 的 static assets 目录） |
| `pnpm typecheck` | 对所有 workspace 跑 TypeScript 类型检查 |

本地开发时：
- client：Vite dev server（默认 http://localhost:5173），`/api` 会 proxy 到 wrangler dev。
- server：wrangler dev 跑在 http://localhost:8787，使用本地 D1（资料存在 `server/.wrangler`）。
- 验证前后端连通：打开 http://localhost:5173/api/health 应回传 `{ "ok": true, ... }`。

## 只针对单一 package

用 `pnpm --filter <package> <script>`：

| 指令 | 作用 |
| --- | --- |
| `pnpm --filter client dev` | 只启动 Vite dev server |
| `pnpm --filter client build` | 只 build client（`tsc -b && vite build`） |
| `pnpm --filter client preview` | 预览 client 的 build 结果 |
| `pnpm --filter server dev` | 只启动 `wrangler dev`（会先确保 `client/dist` 存在，否则 Wrangler 会因 assets 目录不存在而报错） |
| `pnpm --filter server cf-typegen` | 依 `wrangler.jsonc` 重新产生 `server/worker-configuration.d.ts`（`Env` 类型）。**修改 bindings（例如新增 D1）后要跑** |
| `pnpm --filter server deploy` | 部署到 Cloudflare Workers（部署前先跑 `pnpm build`） |

## 直接执行 Wrangler

```sh
pnpm --filter server exec wrangler <command>
```

例如 `pnpm --filter server exec wrangler login`、`pnpm --filter server exec wrangler whoami`。

## 新增依赖

```sh
pnpm --filter client add <pkg>      # 加到 client
pnpm --filter server add <pkg>      # 加到 server
pnpm --filter server add -D <pkg>   # 加到 server 的 devDependencies
```

> 数据库（Drizzle / D1 migration）相关指令会在阶段 2 加入后补充到这里。
