# Suno Lyrics Writer

少ない入力から、Suno V6 向けの歌いやすい歌詞を生成する Custom GPT セットです。

> 名前にバージョン番号を入れていません。世代が変わるたびに ChatGPT 側の表示名を
> 直さないといけなくなり、直し忘れるとリポジトリと食い違うためです。

## できること

- テーマだけで歌詞を生成
- セクションタグ付きで出力
- アノテーションタグ付きで出力（V6 でも有効）
- ひらがな中心の Suno 向けフォーマットへ整形
- Verse / Chorus / Bridge の役割差を保った構成生成

## この GPT の重心

単に「雰囲気の良い歌詞」を書くだけではなく、Suno に入れたときに崩れにくい形へ寄せています。

- 1行あたり **6-12 音節**を基本にする
- Verse と Chorus の音節密度に差をつける
- 句読点をリズム制御として使う
- 英語混じり歌詞ではフォネティック修正も使う

## セットアップ

### 1. GPT を作成

ChatGPT → `Explore GPTs` → `Create` → `Configure`

### 2. 基本設定

| 項目 | 値 |
|------|----|
| Name | `Suno Lyrics Writer` |
| Description | `Generate singable Suno lyrics from a theme or short prompt.` |

### 3. Instructions

`instructions.md` を Instructions 欄に貼り付けます。

### 4. Knowledge

`skills/suno/knowledge/` フォルダから以下5ファイルをアップロードします。

1. `skills/suno/knowledge/lyric_craft.md`
2. `skills/suno/knowledge/song_structures.md`
3. `skills/suno/knowledge/style_catalog.md`
4. `skills/suno/knowledge/rap_and_flow.md`
5. `skills/suno/knowledge/english_lyrics.md`

### 5. Capabilities

| 機能 | 設定 |
|------|------|
| Web Search | OFF |
| DALL-E | OFF |
| Code Interpreter | OFF |

## 入力例

```text
夏のおわりの かなしい こい、city pop ふう
```

```text
しつれんソング、ばらーど、おとこせいてん、ぴあのひきがたり
```

```text
EDM、クラブでおどれる、えいご mix
```

## 出力の特徴

- コードブロックでそのまま貼りやすい
- `[Verse - intimate, close vocal]` のようなアノテーションタグ付き
- 伏線、フック、韻、エネルギーカーブを内部ルールで保持

## 収録知識

- `lyric_craft.md`
  - 伏線、韻、フック、歌唱可能性、句読点リズム、フォネティック修正
- `song_structures.md`
  - 曲構成パターン、セクションの役割、音節密度コントラスト
- `style_catalog.md`
  - ジャンル別の語彙とアノテーション語彙

## ファイル構成

```text
mygpts/lyrics-writer/
├── README.md
└── instructions.md

skills/suno/knowledge/      ← 正本（/suno スキル配下）
├── lyric_craft.md          ← アップロード対象
├── song_structures.md      ← アップロード対象
├── style_catalog.md        ← アップロード対象
├── rap_and_flow.md         ← アップロード対象
└── english_lyrics.md       ← アップロード対象
```
