---
name: suno
description: |
  Suno V6 統合スキル（V5.5 も旧モデルとして選択可）。アーティスト設定 → 歌詞生成 → 楽曲(Style/Exclude/YAML)生成の3ステップで曲を作る。
  自由テキストで指示でき、足りない情報は対話で収集する。
  全ての曲はアーティストに紐づく。アーティスト設定があれば歌詞・楽曲から開始。
  トリガー: /suno, 曲作って, 歌詞書いて, スタイル作って, アーティスト作って, Suno prompt, Suno lyrics, Suno 用 YAML, Suno の WAV を整えて
argument-hint: "[任意 — 自然言語で指示可能]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - WebSearch
  - WebFetch
compression-anchors:
  - "Suno V6 統合スキル"
  - "アーティスト → 歌詞 → 楽曲 パイプライン"
  - "アーティスト設定をYAMLで保存・再利用"
  - "歌詞イテレーション+コーチング"
  - "Tampermonkey連携でSunoに自動入力"
version: 1.0.0
---

# Suno — 統合楽曲制作スキル

アーティスト設定 → 歌詞生成 → 楽曲(Style/Exclude/YAML)生成。全ての曲はアーティストに紐づく。

## 起動時チェック（スキル読み込み時に実行）

`/suno` 起動時に以下をシェルで確認し、不足があればユーザーに案内する:

```bash
# 一括チェック
python3 -c "
missing = []
try: import pedalboard; print('✅ pedalboard')
except ImportError: missing.append('pedalboard'); print('❌ pedalboard')
try: import matchering; print('✅ matchering')
except ImportError: print('⬚ matchering (optional)')
import shutil
for cmd in ['ffmpeg', 'ffprobe']:
    if shutil.which(cmd): print(f'✅ {cmd}')
    else: missing.append(cmd); print(f'❌ {cmd}')
if missing:
    print(f'\n⚠️ 不足: {", ".join(missing)}')
    if 'pedalboard' in missing: print('  → pip install pedalboard  (マスタリングに必要)')
    if 'ffmpeg' in missing or 'ffprobe' in missing: print('  → brew install ffmpeg  (分析・変換・動画生成に必要)')
else:
    print('\n✅ 全ツール準備OK')
"
```

不足があっても歌詞生成（Step 1-3）は問題なく使える。マスタリング（Step 4）で必要になる旨を伝える。

---

## Knowledge Files

このスキルのディレクトリ直下の `knowledge/` を参照する。ジャンルに応じて必要なファイルだけ読む。
（Claude Code / Codex のどちらから起動しても同じ実体を読むため、この参照は相対パス）

| ファイル | 内容 | いつ読むか |
|---------|------|-----------|
| `knowledge/lyric_craft.md` | 伏線、韻、フック、禁止事項、感情アーク、コーチング | 歌詞生成時 |
| `knowledge/song_structures.md` | 曲構成パターン、セクション機能、エネルギーカーブ | 歌詞生成時 |
| `knowledge/style_catalog.md` | ジャンル別テンプレ、アノテーション語彙、フック特性 | 全般 |
| `knowledge/rap_and_flow.md` | フロー類型、韻スキーム、16小節構成、日本語ラップ | ラップ/Hip Hop時 |
| `knowledge/english_lyrics.md` | 英語韻体系、プロソディ、バイリンガル戦略 | 英語/バイリンガル時 |
| `knowledge/suno_v6_reference.md` | V6のモデル3系統、局所編集/mashup/multimodal、未確定事項 | 楽曲生成時（既定） |
| `knowledge/v55_to_v6_migration.md` | V5.5 の各ルールの keep/modify/demote 判定 | 楽曲生成時（既定） |
| `knowledge/suno_v55_reference.md` | V5.5機能、メタタグ、スライダー、Cover/Sample/Inspo | 旧モデル V5.5 を使う時 |
| `knowledge/yaml_template.md` | YAML+Style出力テンプレート | 楽曲生成時 |

---

## 入力

`/suno` だけで発動し、必要な情報は対話で収集する。
引数に自然言語が付いていれば、そこから読み取れるものは読み取る。

| 入力例 | 動作 |
|-------|------|
| `/suno` | 対話開始。まずアーティストを聞く |
| `/suno アーティスト作って` | Step 1 へ直行 |
| `/suno used::honda で失恋ラップ` | アーティスト読み込み → 歌詞生成 |
| `/suno 歌詞は ~/lyrics.txt` | アーティストを聞いてから歌詞整形 |
| `/suno スタイルだけ、90年代R&B` | アーティストを聞いてからStyle生成 |
| `/suno used::honda で全部やって、テーマは夜の街` | 全ステップ一気通貫 |

---

## 作業フォルダの管理イメージ

ユーザーは特定のフォルダで CC を使って曲を作り続ける。以下の構造を推奨する（強制ではない）:

```
my-music/                         # 作業フォルダ（ユーザーが CC を起動する場所）
├── artists/                      # アーティスト設定
│   ├── used-honda.md
│   └── another-artist.md
├── songs/                        # 曲ごとのフォルダ
│   ├── midnight-run/
│   │   ├── lyrics.md             # 歌詞（オリジナル・漢字あり・人間用）
│   │   ├── lyrics-kana.md        # 歌詞（ひらがな変換済み・確認用）
│   │   ├── style.md              # Style + Exclude
│   │   └── notes.md              # メモ（任意）
│   ├── neon-rain/
│   │   ├── lyrics.md
│   │   └── style.md
│   └── ...
└── drafts/                       # 下書き・ボツ（任意）
```

**ルール（緩め）:**
- `artists/` にアーティスト設定を保存。名前でファイルを指定できる
- `songs/<曲名>/` に曲の成果物を保存。曲名はユーザーと相談して決める
- 「完成」時に自動で保存先を提案する（ユーザーが変えてもOK）
- 既存のフォルダ構造があれば、それに合わせる（押し付けない）

---

## Step 1: アーティスト設定

### 既存アーティストの読み込み

ユーザーがアーティスト名やファイルパスを指定したら読み込み、全ステップに反映する。

### 既存指示からの抽出

ユーザーが過去に書いた自由形式のテキスト（歌詞ルール・出力ルール・アーティスト設定が混在）を渡された場合:
- アーティストに属する要素（人格、一貫したルール）を抽出してプロファイルに整形
- 曲固有のルール（特定テーマ、特定ムード）は分離し、「これは曲側の設定ですね」とフィードバック
- 判断基準は後述の「アーティスト vs 曲の境界」テーブルを使う

### 新規アーティストの作成

「作って」「新しく」等の指示、またはアーティストがない場合、**対話で深掘り**してプロファイルを作る。

