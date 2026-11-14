import { defineConfig } from 'astro/config'

export default defineConfig({
    // 脚本与字体一律输出成独立档案、不内嵌进 HTML / CSS，
    // public/_headers 的 CSP 才能只写 script-src 'self'、font-src 'self'，不必每次改脚本就换 hash
    vite: { build: { assetsInlineLimit: 0 } },
})
