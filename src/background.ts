/// <reference types="chrome"/>

import type { StorageData, Template } from './types'
import { expandPlaceholders } from './utils/placeholder'

const DEFAULT_URL_PATTERNS = ['https://chat.google.com/*']

// ─────────────────────────────────────────────
// コンテキストメニューの再構築
// ─────────────────────────────────────────────

async function rebuildContextMenus(): Promise<void> {
  await chrome.contextMenus.removeAll()

  const data = (await chrome.storage.local.get(['name', 'templates', 'targetUrls', 'sites'])) as Partial<StorageData>
  const templates: Template[] = data.templates ?? []
  
  let sites = data.sites ?? [];
  if (sites.length === 0 && data.targetUrls && data.targetUrls.length > 0) {
    sites = data.targetUrls.map(url => ({
      id: crypto.randomUUID(),
      name: url.includes('chat.google.com') ? 'Google Chat' : url,
      urlPattern: url
    }));
  }
  if (sites.length === 0) {
    sites = [{ id: 'default', name: 'すべてのサイト (デフォルト)', urlPattern: '<all_urls>' }];
  }

  const siteUrlMap = new Map<string, string>();
  for (const s of sites) {
    siteUrlMap.set(s.id, s.urlPattern);
  }
  const globalPatterns = sites.map(s => s.urlPattern);

  const globalCreateProps: chrome.contextMenus.CreateProperties = {
    contexts: ['editable'],
    documentUrlPatterns: globalPatterns,
  }

  if (templates.length === 0) {
    chrome.contextMenus.create({
      ...globalCreateProps,
      id: 'no_templates',
      title: 'テンプレートが登録されていません',
      enabled: false,
    }, () => {
      const err = chrome.runtime.lastError;
      if (err) console.warn('Context menu creation failed:', err.message);
    })
    return
  }

  for (const tmpl of templates) {
    let tmplPatterns: string[] = [];
    if (tmpl.targetSiteIds && tmpl.targetSiteIds.length > 0) {
      tmplPatterns = tmpl.targetSiteIds.map(id => siteUrlMap.get(id)).filter(Boolean) as string[];
    }
    
    // Migration fallback for templates saved briefly with old targetUrls struct
    const oldTargetUrls = (tmpl as any).targetUrls;
    if (tmplPatterns.length === 0 && oldTargetUrls && oldTargetUrls.length > 0) {
      tmplPatterns = oldTargetUrls;
    }

    if (tmplPatterns.length === 0) {
      tmplPatterns = globalPatterns;
    }

    chrome.contextMenus.create({
      contexts: ['editable'],
      documentUrlPatterns: tmplPatterns,
      id: `template_${tmpl.id}`,
      title: tmpl.title,
    }, () => {
      const err = chrome.runtime.lastError;
      if (err) console.warn(`Context menu creation failed for template ${tmpl.title}:`, err.message);
    })
  }
}

// ─────────────────────────────────────────────
// イベントリスナー
// ─────────────────────────────────────────────

// インストール時
chrome.runtime.onInstalled.addListener(() => {
  rebuildContextMenus()
})

// ブラウザ起動時（Service Worker が再生成される場合に備える）
chrome.runtime.onStartup.addListener(() => {
  rebuildContextMenus()
})

// ストレージ変更時（オプション画面で保存 → メニュー即時更新）
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && ('templates' in changes || 'name' in changes || 'targetUrls' in changes || 'sites' in changes)) {
    rebuildContextMenus()
  }
})

// 拡張機能アイコンをクリックしたときオプションページを開く
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage()
})

// コンテキストメニュークリック時
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return
  const menuItemId = String(info.menuItemId)
  if (!menuItemId.startsWith('template_')) return

  const templateId = menuItemId.slice('template_'.length)

  const data = (await chrome.storage.local.get(['name', 'templates'])) as Partial<StorageData>
  const templates: Template[] = data.templates ?? []
  const name: string = data.name ?? ''

  const template = templates.find((t) => t.id === templateId)
  if (!template) return

  const expanded = expandPlaceholders(template.format, name)

  await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    args: [expanded],
    func: insertTextAtCursor,
  })
})

// ─────────────────────────────────────────────
// カーソル位置へのテキスト挿入関数
//
// ※ chrome.scripting.executeScript の func として渡すため、
//   この関数はクロージャへの参照を持たない自己完結した関数である必要がある。
// ─────────────────────────────────────────────

function insertTextAtCursor(text: string): void {
  const active = document.activeElement as HTMLElement | null
  if (!active) return

  const isContentEditable = active.isContentEditable
  const isInputLike =
    active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement

  if (!isContentEditable && !isInputLike) return

  // ① execCommand（deprecated だが一部のサイト等のエディタに最も確実に効く）
  if (document.execCommand('insertText', false, text)) return

  // ② フォールバック: contenteditable に Selection / Range API で挿入
  if (isContentEditable) {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      // 選択範囲がない場合は末尾に追加
      active.textContent = (active.textContent ?? '') + text
      return
    }

    const range = selection.getRangeAt(0)
    range.deleteContents()

    const textNode = document.createTextNode(text)
    range.insertNode(textNode)

    // カーソルをテキスト末尾に移動
    range.setStartAfter(textNode)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)

    // React / Angular など仮想 DOM フレームワークに変更を通知
    active.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text,
      }),
    )
    return
  }

  // ③ フォールバック: input / textarea への挿入
  if (isInputLike) {
    const el = active as HTMLInputElement | HTMLTextAreaElement
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    el.value = el.value.slice(0, start) + text + el.value.slice(end)
    el.selectionStart = el.selectionEnd = start + text.length
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
}
