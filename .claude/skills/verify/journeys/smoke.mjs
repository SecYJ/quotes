// 冒烟测试，也是写新 journey 的范本：阅览列表 → 点一句看详细 → 切 grid → 切深色
// 跑法：node .claude/skills/verify/scripts/lines.mjs drive .claude/skills/verify/journeys/smoke.mjs
export default async function ({ page, expect, shot, step, api }) {
    step('打开首页，列表是 seed 的 12 句')
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Lines' })).toBeVisible()
    await expect(page.getByText('12 句', { exact: true })).toBeVisible()
    await shot('list-row')

    step('点一句，右栏显示完整内容')
    await page.getByRole('button', { name: /生存还是毁灭/ }).click()
    await expect(page.getByRole('blockquote')).toContainText('生存还是毁灭')
    await expect(page.getByRole('button', { name: '编辑名句' })).toBeVisible()
    await expect(page.getByRole('button', { name: /生存还是毁灭/ })).toHaveAttribute(
        'aria-current',
        'true',
    )
    await shot('detail')

    step('切成 grid，偏好写进 localStorage')
    await page.getByRole('button', { name: '网格显示' }).click()
    await expect(page.getByRole('button', { name: '网格显示' })).toHaveAttribute(
        'aria-pressed',
        'true',
    )
    expect(await page.evaluate(() => localStorage.getItem('lines-view-mode'))).toBe('grid')
    await shot('list-grid')

    step('主题切成深色')
    await page.getByRole('button', { name: '切换主题' }).click()
    await page.getByRole('menuitemradio', { name: '深色' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    // 选完主题选单不会自己关
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toBeHidden()
    await shot('dark')

    step('API 也是 12 句（没被前面的操作改到）')
    expect((await api('/api/quotes')).length).toBe(12)
}
