import React, { useState } from 'react'
import type { Template } from '../../types'
import TemplateForm from './TemplateForm'
import TemplateItem from './TemplateItem'

interface Props {
  templates: Template[]
  onChange: (templates: Template[]) => void
}

export default function TemplateManager({ templates, onChange }: Props) {
  // 'new' = 新規作成フォーム表示中、string = 該当 id の編集フォーム表示中、null = 非表示
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [insertTrigger, setInsertTrigger] = useState<{ ph: string; ts: number } | null>(null)

  const handlePlaceholderClick = (ph: string) => {
    if (editingId === null) {
      setEditingId('new')
    }
    setInsertTrigger({ ph, ts: Date.now() })
  }

  const handleSaveNew = (title: string, format: string) => {
    const newTemplate: Template = {
      id: crypto.randomUUID(),
      title: title.trim(),
      format,
    }
    onChange([...templates, newTemplate])
    setEditingId(null)
  }

  const handleUpdate = (id: string, title: string, format: string) => {
    onChange(
      templates.map((t) =>
        t.id === id ? { ...t, title: title.trim(), format } : t,
      ),
    )
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return
    onChange(templates.filter((t) => t.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const isEditing = editingId !== null

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-700">テンプレート一覧</h2>
            <p className="text-xs text-slate-400">
              {templates.length > 0
                ? `${templates.length} 件登録済み`
                : '未登録'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditingId('new')}
          disabled={isEditing}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                     text-white text-xs font-medium rounded-xl transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          テンプレートを追加
        </button>
      </div>

      {/* 新規作成フォーム */}
      {editingId === 'new' && (
        <div className="px-6 py-5 border-b border-slate-100 bg-blue-50/60">
          <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">
            新規テンプレート
          </p>
          <TemplateForm
            initialTitle=""
            initialFormat=""
            onSave={handleSaveNew}
            onCancel={() => setEditingId(null)}
            insertTrigger={editingId === 'new' ? insertTrigger : null}
          />
        </div>
      )}

      {/* リスト */}
      {templates.length === 0 && editingId !== 'new' ? (
        <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">テンプレートがありません</p>
            <p className="text-xs text-slate-400 mt-0.5">「テンプレートを追加」から作成してください</p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {templates.map((template, index) => (
            <li key={template.id}>
              {editingId === template.id ? (
                <div className="px-6 py-5 bg-amber-50/60">
                  <p className="text-xs font-semibold text-amber-700 mb-3 uppercase tracking-wide">
                    テンプレートを編集
                  </p>
                  <TemplateForm
                    initialTitle={template.title}
                    initialFormat={template.format}
                    onSave={(title, format) => handleUpdate(template.id, title, format)}
                    onCancel={() => setEditingId(null)}
                    insertTrigger={editingId === template.id ? insertTrigger : null}
                  />
                </div>
              ) : (
                <TemplateItem
                  template={template}
                  index={index}
                  disabled={isEditing}
                  onEdit={() => setEditingId(template.id)}
                  onDelete={() => handleDelete(template.id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {/* プレースホルダー一覧（フッター） */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80">
        <p className="text-xs font-medium text-slate-500 mb-2">利用可能なプレースホルダー <span className="text-[10px] font-normal text-slate-400">（クリックで挿入）</span></p>
        <div className="flex flex-wrap gap-1.5">
          {[
            '{{name}}',
            '{{YYYY/MM/DD}}',
            '{{MM/DD}}',
            '{{YYYY-MM-DD}}',
            '{{HH:mm}}',
            '{{HH:mm:ss}}',
          ].map((ph) => (
            <button
              key={ph}
              type="button"
              onClick={() => handlePlaceholderClick(ph)}
              className="font-mono text-xs bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 px-2 py-0.5 rounded-md shadow-sm transition-colors cursor-pointer"
            >
              {ph}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          例：<span className="font-mono text-slate-500">{'{{MM/DD}} {{name}} 出社します'}</span>
          →　<span className="text-slate-600">04/14 山田 太郎 出社します</span>
        </p>
      </div>
    </section>
  )
}
