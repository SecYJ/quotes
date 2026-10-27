import { defineConfig } from 'drizzle-kit'

// drizzle-kit 只负责产生 migration SQL，不连数据库；套用由 wrangler d1 migrations apply 负责
export default defineConfig({
    dialect: 'sqlite',
    schema: './src/db/schema.ts',
    out: './drizzle',
    // 要和 src/db/index.ts 的 drizzle() 一致
    casing: 'snake_case',
})
