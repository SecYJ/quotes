import { ALL, Q, expect, quote, shown, test } from '@e2e/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})

test('A-01 所有名句都显示，最新的在前', async ({ page }) => {
    await expect(shown(page)).toHaveText(ALL)
})

test('A-02 头条一句、侧栏三句、其余在下方', async ({ page }) => {
    await expect(page.locator('.lead .content')).toHaveText([Q.A])
    await expect(page.locator('.side .content')).toHaveText([Q.B, Q.C, Q.D])
    await expect(page.locator('.rest .content')).toHaveText([Q.E, Q.F])
})

test('A-03 刊头写出句数、出处数与最后写下的日期', async ({ page }) => {
    const dateline = page.locator('.dateline')
    await expect(dateline).toContainText('6 句 · 4 个出处')
    await expect(dateline).toContainText('最后写下 2026 年 11 月 1 日')
})

test('A-04 名句显示说话人、出处、出处细节、笔记与日期', async ({ page }) => {
    const d = quote(page, Q.D)
    await expect(d.locator('.speaker')).toHaveText('哈姆雷特')
    await expect(d.locator('.source-link')).toHaveText('《哈姆雷特》')
    await expect(d.locator('.detail')).toHaveText('第三幕第一场')
    await expect(d.locator('.note')).toHaveText('每次犹豫的时候都会想起这句')
    await expect(d.locator('.day')).toHaveText('9月1日')
    await expect(d.locator('.year')).toHaveText('2026')
    await expect(d.locator('.tags a')).toHaveText(['人生', '爱情'])
    await expect(quote(page, Q.C).locator('.source-link')).toHaveText('《瓦尔登湖》')
})

test('A-05 现实生活与其他不加书名号；没有说话人就没有分隔点', async ({ page }) => {
    const a = quote(page, Q.A)
    await expect(a.locator('.source-link')).toHaveText('朋友聊天')
    await expect(quote(page, Q.F).locator('.source-link')).toHaveText('网络段子')
    await expect(a.locator('.speaker')).toHaveCount(0)
    await expect(a.locator('.sep')).toHaveCount(0)
    await expect(a.locator('.note')).toHaveCount(0)
})

test('A-06 索引的标签按句数排列，没有出处清单', async ({ page }) => {
    const tags = page.locator('.index a[data-filter-tag]')
    const names = await tags.evaluateAll((els) => els.map((a) => a.getAttribute('data-filter-tag')))
    expect(names).toEqual(['', '人生', '职场', '爱情', '自然', '俏皮'])
    await expect(page.locator('.index .count')).toHaveText(['3', '2', '2', '1', '1'])
    await expect(tags.first()).toHaveText('全部')
    await expect(tags.first()).toHaveAttribute('aria-current')
    await expect(page.locator('.index [data-filter-source]')).toHaveCount(0)
})

test('A-07 没筛选时状态列隐藏', async ({ page }) => {
    await expect(page.locator('.status')).toBeHidden()
})
