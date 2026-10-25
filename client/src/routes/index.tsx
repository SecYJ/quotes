import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FilterSidebar } from '../components/FilterSidebar'
import { QuoteDetail } from '../components/QuoteDetail'
import { QuoteForm } from '../components/QuoteForm'
import { SearchBox } from '../components/SearchBox'
import { formatSourceTitle } from '../lib/labels'
import { useQuote, useQuotes } from '../lib/queries'
import { useQuoteFilters, validateQuoteSearch } from '../lib/search'
import type { Quote } from '../lib/types'

// 设计 A：三栏式。左：筛选；中：搜索 + 列表；右：详细 / 表单
export const Route = createFileRoute('/')({
  validateSearch: validateQuoteSearch,
  component: QuotesPage,
})

type PanelState =
  | { mode: 'empty' }
  | { mode: 'new' }
  | { mode: 'view'; id: number }
  | { mode: 'edit'; id: number }

function QuotesPage() {
  const { filters, setFilters } = useQuoteFilters()
  const quotes = useQuotes(filters)
  const [panel, setPanel] = useState<PanelState>({ mode: 'empty' })
  const selectedId = panel.mode === 'view' || panel.mode === 'edit' ? panel.id : null

  return (
    <div className="grid h-full grid-cols-[22rem_minmax(0,1fr)_52rem]">
      <aside className="min-h-0 border-r border-stone-200 bg-stone-100/60">
        <FilterSidebar />
      </aside>

      <main className="flex min-h-0 flex-col">
        <header className="flex items-center gap-4 border-b border-stone-200 px-10 py-5">
          <SearchBox
            className="max-w-2xl flex-1"
            value={filters.q ?? ''}
            onChange={(q) => setFilters({ q: q || undefined })}
          />
          <p className="text-sm text-stone-500 tabular-nums">{quotes.data ? `${quotes.data.length} 句` : ''}</p>
          <button
            type="button"
            className="ml-auto rounded-md bg-teal-700 px-5 py-2.5 font-medium text-white hover:bg-teal-800"
            onClick={() => setPanel({ mode: 'new' })}
          >
            ＋ 新增名句
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-10 py-6">
          <QuoteList
            quotes={quotes.data}
            loading={quotes.isPending}
            selectedId={selectedId}
            onSelect={(id) => setPanel({ mode: 'view', id })}
          />
        </div>
      </main>

      <aside className="min-h-0 overflow-y-auto border-l border-stone-200 bg-white px-12 py-10">
        <SidePanel panel={panel} onChange={setPanel} />
      </aside>
    </div>
  )
}

type QuoteListProps = {
  quotes: Quote[] | undefined
  loading: boolean
  selectedId: number | null
  onSelect: (id: number) => void
}

function QuoteList({ quotes, loading, selectedId, onSelect }: QuoteListProps) {
  if (loading) return <p className="text-stone-500">载入中…</p>
  if (!quotes || quotes.length === 0) {
    return <p className="py-20 text-center text-stone-500">没有符合条件的名句</p>
  }

  return (
    <ul className="mx-auto max-w-5xl divide-y divide-stone-200">
      {quotes.map((quote) => (
        <li key={quote.id}>
          <button
            type="button"
            className={`w-full rounded-lg px-5 py-5 text-left transition-colors ${
              quote.id === selectedId ? 'bg-teal-700/10' : 'hover:bg-stone-100'
            }`}
            onClick={() => onSelect(quote.id)}
          >
            <p className="line-clamp-3 font-serif text-xl leading-relaxed text-stone-900">{quote.content}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
              <span>
                — {quote.speaker ? `${quote.speaker} · ` : ''}
                {formatSourceTitle(quote.source)}
                {quote.sourceDetail ? ` ${quote.sourceDetail}` : ''}
              </span>
              {quote.tags.map((tag) => (
                <span key={tag.id} className="text-teal-700">
                  #{tag.name}
                </span>
              ))}
            </p>
          </button>
        </li>
      ))}
    </ul>
  )
}

type PanelProps = {
  panel: PanelState
  onChange: (panel: PanelState) => void
}

function SidePanel({ panel, onChange }: PanelProps) {
  if (panel.mode === 'empty') {
    return (
      <div className="flex h-full items-center justify-center text-center leading-loose text-stone-400">
        <p>
          从中间选一句名句查看详细
          <br />
          或按「新增名句」
        </p>
      </div>
    )
  }

  if (panel.mode === 'new') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">新增名句</h2>
        <QuoteForm
          onSaved={(quote) => onChange({ mode: 'view', id: quote.id })}
          onCancel={() => onChange({ mode: 'empty' })}
        />
      </div>
    )
  }

  return <SelectedQuote key={panel.id} id={panel.id} editing={panel.mode === 'edit'} onChange={onChange} />
}

type SelectedQuoteProps = {
  id: number
  editing: boolean
  onChange: (panel: PanelState) => void
}

function SelectedQuote({ id, editing, onChange }: SelectedQuoteProps) {
  const quote = useQuote(id)

  if (quote.isPending) return <p className="text-stone-500">载入中…</p>
  if (quote.isError) return <p className="text-red-600">{quote.error.message}</p>

  if (!editing) {
    return <QuoteDetail quote={quote.data} onEdit={() => onChange({ mode: 'edit', id })} />
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">编辑名句</h2>
      <QuoteForm
        quote={quote.data}
        onSaved={() => onChange({ mode: 'view', id })}
        onCancel={() => onChange({ mode: 'view', id })}
        onDeleted={() => onChange({ mode: 'empty' })}
      />
    </div>
  )
}
