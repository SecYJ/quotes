# Tasks：database

每个 task 都很小：先读「学什么」的文档，自己动手，用「怎么确认」检查。做完一个跟我说，我 review 后再进下一个。

## 0. 准备
- [x] 文件：specs.md、plans.md、tasks.md

## 1. 先摸一下 SQLite（不写 code）
- 学什么：SQLite 的类型只有 `integer` / `text` / `real` / `blob` / `null`；`PRIMARY KEY`、`NOT NULL`、`UNIQUE`、`FOREIGN KEY` 是什么。
- 做什么：读 specs.md 的 schema，想一下每个字段为什么这样设计，有疑问的记下来问我。
- 怎么确认：能说出「为什么时间存 integer」「为什么 quote_tags 用两个字段当 primary key」。

## 2. 在 wrangler 里加 D1 绑定
- 学什么：Cloudflare 的 **binding** 是什么（Worker 透过 `env.DB` 拿到数据库，不用连线字串）；`d1_databases` 的字段。
- 做什么：
  - [x] `wrangler.jsonc` 加 `d1_databases`：`binding: "DB"`、`database_name: "lines"`、`migrations_dir: "drizzle"`（先查 `database_id` 本地能否省略）
  - [x] `pnpm --filter server cf-typegen`，看 `worker-configuration.d.ts` 的 `Env` 多了 `DB: D1Database`
- 怎么确认：`pnpm --filter server exec wrangler d1 execute lines --local --command "select 1"` 有回传结果。

## 3. 安装 Drizzle 并写 drizzle.config.ts
- 学什么：drizzle-orm（执行查询）和 drizzle-kit（产生 migration 的 CLI）的分工；为什么 kit 不需要连数据库。
- 做什么：
  - [x] `pnpm --filter server add drizzle-orm`、`pnpm --filter server add -D drizzle-kit`（确认装到的是 0.x 稳定版）
  - [x] `server/drizzle.config.ts`：`dialect: 'sqlite'`、`schema: './src/db/schema.ts'`、`out: './drizzle'`、`casing: 'snake_case'`
  - [x] `server/package.json` 加 script：`db:generate` → `drizzle-kit generate`
- 怎么确认：`pnpm typecheck` 通过（schema.ts 还没写，先建一个空档）。

## 4. 第一张表：sources
- 学什么：`sqliteTable`、`integer` / `text`、`.primaryKey({ autoIncrement: true })`、`.notNull()`、`text({ enum })`、`integer({ mode: 'timestamp' })`、`.default(sql\`(unixepoch())\`)`。
- 做什么：
  - [x] 在 `src/db/schema.ts` 写 `sources`
  - [x] `pnpm --filter server db:generate`，打开产生的 `.sql` 读一遍
- 怎么确认：SQL 里有 `CREATE TABLE sources`，四个字段的类型和约束都跟 specs.md 一致。

## 5. 套用 migration 到本地 D1
- 学什么：`wrangler d1 migrations apply --local` 做了什么；`d1_migrations` 表；为什么已套用的 migration 不能改，只能再产生新的。
- 做什么：
  - [x] `pnpm --filter server exec wrangler d1 migrations apply lines --local`
  - [x] 用 `wrangler d1 execute --local --command` insert 一个出处、再 select 出来
- 怎么确认：select 得到资料，`created_at` 是一个整数（Unix 秒数）。

## 6. quotes：外键与自动更新时间
- 学什么：`.references(() => sources.id, { onDelete: 'restrict' })`；`$onUpdate`（为什么 SQLite 需要 ORM 帮忙）；第三个参数里的 `index()`。
- 做什么：
  - [x] 写 `quotes`，加 `source_id` 的 index
  - [x] `db:generate` → 读 SQL → `migrations apply --local`
- 怎么确认：insert 一句 `source_id` 不存在的名句会报 `FOREIGN KEY constraint failed`；删除有名句的出处也会报错。

## 7. tags 与 quote_tags：unique 与多对多
- 学什么：`.unique()`；多对多为什么要第三张表；复合 primary key `primaryKey({ columns: [...] })`；`onDelete: 'cascade'`。
- 做什么：
  - [x] 写 `tags`、`quote_tags`，加 `tag_id` 的 index
  - [x] `db:generate` → 读 SQL → `migrations apply --local`
- 怎么确认：
  - 插入两个同名标签会报 `UNIQUE constraint failed`
  - 同一句挂同一个标签两次会报错
  - 删除名句后，它在 `quote_tags` 的资料一起消失

## 8. 在 Worker 里接上 Drizzle
- 学什么：`drizzle(env.DB, { casing: 'snake_case' })`；`typeof sources.$inferSelect` / `$inferInsert` 推导出的类型。
- 做什么：
  - [x] 写一个建立 db 的小函数（例如 `src/db/index.ts`）
  - [x] 暂时在 `/api/health` 回传 `sources` 的笔数，确认 Worker 读得到 D1（阶段 3 再拿掉）
- 怎么确认：`pnpm dev` 后打开 http://localhost:5173/api/health 看到笔数。

## 9. 收尾
- [x] `docs/commands.md`：加 `db:generate`、`migrations apply --local`、`d1 execute --local`
- [x] `docs/structure.md`：加 `server/drizzle/`、`server/src/db/`、`server/drizzle.config.ts`
- [x] 依 [verification.md](../../../verification.md) 验证（这阶段没有 UI 改动，Playwright 只确认首页正常）
- [x] specs.md 的验收全部勾掉，commit
