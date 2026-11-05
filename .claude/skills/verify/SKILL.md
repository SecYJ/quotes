---
name: verify
description: 启动 Lines（名句记录 App，Vite + React 前端 + Hono/Wrangler/D1 后端）并用 Playwright 像使用者一样操作浏览器，留下截图、ARIA snapshot 与 API 读回的证据。改完 client 或 server 之后、回报完成之前用它证明功能真的能用；也用来重现 UI bug。
---

# verify：驱动 Lines 并留下证据

Lines 唯一的使用介面是浏览器里的单页（`/`）：左栏筛选、中间搜索 + 列表、右栏详细 / 编辑，新增用 dialog。资料来自同一个 dev 环境里的 `/api/*`（Hono on `wrangler dev`，本地 D1）。所有操作都透过一支 helper：

```sh
node .claude/skills/verify/scripts/lines.mjs up       # seed + 启动，等到能用
node .claude/skills/verify/scripts/lines.mjs doctor   # 只读检查：这个 instance 值得驱动吗
node .claude/skills/verify/scripts/lines.mjs drive <journey.mjs> [--name <label>] [--theme light|dark]
node .claude/skills/verify/scripts/lines.mjs down     # 只停掉 up 启动的那组 process
```

都在 repo 根目录执行。`drive` 的第一个参数必须是 journey 路径。

## Launch

`up` 依序做：

1. 检查 5173、8787 有没有被占用。被占用而且不是 `up` 启动的（多半是使用者自己的 `pnpm dev`）就**停下来回报**，不要 kill：问使用者要关掉它，还是直接用那个 instance（那样 `doctor` 会显示「本 helper 启动的：否」，`down` 不会动它）。
2. 没有 `node_modules` 就 `pnpm install`。
3. `pnpm --filter server db:migrate:local` → `pnpm --filter server db:seed:local`：从空的 `server/.wrangler` 也能建好表，并把本地 D1 **清空**成固定的 12 句范例资料（9 个出处、6 个标签）。这会覆盖使用者本地 D1 里的东西；这是 `docs/verification.md` 规定的基准状态。
4. 由一个 detached 的 node supervisor 启动 `pnpm dev`（client Vite :5173 + server `wrangler dev` :8787，带 `ACCESS_DEV_BYPASS`），输出写到 `tmp/verify/dev.log`，pid 写到 `tmp/verify/dev.pid`。
5. 等到 ready：`GET /` 有 `id="root"`、`GET /api/health` 回 `ok: true`、`GET /api/quotes` 回阵列（都经过 Vite proxy）。印出 `READY http://localhost:5173（12 句名句）` 才算能用。120 秒内没 ready 就印出 log 尾巴并自动 `down`。

已经由 `up` 启动过的话，`up` 不会再启动一份，只跑 `doctor`。

**不能同时跑两份**：Vite 把 `/api` 写死 proxy 到 8787，本地 D1 只有一份（`server/.wrangler`）。两个 agent 不要同时驱动同一个 instance 又各自改资料。

## Doctor

```sh
node .claude/skills/verify/scripts/lines.mjs doctor
```

只读，结尾印 `DOCTOR OK` / `DOCTOR FAIL`（exit 0 / 1）。逐项：是不是本 helper 启动的、两个 port、页面与 health、目前名句数、写入 API 的 dev bypass（送空 body 给 `POST /api/admin/quotes`：400 = 通过 access、被 zod 挡下，不会写入；403 = 没有 bypass，所有储存都会失败）、git HEAD 与有没有未 commit 的修改（dev server 跑的是 working tree）。名句数不是 12 会额外提醒：资料被之前的 journey 改过，需要基准状态就 `down` 再 `up`。

任何东西看起来不对（页面空白、储存失败、截图跟预期不符）先跑 doctor，再看 `tmp/verify/dev.log`。

## Drive

Journey 是一个 ES module，default export 一个 async 函数。**一次性的 journey 写在 scratchpad，不放进 repo**（`docs/verification.md`）；`journeys/smoke.mjs` 是唯一进 repo 的范本，改 UI 后可以直接跑它。

```js
export default async function ({ page, expect, shot, step, api }) {
    step('打开首页') // 写进 report.json 与终端
    await page.goto('/') // baseURL 已设成 http://localhost:5173
    await expect(page.getByText('12 句', { exact: true })).toBeVisible()
    await shot('list') // 存 NN-list.png 与 NN-list.aria.txt
    expect((await api('/api/quotes')).length).toBe(12) // GET 读回，验证副作用
}
```

