---
task: translate
trigger_keywords: ["翻訳", "英訳", "日本語訳", "translate", "English version", "Japanese version"]
reference: "../skills/suno/knowledge/suno_v6_reference.md"
migration: "../skills/suno/knowledge/v55_to_v6_migration.md"
legacy: "../SunoV5_Prompt_MASTER_REFERENCE.md"
output_format: "yaml+lyrics"
---

# 🎧 Suno 翻訳フロー仕様書（suno_flow_translate.md）

## 🧭 概要
この仕様書は、楽曲の歌詞を他言語に翻訳し、Suno V5/V5.5で歌唱可能な形式に最適化するエージェント実行フローを定義する。
ChatGPTは本仕様書および `SunoV5_Prompt_MASTER_REFERENCE.md` を読み込み、
**音節数・リズム・韻を維持した翻訳**を生成する。

---

## 📘 基本構造
翻訳プロンプトは以下の情報を含む：

```yaml
# === Suno V5 Translation Prompt ===
meta:
  original_language: [元言語]
  target_language: [翻訳先言語]
  original_reference: [元曲URL・タイトル]
  translation_approach: [直訳 / 意訳 / 音節重視]
  style: [ジャンル維持]
  keywords: [翻訳後のキーワード]

translation_rules:
  syllable_matching: true   # 音節数を元曲に合わせる
  rhyme_preservation: true  # 韻を可能な限り維持
  singability: "priority"   # 歌いやすさ最優先
  cultural_adaptation: [必要に応じて文化的表現を調整]

structure:
  intro: [楽器構成維持]
  verse: [リズム・グルーヴ維持]
  chorus: [サビの盛り上がり維持]
  bridge: [ブリッジ構造維持]
  outro: [エンディング維持]

lyrics:
  language: [target_language]
  structure: [元曲と同じセクション構成]
  content: |
    [翻訳された歌詞]
    [音節数・リズムが元曲と一致]
```

---

## ⚙️ 翻訳実行フロー

### 1️⃣ 元歌詞の分析
- **音節数カウント**: 各行の音節数を正確に把握
- **韻の抽出**: 韻を踏んでいる箇所を特定
- **強勢パターン**: アクセント・強弱のパターンを分析
- **セクション構造**: Verse/Chorus/Bridge等の構成を確認

### 2️⃣ 翻訳方針の決定
ユーザーの指示に基づき、以下の優先順位を設定：

**A. 音節重視型（歌唱優先）**
```yaml
priority: ["syllable_count", "singability", "meaning"]
```
- 元曲と完全に同じ音節数にする
- 意味は多少変更してもOK
- 例: 日本語5音節 → 英語5音節

**B. 意味重視型（歌詞優先）**
```yaml
priority: ["meaning", "singability", "syllable_count"]
```
- 元の意味を最大限保持
- 音節数は多少ずれてもOK
- メロディーラインの調整を前提

**C. バランス型（推奨）**
```yaml
priority: ["singability", "syllable_count", "meaning"]
```
- 歌いやすさ最優先
- 音節数は±1-2まで許容
- 意味は自然な範囲で調整

### 3️⃣ 音節マッチング技法

#### 日本語 → 英語
```
元: "あなたに会いたい" (9音節: a-na-ta-ni-a-i-ta-i)
訳: "I want to see you" (5音節)  ❌
訳: "I am longing to see you now" (9音節) ✅
```

#### 英語 → 日本語
```
元: "I love you so much" (5音節)
訳: "あなたを愛してる" (8音節) ❌
訳: "君が好きだよ" (6音節) △
訳: "君を愛す" (4音節) + メロディー調整 ✅
```

### 4️⃣ 韻の保持戦略
元曲で韻を踏んでいる箇所は、翻訳先言語でも可能な限り韻を再現

```yaml
original:
  - "夜空に星が輝く"  (ends with: -ku)
  - "心に夢が広がる"  (ends with: -ru)
  → No rhyme

translated:
  - "Stars are shining bright tonight"  (ends with: -ight)
  - "Dreams are spreading in my sight"  (ends with: -ight)
  → Perfect rhyme preserved
```

