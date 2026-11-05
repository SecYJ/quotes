# 新增名句

站长按「新增名句」打开 dialog，填句子内容、说话人、出处（选已有的或当场新增）、出处细节、标签、笔记后储存；新名句出现在列表最上面，侧栏的出处与标签句数跟着更新。必填栏位没填时显示错误、不送出；取消或 `Esc` 关闭后下次打开是空白表单。

## Sub-features

- `create-open` 按钮打开 dialog，焦点在「句子内容」。
- `create-validation` 空白储存显示「请输入句子内容」「请选择出处」；新增出处模式下名称空白显示「请输入出处名称」。
- `create-existing-source` 选已有出处储存。
- `create-new-source` 「＋ 新增出处」切换成类型 + 名称，储存时一起建立出处。
- `create-tags` 输入新标签按 Enter、点已有标签的建议按钮、移除标签。
- `create-cancel` 「取消」或 `Escape` 关闭，不写入；点 dialog 外面不会关。

## How to get to it (user POV)

- 列表右上角的「新增名句」按钮。

## Driving it with lines.mjs drive

Preconditions:

- 基准状态，或至少 doctor 显示写入 bypass「有」。
- 内容用带时间戳的字串（例如 `验证用的一句话 ${Date.now()}`），重复跑也不会撞到旧资料。

- **打开。** 点 `getByRole('button', { name: '新增名句' })`。`getByRole('dialog', { name: '新增名句' })` 可见，`getByLabel('句子内容')` 有焦点。
- **验证错误。** 直接点 dialog 里的 `储存`。看到「请输入句子内容」与「请选择出处」；`api('/api/quotes')` 长度不变。
- **填表。** `getByLabel('句子内容').fill(...)`、`getByLabel('谁说的').fill('验证员')`。
- **当场新增出处。** 点 `getByRole('combobox', { name: '出处' })` → `page.getByRole('option', { name: '＋ 新增出处' })`；点 `combobox` `'出处类型'` → `option` `'书'`；`getByLabel('新增出处').fill('验证用的书')`。（选已有出处则直接选 `option` `'哈姆雷特'`。）
- **标签。** `getByLabel('标签').fill('验证标签')` 再 `press('Enter')`；点建议按钮 `'+ 人生'`。出现 `'移除标签 验证标签'` 与 `'移除标签 人生'`。
- **储存。** 点 `储存`。dialog 消失；句数变成 13；列表有这一句；侧栏出现 `验证用的书 1` 与 `#验证标签 1`。
- **第二个视角。** `api('/api/quotes')` 找到这一句：`speaker`、`source.type === 'book'`、`source.title`、`sourceDetail`、两个标签都对；`page.reload()` 后列表仍有这一句。
- **取消。** 再开 dialog，填一些字，按 `取消`（另一次用 `Escape`）。dialog 关闭、句数不变；再打开时「句子内容」是空的。
- **证据。** 验证错误、填好的表单、储存后的列表各 `shot()`。

## Gotchas

- 出处与类型的选项在 portal 里，用 `page.getByRole('option')`，`dialog.getByRole('option')` 找不到。
- 表单不要求至少一个标签：没有标签也能储存成功（`GLOSSARY.md` 说每句至少一个标签，这是目前跟用语表不一致的地方，不要把「没标签就挡下」当成预期结果）。
- 标签输入框失焦时会把还没按 Enter 的字也加成标签。
- 新增出处后如果储存名句失败，表单会自动切回「选已有出处」并选好刚建立的出处，重试不会重复建立。
- 这个 journey 会写入 D1：之后要跑依赖 12 句的 journey（例如 `smoke.mjs`）先 `down` 再 `up`。