**対話の進め方:**

一問一答ではなく、まず雑な説明をもらい、そこから掘り下げる:

```
CC: 「どんなアーティストですか？雑でいいので教えてください」
ユーザー: 「企業経営者の裏の顔のラッパー。社会風刺系で、NUジャズが好き」
CC: （ここから掘り下げ質問。一度に2-3問ずつ。空気を読んで深追いしすぎない）
```

**掘り下げ質問プール（必要なものだけ聞く）:**

| カテゴリ | 質問例 | 目的 |
|---------|-------|------|
| 声・歌い方 | 「声のイメージは？（低い/高い、囁く/叫ぶ、ラップ/歌い上げ等）」 | voice セクション |
| 言語 | 「日本語メイン？英語はどう混ぜる？」 | language 設定 |
| 韻の好み | 「韻は硬く踏む派？自然に流す派？」 | rhyme_style |
| 歌詞の態度 | 「歌詞で一番大事にしたいことは？」 | themes, stance |
| 避けるもの | 「絶対やらないこと、言わないことは？」 | avoid |
| 音の好み | 「好きな楽器、好きな音のテクスチャは？」 | instruments, mix |
| リスナー | 「誰に聴いてほしい？」 | target_audience |
| 参照 | 「近いと思うアーティストや曲は？（音の方向性として）」 | roots の補強 |

**短縮判定 — 以下が揃ったら掘り下げを終了してプロファイル提示に移る:**
- identity（人物像 + 態度）が明確
- genres が1つ以上確定
- voice（声質 or 歌い方）に方向性がある
- avoid（やらないこと）が1つ以上ある

全フィールドを埋める必要はない。空欄は「制約なし＝自由」として扱う。推測できるところはAIが埋めて「こんな感じですか？」と確認する。

### アーティストプロファイル出力

対話が終わったら Markdown 形式で出力し、ファイルとして保存する。
YAML frontmatter に構造化データ、本文に自由記述。Obsidian でそのまま管理できる。

```markdown
---
name: "<アーティスト名>"
genres: ["<得意ジャンル>"]
language: "<メイン言語>"
tempo_range: "<BPM範囲>"
source_channels: ["<ネタ元1>", "<ネタ元2>"]
cover: "[[artists/<name>-cover.png]]"
tags: [artist, suno]
---

![[<name>-cover.png]]

# <アーティスト名>

## 人物像
<persona 1-2文>
<歌詞の根底にある態度>

## 音楽的ルーツ
- <ルーツ1>、<ルーツ2>
- 時代感: <era_vibe>
- 音の参照: <音の特徴で記述。アーティスト名ではなく>

## 声・歌い方
- 声質: <tone>
- デリバリー: <delivery>
- 英語の使い方: <english_mix>

## 歌詞
- テーマ: <themes>
- ネタ元: <X、ニュース、実体験、映画、etc.>
- 視点: <pov>
- 語彙: <vocabulary>
- 韻: <rhyme_style>
- フック: <hooks>
- 伏線: <foreshadow>
- **避けること**: <avoid>

## プロダクション
- 楽器: <instruments>
- ミックス: <mix>

## リスナー
- ターゲット: <target>
- 聴いたときの気分: <mood>

## 出力ルール（全曲共通）
- 言語比率: <例: 日本語80% / 英語20%>
- 文字数: <目標範囲>
- 優先事項: <韻とフロウ最優先 / 詩的表現最優先 / メロディ乗り最優先 etc.>
- その他: <全曲に適用するルール>
```

**カスタムセクション:** プロファイルにはテンプレート外のセクションを自由に追加してよい（例: 地理的スタンス、コラボ方針、禁止モチーフ等）。Step 2/3 ではプロファイルの**全セクション**を読み込んで反映する。テンプレートにないセクションこそアーティストの個性。無視しない。

**保存:** ユーザーに保存先を確認し、ファイルとして保存。デフォルト: `./artists/<name>.md`（作業フォルダ基準）

**Obsidian連携:** 曲の歌詞ファイルからアーティストへ `[[artists/<name>]]` でリンクできる。

**確認:** 「これでいいですか？変えたいところがあれば言ってください」→ 修正してから保存。

---

## アーティスト設定 vs 曲設定の判断基準

| 判断基準 | アーティスト（全曲共通） | 曲（個別） |
|---------|----------------------|-----------|
| 一貫性 | 全曲で守るルール | 曲ごとに変わる |
| 例: 韻 | 「多音節韻を重視」 | 「今回はAABBで」 |
| 例: テーマ | 「社会風刺が軸」 | 「今回は夜の街」 |
| 例: 言語 | 「日本語ベース、フックに英語」 | 「今回は全英語」 |
| 例: 禁止 | 「自己紹介禁止」「センチ禁止」 | — |
| 例: ムード | — | 「ダーク」「アップテンポ」 |
| 例: BPM | tempo_range（幅） | 具体BPM |
| 例: ネタ元 | 「Xで話題のもの」 | 「今日見たニュース」 |

**迷ったら:** 「次の曲でも同じルールを適用したいか？」で判断。Yes → アーティスト、No → 曲。

---

## Step 2: 歌詞生成

アーティストの人格で歌詞を書く。

### 🚨 プロファイル反映の原則

アーティストプロファイルの**全文を読み込み**、歌詞のあらゆる側面に反映する。
定型フィールドもカスタムセクションも同等に扱う。テンプレートにないセクション（例: 地理的スタンス）こそアーティストの個性であり、最優先で反映する。

**反映ガイド（見落としやすいポイント）:**

| プロファイルの記述 | 歌詞への反映先 | 見落としやすい理由 |
|------------------|--------------|------------------|
| `voice.delivery` | アノテーションタグ **+** 歌詞密度（音節数/行） | タグには入れるが密度調整を忘れがち |
| `stance`（態度） | 歌詞全体のトーン・話法 | themes に引きずられて stance を無視しがち |
| `foreshadow` | 伏線の手法 **+** 情報開示ペース | 手法は入れても設計思想を忘れがち |
| `source_channels` | モチーフの具象物 | テーマは反映するがモチーフの質感まで反映しない |
| `target` | 語彙レベル・暗示 vs 説明のバランス | リスナー像に合わせた情報密度を忘れがち |
| `mood` | 感情アーク（セクション間の感情推移） | 全体ムードは合っていてもアーク設計が甘い |
| `出力ルール` | 文字数・言語比率・優先事項 | 歌詞の中身に集中して数値制約を忘れがち |
| カスタムセクション | セクション固有のルール | テンプレート外なので存在自体を見落とす |

