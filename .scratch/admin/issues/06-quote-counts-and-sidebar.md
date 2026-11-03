# 06: 句数与侧栏

**What to build:** 出处与标签的读取 API 回传每一项的句数（`quoteCount`），包含 0 句的项目。阅览页（与管理页名句分页）的筛选侧栏用这个句数显示，并且只列出至少有一句的出处与标签，访客不会点进空的结果；侧栏不再为了算句数抓全部名句。写入名句后，句数随之更新。见 [spec](../spec.md)「API」。

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `GET` 出处 / 标签回传全部项目，每项带正确的 `quoteCount`（含 0）
- [ ] 侧栏显示的句数来自 `quoteCount`；0 句的出处与标签不出现在侧栏
- [ ] 载入页面时不再额外抓一份全部名句来算句数
- [ ] 新增、编辑、删除名句后，侧栏句数立刻更新；最后一句被删掉的出处 / 标签从侧栏消失
- [ ] API 测试脚本补上 `quoteCount` 案例并全部通过
- [ ] `pnpm fmt`、`pnpm lint`、`pnpm typecheck` 通过；Playwright 跑过侧栏显示与更新，无 console 错误
