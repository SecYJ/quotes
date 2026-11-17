import { Q, expect, quote, test } from '@e2e/test'

test('F-01 复制只放内容，并告诉读屏软件', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    const button = quote(page, Q.D).locator('.copy')
    await button.click()
    await expect(button).toHaveAttribute('data-state', 'done')
    await expect(page.locator('[data-copy-status]')).toHaveText('已复制')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(Q.D)
})

test('F-02 过一下图标与朗读区恢复原状', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    const button = quote(page, Q.D).locator('.copy')
    await button.click()
    await expect(button).toHaveAttribute('data-state', 'done')
    await expect(button).not.toHaveAttribute('data-state')
    await expect(page.locator('[data-copy-status]')).toHaveText('')
})

test('F-03 剪贴板失败：显示复制失败', async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator.clipboard, 'writeText', {
            value: () => Promise.reject(new Error('denied')),
        })
    })
    await page.goto('/')
    const button = quote(page, Q.D).locator('.copy')
    await button.click()
    await expect(button).toHaveAttribute('data-state', 'failed')
    await expect(page.locator('[data-copy-status]')).toHaveText('复制失败')
})
