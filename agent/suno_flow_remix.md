---
task: remix
trigger_keywords: ["リミックス", "remix", "rearrange", "アレンジ変更", "ビート変えて"]
reference: "../skills/suno/knowledge/suno_v6_reference.md"
migration: "../skills/suno/knowledge/v55_to_v6_migration.md"
legacy: "../SunoV5_Prompt_MASTER_REFERENCE.md"
output_format: "yaml+lyrics"
---

# 🎧 Suno リミックスフロー仕様書（suno_flow_remix.md）

## 🧭 概要
この仕様書は、既存楽曲を Suno V6 でリミックス・リアレンジするためのエージェント実行フローを定義する。
ChatGPTは本仕様書および `skills/suno/knowledge/suno_v6_reference.md` / `v55_to_v6_migration.md` を読み込み、
元曲の歌詞とメロディーを保ちつつ、**ビート・アレンジ・雰囲気を大胆に変更**したプロンプトを生成する。

---

## 🔀 最初に決めること: リミックス経路

**V6 では「何を入力に持っているか」で手段が変わる。ここを飛ばすと使えない手を延々と説明することになる。**

| 入力 | V6 での手段 | 補足 |
|---|---|---|
| **自分の Suno 曲** | ✅ 局所編集 | 変更点と **保つもの**を自然言語で書く。作り直さない |
| **権利を持つ手持ち音源が複数** | ✅ multi-source | 各ソースに**役割**を与え、持ち込まないものを明記 |
| **外部曲の URL / テキスト参照のみ** | 通常生成 | 局所編集も mashup も使えない。以下のフローをそのまま使う |

局所編集は**自分の Suno 曲にしか使えない**。`original_reference` に外部曲の URL を置く従来の使い方は
3行目のケースに当たるので、通常生成として本フローを続けること。
根拠: `skills/suno/knowledge/v55_to_v6_migration.md` §3 / §4

---

## 📘 基本構造
リミックスプロンプトは以下の情報を含む：

```yaml
# === Suno V6 Remix Prompt ===
meta:
  original_reference: [元曲URL・タイトル]
  remix_type: [Club Mix / Acoustic / Lo-fi / Trap / etc.]
  original_tempo: [元のBPM]
  remix_tempo: [新しいBPM]
  original_key: [元のキー]
  remix_key: [新しいキー or 維持]
  # V6: 属性どうしの関係を述べる（🧪 V5.5 由来のタグ列も引き続き有効）
  style: [例: "house at 128 BPM with a driving synth bass under the original vocal"]
  keywords: [リミックスの方向性]

remix_plan:
  route: local_edit | multi_source | regenerate   # 上の「リミックス経路」で決める
  must_preserve: ["lead vocal melody", "lyrics", "key"]   # 名前を挙げたものが保たれる
  must_change: ["drum groove", "chorus instrumentation"]
  sources:                                        # route: multi_source のときだけ
    - { id: A, role: "vocal phrasing and melodic contour only" }
    - { id: B, role: "drum groove only" }
  do_not_carry: ["lyrics from any source"]
  arrangement: [追加楽器・削除楽器]
  fx_processing: [リバーブ・ディレイ・フィルター等]

structure:
  intro: [新しいイントロ構成]
  verse: [ビート・グルーヴ変更]
  chorus: [サビのリミックスアプローチ]
  bridge: [ブレイクダウン・ビルドアップ]
  outro: [エンディングの方向性]

lyrics:
  approach: "keep_original"  # 歌詞は基本維持
  structure: [元曲と同じ or セクション追加]
  content: |
    [元曲の歌詞をそのまま使用]
    [必要に応じてフックの繰り返し追加]
```

---

## ⚙️ リミックス実行フロー

### 1️⃣ 元曲の分析
- **ジャンル・テンポ・キー**を特定
- **コード進行・メロディーライン**を把握
- **特徴的な楽器・フレーズ**を抽出
- **歌詞の構造**を確認（Verse/Chorus/Bridge）

### 2️⃣ リミックスタイプの決定
ユーザーの指示に基づき、以下のいずれかを選択：

#### Type A: Club Remix（EDM/House/Techno系）
```yaml
changes:
  - BPM: 120-130に加速
  - 4つ打ちキック追加
  - シンセベース・パッド追加
  - ビルドアップ・ドロップ構造
  - サイドチェイン圧縮
```

