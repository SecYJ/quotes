import { useSuspenseQuery } from '@tanstack/react-query'
import { Controller, useWatch } from 'react-hook-form'
import type { Control, UseFormSetValue } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { sourceTypeLabels, sourceTypes } from '@/lib/labels'
import { sourceQueries } from '@/lib/queries'
import type { QuoteFormValues } from '@/lib/quote-form'
import type { SourceType } from '@/lib/types'

const NEW_VALUE = 'new'

// 选已有出处，或切换成当场新增（类型 + 名称）
export function SourcePicker({
    control,
    setValue,
}: {
    control: Control<QuoteFormValues>
    setValue: UseFormSetValue<QuoteFormValues>
}) {
    const { data: sources } = useSuspenseQuery(sourceQueries.list())
    const mode = useWatch({ control, name: 'sourceMode' })

    if (mode === 'new') {
        return (
            <Controller
                name="newSourceTitle"
                control={control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="new-source-title">
                            新增出处 <span className="text-destructive">*</span>
                        </FieldLabel>
                        <div className="flex gap-2">
                            <Controller
                                name="newSourceType"
                                control={control}
                                render={({ field: typeField }) => (
                                    <Select
                                        items={sourceTypeLabels}
                                        value={typeField.value}
                                        onValueChange={(value) =>
                                            typeField.onChange(value as SourceType)
                                        }
                                    >
                                        <SelectTrigger className="w-32" aria-label="出处类型">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sourceTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {sourceTypeLabels[type]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <Input
                                {...field}
                                id="new-source-title"
                                className="flex-1"
                                placeholder="出处名称，例如剧名、书名、朋友聊天"
                                aria-invalid={fieldState.invalid}
                                autoFocus
                            />
                        </div>
                        <FieldError errors={[fieldState.error]} />
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            // Field 会把子元素撑满宽度，文字要靠左
                            className="justify-start px-0 text-muted-foreground"
                            onClick={() => setValue('sourceMode', 'existing')}
                        >
                            ← 选择已有出处
                        </Button>
                    </Field>
                )}
            />
        )
    }

    // Select 显示选中项时用 items 找名称
    const items: Record<string, string> = { [NEW_VALUE]: '＋ 新增出处' }
    for (const source of sources) items[String(source.id)] = source.title

    return (
        <Controller
            name="sourceId"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="source-id">
                        出处 <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                        items={items}
                        value={field.value}
                        onValueChange={(value) => {
                            if (value === NEW_VALUE) setValue('sourceMode', 'new')
                            else field.onChange(value)
                        }}
                    >
                        <SelectTrigger
                            id="source-id"
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                            onBlur={field.onBlur}
                        >
                            <SelectValue placeholder="选择出处" />
                        </SelectTrigger>
                        <SelectContent>
                            {sourceTypes.map((type) => {
                                const group = sources.filter((source) => source.type === type)
                                if (group.length === 0) return null
                                return (
                                    <SelectGroup key={type}>
                                        <SelectLabel>{sourceTypeLabels[type]}</SelectLabel>
                                        {group.map((source) => (
                                            <SelectItem key={source.id} value={String(source.id)}>
                                                {source.title}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                )
                            })}
                            <SelectSeparator />
                            <SelectItem value={NEW_VALUE}>＋ 新增出处</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                </Field>
            )}
        />
    )
}
