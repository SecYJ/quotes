import { PencilIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSourceTitle, sourceTypeLabels } from '@/lib/labels'
import type { Quote } from '@/lib/types'

type Props = {
  quote: Quote
  onEdit: () => void
}

export function QuoteDetail({ quote, onEdit }: Props) {
  return (
    <article className="space-y-8">
      <blockquote className="border-l-4 border-primary pl-6 font-serif text-3xl leading-relaxed">
        {quote.content}
      </blockquote>

      <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-3">
        {quote.speaker && (
          <>
            <dt className={termClass}>谁说的</dt>
            <dd>{quote.speaker}</dd>
          </>
        )}
        <dt className={termClass}>出处</dt>
        <dd className="flex items-center gap-2">
          {formatSourceTitle(quote.source)}
          <Badge variant="outline">{sourceTypeLabels[quote.source.type]}</Badge>
        </dd>
        {quote.sourceDetail && (
          <>
            <dt className={termClass}>出处细节</dt>
            <dd>{quote.sourceDetail}</dd>
          </>
        )}
        {quote.tags.length > 0 && (
          <>
            <dt className={termClass}>标签</dt>
            <dd className="flex flex-wrap gap-1.5">
              {quote.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  #{tag.name}
                </Badge>
              ))}
            </dd>
          </>
        )}
        {quote.note && (
          <>
            <dt className={termClass}>笔记</dt>
            <dd className="whitespace-pre-wrap">{quote.note}</dd>
          </>
        )}
        <dt className={termClass}>记录于</dt>
        <dd className="text-muted-foreground">{formatDate(quote.createdAt)}</dd>
      </dl>

      <Button variant="outline" size="lg" onClick={onEdit}>
        <PencilIcon data-icon="inline-start" />
        编辑
      </Button>
    </article>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-Hans', { year: 'numeric', month: 'long', day: 'numeric' })
}

const termClass = 'text-sm leading-6 text-muted-foreground'
