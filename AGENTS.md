# AGENTS.md

个人名句记录 App：pnpm monorepo，`client`（Vite + React SPA）+ `server`（Hono on Cloudflare Workers + D1），同一个 Worker 提供前端与 `/api/*`。

## 文件索引

| 文件 | 内容 |
| --- | --- |
| [docs/init.md](docs/init.md) | 原始需求、技术栈、数据结构、功能范围与分阶段工作方式（以此为准） |
| [docs/overview.md](docs/overview.md) | App 概览：做什么、使用情境、记录内容、第一版功能（不涉及技术） |
| [docs/commands.md](docs/commands.md) | 常用指令：开发、build、typecheck、Wrangler、部署 |
| [docs/structure.md](docs/structure.md) | 项目结构：client / server 内第一层的重要目录与设定档 |
| [docs/coding-style.md](docs/coding-style.md) | Coding 规则（写 code 前必读）：函数写法等 |

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
- 写 code 遵守 docs/coding-style.md。
- 新增或修改指令、目录时，同步更新 docs/commands.md 与 docs/structure.md。
