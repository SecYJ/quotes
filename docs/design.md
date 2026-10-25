# 视觉设计

Lines 是一本个人摘抄本。设计只在「句子本身」上用力，其他介面保持安静。

## 颜色

取自中国传统颜料，定义在 `client/src/index.css` 的 `:root` / `.dark`，组件只用语意化 token（见 [coding-style.md](./coding-style.md)）。

| 名称 | 浅色 | 深色 | token | 用在哪里 |
| --- | --- | --- | --- | --- |
| 月白 | `#edf1f0` | `#13191c` | `background` | 页面、左栏、中栏 |
| 素 | `#f8faf9` | `#1a2226` | `card` | 右栏、选中的句子、grid 卡片 |
| 墨 | `#1c2428` | `#dce4e6` | `foreground` | 正文 |
| 苍 | `#5f6d74` | `#93a1a7` | `muted-foreground` | 次要文字 |
| 石青 | `#2d5e89` | `#7fb0db` | `primary` | 可以点的东西、标签 |
| 藤黄 | `#c4901c` | `#e3b54a` | `marker` | **只用在记号**：书签、着重号 |

层次靠底色深浅（月白 → 素）区分，不用阴影。

## 字体

| 用途 | 字体 | class |
| --- | --- | --- |
| 名句（列表、详细、表单的句子栏）、标题 Lines | 霞鹜文楷（`@chinese-fonts/lxgwwenkai`，依字切片，只下载用到的字） | `font-quote` |
| 介面 | Geist（西文、数字）＋ 系统黑体（中文） | `font-sans`（预设） |

## 记号

都借用读书时的习惯，每个记号都代表一件事：

| 记号 | 意思 | 实作 |
| --- | --- | --- |
| 藤黄书签 | 目前选中的句子 | `QuoteMarks.tsx` 的 `Bookmark` |
| 着重号（字下的点） | 搜索命中的字 | `Highlight` ＋ `emphasis-dots` utility |
| 「」与悬挂引号 | 详细页的句子 | `QuoteDetail.tsx` |
| ——谁《哪里》 | 出处 | `Attribution` |

## 刻意避免

- 全大写、字距拉开的小标签；用 `·` 串起来的资讯行。
- 卡片阴影、渐层装饰。
- 到处都有的进场动画；只有回应操作的动态（例如选单展开）。

## 注意

- 着重号用 1em 宽的背景格子画点，因为 `text-emphasis` 的点大小无法调整。外层若有 `overflow: hidden`（例如 `line-clamp`），底部要留 `0.3em`，否则点会被切掉。
