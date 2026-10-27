import { zValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import { z } from 'zod'

import { sourceTypes } from '#/db/schema'

// 网址里的 id、query 都是字串，用 coerce 转成数字
const positiveInt = z.coerce.number().int().positive()

// 空字串当成没填
const optionalText = z
    .string()
    .trim()
    .nullable()
    .transform((value) => (value === '' ? null : value))

export const idParam = z.object({ id: positiveInt })

export const quoteFilters = z.object({
    sourceId: positiveInt.optional(),
    tagId: positiveInt.optional(),
    q: z
        .string()
        .trim()
        .optional()
        .transform((value) => (value === '' ? undefined : value)),
})

export const quoteInput = z.object({
    content: z.string().trim().min(1, '请输入句子内容'),
    speaker: optionalText,
    sourceId: positiveInt,
    sourceDetail: optionalText,
    note: optionalText,
    // 用名称传递，不存在的标签由 API 建立；去掉空白与重复
    tags: z
        .array(z.string().trim())
        .transform((names) => [...new Set(names.filter((name) => name !== ''))]),
})

export const sourceInput = z.object({
    type: z.enum(sourceTypes),
    title: z.string().trim().min(1, '请输入出处名称'),
})

export type QuoteFilters = z.infer<typeof quoteFilters>
export type QuoteInput = z.infer<typeof quoteInput>
export type SourceInput = z.infer<typeof sourceInput>

// 验证失败统一回 400 { error, issues }，不用 zValidator 预设的 zod 错误格式
export function validate<Target extends keyof ValidationTargets, Schema extends z.ZodType>(
    target: Target,
    schema: Schema,
) {
    return zValidator(target, schema, (result, c) => {
        if (!result.success) {
            const issues = result.error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            }))
            return c.json({ error: '输入格式不正确', issues }, 400)
        }
    })
}
