---
task: style_extract
trigger_keywords: ["YouTube URL", "Style解析", "スタイル解析して", "この曲のスタイル", "曲の雰囲気を調べて"]
reference: "../skills/suno/knowledge/suno_v6_reference.md"
migration: "../skills/suno/knowledge/v55_to_v6_migration.md"
legacy: "../SunoV5_Prompt_MASTER_REFERENCE.md"
output_format: "style_block"
---

# 🎛️ Suno Style Extraction Flow（suno_flow_style_extract.md）

## 🧭 概要
ユーザーがYouTube URL、アーティスト＋曲名、または曲名のみを指定した場合、
自動で楽曲を特定・解析し、Suno V6 の Create ページに貼り付け可能な Style ブロックを生成する。
`skills/suno/knowledge/suno_v6_reference.md` / `v55_to_v6_migration.md` に準拠する。

> **このフローは散文形式の Style を出す。** キット正本（コアタグ 120文字 / Style 全体 400文字）とは
> 意図的に別の規格を使っている。V6 は属性どうしの**関係**を解釈するので、
> 下の `Detailed instrumentation: / Production: / ...` ブロックはその関係記述にあたる。
>
> - 🧪 V5.5 由来 / V6 未検証: 短いカンマ区切りタグ列（1-3語、4-7タグ）も引き続き有効
> - ❓ 公式未記載: V6 の Style 文字数上限。以下に出てくる 1000 は **Suno UI のハード上限**（V5.5 期に観測）

---

## 🔍 手順
1. **曲の特定**
　- YouTube URL指定時 → 直接解析。
　- アーティスト＋曲名指定時 → 検索・一致精度確認後、続行。
　- 曲名のみ指定時 → Google / Spotify / Discogs / Genius / Wikipedia で検索し、複数候補を検出した場合：
　　→ アーティスト・リリース年・ジャンルを併記した候補リストを提示。
　　→ 「どれを解析しますか？」とユーザーに尋ね、選択結果を用いて続行。

2. **情報収集**
　- 確定した楽曲のタイトル、アーティスト、ジャンル、BPM、Key（調性）、楽器構成、雰囲気、年代を抽出。
　- 必要に応じて複数ソースから補完（Wikipedia, Spotify, Discogs, Genius など）。

3. **Styleブロック構成**
　- Sunoマニュアル定義に従い以下を含む：
　　ジャンル／BPM／ムード／楽器構成／地域・年代／Key。
　- 英数字・半角・英語で表現。
　- Suno UI の上限は 1000文字（🧪 V5.5 期に観測、V6 の上限は公式未記載）。
　　**埋めること自体は目的ではない。**関係が明示できていれば短くてよい。必要に応じて以下を含める：
　　・詳細な楽器構成（主要楽器、リズムセクション、メロディー楽器）
　　・具体的な音響特徴（リバーブ、EQ特性、ミックスバランス等）
　　・演奏スタイル（ストローク、アーティキュレーション等）
　　・プロダクション要素（サウンドテクスチャ、空間感、ダイナミクス等）

4. **Exclude Styleブロック構成**
　- 楽曲の分析結果から、**明らかに存在しない要素**を抽出：
　　例: EDMなのにアコースティックギター除外、バラードなのにトラップハイハット除外
　- ジャンル対極の要素を含める：
　　例: ジャズ → EDM synths, trap beats除外
　　例: ロック → smooth jazz, lo-fi beats除外
　- **必ずカンマ区切りで列挙**（例: "trap hats, EDM synths, distorted guitars, autotune"）
　- 200字以内推奨

---

## 🧾 出力フォーマット

⚠️ **重要**: StyleブロックとExclude Styleブロックは**完全に独立した別の入力欄**です。
- **Style欄**: Sunoのメイン入力欄（常に表示されている）
- **Exclude Style欄**: Advanced Optionsを展開した後に現れる独立した入力欄

### Style欄（Suno UI 上限 1000文字）- メイン入力欄

