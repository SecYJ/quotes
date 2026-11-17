import { ALL, Q, expect, params, quote, shown, test } from '@e2e/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})

test('B-01 点索引的标签：只剩有这个标签的名句', async ({ page }) => {
    const tag = page.locator('.index a[data-filter-tag="职场"]')
    await tag.click()
    await expect(shown(page)).toHaveText([Q.A, Q.B])
    expect(params(page).get('tag')).toBe('职场')
    await expect(tag).toHaveAttribute('aria-current')
    await expect(page.locator('.index a[data-filter-tag=""]')).not.toHaveAttribute('aria-current')
    await expect(page.locator('.status-text')).toHaveText('标签：职场 · 2 句')
})

test('B-02 再点同一个标签：取消筛选', async ({ page }) => {
    const tag = page.locator('.index a[data-filter-tag="职场"]')
    await tag.click()
    await tag.click()
    await expect(shown(page)).toHaveText(ALL)
    expect(new URL(page.url()).search).toBe('')
})

test('B-03 点名句上的标签：筛选并重新分配头条与侧栏', async ({ page }) => {
    await quote(page, Q.D).locator('.tags a', { hasText: '爱情' }).click()
    await expect(shown(page)).toHaveText([Q.D, Q.E])
    await expect(page.locator('.lead .content')).toHaveText([Q.D])
    await expect(page.locator('.side .quote:not([hidden]) .content')).toHaveText([Q.E])
    await expect(page.locator('.rest')).toBeHidden()
})

test('B-04 直接打开带标签的网址', async ({ page }) => {
    await page.goto('/?tag=爱情')
    await expect(shown(page)).toHaveText([Q.D, Q.E])
    await expect(page.locator('.index a[data-filter-tag="爱情"]')).toHaveAttribute('aria-current')
})

test('B-05 不存在的标签：显示空状态', async ({ page }) => {
    await page.goto('/?tag=不存在')
    await expect(shown(page)).toHaveCount(0)
    await expect(page.locator('.empty')).toBeVisible()
})

test('C-01 点名句上的出处：只剩这个出处的名句', async ({ page }) => {
    await quote(page, Q.D).locator('.source-link').click()
    await expect(shown(page)).toHaveText([Q.D, Q.E])
    expect(params(page).get('source')).toBe('hamlet')
    await expect(page.locator('.status-text')).toHaveText('出处：《哈姆雷特》 · 2 句')
})

test('C-02 再点同一个出处：取消筛选', async ({ page }) => {
    await quote(page, Q.D).locator('.source-link').click()
    await quote(page, Q.D).locator('.source-link').click()
    await expect(shown(page)).toHaveText(ALL)
})

test('C-03 出处与标签一起筛选', async ({ page }) => {
    await page.locator('.index a[data-filter-tag="人生"]').click()
    await expect(shown(page)).toHaveText([Q.B, Q.C, Q.D])
    await quote(page, Q.B).locator('.source-link').click()
    await expect(shown(page)).toHaveText([Q.B])
    expect(params(page).get('tag')).toBe('人生')
    expect(params(page).get('source')).toBe('chat')
    await expect(page.locator('.status-text')).toHaveText('出处：朋友聊天 · 标签：人生 · 1 句')
})

test('C-05 按住 Ctrl 点出处：不改目前页面的筛选', async ({ page }) => {
    await quote(page, Q.D)
        .locator('.source-link')
        .click({ modifiers: ['ControlOrMeta'] })
    await expect(shown(page)).toHaveText(ALL)
    expect(new URL(page.url()).search).toBe('')
})
