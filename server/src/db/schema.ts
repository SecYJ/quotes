import { relations, sql } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// 字段名称写 camelCase，casing: 'snake_case' 会在数据库里转成 snake_case

export const sourceTypes = ['drama', 'book', 'real_life', 'other'] as const

// SQLite 没有日期类型：存 Unix 秒数，Drizzle 读写时转成 Date；预设为现在
function timestamp() {
    return integer({ mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`)
}

export const sources = sqliteTable('sources', {
    id: integer().primaryKey({ autoIncrement: true }),
    // enum 只影响 TypeScript 类型，数据库不会挡，真正的检查交给 API 的 zod
    type: text({ enum: sourceTypes }).notNull(),
    title: text().notNull(),
    createdAt: timestamp(),
})

export const quotes = sqliteTable(
    'quotes',
    {
        id: integer().primaryKey({ autoIncrement: true }),
        content: text().notNull(),
        speaker: text(),
        // 有名句的出处不能删
        sourceId: integer()
            .notNull()
            .references(() => sources.id, { onDelete: 'restrict' }),
        sourceDetail: text(),
        note: text(),
        createdAt: timestamp(),
        // SQLite 没有 ON UPDATE，由 Drizzle 在每次 update 时带上新时间
        updatedAt: timestamp().$onUpdate(() => new Date()),
    },
    (table) => [index('quotes_source_id_idx').on(table.sourceId)],
)

export const tags = sqliteTable('tags', {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique(),
})

export const quoteTags = sqliteTable(
    'quote_tags',
    {
        quoteId: integer()
            .notNull()
            .references(() => quotes.id, { onDelete: 'cascade' }),
        tagId: integer()
            .notNull()
            .references(() => tags.id, { onDelete: 'cascade' }),
    },
    (table) => [
        // 同一句不会重复挂同一个标签；quote_id 在前，按名句查标签直接用这个 index
        primaryKey({ columns: [table.quoteId, table.tagId] }),
        // 按标签筛选
        index('quote_tags_tag_id_idx').on(table.tagId),
    ],
)

// relations 只给 Drizzle 的 query API（db.query.*）用来一次带出关联资料，不会改变数据库，不需要 migration

export const sourcesRelations = relations(sources, ({ many }) => ({
    quotes: many(quotes),
}))

export const quotesRelations = relations(quotes, ({ one, many }) => ({
    source: one(sources, { fields: [quotes.sourceId], references: [sources.id] }),
    quoteTags: many(quoteTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
    quoteTags: many(quoteTags),
}))

export const quoteTagsRelations = relations(quoteTags, ({ one }) => ({
    quote: one(quotes, { fields: [quoteTags.quoteId], references: [quotes.id] }),
    tag: one(tags, { fields: [quoteTags.tagId], references: [tags.id] }),
}))
