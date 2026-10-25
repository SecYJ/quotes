import { RotateCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorNotice({ error, onRetry }: { error: unknown; onRetry: () => void }) {
    return (
        <div role="alert" className="flex flex-col items-start gap-3 py-6">
            <p className="text-destructive">
                资料没有载入成功：{error instanceof Error ? error.message : String(error)}
            </p>
            <Button variant="outline" onClick={onRetry}>
                <RotateCwIcon data-icon="inline-start" />
                重新载入
            </Button>
        </div>
    )
}
