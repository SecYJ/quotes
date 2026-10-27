import { Hono } from 'hono'

import { createDb } from '#/db/index'
import { sources } from '#/db/schema'

const app = new Hono<{ Bindings: Env }>().basePath('/api')

const routes = app.get('/health', async (c) => {
    // 暂时：确认 Worker 读得到 D1，阶段 3 拿掉
    const sourceCount = await createDb(c.env.DB).$count(sources)
    return c.json({ ok: true, time: new Date().toISOString(), sourceCount })
})

export type AppType = typeof routes

export default app