### 入力パターン

**Pattern A（テーマから生成）:** テーマ、ムード、ジャンル指定 → アーティストの人格でゼロから書く
**Pattern B（歌詞あり）:** ファイルパス or ペースト → 保護して整形（漢字→ひらがな、タグ付与）

### 内部処理（ユーザーには見せない）

1. **ジャンル検出**: `genres` + ユーザー指示 → knowledge/ のジャンル別ファイルを読むトリガー
1.5. **拍子・リズム判定**: ユーザー指示または `genres` に変拍子を示唆する語（math rock / progressive / odd meter / 5/4 / 7/8 / 変拍子 / プログレ 等）が含まれる → `knowledge/suno_v55_reference.md` の「Odd Time Signature / 変拍子プロンプト戦略」セクションを必ず読む。読んだ上で:
   - **Pattern A（ゼロから生成）の場合**: 歌詞のフレーズ長を奇数拍のまとまりに合わせ、行密度・音節設計を 4/4 デフォルトから変え、カウント歌詞やアクセント指示をセクションタグに含めるか検討する
   - **Pattern B（持ち込み歌詞）の場合**: 🚨 歌詞本文は一切変更しない（Pattern B 絶対ルール）。できるのはアノテーションタグへの拍子情報追加のみ（例: `[Verse - 7/8 feel, accent 2+2+3]`）。変拍子と噛み合わない可能性をユーザーに注意喚起する
1.6. **Ending 判定**: Ending / outro / fade / ループ終止 / clear stop を示す語がある、または「終わり方が崩れやすい」タイプの曲だと判断したら、`knowledge/suno_v55_reference.md` の `Ending Control Workflow` を読む。Pattern A では最終行と Outro を先に設計し、Pattern B では本文を変えず annotation と META だけで終止感を補助する
2. **言語モード**: `language` + `english_mix` + `出力ルール.言語比率`
3. **核イメージ**: ユーザーテーマ × `themes`（方向制約）× `stance`（態度フィルタ）
4. **伏線マップ**: `foreshadow` 設定に基づき、歌詞を書き始める前に設計する:
   - 種: Verse 1-2 で仕込む具体的なモチーフ・単語・情景
   - 回収: Final Chorus / Bridge / Outro でどう反転・補完するか
   - 検証: 初聴と再聴で意味が変わるか（変わらないなら伏線として弱い）
5. **人物と関係性**: `pov` + カスタムセクション（例: 地理的スタンス）
6. **感情のズレ**: `mood` が示す感情到達点から逆算して「言えないこと」を設計
7. **具体物（モチーフ）**: `source_channels` のソースに合った具象物を選ぶ。伏線マップの「種」もここで具象化する
8. **コントラスト**: 伏線マップの「回収」に沿った対比軸を選ぶ
9. **フック**: `hooks` の設計方針 + `vocabulary` のトーンで Chorus 1行目を設計

### 🚨 Step 2 反映チェックリスト（生成後セルフチェック）

- [ ] プロファイルの全セクションを読んだか（カスタムセクション含む）
- [ ] voice → アノテーションタグと歌詞密度に反映したか
- [ ] stance → 歌詞のトーン・話法に反映したか
- [ ] foreshadow → 指定の手法 + 設計思想を反映したか
- [ ] avoid → 全項目をチェックし、違反がないか
- [ ] 出力ルール → 文字数・言語比率・優先事項を満たしているか
- [ ] カスタムセクション → 該当するルールを見落としていないか
- [ ] 変拍子の要求あり → knowledge の変拍子セクションを読んで歌詞設計に反映したか（Pattern B なら歌詞本文を変更していないか）
- [ ] 終止感が重要な曲 → `Ending Control Workflow` を読んで最終行 / Outro / annotation に反映したか

### 歌詞の掟

- **情景で語れ**: 感情語を使わない。温度、光、距離、動作で描く
- **伏線を仕込め**: アーティストの `foreshadow` に手法や設計思想があればそれを優先。未設定時はデフォルト（同語反転、情景反転、台詞反転、欠落補完）から毎回1つ
- **韻を踏め**: アーティスト設定の rhyme_style に沿って
- **フックを立てろ**: Chorus 1行目で核を言い切る
- **歌えること**: 6-12音節/行（4/4 前提のデフォルト）、セクション間で密度コントラスト。**変拍子の場合は拍数のまとまりを優先し、音節数は副次条件として扱う**（詳細は `knowledge/suno_v55_reference.md` の「Odd Time Signature / 変拍子プロンプト戦略」参照）
- **終わりを設計しろ**: Ending が弱い曲は最終行と Outro を先に決める。Pattern B では本文不変、annotation と META で終止感を補助する
- **禁止**: 感情語連打、説明口調、比喩盛りすぎ、抽象名詞連打

### Pattern B の絶対ルール

- ユーザーの歌詞は **一字一句変えない**
- やっていいこと: 漢字→ひらがな変換、アノテーションタグ付与のみ
- セクション構成の順序・名前・数を変えない（追加はOK）

### デフォルト構成（4-5分曲）

| セクション | 行数上限 | 回数 |
|-----------|---------|------|
| Verse | 4行 | ×2 |
| Pre-Chorus | 2行 | ×2 |
| Chorus | 4行 | ×2（Final Chorusで伏線回収） |
| Bridge | 2行 | ×1 |
| Intro/Outro | 0-1行 | 指定時のみ |

### Suno 制約

- **絶対上限: 5000文字以下**（タグ・アノテーション・歌詞・空行すべて含む。python3 で機械的にカウントする）
- **アーティストの `出力ルール.文字数`** がある場合はそちらも遵守（例: 1500-2000文字）
- V5.5 アノテーションタグ: `[Chorus - explosive, full band, powerful vocal]`（英語、2-5語）
- **日本語モード:** コードブロック内は漢字→ひらがな。コードブロック外は通常の日本語
- 句読点リズム制御、フォネティック・スペル対応

**🚨 歌詞文字数の機械的検証（必須）:**
セルフチェック（自己申告）は信用しない。歌詞を生成したら **必ずシェルで実カウント** する:
```bash
python3 -c "
text = '''<歌詞全文（タグ・アノテーション・空行含む）>'''
print(f'歌詞文字数: {len(text)}')
"
```
- `出力ルール.文字数` の目標範囲と比較 → 範囲外なら書き足し/削り
- Suno 上限（5000文字）と比較 → 超過なら圧縮
- **カウント結果を必ずユーザーに表示する**

### 出力フォーマット

**歌詞は2版出力する:**