#### Type B: Acoustic Remix（生楽器中心）
```yaml
changes:
  - 電子音を生楽器に置き換え
  - アコギ・ピアノ・ストリングス中心
  - テンポ緩やか化（-10~20 BPM）
  - リバーブ多め・温かみ重視
```

#### Type C: Lo-fi / Chill Remix
```yaml
changes:
  - BPM: 70-90にスロー化
  - ビニールノイズ・テープサチュレーション
  - ジャズコード・ネオソウル要素
  - ビート簡素化・スペース重視
```

#### Type D: Trap / Hip Hop Remix
```yaml
changes:
  - 808ベース・トラップハイハット
  - BPM: 140-160（ハーフタイム感）
  - ボーカルチョップ・ピッチシフト
  - ヘビーな低音・スネアロール
```

#### Type E: Jazz / Swing Remix
```yaml
changes:
  - スウィングビート・シャッフル
  - ブラスセクション・ウォーキングベース
  - ピアノ・オルガンコンピング
  - インプロビゼーション要素
```

### 3️⃣ 変化度の指定

- ✅ V6 確認済み: **保つもの / 変えるものを自然言語で明示する**のが第一手。
  名前を挙げなかったものが保たれること自体が、V6 の編集機能の価値
- 🧪 V5.5 由来 / V6 未検証: スライダー（weirdness / style_influence / audio_influence）による調整
  → 末尾の「🧪 V5.5 レガシー: スライダー調整」を参照。数値はそこに集約した

### 4️⃣ アレンジメント戦略

**Intro（イントロ）**
- 元曲と全く違うアプローチで開始
- リミックスのジャンルを即座に提示
- 例: Club Remix → シンセパッド + ライザー

**Verse（ヴァース）**
- 元のメロディーは保持
- ビート・ベースライン・バッキングを変更
- 例: Acoustic → 生ドラム + アコギストローク

**Chorus（サビ）**
- 最もエネルギーを出す部分
- リミックスの個性が最も出る
- 例: Lo-fi → ビートドロップ + フィルターオープン

**Bridge（ブリッジ）**
- ブレイクダウン or ビルドアップ
- 元曲にない展開を追加可能
- 例: Trap → 808ドロップ + ボーカルチョップ

**Outro（アウトロ）**
- フェードアウト or 急激なカットオフ
- リミックスらしい締め方
- 例: Jazz → ピアノソロ + ブラシドラム

---

## 🎛️ Production Quality Tags（Remix特化）

### Club Remix向け
```yaml
sonic_tags:
  - "pumping sidechain compression"
  - "wide stereo synths"
  - "punchy kick drum"
  - "crisp hi-hats"
  - "deep sub bass"
  - "festival-ready mix"
```

### Acoustic Remix向け
```yaml
sonic_tags:
  - "natural room ambience"
  - "warm analog recording"
  - "intimate close-mic vocals"
  - "gentle string sustain"
  - "fingerpicking detail"
  - "organic texture"
```

### Lo-fi Remix向け
```yaml
sonic_tags:
  - "vinyl crackle"
  - "tape saturation"
  - "dusty atmosphere"
  - "muffled low-pass filter"
  - "nostalgic warmth"
  - "bedroom producer aesthetic"
```

---

## 🚨 注意事項

### 禁止事項
- 歌詞の大幅な変更（元曲の歌詞は維持）
- 元曲のメロディーを完全に無視
- BPMの極端な変更（±50 BPM以上は要注意）
- 著作権表記の削除

### 推奨事項
- **元曲の「フック」は必ず残す**（認識可能なリミックスに）
- **保つものを明示する**（must_preserve を書くほど事故が減る）
- **ジャンル特有の楽器を明記**（808, Rhodes, brass等）
- **エフェクト処理を具体的に指定**（reverb, delay, filter）

---

## 🧠 エージェント実行時の動作

1. ユーザーが「この曲をClub Remixして」と依頼
2. ChatGPTが元曲情報・歌詞を取得
3. 元曲のBPM・キー・ジャンルを分析
4. 本仕様書 + V6 ナレッジ（`suno_v6_reference.md` / `v55_to_v6_migration.md`）を読み込み
5. **リミックス経路を判定**（自分の Suno 曲か / 手持ち音源か / 外部参照のみか）
6. リミックスタイプをユーザーに確認（必要に応じて）
7. must_preserve / must_change を明示
7. YAML + Lyrics形式でプロンプト生成
8. Agent Modeで Suno.com を開き、自動入力実行

