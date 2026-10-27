# Specs：api

## 目标
阶段 3：Hono 路由 + zod 验证，export `AppType` 给 client 用。读取公开、写入只有我（见 [init.md](../../../init.md) 的权限段落）。

## 路由

所有路由都在 `/api` 底下。回传的 `Quote` / `Source` / `Tag` 形状与 `client/src/lib/types.ts` 一致（时间是 ISO 字串）。

### 公开（任何人）

| Method | 路径 | 说明 | 回传 |
| --- | --- | --- | --- |
| GET | `/quotes?sourceId=&tagId=&q=` | 列表；三个条件可以合并。`q` 用 `LIKE` 搜 `content` 与 `speaker`；新的在前 | `Quote[]` |
| GET | `/quotes/:id` | 单句 | `Quote`；不存在 404 |
| GET | `/sources` | 全部出处，按名称（中文规则）排序 | `Source[]` |
| GET | `/tags` | 全部标签，按名称排序 | `Tag[]` |
| GET | `/health` | 确认 Worker 活着 | `{ ok, time }` |

### 写入（`/admin/*`，要通过 Cloudflare Access）

| Method | 路径 | Body | 回传 |
| --- | --- | --- | --- |
| POST | `/admin/quotes` | `QuoteInput` | 201 `Quote`；出处不存在 400 |
| PUT | `/admin/quotes/:id` | `QuoteInput`（整句取代，含标签） | 200 `Quote`；名句不存在 404、出处不存在 400 |
| DELETE | `/admin/quotes/:id` | — | 204；不存在 404 |
| POST | `/admin/sources` | `SourceInput` | 201 `Source` |

- `QuoteInput.tags` 是标签名称：去掉空白与重复，不存在的自动建立。
- `speaker` / `sourceDetail` / `note` 送空字串等同 `null`。

## 错误格式
- 验证失败：400 `{ error: '输入格式不正确', issues: [{ path, message }] }`
- 其他：`{ error: '<中文说明>' }`；没处理到的错误一律 500 `{ error: '服务器错误' }`，细节只写进 log。
- 写入 API 没通过 Access 验证：403 `{ error: '没有权限' }`。

## 不包含
- 前端改接真 API、`/admin` 页面（阶段 4）。
- 编辑 / 删除出处与标签、清理没人用的标签（init.md 没有）。

## 验收
- [x] 所有路由依上表回传正确的 status 与资料（scratchpad 的 API 测试脚本，25 项全过）
- [x] 本地 `pnpm dev` 写入 API 可用；没设定 Access 变数时回 403
- [x] 设了 Access 变数后，没带 token、带伪造 token 都回 403，资料没有写入
- [x] client 用 `hc<AppType>` 拿到的回传类型与 `client/src/lib/types.ts` 一致
- [x] `pnpm fmt`、`pnpm lint`、`pnpm typecheck` 通过