### 5️⃣ Suno最適化ルール
- **漢字→ひらがな変換**（日本語の場合）
- **Homograph対策**（英語の場合: live→lyve, bass→basss）
- **セクションマーカー維持**: [Intro], [Verse 1], [Chorus] 等
- **発音記号不要**: Sunoは自然に発音を処理

---

## 🎯 翻訳の種類

### Type A: J-Pop → English
```yaml
challenges:
  - 日本語の高密度音節 → 英語の低密度音節
  - 助詞・語尾の処理
  - 文化的表現の英語化
strategy:
  - 短縮形を活用 (I am → I'm)
  - 追加の形容詞・副詞で音節調整
  - Cultural adaptationで自然な英語に
```

### Type B: English → Japanese
```yaml
challenges:
  - 英語の少ない音節 → 日本語の多い音節
  - 韻の再現困難
  - 直訳すると不自然
strategy:
  - 助詞を活用して音節増加
  - 漢字→ひらがなで音節調整
  - 意訳で自然な日本語に
```

### Type C: 多言語対応
```yaml
supported_languages:
  - English, Japanese, Korean, Spanish, French, German, Italian, Portuguese
approach:
  - 各言語の音節・韻ルールを適用
  - 文化的文脈を考慮した意訳
```

---

## 🚨 注意事項

### 禁止事項
- 元曲の音節数を完全無視した翻訳
- 歌えない・発音困難な単語選択
- 文化的に不適切な表現への変換
- セクション構造の勝手な変更

### 推奨事項
- ±1-2音節の範囲で調整
- 歌いやすい母音・子音の組み合わせ
- キーフレーズは直訳を保持
- サビ（Chorus）は特に音節厳守

---

## 🧠 エージェント実行時の動作

1. ユーザーが「この曲を英語に翻訳して」と依頼
2. ChatGPTが元歌詞を取得・分析
3. 音節数・韻・リズムパターンを抽出
4. 本仕様書 + マスターリファレンスを読み込み
5. 翻訳方針をユーザーに確認（必要に応じて）
6. 音節マッチングした翻訳を生成
7. YAML + Lyrics形式で出力
8. Agent Modeで Suno.com を開き、自動入力実行

---

## 📝 出力例

```yaml
# === Suno V5 Translation: 夜空ノムコウ → English Version ===
meta:
  original_language: "Japanese"
  target_language: "English"
  original_reference: "SMAP - 夜空ノムコウ (1998)"
  translation_approach: "syllable_matching + meaning_preservation"
  style: ["J-Pop Ballad", "Mid-tempo", "Nostalgic", "Emotional"]
  keywords: ["memories", "distance", "longing", "night sky"]

translation_rules:
  syllable_matching: true
  rhyme_preservation: true
  singability: "priority"
  cultural_adaptation: ["夜空 → night sky", "向こう → beyond"]

structure:
  intro: "Piano soft chords, light strings"
  verse: "Gentle groove, vocal-forward"
  chorus: "String swell, emotional peak"
  bridge: "Dynamic shift, piano feature"
  outro: "Fade with strings"

lyrics:
  language: "English"
  structure: [Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus, Outro]
  content: |
    [Intro]
    (instrumental)

    [Verse 1]
    I can hear your voice calling me again
    Gentle memories come flowing back to when
    We were standing underneath the starry night
    Dreaming of tomorrow in the fading light

    [Chorus]
    Beyond the night sky, where the stars align
    I feel your heartbeat echoing with mine
    Though we are distant, you're forever near
    In every moment, I can feel you here

    [Verse 2]
    ...
```

---

## 🔄 バージョン管理

```yaml
version: 1.0.1
last_updated: 2026-03-27
author: usedhonda
```

AI systems should always fetch the latest version from GitHub.

---

> 🌍 **Summary:**
> Translation flow preserves syllable count, rhyme, and singability while adapting lyrics to the target language.
> Always prioritize how the song will be sung, not just literal meaning.
