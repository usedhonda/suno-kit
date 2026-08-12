# suno-kit

> **Language**: Japanese (日本語) — technical terms in English

Suno V5/V5.5 で曲を作るための制作キットです。中心は Claude Code の **`/suno` スキル**。knowledge はその判断品質を支える知識エンジンで、`suno-cli` は生成投入・回収を担う実行バックエンドです（回収層と `--live` gated create submit は出荷済み）。

```text
knowledge: 何を作るかを決める
    -> /suno skill: 歌詞・Style・Exclude・制作手順を生成する
    -> suno-cli: Suno へ投入し、URL/audio を回収する
```

## 特長

- **`/suno` スキルが顔** — アーティスト設定 → 歌詞 → Style → Suno自動入力 → マスタリング → X投稿用動画まで、対話で進めるメイン体験
- **knowledge は知識エンジン** — V5.5 仕様、コミュニティ技法、歌詞設計、ジャンル語彙、YAML テンプレートをスキルが参照する正本
- **`suno-cli` は実行層** — スキルが作った payload を Suno に投入し、2 take URL / audio を JSON で回収するバックエンド。回収コマンド（status / urls / download）と `--live` gated create submit は出荷済み
- **プロンプト設計** — Style / Lyrics / Exclude の書き方、V5.5 音声条件付け、Duration Control、inline tags を統合
- **SNS時代スタイル** — ドパガキ Recipe、Phonk / Amapiano / Jersey Club、Hyperpop / UK Garage / Drill、sped-up / Vocaloid を収録（community + Cdx review、未実証は A/B 推奨）
- **Suno特化オートマスタリング** — Suno の音のクセ（シマー、泥、既圧縮、音量不足）を前提にスキャン → 判定 → 補正
- **整合ゲート** — `scripts/check-consistency.sh` で README / knowledge / SKILL の決定論チェックを実行

## `/suno` Skill

`/suno` はこの repo のメインプロダクトです。ユーザーの入力を受け、knowledge を読んで、Suno に貼れる Style / Exclude / Lyrics / YAML と、必要な後処理を組み立てます。

```
/suno → アーティスト設定 → 歌詞生成 → Style/YAML生成 → Sunoに送る → マスタリング → X用動画
```

### できること

| ステップ | 内容 |
|---------|------|
| **アーティスト** | 対話で深掘り → Markdownプロファイル保存。全曲がアーティストに紐づく |
| **歌詞** | テーマから生成 or 持ち込み歌詞を保護。イテレーション（部分修正）対応。漢字版+ひらがな版の2ファイル出力 |
| **Style/YAML** | URL参照 or テキスト指示 → Style + Exclude + YAML。1000文字チェック付き |
| **Suno自動入力** | Tampermonkey連携。生成結果をクリップボード経由でSunoに一発入力 |
| **マスタリング** | WAVスキャン → Suno特有のクセを判定 → Pedalboard（DAW品質）で補正 → -14 LUFS ノーマライズ |
| **X用動画** | カバー画像+音声 → 5MB使い切り動画。ビットレート逆算+メタデータ埋め込み |

### Setup

1. `skills/suno/` フォルダを `~/.claude/skills/` にコピー
2. 完了。knowledgeファイルを内包しているのでフォルダ単体で動作します

## Knowledge Engine

`skills/suno/knowledge/` は `/suno` スキルの品質の源泉です。単なる付属マニュアルではなく、歌詞、構成、Style、YAML、V5.5 workflow を判断するための参照基盤です。

| ファイル | 役割 |
|---|---|
| `lyric_craft.md` | 伏線、韻、フック、歌唱可能性、コーチング |
| `song_structures.md` | 曲構成パターン、セクション機能、エネルギーカーブ |
| `style_catalog.md` | ジャンル別テンプレート、SNS時代レシピ、楽器/プロダクション語彙 |
| `rap_and_flow.md` | ラップ専用: フロー、韻スキーム、日本語ラップ |
| `english_lyrics.md` | 英語/バイリンガル: プロソディ、クロス韻 |
| `suno_v55_reference.md` | V5.5 リファレンス、Duration Control、inline tags、Cover/Sample/Inspo |
| `yaml_template.md` | YAML + Style + Exclude 出力テンプレート |

中核資料として [SunoV5_Prompt_MASTER_REFERENCE.md](SunoV5_Prompt_MASTER_REFERENCE.md) も収録しています。これは V5/V5.5 のプロンプト設計、Double-Layer 構造、コミュニティ発見テクニック、Deep Research 統合ログをまとめた参照文書です。

## Execution Layer

`suno-cli` は実行層です。役割は `/suno` スキルが作った payload を Suno に投入し、2 take の URL と audio を回収することです。実装は `suno-cli/`（TypeScript + Node 22）。

