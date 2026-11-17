import { test as base, expect, type Page } from '@playwright/test'

// 测试资料（fixtures/sources）的名句内容，按 added 由新到旧
export const Q = {
    A: '周一的会议永远开不完',
    B: '下班才是正经事',
    C: '我愿意深深地扎入生活',
    D: '生存还是毁灭，这是一个值得考虑的问题',
    E: '脆弱啊，你的名字是女人',
    F: '人生不会在低谷，只要你到了曼谷',
}
export const ALL = Object.values(Q)

// 每个测试结束时都不能有 console error 或 pageerror
export const test = base.extend<{ pageErrors: void }>({
    pageErrors: [
        async ({ page }, use) => {
            const errors: string[] = []
            page.on('pageerror', (e) => errors.push(e.message))
            page.on('console', (m) => {
                if (m.type() === 'error') errors.push(m.text())
            })
            await use()
            expect(errors, 'console error / pageerror').toEqual([])
        },
        { auto: true },
    ],
})

export { expect }

export function shown(page: Page) {
    return page.locator('.quote:not([hidden]) .content')
}

export function quote(page: Page, content: string) {
    return page.locator('.quote', { has: page.locator('.content', { hasText: content }) })
}

export function params(page: Page) {
    return new URL(page.url()).searchParams
}
