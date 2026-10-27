import { drizzle } from 'drizzle-orm/d1'

import * as schema from '#/db/schema'

export function createDb(d1: D1Database) {
    // 要和 drizzle.config.ts 的 casing 一致
    return drizzle(d1, { schema, casing: 'snake_case' })
}
