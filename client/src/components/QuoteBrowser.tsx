import type { ReactNode } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { LayoutGridIcon, ListIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FilterSidebar } from '@/components/FilterSidebar'
import { QueryBoundary } from '@/components/QueryBoundary'
import { QuoteList } from '@/components/QuoteList'
import { SearchBox } from '@/components/SearchBox'
import type { quoteQueries } from '@/lib/queries'
import { useQuoteFilters } from '@/lib/search'
import { useViewMode } from '@/lib/view-mode'
import type { ViewMode } from '@/lib/view-mode'

type Props = {
    // route context 里依 search params 组好的 options，跟 loader 抓的是同一个 cache entry
    listQueryOptions: ReturnType<typeof quoteQueries.list>
    selectedId: number | null
    onSelect: (id: number) => void
    // 中栏标题列最右边的操作（阅览页放「登入」，管理页不放）
    headerAction?: ReactNode
    // 右栏内容改变时，用这个值清掉右栏的错误状态
    panelResetKey: unknown
    // 右栏内容
    children: ReactNode
}

// 三栏式。左：筛选；中：搜索 + 列表（row / grid）；右：由使用的页面决定
export function QuoteBrowser({
    listQueryOptions,
    selectedId,
    onSelect,
    headerAction,
    panelResetKey,
    children,
}: Props) {
    const { filters, setFilters } = useQuoteFilters()
    const [viewMode, setViewMode] = useViewMode()

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
                        {headerAction}
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-10 py-6">
                    <QueryBoundary
                        fallback={<Loading />}
                        resetKeys={[filters.sourceId, filters.tagId, filters.q]}
                    >
                        <QuoteResults
                            listQueryOptions={listQueryOptions}
                            keyword={filters.q}
                            viewMode={viewMode}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                    </QueryBoundary>
                </div>
            </main>

            <aside className="min-h-0 overflow-y-auto border-l bg-card px-12 py-10">
                <QueryBoundary fallback={<Loading />} resetKeys={[panelResetKey]}>
                    {children}
                </QueryBoundary>
            </aside>
        </div>
    )
}

type ResultsProps = {
    listQueryOptions: Props['listQueryOptions']
    keyword: string | undefined
    viewMode: ViewMode
    selectedId: number | null
    onSelect: (id: number) => void
}

function QuoteResults({ listQueryOptions, keyword, viewMode, selectedId, onSelect }: ResultsProps) {
    const { data: quotes } = useSuspenseQuery(listQueryOptions)

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

function Loading() {
    return <p className="text-muted-foreground">载入中…</p>
}
