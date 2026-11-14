import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import * as z from 'zod'

const textSchema = z.string().trim().min(1)

const quoteSchema = z
    .object({
        content: textSchema,
        speaker: textSchema.optional(),
        detail: textSchema.optional(),
        note: textSchema.optional(),
        tags: z.array(textSchema).min(1, '每句名句至少要有一个标签'),
        added: z.date({ error: 'added 要写成日期，例如 2026-11-06' }),
    })
    .strict()
    .refine(
        (q) => new Set(q.tags.map((t) => t.toLowerCase())).size === q.tags.length,
        '同一句名句的标签重复（标签比较时忽略英文大小写）',
    )

// 一个出处一个 YAML 档，档名就是出处的 id（网址里用的）
const sources = defineCollection({
    loader: glob({ base: './src/content/sources', pattern: '**/*.yaml' }),
    schema: z
        .object({
            type: z.enum(['drama', 'book', 'real_life', 'other']),
            title: textSchema,
            quotes: z.array(quoteSchema).min(1),
        })
        .strict(),
})

export const collections = { sources }
