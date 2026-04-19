# スキル名: プレースホルダーの追加

## Goal
`src/utils/placeholder.ts` に新しい動的プレースホルダーを追加し、ユーザーがテンプレート内で利用できるようにする。

## Context
- 対象ファイル: [placeholder.ts](file:///c:/workspace/CustomContextPaste/src/utils/placeholder.ts)
- プレースホルダー形式: `{{KEYWORD}}`

## Steps

1. **対象ファイルの構造確認**
   - [placeholder.ts](file:///c:/workspace/CustomContextPaste/src/utils/placeholder.ts) を `view_file` で開き、既存の `resolveDateTimeTokens` メソッドや `expand` メソッドを確認する。

2. **JSDoc/コメントの追加**
   - ファイル冒頭のドキュメントに、新しく追加するプレースホルダーの説明を追記する。

3. **トークン展開ロジックの実装**
   - 日時関連の場合は `resolveDateTimeTokens` に、それ以外（定数や複雑なロジック）の場合は `expand` メソッドに新しい処理を追加する。
   - `replace_file_content` を使用して変更を適用する。

4. **型チェックとビルドの実行**
   - `npm run typecheck` を実行し、構文エラーがないか確認。
   - `npm run build` でビルドが通ることを確認。

## Verification
- [ ] `./src/utils/placeholder.ts` がエラーなくコンパイルされる。
- [ ] 既存のプレースホルダー（`{{YYYY/MM/DD}}` など）が壊れていない。
- [ ] 新しく追加したキーワードが、意図通りに展開される（テストコードがある場合は実行）。
