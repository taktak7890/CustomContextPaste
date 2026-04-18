import React, { useEffect, useState } from 'react'

interface Props {
  name: string
  onSave: (name: string) => void
}

export default function GlobalSettings({ name, onSave }: Props) {
  const [value, setValue] = useState(name)

  // 親から name が変わったら同期
  useEffect(() => {
    setValue(name)
  }, [name])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(value.trim())
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* セクションヘッダー */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-700">グローバル設定</h2>
          <p className="text-xs text-slate-400">すべてのテンプレートで共通の名前</p>
        </div>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="px-6 py-5">
        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
          名前
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="例: 山田 太郎"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-300
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium
                       rounded-xl transition-colors"
          >
            保存
          </button>
        </div>

        {/* ヒント */}
        <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            テンプレート内の{' '}
            <code className="font-mono bg-slate-100 text-slate-600 px-1 py-0.5 rounded text-xs">
              {'{{name}}'}
            </code>{' '}
            にこの名前が展開されます。
          </span>
        </div>
      </form>
    </section>
  )
}
