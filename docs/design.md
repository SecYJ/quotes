---
name: Lines
description: 一个人的名句副刊：深色晚报版面，红色只做三件事
colors:
    newsprint-black: '#141312'
    bone-ink: '#e8e4dc'
    ash: '#9a948a'
    column-rule: '#3a3835'
    press-red: '#d6493f'
typography:
    masthead:
        fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif"
        fontSize: 'clamp(3rem, 1.6rem + 5vw, 6rem)'
        fontWeight: 900
        lineHeight: 0.95
        letterSpacing: '-0.02em'
    lead-quote:
        fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif"
        fontSize: 'clamp(1.875rem, 1.1rem + 2.6vw, 3.5rem)'
        fontWeight: 900
        lineHeight: 1.45
        letterSpacing: '-0.01em'
    quote:
        fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif"
        fontSize: '1.1875rem'
        fontWeight: 600
        lineHeight: 1.75
    body:
        fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif"
        fontSize: '0.9375rem'
        fontWeight: 400
        lineHeight: 1.7
    label:
        fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif"
        fontSize: '0.8125rem'
        fontWeight: 400
        lineHeight: 1.6
        fontFeature: '"tnum"'
rounded:
    none: '0'
spacing:
    gutter: 'clamp(1rem, 4vw, 6rem)'
    column-gap: 'clamp(1.5rem, 3vw, 3.5rem)'
    item: '1.25rem'
components:
    index-link:
        textColor: '{colors.bone-ink}'
        typography: '{typography.body}'
    index-link-active:
        textColor: '{colors.press-red}'
        typography: '{typography.body}'
    search-field:
        backgroundColor: '{colors.newsprint-black}'
        textColor: '{colors.bone-ink}'
        rounded: '{rounded.none}'
        padding: '0.5rem 0'
---

# Design System: Lines

## Overview

**Creative North Star: "The Evening Supplement"（晚报副刊）**

Lines 排成一份只为一个人的收藏印的晚报副刊：报头、日期行、标签索引、一则头条、几栏短稿。版面的个性全在框架上（报头、双线、栏线、索引），句子所在的阅读栏保持安静：清楚的宋体、足够的对比、合理的行长。

深色不是因为「看起来高级」，而是使用情境：晚上看完剧、读完书，在床上用手机或在桌前回来翻。纸色是暖的报纸黑，不是纯黑；从不出现纯白底。

**Key Characteristics:**

- 报头 `Lines.` 用最重的宋体，句点是唯一常驻的红色。
- 头条是最新（或筛选后第一句）名句，占约三分之二宽；侧栏接着三句；其余进下方分栏。
- 层次靠字重、字级与线（双线、细栏线），不靠卡片、底色块或阴影。
- 标签与搜索并列在索引列；出处会一直增加，不列在索引，从名句上的出处连结筛选。

## Colors

一个暖黑底、一个骨白墨色、一个灰阶、一条线色，加上一个被严格配给的印刷红。

- **Newsprint Black `#141312`**：整页底色，也是 `theme-color`。
- **Bone Ink `#e8e4dc`**：句子、报头、说话人、可点的索引项。
- **Ash `#9a948a`**：日期行、出处细节、笔记、计数、标签。对底色约 6:1，小字也可读。
- **Column Rule `#3a3835`**：栏线、条目分隔线、捲轴颜色。
- **Press Red `#d6493f`**：只做三件事 —— 报头句点、目前的筛选（索引里的 `aria-current`）、搜索命中的字（`mark`）。焦点框、文字选取与光标也用它，因为它们本来就是「现在在这里」的标记。

**The One Red Rule.** 红色是印刷时额外的一个色版，贵。除了上面列的地方，任何东西都不能是红的；需要强调就用字重或字级。

## Typography

- **宋体（Noto Serif SC，自托管，依 unicode-range 切片下载）** 负责报头与所有句子：报头 900、头条 900、其余句子 600。
- **系统黑体** 负责索引、日期行、出处、笔记与计数；数字一律 `tabular-nums` 对齐。
- 字级只有几阶：报头 → 头条 → 侧栏句子 1.25rem → 一般句子 1.1875rem → 介面 0.9375rem → 标注 0.75–0.8125rem。
- 头条 `text-wrap: pretty`，最长 24em；笔记最长 36rem。
- 中文不用斜体；笔记用「笔记」前缀与灰色区分。

## Layout

- 页面最宽 112rem，左右留 `--gutter`。
- 窄于 48rem（手机）：单栏；搜索在报头下，「标签」收成 `<details>`，没有标签筛选时预设收起，让最新那句留在第一屏。
- 48rem 以上：索引在左、搜索在右；头条与侧栏 2:1 并排，中间一条栏线；其余句子用 CSS columns（每栏至少 20rem）排在双线下方，栏间有细线。
- 侧栏没有句子时（筛选后只剩一句），头条占满整行，不留空栏。
- 带鱼屏：140rem 以上根字级 125%，200rem 以上 150%，整页等比放大而不是只多留白（目标 3440×1440）。

## Elevation & Depth

完全平面。没有阴影、没有卡片、没有底色块；分组只靠线：报头下与页尾是 4px 双线，区块之间 1px 栏线。

## Shapes

直角。输入框只有一条底线，聚焦时变红。唯一的圆角是焦点框的 1px。

## Components

- **报头**：左边 `Lines.`，右边日期行（「名句副刊」、最近更新日期、总句数），下方双线。
- **索引**：一行「标签」，每项附灰色计数；目前的筛选为红色粗体加 2px 底线。再点一次已选的项目会取消它。
- **状态列**：有筛选或搜索时出现，写出目前条件与句数，附「清除筛选」。
- **名句**：句子（宋体）→ 说话人 · 出处（戏剧与书加书名号）与出处细节 → 笔记 → 日期与 `#标签`。出处与标签都是筛选连结。
- **搜索命中**：命中的字变红并加底线，句子、说话人与出处都会标。
- **空状态**：「没有符合的名句。」加「清除筛选」。
- **动态**：只有一个 —— 头条换人时淡入并上移 0.5rem（0.5s，`cubic-bezier(0.16, 1, 0.3, 1)`）；`prefers-reduced-motion` 时关闭。

## Do's and Don'ts

- **Do** 把新的强调做成字重或字级的差别。
- **Do** 维持每句名句都带出处；出处与标签永远可以点。
- **Don't** 用纯白底或纯黑底。
- **Don't** 在句子上方放小标签（kicker / eyebrow），也不要给条目编号。
- **Don't** 加卡片、阴影、渐层或圆角块。
- **Don't** 让红色出现在上面三件事以外的地方。