1. **オリジナル版**（漢字あり） — 人間が読む用。コードブロックで出力
2. **Suno版**（ひらがな変換済み） — Suno貼り付け用。コードブロックで出力

「完成」時に `lyrics.md`（オリジナル）と `lyrics-kana.md`（ひらがな）の2ファイルを保存する。
イテレーション中はSuno版のみ表示し、完成時に両方出す。

**lyrics.md のフォーマット:**
```markdown
---
title: "<曲タイトル>"
artist: "[[artists/<name>]]"
genre: "<ジャンル>"
date: <YYYY-MM-DD>
tags: [lyrics, suno]
---

# <曲タイトル>

[Verse 1]
漢字ありのオリジナル歌詞
...
```

**lyrics-kana.md:** frontmatter なし。Suno にそのまま貼れるプレーンテキスト（タグ+アノテーション+ひらがな歌詞）。

**コーチングセクション（毎回）:**
1. **設計図**: 伏線、韻の仕掛け、フック分析、構成意図、感情アーク
2. **強み / 磨ける**: 具体的な行を引用
3. **次の一手**: 3-5個の番号付き選択肢（理由つき）
4. **作詞ワンポイント**: 関連テクニック1つ（任意）

### イテレーション

- 指示された箇所だけ変更、他は触らない
- 常に全文をコードブロックで再出力
- `📝 変更: [内容]` を1行で明示
- 番号選択（「3で」）→ コーチングの選択肢を実行
- 「完成」→ Step 3 へ

---

## Step 3: 楽曲（Style / Exclude / YAML）

アーティスト設定 × **この曲固有の方向性** から、Suno 用の出力を生成する。
既定は **V6**（現行世代）。`knowledge/suno_v6_reference.md` と `knowledge/v55_to_v6_migration.md` を読み、
Phase A の質問5で precision / exploration / fast のどれを狙うか決める。
V5.5 は旧モデル。明示的に指定された場合のみ `knowledge/suno_v55_reference.md` に従う。
⚠️ アーティスト設定だけで Style を作ると全曲同じになる。必ず曲固有のインプットを加える。

### Phase A: 曲固有ヒアリング（対話）

歌詞が「完成」した後、Style 生成に入る前に以下を聞く:

1. **「参照したい曲はありますか？（YouTube URL 等）」**
   → URL があれば Web 検索で BPM / Key / Genre / Instruments / 雰囲気を調査
2. **「この曲のムード・テンポ・楽器で、アーティストのデフォルトから変えたいところは？」**
   → 「今回はもっとダークに」「テンポ落として」「ピアノ抜きで」等
3. **「イメージに近い音の方向性は？」**
   → テキスト指示、ジャンル名、「〇〇みたいな感じ」等
4. **「変拍子（5/4, 7/8 等）を狙いますか？」**
   → Yes なら `knowledge/suno_v55_reference.md` の「Odd Time Signature / 変拍子プロンプト戦略」を必読。シード音源（クリック/ドラムループ）の有無も確認し、Style に連符語彙（quintuplet / septuplet）とアクセント分割（3+2 / 2+2+3 等）を含め、スライダーを Weirdness 25-40 / Style Influence 70-85 に設定する

5. **「V6 を使いますか？ 使うなら精密／探索／高速のどれ？」**
   → 既定は **V6**（現行世代）。どの V6 を使うかを聞く:

   | 意図 | モデル | 使いどころ |
   |---|---|---|
   | 精密 | `v6` | 仕上げ。狙いが決まっている曲（**有料限定**） |
   | 探索 | `v6-wild` | 自分では書かない発想がほしい（**有料限定**） |
   | 高速 | `v6-mini` | 下書き・反復。無料でも使える |

   V6 を選んだら `knowledge/suno_v6_reference.md` を必読。Style の書き方が
   「タグ列」から「関係を述べた文」に変わる。探索→精密の2段階（`v6-wild` で広げて
   `v6` で仕上げる）も提案してよい。

ユーザーが「おまかせ」「特にない」と言った場合でも、歌詞の内容・テーマ・感情アークから CC が曲固有の方向性を提案する。アーティスト設定をそのまま流用しない。

Phase A で方向性が固まったら Phase B へ。

### Phase B: 一括出力（確認を挟まない）

Phase A のヒアリング結果 + アーティスト設定 + 歌詞から、Style/Exclude/YAML を**一気に出す**。
**コーチングは不要**（Step 2 で歌詞は確定済み）。Phase B に入ったら途中で止めない。

### スタイルの方向性（まとめ）

以下の情報を**組み合わせて** Style を構築する:
- **アーティスト設定**: ベースライン（genres, instruments, mix, voice）
- **曲固有のヒアリング結果**: この曲の個性（Phase A で収集）
- **参照曲の調査結果**: BPM/Key/Genre 等（URL がある場合）
- **歌詞の内容**: テーマ、感情アーク、密度から逆算したムード
- **最新運用知見**: `knowledge/suno_v55_reference.md` の slider / ending / duet / voices / My Taste 補足
- **V6 を使う場合**: `knowledge/suno_v6_reference.md`（モデル3系統・局所編集・未確定事項）と
  `knowledge/v55_to_v6_migration.md`（V5.5 の各ルールの keep/modify/demote 判定）

### 🚨 プロファイル反映の原則

アーティストプロファイルの音楽的記述を**全て英訳して** Style / YAML に反映する。
プロファイルの自由記述をそのまま活かす。テンプレートに沿って薄めない。

**反映ガイド:**

| プロファイルの記述 | 反映先 | ポイント |
|------------------|--------|---------|
| `roots` + `era_vibe` | **Style** コアタグ（genre pair） | 時代感を 2-3 語に凝縮 |
| `voice`（全体） | **YAML** `vocals` + **Performance Direction** | tone, delivery を YAML、セクション別演出は PD |
| `instruments` | **Style** に 2-3 key instruments + **YAML** `production_notes` に詳細 | Style は主要楽器のみ、詳細は YAML へ |
| `mix` | **YAML** `production_notes` + **Style** に mix keyword 1語 | Style には `wide stereo` や `raw` 程度 |
| `tempo_range` | **Style** BPM | 曲ムードで範囲内の具体値を決定 |
| `avoid`（音楽的要素） | **Exclude** に追加 | 歌詞の avoid とは別に音楽的な avoid を Exclude へ |
| `mood` | **YAML** `meta.vibe` + **Style** mood keyword | 3-5語の英語に凝縮 |
| `出力ルール.優先事項` | **Performance Direction** | セクション別の演出で反映 |

**YAML フィールド生成ルール:**
- `meta.vibe` ← `mood` + `stance` + 曲テーマ → 3-5語の英語
- `vocals` ← `voice` セクション全体を英訳
- `production_notes` ← `instruments` + `mix` を1行に凝縮

