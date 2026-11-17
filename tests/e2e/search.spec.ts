import { ALL, Q, expect, params, quote, shown, test } from '@e2e/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})

test('D-01 搜索内容：命中的字有标记，网址带 q', async ({ page }) => {
    await page.fill('#q', '毁灭')
    await expect(shown(page)).toHaveText([Q.D])
    await expect(quote(page, Q.D).locator('.content mark')).toHaveText(['毁灭'])
    expect(params(page).get('q')).toBe('毁灭')
})

test('D-02 搜索说话人：说话人与出处名称都有标记', async ({ page }) => {
    await page.fill('#q', '哈姆雷特')
    await expect(shown(page)).toHaveText([Q.D, Q.E])
    for (const content of [Q.D, Q.E]) {
        const q = quote(page, content)
        await expect(q.locator('.speaker mark')).toHaveText(['哈姆雷特'])
        await expect(q.locator('.source-link mark')).toHaveText(['哈姆雷特'])
    }
})

test('D-03 搜索出处名称', async ({ page }) => {
    await page.fill('#q', '瓦尔登')
    await expect(shown(page)).toHaveText([Q.C])
    await expect(quote(page, Q.C).locator('.source-link mark')).toHaveText(['瓦尔登'])
})

test('D-04 搜索不含标签：只是标签的字没有结果', async ({ page }) => {
    await page.fill('#q', '自然')
    await expect(shown(page)).toHaveCount(0)
    await expect(page.locator('.empty')).toBeVisible()
    await expect(page.locator('.empty .clear')).toBeVisible()
})

test('D-05 搜索与标签一起生效', async ({ page }) => {
    await page.fill('#q', '哈姆雷特')
    await page.locator('.index a[data-filter-tag="人生"]').click()
    await expect(shown(page)).toHaveText([Q.D])
})

test('D-06 清空搜索框：全部回来，标记消失', async ({ page }) => {
    await page.fill('#q', '毁灭')
    await expect(shown(page)).toHaveText([Q.D])
    await page.fill('#q', '')
    await expect(shown(page)).toHaveText(ALL)
    await expect(page.locator('mark')).toHaveCount(0)
    expect(params(page).has('q')).toBe(false)
})

test('D-07 在搜索框按 Enter 不会重新载入页面', async ({ page }) => {
    await page.evaluate(() => Object.assign(window, { notReloaded: true }))
    await page.fill('#q', '毁灭')
    await page.press('#q', 'Enter')
    await expect(shown(page)).toHaveText([Q.D])
    expect(await page.evaluate(() => 'notReloaded' in window)).toBe(true)
    expect(params(page).get('q')).toBe('毁灭')
})

test('D-08 搜索字前后的空白不算', async ({ page }) => {
    await page.fill('#q', '  毁灭  ')
    await expect(shown(page)).toHaveText([Q.D])
    expect(params(page).get('q')).toBe('毁灭')
})
