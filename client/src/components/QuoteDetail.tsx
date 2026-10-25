import { formatSourceTitle, sourceTypeLabels } from '../lib/labels'
import type { Quote } from '../lib/types'

type Props = {
  quote: Quote
  onEdit: () => void
}

export function QuoteDetail({ quote, onEdit }: Props) {
  return (
    <article className="space-y-8">
      <blockquote className="border-l-4 border-teal-600 pl-6 font-serif text-3xl leading-relaxed text-stone-900">
        {quote.content}
      </blockquote>

      <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-3 text-stone-700">
        {quote.speaker && (
          <>
            <dt className={termClass}>谁说的</dt>
            <dd>{quote.speaker}</dd>
          </>
        )}
        <dt className={termClass}>出处</dt>
        <dd>
          {formatSourceTitle(quote.source)}
          <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500">
            {sourceTypeLabels[quote.source.type]}
          </span>
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
                <span key={tag.id} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-sm text-teal-800">
                  #{tag.name}
                </span>
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
        <dd className="text-stone-500">{formatDate(quote.createdAt)}</dd>
      </dl>

      <button
        type="button"
        className="rounded-md border border-stone-300 px-4 py-2 text-stone-700 hover:bg-stone-100"
        onClick={onEdit}
      >
        编辑
      </button>
    </article>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-Hans', { year: 'numeric', month: 'long', day: 'numeric' })
}

const termClass = 'text-sm leading-6 text-stone-400'
