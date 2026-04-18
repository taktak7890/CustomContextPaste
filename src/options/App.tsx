import React, { useCallback, useEffect, useState } from 'react'
import type { StorageData, Template } from '../types'
import GlobalSettings from './components/GlobalSettings'
import TemplateManager from './components/TemplateManager'

type SaveStatus = 'idle' | 'saving' | 'saved'

export default function App() {
  const [name, setName] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // ストレージから初期値を読み込む
  useEffect(() => {
    chrome.storage.local.get(['name', 'templates'], (data: Partial<StorageData>) => {
      setName(data.name ?? '')
      setTemplates(data.templates ?? [])
      setLoading(false)
    })
  }, [])

  // ストレージへ保存（name / templates の一方が変わった際に両方保存）
  const persist = useCallback(
    (nextName: string, nextTemplates: Template[]) => {
      setSaveStatus('saving')
      chrome.storage.local.set({ name: nextName, templates: nextTemplates }, () => {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      })
    },
    [],
  )

  const handleNameSave = (newName: string) => {
    setName(newName)
    persist(newName, templates)
  }

  const handleTemplatesChange = (newTemplates: Template[]) => {
    setTemplates(newTemplates)
    persist(name, newTemplates)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium">読み込み中…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* アイコン */}
            <img src="/icon.png" alt="アイコン" className="w-8 h-8 rounded-lg shadow-sm" />
            <div>
              <h1 className="text-base font-semibold text-slate-800 leading-none">テンプレート設定</h1>
              <p className="text-xs text-slate-400 mt-0.5">Google Chat テンプレート拡張機能</p>
            </div>
          </div>

          {/* 保存ステータス */}
          <div className="text-xs font-medium h-6 flex items-center">
            {saveStatus === 'saving' && (
              <span className="text-slate-400 flex items-center gap-1.5">
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                保存中…
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                保存しました
              </span>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <GlobalSettings name={name} onSave={handleNameSave} />
        <TemplateManager templates={templates} onChange={handleTemplatesChange} />
      </main>
    </div>
  )
}
