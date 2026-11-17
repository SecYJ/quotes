import { ALL, Q, expect, params, quote, shown, test } from '@e2e/test'

test('E-01 打开带三个条件的网址：直接套用', async ({ page }) => {
    await page.goto(
        `/?source=hamlet&tag=${encodeURIComponent('爱情')}&q=${encodeURIComponent('脆弱')}`,
    )
    await expect(shown(page)).toHaveText([Q.E])
    await expect(page.locator('#q')).toHaveValue('脆弱')
    await expect(page.locator('.status-text')).toHaveText(
        '出处：《哈姆雷特》 · 标签：爱情 · 搜索：「脆弱」 · 1 句',
    )
})

test('E-02 上一页一步步退回筛选', async ({ page }) => {
    await page.goto('/')
    await page.locator('.index a[data-filter-tag="人生"]').click()
    await expect(shown(page)).toHaveText([Q.B, Q.C, Q.D])
    await quote(page, Q.D).locator('.source-link').click()
    await expect(shown(page)).toHaveText([Q.D])
    await page.goBack()
    await expect(shown(page)).toHaveText([Q.B, Q.C, Q.D])
    expect(params(page).has('source')).toBe(false)
    await page.goBack()
    await expect(shown(page)).toHaveText(ALL)
})

test('E-03 打字搜索不新增历史纪录', async ({ page }) => {
    await page.goto('/')
    await page.locator('.index a[data-filter-tag="人生"]').click()
    await page.fill('#q', '毁灭')
    await expect(shown(page)).toHaveText([Q.D])
    await page.goBack()
    await expect(shown(page)).toHaveText(ALL)
    await expect(page.locator('#q')).toHaveValue('')
})

test('E-04 状态列的「清除筛选」', async ({ page }) => {
    await page.goto('/')
    await page.locator('.index a[data-filter-tag="职场"]').click()
    await page.fill('#q', '会议')
    await expect(shown(page)).toHaveText([Q.A])
    await page.locator('.status .clear').click()
    await expect(shown(page)).toHaveText(ALL)
    await expect(page.locator('#q')).toHaveValue('')
    expect(new URL(page.url()).search).toBe('')
})

test('E-05 空状态里的「清除筛选」', async ({ page }) => {
    await page.goto('/?tag=不存在')
    await page.locator('.empty .clear').click()
    await expect(shown(page)).toHaveText(ALL)
    await expect(page.locator('.empty')).toBeHidden()
})
