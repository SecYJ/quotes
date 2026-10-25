# AGENTS.md

个人名句记录 App：pnpm monorepo，`client`（Vite + React SPA）+ `server`（Hono on Cloudflare Workers + D1），同一个 Worker 提供前端与 `/api/*`。

## 文件索引

| 文件 | 内容 |
| --- | --- |
| [docs/init.md](docs/init.md) | 原始需求、技术栈、数据结构、功能范围与分阶段工作方式（以此为准） |
| [docs/overview.md](docs/overview.md) | App 概览：做什么、使用情境、记录内容、第一版功能（不涉及技术） |
| [docs/commands.md](docs/commands.md) | 常用指令：开发、build、typecheck、Wrangler、部署 |
| [docs/structure.md](docs/structure.md) | 项目结构：client / server 内第一层的重要目录与设定档 |
| [docs/coding-style.md](docs/coding-style.md) | Coding 规则（写 code 前必读）：函数写法、UI 组件（shadcn）、颜色 token、表单（RHF + zod）、读写资料（TanStack Query）、格式与 lint |
| [docs/verification.md](docs/verification.md) | 验证规则（完成修改后必做）：fmt / lint / typecheck 快速检查，再用 Playwright 跑一轮浏览器测试 |
| [docs/design.md](docs/design.md) | 视觉设计：颜色、字体、记号（书签、着重号）与刻意避免的写法 |
| [docs/features/](docs/features/) | 各 feature 的 specs / plans / tasks，依日期分资料夹 |

## 结构

```
client/   前端 SPA（Vite + React + TanStack + Tailwind）→ docs/structure.md
server/   Hono Worker、wrangler.jsonc、之后的 Drizzle + D1 → docs/structure.md
docs/     上述所有文件
```

## 工作守则
- 分阶段进行，每阶段完成后停下来说明并等待确认（见 docs/init.md）。
- 不加 docs/init.md 未列出的功能。
- 写 Wrangler / D1 / Drizzle 设定前先查最新文档，不凭记忆。
- 写 code 遵守 docs/coding-style.md；改 UI 外观前先看 docs/design.md。
- 完成修改后依 docs/verification.md 验证：先跑 `pnpm fmt`、`pnpm lint`、`pnpm typecheck`，再用 Playwright 测一轮。
- 新增或修改指令、目录时，同步更新 docs/commands.md 与 docs/structure.md。
