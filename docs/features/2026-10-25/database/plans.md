# Plans：database

## 套件版本
- `drizzle-orm` 与 `drizzle-kit` 用 npm `latest` 标签的**稳定版**（查询时 2026-10-25：`drizzle-orm@0.45.4`、`drizzle-kit@0.31.11`）。
- Drizzle 官网首页现在主推 v1.0 RC（`@rc`），migration 目录结构和 relations 写法都和 0.x 不同。init.md 要求最新稳定版，所以**不用 RC**；查文档时注意范例是不是 RC 的写法。

## 档案位置

```
server/
├── drizzle.config.ts      drizzle-kit 设定：dialect、schema 路径、migration 输出目录
├── drizzle/               drizzle-kit 产生的 migration（.sql + meta/），进版本控制
├── src/db/schema.ts       四张表的定义
└── wrangler.jsonc         加 d1_databases 绑定，migrations_dir 指向 drizzle/
```

## 流程：谁负责什么

```
schema.ts ──drizzle-kit generate──▶ drizzle/0000_xxx.sql ──wrangler d1 migrations apply --local──▶ 本地 D1
```

- **drizzle-kit 只负责「产生」SQL**：比对 schema.ts 和上一次的快照（`drizzle/meta/`），写出差异的 SQL。它不连数据库，所以 `drizzle.config.ts` 只要 `dialect: 'sqlite'`，不需要 D1 的帐号凭证。
- **wrangler 负责「套用」SQL**：读 `migrations_dir` 里的档案，按顺序执行，已执行过的记在 D1 里的 `d1_migrations` 表。本地加 `--local`，阶段 5 部署时改 `--remote`。
- 为什么不用 `drizzle-kit push` / `migrate`：它们要连得到数据库，连远端 D1 需要 API token；用 wrangler 套用，本地和远端是同一套指令与同一批 SQL 档。

## 关键决定

| 决定 | 原因 |
| --- | --- |
| 时间存 integer（Unix 秒） | SQLite 没有日期类型；整数好比较、好排序。API 回传时转成 ISO 字串，前端的 `createdAt: string` 不用改 |
| 预设时间用 SQL 的 `(unixepoch())` | 写在数据库里，不管从哪里 insert 都有值 |
| `updated_at` 用 Drizzle 的 `$onUpdate` | SQLite 没有 `ON UPDATE`；`$onUpdate` 在 Drizzle 执行 update 时自动带上新时间 |
| 出处删除用 restrict，quote_tags 用 cascade | 出处被名句引用时不该消失；关联表只是连线，名句没了连线就没意义 |
| 删除名句后不清掉没人用的标签 | init.md 没要求；之后有需要再加 |
| 数据库 snake_case、TS camelCase | 用 Drizzle 的 `casing: 'snake_case'`，schema 里只写 camelCase 键名，不必每栏手写字串名称 |

## 查文档确认的结果（2026-10-28）
- `database_id` 本地可以省略：Wrangler 的 automatic provisioning 允许不写 resource ID，`wrangler dev` / `--local` 会自动建本地 D1。阶段 5 建远端 D1 后再填。
- drizzle-kit 0.31 的 migration 平铺在 `drizzle/`（`0000_init.sql` + `meta/`），wrangler 用 `migrations_dir` 就读得到，不需要 `migrations_pattern`。
- `casing: 'snake_case'` 同时设在 `drizzle.config.ts` 和 `src/db/index.ts` 的 `drizzle()`。

## 实作中多出的决定

| 决定 | 原因 |
| --- | --- |
| server 内 import 用 `#/`（`package.json` 的 `imports`），不用 `@/` | lint 禁止相对路径；client 透过 server 的声明档拿 `AppType`，若 server 用 `@/`，声明档里的 `@/db/schema` 会被 client 解析成 `client/src`。`#/` 永远相对 `server/package.json` 解析 |
| `#/*` 对应 `./src/*.ts`（带副档名） | TypeScript 解析 `imports` 的目标时不会自动补 `.ts` |
| index 自订名称（`quotes_source_id_idx`、`quote_tags_tag_id_idx`） | 在 SQL 与 `wrangler d1 execute` 的结果里一眼看得出用途 |
