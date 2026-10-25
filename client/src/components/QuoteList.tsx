import { cn } from 'cn'
import { Badge } from '@/components/ui/badge'
import { formatSourceTitle } from '@/lib/labels'
import type { Quote } from '@/lib/types'
import type { ViewMode } from '@/lib/view-mode'

type Props = {
  quotes: Quote[] | undefined
  viewMode: ViewMode
  selectedId: number | null
  onSelect: (id: number) => void
}

export function QuoteList({ quotes, viewMode, selectedId, onSelect }: Props) {
  if (!quotes) return <p className="text-muted-foreground">载入中…</p>
  if (quotes.length === 0) {
    return <p className="py-20 text-center text-muted-foreground">没有符合条件的名句</p>
  }

  if (viewMode === 'grid') {
    return (
      // CSS columns 做 masonry：卡片高度不同也不会留空隙（顺序是一栏一栏往下排）
      <div className="columns-[22rem] gap-5">
        {quotes.map((quote) => (
          <QuoteCard key={quote.id} quote={quote} selected={quote.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    )
  }

  return (
    <ul className="mx-auto max-w-5xl divide-y">
      {quotes.map((quote) => (
        <li key={quote.id}>
          <QuoteRow quote={quote} selected={quote.id === selectedId} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  )
}

type ItemProps = {
  quote: Quote
  selected: boolean
  onSelect: (id: number) => void
}

function QuoteRow({ quote, selected, onSelect }: ItemProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-lg px-5 py-5 text-left transition-colors',
        selected ? 'bg-primary/10' : 'hover:bg-muted/60',
      )}
      onClick={() => onSelect(quote.id)}
    >
      <p className="line-clamp-3 font-serif text-xl leading-relaxed">{quote.content}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>{formatAttribution(quote)}</span>
        {quote.tags.map((tag) => (
          <span key={tag.id} className="text-primary">
            #{tag.name}
          </span>
        ))}
      </p>
    </button>
  )
}

function QuoteCard({ quote, selected, onSelect }: ItemProps) {
  return (
    <button
      type="button"
      className={cn(
        'mb-5 block w-full break-inside-avoid rounded-xl border bg-card p-5 text-left text-card-foreground shadow-xs transition',
        selected ? 'border-primary ring-3 ring-primary/20' : 'hover:border-primary/40 hover:shadow-md',
      )}
      onClick={() => onSelect(quote.id)}
    >
      <p className="font-serif text-lg leading-relaxed">{quote.content}</p>
      <p className="mt-4 text-sm text-muted-foreground">{formatAttribution(quote)}</p>
      {quote.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {quote.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              #{tag.name}
            </Badge>
          ))}
        </div>
      )}
    </button>
  )
}

function formatAttribution(quote: Quote) {
  const speaker = quote.speaker ? `${quote.speaker} · ` : ''
  const detail = quote.sourceDetail ? ` ${quote.sourceDetail}` : ''
  return `— ${speaker}${formatSourceTitle(quote.source)}${detail}`
}
