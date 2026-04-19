/** ターゲットとなるサイト設定 */
export interface Site {
  id: string
  name: string
  urlPattern: string
}

/** テンプレート1件 */
export interface Template {
  id: string
  title: string   // コンテキストメニューに表示する名前
  format: string  // プレースホルダーを含むテンプレート文字列
  targetSiteIds?: string[] // 個別テンプレートの対象サイトID
}

/** chrome.storage.local に保存するデータ全体 */
export interface StorageData {
  name: string
  templates: Template[]
  sites: Site[]
  targetUrls?: string[] // 旧バージョンからの移行用
}
