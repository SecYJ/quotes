import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
}

// 输入时先存在本地，停下 200ms 才更新筛选，避免每个字都改网址
export function SearchBox({ value, onChange, className = '' }: Props) {
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
    <div className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-stone-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.08 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.08A7 7 0 0 1 2 9Z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="search"
        className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pr-3 pl-10 text-stone-900 outline-none placeholder:text-stone-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="搜索句子内容或说话的人"
        aria-label="搜索"
      />
    </div>
  )
}
