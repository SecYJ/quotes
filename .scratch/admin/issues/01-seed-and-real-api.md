# 01: 本地 seed 资料，阅览页改接真 API

**What to build:** 开发时，一个指令就能把固定的范例名句（四种出处类型、多个标签、一句长句，每句至少一个标签）灌进本地 D1。`pnpm dev` 打开阅览页，看到的是本地 D1 的资料，不再是浏览器里的假 API。现有的浏览、筛选、搜索和写入流程都改走真 API（本地开发时写入 API 由 dev bypass 放行）。这一张是 prefactor：后面每一张都在真资料上做。见 [spec](../spec.md)「资料流」。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] 有一个 `db:seed:local` 指令：先清空本地 D1，再写入范例资料；重复执行结果相同
- [x] client 的查询与 mutation 改用 Hono RPC client 呼叫 `/api/*`，回传类型来自 server 的 `AppType`
- [x] 假 API、假资料和它的失败开关都已移除，没有残留的引用
- [x] 阅览页的列表、筛选（出处 / 标签）、搜索、row / grid 切换在真资料上正常
- [x] 现有的新增 / 编辑 / 删除（含当场新增出处、新标签）写入本地 D1，重新整理后仍在
- [x] API 回传错误时，画面显示现有的错误提示（取代原本用假 API 开关测错误画面的方法），docs/verification.md 改写对应的步骤
- [x] `docs/commands.md`、`docs/structure.md` 已更新（seed 指令、移除假 API 目录）
- [x] `pnpm fmt`、`pnpm lint`、`pnpm typecheck` 通过；Playwright（3440×1300，浅色 / 深色）跑过上述流程，无 console 错误