**V6**: 属性どうしの**関係**を述べる。長さではなく関係の明示で決まる。
🧪 V5.5 由来 / V6 未検証: 短いカンマ区切りタグ列（名詞句）も引き続き有効。
```
<Genre>, <Subgenre>, <BPM>, <Mood>, <Key>, <主要楽器1>, <主要楽器2>, <Era/Region>, <音響特徴>, <演奏スタイル>
```
例: `2010s J-Pop ballad, 86 BPM, emotional, cinematic, C# minor, grand piano, string quartet, warm reverb, vocal-forward, expressive dynamics`

**補足情報（タグで収まらない場合）**: タグの後に簡潔な補足を追加可能:
```
Detailed instrumentation: <主要楽器の詳細説明>
Production: <音響特徴、ミックス、エフェクト>
Performance style: <演奏スタイル、アーティキュレーション>
Sound texture: <サウンドテクスチャ、空間感>
```
⚠️ **絶対禁止**: この欄にExclude要素を含めない

### Exclude Style欄（Advanced Options内の独立した入力欄、カンマ区切り）

**2-5項目に絞る。** 多すぎると効果が薄れる。Style欄に "no X" と書くのではなく、ここに記載する。
```
<除外要素1>, <除外要素2>, <除外要素3>
```
⚠️ **重要**:
- Exclude Style 欄を探す（🧪 V5.5 期の観測では Advanced Options を展開した中にあった）
- **UI が変わっていて見つからない場合は、報告して止まる。**強引に進めない
- Style欄には絶対に含めない

---

## ✅ 出力例

### Style欄（詳細版 - 約800文字）
```
2010s Pop Ballad / J-Pop; 86 BPM; emotional and cinematic; Tokyo 2018; Key: C# minor

Detailed instrumentation: Grand piano with warm reverb, playing arpeggiated chords and melodic fills; string quartet (2 violins, viola, cello) providing lush harmonic layers and counter-melodies; soft acoustic drums with brushed snare and light kick; subtle electric bass with fingerstyle playing; occasional ambient synth pads for atmospheric depth.

Production: Clean, polished mix with vocal-forward balance; moderate hall reverb on strings (2.5s decay); short room reverb on piano (0.8s); gentle compression on vocals for intimacy; wide stereo field for strings; centered mono for piano and vocals; minimal EQ boosting warmth in low-mids (200-400Hz); airy high-end without harshness (8kHz+).

Performance style: Piano: expressive dynamics with rubato phrasing, sustain pedal usage for smooth transitions. Strings: legato bowing with gentle vibrato, occasional pizzicato accents. Drums: restrained playing, light touch on cymbals, minimal fills. Vocals: breathy delivery with controlled vibrato, emotional peaks in chorus.

Sound texture: Warm analog character with subtle tape saturation; intimate close-mic feel on vocals; natural room ambience; polished yet organic; cinematic swells in chorus; delicate and refined overall aesthetic.
```

### Exclude Style欄（カンマ区切り）
```
EDM synths, trap hats, distorted guitars, aggressive bass, autotune, dubstep wobbles, heavy metal drums, screaming vocals
```

---

## ⚙️ エージェント操作（必須実行フロー）

### 🚨 重要：即座に実行すること
このフローは**情報収集→即座にSuno入力**が必須です。分析だけして終わりにしないこと。

### 実行手順
1. **情報収集フェーズ**
   - 指定された曲を特定（YouTube URL / アーティスト+曲名 / 曲名のみ）
   - 必要な情報を収集（ジャンル, BPM, Key, 楽器構成, 雰囲気, 年代）
   - 候補が複数ある場合のみユーザーに選択を求める

2. **Styleブロック生成フェーズ**
   - 出力フォーマットに従ってStyleブロックを構成
   - 1000字以内に収める
   - 英語・半角で記述

