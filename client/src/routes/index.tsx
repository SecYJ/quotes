import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { LayoutGridIcon, ListIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FilterSidebar } from '@/components/FilterSidebar'
import { QuoteDetail } from '@/components/QuoteDetail'
import { QuoteForm } from '@/components/QuoteForm'
import { QuoteList } from '@/components/QuoteList'
import { SearchBox } from '@/components/SearchBox'
import { useQuote, useQuotes } from '@/lib/queries'
import { useQuoteFilters, validateQuoteSearch } from '@/lib/search'
import { useViewMode } from '@/lib/view-mode'
import type { ViewMode } from '@/lib/view-mode'

// 三栏式。左：筛选；中：搜索 + 列表（row / grid）；右：详细 / 表单
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
  const [viewMode, setViewMode] = useViewMode()
  const [panel, setPanel] = useState<PanelState>({ mode: 'empty' })
  const selectedId = panel.mode === 'view' || panel.mode === 'edit' ? panel.id : null

  return (
    <div className="grid h-full grid-cols-[22rem_minmax(0,1fr)_52rem]">
      <aside className="min-h-0 border-r bg-sidebar text-sidebar-foreground">
        <FilterSidebar />
      </aside>

      <main className="flex min-h-0 flex-col">
        <header className="flex items-center gap-4 border-b px-10 py-5">
          <SearchBox
            className="max-w-2xl flex-1"
            value={filters.q ?? ''}
            onChange={(q) => setFilters({ q: q || undefined })}
          />
          <p className="text-sm text-muted-foreground tabular-nums">{quotes.data ? `${quotes.data.length} 句` : ''}</p>
          <div className="ml-auto flex items-center gap-3">
            <ToggleGroup
              variant="outline"
              spacing={0}
              value={[viewMode]}
              // 单选：再点一次已选的项目会得到空阵列，这时保持不变
              onValueChange={(value) => {
                if (value[0]) setViewMode(value[0] as ViewMode)
              }}
            >
              <ToggleGroupItem value="row" aria-label="列表显示">
                <ListIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="网格显示">
                <LayoutGridIcon />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button size="lg" className="px-4" onClick={() => setPanel({ mode: 'new' })}>
              <PlusIcon data-icon="inline-start" />
              新增名句
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-10 py-6">
          <QuoteList
            quotes={quotes.data}
            viewMode={viewMode}
            selectedId={selectedId}
            onSelect={(id) => setPanel({ mode: 'view', id })}
          />
        </div>
      </main>

      <aside className="min-h-0 overflow-y-auto border-l bg-card px-12 py-10">
        <SidePanel panel={panel} onChange={setPanel} />
      </aside>
    </div>
  )
}

type PanelProps = {
  panel: PanelState
  onChange: (panel: PanelState) => void
}

function SidePanel({ panel, onChange }: PanelProps) {
  if (panel.mode === 'empty') {
    return (
      <div className="flex h-full items-center justify-center text-center leading-loose text-muted-foreground">
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

  if (quote.isPending) return <p className="text-muted-foreground">载入中…</p>
  if (quote.isError) return <p className="text-destructive">{quote.error.message}</p>

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
