import { and, desc, eq, inArray, like, or, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

import type { Db } from '#/db/index'
import { quoteTags, quotes, sources, tags } from '#/db/schema'
import type { QuoteFilters, QuoteInput, SourceInput } from '#/validation'

// 名称排序跟前端一样用中文规则；SQLite 的 ORDER BY 只会比字元编码
const collator = new Intl.Collator('zh-Hans')

// 读取名句时一起带出出处与标签
function findQuoteRows(db: Db, where: SQL | undefined) {
    return db.query.quotes.findMany({
        where,
        // 同一秒建立的句子用 id 决定先后
        orderBy: [desc(quotes.createdAt), desc(quotes.id)],
        with: { source: true, quoteTags: { with: { tag: true } } },
    })
}

type QuoteRow = Awaited<ReturnType<typeof findQuoteRows>>[number]

// 转成 API 回传的形状（跟 client/src/lib/types.ts 的 Quote 一致）。Date 由 c.json 转成 ISO 字串
function toQuote(row: QuoteRow) {
    const { sourceId: _sourceId, quoteTags: rowTags, ...rest } = row
    const quoteTagList = rowTags
        .map((quoteTag) => quoteTag.tag)
        .toSorted((a, b) => collator.compare(a.name, b.name))
    return { ...rest, tags: quoteTagList }
}

export async function listQuotes(db: Db, filters: QuoteFilters) {
    const tagged =
        filters.tagId === undefined
            ? undefined
            : inArray(
                  quotes.id,
                  db
                      .select({ id: quoteTags.quoteId })
                      .from(quoteTags)
                      .where(eq(quoteTags.tagId, filters.tagId)),
              )
    // 第一版用简单的 LIKE；% 和 _ 不另外跳脱
    const keyword =
        filters.q === undefined
            ? undefined
            : or(like(quotes.content, `%${filters.q}%`), like(quotes.speaker, `%${filters.q}%`))

    const rows = await findQuoteRows(
        db,
        and(
            filters.sourceId === undefined ? undefined : eq(quotes.sourceId, filters.sourceId),
            tagged,
            keyword,
        ),
    )
    return rows.map(toQuote)
}

export async function getQuote(db: Db, id: number) {
    const [row] = await findQuoteRows(db, eq(quotes.id, id))
    return row && toQuote(row)
}

export async function quoteExists(db: Db, id: number) {
    return (await db.$count(quotes, eq(quotes.id, id))) > 0
}

export async function sourceExists(db: Db, id: number) {
    return (await db.$count(sources, eq(sources.id, id))) > 0
}

// D1 不支援 BEGIN / COMMIT，要一起成功或一起失败的写入用 db.batch（整批是一个 transaction）

export async function createQuote(db: Db, input: QuoteInput) {
    const { tags: names, ...values } = input
    // 新名句的 id 在 batch 送出前还不知道。AUTOINCREMENT 保证新 id 是最大值，
    // batch 又是一个 transaction，中间不会插进别的写入，所以 max(id) 就是这一句
    const newQuoteId = sql<number>`(select max(${quotes.id}) from ${quotes})`
    const [[created]] = await db.batch([
        db.insert(quotes).values(values).returning({ id: quotes.id }),
        ...tagStatements(db, newQuoteId, names),
    ])
    return created.id
}

export async function updateQuote(db: Db, id: number, input: QuoteInput) {
    const { tags: names, ...values } = input
    await db.batch([
        db.update(quotes).set(values).where(eq(quotes.id, id)),
        db.delete(quoteTags).where(eq(quoteTags.quoteId, id)),
        ...tagStatements(db, sql<number>`${id}`, names),
    ])
}

// 回传是否真的删到；quote_tags 由外键的 cascade 一起删除
export async function deleteQuote(db: Db, id: number) {
    const deleted = await db.delete(quotes).where(eq(quotes.id, id)).returning({ id: quotes.id })
    return deleted.length > 0
}

// 建立还不存在的标签，再把这句和所有标签连起来
function tagStatements(db: Db, quoteId: SQL<number>, names: string[]) {
    if (names.length === 0) return []
    return [
        db
            .insert(tags)
            .values(names.map((name) => ({ name })))
            .onConflictDoNothing(),
        db.insert(quoteTags).select(
            db
                .select({ quoteId: sql<number>`${quoteId}`.as('quote_id'), tagId: tags.id })
                .from(tags)
                .where(inArray(tags.name, names)),
        ),
    ]
}

export async function listSources(db: Db) {
    const rows = await db.select().from(sources)
    return rows.toSorted((a, b) => collator.compare(a.title, b.title))
}

export async function createSource(db: Db, input: SourceInput) {
    const [created] = await db.insert(sources).values(input).returning()
    return created
}

export async function listTags(db: Db) {
    const rows = await db.select().from(tags)
    return rows.toSorted((a, b) => collator.compare(a.name, b.name))
}