- `page`：Playwright page，viewport 3440×1300（专案只支援带鱼屏 desktop），`--theme` 决定 `prefers-color-scheme`（预设 light）。
- `expect`：`@playwright/test` 的 expect，locator 断言会自动等待；不要用固定 sleep。
- `shot(label)`：截图 + body 的 ARIA snapshot。
- `api(path)`：对 dev server 做 GET，回 JSON（失败回 `null`）。
- 全程收集 `console` error 与 `pageerror`；有任何一个，结果就是 `FAIL (console errors)`。

第一次 `drive` 会把 `@playwright/test@1.63.0` 装到系统 temp 的 `lines-verify-playwright-1.63.0/`（不进 repo），并确保 chromium 已下载。

**稳定的 handle**（都来自 repo 现有的 ARIA 名称与 label，优先用 `getByRole` / `getByLabel`）：

| 东西 | locator |
| --- | --- |
| 搜索框 | `getByRole('searchbox', { name: '搜索' })` |
| row / grid 切换 | `getByRole('button', { name: '列表显示' })`、`'网格显示'`（选中的有 `aria-pressed="true"`） |
| 新增 | `getByRole('button', { name: '新增名句' })` → `getByRole('dialog', { name: '新增名句' })` |
| 列表里的一句 | `getByRole('button', { name: /句子里的字/ })`（选中的有 `aria-current="true"`） |
| 详细栏 | `getByRole('blockquote')`、`getByRole('button', { name: '编辑名句' })` |
| 表单栏位 | `getByLabel('句子内容' / '谁说的' / '出处细节' / '标签' / '笔记' / '新增出处')` |
| 出处选单 | `getByRole('combobox', { name: '出处' })` → `page.getByRole('option', { name: '哈姆雷特' })`；`'＋ 新增出处'` 切换成新增；类型是 `combobox` `'出处类型'` |
| 标签 | 输入后 `press('Enter')`；建议按钮 `'+ 人生'`；已加的标签 `'移除标签 人生'` |
| 表单按钮 | `'储存'`、`'取消'`、`'删除'` → 再按一次 `'确定删除？'` |
| 侧栏 | `'全部名句 12'`、出处 `'哈姆雷特 1'`、标签 `'#人生 6'`、`'清除筛选'` |
| 主题 | `getByRole('button', { name: '切换主题' })` → `getByRole('menuitemradio', { name: '深色' / '浅色' / '跟随系统' })`，`html` 有 `dark` class |

Select 与 dropdown 的选项渲染在 portal 里，要用 `page.getByRole('option')`，不能用 `dialog.getByRole`。

**错误画面**：只在要看错误状态时，在 journey 里用 `page.route('**/api/quotes*', (r) => r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"服务器错误"}' }))` 模拟 server 错误，`r.abort()` 模拟断线。这类 journey 会故意产生 console error（资源载入失败），结果会是 `FAIL (console errors)`：读 `report.json` 的 `consoleErrors`，确认只有被拦截的请求，再把它当成预期结果回报。

## Evidence

每次 `drive` 产生 `tmp/verify/runs/<YYYYMMDD-HHMMSS>-<name>/`（`tmp/` 已在 `.gitignore`）：

- `NN-<label>.png` 与 `NN-<label>.aria.txt`：每个 `shot()`。
- `report.json`：journey 路径、主题、`PASS` / `FAIL`、错误 stack、console errors、依序的 step 与 shot。
- 失败时自动多一张 `NN-failure.png`。

证明的标准：

- 走真的使用者路径：点按钮、打字、按 Enter。不要直接呼叫写入 API、不要改 React state、不要用 `page.evaluate` 代替操作（读 localStorage 当证据可以）。
- 拍下操作与结果，不只最后一张：例如验证错误画面、填好的表单、储存后的列表各一张。
- 写入要有第二个视角：储存后用 `api('/api/quotes')` 读回内容、出处、标签；或 `page.reload()` 后还在。
- mock 只用在上面的错误画面；正常流程打真的 Worker 与本地 D1。
- 回报时写出 run 目录的完整路径、PASS / FAIL，失败附错误讯息。没跑到的项目明讲。

## Cleanup

```sh
node .claude/skills/verify/scripts/lines.mjs down
```

只用 `taskkill /T`（Windows）或 process group 杀 `tmp/verify/dev.pid` 记录的那组 process，然后等 port 释放。不要用 process 名称去杀 node / workerd，使用者可能有别的 dev server。`down` 不碰 `tmp/verify/runs/`，证据会留着；也不还原资料，下一次 `up` 会重新 seed。要手动还原就 `down` 之后跑 `pnpm --filter server db:seed:local`。

每次失败的尝试之后也要 `down`，不要留下占着 port 的 process。

## 功能清单

`features/README.md` 是要验证的使用者功能清单，每个功能一个档案，写了入口、操作步骤与能证明成功的画面。改到哪个功能就照那个档案写 journey；功能列了多个入口时每个都要跑。
