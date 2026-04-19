# Custom Context Paste 拡張機能

ブラウザ上の入力欄を右クリックし、登録済みテンプレートをカーソル位置にすばやく挿入できる Chrome 拡張機能。対象となるサイトを自由に設定し、各テンプレートをどのサイトで出し分けるかも指定できます。

---

## ファイル構成

```
.
├── public/
│   ├── manifest.json       # MV3 マニフェスト（distにそのままコピーされる）
│   └── icon.png            # 拡張機能アイコン（別途用意）
├── src/
│   ├── types.ts            # 共通型定義 (Template, StorageData)
│   ├── background.ts       # Service Worker：メニュー管理 & テキスト挿入
│   ├── utils/
│   │   └── placeholder.ts  # プレースホルダー展開エンジン
│   └── options/
│       ├── main.tsx        # React エントリポイント
│       ├── index.css       # Tailwind CSS
│       ├── App.tsx         # ルートコンポーネント
│       └── components/
│           ├── GlobalSettings.tsx  # 名前設定
│           ├── SiteManager.tsx     # 対象サイトの追加・管理
│           ├── TemplateManager.tsx # テンプレート一覧・管理
│           ├── TemplateForm.tsx    # 新規作成・編集フォーム
│           └── TemplateItem.tsx   # テンプレート1件の表示
├── options.html            # Vite の HTML エントリ（React アプリ）
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## セットアップ & ビルド手順

```bash
# 1. 依存関係のインストール
npm install

# 2. プロダクションビルド（dist/ に出力される）
npm run build

# 3. 開発中はウォッチモード（ファイル変更時に自動再ビルド）
npm run dev
```

### Chrome への読み込み

1. Chrome で `chrome://extensions` を開く
2. 「デベロッパーモード」を ON にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. **`dist/` フォルダ**を選択する

---

## 機能概要

### 動的コンテキストメニュー

- オプション画面で登録したテンプレートの数だけメニューが生成される
- `chrome.storage.onChanged` で保存を検知し、メニューを即時更新
- Service Worker 再起動時（`onStartup`）にも再構築される

### プレースホルダー

`src/utils/placeholder.ts` の `PlaceholderExpander` クラスが担当。  
`{{...}}` の中身を走査し、以下のトークンを展開する。

| プレースホルダー | 展開結果の例 |
|---|---|
| `{{name}}` | 山田 太郎（設定した名前） |
| `{{YYYY/MM/DD}}` | 2025/04/14 |
| `{{MM/DD}}` | 04/14 |
| `{{YYYY-MM-DD}}` | 2025-04-14 |
| `{{HH:mm}}` | 09:30 |
| `{{HH:mm:ss}}` | 09:30:00 |
| `{{YYYY年MM月DD日}}` | 2025年04月14日（自由な組み合わせも可） |

**将来の拡張**: `PlaceholderExpander` にメソッドを追加するだけで新しいプレースホルダーを実装できる。

### カーソル位置へのテキスト挿入（3段階フォールバック）

`src/background.ts` の `insertTextAtCursor` 関数（`executeScript` で注入）が担当。

1. **`document.execCommand('insertText')`**  
   高度なリッチエディタ（contenteditable）への挿入に最も確実。現時点で多くの最新サイトに推奨。

2. **Selection / Range API**（execCommand が失敗した場合）  
   `window.getSelection()` でキャレット位置を取得 → `range.insertNode(textNode)` で挿入 → `InputEvent` を dispatch して React/Angular に変更を通知。

3. **`<input>` / `<textarea>` へのフォールバック**  
   `selectionStart/End` を使って値を直接書き換え。

### ストレージのデータ構造

```ts
// chrome.storage.local に保存
interface StorageData {
  name: string
  templates: Array<{
    id: string     // crypto.randomUUID()
    title: string  // コンテキストメニュー表示名
    format: string // プレースホルダーを含む文字列
    targetSiteIds?: string[] // このテンプレートが有効なサイトのID配列
  }>
  sites: Array<{
    id: string     // crypto.randomUUID() または 'default'
    name: string   // サイトの表示名
    urlPattern: string // コンテキストメニューの documentUrlPatterns（例: https://example.com/*）
  }>
}
```

---

## ビルド設定のポイント（vite.config.ts）

```ts
rollupOptions: {
  input: {
    options: resolve(__dirname, 'options.html'),   // React オプションページ
    background: resolve(__dirname, 'src/background.ts'), // Service Worker
  },
  output: {
    // background.js はルートに配置（manifest が参照するため）
    entryFileNames: (chunkInfo) =>
      chunkInfo.name === 'background' ? '[name].js' : 'assets/[name].[hash].js',
  }
}
```

- `public/manifest.json` は Vite が `dist/` ルートにそのままコピー
- `options.html` → `dist/options.html`（スクリプト参照は自動更新）
- `background.ts` → `dist/background.js`（単一ファイルにバンドル）
- `manifest.json` の `"type": "module"` により background.js は ES Module として動作
