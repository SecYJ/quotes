---
name: 拾句
description: 夜里的摘抄本：深墨蓝的一页日记本，一盏灯的琥珀色
colors:
    night-ground: '#14161a'
    page-ink: '#ece6d8'
    soft-ink: '#c9c3b6'
    pencil: '#8f8a7e'
    ruling: '#2a2e35'
    lamp: '#e0a84e'
typography:
    title:
        fontFamily: "'LXGW WenKai Screen', 'Kaiti SC', 'KaiTi', serif"
        fontSize: '2.5rem'
        fontWeight: 700
        lineHeight: 1.1
    lead-quote:
        fontFamily: "'LXGW WenKai Screen', 'Kaiti SC', 'KaiTi', serif"
        fontSize: 'clamp(2rem, 1.3rem + 2.6vw, 3.25rem)'
        fontWeight: 400
        lineHeight: 1.55
    quote:
        fontFamily: "'LXGW WenKai Screen', 'Kaiti SC', 'KaiTi', serif"
        fontSize: '1.375rem'
        fontWeight: 400
        lineHeight: 1.75
    index:
        fontFamily: "'LXGW WenKai Screen', 'Kaiti SC', 'KaiTi', serif"
        fontSize: '1.0625rem'
        fontWeight: 400
        lineHeight: 1.6
    body:
        fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif"
        fontSize: '0.875rem'
        fontWeight: 400
        lineHeight: 1.7
    label:
        fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif"
        fontSize: '0.75rem'
        fontWeight: 400
        lineHeight: 1.6
        fontFeature: '"tnum"'
rounded:
    none: '0'
    mark: '2px'
    round: '50%'
spacing:
    gutter: 'clamp(1.125rem, 4vw, 4rem)'
    margin: '4.5rem'
    margin-gap: '2.25rem'
    item: '1.375rem'
components:
    index-link:
        textColor: '{colors.soft-ink}'
        typography: '{typography.index}'
    index-link-active:
        textColor: '{colors.lamp}'
        typography: '{typography.index}'
    search-field:
        backgroundColor: 'transparent'
        textColor: '{colors.page-ink}'
        rounded: '{rounded.none}'
        padding: '0.5rem 0'
    copy-button:
        textColor: '{colors.pencil}'
        rounded: '{rounded.round}'
        size: '2rem'
    copy-button-done:
        textColor: '{colors.lamp}'
        rounded: '{rounded.round}'
        size: '2rem'
---

# Design System: 拾句

## Overview

**Creative North Star: "The Night Notebook"（夜里的摘抄本）**

拾句排成一页夜里摊开的日记本：左边页边写日期，一条页边线，右边是一句一句抄下来的话，上方有一盏灯。个性来自这三样东西（页边、页边线、灯），句子本身用清楚的手写楷体，安静地排下去。

深色是因为使用情境：晚上看完剧、刷完短视频、读完书，在床上用手机或在桌前回来翻。底色是带一点蓝的墨色，不是纯黑；从不出现纯白底。

**Key Characteristics:**

- 一句名句是日记里的一条：日期写在页边，句子在页边线右边。
- 灯钉在视窗上方不动，句子从灯下卷过去；最新一句最大，正好在灯下。
- 句与句之间没有横线，靠页边的日期和留白分开。
- 层次靠字级（最新一句 → 接着三句 → 其余）与颜色的明暗，不靠卡片、底色块或阴影。
- 标签排成本子的目录：名称、点线、句数。出处不列在目录里，从名句上的出处连结筛选。

## Colors

一个墨蓝底、三阶暖白的字、一条线色，加上一盏灯的琥珀色。

- **Night Ground `#14161a`**：整页底色，也是 `theme-color`。
- **Page Ink `#ece6d8`**：句子、站名、说话人。
- **Soft Ink `#c9c3b6`**：出处、笔记、目录里的标签、页边的月日、状态列。
- **Pencil `#8f8a7e`**：出处细节、句数、年份、名句下的标签、复制图标。对底色约 5.3:1，小字也可读。
- **Ruling `#2a2e35`**：搜索框底线、出处连结的底线、目录的点线、捲轴。
- **Lamp `#e0a84e`**：灯。见下面的规则。

**The Lamp Rule.** 琥珀色只照在「现在在这里」和「刚刚发生」的东西上：目前的筛选、搜索命中的字（淡底）、复制成功的图标、「清除筛选」、笔记左边的竖线、页边线（很淡）、副标题、以及焦点框、文字选取与光标。名句下的标签、出处、日期都不是琥珀色；要强调就用字级或明暗。

