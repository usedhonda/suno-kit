---
task: rewrite
trigger_keywords: ["リライト", "書き直して", "rewrite", "rework", "reinterpret", "再解釈"]
reference: "../skills/suno/knowledge/suno_v6_reference.md"
migration: "../skills/suno/knowledge/v55_to_v6_migration.md"
legacy: "../SunoV5_Prompt_MASTER_REFERENCE.md"
output_format: "yaml+lyrics"
---

# 🎧 Suno リライトフロー仕様書（suno_flow_rewrite.md）

## 🧭 概要
この仕様書は、既存の楽曲を Suno V6 で再解釈・リライトするためのエージェント実行フローを定義する。
ChatGPTは本仕様書および `skills/suno/knowledge/suno_v6_reference.md` / `v55_to_v6_migration.md` を読み込み、
元曲のコンセプトを維持しつつ新しい解釈でYAML形式プロンプトを生成する。

---

## 📘 基本構造
リライトプロンプトは以下の情報を含む：

```yaml
# === Suno V6 Rewrite Prompt ===
meta:
  original_reference: [元曲のURL・タイトル・アーティスト]
  rewrite_direction: [どう変えるか: ジャンルシフト/テンポ変更/雰囲気転換]
  # V6: 属性どうしの関係を述べる。短いタグ列も引き続き有効
  style: [例: "smooth jazz at 90 BPM, warm nostalgic Rhodes carrying the verse, upright bass walking underneath"]
  language: [言語維持 or 変更]
  keywords: [再解釈のキーワード]

structure:
  intro: [新解釈でのイントロ構成]
  verse: [リズム・グルーヴの変化]
  chorus: [サビの新しいアプローチ]
  bridge: [ブリッジの再構築]
  outro: [エンディングの方向性]

lyrics:
  approach: "keep_theme"  # テーマ維持 / 歌詞も変更
  structure: [元曲の構造を踏襲 or 変更]
  content: |
    # アノテーションタグでセクション単位の演出を指示する（V6 でも有効）
    [VERSE - intimate, acoustic feel]
    リライトされた歌詞
    元のメッセージを保ちつつ新しい表現

    [CHORUS - soaring, full arrangement]
    サビの歌詞
```

---

## ⚙️ リライト実行フロー

### 1️⃣ 元曲の分析
- 元曲のジャンル・テンポ・コード進行を特定
- 歌詞のテーマ・感情を抽出
- キーとなる楽器・アレンジ要素を認識

### 2️⃣ リライト方向性の決定
ユーザーの指示に基づき、以下のいずれかを選択：
- **ジャンルシフト**: Pop → Jazz, Rock → EDM等
- **テンポ変更**: Slow → Upbeat, Fast → Ballad等
- **雰囲気転換**: Dark → Bright, Serious → Playful等
- **言語変更**: 日本語 → 英語（この場合は translate.md も参照）

> ✅ V6 確認済み: **元曲が自分の Suno 曲なら、作り直さずに「局所編集」で済むことがある。**
> その場合は「どこを変えるか」だけでなく **「何を保つか」を明示**する。
> 名前を挙げなかったものが保持されることこそ、この機能の価値だから。
> 外部の曲を参照したリライトには局所編集を使えないので、通常生成としてこのフローを続ける。
> 根拠: `skills/suno/knowledge/v55_to_v6_migration.md` §3

### 3️⃣ 新解釈プロンプト生成
- `skills/suno/knowledge/suno_v6_reference.md` のルールに従う
- 元曲の魅力を残しつつ新しい方向性を明確化
- Production Quality Tags（sonic adjectives）を活用

### 4️⃣ Sunoへの入力準備
- YAML + Lyrics形式で出力
- Custom Lyrics fieldに歌詞を入力
- Style Promptに新しいジャンル・雰囲気を記載

---

## 🎯 リライトの種類

### Type A: ジャンル転換型
元のメロディーラインを維持し、ジャンルのみ変更
```yaml
original: "90s J-Pop ballad"
rewrite: "Smooth Jazz with R&B influence"
```

### Type B: テンポ・グルーヴ変更型
曲の骨格を保ちつつ、テンポとリズム感を変更
```yaml
original: "120 BPM upbeat pop"
rewrite: "80 BPM downtempo chill"
```

