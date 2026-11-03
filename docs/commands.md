# 常用指令

所有指令都在**项目根目录**执行。套件管理器为 pnpm（版本见根目录 `package.json` 的 `packageManager`），Node.js 需 `>=22.12.0`。

## 根目录（monorepo）

| 指令 | 作用 |
| --- | --- |
| `pnpm install` | 安装所有 workspace 的依赖 |
| `pnpm dev` | 同时启动 client（Vite）和 server（`wrangler dev`） |
| `pnpm build` | build client，输出到 `client/dist`（Worker 的 static assets 目录） |
| `pnpm typecheck` | 对所有 workspace 跑 TypeScript 类型检查 |
| `pnpm lint` | 用 oxlint 检查整个 repo（设定：`.oxlintrc.json`） |
| `pnpm lint:fix` | oxlint 自动修正能修的问题 |
| `pnpm fmt` | 用 oxfmt 格式化整个 repo（设定：`.oxfmtrc.json`，4 格缩进、每行 100 字元；不处理 markdown） |
| `pnpm fmt:check` | 只检查格式，不改档案 |

本地开发时：
- client：Vite dev server（默认 http://localhost:5173），`/api` 会 proxy 到 wrangler dev。
- server：wrangler dev 跑在 http://localhost:8787，使用本地 D1（资料存在 `server/.wrangler`）。
- 验证前后端连通：打开 http://localhost:5173/api/health 应回传 `{ "ok": true, ... }`。
- 本地没有 Cloudflare Access：dev script 用 `--var ACCESS_DEV_BYPASS:true` 让 `/api/admin/*` 跳过 JWT 验证。直接跑 `wrangler dev`（不经过 dev script）时写入 API 会回 403。

## 只针对单一 package

用 `pnpm --filter <package> <script>`：

| 指令 | 作用 |
| --- | --- |
| `pnpm --filter client dev` | 只启动 Vite dev server |
| `pnpm --filter client build` | 只 build client（`tsc -b && vite build`） |
| `pnpm --filter client preview` | 预览 client 的 build 结果 |
| `pnpm --filter server dev` | 只启动 `wrangler dev`（会先确保 `client/dist` 存在，否则 Wrangler 会因 assets 目录不存在而报错；带 `--var ACCESS_DEV_BYPASS:true`） |
| `pnpm --filter server cf-typegen` | 依 `wrangler.jsonc` 重新产生 `server/worker-configuration.d.ts`（`Env` 类型，`--strict-vars=false` 让 vars 是 `string`）。**修改 bindings 或 vars 后要跑** |
| `pnpm --filter server deploy` | 部署到 Cloudflare Workers（部署前先跑 `pnpm build`） |

## 直接执行 Wrangler

```sh
pnpm --filter server exec wrangler <command>
```

例如 `pnpm --filter server exec wrangler login`、`pnpm --filter server exec wrangler whoami`。

## Git worktree（同时 preview 多个设计）

每个设计在自己的 worktree 与 branch，用不同 port 同时启动 client：

```sh
git worktree add ../lines-<name> -b design/<name>   # 从目前的 branch 开出新的 worktree
pnpm --dir ../lines-<name> install                  # 每个 worktree 第一次使用前要装依赖
pnpm --dir ../lines-<name> --filter client dev --port 5174 --strictPort
git worktree list                                   # 列出所有 worktree
git worktree remove ../lines-<name>                 # 删除 worktree（branch 另外用 git branch -D 删）
```

资料来自 API：每个 worktree 的 client 都把 `/api` proxy 到 `localhost:8787`，所以先在主目录跑 `pnpm --filter server dev`（只跑一个，大家共用同一份本地 D1），各 worktree 只启动 client。

Windows 上删除 worktree 的注意事项：
- 先停掉该 worktree 的 dev server，否则档案被占用删不掉。
- `node_modules` 路径太长时 `git worktree remove` 会失败，改用 PowerShell：`Remove-Item -LiteralPath "\\?\<完整路径>" -Recurse -Force`，再 `git worktree prune`。

## shadcn/ui

在 `client/` 底下执行（`components.json` 在那里）：

```sh
pnpm dlx shadcn@latest add <component>   # 例如 add dialog，产生到 src/components/ui/
pnpm dlx shadcn@latest add <component> --overwrite   # 更新已有的组件
```

文档看 Base UI 版本：https://ui.shadcn.com/docs/components （页面上选 Base UI）。

## 新增依赖

```sh
pnpm --filter client add <pkg>      # 加到 client
pnpm --filter server add <pkg>      # 加到 server
pnpm --filter server add -D <pkg>   # 加到 server 的 devDependencies
```

## 数据库（Drizzle + D1）

| 指令 | 作用 |
| --- | --- |
| `pnpm --filter server db:generate` | 改完 `server/src/db/schema.ts` 后跑：drizzle-kit 比对快照，在 `server/drizzle/` 产生新的 migration SQL（不连数据库） |
| `pnpm --filter server db:migrate:local` | 把还没套用的 migration 套用到本地 D1（`wrangler d1 migrations apply lines --local`） |
| `pnpm --filter server db:seed:local` | **清空**本地 D1 再写入范例资料（`server/seed.sql`）；重复执行结果相同。第一次使用前先跑 `db:migrate:local` |
| `pnpm --filter server exec wrangler d1 execute lines --local --command "<SQL>"` | 对本地 D1 直接执行 SQL，例如 `"SELECT * FROM sources"` |

已套用的 migration 不要修改，要改 schema 就再 `db:generate` 一个新的。
