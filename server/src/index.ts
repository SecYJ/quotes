import { Hono } from 'hono'

const app = new Hono<{ Bindings: Env }>().basePath('/api')

const routes = app.get('/health', (c) => {
  return c.json({ ok: true, time: new Date().toISOString() })
})

export type AppType = typeof routes

export default app
