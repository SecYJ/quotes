# 筛选

访客在左栏点一个出处或一个标签，中间列表只留下符合的名句；出处与标签可以同时选，再点一次已选的项目取消，「清除筛选」或「全部名句」回到全部。筛选条件存在网址里。

## Sub-features

- `filter-source` 点出处只显示该出处的名句。
- `filter-tag` 点标签只显示有该标签的名句。
- `filter-combined` 出处 + 标签同时生效（交集）。
- `filter-toggle` 再点一次已选的出处 / 标签就取消。
- `filter-clear` 「清除筛选」与「全部名句」都清掉所有条件（包括搜索字）。
- `filter-url` 直接打开带 `?sourceId=&tagId=` 的网址得到同样结果。

## How to get to it (user POV)

- 左栏「出处」下的出处按钮（依出处类型分组，按钮名称是「出处名 句数」）。
- 左栏「标签」下的标签按钮（「#标签名 句数」）。
- 有筛选时出现的「清除筛选」，以及最上面的「全部名句 12」。
- 网址 `/?sourceId=7&tagId=1`。

## Driving it with lines.mjs drive

Preconditions:

- 基准状态。朋友聊天是 source 7（3 句），人生是 tag 1（6 句），勇气是 tag 6。

- **按出处。** 点 `getByRole('button', { name: '朋友聊天 3' })`。`getByText('3 句', { exact: true })`；网址含 `sourceId=7`；三句都是「朋友聊天」。
- **加上标签。** 再点 `getByRole('button', { name: '#人生 6' })`。显示 `2 句`（id 9「累的时候就休息…」与 id 12「时间不会让事情变好…」）；网址同时有 `sourceId=7` 与 `tagId=1`。
- **取消标签。** 再点一次 `#人生 6`。回到 `3 句`，网址没有 `tagId`。
- **清除。** 点 `getByRole('button', { name: '清除筛选' })`。回到 `12 句`，网址没有 search params，「清除筛选」消失。
- **网址入口。** `page.goto('/?sourceId=4')`。显示 `2 句`（论语两句），侧栏「论语 2」是选中样式。
- **没有结果。** `page.goto('/?sourceId=1&tagId=3')`（哈姆雷特 × 爱情）。显示 `0 句` 与「没有符合的名句。」。
- **证据。** 每一步 `shot()`；最后用 `api('/api/quotes?sourceId=7&tagId=1')` 读回长度 2，跟画面一致。

## Gotchas

- 侧栏的句数永远是全部名句的统计，不会随筛选改变；断言列表上方的「N 句」。
- 按钮名称包含句数（`'朋友聊天 3'`），新增或删除名句后名称就变了，用 regex `/^朋友聊天 \d+$/` 比较稳。
- 筛选会把网址换掉（replace），不会多一笔历史纪录；不要用上一页测取消。
- 管理页 `/admin` 的名句分页用同一套侧栏、搜索与 search params（`?sourceId=&tagId=&q=`），筛选后网址留在 `/admin?...`，不会跳回 `/`。
- 不合法的参数（`?sourceId=abc`、`0`、负数）会被忽略，当成没有筛选。
