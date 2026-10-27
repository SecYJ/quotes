import { Hono } from 'hono'

import { createDb } from '#/db/index'
import {
    createQuote,
    createSource,
    deleteQuote,
    getQuote,
    quoteExists,
    sourceExists,
    updateQuote,
} from '#/db/quotes'
import { requireAccess } from '#/middleware/access'
import { idParam, quoteInput, sourceInput, validate } from '#/validation'

// 写入 API：挂在 /api/admin/*，Cloudflare Access 在边缘先挡一次，requireAccess 在 Worker 里再验一次

export const adminRoutes = new Hono<{ Bindings: Env }>()
    .use(requireAccess)
    .post('/quotes', validate('json', quoteInput), async (c) => {
        const db = createDb(c.env.DB)
        const input = c.req.valid('json')
        if (!(await sourceExists(db, input.sourceId))) {
            return c.json({ error: '出处不存在' }, 400)
        }
        const id = await createQuote(db, input)
        const quote = await getQuote(db, id)
        return c.json(quote, 201)
    })
    .put('/quotes/:id', validate('param', idParam), validate('json', quoteInput), async (c) => {
        const db = createDb(c.env.DB)
        const { id } = c.req.valid('param')
        const input = c.req.valid('json')
        if (!(await quoteExists(db, id))) return c.json({ error: '找不到名句' }, 404)
        if (!(await sourceExists(db, input.sourceId))) {
            return c.json({ error: '出处不存在' }, 400)
        }
        await updateQuote(db, id, input)
        const quote = await getQuote(db, id)
        return c.json(quote, 200)
    })
    .delete('/quotes/:id', validate('param', idParam), async (c) => {
        const deleted = await deleteQuote(createDb(c.env.DB), c.req.valid('param').id)
        if (!deleted) return c.json({ error: '找不到名句' }, 404)
        return c.body(null, 204)
    })
    .post('/sources', validate('json', sourceInput), async (c) => {
        const source = await createSource(createDb(c.env.DB), c.req.valid('json'))
        return c.json(source, 201)
    })
