import React, { useState } from 'react'
import type { Site } from '../../types'

interface Props {
  sites: Site[]
  onChange: (sites: Site[]) => void
}

export default function SiteManager({ sites, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [urlInput, setUrlInput] = useState('')

  const isEditing = editingId !== null
  const canSave = nameInput.trim().length > 0 && urlInput.trim().length > 0

  const handleStartEdit = (site?: Site) => {
    if (site) {
      setEditingId(site.id)
      setNameInput(site.name)
      setUrlInput(site.urlPattern)
    } else {
      setEditingId('new')
      setNameInput('')
      setUrlInput('https://*/*')
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return

    const n = nameInput.trim()
    const u = urlInput.trim()

    if (editingId === 'new') {
      const newSite: Site = {
        id: crypto.randomUUID(),
        name: n,
        urlPattern: u,
      }
      onChange([...sites, newSite])
    } else {
      onChange(sites.map((s) => (s.id === editingId ? { ...s, name: n, urlPattern: u } : s)))
    }
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (!confirm('この対象サイトを削除してよろしいですか？\n※既に設定しているテンプレートからも解除されます。')) return
    onChange(sites.filter((s) => s.id !== id))
    if (editingId === id) setEditingId(null)
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-700">対象サイト設定</h2>
            <p className="text-xs text-slate-400">拡張機能を利用するサイトを登録してください</p>
          </div>
        </div>
        <button
          onClick={() => handleStartEdit()}
          disabled={isEditing}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                     text-white text-xs font-medium rounded-xl transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          サイトを追加
        </button>
      </div>

      {/* Editor Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="px-6 py-5 border-b border-slate-100 bg-emerald-50/60">
          <p className="text-xs font-semibold text-emerald-700 mb-3 uppercase tracking-wide">
            {editingId === 'new' ? '新規サイト登録' : 'サイト編集'}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">サイト名</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="例: 社内掲示板"
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">URLパターン</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="例: https://example.com/*"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={!canSave}
                className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List */}
      <ul className="divide-y divide-slate-100">
        {sites.length === 0 && !isEditing && (
          <li className="px-6 py-8 text-center">
            <p className="text-sm text-slate-500">対象サイトが登録されていません</p>
          </li>
        )}
        {sites.map((site) => (
          <li key={site.id} className={`px-6 py-4 flex items-center gap-4 transition-colors ${editingId !== site.id ? 'hover:bg-slate-50/70 group' : 'bg-slate-50/50'}`}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{site.name}</p>
              <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">{site.urlPattern}</p>
            </div>
            <div className={`flex items-center gap-1 shrink-0 transition-opacity ${editingId ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                type="button"
                onClick={() => handleStartEdit(site)}
                title="編集"
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(site.id)}
                title="削除"
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
