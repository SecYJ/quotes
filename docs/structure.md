# 项目结构

```
lines/
├── client/   前端 SPA
├── server/   后端 Worker（负责 /api/*，同时提供 client 的静态文件）
├── docs/     项目文件
└── .scratch/ 新 feature 的 spec 与 ticket（进版本控制）
```

根目录的 `GLOSSARY.md` 是领域用语表；架构决定（ADR）放 `docs/adr/`，有需要时才建立。

根目录另有 `package.json`（一键启动前后端、lint、格式化等 scripts）、`pnpm-workspace.yaml`（定义 `client`、`server` 两个 workspace），以及整个 repo 共用的 `.oxlintrc.json`（oxlint）与 `.oxfmtrc.json`（oxfmt）。`.claude/skills/` 放这个项目用的 Claude Code skills（目前有 `tanstack-query-best-practices`）。

## client/

| 路径 | 说明 |
| --- | --- |
| `client/src/` | 前端源码，重要的子目录如下 |
| `client/src/routes/` | 页面路由，TanStack Router 依文件自动产生路由（`routeTree.gen.ts`） |
| `client/src/components/` | 自己写的组件，例如名句表单 `QuoteForm`、列表 `QuoteList`、筛选侧栏、`ThemeProvider`、`QueryBoundary`（Suspense ＋ error boundary） |
| `client/src/components/ui/` | shadcn/ui 组件（Base UI 版），由 `shadcn add` 产生，不手改 |
| `client/src/lib/` | 共用模块：类型、TanStack Query hooks（`queries.ts`，组件只透过它拿资料）、表单 schema（`quote-form.ts`）、`cn`（`utils.ts`）、Hono RPC client 与把错误转成中文讯息的 `request()`（`api.ts`） |
| `client/dist/` | `vite build` 的输出，由 Worker 当成静态文件提供。自动产生，不进版本控制 |
| `client/.tanstack/` | TanStack Router 插件的暂存。自动产生，不进版本控制 |
| `client/vite.config.ts` | Vite 设定：插件，以及开发时把 `/api` proxy 到 wrangler dev |
| `client/components.json` | shadcn 设定：风格（`base-nova`）、底色（stone）、组件放置路径（`@/` aliases 经由 `client/tsconfig.json` 的 `paths` 解析；code 里也一律用 `@/` import） |
| `client/index.html` | 入口 HTML，含在 React 载入前套用深色模式的脚本 |

## server/

| 路径 | 说明 |
| --- | --- |
| `server/src/` | 后端源码：Hono 应用入口 `index.ts`（组合路由、错误处理，export `AppType` 给 client 使用）、zod 验证 `validation.ts`、补充 `Env` 类型的 `env.d.ts` |
| `server/src/routes/` | `public.ts`（公开的 GET）与 `admin.ts`（`/api/admin/*` 写入 API） |
| `server/src/middleware/` | `access.ts`：验证 Cloudflare Access 的 JWT，保护写入 API |
| `server/src/db/` | `schema.ts`（四张表与 relations）、`index.ts`（`createDb(env.DB)`）、`quotes.ts`（所有查询与写入） |
| `server/drizzle/` | drizzle-kit 产生的 migration SQL 与快照（`meta/`），进版本控制；`wrangler.jsonc` 的 `migrations_dir` 指向这里 |
| `server/seed.sql` | 本地开发用的范例资料，由 `db:seed:local` 写入本地 D1（会先清空）；不要对远端执行 |
| `server/drizzle.config.ts` | drizzle-kit 设定：dialect、schema 路径、输出目录、`casing` |
| `server/.wrangler/` | `wrangler dev` 的本地状态，包括本地 D1 资料。自动产生，不进版本控制 |
| `server/dist/` | TypeScript 产生的类型声明（供 client 读取 `AppType`）。自动产生，不进版本控制 |
| `server/wrangler.jsonc` | Worker 设定：入口、static assets（指向 `../client/dist`、SPA fallback）、bindings（D1：`env.DB`）与 vars（Access 的 team domain、AUD） |
| `server/package.json` | 除了依赖与 scripts，`imports` 定义 server 内的 `#/` 绝对路径（对应 `server/src/*.ts`） |
| `server/worker-configuration.d.ts` | 由 `wrangler types` 依 `wrangler.jsonc` 产生的 `Env` 类型，修改 bindings 后要重新产生 |

## docs/

需求（`init.md`）、概览、指令、coding 规则、视觉设计（`design.md`）、验证规则（`verification.md`）与结构说明，索引见根目录 [AGENTS.md](../AGENTS.md)。

| 路径 | 说明 |
| --- | --- |
| `docs/agents/` | Skills 用的 repo 设定：`issue-tracker.md`（本地 markdown，放 `.scratch/`）、`triage-labels.md`、`domain.md` |
| `docs/features/YYYY-MM-DD/<feature>/` | 改用 `.scratch/` 之前的 feature 文件：`specs.md`、`plans.md`、`tasks.md`。只当历史记录，不再新增 |

## .scratch/

| 路径 | 说明 |
| --- | --- |
| `.scratch/<feature>/spec.md` | 这个 feature 要做什么（`/to-spec` 产生） |
| `.scratch/<feature>/issues/<NN>-<slug>.md` | 一个 ticket 一个档，依相依顺序编号；顶端有 `Status:` 与 `Blocked by:`（`/to-tickets` 产生） |
