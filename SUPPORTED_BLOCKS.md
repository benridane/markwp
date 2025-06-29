# 対応ブロックタイプ一覧

## 標準Markdownから変換されるブロック

### 1. テキストブロック
| Markdown | Gutenbergブロック | 説明 |
|----------|----------------|------|
| `# Heading` | `<!-- wp:heading {"level":1} -->` | 見出しレベル1 |
| `## Heading` | `<!-- wp:heading {"level":2} -->` | 見出しレベル2 |
| `### Heading` | `<!-- wp:heading {"level":3} -->` | 見出しレベル3 |
| `#### Heading` | `<!-- wp:heading {"level":4} -->` | 見出しレベル4 |
| `##### Heading` | `<!-- wp:heading {"level":5} -->` | 見出しレベル5 |
| `###### Heading` | `<!-- wp:heading {"level":6} -->` | 見出しレベル6 |
| `段落テキスト` | `<!-- wp:paragraph -->` | 通常の段落 |

### 2. リストブロック
| Markdown | Gutenbergブロック | 説明 |
|----------|----------------|------|
| `- Item` | `<!-- wp:list -->` | 順序なしリスト |
| `* Item` | `<!-- wp:list -->` | 順序なしリスト |
| `1. Item` | `<!-- wp:list {"ordered":true} -->` | 順序付きリスト |

### 3. 引用ブロック
| Markdown | Gutenbergブロック | 説明 |
|----------|----------------|------|
| `> Quote` | `<!-- wp:quote -->` | 引用ブロック |

### 4. コードブロック
| Markdown | Gutenbergブロック | 説明 |
|----------|----------------|------|
| ` ```code``` ` | `<!-- wp:code -->` | コードブロック |
| ` ```js code``` ` | `<!-- wp:code -->` | シンタックスハイライト付き |

### 5. メディアブロック
| Markdown | Gutenbergブロック | 説明 |
|----------|----------------|------|
| `![alt](url)` | `<!-- wp:image -->` | 画像ブロック |
| `![alt](url "title")` | `<!-- wp:image -->` | キャプション付き画像 |

### 6. その他の基本ブロック
| Markdown | Gutenbergブロック | 説明 |
|----------|----------------|------|
| `---` | `<!-- wp:separator -->` | 区切り線 |
| `\|表\|` | `<!-- wp:table -->` | テーブル |
| `<div>HTML</div>` | `<!-- wp:html -->` | カスタムHTML |

## カスタム構文で作成するブロック

### 1. レイアウトブロック

#### Columnsブロック
```markdown
:::columns
:::column
第1カラムの内容
:::

:::column
第2カラムの内容
:::
:::
```
出力: `<!-- wp:columns -->` と `<!-- wp:column -->`

#### Groupブロック
```markdown
:::group
グループ内の内容
:::
```
出力: `<!-- wp:group -->`

属性付き:
```markdown
:::group {className="has-background has-pale-cyan-blue-background-color"}
背景色付きグループ
:::
```

### 2. インタラクティブブロック

#### Buttonsブロック
```markdown
[ボタンテキスト](https://example.com){.wp-block-button}
```
出力: `<!-- wp:buttons -->` と `<!-- wp:button -->`

### 3. メディア複合ブロック

#### Media & Textブロック
```markdown
:::media-text
![画像](image.jpg)

テキストコンテンツ
:::
```
出力: `<!-- wp:media-text -->`

#### Coverブロック
```markdown
:::cover {background="https://example.com/bg.jpg"}
# カバータイトル
カバー内のコンテンツ
:::
```
出力: `<!-- wp:cover -->`

## サポートされる属性

### 共通属性
- `id` - ブロックのID
- `className` - CSSクラス名
- `align` - 配置（left, center, right, wide, full）

### ブロック固有の属性

#### Headingブロック
- `level` - 見出しレベル（1-6）

#### Listブロック
- `ordered` - 順序付きリストかどうか（true/false）

#### Imageブロック
- `url` - 画像URL
- `alt` - 代替テキスト
- `caption` - キャプション
- `id` - 画像ID（ファイル名から自動抽出）
- `sizeSlug` - サイズ（デフォルト: large）

#### Groupブロック
- `layout` - レイアウト設定（JSON形式）

#### Media & Textブロック
- `mediaPosition` - メディアの位置（left/right）
- `mediaType` - メディアタイプ（image/video）

#### Coverブロック
- `background` - 背景画像URL（属性から削除され、styleに変換）

## 属性の指定方法

### 1. クラス名（ドット記法）
```markdown
:::block {.class1 .class2}
```

### 2. キーバリューペア
```markdown
:::block {id="my-id" align="wide"}
```

### 3. JSON値
```markdown
:::block {layout='{"type":"constrained"}'}
```

### 4. 混合
```markdown
:::block {.has-background id="special" align="wide"}
```

## インライン要素

| Markdown | HTML出力 | 説明 |
|----------|---------|------|
| `**bold**` | `<strong>bold</strong>` | 太字 |
| `*italic*` | `<em>italic</em>` | 斜体 |
| `***both***` | `<em><strong>both</strong></em>` | 太字斜体 |
| `` `code` `` | `<code>code</code>` | インラインコード |
| `[link](url)` | `<a href="url">link</a>` | リンク |
| `  ` (2スペース) | `<br/>` | 改行 |
| `\` (行末) | `<br/>` | 改行 |

## 制限事項

1. **ネストの深さ**: カスタムブロックのネストは最大10階層まで
2. **リストのネスト**: markdown-itの仕様により一部のネストパターンで制限あり
3. **同一ブロックのネスト**: 同じタイプのブロックを直接ネストする場合に制限あり
4. **カスタムブロック名**: WordPress標準のブロック名にマッピングされないものは `wp:` プレフィックスが付与される