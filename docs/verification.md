# 验证

每次修改完成后、回报完成前，依序做两轮检查。第一轮没过就先修，不进第二轮。

## 1. 静态检查（快速）

在项目根目录执行：

```sh
pnpm fmt         # 先格式化
pnpm lint        # oxlint
pnpm typecheck   # astro check
pnpm build       # 也会检查资料档的规则
pnpm knip        # 没用到的档案、export、套件
```

都要零错误。knip 报出没用到的东西就删掉；真的要留（例如只给脚本用的入口）就加进 `knip.json` 的 `entry`。lint 的 warning 也要看过，是这次改动造成的就修掉。

## 2. Playwright 浏览器测试

用 `verify` skill（`.claude/skills/verify/SKILL.md`）：`pnpm preview` 跑起 build 好的网站，再执行 `node .claude/skills/verify/scripts/shots.mjs`。它会检查筛选、搜索、上一页、分享网址与空状态，并在手机、平板、桌机、带鱼屏（3440×1440）各截一张图。

看过截图再回报；改到外观时，对照 [design.md](./design.md)。

## 回报

说明两轮各跑了什么、结果如何。有失败或跳过的项目要明讲，附上错误讯息。
