# 常用指令

都在 repo 根目录执行。

| 指令 | 做什么 |
| --- | --- |
| `pnpm install` | 安装套件 |
| `pnpm dev` | 开发模式（http://localhost:4321），改资料档或程式会自动更新 |
| `pnpm build` | build 到 `dist/`；资料不符合规则时会在这里失败 |
| `pnpm preview` | 用 build 好的 `dist/` 跑一个本地伺服器，看正式版的样子 |
| `pnpm typecheck` | `astro check`：TypeScript 与 `.astro` 档的型别检查 |
| `pnpm lint` / `pnpm lint:fix` | oxlint |
| `pnpm fmt` / `pnpm fmt:check` | oxfmt 格式化 / 只检查 |
| `node .claude/skills/verify/scripts/shots.mjs` | 用 Playwright 截图各种画面大小与筛选状态（需要先 `pnpm build && pnpm preview`），见 docs/verification.md |

## 新增一句名句

1. 出处已经有档案：在 `src/content/sources/<出处>.yaml` 的 `quotes:` 下加一项。
2. 新的出处：新增一个 `src/content/sources/<英文-id>.yaml`，写 `type`、`title`、`quotes`。
3. `pnpm build` 确认通过检查，commit、push；Cloudflare Pages 会自动发布。

## 部署

push 到 GitHub 的 `main` 分支，Cloudflare Pages 自动执行 `pnpm build` 并发布 `dist/`。第一次的设定步骤见阶段 3。
