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
- [x] 开出三个 worktree 并 `pnpm install`
- [x] A. 三栏式（`design/three-column`，port 5174）
- [x] B. 侧栏 + 卡片网格（`design/card-grid`，port 5175）
- [x] C. 置中单栏（`design/centered`，port 5176）
- [x] 每个设计 `pnpm typecheck` 通过，commit

## 4. 你来 preview
- [x] 在 3440×1300 下比较三个设计，按 specs.md 的验收项目试用
- [x] 选定设计（A. 三栏式）→ 合并回 `main`，删除其他 worktree 与 branch

## 5. 第二轮调整（见 specs.md「第二轮」）
- [x] shadcn/ui 初始化：Base UI、nova 风格、stone 底色；`@/` alias
- [x] `cn` 改用 shadcn 提供的 `cn` 包（取代 clsx + tailwind-merge）
- [x] 主色改成 teal（浅色 / 深色各一组）
- [x] Dark mode：`ThemeProvider`（预设跟随系统）、`ModeToggle`、`index.html` 防闪烁脚本
- [x] 表单改用 React Hook Form + zod（`lib/quote-form.ts`）+ shadcn `Field`
- [x] 出处选择改用 shadcn `Select`；标签输入改用 `Badge` / `Button`
- [x] 中间列表支援 row / grid 切换（`ToggleGroup`），选择记在 localStorage
- [x] 其余组件的颜色改成 shadcn 的语意化 token（深色模式才会正确）
- [x] `pnpm typecheck`、`pnpm build` 通过
- [x] 无头浏览器（Playwright，3440×1300）跑过：浅色 / 深色、验证错误、新增（新出处 + 新标签）、编辑、筛选、搜索、grid、删除、主题切换，无 console 错误
- [ ] 你来 preview 确认

## 6. 视觉设计（frontend-design）
- [x] 设计方案：传统颜料配色（月白 / 素 / 墨 / 苍 / 石青 / 藤黄）、霞鹜文楷、读书记号；写在 `docs/design.md`
- [x] 句子改用霞鹜文楷（`font-quote`），介面西文用 Geist、中文用系统黑体
- [x] 选中的句子挂藤黄书签；搜索命中的字加着重号；详细页用「」悬挂引号；出处改成 ——谁《哪里》
- [x] 去掉 `·` 串接的资讯行、全大写小标签、卡片阴影
- [x] 无头浏览器重跑全部流程，无 console 错误；局部放大确认字体载入、着重号位置、悬挂引号对齐
- [ ] 你在实际屏幕上确认
