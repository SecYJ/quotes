# 项目：个人名句记录网站

## 目标
做一个公开的网站，用来记录从戏剧、书、现实生活或其他地方听到的名句，并且每句都要记录出处。手机、平板、桌机都要好用（桌机包含 34 吋带鱼屏 3440×1440）。
- **所有人都可以看**名句（不用登入）。
- **只有我（站长）可以新增 / 编辑 / 删除**：网站本身没有任何写入功能，我直接改 repo 里的资料档，push 之后网站重新 build。用语见根目录 [GLOSSARY.md](../GLOSSARY.md)。

## 为什么是静态网站
第一版原本是 Vite + React SPA 加 Hono / Cloudflare Workers / D1，有管理页与 Cloudflare Access。实际用起来只有「看」，写入一个人偶尔做，所以在 2026-11 改成 Astro 静态网站：没有资料库、没有 API、没有登入，资料就是 repo 里的 YAML 档。

## 技术栈
- **Astro**（静态输出），单一项目，不再是 monorepo。
- **资料**：Astro content collections，`src/content/sources/` 里一个出处一个 YAML 档，schema（zod）写在 `src/content.config.ts`。
- **前端互动**：只有筛选、搜索与复制，用原生 TypeScript script（`src/scripts/issue.ts`、`src/scripts/copy.ts`），不用 UI 框架。
- **样式**：纯 CSS（`src/styles/global.css`），视觉见 [design.md](./design.md)。
- **字体**：Noto Serif SC 用 `@fontsource` 自托管。
- 所有套件使用当前最新稳定版本。写设定之前先查最新文档，不凭记忆。

## 部署方式
- **Cloudflare Pages** 接 GitHub repo（private），push 到 `main` 就自动 build（`pnpm build`，输出 `dist/`）并发布。
- 网站挂在我自己的网域上（网域已在 Cloudflare 管理）。
- 必须保持在 Cloudflare 免费方案的额度内。

## 数据结构
一个出处一个档案，档名就是出处的 id（网址里用，例如 `?source=hamlet`）：

```yaml
type: drama            # drama / book / real_life / other
title: 哈姆雷特
quotes:
  - content: 生存还是毁灭，这是一个值得考虑的问题。   # 必填
    speaker: 哈姆雷特     # 选填
    detail: 第三幕第一场   # 出处细节，选填
    note: ...            # 笔记，选填
    tags: [人生, 勇气]    # 至少一个
    added: 2026-09-01    # 收录日期，必填，用来排序
```

build 时会检查，不符合就 build 失败：
- 每句至少一个标签；同一句的标签不能重复（忽略英文大小写）。
- `added` 必须是日期；不能有 schema 以外的栏位（拼错的栏位会被挡）。
- 同一个标签在不同档案里不能只差英文大小写（`Love` 与 `love`）。
- 同一种出处类型下，两个档案的 title 不能相同（区分英文大小写）。

## 功能
1. 阅览页列出所有名句，最新的在最前面：第一句是头条，接着三句在侧栏，其余在下方分栏。
2. 按标签筛选：标签列在索引里。
3. 按出处筛选：点名句上的出处（例如看某部剧的所有句子），可以和标签筛选一起用。出处会一直增加，所以不在索引里列出。
4. 关键字搜索：搜句子内容、说话的人和出处名称，命中的字会标出来。
5. 筛选与搜索状态写在网址（`?source=…&tag=…&q=…`），可以直接分享。
6. 复制：每句名句有一个复制图标，只复制内容（不带说话人、出处、笔记或标签）。

**不要加以上没有列出的功能。**

## 工作方式（重要）
请**分阶段**进行。每个阶段完成后**停下来**，跟我说：
- 这个阶段做了什么
- 关键的决定和原因
- 我要怎样验证它可以运作

等我确认之后才进入下一个阶段。

### 阶段（2026-11 改版）
1. **清理与安装**：删除旧项目、安装 Impeccable、建立 Astro 项目与 content collection、把测试资料转成 YAML，build 能通过资料检查。✅
2. **阅览页与重新设计**：用 Impeccable 定出视觉方向（晚报副刊）并做出阅览页（列表、标签与出处筛选、搜索），支援手机、平板、桌机；改写 docs。✅
3. **部署**：列出建立 GitHub repo、接上 Cloudflare Pages、绑定网域的步骤，由我自己操作。
