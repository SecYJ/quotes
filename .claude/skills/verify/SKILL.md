---
name: verify
description: 验证拾句（Astro 静态网站，名句阅览页）：先跑 Playwright E2E 测试（pnpm test:e2e，用测试资料测筛选、搜索、上一页、分享网址、复制、CSP），再用真实资料 build 并在手机/平板/桌机/带鱼屏截图。改完 src/ 之后、回报完成之前用它证明页面真的能用；也用来重现 UI bug。
---

# verify：驱动拾句并留下证据

拾句只有一个静态页面 `/`。所有名句在 build 时就进了 HTML，筛选、搜索与网址同步由 `src/scripts/issue.ts` 在浏览器里做。验证的对象是 **build 出来的正式版**，不是 dev server。

## 1. E2E 测试（行为）

```sh
pnpm test:e2e
```

`playwright.config.ts` 会用 `tests/e2e/fixtures/sources` 的测试资料另外 build 到 `dist-e2e/`，在 port 4391 跑 `astro preview`，测完自己关掉。每个测试的 ID（A-01…）对应 `.scratch/e2e-tests/spec.md` 的案例。失败时看 `tmp/e2e/report/`（`pnpm exec playwright show-report tmp/e2e/report`）与 `tmp/e2e/results/` 里的 trace。

改到测试没涵盖的行为，先在 spec 加案例，再在 `tests/e2e/` 加测试。

## 2. 截图（外观，用真实资料）

### Launch

在 repo 根目录：

```sh
pnpm build                 # 资料不符合规则会在这里失败，这本身就是一项检查
pnpm preview --port 4321   # 背景执行；回 200 才继续
```

port 4321 被占用而且不是你启动的，就停下来问使用者，不要 kill。

### Drive

```sh
node .claude/skills/verify/scripts/shots.mjs [http://localhost:4321/]
```

脚本会在 390×844、820×1180、1440×900、3440×1440 各截一张，再截标签筛选、搜索与空状态，每张都检查没有横向捲动，全程收集 `console` error 与 `pageerror`。它不检查行为对不对，那是 E2E 测试的事。

每一项印 `PASS` / `FAIL`，最后印 `ALL PASS` 或 `FAIL（N 项）`，exit code 跟着结果。

要重现一次性的 UI 问题时，在 scratchpad 另写一次性的 Playwright 脚本（`import { chromium } from 'playwright'`，要放在 repo 里面执行才找得到套件，例如 `tmp/`），不要把一次性的脚本放进 skill。

## Evidence

截图在 `tmp/verify/<时间>/`（`tmp/` 已 gitignore）。回报时写出：

- `pnpm test:e2e` 的结果（几个通过、哪些失败与原因）。
- 截图目录的完整路径，以及 `ALL PASS` 或失败的项目与原因。
- 至少看过 `mobile.png`、`desktop.png` 与和这次改动有关的那张，说出看到了什么。

## Cleanup

停掉自己启动的 `pnpm preview`（用启动时的 task / pid，不要用 process 名称去杀 node）。
