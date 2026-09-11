---
task: generate
trigger_keywords: ["新曲", "曲を作って", "プロンプトを作って", "create", "generate", "compose"]
reference: "../skills/suno/knowledge/suno_v6_reference.md"
migration: "../skills/suno/knowledge/v55_to_v6_migration.md"
legacy: "../SunoV5_Prompt_MASTER_REFERENCE.md"
output_format: "yaml+lyrics"
---

# 🎧 Suno 新曲生成フロー仕様書（suno_flow_generate.md）

## 🧭 概要
この仕様書は、Suno V5/V5.5を用いて新しい楽曲のプロンプトを生成するためのエージェント実行フローを定義する。
ChatGPTは本仕様書および `SunoV5_Prompt_MASTER_REFERENCE.md` を読み込み、
マニュアル準拠のYAML形式プロンプトを生成したうえで、エージェントによりSuno公式サイトへ自動入力を行う。

---

## 📘 基本構造
生成されるプロンプトは以下のブロック構造を持つ：

```yaml
# === Suno V5/V5.5 Prompt ===
meta:
  # V5.5 Style format: short comma-separated tags (not prose sentences)
  # Example: "city pop, smooth jazz, 92 BPM, warm, nostalgic, Rhodes piano"
  style: [短いタグをカンマ区切りで。散文ではなく名詞句]
  language: [主言語, サブ言語]
  keywords: [主題語句・感情ワード]
  reference_url: [必要に応じてYouTubeやSpotifyのURL]
  voiceMode: false  # V5.5: true if using Voices feature (keep Style shorter when active)

structure:
  intro: [楽器構成, 雰囲気, ハーモニーの特徴]
  verse: [グルーヴ・展開・リズム感]
  chorus: [盛り上がり方, コード感, サビの特徴]
  bridge: [変化, ブレイク, テンポシフトなど]
  outro: [エンディングの方向性]

# V5.5 suggestedSliders: guide user on Suno UI slider settings
suggestedSliders:
  weirdness: "40-60%"       # higher = more experimental
  styleInfluence: "60-80%"  # higher = stronger Style compliance
  audioInfluence: "50%"     # relevant when using Voices/Custom Models

lyrics:
  language: auto
  structure: [Intro, Verse, Chorus, Bridge, Outro]
  content: |
    # V5.5 annotation tags: [SECTION - description] for per-section hints
    # WARNING: Any plain text outside tags WILL be sung. Use tags for commands.
    [INTRO - atmospheric, slow build]
    (instrumental)

    [VERSE - intimate, close vocal]
    ここに歌詞本文が入る。日本語・英語・混成自由

    [CHORUS - soaring, full harmony]
    サビの歌詞
```

---

## 🆕 V5.5 固有ルール

### Style欄のフォーマット（V5.5）
- **短いカンマ区切りタグ**を使用する（散文・長文禁止）
- 各タグは1-3語の名詞句: `city pop, 92 BPM, warm, nostalgic, Rhodes piano`
- 4-7個のタグが最適。多すぎると効果が薄れる
- Voices機能使用時はStyleを更に短く（3-5タグ推奨）

### アノテーションタグ（V5.5）
歌詞内のセクションヘッダに制作ヒントを付加:
```
[VERSE - intimate, close vocal]
[CHORUS - soaring, full harmony, layered backing]
[BRIDGE - stripped back, piano only]
```
- 形式: `[SECTION - description]`
- description は英語の短いフレーズ（カンマ区切り可）

### 「コマンドテキストが歌われる」問題（V5.5 Safety）
- **重要**: 歌詞フィールド内のタグ外テキストは全て歌われる
- 指示文（例: "ここでテンポを上げる"）をタグ外に書くと、そのまま歌詞として歌われてしまう
- 指示は必ずアノテーションタグ内 `[SECTION - 指示]` に記載すること

### Voices / Custom Models 対応（V5.5）
- `voiceMode: true` の場合、Styleタグは3-5個に抑える（Voice特性との干渉を避ける）
- Custom Modelsを使用する場合、`audioInfluence` スライダーで元モデルとの混合度を調整
- My Taste機能はユーザー嗜好を自動学習するため、Style指定はコア要素のみに集中

### suggestedSliders（V5.5）
出力に以下を含めてユーザーにスライダー設定を案内:
- `weirdness`: 実験度（高い = より予想外の結果）
- `styleInfluence`: Style準拠度（高い = Styleタグへの忠実度が上がる）
- `audioInfluence`: Voice/Custom Model使用時の元音源影響度
