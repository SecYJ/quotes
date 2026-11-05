import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'
import { QuoteBrowser } from '@/components/QuoteBrowser'
import { QuoteDetail } from '@/components/QuoteDetail'
import { SelectedQuote } from '@/components/SelectedQuote'
import { quoteListRouteOptions } from '@/lib/quote-route'

export const Route = createFileRoute('/')({
    ...quoteListRouteOptions,
    component: QuotesPage,
})

type PanelState = { mode: 'empty' } | { mode: 'view'; id: number }

// 阅览页只读：右栏只显示详细，写入都在 /admin
function QuotesPage() {
    const { quoteListQueryOptions } = Route.useRouteContext()
    const [panel, setPanel] = useState<PanelState>({ mode: 'empty' })

    return (
        <QuoteBrowser
            listQueryOptions={quoteListQueryOptions}
            selectedId={panel.mode === 'view' ? panel.id : null}
            onSelect={(id) => setPanel({ mode: 'view', id })}
            headerAction={
                // 用 buttonVariants 而不是 Button 的 render：后者会把链接标成 role="button"
                <Link
                    to="/admin"
                    className={buttonVariants({
                        variant: 'ghost',
                        size: 'lg',
                        className: 'text-muted-foreground',
                    })}
                >
                    登入
                </Link>
            }
            panelResetKey={panel}
        >
            {panel.mode === 'empty' ? (
                <EmptyPanel />
            ) : (
                <SelectedQuote key={panel.id} id={panel.id}>
                    {(quote) => <QuoteDetail quote={quote} />}
                </SelectedQuote>
            )}
        </QuoteBrowser>
    )
}

function EmptyPanel() {
    return (
        <div className="flex h-full items-center justify-center text-center leading-loose text-muted-foreground">
            <p>点中间的一句，在这里看完整内容。</p>
        </div>
    )
}
