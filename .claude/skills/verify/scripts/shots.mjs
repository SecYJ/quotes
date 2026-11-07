// 驱动 build 好的 Lines（pnpm build && pnpm preview），检查行为并截图到 tmp/verify/<时间>/
// 用法：node .claude/skills/verify/scripts/shots.mjs [baseURL]
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:4321/'
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
const out = `tmp/verify/${stamp}`
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const failures = []
const errors = []

function check(name, ok, detail = '') {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
    if (!ok) failures.push(name)
}

async function open(name, width, height, path = '') {
    const page = await browser.newPage({ viewport: { width, height } })
    page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`))
    page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`))
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    return page
}

async function shot(page, name, fullPage = false) {
    await page.waitForTimeout(600)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    check(`${name}: 没有横向捲动`, overflow <= 0, `${overflow}px`)
    await page.screenshot({ path: `${out}/${name}.png`, fullPage })
}

function visible(page) {
    return page.locator('.quote:not([hidden])').count()
}

// 画面大小
for (const [name, w, h] of [
    ['mobile', 390, 844],
    ['tablet', 820, 1180],
    ['desktop', 1440, 900],
    ['ultrawide', 3440, 1440],
]) {
    const page = await open(name, w, h)
    await shot(page, name, name === 'desktop' || name === 'mobile')
    await page.close()
}

// 行为
const page = await open('behavior', 1440, 900)
const total = await page.locator('.quote').count()
check('载入：所有名句都显示', (await visible(page)) === total, `${total} 句`)
check('载入：头条只有一句', (await page.locator('.lead .quote').count()) === 1)

await page.locator('.index a[data-filter-tag]').nth(1).click()
const tag = await page
    .locator('.index a[data-filter-tag][aria-current]')
    .getAttribute('data-filter-tag')
const tagged = await visible(page)
check('标签筛选：网址带 tag', new URL(page.url()).searchParams.get('tag') === tag, page.url())
check('标签筛选：只剩有这个标签的句子', tagged > 0 && tagged < total, `${tagged} 句`)
await shot(page, 'filter-tag')

await page.locator('.index a[data-filter-source]').nth(1).click()
const combo = await visible(page)
check('出处 + 标签：结果不多于只筛标签', combo <= tagged, `${combo} 句`)
check('出处 + 标签：网址两个都有', /source=.*tag=|tag=.*source=/.test(page.url()), page.url())

await page.goBack()
check('上一页：回到只筛标签', (await visible(page)) === tagged)

await page.locator('.status .clear').click()
check('清除筛选：全部回来', (await visible(page)) === total)

const speaker = (await page.locator('.speaker').first().textContent()).trim()
await page.fill('#q', speaker)
const hits = await visible(page)
check('搜索说话人：有结果', hits > 0, `「${speaker}」${hits} 句`)
check('搜索：命中的字有标记', (await page.locator('.quote:not([hidden]) mark').count()) >= hits)
check('搜索：网址带 q', new URL(page.url()).searchParams.get('q') === speaker)
await shot(page, 'search')

await page.fill('#q', 'zzzz-no-match')
check('没有结果：显示空状态', await page.locator('.empty').isVisible())
await shot(page, 'empty')
await page.close()

// 分享的网址直接打开
const shared = await open('shared-url', 390, 844, `?tag=${encodeURIComponent(tag)}`)
check('打开带筛选的网址：直接套用', (await visible(shared)) === tagged)
check('手机：有筛选时展开出处与标签', await shared.locator('.index-panel').evaluate((d) => d.open))
await shot(shared, 'mobile-shared-url')
await shared.close()

const phone = await open('mobile-default', 390, 844)
check(
    '手机：没筛选时收起出处与标签',
    !(await phone.locator('.index-panel').evaluate((d) => d.open)),
)
await phone.close()

check('没有 console error / page error', errors.length === 0, errors.join(' | '))
await browser.close()
console.log(`\n截图：${out}`)
console.log(failures.length ? `FAIL（${failures.length} 项）` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
