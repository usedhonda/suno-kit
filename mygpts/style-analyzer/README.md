# Suno Style Analyzer

YouTube URL を起点に、Suno V6 向けの Style / Exclude / YAML を生成する Custom GPT セットです。

> 名前にバージョン番号を入れていません。世代が変わるたびに ChatGPT 側の表示名を
> 直さないといけなくなり、直し忘れるとリポジトリと食い違うためです。

## できること

- **URLのみ**
  - 参照曲のスタイル分析
  - Style Block
  - Exclude Block
  - 推奨スライダー
- **URL + 歌詞**
  - 上記に加えて、META+Lyrics 形式の YAML 出力
  - ひらがな変換
  - セクションタグとアノテーション付与

## 想定ユースケース

- 既存曲の雰囲気を、Suno に入れられる形へ還元したい
- 自作歌詞を、参照曲の空気感に寄せた形で組みたい
- Cover / Sample / Inspo を前提に、Audio Influence を含むヒントも出したい

## セットアップ

### 1. GPT を作成

ChatGPT → `Explore GPTs` → `Create` → `Configure`

### 2. 基本設定

| 項目 | 値 |
|------|----|
| Name | `Suno Style Analyzer` |
| Description | `Analyze a reference track and generate Suno Style / Exclude / YAML output.` |

### 3. Instructions

`instructions.md` の内容を、そのまま Instructions 欄に貼り付けます。

### 4. Knowledge

`skills/suno/knowledge/` フォルダから以下5ファイルをアップロードします。

1. `skills/suno/knowledge/suno_v6_reference.md`
2. `skills/suno/knowledge/v55_to_v6_migration.md`
3. `skills/suno/knowledge/style_catalog.md`
4. `skills/suno/knowledge/yaml_template.md`
5. `skills/suno/knowledge/suno_v55_reference.md`（📦 退役世代の記録）

### 5. Capabilities

| 機能 | 設定 |
|------|------|
| Web Search | ON |
| DALL-E | OFF |
| Code Interpreter | OFF |

## 入力例

### Pattern A: URL only

```text
https://www.youtube.com/watch?v=xxxxx
```

### Pattern B: URL + lyrics

```text
https://www.youtube.com/watch?v=xxxxx

[Verse 1]
まちの あかりが ゆれている
かぜが ほおを なでる

[Chorus]
はしりだせ いますぐに
ゆめの さきへ
```

## 出力の考え方

- **Style**
  - 英語のみ
  - 楽曲のジャンル、年代感、楽器、ミックス、ムードを要約
- **Exclude**
  - 相性の悪い要素を短く列挙
- **YAML**
  - META+Lyrics の設計図
  - セクションごとのボーカル、キュー、remix_hints を含む

## 🧪 V5.5 由来の設定（V6 未検証）

> V5.5 以前は退役済み。以下は当時有効だった知見で、V6 での挙動は公式に未記載。
> 出発点として使い、結果を見て調整すること。

- Cover / Sample / Inspo のモード選択
- Voices 使用時の Style 最小化
- Audio Influence は `25%` 起点、`+5%` 刻み
- `15-85` を安全帯として扱うスライダー設計

## ファイル構成

```text
mygpts/style-analyzer/
├── README.md
└── instructions.md

skills/suno/knowledge/        ← 正本（/suno スキル配下）
├── suno_v6_reference.md     ← アップロード対象
├── v55_to_v6_migration.md   ← アップロード対象
├── style_catalog.md         ← アップロード対象
├── yaml_template.md         ← アップロード対象
└── suno_v55_reference.md    ← アップロード対象（📦 退役世代の記録）
```
