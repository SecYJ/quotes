// 驱动 build 好的拾句（pnpm build && pnpm preview），在四种画面大小截图到 tmp/verify/<时间>/
// 行为的检查在 tests/e2e（pnpm test:e2e）；这里只看真实资料的外观、横向捲动与 console error
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

const probe = await open('probe', 1440, 900)
const firstTag = await probe
    .locator('.index a[data-filter-tag]')
    .nth(1)
    .getAttribute('data-filter-tag')
const firstWord = (await probe.locator('.content').first().textContent()).trim().slice(0, 3)
await probe.close()

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

// 筛选、搜索、空状态各截一张（行为对不对由 tests/e2e 负责）
for (const [name, path] of [
    ['filter-tag', `?tag=${encodeURIComponent(firstTag)}`],
    ['search', `?q=${encodeURIComponent(firstWord)}`],
    ['empty', `?q=${encodeURIComponent('没有这句话')}`],
]) {
    const page = await open(name, 1440, 900, path)
    await shot(page, name)
    await page.close()
}

check('没有 console error / page error', errors.length === 0, errors.join(' | '))
await browser.close()
console.log(`\n截图：${out}`)
console.log(failures.length ? `FAIL（${failures.length} 项）` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
