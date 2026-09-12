# V5.5 → V6 移行判断

> V6 リリース: 2026-09-09 / 本判定の作成: 2026-09-10

V5.5 の各ルールを **keep / modify / demote / retire** で判定した表です。
V6 の確認済み事実は `suno_v6_reference.md`、V5.5 の詳細は `suno_v55_reference.md` が正本。

**大原則**: V6 はモデルを作り直しているため、V5.5 で効いた慣習が同率で効く保証はない。
一方で V5.5 の語彙を捨てる理由もない。順位を変えるだけにする。

> **semantic な指示が第一。タグは実験的な補助信号。**

| 判定 | 意味 |
|---|---|
| **keep** | そのまま使う。V6 でも前提が変わっていない |
| **modify** | 考え方は活きるが、書き方を V6 向けに変える |
| **demote** | 削除はしないが「未検証の候補」に格下げし、A/B 前提にする |
| **retire** | V6 では使わない |

---

## 1. Style 欄の書き方 — **modify**

| 項目 | V5.5 | V6 |
|---|---|---|
| 推奨形式 | 短いカンマ区切りの名詞句タグ | **属性同士の関係を述べた文**（タグ列も引き続き有効） |
| descriptor 数 | 4-7 が最適 | 個数ではなく**関係が書けているか**で判断 |
| 根拠 | V5.5 の実運用 | Suno 公式が「vocals, instrumentation, structure, mood, references, overall feel をより理解する」と明記 |

### V5.5 の書き方（まだ動く）
```
J-pop, 124 BPM, A major, uplifting, female vocal, clean guitar
```

### V6 の推奨
```
Bright modern J-pop around 124 BPM in a major-key feel. Restrained close vocal in the verse,
then a wide melodic chorus with stronger drums, bass and layered harmonies.
```

> **「長く書けば良い」ではない。** 公式が言っているのは「複雑な意図や詳細な指示をより理解する」であって、
> 最適な文字数は**公式に一切示されていない**。長さではなく、verse と chorus の対比のような
> **関係**が書けているかどうかが違いを生む。

---

## 2. モデル選択 — **modify**（V5.5 の「モデル分業」を置き換え）

| 項目 | V5.5 | V6 |
|---|---|---|
| 考え方 | 伴奏は v5、ボーカルは v5.5 と**品質**で使い分け | `v6` / `v6-wild` / `v6-mini` を**創作モード**で使い分け |
| 手順 | ステム書き出し + 外部結合が必要 | `v6-wild` で探索 → 良い案を `v6` で仕上げる |

V5.5 のモデル分業（`suno_v55_reference.md` の Model Split Workflow）は V5/V4.5 の話なので、
V6 を使うなら不要になる可能性が高い。ただし **V6 でのステム/Add Vocals の挙動は未検証**。

⚠️ `v6` と `v6-wild` は**有料限定**。無料ユーザーが使える V6 は `v6-mini` だけ。
本キットの既定モデルは **v6**（現行世代）。**v5.5 以前は 2026-09-09 に退役済み**で、新規生成の選択肢ではない
（公式 v6 FAQ: "All models prior to v6 have been retired"）。CLI の alias は過去の記録を解決するために残してある。
無料アカウントは `v6-mini` を明示すること。

---

## 3. 曲の修正方法 — **modify**（最も影響が大きい変更）

| 項目 | V5.5 | V6 |
|---|---|---|
| サビだけ直したい | Cover / 全曲再生成。他のセクションも変わる | **局所編集**: 変えたい所だけ自然言語で指示 |
| 歌詞1語だけ直したい | 全体を作り直す | **単語単位の差し替え**が可能 |

### V5.5 の書き方
Cover モードで全曲を作り直し、良いテイクが出るまで回す。

### V6 の推奨
```
Change only the second chorus.
Replace the stacked synth lead with a small gospel choir and handclaps.
Keep the lead-vocal melody, lyrics, tempo, key, bass line and all other sections unchanged.
```

> **preserve 条件を必ず書く。** 機能の本質が「指定した所以外を保つ」ことなので、
> 守ってほしいものを明示的に列挙するほど事故が減る（これは本キットの推奨であり、公式の要求仕様ではない）。

**運用上の変更**: 「気に入らない → 作り直す」を既定にしない。まず局所編集を試す。

---

## 4. 複数ソースの扱い — **modify**

| 項目 | V5.5 | V6 |
|---|---|---|
| 方法 | Cover / Persona / Audio conditioning を1つずつ、後工程で結合 | 1リクエストで複数ソースを **role 付き**で結合 |

### V6 の推奨
```
Use vocals from A, drums from B; rebuild the rest as sparse 80s synthwave.
Do not copy lyrics from any source.
```

ソースは「素材」ではなく「**役割**」で渡す。公式の例自体が
"Take the vocals from x, drums from y" という分担指示になっている。

---

## 5. 入力の種類 — **modify**

V5.5 は音声条件付けが中心。V6 は **text / audio / image / video** を公式に受け付ける。

各 modality に必ず役割を書く（画像＝空気感、ボイスメモ＝メロディ、日記＝歌詞テーマ、等）。
役割を書かないと参照が全体に滲む。

⚠️ ファイルサイズ・形式・最大数・重み指定は**公式に未記載**。

---

## 6. Vibe / 情景プロンプト — **modify**（新しい第一級の書き方）

| V5.5 | V6 |
|---|---|
| `dreamy, nostalgic, warm synth` のような形容詞列 | 情景そのものを起点にできる |

