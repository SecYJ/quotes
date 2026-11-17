import { readFileSync } from 'node:fs'
import { ALL, Q, expect, shown, test } from '@e2e/test'

// astro preview 不读 public/_headers，这里把正式环境的 CSP 加回回应里
const csp = readFileSync('public/_headers', 'utf8')
    .split('\n')
    .find((line) => line.trim().startsWith('Content-Security-Policy:'))!
    .split(':')
    .slice(1)
    .join(':')
    .trim()

test('H-01 在正式的 CSP 底下页面照常运作', async ({ page }) => {
    await page.route('**/*', async (route) => {
        const response = await route.fetch()
        await route.fulfill({
            response,
            headers: { ...response.headers(), 'content-security-policy': csp },
        })
    })
    await page.goto('/')
    await expect(shown(page)).toHaveText(ALL)
    await page.fill('#q', '毁灭')
    await expect(shown(page)).toHaveText([Q.D])
    const fontLoaded = await page.evaluate(async () => {
        await document.fonts.ready
        return [...document.fonts].some((f) => f.family.includes('LXGW') && f.status === 'loaded')
    })
    expect(fontLoaded, '自托管字体在 CSP 底下载入').toBe(true)
})
