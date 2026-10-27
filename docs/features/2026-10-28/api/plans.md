# Plans：api

## 档案

```
server/src/
├── index.ts              组合路由、onError、export AppType
├── env.d.ts              补上 wrangler types 不知道的 ACCESS_DEV_BYPASS
├── validation.ts         zod schema 与 validate()（统一 400 格式）
├── db/quotes.ts          所有查询与写入（route 只负责 HTTP）
├── middleware/access.ts  requireAccess：验证 Cf-Access-Jwt-Assertion
└── routes/
    ├── public.ts         GET /quotes、/quotes/:id、/sources、/tags
    └── admin.ts          写入 API，整个 router 先过 requireAccess
```

## 关键决定

| 决定 | 原因 |
| --- | --- |
| 公开与写入分成两个 router，写入挂在 `/admin` | 和 Access 的路径规则一一对应：`/api/admin/*` 一条规则就能盖住所有写入 |
| JWT 用 `jose` 验证，不用 Hono 的 `jwk` middleware | Hono 的 `jwk` 要求 header 是 `Bearer <token>`，Access 的 header 只放 token；`jose` 是 Cloudflare 文档的示范做法 |
| `ACCESS_TEAM_DOMAIN`、`ACCESS_AUD` 放 `wrangler.jsonc` 的 `vars`，先留空 | 都不是秘密；留空时一律 403（fail closed），阶段 5 填入 |
| 本地用 `wrangler dev --var ACCESS_DEV_BYPASS:true` 跳过验证 | 本地没有 Access。写在 dev script 里，部署（`wrangler deploy`）不会带上；不放 `.dev.vars` 是因为它被 gitignore，新 clone 会少掉 |
| `cf-typegen` 加 `--strict-vars=false` | 不然空字串会被产生成字面类型 `""`，阶段 5 填值后类型又变 |
| 写入用 `db.batch` | D1 不支援 `BEGIN`/`COMMIT`；batch 整批是一个 transaction，名句和标签一起成功或一起失败 |
| 新增名句时用 `(select max(id) from quotes)` 接标签 | batch 送出前不知道新 id；AUTOINCREMENT 保证新 id 最大，batch 中间不会有别的写入 |
| 先查出处 / 名句存不存在，再写入 | 回传清楚的 400 / 404，而不是外键错误变成 500 |
| 中文名称排序在 JS 用 `Intl.Collator('zh-Hans')` | SQLite 的 `ORDER BY` 只比字元编码，和前端假资料的排序不同 |
| `LIKE` 不跳脱 `%`、`_` | init.md 说第一版用简单的 `LIKE`；搜到多余结果无害 |