### V6 の推奨
```
Dreamy indie pop that feels like waiting alone on a nearly empty train platform at 2 a.m.;
warm analog synths, soft close vocal, restrained drums, bittersweet rather than sad.
```

公式が "Make a song that feels like midnight on a rooftop" を例示している。
形容詞の羅列では届かない質感に届く可能性がある。

---

## 7. セクションタグ / アノテーションタグ — **keep**

`[Verse 1 - intimate, acoustic, close vocal]` 形式は V6 でも引き続き使う。
セクション単位の演出を運ぶ自然な手段であり、V6 で無効になったという情報はない。

ただし **1セクションに詰め込む要素は重要な2-3個に絞る**。
細かい形容詞を全部厳密に実行する保証はない（これは V5.5 から変わらない）。

より強い制御が要る場合は、生成後に**局所編集**で直す方が確実（§3）。

---

## 8. コミュニティ発の inline タグ — **demote**

`[Energy: High]` / `[modulate up a key]` / インラインコード表記 `[Am7] [G] [Cmaj7]` /
ブラケット信頼度階層（`[]` > `()` > `{}`）。

すべて **`legacy_v55_candidate` に格下げ**。削除はしない。

| | V5.5 | V6 |
|---|---|---|
| 位置づけ | 未実証だが有望な community 技法 | **V6 未検証**。まず semantic 指示で書き、タグは A/B の対象 |

### 書き換え例

| V5.5 | V6 で最初に試す形 |
|---|---|
| 歌詞直前に `[Energy: High]` | `[Chorus - full drums, wider harmony, stronger vocal, highest energy]` |
| `[modulate up a key]` | `[Final Chorus - modulate upward by one whole step, preserve the melody shape]` |
| `[Am7] [G] [Cmaj7]` を別行に | `Maintain an Am7-G-Cmaj7 harmonic loop through the verse.` |

いずれも**失敗したら局所編集で直す**のが V6 らしい復旧手段。
タグ自体を捨てる必要はないので、A/B の片側として残す。

**V6 期の追加観測（2026-09-12 / `community_experimental`）**: 未知のタグは近い意味に解釈されるのではなく
**そのまま落とされる**らしい、という報告がある（`[2 Bar Rest]` は無視され、`[Silence]` は作用した）。
もし本当なら「効かなかった」は「書き方が下手」ではなく「そのタグを知らない」を意味することになり、
既知のタグだけで書き新語の発明は A/B に留める、という本節の方針をそのまま補強する。
出典と限界は `suno_v6_reference.md` の Community findings を見ること。

---

## 9. 文字数上限 — **keep（V5.5 の数値のみ）**

V6 の Style / Lyrics 上限は**公式に未記載**。

したがって本キットが明示する数値は引き続き V5.5 のもの（コアタグ 120 / Style 全体 400 /
YAML+歌詞 4500、Suno 上限 5000）。**V6 用の数値を推測で書かない。**

実測で判明した場合に備え、削る順序だけ決めておく（下から削る）:

```
must-have musical identity
  → vocal + groove
  → arrangement relationships
  → section trajectory
  → production / texture
  → vibe / metaphor
  → optional decorative adjectives
```

---

## 10. スライダー（Weirdness / Style Influence / Audio Influence） — **demote**

V5.5 の推奨値（安全域 15-85、Cover は Audio 25% 起点、Sample 全曲は 0/100/100 等）は
**V6 では未検証**。V6 におけるスライダーの意味そのものが公式に未記載。

- V6 で使う場合は V5.5 の値を**出発点**として扱い、結果で調整する
- **Weirdness を temperature と同一視しない。** Suno の creative control であって、
  公開されたサンプリング温度ではない

---

## 11. Duration / Voices / Custom Models / My Taste / Persona — **keep（V5.5 限定として）**

| 機能 | 状態 |
|---|---|
| Duration Slider | 2026-07-20 に **V5.5 / Web 限定**で提供。**V6 対応は未記載** |
| Voices / Custom Models / My Taste / Persona | V5.5 の機能。**V6 との互換は公式に未記載** |

**V5.5 の設定を V6 へ自動継承しない。** 尺の制御は引き続き構造（form / ending intent）で行うのが安全。

---

## 12. アーティスト名の指定 — **keep（禁止のまま）**

既知アーティスト・既知楽曲そのものを求めるプロンプトは V6 でも引き続きブロックされる。

Suno 公式のモデレーション説明（2026-09-12 に確認）がこれを裏づけている。著名アーティストや人物の名前、
著作権・商標のある語を含む曲は生成されないことがある、と明記されている。さらに重要なのは次の一点で、
公式はアーティスト名を含むプロンプトに対して**その名前を取り除き、音楽的特徴の記述へリクエストを
向け直す**と説明している。つまり下の分解は禁止をかいくぐる回避策ではなく、**Suno 自身が内部でやって
いる処理を先回りしているだけ**。自分で分解すれば、どの特徴を残すかを自分で決められる。

音響特徴へ分解する方針は変えない:

```
✗ in the style of [artist name]
✓ dry baritone vocal, angular clean guitar, minimal bass-led arrangement,
  mechanical straight drums, cold nocturnal atmosphere, restrained melodic range
```

---

## 移行チェックリスト

V6 で1曲作るときの最短手順:

1. `v6-wild` で複数の異なる brief を試す（§2）
2. 良い方向が見えたら `v6` で作り直す
3. 気になる箇所は**局所編集**で直す（§3）— 全曲再生成に戻らない
4. 参照素材があれば **role を明記**（§4, §5）
5. コミュニティタグを使うなら A/B の片側としてのみ（§8）
