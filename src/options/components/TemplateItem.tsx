import React from 'react'
import type { Template } from '../../types'

interface Props {
  template: Template
  index: number
  disabled: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function TemplateItem({
  template,
  index,
  disabled,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/70 transition-colors group">
      {/* 番号バッジ */}
      <span className="mt-0.5 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center
                       text-xs font-medium text-slate-400 shrink-0 group-hover:bg-slate-200 transition-colors">
        {index + 1}
      </span>

      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{template.title}</p>
        <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">{template.format}</p>
      </div>

      {/* 操作ボタン */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          disabled={disabled}
          title="編集"
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg
                     transition-colors disabled:pointer-events-none disabled:opacity-30"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={onDelete}
          disabled={disabled}
          title="削除"
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg
                     transition-colors disabled:pointer-events-none disabled:opacity-30"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
