# Lines 功能验证清单

这里是 Lines 使用者功能的验证来源。驱动 app 之前先读这份索引，再照对应的功能档案写 journey。用语依 `GLOSSARY.md`（名句、出处、标签、出处细节、说话人、笔记）。

## 基准状态

- 用 `node .claude/skills/verify/scripts/lines.mjs up` 启动，看到 `READY http://localhost:5173（12 句名句）`。
- `doctor` 显示 `DOCTOR OK`，名句数 12。
- seed 资料：12 句名句；出处 9 个（戏剧：哈姆雷特、罗密欧与朱丽叶、麦克白；书：论语 2 句、道德经、红楼梦；现实生活：朋友聊天 3 句、公司会议；其他：播客）；标签 6 个（人生 6、勇气 4、学习 3、时间 2、工作 2、爱情 1）。
- 浏览器 viewport 3440×1300，预设浅色。

## 操作惯例

- 每个 journey 都从基准状态开始，除非档案的 Preconditions 另外写明。会写入的 journey 之后，基准状态就不成立了：要再跑别的 journey 就先 `down` 再 `up`。
- 用 ARIA role + 名称或 label 找元素，不用 CSS class 或位置。
- Select / dropdown 的选项在 portal 里，用 `page.getByRole('option')` 或 `page.getByRole('menuitemradio')`。
- 搜索有 200ms debounce，筛选会换网址再等资料：等画面上的结果（句数、某句出现 / 消失），不要固定 sleep。

## 证明与跳过

- 每个关键动作前后各 `shot()` 一次，不只最后一张。
- 写入要有第二个视角：`api('/api/quotes')` 读回，或 `page.reload()` 之后还在。
- `report.json` 是 `PASS` 才算通过；console error 也算失败。
- 跑不到的入口要回报：试了什么、缺了什么前提。不要用另一个入口代替说已经验证过。

## 功能档案的格式

每个档案：H1 标题 + 一段使用者看得到的行为，接着依序四个 H2：

1. `Sub-features`：短 ID + 一行说明。
2. `How to get to it (user POV)`：所有使用者入口。
3. `Driving it with lines.mjs drive`：先写 `Preconditions:`，再用粗体标签逐条写「使用者动作 → locator 与操作 → 看得到的结果」。
4. `Gotchas`：会浪费时间或让验证失效的陷阱。

## 功能

- [阅览列表与详细](./browse.md)：row / grid 列表、点一句看详细、主题切换。
- [筛选](./filter.md)：按出处、按标签、组合筛选与清除。
- [搜索](./search.md)：用关键字找句子内容与说话人，着重号标出命中、没有结果的画面。
- [新增名句](./create-quote.md)：dialog 表单、验证错误、选已有或当场新增出处、标签、取消。
- [编辑与删除名句](./edit-delete-quote.md)：右栏编辑、储存、取消、两段式删除。
