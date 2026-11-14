---
name: verify
description: Build 并启动拾句（Astro 静态网站，名句阅览页），用 Playwright 像使用者一样操作：筛选、搜索、上一页、分享网址，在手机/平板/桌机/带鱼屏各截一张图。改完 src/ 之后、回报完成之前用它证明页面真的能用；也用来重现 UI bug。
---

# verify：驱动拾句并留下证据

拾句只有一个静态页面 `/`。所有名句在 build 时就进了 HTML，筛选、搜索与网址同步由 `src/scripts/issue.ts` 在浏览器里做。验证的对象是 **build 出来的正式版**，不是 dev server。

## Launch

在 repo 根目录：

```sh
pnpm build                 # 资料不符合规则会在这里失败，这本身就是一项检查
pnpm preview --port 4321   # 背景执行；回 200 才继续
```

port 4321 被占用而且不是你启动的，就停下来问使用者，不要 kill。

## Drive

```sh
node .claude/skills/verify/scripts/shots.mjs [http://localhost:4321/]
```

脚本会：

- 在 390×844、820×1180、1440×900、3440×1440 各截一张，检查没有横向捲动。
- 索引里没有出处清单。
- 点一个标签 → 网址带 `tag`、句子变少；再点名句上的出处 → 两个条件一起生效、状态列写出出处名称；按上一页回到只有标签；「清除筛选」全部回来。
- 搜索第一句的说话人（资料里没有说话人时改搜第一句内容的前三个字）→ 有结果、命中的字有 `mark`、网址带 `q`；搜出处名称 → 有结果、出处上有 `mark`；搜不存在的字 → 显示空状态。
- 直接打开带 `?tag=` 的网址 → 筛选直接套用；手机上有标签筛选时「标签」展开，没有时收起。
- 全程收集 `console` error 与 `pageerror`，有任何一个就失败。

每一项印 `PASS` / `FAIL`，最后印 `ALL PASS` 或 `FAIL（N 项）`，exit code 跟着结果。

改到脚本没涵盖的行为时，在 scratchpad 另写一次性的 Playwright 脚本（`import { chromium } from 'playwright'`，要放在 repo 里面执行才找得到套件，例如 `tmp/`），不要把一次性的脚本放进 skill。

## Evidence

截图在 `tmp/verify/<时间>/`（`tmp/` 已 gitignore）。回报时写出：

- 目录的完整路径，以及 `ALL PASS` 或失败的项目与原因。
- 至少看过 `mobile.png`、`desktop.png` 与和这次改动有关的那张，说出看到了什么。

## Cleanup

停掉自己启动的 `pnpm preview`（用启动时的 task / pid，不要用 process 名称去杀 node）。
