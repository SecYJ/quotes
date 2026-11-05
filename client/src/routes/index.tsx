import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QuoteBrowser } from '@/components/QuoteBrowser'
import { QuoteDetail } from '@/components/QuoteDetail'
import { QuoteForm } from '@/components/QuoteForm'
import { findQuoteInLists, quoteQueries } from '@/lib/queries'
import { quoteListRouteOptions } from '@/lib/quote-route'

export const Route = createFileRoute('/')({
    ...quoteListRouteOptions,
    component: QuotesPage,
})

type PanelState = { mode: 'empty' } | { mode: 'view'; id: number } | { mode: 'edit'; id: number }

function QuotesPage() {
    const { quoteListQueryOptions } = Route.useRouteContext()
    const [panel, setPanel] = useState<PanelState>({ mode: 'empty' })
    const [creating, setCreating] = useState(false)
    const selectedId = panel.mode === 'view' || panel.mode === 'edit' ? panel.id : null

    return (
        <>
            <QuoteBrowser
                listQueryOptions={quoteListQueryOptions}
                selectedId={selectedId}
                onSelect={(id) => setPanel({ mode: 'view', id })}
                headerAction={
                    <Button size="lg" className="px-4" onClick={() => setCreating(true)}>
                        <PlusIcon data-icon="inline-start" />
                        新增名句
                    </Button>
                }
                panelResetKey={panel}
            >
                <SidePanel panel={panel} onChange={setPanel} />
            </QuoteBrowser>

            <NewQuoteDialog open={creating} onOpenChange={setCreating} />
        </>
    )
}

function NewQuoteDialog({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    return (
        // 点外面不关闭，避免误触丢掉写到一半的句子；Esc 与「取消」仍可关闭
        <Dialog open={open} onOpenChange={onOpenChange} disablePointerDismissal>
            <DialogContent className="max-h-[calc(100vh-4rem)] gap-6 overflow-y-auto p-10 sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">新增名句</DialogTitle>
                </DialogHeader>
                {/* 关闭时内容会卸载，下次打开是空白的表单 */}
                <QuoteForm
                    onSaved={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

function SidePanel({
    panel,
    onChange,
}: {
    panel: PanelState
    onChange: (panel: PanelState) => void
}) {
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
