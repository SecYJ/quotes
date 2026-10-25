# Plans：quotes-ui

## 做法概述
1. 在 `main` 上先做三个设计**共用**的部分：类型、假数据、资料操作（TanStack Query hooks）、名句表单。
2. 从 `main` 开出三个 worktree，每个只负责自己的版面。
3. 你同时打开三个 preview 比较，选定一个后合并回 `main`。

这样三个设计的差别只在版面，选定后合并也不会有冲突；落选的 worktree 直接删除。

## 为什么先用假数据
init.md 原本的顺序是 数据库 → API → 前端。这次先确认 UI，避免 API 做完才发现 UI 需要的资料形状不对。

假数据层刻意做成跟之后的 API 一样的形状：
- 所有资料操作都是 `async` 函数（`mock/api.ts`），并模拟一点延迟。
- 组件只透过 `lib/queries.ts` 里的 TanStack Query hooks 拿资料，不直接碰假数据。

之后接真 API 时，只需要把 `lib/queries.ts` 里呼叫 `mockApi` 的地方换成 Hono RPC client（`api.quotes.$get()` 等），组件不用改。

## 共用部分（main）

```
client/src/
├── lib/
│   ├── types.ts        Source / Quote / Tag / QuoteInput 等类型
│   ├── labels.ts       出处类型的中文名称
│   ├── search.ts       列表的 search params（sourceId / tagId / q）验证
│   └── queries.ts      TanStack Query hooks：查询与新增 / 编辑 / 删除
├── mock/
│   ├── seed.ts         范例资料
│   └── api.ts          内存中的假 API（async 方法）
└── components/
    ├── QuoteForm.tsx   名句表单（含出处选择、标签输入、删除确认）
    ├── SourcePicker.tsx
    └── TagInput.tsx
```

- **筛选状态放在网址**：用 TanStack Router 的 `validateSearch`，筛选结果可以重新整理保留，设计 C 从表单页回到列表时也不会丢失筛选。
- **标签用名称传递**：表单送出 `tags: string[]`，不存在的标签由（假）API 建立。之后真 API 也照这个形状，前端不用先建立标签。
- **新增出处**：表单里选"新增出处"时，送出前先建立出处，再用新出处的 id 建立名句。

## 各设计（worktree）

| 设计 | branch | worktree 路径 | preview port |
| --- | --- | --- | --- |
| A. 三栏式 | `design/three-column` | `../lines-three-column` | 5174 |
| B. 侧栏 + 卡片网格 | `design/card-grid` | `../lines-card-grid` | 5175 |
| C. 置中单栏 | `design/centered` | `../lines-centered` | 5176 |

- 每个 worktree 改 `routes/__root.tsx`、`routes/index.tsx`，并新增自己的版面组件；设计 C 另外新增表单页的 route。
- UI 阶段只需要启动 client（假数据不需要 server），所以每个 worktree 只跑 Vite，用不同 port 同时 preview。
- 每个 worktree 第一次使用前要 `pnpm install`（pnpm 共用全域 store，很快）。

## 宽屏排版原则（3440px）
- 文字行长控制在约 70 个字以内，避免一行横跨整个屏幕。
- 基础字号稍大（约 17–18px），34 吋屏幕坐在正常距离也好读。
- 版面高度以 1300px 为准，列表区域独立卷动，筛选与表单固定可见。

## 风险
- **假数据重新整理即消失**：UI 阶段可接受，specs 已说明。
- **routeTree.gen.ts**：由 TanStack Router 插件自动产生；设计 C 新增 route 后要先跑一次 Vite（dev 或 build）再 typecheck。

## 第二轮做法

- **shadcn 初始化**：`shadcn init -t vite -b base -p nova`，再 `migrate base-color --to stone`（沿用原本的 stone 色系）。组件放在 `client/src/components/ui/`，由 CLI 产生，不手改。
- **`cn`**：shadcn 4.22 产生的 `lib/utils.ts` 已经是 `export { cn } from "cn"`，不需要另外迁移。
- **颜色**：所有自己写的组件只用语意化 token（`bg-background`、`text-muted-foreground`、`bg-primary` 等），不直接写 `stone-*` / `teal-*`，深色模式才会自动正确。主色在 `index.css` 的 `--primary` 改成 teal。
- **Dark mode**：`.dark` class 放在 `<html>`。`ThemeProvider` 管理选择并监听系统主题变化；`index.html` 的 inline script 在 React 载入前先套用，避免闪白。
- **表单**：`lib/quote-form.ts` 放 zod schema 与「API 资料 ↔ 表单值」的转换。字段是平的（`sourceMode` + `sourceId` / `newSourceType` / `newSourceTitle`），条件必填用 `superRefine`，比 union 好对应 RHF。每个字段用 `Controller` + shadcn `Field` / `FieldError`。
- **row / grid**：`components/QuoteList.tsx` 依 `viewMode` 显示；grid 用 CSS columns 做 masonry（顺序是一栏一栏往下排）。