### 🚨 絶対ルール

1. URL参照時は必ずWeb検索。推測禁止
2. 歌詞の元曲は調査しない
3. Style と Exclude は全て英語
4. YAML メタデータは全て英語。歌詞のみ日本語（ひらがな）可
5. アーティスト名、曲名は Style に入れない
6. Voices / Cover で声を狙うときは gender tag 単体より **物理描写（register, breathiness, attack, delivery）** を優先
7. 低域が欲しいときは明示する。不要なジャンク質感は Exclude で切る
8. Style が効きすぎる場合は、Style を短くして annotation / YAML 側へ制御を寄せる

### 出力

**🚨 Step 3 反映チェックリスト（Style/YAML 生成前にセルフチェック）:**

- [ ] プロファイルの音楽的セクションを全て読んだか
- [ ] roots + era_vibe → Genre & Era に反映するか
- [ ] voice → Vocal Production + YAML vocals に反映するか
- [ ] instruments → Style に 2-3 key instruments、詳細は YAML production_notes へ
- [ ] mix → YAML production_notes に反映するか（Style にはキーワード1語のみ）
- [ ] avoid → Exclude に音楽的要素を含めるか
- [ ] 出力ルール → 音楽的優先事項を反映するか
- [ ] ライブ感/歓声の懸念 → `[studio recording]` + Style/Exclude に anti-live 指示
- [ ] イントロ → `[Intro]` の引き伸ばしリスクを考慮し、代替手段を検討したか
- [ ] Voices / Cover → gender tag だけで済ませず、物理描写で声を固定したか
- [ ] 低域 / ノイズ → sub-bass を明示するか、filler-noise を Exclude へ送るか判断したか
- [ ] Ending が弱いタイプの曲 → ending intent を META / annotation に入れたか
- [ ] デュエット等の難題 → one-shot で押し切らず、必要なら Studio stem workflow を選ぶか

**🚨 Step 3 出力フロー（順序厳守・スキップ禁止）:**

Step 3 は以下の全項目を **この順序で** 出力して初めて完了とする。
**途中で止めない。ユーザーへの確認を挟まない。一気に全項目を出力する。**

```
1) 調査レポート → 2) Style → 3) Exclude → 4) YAML + Lyrics → 5) 文字数カウント
   （URL参照時のみ）  （必須）    （必須）    （歌詞ありなら必須）  （必須）
```

**🚨 致命的な禁止事項:**
- ❌ Style/Exclude を出した後に「Sunoに送りますか？」と聞く → **YAML が未生成**
- ❌ Style/Exclude を出した後に次の指示を待つ → **YAML を飛ばす原因**
- ❌ YAML を生成せずに Suno 自動入力セクションに進む
- ✅ Style → Exclude → YAML → 文字数カウント を **1つのレスポンスで連続出力**

ユーザーが明示的に「YAML 不要」と言った場合のみ 4) をスキップしてよい。

---

**1) 調査レポート（URL参照時のみ）**

▼ 次は Style を生成する。スキップ禁止。

**2) Style（英語のみ、V5.5 タグ形式、コアタグ 120文字以内）**

V5.5 準拠のタグ形式で出力する。**プローズ（散文）禁止。**
詳細な production 指示は YAML META の `production_notes` と annotation tags に任せる。

フォーマット: `genre, BPM <n>, key, mood, vocal descriptor, 2-3 instruments, mix keyword`

例: `nu-jazz rap, 150 BPM, G minor, sardonic aggressive, male rap, jazz drums, fat slap bass, Rhodes, horn stabs, wide stereo, raw`

**Performance Direction（任意）:** セクション別の演出制御が必要な場合、Style タグの後に改行して追加:
```
Spoken Word: dry close-mic sparse Rhodes only
Verse: full band erupts aggressive
Hook: explosive brass chant
Bridge: piano ghost drums only
```

**🚨 [Intro] タグ注意:** `[Intro]` はインスト引き伸ばしを誘発する。代替: `[Spoken Word]` / Verse 1 統合 / イントロ省略。yaml_template.md 参照。

**🚨 [studio recording]:** ライブ感/歓声が入る場合、歌詞の先頭に `[studio recording]` を追加。Style にも `Remove fake crowd cheering. Studio room not stadium.` を追加。

**🚨 Style 文字数チェック（機械的検証・必須）:**
自己申告は信用しない。Style を生成したら **出力前にシェルで実カウント** する:
```bash
python3 -c "
style = '''<Style全文>'''
count = len(style)
# コアタグ部分（1行目）のみカウント
core = style.split('\n')[0]
core_count = len(core)
print(f'コアタグ: {core_count}文字 (目標: 120以内)')
print(f'全体（Performance Direction込み）: {count}文字 (目標: 400以内)')
if core_count > 120: print('⚠️ コアタグ超過！descriptor を減らす')
elif count > 400: print('⚠️ 全体超過！Performance Direction を圧縮')
else: print('✅ OK')
"
```
1. コアタグ 120文字超過 → 副形容詞を削除、instruments を 2-3 に絞る
2. 全体 400文字超過 → Performance Direction を圧縮
3. **カウント結果を必ずユーザーに表示する**

**3) Exclude（英語、1行、200文字以内、2-5項目）**

▼ 次は YAML + Lyrics を生成する。**ここで止まるな。スキップ禁止。**

**4) YAML + Lyrics（歌詞ありの場合、キット目標 4500 / Suno 上限 5000文字以内）**
```yaml
# META (hints; do not sing)
version: <使用モデル。既定 v6。他に v6-wild / v6-mini、旧モデルは v5.5>
meta:
  tempo: <int>
  key: "<key>"
  signature: "4/4"
  form: "<section flow>"
  vibe: "<3-5 word vibe>"
language: "<from artist>"
vocals: ...
production_notes: ...
=== LYRICS START ===
[セクションタグ + アノテーション]
<歌詞>
=== LYRICS END ===
```

▼ 次は文字数カウント。スキップ禁止。

**5) 文字数カウント（機械的検証・必須）**
YAML+Lyrics 全体をシェルで実カウントする:
```bash
python3 -c "
yaml_lyrics = '''<YAML+Lyrics全文>'''
count = len(yaml_lyrics)
print(f'YAML+Lyrics文字数: {count} (キット目標 4500 / Suno 上限 5000)')
if count > 5000: print('🚨 Suno 上限超過！必ず圧縮')
elif count > 4500: print('⚠️ キット目標 4500 超過 — META を圧縮（歌詞は絶対に削らない）')
else: print('✅ OK')
"
```