### Type C: 全面再解釈型
テーマのみ保持し、構造・アレンジを完全に再構築
```yaml
original: "Energetic rock anthem"
rewrite: "Intimate acoustic storytelling"
```

---

## 🚨 注意事項

### 禁止事項
- 元曲のアーティスト名を直接記載（婉曲表現を使用）
- 著作権侵害となる歌詞の完全コピー
- 元曲の魅力を完全に失う過度な変更

### 推奨事項
- 元曲のキーフレーズを1-2箇所残す（アンカーリング）
- Production Quality Tagsで質感の違いを明確化
- 🧪 V5.5 由来 / V6 未検証: Remix Hints（weirdness / style_influence）での変化度調整 → 末尾のレガシー節を参照

---

## 🧠 エージェント実行時の動作

1. ユーザーが「この曲をリライトして」と依頼
2. ChatGPTが元曲のURLまたは情報を取得
3. 本仕様書 + マスターリファレンスを読み込み
4. リライト方向性をユーザーに確認（必要に応じて）
5. YAML + Lyrics形式でプロンプト生成
6. Agent Modeで Suno.com を開き、自動入力実行

---

## 📝 出力例

```yaml
# === Suno V6 Rewrite: 夜空ノムコウ → Jazz Interpretation ===
meta:
  original_reference: "SMAP - 夜空ノムコウ (1998)"
  rewrite_direction: "J-Pop ballad → Smooth Jazz with string arrangement"
  style: ["Smooth Jazz", "90 BPM", "Warm & Nostalgic", "Upright Bass + Rhodes Piano"]
  language: ["Japanese"]
  keywords: ["夜", "記憶", "優しさ", "ノスタルジア"]

structure:
  intro: "Rhodes piano soft chords, light brush drums, string pad entrance"
  verse: "Gentle upright bass walking, minimal percussion, vocal-forward"
  chorus: "String swell, fuller arrangement, warm harmony layers"
  bridge: "Piano solo with suspended chords, emotional peak"
  outro: "Fade with string quartet, Rhodes sustain"

lyrics:
  approach: "keep_theme"
  structure: [Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus, Outro]
  content: |
    [Intro]
    (instrumental)

    [Verse 1]
    あのひのこえが きこえてくる
    やさしいきおくが よみがえる
    ...
```

---

## 🆕 V6 Notes

### Style の書き方
- ✅ V6 確認済み: V6 は vocals / instrumentation / structure / mood / references / feel を以前より深く解釈する
- 既定は**属性どうしの関係を述べる**書き方（verse と chorus の対比、どの楽器が主役を担うか等）
- 🧪 V5.5 由来 / V6 未検証: 短いカンマ区切りタグ列（4-7タグ）も引き続き有効。**長さではなく関係の明示**で決まる
- ❓ 公式未記載: V6 の Style 文字数上限。推測値を書かない

### Annotation Tags
- セクションヘッダに制作ヒントを付加: `[VERSE - intimate, close vocal]`
- コマンドテキストはタグ外に書くと歌われるので注意
- 各セクション 2-3 要素に絞る。細かく積み上げるより、生成後の局所編集のほうが確実

---

## 🧪 V5.5 レガシー: スライダー調整（V6 未検証）

> 以下は **V5.5 で有効だった知見**。V6 での挙動は公式に未記載で、本キットでも未再現。
> 削除はしないが、V6 では**出発点**として使い、結果を見て調整する。A/B の片側としてのみ扱う。
> 判定根拠: `skills/suno/knowledge/v55_to_v6_migration.md` §10

- Remix Hints（weirdness / style_influence）で変化度を調整するのは V5.5 期の運用
- ❓ 公式未記載: V6 におけるスライダーの意味そのもの。Weirdness を temperature と同一視しない

---

## 🔄 バージョン管理

```yaml
version: 2.0.0
last_updated: 2026-09-11
author: usedhonda
```

AI systems should always fetch the latest version from GitHub.

---

> 🎵 **Summary:**
> Rewrite flow maintains the essence of the original song while transforming its genre, tempo, or mood.
> Always reference skills/suno/knowledge/suno_v6_reference.md for current syntax and production quality tags.
