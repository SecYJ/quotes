# 项目结构

```
lines/
├── client/   前端 SPA
├── server/   后端 Worker（负责 /api/*，同时提供 client 的静态文件）
└── docs/     项目文件
```

根目录另有 `package.json`（一键启动前后端等 scripts）与 `pnpm-workspace.yaml`（定义 `client`、`server` 两个 workspace）。

## client/

| 路径 | 说明 |
| --- | --- |
| `client/src/` | 前端源码，重要的子目录如下 |
| `client/src/routes/` | 页面路由，TanStack Router 依文件自动产生路由（`routeTree.gen.ts`） |
| `client/src/components/` | 自己写的组件，例如名句表单 `QuoteForm`、列表 `QuoteList`、筛选侧栏、`ThemeProvider` |
| `client/src/components/ui/` | shadcn/ui 组件（Base UI 版），由 `shadcn add` 产生，不手改 |
| `client/src/lib/` | 共用模块：类型、TanStack Query hooks（`queries.ts`，组件只透过它拿资料）、表单 schema（`quote-form.ts`）、`cn`（`utils.ts`）、呼叫 API 的 Hono RPC client |
| `client/src/mock/` | 假数据与内存中的假 API，UI 阶段使用；接上真 API 后移除 |
| `client/dist/` | `vite build` 的输出，由 Worker 当成静态文件提供。自动产生，不进版本控制 |
| `client/.tanstack/` | TanStack Router 插件的暂存。自动产生，不进版本控制 |
| `client/vite.config.ts` | Vite 设定：插件、`@/` alias（指向 `src/`），以及开发时把 `/api` proxy 到 wrangler dev |
| `client/components.json` | shadcn 设定：风格（`base-nova`）、底色（stone）、组件放置路径 |
| `client/index.html` | 入口 HTML，含在 React 载入前套用深色模式的脚本 |

## server/

| 路径 | 说明 |
| --- | --- |
| `server/src/` | 后端源码：Hono 应用入口 `index.ts`，定义 `/api/*` 路由并 export `AppType` 给 client 使用。之后的数据库 schema 也会放在这里 |
| `server/.wrangler/` | `wrangler dev` 的本地状态，包括本地 D1 资料。自动产生，不进版本控制 |
| `server/dist/` | TypeScript 产生的类型声明（供 client 读取 `AppType`）。自动产生，不进版本控制 |
| `server/wrangler.jsonc` | Worker 设定：入口、static assets（指向 `../client/dist`、SPA fallback）与 bindings |
| `server/worker-configuration.d.ts` | 由 `wrangler types` 依 `wrangler.jsonc` 产生的 `Env` 类型，修改 bindings 后要重新产生 |

## docs/

需求（`init.md`）、概览、指令、coding 规则、视觉设计（`design.md`）与结构说明，索引见根目录 [AGENTS.md](../AGENTS.md)。

| 路径 | 说明 |
| --- | --- |
| `docs/features/YYYY-MM-DD/<feature>/` | 每个 feature 的 `specs.md`（要做什么）、`plans.md`（怎么做）、`tasks.md`（进度清单） |
