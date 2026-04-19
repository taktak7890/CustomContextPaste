import React, { useCallback, useEffect, useState } from 'react'
import type { Site, StorageData, Template } from '../types'
import GlobalSettings from './components/GlobalSettings'
import SiteManager from './components/SiteManager'
import TemplateManager from './components/TemplateManager'

type SaveStatus = 'idle' | 'saving' | 'saved'

export default function App() {
  const [name, setName] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // ストレージから初期値を読み込む
  useEffect(() => {
    chrome.storage.local.get(['name', 'templates', 'targetUrls', 'sites'], (data: Partial<StorageData>) => {
      setName(data.name ?? '')
      setTemplates(data.templates ?? [])
      
      // 旧バージョン(targetUrls)からの移行処理
      let loadedSites = data.sites ?? []
      if (loadedSites.length === 0 && data.targetUrls && data.targetUrls.length > 0) {
        // targetUrls を sites に変換
        loadedSites = data.targetUrls.map(url => ({
          id: crypto.randomUUID(),
          name: url.includes('chat.google.com') ? 'Google Chat' : url,
          urlPattern: url
        }))
        // 保存は persist によって即時行われる（ユーザーが何か変えた時）か、
        // ここで強制アップデートするのもありだが、とりあえず State に持たせるだけにしておく
      }
      
      // 初回起動で両方空の場合のデフォルト設定
      if (loadedSites.length === 0 && (!data.targetUrls || data.targetUrls.length === 0)) {
        loadedSites = [
          {
            id: crypto.randomUUID(),
            name: 'すべてのサイト (デフォルト)',
            urlPattern: '<all_urls>'
          }
        ]
      }

      const isInitial = (data.name ?? '') === '' && 
                        loadedSites.length === 1 && 
                        loadedSites[0].name === 'すべてのサイト (デフォルト)' && 
                        loadedSites[0].urlPattern === '<all_urls>';
                        
      setIsSettingsOpen(isInitial);
      setSites(loadedSites)
      setLoading(false)
    })
  }, [])

  // ストレージへ保存
  const persist = useCallback(
    (nextName: string, nextTemplates: Template[], nextSites: Site[]) => {
      setSaveStatus('saving')
      // targetUrls はもう更新しないが、残しておいても実害はないのでそのままか除去する
      chrome.storage.local.set({ name: nextName, templates: nextTemplates, sites: nextSites }, () => {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      })
    },
    [],
  )

  const handleNameSave = (newName: string) => {
    setName(newName)
    persist(newName, templates, sites)
  }

  const handleTemplatesChange = (newTemplates: Template[]) => {
    setTemplates(newTemplates)
    persist(name, newTemplates, sites)
  }

  const handleSitesChange = (newSites: Site[]) => {
    setSites(newSites)
    persist(name, templates, newSites)
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
              <p className="text-xs text-slate-400 mt-0.5">Custom Context Paste 拡張機能</p>
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
        <details 
          className="group" 
          open={isSettingsOpen}
          onToggle={(e) => setIsSettingsOpen(e.currentTarget.open)}
        >
          <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors [&::-webkit-details-marker]:hidden">
            <svg className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            共通設定・対象サイトの管理
          </summary>
          <div className="pt-5 space-y-6">
            <GlobalSettings name={name} onSave={handleNameSave} />
            <SiteManager sites={sites} onChange={handleSitesChange} />
          </div>
        </details>

        <TemplateManager templates={templates} sites={sites} onChange={handleTemplatesChange} />
      </main>
    </div>
  )
}
