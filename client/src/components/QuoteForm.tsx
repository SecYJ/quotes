import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useCreateQuote, useCreateSource, useDeleteQuote, useUpdateQuote } from '../lib/queries'
import type { Quote, QuoteInput } from '../lib/types'
import { SourcePicker } from './SourcePicker'
import type { SourceChoice } from './SourcePicker'
import { TagInput } from './TagInput'

type Props = {
  // 有 quote 是编辑，没有是新增
  quote?: Quote
  onSaved: (quote: Quote) => void
  onCancel: () => void
  onDeleted?: () => void
}

type Errors = {
  content?: string
  source?: string
}

export function QuoteForm({ quote, onSaved, onCancel, onDeleted }: Props) {
  const [content, setContent] = useState(quote?.content ?? '')
  const [speaker, setSpeaker] = useState(quote?.speaker ?? '')
  const [source, setSource] = useState<SourceChoice>({ kind: 'existing', sourceId: quote?.source.id ?? null })
  const [sourceDetail, setSourceDetail] = useState(quote?.sourceDetail ?? '')
  const [tags, setTags] = useState(quote?.tags.map((tag) => tag.name) ?? [])
  const [note, setNote] = useState(quote?.note ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const createSource = useCreateSource()
  const createQuote = useCreateQuote()
  const updateQuote = useUpdateQuote()
  const deleteQuote = useDeleteQuote()
  const saving = createSource.isPending || createQuote.isPending || updateQuote.isPending

  function validate() {
    const next: Errors = {}
    if (content.trim() === '') next.content = '请输入句子内容'
    if (source.kind === 'existing' && source.sourceId === null) next.source = '请选择出处'
    if (source.kind === 'new' && source.title.trim() === '') next.source = '请输入出处名称'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function resolveSourceId() {
    if (source.kind === 'existing') return source.sourceId!
    const created = await createSource.mutateAsync({ type: source.type, title: source.title.trim() })
    // 之后再储存失败时不会重复建立同一个出处
    setSource({ kind: 'existing', sourceId: created.id })
    return created.id
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const input: QuoteInput = {
      content: content.trim(),
      speaker: emptyToNull(speaker),
      sourceId: await resolveSourceId(),
      sourceDetail: emptyToNull(sourceDetail),
      note: emptyToNull(note),
      tags,
    }
    const saved = quote
      ? await updateQuote.mutateAsync({ id: quote.id, input })
      : await createQuote.mutateAsync(input)
    onSaved(saved)
  }

  async function handleDelete() {
    if (!quote) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    await deleteQuote.mutateAsync(quote.id)
    onDeleted?.()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <Field label="句子内容" required error={errors.content}>
        <textarea
          className={`${inputClass} min-h-32 w-full resize-y leading-relaxed`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记下你听到的那句话"
          autoFocus
        />
      </Field>

      <Field label="谁说的">
        <input
          className={`${inputClass} w-full`}
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          placeholder="选填"
        />
      </Field>

      <Field label="出处" required>
        <SourcePicker value={source} onChange={setSource} error={errors.source} />
      </Field>

      <Field label="出处细节">
        <input
          className={`${inputClass} w-full`}
          value={sourceDetail}
          onChange={(e) => setSourceDetail(e.target.value)}
          placeholder="选填，例如第几集、哪个场合"
        />
      </Field>

      <Field label="标签">
        <TagInput value={tags} onChange={setTags} />
      </Field>

      <Field label="笔记">
        <textarea
          className={`${inputClass} min-h-20 w-full resize-y`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="选填"
        />
      </Field>

      <div className="flex items-center gap-3 border-t border-stone-200 pt-5">
        <button
          type="submit"
          className="rounded-md bg-teal-700 px-5 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? '储存中…' : '储存'}
        </button>
        <button
          type="button"
          className="rounded-md px-4 py-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          onClick={onCancel}
        >
          取消
        </button>
        {quote && (
          <button
            type="button"
            className={`ml-auto rounded-md px-4 py-2 ${
              confirmingDelete ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-600 hover:bg-red-50'
            }`}
            onClick={handleDelete}
            onBlur={() => setConfirmingDelete(false)}
            disabled={deleteQuote.isPending}
          >
            {deleteQuote.isPending ? '删除中…' : confirmingDelete ? '确定删除？' : '删除'}
          </button>
        )}
      </div>
    </form>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </p>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const inputClass =
  'rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none placeholder:text-stone-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'
