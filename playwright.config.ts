import { defineConfig, devices } from '@playwright/test'

const PORT = 4391

export default defineConfig({
    testDir: 'tests/e2e',
    outputDir: 'tmp/e2e/results',
    fullyParallel: true,
    reporter: [['list'], ['html', { outputFolder: 'tmp/e2e/report', open: 'never' }]],
    use: { baseURL: `http://localhost:${PORT}/`, trace: 'retain-on-failure' },
    projects: [
        {
            name: 'desktop',
            testIgnore: /mobile\.spec\.ts/,
            use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
        },
        {
            name: 'mobile',
            testMatch: /mobile\.spec\.ts/,
            use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
        },
    ],
    // 用 tests/e2e/fixtures 的测试资料另外 build 一份，不动真实资料的 dist/
    webServer: {
        command: `pnpm exec astro build --outDir dist-e2e && pnpm exec astro preview --outDir dist-e2e --port ${PORT} --ignore-lock`,
        env: { LINES_SOURCES: 'tests/e2e/fixtures/sources' },
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: false,
    },
})
