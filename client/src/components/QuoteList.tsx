import { cn } from 'cn'
import type { Quote } from '@/lib/types'
import type { ViewMode } from '@/lib/view-mode'
import { Attribution, Bookmark, Highlight } from './QuoteMarks'

type Props = {
  quotes: Quote[] | undefined
  viewMode: ViewMode
  selectedId: number | null
  keyword?: string
  onSelect: (id: number) => void
}

export function QuoteList({ quotes, viewMode, selectedId, keyword, onSelect }: Props) {
  if (!quotes) return <p className="text-muted-foreground">载入中…</p>
  if (quotes.length === 0) {
    return (
      <p className="py-24 text-center leading-loose text-muted-foreground">
        没有符合的名句。
        <br />
        换个关键字，或清除左边的筛选。
      </p>
    )
  }

  if (viewMode === 'grid') {
    return (
      // CSS columns 做 masonry：卡片高度不同也不会留空隙（顺序是一栏一栏往下排）
      <div className="columns-[21rem] gap-4">
        {quotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            keyword={keyword}
            selected={quote.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    )
  }

  return (
    <ul className="mx-auto max-w-[64rem] space-y-1">
      {quotes.map((quote) => (
        <li key={quote.id}>
          <QuoteRow quote={quote} keyword={keyword} selected={quote.id === selectedId} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  )
}

type ItemProps = {
  quote: Quote
  keyword?: string
  selected: boolean
  onSelect: (id: number) => void
}

function QuoteRow({ quote, keyword, selected, onSelect }: ItemProps) {
  return (
    <button
      type="button"
      aria-current={selected || undefined}
      className={cn(
        'relative w-full rounded-lg py-6 pr-14 pl-7 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        selected ? 'bg-card' : 'hover:bg-card/50',
      )}
      onClick={() => onSelect(quote.id)}
    >
      {selected && <Bookmark className="right-6" />}
      {/* line-clamp 会 overflow: hidden，底部留空间给着重号 */}
      <p className="line-clamp-3 pb-[0.3em] font-quote text-[1.6rem] leading-[1.7]">
        <Highlight text={quote.content} keyword={keyword} />
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <Attribution quote={quote} keyword={keyword} />
        <Tags quote={quote} />
      </div>
    </button>
  )
}

function QuoteCard({ quote, keyword, selected, onSelect }: ItemProps) {
  return (
    <button
      type="button"
      aria-current={selected || undefined}
      className={cn(
        'relative mb-4 block w-full break-inside-avoid rounded-lg bg-card p-6 pr-9 text-left ring-1 transition-shadow outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        selected ? 'ring-marker/60' : 'ring-transparent hover:ring-border',
      )}
      onClick={() => onSelect(quote.id)}
    >
      {selected && <Bookmark className="right-4" />}
      <p className="font-quote text-xl leading-[1.75]">
        <Highlight text={quote.content} keyword={keyword} />
      </p>
      <Attribution quote={quote} keyword={keyword} className="mt-4" />
      <Tags quote={quote} className="mt-2" />
    </button>
  )
}

function Tags({ quote, className }: { quote: Quote; className?: string }) {
  if (quote.tags.length === 0) return null
  return (
    <p className={cn('flex flex-wrap gap-x-3 text-sm text-primary', className)}>
      {quote.tags.map((tag) => (
        <span key={tag.id}>#{tag.name}</span>
      ))}
    </p>
  )
}