页面上方那片光用的也是这个颜色（13% → 4% → 透明的椭圆渐层），整页还盖着一层很淡的纸纹。这两层是固定在视窗上的，不随页面卷动。

## Typography

- **霞鹜文楷屏幕阅读版（LXGW WenKai Screen，自托管，依 unicode-range 切片下载）** 负责站名、所有句子、笔记与目录里的标签。站名 700，其余 400。
- **系统黑体** 负责日期、出处、句数、名句下的标签；数字一律 `tabular-nums` 对齐。
- 字级：站名 2.5rem → 最新一句 2–3.25rem → 接着三句 1.5625rem → 一般句子 1.375rem → 目录 1.0625rem → 出处 0.875rem → 标注 0.6875–0.8125rem。
- 最新一句只在标点后换行（`word-break: keep-all` 加 `text-wrap: balance`），一个分句一行；分句比栏宽还长时才从中间断。其余句子 `text-wrap: pretty`。
- 中文不用斜体；笔记用左边一条琥珀色竖线与较暗的字色区分。

## Layout

- 页面最宽 92rem，左右留 `clamp(1.125rem, 4vw, 4rem)`。
- 窄于 48rem（手机）：单栏。站名与副标题一行，下面是句数、搜索、收成 `<details>` 的「标签」（两栏排列；没有标签筛选时预设收起，让最新那句留在第一屏）。没有页边，日期变成句子上面的一行。
- 48rem 以上：左边一条 13.5rem 的目录栏（sticky），右边是本子。本子里每句名句是两栏的 grid：4.5rem 的页边（日期靠右、与句子第一行的基线对齐），隔 2.25rem，接句子；页边线画在这段空隙的正中，从第一句一直到最后一句。句子栏最宽 44rem。
- 带鱼屏：140rem 以上根字级 125%，200rem 以上 150%，整页等比放大而不是只多留白（目标 3440×1440）。

## Elevation & Depth

没有阴影、没有卡片。深度只有一处：上方那盏灯的光，加一层纸纹。除此之外是平的，分组靠留白与页边线。

## Shapes

直角为主。输入框只有一条底线，聚焦时变琥珀色。圆的只有复制按钮（2rem 的圆，只在悬停与成功时有底色）；搜索命中的淡底与焦点框有 2px 圆角。

## Components

- **站名**：`拾句`，副标题「夜里的摘抄本」（琥珀色），下面两行灰字：句数与出处数、最后写下的日期。
- **搜索**：一条底线的输入框，搜句子、说话人与出处。
- **标签目录**：「全部」加每个标签一行，名称、点线、句数；目前的筛选是琥珀色，它的点线也跟着变成琥珀色。再点一次已选的标签会取消它。
- **状态列**：有筛选或搜索时出现，写出目前条件与句数，附「清除筛选」。
- **名句**：页边的日期（月日，下面小字年份）→ 句子 → `—— 说话人 · 出处 出处细节`（戏剧与书加书名号；出处有淡底线，是筛选连结）→ 笔记 → `#标签`（筛选连结）与复制图标。
- **复制图标**：只有图标，没有字，`aria-label` 是「复制这句名句」。只复制句子内容。成功时换成琥珀色的勾并垫一层淡琥珀底，1.6 秒后恢复；失败时换成叉。结果同时写进一个 `aria-live` 区域给读屏软件。
- **搜索命中**：命中的字垫一层 22% 的琥珀底，句子、说话人与出处都会标。
- **空状态**：「这本子里没有符合的句子。」加「清除筛选」。
- **动态**：最新一句换人时从模糊淡入（0.6s，`cubic-bezier(0.16, 1, 0.3, 1)`）；复制图标变色 0.15s。`prefers-reduced-motion` 时都关闭。

## Do's and Don'ts

- **Do** 把新的强调做成字级或明暗的差别。
- **Do** 维持每句名句都带出处；出处与标签永远可以点。
- **Do** 让灯和纸纹固定在视窗上，不跟着内容卷动。
- **Don't** 用纯白底或纯黑底。
- **Don't** 在句与句之间加横线、卡片、阴影或底色块。
- **Don't** 把琥珀色用在 The Lamp Rule 以外的地方，尤其不要给每句的标签上色。
- **Don't** 加第二盏灯或别的渐层。
- **Don't** 加 inline `<script>`、inline `style` 或外部来源的资源：`public/_headers` 的 CSP 只放行同源的脚本、样式与字体。
