import { z } from 'zod'
import type { Quote, QuoteInput } from '@/lib/types'

// 表单的字段是平的（不用 union），RHF 比较好对应；条件必填放在 superRefine
export const quoteFormSchema = z
    .object({
        content: z.string().trim().min(1, '请输入句子内容'),
        speaker: z.string(),
        sourceMode: z.enum(['existing', 'new']),
        // Select 的值是字串，送出时才转成数字
        sourceId: z.string().nullable(),
        newSourceType: z.enum(['drama', 'book', 'real_life', 'other']),
        newSourceTitle: z.string(),
        sourceDetail: z.string(),
        tags: z.array(z.string()),
        note: z.string(),
    })
    .superRefine((values, ctx) => {
        if (values.sourceMode === 'existing' && values.sourceId === null) {
            ctx.addIssue({ code: 'custom', path: ['sourceId'], message: '请选择出处' })
        }
        if (values.sourceMode === 'new' && values.newSourceTitle.trim() === '') {
            ctx.addIssue({ code: 'custom', path: ['newSourceTitle'], message: '请输入出处名称' })
        }
    })

export type QuoteFormValues = z.infer<typeof quoteFormSchema>

export function toFormValues(quote?: Quote): QuoteFormValues {
    return {
        content: quote?.content ?? '',
        speaker: quote?.speaker ?? '',
        sourceMode: 'existing',
        sourceId: quote ? String(quote.source.id) : null,
        newSourceType: 'drama',
        newSourceTitle: '',
        sourceDetail: quote?.sourceDetail ?? '',
        tags: quote?.tags.map((tag) => tag.name) ?? [],
        note: quote?.note ?? '',
    }
}

export function toQuoteInput(values: QuoteFormValues, sourceId: number): QuoteInput {
    return {
        content: values.content.trim(),
        speaker: emptyToNull(values.speaker),
        sourceId,
        sourceDetail: emptyToNull(values.sourceDetail),
        note: emptyToNull(values.note),
        tags: values.tags,
    }
}

function emptyToNull(value: string) {
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
}