現状:
- **回収層（出荷済み・Phase1）** — `status` / `urls` / `download`。Clerk JWT HTTP で回収、JSON output + 安定 exit code の非対話 IF。詳細は [`suno-cli/README.md`](suno-cli/README.md)
- **create（dry-run + `--live` gated submit）** — `create --dry-run` で R6 body（Style / Lyrics / Exclude / model / vocal gender / **weirdness・style influence・audio influence** slider、persona、cover 等）を構築・検証できる。通常の `create --live` は null CAPTCHA fields で送信し、Suno が CAPTCHA を要求した場合は `blocked_captcha`（exit 31）で停止する。明示 token/provider は advanced fallback であり、自動 browser retry はしない

設計方針:
- `transaction_uuid` で冪等 retry（課金保護）
- URL-ready と audio-ready を別状態で扱う
- secrets / ledger は repo 外の user-data（`~/.local/share/suno-kit`）に隔離

### Suno自動入力（Tampermonkey）

`/suno` スキルで生成した Style・歌詞・Exclude・スライダー設定を、Suno の画面に自動入力します。Tampermonkey はブラウザにユーザースクリプトを追加する拡張機能です。

#### 1. Tampermonkey をインストール

| ブラウザ | リンク |
|---------|-------|
| Chrome | [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) |
| Safari | [Mac App Store](https://apps.apple.com/app/tampermonkey/id1482490089) |
| Edge | [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) |

#### 2. スクリプトを追加

1. ブラウザのツールバーに表示された **Tampermonkey アイコン**（四角いアイコン）をクリック
2. **「新規スクリプトを作成」** を選択
3. エディタが開くので、中身を **全選択（Ctrl+A / Cmd+A）→ 削除**
4. [`scripts/suno-autofill.user.js`](scripts/suno-autofill.user.js) の内容を **全文コピーして貼り付け**
5. **Ctrl+S / Cmd+S** で保存 → タブを閉じる

#### 3. 使い方

`/suno` スキルで Style や歌詞を生成した後:
1. 「Sunoに送る？」と聞かれたら「はい」
2. スキルが JSON をクリップボードにコピーし、ブラウザで `suno.com/create` を開く
3. Tampermonkey がクリップボードから読み取り、フォームに自動入力

#### 注意点

- **初回のみ**: ブラウザがクリップボードの読み取り許可を求める場合があります → 「許可」を選択
- **Suno にログイン済み**の状態で使ってください
- スクリプトが動かない場合: Tampermonkey アイコン → スクリプトが有効（ON）になっているか確認

### オートマスタリング — Suno の音のクセを知っているから、ちゃんと直せる

汎用マスタリングツールは「良い録音素材を磨く」前提で作られています。でも Suno の出力は違う — 既にマスタリング済みで、特有のクセを持った「加工済みレンダリング結果」です。汎用ツールで押し込んでも AI っぽさが露呈するだけ。

このスキルは **Suno V5/V5.5 の出力特性を前提とした修復的アプローチ** を取ります。仕様は ChatGPT × Gemini のクロス議論で策定しました。

**処理エンジン:** [Spotify Pedalboard](https://github.com/spotify/pedalboard)（JUCE ベース — DAW プラグインと同等品質）

**処理フロー:**
1. **スキャン** — ffmpeg で LUFS・ダイナミクス・周波数バランスを計測
2. **判断** — Suno 特有の問題がどの程度あるか数値で判定、ユーザーに報告
3. **処理** — Pedalboard で条件付きチェーン（不要な処理は入れない）
4. **ノーマライズ** — ジャンル別ターゲット LUFS

| Suno 固有の問題 | なぜ起きるか | このスキルの対処 |
|---------------|------------|----------------|
| 3.8-5.2kHz のシマー | Suno のレンダリングエンジン由来の金属的光沢 | スキャンで突出検出 → -1〜-2dB カット |
| 8-12kHz の刺さり | v5.5 で顕著。ボーカル/シンバルがキツい | シェルフ -0.5〜-1.5dB |
| 95-120Hz の泥 | 低域が膨らむ典型パターン | 条件付きカット |
| ダイナミクスが既に狭い | Suno 内部で圧縮済み（LRA 3-5dB） | **コンプをスキップ**（汎用と逆） |
| 音量が商業曲より小さい | LUFS -22〜-18 で出力される | Gain + Limiter + loudnorm |
| 二重マスタリングリスク | Suno Remaster 済みに外部処理を重ねると濁る | 処理量を自動制限 |

**基本方針: 削る → 整える → 持ち上げる。エキサイター等「足す」処理はデフォルト OFF。**

**リファレンスマッチ:** 「この曲みたいな音にして」と言えば [Matchering](https://github.com/sergree/matchering) で自動マッチ

### X (Twitter) 用動画生成

5MB 制限ギリギリまで使い切る動的ビットレート計算。曲の長さから音声ビットレートを逆算し、音質重視/長さ重視を選択できます。アーティストのカバー画像を静止画動画にし、メタデータ（タイトル、アーティスト名、ジャンル）も埋め込みます。

## Other Interfaces

### 用途別フロー (`agent/`)

| 用途 | ファイル |
|------|----------|
| 新曲生成 | [suno_flow_generate.md](agent/suno_flow_generate.md) |
| スタイル抽出 | [suno_flow_style_extract.md](agent/suno_flow_style_extract.md) |
| リライト | [suno_flow_rewrite.md](agent/suno_flow_rewrite.md) |
| 翻訳 | [suno_flow_translate.md](agent/suno_flow_translate.md) |
| リミックス | [suno_flow_remix.md](agent/suno_flow_remix.md) |
| アルバム制作 | [suno_flow_album.md](agent/suno_flow_album.md) |

### ChatGPT CustomGPT

| GPT | 用途 | セットアップ |
|-----|------|-------------|
| **Suno Style Analyzer V5.5** | YouTube URL からスタイル解析 → Style/Exclude/YAML 生成 | [mygpts/style-analyzer/README.md](mygpts/style-analyzer/README.md) |
| **Suno Lyrics Writer V5.5** | テーマから歌詞生成（ラップ・英語・バイリンガル対応） | [mygpts/lyrics-writer/README.md](mygpts/lyrics-writer/README.md) |

## V5.5 で押さえるべきポイント

- **Style は短いタグ列** — カンマ区切りの名詞句。散文より安定
- **Cover が逸脱したら Sample 全曲再生成** — Weird=0/Style=100/Audio=100 が定番レシピ
- **Audio Influence は 25% 起点 +5% 刻み** — 75% 超は劣化リスク
- **スライダー赤域を避ける** — 安全範囲は 15-85
- **Voices 使用時は Style を削る** — 声質・楽器記述が衝突する
- **ライブ感が混入したら** — `[studio recording]` タグ + Style を自然文で「場+禁止+保持」
- **モデル分業** — 伴奏=v5、ボーカル=v5.5（Audio 85-90%）で品質の良いとこ取り
- **Remaster は Subtle で微修正** — 複数回回して良いテイクを選ぶ
- **Song Duration Control** — length / structure / ending intent を早めに指定し、Extend 依存を避ける
- **Community-reported inline tags** — `[Energy: High]` や `[modulate up a key]` などは未実証のため小さく A/B テスト
- **歌詞は 6-12 音節/行** — Suno の歌唱安定性のスイートスポット

## 整合ゲート

公開前の最低チェックとして、次を実行します。

```bash
bash scripts/check-consistency.sh
```

`GATE: GREEN` が出ることが目安です。README が knowledge 7ファイル（`lyric_craft.md`, `song_structures.md`, `style_catalog.md`, `rap_and_flow.md`, `english_lyrics.md`, `suno_v55_reference.md`, `yaml_template.md`）を参照し続けているか、dangling な knowledge 参照がないかなどを決定論で確認します。

## ファイルツリー

```
suno-kit/
├── README.md
├── LICENSE
├── SunoV5_Prompt_MASTER_REFERENCE.md   # 中核マニュアル（15テクニック+81引用）
├── agent/                              # 用途別フロー
├── mygpts/                             # ChatGPT CustomGPT
│   ├── style-analyzer/
│   └── lyrics-writer/
├── scripts/
│   ├── check-consistency.sh            # README / knowledge / SKILL 整合ゲート
│   └── suno-autofill.user.js           # Tampermonkey（Suno自動入力）
└── skills/
    └── suno/                           # /suno スキル（自己完結型・正本）
        ├── SKILL.md
        └── knowledge/                  # 共通ナレッジ（正本）
            ├── lyric_craft.md          # 伏線、韻、フック、コーチング
            ├── song_structures.md      # 構成パターン、エネルギーカーブ
            ├── style_catalog.md        # ジャンル別テンプレ、SNS時代レシピ、楽器/プロダクション語彙
            ├── rap_and_flow.md         # ラップ専用: フロー、韻スキーム、日本語ラップ
            ├── english_lyrics.md       # 英語/バイリンガル: プロソディ、クロス韻
            ├── suno_v55_reference.md   # V5.5 リファレンス、Duration/inline tags
            └── yaml_template.md        # YAML出力テンプレート
```

## knowledge 更新時

knowledge ファイルは `skills/suno/knowledge/` を直接編集する。スキルが自己完結しているため別途同期は不要。

## 情報の立場

| 種類 | 扱い |
|------|------|
| **公式情報** | Suno ブログ・ヘルプ・FAQ に基づく |
| **コミュニティ情報** | Reddit 等で複数報告があるものを優先収録。再現性・副作用は文脈依存 |

ここに書いてある内容は「絶対解」ではありません。ただし「どこを触ると変わるか」「何を避けると壊れにくいか」は実務向けに整理してあります。

## 注意事項

- Suno の仕様は更新されるため、特に V5.5 周辺のパラメータは今後も変わり得ます
- コミュニティ技法は「効く場面」と「壊す場面」があります。小さく試してください
- 著作権保護のため、アーティスト名や曲名の直接指定ではなく音響特徴の言語化を推奨します

## License

[CC BY-NC 4.0](LICENSE) - Created by **usedhonda**
