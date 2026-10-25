# Tasks：quotes-ui

## 1. 准备
- [x] 文件：init.md / overview.md 改成只支援 desktop
- [x] 文件：specs.md、plans.md、tasks.md
- [x] `git init`，第一个 commit（`main`）

## 2. 共用部分（main）
- [x] `lib/types.ts`、`lib/labels.ts`
- [x] `mock/seed.ts`：约 12 句范例资料（四种出处类型、多个标签、一句长句）
- [x] `mock/api.ts`：列表（筛选 + 搜索）、新增 / 编辑 / 删除名句、出处列表 / 新增、标签列表
- [x] `lib/queries.ts`：查询与 mutation hooks，成功后更新相关查询
- [x] `lib/search.ts`：`sourceId` / `tagId` / `q` search params
- [x] `components/SourcePicker.tsx`：选已有出处，或新增（类型 + 名称）
- [x] `components/TagInput.tsx`：多个标签，可选已有或输入新的
- [x] `components/QuoteForm.tsx`：全部字段、必填验证、删除二次确认
- [x] `pnpm typecheck` 通过，commit

## 3. 版面设计（各自的 worktree）
- [ ] 开出三个 worktree 并 `pnpm install`
- [ ] A. 三栏式（`design/three-column`，port 5174）
- [ ] B. 侧栏 + 卡片网格（`design/card-grid`，port 5175）
- [ ] C. 置中单栏（`design/centered`，port 5176）
- [ ] 每个设计 `pnpm typecheck` 通过，commit

## 4. 你来 preview
- [ ] 在 3440×1300 下比较三个设计，按 specs.md 的验收项目试用
- [ ] 选定设计 → 合并回 `main`，删除其他 worktree 与 branch
