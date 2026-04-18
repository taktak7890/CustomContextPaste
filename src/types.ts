/** テンプレート1件 */
export interface Template {
  id: string
  title: string   // コンテキストメニューに表示する名前
  format: string  // プレースホルダーを含むテンプレート文字列
}

/** chrome.storage.local に保存するデータ全体 */
export interface StorageData {
  name: string
  templates: Template[]
}
