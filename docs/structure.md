# 项目结构

单一 Astro 项目，build 出纯静态网站（`dist/`）。

```
src/
  content/sources/     资料：一个出处一个 YAML 档，档名 = 出处 id
  content.config.ts    content collection 与 zod schema（单一档案内的规则）
  lib/quotes.ts        loadQuotes()：读资料、检查跨档案规则、摊平成名句并按 added 排序
  lib/labels.ts        出处类型的中文名、出处显示（书名号）、日期格式
  components/          QuoteItem.astro（一句名句）
  pages/index.astro    阅览页（唯一的页面）
  scripts/issue.ts     浏览器里的筛选、搜索、网址同步与头条/侧栏/下方分配
  scripts/copy.ts      名句上的复制图标：把内容写进剪贴板
  styles/global.css    颜色 token 与所有样式（见 docs/design.md）
astro.config.mjs       Astro 设定
tsconfig.json          继承 astro/tsconfigs/strict，`@/*` → `src/*`
pnpm-workspace.yaml    pnpm 设定（minimumReleaseAge 例外、@emnapi/runtime override）
.oxlintrc.json         lint 设定（含「只用 @/ import」规则）
.oxfmtrc.json          格式设定
PRODUCT.md             Impeccable 用的产品描述
.impeccable/           Impeccable 的 surface brief 与 design.json（mocks/、review/ 是本机草稿，已 gitignore）
.claude/skills/verify  用 Playwright 驱动网站、留下截图的 verify skill
.scratch/              新 feature 的 spec 与 ticket
tmp/                   verify 的截图与暂存（gitignore）
```
