# 项目：个人名句记录 App

## 目标
做一个公开的网站，用来记录从戏剧、书、现实生活或其他地方听到的名句，并且每句都要记录出处。目前只支援 desktop：目标屏幕是 34 吋带鱼屏（ASUS PG34WCDM，3440×1440，Windows 缩放 100%），不需要做手机版。
- **所有人都可以看**名句（不用登入）。
- **只有我可以新增 / 编辑 / 删除**，写入的功能放在独立的 `/admin` 页面。

## 背景
- 我是有 3 年经验的前端开发者，熟悉 React、TypeScript、Tailwind。
- Cloudflare Workers、D1、Hono 对我来说比较新，请在用到它们的时候解释清楚"为什么这样做"。

## 技术栈
- **Monorepo**：pnpm workspaces，根目录下分 `/client` 和 `/server`，前后端边界分开管理。
- **/client**：Vite + React + TypeScript + TanStack Router + TanStack Query + Tailwind CSS（纯 SPA）。
- **/server**：Hono + Drizzle ORM + Cloudflare D1，跑在 Cloudflare Workers，用 Wrangler 开发和部署。
- **前后端类型共享**：使用 Hono RPC client（`hc`），client 直接从 server 拿 API 的 TypeScript 类型。
- **验证**：API 输入使用 zod（`@hono/zod-validator`）。
- 所有套件使用当前最新稳定版本。写设定档之前先查最新文档，不要凭记忆写 Wrangler / D1 / Drizzle 的设定。

## 部署方式
- **同一个 Worker** 同时提供前端文件和 API：
  - `/api/*` 由 Hono 处理。
  - 其他路径提供 `/client` build 出来的静态文件，并且要有 SPA fallback（找不到的路径回传 index.html，交给 TanStack Router 处理）。
- 使用 Workers static assets，Wrangler 设定放在 `/server`，assets 目录指向 client 的 build 输出。
- 网站挂在我自己的网域上（网域已在 Cloudflare 管理）。
- **权限**：用 **Cloudflare Access** 只保护写入相关的路径，其他路径公开：
  - 受保护：`/admin`、`/admin/*`、`/api/admin/*`，只允许我的 email 进入。
  - 公开：首页与 `/api/*` 中的读取 API（只有 GET）。
  - 关掉 `workers.dev` 网址（`workers_dev: false`），避免绕过 Access 直接打 Worker。
  - Worker 在 `/api/admin/*` 仍要验证 Access 带来的 JWT（`Cf-Access-Jwt-Assertion` header），没有或无效就回 403。
  - 所以 **app 里面不需要写登入或用户系统**，登入交给 Access。
- 必须保持在 Cloudflare 免费方案的额度内。

## 本地开发
- `wrangler dev` 跑 server（使用本地 D1）。
- Vite dev server 跑 client，把 `/api` proxy 到 wrangler dev。
- 在根目录提供 pnpm scripts，一个指令就能同时启动前后端。

## 数据结构
- **sources（出处）**
  - id
  - type：`drama` / `book` / `real_life` / `other`
  - title：出处名称（例如剧名、书名；现实生活可以是"朋友聊天"之类）
  - created_at
- **quotes（名句）**
  - id
  - content：句子内容（必填）
  - speaker：谁说的（选填）
  - source_id：连到 sources
  - source_detail：出处细节（选填，例如第几集、哪个场合）
  - note：我的个人笔记（选填）
  - created_at、updated_at
- **tags**
  - id
  - name（unique）
- **quote_tags**：quotes 和 tags 的多对多关系

一个出处可以有多句名句；一句名句可以有多个 tag。

## 第一版功能
1. 在 `/admin` 新增 / 编辑 / 删除名句（新增时可以选现有出处，也可以当场新增出处）。公开页面只能看，没有写入的按钮。
2. 按出处筛选（例如看某部剧的所有句子）。
3. Tags 分类：新增名句时可以加多个 tag，可以按 tag 筛选。
4. 关键字搜索：搜句子内容和说话的人。第一版用简单的 SQL `LIKE` 就好。

**不要加以上没有列出的功能。**

## 工作方式（重要）
请**分阶段**进行。每个阶段完成后**停下来**，跟我说：
- 这个阶段做了什么
- 关键的决定和原因
- 我要怎样验证它可以运作

等我确认之后才进入下一个阶段。

### 阶段
1. **Monorepo 骨架**：pnpm workspace、client 和 server 的基本项目、TypeScript 设定。本地可以同时跑起前后端，client 能成功呼叫 server 的一个测试 API。
2. **数据库**：Drizzle schema、migration，套用到本地 D1。
3. **API**：Hono 路由，分成公开的读取 API（列表、筛选、搜索、出处、tags）与 `/api/admin/*` 的写入 API（名句 CRUD、新增出处），写入 API 加上验证 Access JWT 的 middleware；zod 验证，并 export API 类型给 client 使用。
4. **前端**：公开的名句列表（含搜索和筛选）；`/admin` 页面使用同一套列表，再加上新增 / 编辑 / 删除与出处、tag 的选择，使用 Hono RPC client + TanStack Query，desktop 排版（3440×1440）。
5. **部署**：build client、建立远端 D1、套用 migration、部署到 Cloudflare Workers 并绑定我的网域、关掉 workers.dev。Cloudflare Access（只保护 `/admin` 相关路径）的设定请列出 dashboard 上的操作步骤，由我自己手动完成。