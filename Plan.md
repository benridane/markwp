# Markdown to WordPress HTML Comment Delimiter Format Converter

## プロジェクト概要
MarkdownをWordPressのHTMLコメントデリミタ形式（Gutenbergブロック形式）に変換するコマンドラインツールを作成する。

## 参考資料
- `/home/ubuntu/markwp/references-code/html-to-gutenberg/` - HTMLからGutenbergブロックへの変換ツール
- `/home/ubuntu/markwp/references-code/gutenberg-converter/` - Gutenberg変換の参考実装（@wordpress/blocksを使用）
- `/home/ubuntu/markwp/wordpress-block-format-example.txt` - WordPress Gutenbergブロック形式の例
- WordPress Gutenbergブロック形式: `<!-- wp:blockname {"attributes"} -->content<!-- /wp:blockname -->`

### Gutenbergブロック形式の重要な仕様
1. ブロックの開始と終了: `<!-- wp:blockname -->` ... `<!-- /wp:blockname -->`
2. 属性はJSON形式: `<!-- wp:blockname {"attr":"value","attr2":123} -->`
3. ネスト可能な構造
4. HTMLコンテンツは開始・終了コメントの間に配置
5. 一部のブロック（columns, group等）は専用のdivラッパーを持つ

## 実装計画

### フェーズ1: 基本構造の実装
1. **プロジェクトのセットアップ**
   - Node.jsプロジェクトの初期化
   - 必要な依存関係のインストール（markdown-it、commander等）
   - TypeScriptの設定（オプション）

2. **コマンドラインインターフェース**
   - CLIツールのエントリーポイント作成
   - コマンドラインオプションの定義（入力ファイル、出力ファイル、オプション等）
   - ヘルプメッセージの実装

3. **Markdownパーサー**
   - markdown-itまたは類似のライブラリを使用してMarkdownをASTに変換
   - カスタムレンダラーの実装準備

### フェーズ2: 基本的なMarkdown要素の変換
1. **テキストブロック**
   - 段落 (p) → `<!-- wp:paragraph -->`
   - 見出し (h1-h6) → `<!-- wp:heading {"level":n} -->`
   - リスト (ul/ol) → `<!-- wp:list -->`
   - 引用 (blockquote) → `<!-- wp:quote -->`

2. **メディアブロック**
   - 画像 (img) → `<!-- wp:image -->`
   - コードブロック → `<!-- wp:code -->`
   - プレフォーマットテキスト → `<!-- wp:preformatted -->`

3. **その他の基本要素**
   - 水平線 (hr) → `<!-- wp:separator -->`
   - テーブル → `<!-- wp:table -->`

### フェーズ3: Gutenbergブロック機能の実装
1. **ブロック属性の処理**
   - Markdown内の特殊記法からブロック属性を抽出
   - JSON形式での属性の生成
   - カスタム属性のサポート

2. **ネストされたブロック**
   - カラムブロック → `<!-- wp:columns -->`
   - グループブロック → `<!-- wp:group -->`
   - InnerBlocksのサポート

3. **高度なブロック**
   - カスタムHTMLブロック
   - 再利用可能ブロック
   - 動的ブロック

### フェーズ4: 拡張機能
1. **カスタムブロックサポート**
   - ユーザー定義のカスタムブロック変換ルール
   - プラグインシステムの実装
   - 設定ファイルのサポート

2. **メタデータ処理**
   - Frontmatterの処理
   - ブロックメタデータの抽出と適用

3. **最適化と品質向上**
   - 出力の整形とインデント
   - エラーハンドリングの改善
   - デバッグモードの実装

### フェーズ5: テストとドキュメント
1. **テストスイート**
   - 単体テストの作成
   - 統合テストの実装
   - エッジケースのテスト

2. **ドキュメント**
   - READMEの作成
   - APIドキュメント
   - 使用例とサンプル

## ディレクトリ構造（案）
```
markwp/
├── src/
│   ├── index.ts           # エントリーポイント
│   ├── cli.ts             # CLIインターフェース
│   ├── parser/
│   │   ├── markdown.ts    # Markdownパーサー
│   │   └── ast.ts         # AST処理
│   ├── converters/
│   │   ├── base.ts        # 基本コンバーター
│   │   ├── text.ts        # テキストブロック
│   │   ├── media.ts       # メディアブロック
│   │   └── custom.ts      # カスタムブロック
│   ├── generators/
│   │   └── gutenberg.ts   # Gutenbergブロック生成
│   └── utils/
│       ├── attributes.ts  # 属性処理
│       └── helpers.ts     # ヘルパー関数
├── test/
│   ├── fixtures/          # テスト用データ
│   └── specs/             # テストスペック
├── docs/                  # ドキュメント
├── examples/              # 使用例
├── package.json
├── tsconfig.json
└── README.md
```

## 実装の優先順位
1. 基本的なCLIツールの実装
2. 主要なMarkdown要素の変換（段落、見出し、リスト）
3. Gutenbergブロック属性のサポート
4. より高度なブロックとネスト構造
5. カスタマイズ機能とプラグインシステム

## 技術選定
- **言語**: TypeScript（型安全性とメンテナンス性）
- **Markdownパーサー**: markdown-it（拡張性が高い）
- **CLIフレームワーク**: Commander.js
- **テストフレームワーク**: Jest
- **ビルドツール**: esbuild または webpack

## 成功指標
- 基本的なMarkdown要素を正確にGutenbergブロックに変換できる
- CLIツールとして使いやすいインターフェース
- 拡張可能なアーキテクチャ
- 十分なテストカバレッジ（80%以上）
- 明確なドキュメントとサンプル