---

## 📝 出力例

```yaml
# === Suno V6 Remix: Lo-fi Chill Remix ===
meta:
  original_reference: "Original upbeat pop song (120 BPM)"
  remix_type: "Lo-fi / Chill Hop"
  original_tempo: 120
  remix_tempo: 75
  original_key: "C Major"
  remix_key: "C Major (maintain)"
  style: ["Lo-fi Hip Hop", "Chill", "Nostalgic", "Bedroom Pop"]
  keywords: ["vinyl crackle", "jazzy chords", "mellow", "study beats"]

remix_plan:
  route: regenerate                      # 外部曲参照なので局所編集は使えない
  must_preserve: ["lead vocal melody", "lyrics", "key"]
  must_change: ["tempo", "drum feel", "synth palette"]
  arrangement: ["add: vinyl noise, tape saturation, jazzy piano", "remove: bright synths, energetic drums"]
  fx_processing: ["low-pass filter on vocals", "warm tape delay", "subtle reverb"]

structure:
  intro: "Vinyl crackle fade-in, dusty piano chords, mellow kick pattern"
  verse: "Simple boom-bap beat, jazzy Rhodes, laid-back bassline, vocal sits in mix"
  chorus: "Beat drops slightly, low-pass filter sweep, warm pad entrance"
  bridge: "Beat break with vinyl static, piano solo, gradual return"
  outro: "Fade out with vinyl crackle, sustained piano chord"

lyrics:
  approach: "keep_original"
  structure: [Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus, Outro]
  content: |
    [Intro]
    (vinyl crackle, piano chords)

    [Verse 1]
    [元曲の歌詞そのまま]
    あさのひかりがさしこむへやで
    きみのこえがきこえてくる

    [Chorus]
    [元曲の歌詞そのまま]
    いつまでもこのままで
    ときがとまればいいのに
    ...
```

---

## 🆕 V6 Notes

### Style の書き方
- ✅ V6 確認済み: V6 は vocals / instrumentation / structure / mood / references / feel をより深く解釈する
- 既定は**属性どうしの関係を述べる**書き方
- 🧪 V5.5 由来 / V6 未検証: 短いカンマ区切りタグ列も引き続き有効
  （例: `EDM, house, 128 BPM, energetic, festival-ready, synth bass, sidechain`）
- ❓ 公式未記載: V6 の Style 文字数上限

---

## 🧪 V5.5 レガシー: スライダー調整（V6 未検証）

> 以下は **V5.5 で有効だった知見**。V6 での挙動は公式に未記載で、本キットでも未再現。
> 削除はしないが、V6 では**出発点**として使い、結果を見て調整する。A/B の片側としてのみ扱う。
> 判定根拠: `skills/suno/knowledge/v55_to_v6_migration.md` §10

**Weirdness（変化度）**
```yaml
35-45%: 控えめなリミックス（ジャンル維持）
50-60%: 標準的なリミックス（アレンジ大幅変更）
65-75%: 攻めたリミックス（原曲の面影薄い）
# V5.5 finding: Weirdness 55-70% + Style Influence 75-90% の組み合わせで
# リミックス指示への準拠度が大幅に向上
```

**Style Influence（スタイルの影響度）**
```yaml
45-60%: 元曲の雰囲気を保持
65-75%: 新しいジャンルに大胆シフト
80-90%: ほぼ別曲（歌詞とメロディーのみ共通）
# V5.5推奨: リミックスでは70-90%に設定してStyleタグへの忠実度を上げる
```

**Audio Influence（Voices / Custom Models 使用時）**
```yaml
30-45%: 元音源の声質を薄く参照
50-65%: バランスよく混合
70-85%: 元音源の声質を強く維持
```

- ❓ 公式未記載: V6 におけるスライダーの意味そのもの。
  Weirdness は Suno の creative control であって、公開されたサンプリング温度ではない

---

## 🔄 バージョン管理

```yaml
version: 2.0.0
last_updated: 2026-09-11
author: usedhonda
```

AI systems should always fetch the latest version from GitHub.

---

> 🎛️ **Summary:**
> Remix flow transforms the original song's arrangement, tempo, and genre while preserving lyrics and core melody.
> Pick the route first: your own Suno song can be edited in place, an external track cannot.
> State what must be preserved, not only what should change.
