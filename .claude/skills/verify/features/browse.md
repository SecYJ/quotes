# 阅览列表与详细

访客打开首页就看到全部名句的列表，可以在 row 与 grid 之间切换（偏好会记住），点一句在右栏看完整内容、出处类型、标签、记下的日期与笔记，也可以切换浅色 / 深色。

## Sub-features

- `browse-list` 首页列出全部名句与句数。
- `browse-detail` 点一句，右栏显示完整内容，该句被标成选中（书签）。
- `browse-view-mode` row / grid 切换，重新整理后保持。
- `browse-theme` 浅色 / 深色 / 跟随系统，重新整理后保持。
- `browse-empty-panel` 没选任何一句时右栏显示提示文字。

## How to get to it (user POV)

- 打开 `http://localhost:5173/`。
- 点中间列表的任何一句。
- 列表右上角的「列表显示」/「网格显示」按钮。
- 左栏标题旁的「切换主题」按钮。

## Driving it with lines.mjs drive

Preconditions:

- 基准状态（12 句）。
- 范本：`journeys/smoke.mjs` 已涵盖下面除了「重新整理保持」以外的步骤。

- **列表。** `page.goto('/')`。`getByText('12 句', { exact: true })` 可见；`getByRole('heading', { name: 'Lines' })` 可见。
- **空的右栏。** 还没点任何一句。右栏有文字「点中间的一句，在这里看完整内容。」。
- **看详细。** 点 `getByRole('button', { name: /明天，明天，再一个明天/ })`（最长的一句，顺便看排版）。`getByRole('blockquote')` 含完整内容；有「我的笔记」与「很长的一段，用来检查排版。」；该列表项 `aria-current="true"`。
- **grid。** 点 `getByRole('button', { name: '网格显示' })`。它 `aria-pressed="true"`；`localStorage['lines-view-mode']` 是 `grid`。`page.reload()` 后仍是 grid。
- **深色。** 点 `切换主题` → `getByRole('menuitemradio', { name: '深色' })`，再按 `Escape`。`html` 有 class `dark`；`localStorage['lines-theme']` 是 `dark`；reload 后仍是深色。
- **跟随系统。** 用 `--theme dark` 跑、选单选「跟随系统」。`html` 有 `dark`，`localStorage['lines-theme']` 不存在。
- **证据。** 列表、详细、grid、深色各 `shot()` 一张。

## Gotchas

- 主题选单选完不会自己关，截图前按 `Escape`，否则左栏被选单的遮罩压暗，看起来像深色模式的颜色有问题。
- 列表依记下的日期新到旧排序，第一句是「时间不会让事情变好…」，不是 id 1。
- 右栏详细先用列表里的资料显示，再在背景重新取一次；断言内容即可，不要断言网路请求次数。
- localStorage 是每个 browser context 各自的，每次 `drive` 都从空的开始（row、跟随 `--theme`）。