**🚨 Step 3 完了チェック（出力後に自己確認）:**
以下を全て満たしているか確認してから先に進む:
- [x] Style を出力した
- [x] Exclude を出力した
- [x] YAML + Lyrics を出力した（歌詞ありの場合）
- [x] 文字数カウントを出力した
→ 全て ✅ なら「Sunoに送る？」と聞いてよい。1つでも未出力なら **戻って生成する**。

---

## Suno 自動入力（Tampermonkey連携）

出力完了後、**「Sunoに送る？」** と確認し、承認されたら Tampermonkey 対応URLでブラウザを開く。
**Create ボタンは押さない。** 流し込みのみ行い、送信はユーザーに委ねる。

### 🚨 Suno 投入の3大ルール

**見落とし厳禁。投入前に必ず確認する。**

1. **lyrics ソース: yaml-suno.md が最優先**
   - yaml-suno.md が存在する → **必ずそちらを `lyrics` に使う**
   - lyrics-kana.md は**人間確認用**。Suno 投入用ではない
   - YAML 版にはメタデータ（tempo, key, form, vocals, production_notes）が含まれ、音楽生成品質に直結する
   - YAML が未生成の場合のみ lyrics-kana.md を使ってよい

2. **実行方式: 必ず 1 プロセスで直列実行**
   - `pbcopy` と `open` は**同一 python3 プロセス内**で順番に実行する
   - 別々のシェルコマンドに分けると、クリップボードが他プロセスに上書きされる（実際に発生した事故）

3. **投入後の検証: 3 点確認**
   - `pbpaste | wc -c` → JSON のバイト数が妥当か（空や別データでないか）
   - URL → `#suno=clip` が消えているか（消えていれば Tampermonkey が処理した証拠）
   - 画面 → Lyrics / Styles フィールドが埋まっているか

### 送信データ

| 生成結果 | JSON フィールド | ソース |
|---------|---------------|--------|
| Style | `styleAndFeel` | Step 3 出力 |
| Exclude | `excludeStyles` | Step 3 出力 |
| 歌詞 | `lyrics` | **yaml-suno.md**（優先）/ lyrics-kana.md（フォールバック） |
| 曲タイトル | `songName` | アーティスト設定 or ユーザー指定 |
| スライダー | `weirdness`, `styleInfluence`, `audioInfluence` | Step 3 出力 or デフォルト |

### 送信方法: クリップボードモード（標準）

日本語ひらがな歌詞は URL エンコードで膨張する（1文字→9文字）ため、クリップボードモードを標準にする。
**🚨 必ず以下のように 1 プロセスで実行すること。pbcopy と open を別コマンドに分けない。**

```bash
python3 -c "
import json, subprocess
data = json.dumps({
    'styleAndFeel': '''STYLE''',
    'songName': '''NAME''',
    'lyrics': '''LYRICS''',
    'excludeStyles': '''EXCLUDE''',
    'weirdness': 50,
    'styleInfluence': 70,
    'audioInfluence': 25
}, ensure_ascii=False)
subprocess.run(['pbcopy'], input=data.encode('utf-8'))
subprocess.run(['open', 'https://suno.com/create#suno=clip'])
"
```

**動作:** JSON をクリップボードにコピー → `#suno=clip` トリガーURL を開く → Tampermonkey がクリップボードから読み取る

**🚨 投入直後の検証（必須）:**
```bash
# 1. クリップボードに JSON が残っているか確認
pbpaste | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ JSON OK — songName: {d.get(\"songName\",\"?\")} / lyrics: {len(d.get(\"lyrics\",\"\"))} chars')" 2>/dev/null || echo '❌ クリップボードに有効な JSON がない'
```
- URL の `#suno=clip` が消えていれば Tampermonkey が処理済み
- 画面上で Lyrics / Styles が埋まっていれば成功

**フォールバック（短いデータ用）:** Style + Exclude のみ（歌詞なし）の場合は従来の直接ハッシュも使える:
```bash
url = 'https://suno.com/create#suno=' + urllib.parse.quote(data, safe='')
```

---

## Step 4: ポストプロダクション（任意）

曲が完成した後の処理。ユーザーが WAV ファイルや「Xにアップしたい」と言ったら対応する。

### 4-A. オートマスタリング（Suno V5/V5.5 特化）

Suno の WAV 出力には共通する音のクセがある。汎用マスタリングではなく、**Suno 出力の特性を前提とした修復的アプローチ**で処理する。
仕様は ChatGPT × Gemini のクロス議論（2026-04）で策定。

#### Suno 出力の既知の特性

| 特性 | 詳細 | 汎用マスタリングとの違い |
|------|------|----------------------|
| **シマー（金属的光沢）** | 3.8-5.2kHz に集中。Udio より高め | 汎用では想定しない帯域の問題 |
| **高域の刺さり** | 8-12kHz がキツい（v5.5 で顕著） | v5.5 固有 |
| **低域の泥** | 95-120Hz 付近が膨らむ | 汎用と共通だが Suno は典型的に発生 |
| **ダイナミクスが既に狭い** | LRA 3-5dB（既に圧縮済み） | 汎用ではコンプが主役だが、Suno では**コンプをスキップすることが多い** |
| **音量が小さい** | LUFS -22〜-18 前後 | 商業曲より 6-8dB 低い |
| **Suno sheen** | 特有のリバーブ/アンビエンス | EQ で軽減可能だが完全除去は難しい |
| **二重マスタリングリスク** | Suno 内部で既にマスタリング済み | 強い外部処理を重ねると濁る・歪む |

**基本方針: 削る→整える→持ち上げる。足す処理（エキサイター等）はデフォルトOFF。**
**Suno は押し込むほど AI っぽさが露呈する。やりすぎない。**

#### Pass 1: スキャン（分析）

まず曲をスキャンして数値を取る。**処理の前に必ず実行する。**

```bash
# ラウドネス分析（LUFS, LRA, True Peak）
ffmpeg -i "<input.wav>" -af loudnorm=print_format=json -f null - 2>&1

# 統計分析（RMS, Peak, Crest factor, Noise floor）
ffmpeg -i "<input.wav>" -af astats=metadata=1:reset=0 -f null - 2>&1

# 周波数帯域分析（シマー判定用）
ffmpeg -i "<input.wav>" -af aspectralstats=measure=mean:win_size=4096 -f null - 2>&1
```

#### Pass 2: 判断（CC が分析値を見て決定）

分析値を読んで、以下の条件テーブルに照らし合わせる。
**「削る」方向を優先。全部当てはめるのではなく、該当するものだけ処理に入れる。**

