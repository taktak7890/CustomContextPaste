/// <reference types="chrome"/>

import type { StorageData, Template } from './types'
import { expandPlaceholders } from './utils/placeholder'

const DOCUMENT_URL_PATTERNS = ['https://chat.google.com/*']

// ─────────────────────────────────────────────
// コンテキストメニューの再構築
// ─────────────────────────────────────────────

async function rebuildContextMenus(): Promise<void> {
  await chrome.contextMenus.removeAll()

  const data = (await chrome.storage.local.get(['name', 'templates'])) as Partial<StorageData>
  const templates: Template[] = data.templates ?? []

  if (templates.length === 0) {
    chrome.contextMenus.create({
      id: 'no_templates',
      title: 'テンプレートが登録されていません',
      contexts: ['editable'],
      documentUrlPatterns: DOCUMENT_URL_PATTERNS,
      enabled: false,
    })
    return
  }

  for (const tmpl of templates) {
    chrome.contextMenus.create({
      id: `template_${tmpl.id}`,
      title: tmpl.title,
      contexts: ['editable'],
      documentUrlPatterns: DOCUMENT_URL_PATTERNS,
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
  if (area === 'sync' && ('templates' in changes || 'name' in changes)) {
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

  // ① execCommand（deprecated だが現時点で Google Chat に最も確実に効く）
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
