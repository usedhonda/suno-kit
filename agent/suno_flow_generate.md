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
この仕様書は、Suno V6 を用いて新しい楽曲のプロンプトを生成するためのエージェント実行フローを定義する。
ChatGPTは本仕様書および `skills/suno/knowledge/suno_v6_reference.md` / `v55_to_v6_migration.md` を読み込み、
マニュアル準拠のYAML形式プロンプトを生成したうえで、エージェントによりSuno公式サイトへ自動入力を行う。

---

## 📘 基本構造
生成されるプロンプトは以下のブロック構造を持つ：

```yaml
# === Suno V6 Prompt ===
meta:
  # V6: 属性どうしの関係を述べる（🧪 V5.5 由来のタグ列も引き続き有効）
  # V6 例: "city pop over a smooth-jazz bed at 92 BPM, warm nostalgic Rhodes leading the verse"
  # タグ列の例: "city pop, smooth jazz, 92 BPM, warm, nostalgic, Rhodes piano"
  style: [関係を述べた文、またはタグ列]
  language: [主言語, サブ言語]
  keywords: [主題語句・感情ワード]
  reference_url: [必要に応じてYouTubeやSpotifyのURL]
  voiceMode: false  # 📦 V5.5 限定機能: Voices。V6 互換性は公式未記載

structure:
  intro: [楽器構成, 雰囲気, ハーモニーの特徴]
  verse: [グルーヴ・展開・リズム感]
  chorus: [盛り上がり方, コード感, サビの特徴]
  bridge: [変化, ブレイク, テンポシフトなど]
  outro: [エンディングの方向性]

# 🧪 V5.5 由来 / V6 未検証: スライダー推奨値。V6 では意味そのものが公式未記載
suggestedSliders:
  weirdness: "40-60%"       # 出発点として使い、結果を見て調整する
  styleInfluence: "60-80%"  # Weirdness を temperature と同一視しない
  audioInfluence: "50%"     # Voices / Custom Models 使用時

lyrics:
  language: auto
  structure: [Intro, Verse, Chorus, Bridge, Outro]
  content: |
    # アノテーションタグ: [SECTION - description]（V6 でも有効）
    # WARNING: Any plain text outside tags WILL be sung. Use tags for commands.
    [INTRO - atmospheric, slow build]
    (instrumental)

    [VERSE - intimate, close vocal]
    ここに歌詞本文が入る。日本語・英語・混成自由

    [CHORUS - soaring, full harmony]
    サビの歌詞
```

---

## 🆕 V6 ルール

### Style欄の書き方
- ✅ V6 確認済み: V6 は vocals / instrumentation / structure / mood / references / feel をより深く解釈する
- 既定は**属性どうしの関係を述べる**書き方（どの楽器が主役か、verse と chorus をどう対比させるか）
- 🧪 V5.5 由来 / V6 未検証: 短いカンマ区切りタグ列（1-3語の名詞句、4-7個）も引き続き有効
- ❓ 公式未記載: V6 の Style 文字数上限。**長さではなく関係の明示**で決まる
- 📦 V5.5 限定機能: Voices 使用時に Style を 3-5 タグへ絞る運用（V6 互換性は公式未記載）

### アノテーションタグ
歌詞内のセクションヘッダに制作ヒントを付加:
```
[VERSE - intimate, close vocal]
[CHORUS - soaring, full harmony, layered backing]
[BRIDGE - stripped back, piano only]
```
- 形式: `[SECTION - description]`
- description は英語の短いフレーズ（カンマ区切り可）

### 「コマンドテキストが歌われる」問題
- **重要**: 歌詞フィールド内のタグ外テキストは全て歌われる
- 指示文（例: "ここでテンポを上げる"）をタグ外に書くと、そのまま歌詞として歌われてしまう
- 指示は必ずアノテーションタグ内 `[SECTION - 指示]` に記載すること

### Custom Models / Voices / My Taste

**この3つは V6 での扱いが異なる。まとめて古いものとして扱わないこと。**

- ✅ V6 確認済み: **Custom Models は V6 対応**。「Fine-tune v6 on your own tracks for a personalized sound」。
  既存の Custom Model は自動的に V6 で動くようアップグレードされ、旧モデルで作った曲は再生可能なまま残る
- ❓ 公式未記載: **Voices** と **My Taste** の V6 互換性。V5.5 の設定を V6 へ自動継承しない
- 🧪 V5.5 由来 / V6 未検証: `audioInfluence` で元モデルとの混合度を調整する運用

### 🧪 V5.5 レガシー: suggestedSliders（V6 未検証）

> 以下は **V5.5 で有効だった知見**。V6 での挙動は公式に未記載で、本キットでも未再現。
> 削除はしないが、V6 では**出発点**として使い、結果を見て調整する。
> 判定根拠: `skills/suno/knowledge/v55_to_v6_migration.md` §10

- `weirdness`: 実験度（高い = より予想外の結果）
- `styleInfluence`: Style準拠度（高い = Styleタグへの忠実度が上がる）
- `audioInfluence`: Voice / Custom Model 使用時の元音源影響度
- ❓ 公式未記載: V6 におけるスライダーの意味そのもの。Weirdness は Suno の creative control であって、公開されたサンプリング温度ではない
