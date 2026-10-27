# Tasks：api

- [x] specs.md、plans.md
- [x] 安装 `@hono/zod-validator`、`jose`
- [x] schema 加 relations（`db.query.*` 一次带出出处与标签；不需要 migration）
- [x] `validation.ts`：filters、quoteInput、sourceInput、idParam、统一的 400 格式
- [x] `db/quotes.ts`：列表 / 单句 / 新增 / 编辑 / 删除、出处、标签
- [x] `middleware/access.ts` + `wrangler.jsonc` 的 `vars` + dev script 的 `--var`
- [x] `routes/public.ts`、`routes/admin.ts`、`index.ts`（拿掉 `/health` 的暂时 `sourceCount`）
- [x] 验证：API 测试脚本、Access 拒绝测试、client 类型检查、fmt / lint / typecheck、Playwright 首页
- [x] `docs/commands.md`、`docs/structure.md`
- [x] review 后 commit
