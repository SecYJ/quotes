import { cn } from 'cn'
import { formatSourceTitle } from '@/lib/labels'
import type { Quote } from '@/lib/types'

// 读书时的记号：着重号（搜索命中）、出处行（——谁《哪里》）、书签（选中）

type HighlightProps = {
  text: string
  keyword?: string
}

// 把 keyword 出现的地方加上着重号；不分大小写
export function Highlight({ text, keyword }: HighlightProps) {
  const trimmed = keyword?.trim()
  if (!trimmed) return text

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, 'gi'))
  // split 带捕获组时，奇数位是命中的部分
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <em key={index} className="not-italic emphasis-dots">
        {part}
      </em>
    ) : (
      part
    ),
  )
}

type AttributionProps = {
  quote: Quote
  keyword?: string
  className?: string
}

// 中文引文的惯例：——孔子《论语》为政篇
export function Attribution({ quote, keyword, className }: AttributionProps) {
  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground', className)}>
      <span className="text-foreground/80">
        ——
        {quote.speaker && <Highlight text={quote.speaker} keyword={keyword} />}
        {quote.speaker && quote.source.type !== 'drama' && quote.source.type !== 'book' ? '，' : ''}
        {formatSourceTitle(quote.source)}
      </span>
      {quote.sourceDetail && <span>{quote.sourceDetail}</span>}
    </p>
  )
}

// 挂在上缘的一条藤黄书签，标出目前选中的那句
export function Bookmark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-0 h-8 w-3.5 bg-marker [clip-path:polygon(0_0,100%_0,100%_100%,50%_74%,0_100%)]',
        className,
      )}
    />
  )
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
