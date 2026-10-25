import { PencilIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sourceTypeLabels } from '@/lib/labels'
import type { Quote } from '@/lib/types'
import { Attribution } from './QuoteMarks'

type Props = {
    quote: Quote
    onEdit: () => void
}

export function QuoteDetail({ quote, onEdit }: Props) {
    return (
        <article className="flex h-full flex-col">
            {/* 「」用中文引号；整块左移一个字、首行再往回缩，让「挂进留白，正文与出处行左缘对齐 */}
            <blockquote className="-ml-[1em] pl-[1em] font-quote text-[2.4rem] leading-[1.65] -indent-[1em]">
                「{quote.content}」
            </blockquote>
            <Attribution quote={quote} className="mt-6 text-base" />

            <dl className="mt-12 grid grid-cols-[5rem_1fr] gap-x-6 gap-y-4 border-t pt-8 text-sm">
                <dt className="text-muted-foreground">出处类型</dt>
                <dd>{sourceTypeLabels[quote.source.type]}</dd>
                {quote.tags.length > 0 && (
                    <>
                        <dt className="text-muted-foreground">标签</dt>
                        <dd className="flex flex-wrap gap-x-3 text-primary">
                            {quote.tags.map((tag) => (
                                <span key={tag.id}>#{tag.name}</span>
                            ))}
                        </dd>
                    </>
                )}
                <dt className="text-muted-foreground">记下的日期</dt>
                <dd>{formatDate(quote.createdAt)}</dd>
            </dl>

            {quote.note && (
                <section className="mt-10">
                    <h3 className="text-sm text-muted-foreground">我的笔记</h3>
                    <p className="mt-2 max-w-[36em] leading-relaxed whitespace-pre-wrap">
                        {quote.note}
                    </p>
                </section>
            )}

            <div className="mt-10">
                <Button variant="outline" size="lg" onClick={onEdit}>
                    <PencilIcon data-icon="inline-start" />
                    编辑名句
                </Button>
            </div>
        </article>
    )
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('zh-Hans', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
