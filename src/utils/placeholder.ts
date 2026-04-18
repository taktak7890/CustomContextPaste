/**
 * プレースホルダー展開ユーティリティ
 *
 * テンプレート文字列内の {{...}} を実際の値に展開します。
 *
 * 利用可能なプレースホルダー:
 *   {{name}}        → オプション画面で設定した名前
 *   {{YYYY/MM/DD}}  → 今日の日付（例: 2025/04/14）
 *   {{MM/DD}}       → 今日の月日（例: 04/14）
 *   {{YYYY-MM-DD}}  → 今日の日付（例: 2025-04-14）
 *   {{HH:mm}}       → 現在時刻（例: 09:00）
 *   {{HH:mm:ss}}    → 現在時刻（秒付き）
 *
 * 日付トークン（YYYY, MM, DD, HH, mm, ss）を {{...}} 内で自由に組み合わせ可能。
 * 例: {{YYYY年MM月DD日}} → 2025年04月14日
 */

export class PlaceholderExpander {
  private readonly name: string
  private readonly now: Date

  constructor(name: string, now: Date = new Date()) {
    this.name = name
    this.now = now
  }

  /**
   * テンプレート文字列を展開して返す。
   * 未知のプレースホルダーはそのまま残す。
   */
  expand(template: string): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key: string) => {
      // 名前
      if (key === 'name') return this.name

      // 日付・時刻トークンを含む場合は展開
      const resolved = this.resolveDateTimeTokens(key)
      return resolved !== key ? resolved : match
    })
  }

  private resolveDateTimeTokens(key: string): string {
    const YYYY = String(this.now.getFullYear())
    const MM   = String(this.now.getMonth() + 1).padStart(2, '0')
    const DD   = String(this.now.getDate()).padStart(2, '0')
    const HH   = String(this.now.getHours()).padStart(2, '0')
    const mm   = String(this.now.getMinutes()).padStart(2, '0')
    const ss   = String(this.now.getSeconds()).padStart(2, '0')

    let result = key
    result = result.replace(/YYYY/g, YYYY)
    result = result.replace(/MM/g,   MM)
    result = result.replace(/DD/g,   DD)
    result = result.replace(/HH/g,   HH)
    // 分の mm は小文字。YYYY/MM/DD の MM と衝突しないよう後処理
    result = result.replace(/mm/g,   mm)
    result = result.replace(/ss/g,   ss)

    return result
  }
}

/** 便利ラッパー関数 */
export function expandPlaceholders(format: string, name: string): string {
  return new PlaceholderExpander(name).expand(format)
}
