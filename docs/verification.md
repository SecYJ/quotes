# 验证

每次修改完成后、回报完成前，依序做两轮检查。第一轮没过就先修，不进第二轮。

## 1. 静态检查（快速）

在项目根目录执行：

```sh
pnpm fmt         # 先格式化，避免 lint 报格式以外的杂讯
pnpm lint        # oxlint
pnpm typecheck   # 所有 workspace 的 tsc
```

三个都要零错误。lint 的 warning 也要看过，是这次改动造成的就修掉。

## 2. Playwright 浏览器测试

用无头浏览器实际操作一轮，确认画面与互动正常。

1. 启动 client：`pnpm --filter client dev`（UI 阶段用假数据，不需要 server；需要 API 时改用 `pnpm dev`）。
2. 在 scratchpad 写一次性的 Playwright 脚本（不放进 repo），viewport 用 `3440×1300`。
3. 跑过与这次改动相关的流程，并至少涵盖：
   - 页面载入、浅色 / 深色模式
   - 新增、编辑、删除名句（含新出处、新标签）
   - 表单验证错误
   - 筛选、搜索、row / grid 切换
4. 全程监听 `console` 与 `pageerror`，不能有错误。
5. 需要看错误画面时，用 `localStorage.setItem('lines-mock-fail', '<假 API 方法名>')` 触发（见 [commands.md](commands.md)）。
6. 跑完关掉 dev server。

## 回报

说明两轮各跑了什么、结果如何。有失败或跳过的项目要明讲，附上错误讯息。
