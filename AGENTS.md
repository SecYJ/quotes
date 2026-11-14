# AGENTS.md

个人名句记录网站：Astro 静态网站，资料是 `src/content/sources/` 里的 YAML 档（一个出处一个档），部署在 Cloudflare Pages。没有资料库、API 或登入。

## 文件索引

| 文件 | 内容 |
| --- | --- |
| [docs/init.md](docs/init.md) | 需求、技术栈、数据结构与资料规则、功能范围与分阶段工作方式（以此为准） |
| [docs/overview.md](docs/overview.md) | 网站概览：做什么、使用情境、记录内容、功能（不涉及技术） |
| [docs/commands.md](docs/commands.md) | 常用指令：开发、build、typecheck、新增名句、部署 |
| [docs/structure.md](docs/structure.md) | 项目结构：src/ 里的目录与设定档 |
| [docs/coding-style.md](docs/coding-style.md) | Coding 规则（写 code 前必读）：函数写法、类型、Astro 与资料规则、样式、格式与 lint |
| [docs/verification.md](docs/verification.md) | 验证规则（完成修改后必做）：fmt / lint / typecheck / build，再用 Playwright 跑一轮 |
| [docs/design.md](docs/design.md) | 视觉设计（晚报副刊）：颜色 token、字体、版面、元件与刻意避免的写法 |
| [PRODUCT.md](PRODUCT.md) | Impeccable 用的产品描述：使用者、目的、限制 |
| [GLOSSARY.md](GLOSSARY.md) | 领域用语（名句、出处、标签、阅览页、站长…）：写 code 与文件时用这里的词 |
| [.scratch/](.scratch/) | 新 feature 的 spec（`spec.md`）与 ticket（`issues/<NN>-<slug>.md`），一个 feature 一个资料夹 |
| [docs/agents/](docs/agents/) | Skills 用的 repo 设定：issue tracker、triage labels、domain docs |

## 结构

```
src/      Astro 网站：资料、页面、浏览器 script、样式 → docs/structure.md
docs/     上述所有文件
.impeccable/  Impeccable 的设计设定与草稿
.scratch/ 新 feature 的 spec 与 ticket
```

## 工作守则
- 分阶段进行，每阶段完成后停下来说明并等待确认（见 docs/init.md）。
- 不加 docs/init.md 未列出的功能。
- 写 Astro / Cloudflare Pages 设定前先查最新文档，不凭记忆。
- 写 code 遵守 docs/coding-style.md；改 UI 外观前先看 docs/design.md（设计工作用 Impeccable skill）。
- 完成修改后依 docs/verification.md 验证：先跑 `pnpm fmt`、`pnpm lint`、`pnpm typecheck`、`pnpm build`、`pnpm knip`，再用 verify skill 测一轮。
- 新增或修改指令、目录时，同步更新 docs/commands.md 与 docs/structure.md。

## Agent skills

### Issue tracker

Spec 与 ticket 用本地 markdown，放在 `.scratch/<feature>/`（`spec.md` + `issues/<NN>-<slug>.md`）。See `docs/agents/issue-tracker.md`.

### Triage labels

使用预设的五个 label，写在 issue 档案顶端的 `Status:`。See `docs/agents/triage-labels.md`.

### Domain docs

Single-context：根目录的 `GLOSSARY.md` + `docs/adr/`。See `docs/agents/domain.md`.
