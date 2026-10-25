import { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
}

// 输入时先存在本地，停下 200ms 才更新筛选，避免每个字都改网址
export function SearchBox({ value, onChange, className }: Props) {
  const [draft, setDraft] = useState(value)
  const sent = useRef(value)

  // 只在外部改变时同步（例如清除筛选），自己送出的值不覆盖正在输入的内容
  useEffect(() => {
    if (value !== sent.current) {
      sent.current = value
      setDraft(value)
    }
  }, [value])

  useEffect(() => {
    if (draft === sent.current) return
    const timer = setTimeout(() => {
      sent.current = draft
      onChange(draft)
    }, 200)
    return () => clearTimeout(timer)
  }, [draft, onChange])

  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        className="h-10 pl-9 md:text-base"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="搜索句子内容或说话的人"
        aria-label="搜索"
      />
    </div>
  )
}