| 計測値 | 条件 | 処理 | 処理しない条件 |
|-------|------|------|--------------|
| Integrated LUFS | < -20 | 最終段で loudnorm | -16〜-14 なら軽く |
| LRA | < 5 dB | **コンプ不要**（Suno は大抵ここ） | > 8 dB なら軽くコンプ |
| 3.8-5.2kHz エネルギー | 他帯域より突出 | シマーカット **-1.0〜-2.0dB** (Q 1.2-2.0) | 突出なしならスキップ |
| 95-120Hz RMS | 膨らんでいる | 泥カット **-0.5〜-1.5dB** (Q 0.7-1.0) | 正常ならスキップ |
| 9-12kHz エネルギー | 高い（刺さり） | シェルフカット **-0.5〜-1.5dB** | 正常ならスキップ |
| True Peak | > -1.5 dBTP | リミッター必要 | -1.5以下なら不要 |

**ガードレール（やりすぎ防止）:**
- EQ は **1バンドあたり ±2.0dB 以内**（まれに 2.5dB まで）
- Compressor の合計 GR は **1〜2dB、最大3dB未満**
- エキサイター / 高域の足し込みは **デフォルトOFF**（Suno のシマーを悪化させるリスク大）
- Suno Remaster 済みの WAV には **処理を軽くする**（二重マスタリング回避）

**判断結果をユーザーに報告してから処理に進む:**
```
📊 スキャン結果:
- LUFS: -21.5 → ノーマライズ必要
- LRA: 3.8 dB → コンプ不要（Suno 典型: 既に圧縮済み）
- 4.2kHz: 突出あり → シマーカット -1.5dB
- 10kHz: やや高い → シェルフ -1.0dB
- 低域: 正常 → スキップ
→ この内容で処理します
```

#### Pass 3: 処理（Pedalboard — JUCE/DAW品質）

Spotify 製 Pedalboard ライブラリでマスタリングチェーンを組む。
初回のみ `pip install pedalboard` が必要。

判断結果に基づいて、以下のチェーンから**必要なエフェクトだけ**を組み合わせる。
順序は固定: **HPF → 減算EQ → コンプ（条件付き） → Gain → Limiter**

```python
from pedalboard import (
    Pedalboard, Compressor, Gain, Limiter,
    HighpassFilter, HighShelfFilter, PeakFilter
)
from pedalboard.io import AudioFile

# --- Pass 2 の判断結果に基づいてチェーンを構築 ---
effects = []

# 1. ハイパス 30Hz（常に適用）
effects.append(HighpassFilter(cutoff_frequency_hz=30))

# 2. 減算EQ（条件付き — Pass 2 で必要と判断したもののみ追加）

# シマー除去: 3.8-5.2kHz が突出している場合のみ
# effects.append(PeakFilter(cutoff_frequency_hz=4200, gain_db=-1.5, q=1.5))

# 泥カット: 95-120Hz が膨らんでいる場合のみ
# effects.append(PeakFilter(cutoff_frequency_hz=100, gain_db=-1.0, q=0.8))

# 高域刺さり: 9-12kHz が高い場合のみ
# effects.append(HighShelfFilter(cutoff_frequency_hz=10000, gain_db=-1.0))

# 3. コンプ（LRA > 8dB の場合のみ。Suno は大抵スキップ）
# effects.append(Compressor(
#     threshold_db=-20, ratio=1.8,
#     attack_ms=25, release_ms=120
# ))
# ※ GR が 1-2dB を超えないよう threshold を調整

# 4. Gain（ノーマライズ前の補正）
effects.append(Gain(gain_db=2))

# 5. Limiter（Pedalboard は True Peak limiter ではないため安全マージンを取る）
effects.append(Limiter(threshold_db=-1.5))

board = Pedalboard(effects)

# --- 処理実行（44.1kHz にリサンプル）---
# Suno は 192kHz 等で出力するが、AI 生成音源に高サンプルレートの意味はない。
# マスタリング時に 44.1kHz に統一する（配信サービスも 44.1kHz 前提）。
with AudioFile('<input.wav>').resampled_to(44100) as f:
    audio = f.read(f.frames)
    samplerate = 44100

processed = board(audio, samplerate)

with AudioFile('<output.wav>', 'w', samplerate, audio.shape[0]) as f:
    f.write(processed)
```

**チェーン構築のルール:**
- コメントアウトされた行は Pass 2 で必要と判断した場合のみ有効化する
- EQ の gain_db は ±2.0dB 以内に収める
- コンプは Suno 出力の大半で不要（LRA 3-5dB）。入れても ratio 2:1 以下、GR 1-2dB
- Limiter threshold は **-1.5dBFS**（Pedalboard は True Peak 保証なし → 安全マージン）
- **エキサイター、M/S処理、マルチバンドコンプはデフォルトOFF**

#### ラウドネスノーマライズ（Pedalboard 処理後）

Pedalboard にはラウドネスノーマライズがないため、最終段は ffmpeg で:

```bash
ffmpeg -i "<pedalboard_output.wav>" -af loudnorm=I=-14:TP=-1:LRA=11 "<mastered.wav>"
```

**ジャンル別の目安:**
| ジャンル | ターゲット LUFS |
|---------|---------------|
| アコースティック / ジャズ | -16〜-14 |
| ポップ / ロック | -14.5〜-13.5 |
| EDM / Hyperpop | -13〜-12（Suno は押し込みに弱いので注意） |

#### メタ情報の削除

マスタリングの最後に Suno メタデータを除去:

```bash
ffmpeg -i "<mastered.wav>" -map_metadata -1 -c copy "<clean.wav>"
```

#### Matchering（オプション: リファレンス曲がある場合）

ユーザーがリファレンス曲（「この曲みたいな音にして」）を指定した場合、Pedalboard チェーンの**代わり**に使う:

```python
import matchering as mg  # pip install matchering
mg.process(
    target='<input.wav>',
    reference='<reference.wav>',
    results=[mg.pcm16('<mastered.wav>')],
)
```

Matchering は RMS・周波数特性・ステレオ幅をリファレンスに自動マッチする。

#### 出力（複数フォーマット対応）

マスタリング後、以下のフォーマットで出力する。ユーザーに「どの形式で出す？」と聞く。指定がなければ WAV + MP3 の両方。

```python
from pedalboard.io import AudioFile

# WAV 24bit（高品質アーカイブ用）
with AudioFile('songs/<曲名>/<曲名>_mastered.wav', 'w', samplerate, processed.shape[0], bit_depth=24) as f:
    f.write(processed)

# MP3 160kbps（配布・ストリーミング用）
with AudioFile('songs/<曲名>/<曲名>_mastered.mp3', 'w', samplerate, processed.shape[0], quality='160k') as f:
    f.write(processed)
```

