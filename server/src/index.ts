import { Hono } from 'hono'

import { adminRoutes } from '#/routes/admin'
import { publicRoutes } from '#/routes/public'

const app = new Hono<{ Bindings: Env }>().basePath('/api')

// 路由要串起来写，AppType 才推导得到每一条路由的类型
const routes = app
    .get('/health', (c) => {
        return c.json({ ok: true, time: new Date().toISOString() })
    })
    .route('/', publicRoutes)
    .route('/admin', adminRoutes)

// 没处理到的错误：记 log，回传不含细节的 500
app.onError((err, c) => {
    console.error(err)
    return c.json({ error: '服务器错误' }, 500)
})

export type AppType = typeof routes

export default app
