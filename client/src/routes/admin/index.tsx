import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { QuoteBrowser } from '@/components/QuoteBrowser'
import { QuoteForm } from '@/components/QuoteForm'
import { SelectedQuote } from '@/components/SelectedQuote'
import { quoteListRouteOptions } from '@/lib/quote-route'

export const Route = createFileRoute('/admin/')({
    ...quoteListRouteOptions,
    component: AdminQuotesPage,
})

// 右栏只有两种状态：新增（预设）或编辑某一句，不用 dialog
type AdminPanel = { mode: 'new' } | { mode: 'edit'; id: number }

function AdminQuotesPage() {
    const { quoteListQueryOptions } = Route.useRouteContext()
    const [panel, setPanel] = useState<AdminPanel>({ mode: 'new' })

    return (
        <QuoteBrowser
            listQueryOptions={quoteListQueryOptions}
            selectedId={panel.mode === 'edit' ? panel.id : null}
            onSelect={(id) => setPanel({ mode: 'edit', id })}
            panelResetKey={panel}
        >
            {panel.mode === 'new' ? (
                <NewQuote />
            ) : (
                <EditQuote key={panel.id} id={panel.id} onNew={() => setPanel({ mode: 'new' })} />
            )}
        </QuoteBrowser>
    )
}

function NewQuote() {
    // 储存后换 key 重新挂载，得到一张空白表单（光标回到句子内容）
    const [formKey, setFormKey] = useState(0)

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">新增名句</h2>
            <QuoteForm key={formKey} onSaved={() => setFormKey((key) => key + 1)} />
        </div>
    )
}

function EditQuote({ id, onNew }: { id: number; onNew: () => void }) {
    return (
        <SelectedQuote id={id}>
            {(quote) => (
                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">编辑名句</h2>
                        <Button type="button" variant="outline" size="lg" onClick={onNew}>
                            新增另一句
                        </Button>
                    </div>
                    <QuoteForm quote={quote} onDeleted={onNew} />
                </div>
            )}
        </SelectedQuote>
    )
}
