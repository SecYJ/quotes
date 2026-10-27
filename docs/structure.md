# 项目结构

```
lines/
├── client/   前端 SPA
├── server/   后端 Worker（负责 /api/*，同时提供 client 的静态文件）
└── docs/     项目文件
```

根目录另有 `package.json`（一键启动前后端、lint、格式化等 scripts）、`pnpm-workspace.yaml`（定义 `client`、`server` 两个 workspace），以及整个 repo 共用的 `.oxlintrc.json`（oxlint）与 `.oxfmtrc.json`（oxfmt）。`.claude/skills/` 放这个项目用的 Claude Code skills（目前有 `tanstack-query-best-practices`）。

## client/

| 路径 | 说明 |
| --- | --- |
| `client/src/` | 前端源码，重要的子目录如下 |
| `client/src/routes/` | 页面路由，TanStack Router 依文件自动产生路由（`routeTree.gen.ts`） |
| `client/src/components/` | 自己写的组件，例如名句表单 `QuoteForm`、列表 `QuoteList`、筛选侧栏、`ThemeProvider`、`QueryBoundary`（Suspense ＋ error boundary） |
| `client/src/components/ui/` | shadcn/ui 组件（Base UI 版），由 `shadcn add` 产生，不手改 |
| `client/src/lib/` | 共用模块：类型、TanStack Query hooks（`queries.ts`，组件只透过它拿资料）、表单 schema（`quote-form.ts`）、`cn`（`utils.ts`）、呼叫 API 的 Hono RPC client |
| `client/src/mock/` | 假数据与内存中的假 API，UI 阶段使用（含测试错误画面的 `lines-mock-fail` 开关）；接上真 API 后移除 |
| `client/dist/` | `vite build` 的输出，由 Worker 当成静态文件提供。自动产生，不进版本控制 |
| `client/.tanstack/` | TanStack Router 插件的暂存。自动产生，不进版本控制 |
| `client/vite.config.ts` | Vite 设定：插件，以及开发时把 `/api` proxy 到 wrangler dev |
| `client/components.json` | shadcn 设定：风格（`base-nova`）、底色（stone）、组件放置路径（`@/` aliases 经由 `client/tsconfig.json` 的 `paths` 解析；code 里也一律用 `@/` import） |
| `client/index.html` | 入口 HTML，含在 React 载入前套用深色模式的脚本 |

## server/

| 路径 | 说明 |
| --- | --- |
| `server/src/` | 后端源码：Hono 应用入口 `index.ts`，定义 `/api/*` 路由并 export `AppType` 给 client 使用 |
| `server/src/db/` | `schema.ts`（四张表的 Drizzle 定义）与 `index.ts`（`createDb(env.DB)`） |
| `server/drizzle/` | drizzle-kit 产生的 migration SQL 与快照（`meta/`），进版本控制；`wrangler.jsonc` 的 `migrations_dir` 指向这里 |
| `server/drizzle.config.ts` | drizzle-kit 设定：dialect、schema 路径、输出目录、`casing` |
| `server/.wrangler/` | `wrangler dev` 的本地状态，包括本地 D1 资料。自动产生，不进版本控制 |
| `server/dist/` | TypeScript 产生的类型声明（供 client 读取 `AppType`）。自动产生，不进版本控制 |
| `server/wrangler.jsonc` | Worker 设定：入口、static assets（指向 `../client/dist`、SPA fallback）与 bindings（D1：`env.DB`） |
| `server/package.json` | 除了依赖与 scripts，`imports` 定义 server 内的 `#/` 绝对路径（对应 `server/src/*.ts`） |
| `server/worker-configuration.d.ts` | 由 `wrangler types` 依 `wrangler.jsonc` 产生的 `Env` 类型，修改 bindings 后要重新产生 |

## docs/

需求（`init.md`）、概览、指令、coding 规则、视觉设计（`design.md`）、验证规则（`verification.md`）与结构说明，索引见根目录 [AGENTS.md](../AGENTS.md)。

| 路径 | 说明 |
| --- | --- |
| `docs/features/YYYY-MM-DD/<feature>/` | 每个 feature 的 `specs.md`（要做什么）、`plans.md`（怎么做）、`tasks.md`（进度清单） |
