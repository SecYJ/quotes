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

用 `verify` skill（`.claude/skills/verify/SKILL.md`），分两步：

1. `pnpm test:e2e`：E2E 测试。用 `tests/e2e/fixtures/` 的测试资料 build 一份，测筛选、搜索、上一页、分享网址、复制、手机面板与 CSP。案例清单在 `.scratch/e2e-tests/spec.md`，测试名称以案例 ID 开头。
2. `pnpm preview` 跑起真实资料 build 的网站，执行 `node .claude/skills/verify/scripts/shots.mjs`，在手机、平板、桌机、带鱼屏（3440×1440）与筛选、搜索、空状态各截一张图。

改了阅览页的行为就要有对应的测试：先在 spec 加案例，再写进 `tests/e2e/`。

看过截图再回报；改到外观时，对照 [design.md](./design.md)。

## 回报

说明两轮各跑了什么、结果如何。有失败或跳过的项目要明讲，附上错误讯息。
