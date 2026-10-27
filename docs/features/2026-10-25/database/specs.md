# Specs：database

## 目标
阶段 2：用 Drizzle 定义 schema、产生 migration，套用到**本地** D1。远端 D1 在阶段 5（部署）才建立。

这个阶段由我先写出一版，你 review；tasks.md 依然可以当成学习顺序来读。

依据：[init.md](../../../init.md) 的数据结构。

## D1 就是 SQLite
- Cloudflare D1 底层是 SQLite，写的是 SQLite 语法；Drizzle 用 `drizzle-orm/sqlite-core`。
- `wrangler dev` 时，本地 D1 是一个 SQLite 档案，放在 `server/.wrangler/`，不用另外装数据库。
- SQLite 和 Postgres / MySQL 不同的地方：
  - **没有日期类型**：时间存成整数（Unix 秒数），Drizzle 用 `integer({ mode: 'timestamp' })` 自动转成 `Date`。
  - **没有 enum**：`type` 存成 `text`。Drizzle 的 `text({ enum: [...] })` 只影响 TypeScript 类型，数据库不会挡，真正的检查交给 API 的 zod。
  - **外键**：D1 预设就会检查外键（一般 SQLite 要另外开 `PRAGMA foreign_keys`）。

## Schema

命名：数据库用 snake_case，TypeScript 用 camelCase。

### sources（出处）

| 字段 | SQLite 类型 | 规则 |
| --- | --- | --- |
| `id` | integer | primary key，自动递增 |
| `type` | text | 必填；`drama` / `book` / `real_life` / `other` |
| `title` | text | 必填 |
| `created_at` | integer | 必填；预设为现在 |

### quotes（名句）

| 字段 | SQLite 类型 | 规则 |
| --- | --- | --- |
| `id` | integer | primary key，自动递增 |
| `content` | text | 必填 |
| `speaker` | text | 选填 |
| `source_id` | integer | 必填；外键 → `sources.id`，**有名句的出处不能删**（restrict） |
| `source_detail` | text | 选填 |
| `note` | text | 选填 |
| `created_at` | integer | 必填；预设为现在 |
| `updated_at` | integer | 必填；预设为现在，更新时自动改成现在 |

### tags

| 字段 | SQLite 类型 | 规则 |
| --- | --- | --- |
| `id` | integer | primary key，自动递增 |
| `name` | text | 必填，**unique** |

### quote_tags（多对多）

| 字段 | SQLite 类型 | 规则 |
| --- | --- | --- |
| `quote_id` | integer | 外键 → `quotes.id`，删除名句时一起删（cascade） |
| `tag_id` | integer | 外键 → `tags.id`，删除标签时一起删（cascade） |

- primary key 是 `(quote_id, tag_id)` 两个字段一起：同一句不会重复挂同一个标签。

### Index

| Index | 为什么 |
| --- | --- |
| `quotes.source_id` | 按出处筛选 |
| `quote_tags.tag_id` | 按标签筛选。`quote_id` 不用另外加，它是 primary key 的第一个字段，已经有 index |

关键字搜索用 `LIKE '%…%'`，开头是 `%` 用不到 index，第一版资料量小，不处理。

## 不包含
- API、seed 资料、远端 D1（阶段 3、5）。
- init.md 没有的字段或表（例如出处名称 unique、软删除）。

## 验收
- [x] `pnpm --filter server db:generate` 产生 migration SQL，内容和上面的 schema 一致
- [x] migration 套用到本地 D1，`wrangler d1 execute --local` 查得到四张表
- [x] 手动插入资料，确认 `tags.name` 重复、`quotes.source_id` 指向不存在的出处都会报错；删除名句后 `quote_tags` 跟着消失
- [x] `pnpm typecheck`、`pnpm lint` 通过
