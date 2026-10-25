import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { LayoutGridIcon, ListIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FilterSidebar } from '@/components/FilterSidebar'
import { QueryBoundary } from '@/components/QueryBoundary'
import { QuoteDetail } from '@/components/QuoteDetail'
import { QuoteForm } from '@/components/QuoteForm'
import { QuoteList } from '@/components/QuoteList'
import { SearchBox } from '@/components/SearchBox'
import { findQuoteInLists, quoteQueries, sourceQueries, tagQueries } from '@/lib/queries'
import { useQuoteFilters, validateQuoteSearch } from '@/lib/search'
import { useViewMode } from '@/lib/view-mode'
import type { ViewMode } from '@/lib/view-mode'

// 三栏式。左：筛选；中：搜索 + 列表（row / grid）；右：详细 / 表单
export const Route = createFileRoute('/')({
    validateSearch: validateQuoteSearch,
    // 只取 loader 用到的 search params，其他参数改变时不会重跑 loader
    loaderDeps({ search: { sourceId, tagId, q } }) {
        return { sourceId, tagId, q }
    },
    // 依 search params 组好的 query options 放在 route context，loader 与组件共用同一份
    context({ deps }) {
        return { quoteListQueryOptions: quoteQueries.list(deps) }
    },
    // 这里要 await：搜索、筛选会换成新的 query key，若不等资料就渲染，
    // useSuspenseQuery 会 suspend，列表每打一个字就闪成「载入中」（实测过）。
    // 等待时 router 保留旧画面，资料到了才换。全部一起等，不要一个接一个；
    // 失败时由 root route 的 errorComponent 处理
    async loader({ context }) {
        const { queryClient } = context
        await Promise.all([
            queryClient.query({ ...context.quoteListQueryOptions, staleTime: 'static' }),
            // 侧栏计算每个出处 / 标签的句数要用全部名句
            queryClient.query({ ...quoteQueries.list({}), staleTime: 'static' }),
            queryClient.query({ ...sourceQueries.list(), staleTime: 'static' }),
            queryClient.query({ ...tagQueries.list(), staleTime: 'static' }),
        ])
    },
    component: QuotesPage,
})

type PanelState =
    | { mode: 'empty' }
    | { mode: 'new' }
    | { mode: 'view'; id: number }
    | { mode: 'edit'; id: number }

function QuotesPage() {
    const { filters, setFilters } = useQuoteFilters()
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
                        <Button
                            size="lg"
                            className="px-4"
                            onClick={() => setPanel({ mode: 'new' })}
                        >
                            <PlusIcon data-icon="inline-start" />
                            新增名句
                        </Button>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-10 py-6">
                    <QueryBoundary
                        fallback={<Loading />}
                        resetKeys={[filters.sourceId, filters.tagId, filters.q]}
                    >
                        <QuoteResults
                            keyword={filters.q}
                            viewMode={viewMode}
                            selectedId={selectedId}
                            onSelect={(id) => setPanel({ mode: 'view', id })}
                        />
                    </QueryBoundary>
                </div>
            </main>

            <aside className="min-h-0 overflow-y-auto border-l bg-card px-12 py-10">
                <QueryBoundary fallback={<Loading />} resetKeys={[panel]}>
                    <SidePanel panel={panel} onChange={setPanel} />
                </QueryBoundary>
            </aside>
        </div>
    )
}

type QuoteResultsProps = {
    keyword: string | undefined
    viewMode: ViewMode
    selectedId: number | null
    onSelect: (id: number) => void
}

function QuoteResults({ keyword, viewMode, selectedId, onSelect }: QuoteResultsProps) {
    // 用 route context 里组好的 options，跟 loader 抓的是同一个 cache entry
    const { quoteListQueryOptions } = Route.useRouteContext()
    const { data: quotes } = useSuspenseQuery(quoteListQueryOptions)

    return (
        <>
            <p className="mx-auto mb-4 max-w-5xl px-7 text-sm text-muted-foreground tabular-nums">
                {quotes.length} 句
            </p>
            <QuoteList
                quotes={quotes}
                viewMode={viewMode}
                selectedId={selectedId}
                keyword={keyword}
                onSelect={onSelect}
            />
        </>
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
                    点中间的一句，在这里看完整内容。
                    <br />
                    听到新的句子，按「新增名句」记下来。
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

    return (
        <SelectedQuote
            key={panel.id}
            id={panel.id}
            editing={panel.mode === 'edit'}
            onChange={onChange}
        />
    )
}

type SelectedQuoteProps = {
    id: number
    editing: boolean
    onChange: (panel: PanelState) => void
}

function SelectedQuote({ id, editing, onChange }: SelectedQuoteProps) {
    const queryClient = useQueryClient()
    const { data: quote } = useSuspenseQuery({
        ...quoteQueries.detail(id),
        // 列表里已经有这句，先拿来显示，不必 suspend；背景再取一次最新的
        initialData() {
            return findQuoteInLists(queryClient, id)
        },
    })

    if (!editing) {
        return <QuoteDetail quote={quote} onEdit={() => onChange({ mode: 'edit', id })} />
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">编辑名句</h2>
            <QuoteForm
                quote={quote}
                onSaved={() => onChange({ mode: 'view', id })}
                onCancel={() => onChange({ mode: 'view', id })}
                onDeleted={() => onChange({ mode: 'empty' })}
            />
        </div>
    )
}

function Loading() {
    return <p className="text-muted-foreground">载入中…</p>
}
