import { Q, expect, quote, shown, test } from '@e2e/test'

test('G-01 没筛选时标签面板收起，头条在第一屏', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.index-panel')).not.toHaveAttribute('open')
    await expect(page.locator('.lead .quote')).toBeInViewport()
})

test('G-02 有标签筛选时面板展开', async ({ page }) => {
    await page.goto(`/?tag=${encodeURIComponent('职场')}`)
    await expect(page.locator('.index-panel')).toHaveAttribute('open')
})

test('G-03 展开面板点标签：筛选生效，没有横向捲动', async ({ page }) => {
    await page.goto('/')
    await page.locator('.index-panel summary').click()
    await page.locator('.index a[data-filter-tag="职场"]').click()
    await expect(shown(page)).toHaveText([Q.A, Q.B])
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
})

test('G-04 点名句上的出处后捲回索引', async ({ page }) => {
    await page.goto('/')
    // 测试资料很少，筛选后页面变短时浏览器自己就会捲回顶端；撑高页面才测得到捲动
    await page.evaluate(() => (document.body.style.paddingBottom = '300vh'))
    const f = quote(page, Q.F)
    await f.scrollIntoViewIfNeeded()
    await expect(page.locator('.index')).not.toBeInViewport()
    await f.locator('.source-link').click()
    await expect(shown(page)).toHaveText([Q.F])
    await expect(page.locator('.index')).toBeInViewport()
})