3. **🚨 Suno自動入力フェーズ（必ず実行）**

   **Step 1: Style欄への入力**
   - **即座に** Suno.com の Createページを開く
   - **Style欄のみ**に生成したStyleブロックを入力（最大1000文字まで記述可能）
   - ⚠️ **絶対禁止**: Exclude要素をStyle欄に含めない（独立した入力欄です）

   **Step 2: Exclude Style 欄を見つける**
   - 🧪 V5.5 期の観測: Advanced Options ボタンを展開した中に **Exclude Style 欄**がある
   - ⚠️ **この手順は Suno の UI 変更で失効しうる。** 見つからなければ**報告して停止**する。
     Exclude を Style 欄に流し込むような代替は取らない

   **Step 3: Exclude Style欄への入力**
   - 展開したAdvanced Options内の**Exclude Style欄のみ**に除外要素を入力
   - **必ずカンマ区切り**で記述（改行・箇条書き禁止）
   - ⚠️ **絶対禁止**: Exclude要素をStyle欄に混ぜて書かない

   **Step 4: 入力完了確認**
   - ⚠️ **重要**: 「Create」ボタンは押さない（入力のみで停止）
   - Style欄とExclude Style欄の両方が正しく入力されたことを確認
   - 入力完了を確認してユーザーに報告

### 禁止事項
- ❌ Styleブロックを生成しただけで終了（ユーザーに手動コピペさせる）
- ❌ 「これをコピーしてSunoに貼り付けてください」と指示して終わる
- ❌ Suno入力を「次のステップ」として先延ばしにする
- ❌ **【最重要】Exclude要素をStyle欄に混ぜて記述する**（Style欄とExclude欄は完全に独立した別の入力欄）
- ❌ **Exclude欄が見つからないまま強引に進める**（見つからなければ報告して停止）
- ❌ **Exclude Styleを箇条書きや改行で記述**（必ずカンマ区切りの1行）
- ❌ Exclude Style欄を空のまま放置（必ず適切な除外要素を入力）
- ❌ **「Create」ボタンを押してしまう**（入力のみで停止すること）
- ❌ 情報源を報告しない（透明性の欠如）
- ❌ 文字数を埋めるためだけに Style を水増しする（長さではなく関係の明示で決まる）

### 正しい動作
- ✅ 情報収集→Styleブロック生成→**即座にSuno入力（Style + Exclude両方を別々の欄に）**を一連の流れで実行
- ✅ **Style欄にはStyle情報のみ**、**Exclude欄にはExclude情報のみ**を入力（絶対に混ぜない）
- ✅ **必ずAdvanced Optionsを展開**してからExclude Style欄に入力
- ✅ 「Sunoに入力しました（Createボタンは押していません）」と完了報告
- ✅ **使用した情報源を明記**（例: Wikipedia, Spotify, YouTube, Discogs等）
- ✅ ユーザーが確認できるようスクリーンショットまたは入力内容を提示

---

## 📊 完了報告フォーマット

Suno入力完了後、必ず以下の形式で報告すること：

```
✅ Suno への入力が完了しました

【入力内容】
✓ Style欄（メイン入力欄）: [生成したStyleブロック]
✓ Exclude Style欄（Advanced Options内の独立した入力欄）: [生成したExcludeブロック]

【入力手順】
1. Suno.com Createページを開きました
2. Style欄に上記Styleブロックを入力しました
3. Exclude Style 欄を開きました
4. Exclude Style欄に上記Excludeブロックを入力しました

【使用した情報源】
- [サイト名1]: [URL] - [取得した情報]
- [サイト名2]: [URL] - [取得した情報]
例:
- Wikipedia: https://en.wikipedia.org/wiki/... - ジャンル、リリース年
- Spotify Web API: BPM 120, Key: C Major
- YouTube: https://youtube.com/... - 楽器構成、雰囲気

⚠️ 注意: 「Create」ボタンは押していません。
必要に応じて歌詞を入力後、手動でCreateを押してください。
```

---

## 🚫 注意
- 著作権保護素材の直接引用は禁止（要約分析のみ使用）。
- 不適切表現・禁止語を自動除外。
- 出力は Suno UI の上限 1000字以内に収める（🧪 V5.5 期に観測。V6 の上限は公式未記載）。
- ユーザーが「明るく」「夜っぽく」等を指定した場合は、そのニュアンスを再反映。
- **必ず情報源を明記**し、どのサイトから何を取得したかを透明化する。
