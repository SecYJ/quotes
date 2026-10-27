import { Hono } from 'hono'

import { createDb } from '#/db/index'
import { getQuote, listQuotes, listSources, listTags } from '#/db/quotes'
import { idParam, quoteFilters, validate } from '#/validation'

// 公开的读取 API：任何人都可以呼叫，只有 GET

export const publicRoutes = new Hono<{ Bindings: Env }>()
    .get('/quotes', validate('query', quoteFilters), async (c) => {
        const quotes = await listQuotes(createDb(c.env.DB), c.req.valid('query'))
        return c.json(quotes)
    })
    .get('/quotes/:id', validate('param', idParam), async (c) => {
        const quote = await getQuote(createDb(c.env.DB), c.req.valid('param').id)
        if (!quote) return c.json({ error: '找不到名句' }, 404)
        return c.json(quote)
    })
    .get('/sources', async (c) => {
        return c.json(await listSources(createDb(c.env.DB)))
    })
    .get('/tags', async (c) => {
        return c.json(await listTags(createDb(c.env.DB)))
    })
