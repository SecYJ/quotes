import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const text = z.string().trim().min(1)

const quote = z
    .object({
        content: text,
        speaker: text.optional(),
        detail: text.optional(),
        note: text.optional(),
        tags: z.array(text).min(1, '每句名句至少要有一个标签'),
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
            title: text,
            quotes: z.array(quote).min(1),
        })
        .strict(),
})

export const collections = { sources }
