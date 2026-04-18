import React, { useRef, useState, useEffect } from 'react'

interface Props {
  initialTitle: string
  initialFormat: string
  onSave: (title: string, format: string) => void
  onCancel: () => void
  insertTrigger?: { ph: string; ts: number } | null
}

export default function TemplateForm({
  initialTitle,
  initialFormat,
  onSave,
  onCancel,
  insertTrigger,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [format, setFormat] = useState(initialFormat)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSave = title.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onSave(title, format)
  }

  /** カーソル位置にプレースホルダーを挿入するヘルパー */
  const insertPlaceholder = (placeholder: string) => {
    const ta = textareaRef.current
    if (!ta) {
      setFormat((f) => f + placeholder)
      return
    }
    const start = ta.selectionStart ?? format.length
    const end = ta.selectionEnd ?? format.length
    const next = format.slice(0, start) + placeholder + format.slice(end)
    setFormat(next)
    // フォーカスを戻してカーソル位置を調整
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + placeholder.length
    })
  }

  useEffect(() => {
    if (insertTrigger) {
      insertPlaceholder(insertTrigger.ph)
    }
  }, [insertTrigger])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* メニュー表示名 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          メニュー表示名 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 出社報告"
          autoFocus
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800
                     placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:border-transparent transition-all"
        />
      </div>

      {/* フォーマット */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          テンプレート文字列
        </label>
        {/* プレースホルダー挿入ボタン */}
        <div className="flex flex-wrap gap-1 mb-2">
          {['{{name}}', '{{MM/DD}}', '{{YYYY/MM/DD}}', '{{HH:mm}}'].map((ph) => (
            <button
              key={ph}
              type="button"
              onClick={() => insertPlaceholder(ph)}
              className="font-mono text-xs bg-white border border-slate-300 hover:border-blue-400 hover:text-blue-600
                         text-slate-500 px-2 py-0.5 rounded-md transition-colors"
            >
              {ph}
            </button>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          placeholder={'例: {{MM/DD}} {{name}} 出社します'}
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-800
                     placeholder:text-slate-300 placeholder:font-sans focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:border-transparent transition-all resize-none leading-relaxed"
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-300 hover:bg-slate-50
                     rounded-xl transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl
                     transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          保存
        </button>
      </div>
    </form>
  )
}
