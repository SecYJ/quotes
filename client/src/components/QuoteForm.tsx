import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateQuote, useCreateSource, useDeleteQuote, useUpdateQuote } from '@/lib/queries'
import { quoteFormSchema, toFormValues, toQuoteInput } from '@/lib/quote-form'
import type { QuoteFormValues } from '@/lib/quote-form'
import type { Quote } from '@/lib/types'
import { SourcePicker } from '@/components/SourcePicker'
import { TagInput } from '@/components/TagInput'

type Props = {
    // 有 quote 是编辑，没有是新增
    quote?: Quote
    onSaved?: (quote: Quote) => void
    onDeleted?: () => void
}

export function QuoteForm({ quote, onSaved, onDeleted }: Props) {
    const form = useForm<QuoteFormValues>({
        resolver: zodResolver(quoteFormSchema),
        defaultValues: toFormValues(quote),
    })
    const [confirmingDelete, setConfirmingDelete] = useState(false)

    const createSource = useCreateSource()
    const createQuote = useCreateQuote()
    const updateQuote = useUpdateQuote()
    const deleteQuote = useDeleteQuote()

    async function resolveSourceId(values: QuoteFormValues) {
        if (values.sourceMode === 'existing') return Number(values.sourceId)
        const created = await createSource.mutateAsync({
            type: values.newSourceType,
            title: values.newSourceTitle.trim(),
        })
        // 之后再储存失败时不会重复建立同一个出处
        form.setValue('sourceMode', 'existing')
        form.setValue('sourceId', String(created.id))
        return created.id
    }

    async function onSubmit(values: QuoteFormValues) {
        const input = toQuoteInput(values, await resolveSourceId(values))
        const saved = quote
            ? await updateQuote.mutateAsync({ id: quote.id, input })
            : await createQuote.mutateAsync(input)
        onSaved?.(saved)
    }

    async function handleDelete() {
        if (!quote) return
        if (!confirmingDelete) {
            setConfirmingDelete(true)
            return
        }
        await deleteQuote.mutateAsync(quote.id)
        onDeleted?.()
    }

    const saving = form.formState.isSubmitting

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
                <Controller
                    name="content"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="content">
                                句子内容 <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Textarea
                                {...field}
                                id="content"
                                className="min-h-36 resize-y font-quote text-xl leading-relaxed md:text-xl"
                                placeholder="记下你听到的那句话"
                                aria-invalid={fieldState.invalid}
                                autoFocus
                            />
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />

                <Controller
                    name="speaker"
                    control={form.control}
                    render={({ field }) => (
                        <Field>
                            <FieldLabel htmlFor="speaker">谁说的</FieldLabel>
                            <Input {...field} id="speaker" placeholder="选填" />
                        </Field>
                    )}
                />

                <SourcePicker control={form.control} setValue={form.setValue} />

                <Controller
                    name="sourceDetail"
                    control={form.control}
                    render={({ field }) => (
                        <Field>
                            <FieldLabel htmlFor="source-detail">出处细节</FieldLabel>
                            <Input
                                {...field}
                                id="source-detail"
                                placeholder="选填，例如第几集、哪个场合"
                            />
                        </Field>
                    )}
                />

                <Controller
                    name="tags"
                    control={form.control}
                    render={({ field }) => (
                        <Field>
                            <FieldLabel htmlFor="tags">标签</FieldLabel>
                            <TagInput id="tags" value={field.value} onChange={field.onChange} />
                        </Field>
                    )}
                />

                <Controller
                    name="note"
                    control={form.control}
                    render={({ field }) => (
                        <Field>
                            <FieldLabel htmlFor="note">笔记</FieldLabel>
                            <Textarea
                                {...field}
                                id="note"
                                className="min-h-20 resize-y"
                                placeholder="选填"
                            />
                        </Field>
                    )}
                />

                <div className="flex items-center gap-2 border-t pt-5">
                    <Button type="submit" size="lg" className="px-5" disabled={saving}>
                        {saving ? '储存中…' : '储存'}
                    </Button>
                    {quote && (
                        <Button
                            type="button"
                            variant={confirmingDelete ? 'destructive' : 'ghost'}
                            size="lg"
                            className={
                                confirmingDelete
                                    ? 'ml-auto'
                                    : 'ml-auto text-destructive hover:text-destructive'
                            }
                            onClick={handleDelete}
                            onBlur={() => setConfirmingDelete(false)}
                            disabled={deleteQuote.isPending}
                        >
                            {deleteQuote.isPending
                                ? '删除中…'
                                : confirmingDelete
                                  ? '确定删除？'
                                  : '删除'}
                        </Button>
                    )}
                </div>
            </FieldGroup>
        </form>
    )
}
