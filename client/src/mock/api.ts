import type { Quote, QuoteFilters, QuoteInput, Source, SourceInput, Tag } from '@/lib/types'
import { seedQuoteTags, seedQuotes, seedSources, seedTags } from '@/mock/seed'
import type { QuoteRow, QuoteTagRow } from '@/mock/seed'

// 内存中的假 API。方法都是 async、形状对齐之后的真 API，
// 换成 Hono RPC client 时只需要改 lib/queries.ts

const db = {
    sources: structuredClone(seedSources),
    tags: structuredClone(seedTags),
    quotes: structuredClone(seedQuotes),
    quoteTags: structuredClone(seedQuoteTags),
}

const ids = {
    source: maxId(db.sources),
    tag: maxId(db.tags),
    quote: maxId(db.quotes),
}

export const mockApi = {
    async listQuotes(filters: QuoteFilters): Promise<Quote[]> {
        await delay('listQuotes')
        const keyword = filters.q?.trim().toLowerCase()

        return db.quotes
            .filter((row) => filters.sourceId === undefined || row.sourceId === filters.sourceId)
            .filter(
                (row) =>
                    filters.tagId === undefined ||
                    db.quoteTags.some((qt) => qt.quoteId === row.id && qt.tagId === filters.tagId),
            )
            .filter(
                (row) =>
                    !keyword ||
                    row.content.toLowerCase().includes(keyword) ||
                    (row.speaker?.toLowerCase().includes(keyword) ?? false),
            )
            .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map(toQuote)
    },

    async getQuote(id: number): Promise<Quote> {
        await delay('getQuote')
        return toQuote(findQuoteRow(id))
    },

    async createQuote(input: QuoteInput): Promise<Quote> {
        await delay('createQuote')
        const now = new Date().toISOString()
        const row: QuoteRow = {
            id: ++ids.quote,
            ...withoutTags(input),
            createdAt: now,
            updatedAt: now,
        }
        db.quotes.push(row)
        setQuoteTags(row.id, input.tags)
        return toQuote(row)
    },

    async updateQuote(id: number, input: QuoteInput): Promise<Quote> {
        await delay('updateQuote')
        const row = findQuoteRow(id)
        Object.assign(row, withoutTags(input), { updatedAt: new Date().toISOString() })
        setQuoteTags(id, input.tags)
        return toQuote(row)
    },

    async deleteQuote(id: number): Promise<void> {
        await delay('deleteQuote')
        db.quotes = db.quotes.filter((row) => row.id !== id)
        db.quoteTags = db.quoteTags.filter((qt) => qt.quoteId !== id)
    },

    async listSources(): Promise<Source[]> {
        await delay('listSources')
        return db.sources.toSorted((a, b) => a.title.localeCompare(b.title, 'zh-Hans'))
    },

    async createSource(input: SourceInput): Promise<Source> {
        await delay('createSource')
        const source: Source = { id: ++ids.source, ...input, createdAt: new Date().toISOString() }
        db.sources.push(source)
        return source
    },

    async listTags(): Promise<Tag[]> {
        await delay('listTags')
        return db.tags.toSorted((a, b) => a.name.localeCompare(b.name, 'zh-Hans'))
    },
}

function toQuote(row: QuoteRow): Quote {
    const { sourceId, ...rest } = row
    const source = db.sources.find((s) => s.id === sourceId)
    if (!source) throw new Error(`找不到出处 ${sourceId}`)

    const tags = db.quoteTags
        .filter((qt) => qt.quoteId === row.id)
        .map((qt) => db.tags.find((t) => t.id === qt.tagId))
        .filter((t) => t !== undefined)

    return { ...rest, source, tags }
}

function findQuoteRow(id: number) {
    const row = db.quotes.find((q) => q.id === id)
    if (!row) throw new Error(`找不到名句 ${id}`)
    return row
}

function withoutTags(input: QuoteInput) {
    const { tags: _tags, ...rest } = input
    return rest
}

function setQuoteTags(quoteId: number, names: string[]) {
    const unique = [...new Set(names.map((name) => name.trim()).filter((name) => name !== ''))]
    const rows: QuoteTagRow[] = unique.map((name) => ({ quoteId, tagId: findOrCreateTag(name).id }))
    db.quoteTags = db.quoteTags.filter((qt) => qt.quoteId !== quoteId).concat(rows)
}

function findOrCreateTag(name: string) {
    const existing = db.tags.find((t) => t.name === name)
    if (existing) return existing
    const tag: Tag = { id: ++ids.tag, name }
    db.tags.push(tag)
    return tag
}

function maxId(rows: { id: number }[]) {
    return Math.max(0, ...rows.map((row) => row.id))
}

// 模拟网络延迟，让 loading 状态看得到。
// 测试错误画面：localStorage 的 lines-mock-fail 设成方法名（例如 listQuotes），那个方法就会失败
async function delay(method: string) {
    await new Promise((resolve) => setTimeout(resolve, 150))
    if (readMockFail() === method) throw new Error(`模拟的错误：${method}`)
}

function readMockFail() {
    try {
        return localStorage.getItem('lines-mock-fail')
    } catch {
        return null
    }
}