最後にメタ情報を処理:
```bash
# Suno メタデータ除去 + アーティスト情報埋め込み（WAV）
ffmpeg -i "<mastered.wav>" -map_metadata -1 \
  -metadata title="<曲タイトル>" -metadata artist="<アーティスト名>" \
  -metadata genre="<ジャンル>" -metadata date="<YYYY>" \
  -c copy "<clean.wav>"

# カバー画像を縮小（300px, 低画質）
ffmpeg -i "<cover.png>" -vf "scale=300:300:force_original_aspect_ratio=decrease" -q:v 8 "/tmp/cover_thumb.jpg"

# MP3: メタ情報 + カバー画像（アルバムアート）埋め込み
ffmpeg -i "<mastered.mp3>" -i "/tmp/cover_thumb.jpg" -map 0:a -map 1:0 \
  -map_metadata -1 \
  -metadata title="<曲タイトル>" -metadata artist="<アーティスト名>" \
  -metadata genre="<ジャンル>" -metadata date="<YYYY>" \
  -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" \
  -disposition:v attached_pic \
  -c:a copy -c:v mjpeg \
  "<clean.mp3>"
```

| 出力ファイル | 用途 |
|------------|------|
| `<曲名>_mastered.wav` | 高品質アーカイブ、DAW取り込み |
| `<曲名>_mastered.mp3` | 配布用（160kbps + カバー画像埋め込み） |
| `<曲名>_x.mp4` | X (Twitter) 投稿用動画 |

### 4-B. X (Twitter) アップロード用動画生成

X の動画制限: **5MB / 動画のみ（音声ファイル不可）**。
アーティストのカバー画像を使い、超低ビットレート動画を生成する。

**X の制約:** 5MB / 動画のみ / AAC LC のみ（Opus・HE-AAC 非サポート）

**基本方針: 5MBをギリギリまで使い切る。** 曲の長さから逆算して音声ビットレートを最大化する。

ユーザーに「音質重視？長さ重視？」と聞く:
- **音質重視**: 全5MBを使って最高音質。曲が長すぎれば末尾カット
- **長さ重視**: 全曲入れる。その範囲で音質を最大化

#### ビットレート逆算ロジック

```bash
DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "<audio.wav>")

python3 -c "
dur = float('$DURATION')
budget_kbit = 5 * 8 * 1024          # 40960 kbit
video_kbps = 5                       # 静止画は最小限

# 音質重視: 音声上限 128kbps、入らなければ曲をカット
quality_audio = 128
quality_max_sec = budget_kbit / (quality_audio + video_kbps)

# 長さ重視: 全曲入れる前提で音声ビットレートを逆算
length_audio = max(48, int(budget_kbit / dur) - video_kbps)  # 最低 48kbps
length_max_sec = dur

print(f'曲の長さ: {dur:.0f}秒 ({dur/60:.1f}分)')
print(f'音質重視: AAC {quality_audio}kbps / 最大 {quality_max_sec:.0f}秒 ({quality_max_sec/60:.1f}分)')
print(f'長さ重視: AAC {length_audio}kbps / 全曲 {length_max_sec:.0f}秒 ({length_max_sec/60:.1f}分)')
"
```

#### 対話での選択

```
CC: 「X用動画を作ります」
  曲の長さ: 4分32秒
  - 音質重視: AAC 128kbps（最大5分7秒 → 全曲入る）
  - 長さ重視: AAC 128kbps（全曲入る。同じ結果になります）
  → 音質重視で作りますね
```

```
CC: 「X用動画を作ります」
  曲の長さ: 7分15秒
  - 音質重視: AAC 128kbps（最大5分7秒 → 末尾2分カット）
  - 長さ重視: AAC 89kbps（全曲入る）
  どちらにしますか？
```

#### ffmpeg 実行

```bash
ffmpeg -loop 1 -i "<cover.png>" -i "<audio.wav>" \
  -c:v libx264 -tune stillimage -pix_fmt yuv420p \
  -vf "scale=480:480:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2" \
  -r 1 -b:v 5k -crf 51 \
  -c:a aac -b:a <逆算したビットレート>k \
  -t <使用する秒数> \
  -metadata title="<曲タイトル>" \
  -metadata artist="<アーティスト名>" \
  -metadata album="<アルバム名（あれば）>" \
  -metadata genre="<ジャンル>" \
  -metadata date="<YYYY>" \
  -metadata comment="Made with Suno <使用モデル: V5.5 / V6 等>" \
  -shortest -movflags +faststart \
  "<output.mp4>"
```

**メタ情報の取得元:**
- `title` → 歌詞ファイルの frontmatter `title`、またはユーザー指定
- `artist` → アーティストプロファイルの `name`
- `genre` → アーティストプロファイルの `genres[0]`、または Step 3 で使ったジャンル
- `date` → 作成年
- `album` → ユーザー指定があれば。なければ省略
- `comment` → 固定文 or ユーザー指定

#### 手順
1. カバー画像を特定（`artists/<name>-cover.png` またはユーザー指定）
2. 音声ファイルのパスと曲の長さを取得
3. ビットレートを逆算して選択肢を提示
4. ffmpeg 実行
5. **出力ファイルサイズを確認** → 5MB超なら音声を5kbps下げて再実行（VBRの揺れ対策）
6. 出力: `songs/<曲名>/<曲名>_x.mp4`

---

## Cover / Sample / Inspo 対応

- スライダー安全範囲: **15-85**
- Audio Influence: 25%開始、+5%刻み、75%超えない
- Voices使用時: Style から声・楽器記述を最小化

### V6 を使っている場合の修正手段

**気に入らない箇所があっても、まず全曲再生成に戻らない。** V6 は曲の一部だけを自然言語で
変更でき、それ以外は保持される。歌詞1語だけの差し替えも可能。

```text
Change only the second chorus.
Replace the stacked synth lead with a small gospel choir and handclaps.
Keep the lead-vocal melody, lyrics, tempo, key, bass line and all other sections unchanged.
```

守りたいものを明示的に列挙するほど事故が減る。詳細は `knowledge/suno_v6_reference.md`。

### V5.5 テクニック

- パフォーマンスディレクション（Verse:/Chorus: で歌い方記述）
- `[studio recording]` タグ（ライブ感抑制）
- ダウングレード整形（v5.5→v5.0）
- 全曲Sample再生成（Weird=0/Style=100/Audio=100）
- Studioモデル切替ドロップダウン
- Remaster Subtle でマイクロ修正
