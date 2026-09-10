# Output Templates for Suno Style Analyzer V5.5

This file contains the exact output templates. The GPT must follow these structures precisely.

---

## YAML Template (Pattern B: URL + Lyrics)

**🚨 Lyrics are sacred — NEVER cut, shorten, or modify user-provided lyrics.**
**Total limit: 4500 chars (from "# META" to "=== LYRICS END ==="). Suno max is 5000.**
**META target: 400-600 chars.** No per-section arrays — annotation tags carry that info.
**Budget: Count lyrics chars first → META fits in (4500 - lyrics chars).**
**ALL metadata MUST be in English. Only lyrics text may be Japanese (hiragana only).**
**All output characters must be within JIS X 0208 range.**

```yaml
# META (hints; do not sing)
version: v5.5
meta:
  tempo: <int>
  key: "<e.g., F# major>"
  signature: "4/4"
  form: "<concise section flow, e.g., intro-v1-chorus-v2-chorus-bridge-chorus-outro>"
  vibe: "<3-5 word ENGLISH vibe>"
language: "Japanese"
vocals:
  parts:
    - { id: F, tone: ["<2-3 adjectives>"] }
    - { id: M, tone: ["<2-3 adjectives>"] }
  rules:
    - "<1 line: phrasing style, harmony approach>"
production_notes:
  - "<1 line: key mix constraints, instrument limits>"
notes:
  - "lock tempo/key across all sections"
=== LYRICS START (do not sing tags) ===

[Verse 1 - intimate, acoustic, close vocal]
<lyrics from input, all kanji→hiragana, katakana and English kept as-is>

[Chorus - explosive, full band, powerful vocal]
<lyrics from input, hiragana only>

[Bridge - stripped, piano only, vulnerable]
<lyrics from input, hiragana only>

=== LYRICS END ===
```

**No per-section arrays.** The old `sections` array (vocals/cues/remix_hints per section) ate ~2000 chars. Annotation tags like `[Verse 1 - description]` already carry production hints in the lyrics. META stays global-only.

### Kanji → Hiragana Conversion Examples
- 愛してる → あいしてる
- 夜空 → よぞら
- 走り出せ → はしりだせ
- 街 → まち
- 3時 → さんじ
- 1人 → ひとり
- 瞬間 → しゅんかん
- 女性 → じょせい
- Keep katakana as-is: ロマンチック → ロマンチック
- Keep English as-is: love → love

### Section Matching Rule

The lyrics section tags MUST exactly match the input lyrics.
(There is no `sections` array in YAML — it was removed, see above. This rule applies to the
section headers inside the `=== LYRICS START/END ===` block only.)

- Same section names
- Same order
- No additions, deletions, or reordering
- If input has [Verse], [Chorus], [Verse], [Chorus], [Bridge], [Chorus] — output must have exactly those 6 sections in that order

### Character Limit Overflow — Reduction Priority
If YAML block exceeds 4500 characters, reduce META only (NEVER touch lyrics):
1. **Shorten production_notes / notes to minimal**
2. **Compress vocals.rules to shortest form**
3. **Shorten annotation tags in lyrics to 1-2 words**
🚨 **Lyrics text reduction is FORBIDDEN.** User-provided lyrics must appear in full, unmodified.

---

## Style Template

**V5.5 準拠: タグ形式、4-7 descriptors、120文字以内。**
**プローズ（散文）禁止。短いカンマ区切りの名詞句で書く。**
**100% English. Zero Japanese.**
**Front-load: genre → BPM → key → mood → vocal → instruments → mix の順。**
**Max genres: 2 genre pairs（3+ は不安定）。**
**詳細な production 指示は Style ではなく YAML META の production_notes と annotation tags に任せる。**

```text
# Style

<genre pair>, <BPM> BPM, <key>, <mood 1-2 words>, <vocal descriptor>, <2-3 key instruments>, <mix keyword>, studio recording

例: J-Pop meets Smooth Jazz, 108 BPM, F# major, warm nostalgic, sultry female vocal, Rhodes piano, finger bass, brushed drums, wide stereo, studio recording

例: nu-jazz rap, 150 BPM, G minor, sardonic aggressive, male rap, live jazz drums, fat slap bass, Rhodes, horn stabs, wide stereo, raw analog
```

### Performance Direction（Style 内に追加、任意）

V5.5 はセクション別の演出を Style 内のロールラベルで制御できる。
annotation tag への長文よりこちらが効果が高い。

**Format**: Style タグの後に改行して `<Section>: <2-3 descriptors>` を追加

```text
# Style + Performance Direction の例

nu-jazz rap, 150 BPM, G minor, sardonic, male rap, jazz drums, Rhodes, horn stabs, wide stereo, raw
Spoken Word: dry close-mic sparse Rhodes only no drums
Verse: full band erupts aggressive
Hook: explosive brass chant
Bridge: piano ghost drums only
```

**注意**:
- **Style の3つの数値を混同しない**（別々の層の話）:

| 層 | 値 | 意味 |
|---|---|---|
| コアタグ | **120文字以内** | 本キットの必須ルール。1行目のタグ列のみ |
| Style 欄 全体 | **400文字以内** | 本キットの目標値。コアタグ + Performance Direction |
| Suno UI の上限 | 1000文字 | Suno 側のハード上限。キットは意図的にここまで使わない |

- Performance Direction を含めるとコアタグの 120 文字は超えるが、Style 欄全体で 400 文字以内に収める
- ジャンル・音色は正しいが演奏の態度/デリバリーが違う → Performance Direction を追加
- 基本的な音作りが違う → Style タグ自体を変更

### Voice Description Priority

- Prefer physical voice descriptors before gender labels in vocal fields
- Use 2-4 traits max: register, breathiness, attack, delivery
- Example: `baritone, soft attack, controlled delivery, male vocal`

### Lyrics Control Panel Rule

- When Style stops responding, keep core tags short and push structure control into annotation tags
- Safe control items in lyrics headers:
  - `16 bars` / `32 bars`
  - `silence between phrases`
  - `minimal piano + sub bass`
  - `full band enters`
- Do not turn every section header into a paragraph. Short control tags beat long pseudo-specs
- Pattern B remains strict: lyrics text is sacred, so only annotation tags may carry this control

### Ending Guard

- Put ending intent in META or final annotation before generation drifts:
  - `form: ... final chorus -> short outro -> stop`
  - `notes: clear ending, no looping continuation`
- Final section headers may also carry short ending intent:
  - `[Outro - resolved, short, full stop]`
- If the ending still breaks, revise generation strategy first. Do not assume Extend will rescue it

### [studio recording] アンチライブテクニック

v5.5 は歓声・拍手・ライブ感を勝手に足す癖がある。以下で制御:
1. 歌詞の先頭に `[studio recording]` タグを追加
2. Style に `Remove fake crowd cheering and clapping. Small studio room not stadium.` を追加
3. Exclude に `crowd noise, live audience` を追加

### Style Character Limit — Adjustment
If core Style tags exceed 120 characters:
1. **Remove secondary adjectives** (keep primary genre + mood)
2. **Compress instruments** (keep 2-3 key instruments)
3. **Move detail to Performance Direction block** (separate from core tags)
If Performance Direction is needed, the kit target for the whole Style field is 400 characters.
(Suno's own UI cap is 1000 characters; the kit deliberately stays well under it.)

---

## Exclude Template

**Character limit: 200 characters, single line, comma-separated**
**2-5 items. English only. No "no X" phrasing.**

```text
# Exclude Styles

Trap, Dubstep, distorted guitars, EDM supersaws, female humming
```

### Low-End / Filler-Noise Exclude Example

- To anchor low-end, state it in Style:
  - `deep sub-bass constant, clearly felt beneath all elements`
- To remove junk texture, keep Exclude focused:
  - `metallic ticks, brittle hats, random glitch sounds`
- Do not exclude the whole rhythmic identity unless that element is truly the problem

---

## Remix Hints Recommended Values

| Section | Weirdness | Style Influence | Audio Influence (Cover/Sample) |
|---------|-----------|-----------------|-------------------------------|
| Chorus | 35-45% | 70-85% | 50-70% |
| Verse | 40-55% | 55-70% | 40-60% |
| Bridge | 55-70% | 45-60% | 35-55% |
| Intro/Outro | 30-40% | 60-75% | 25-45% |
| Inspo (all) | 0% | 50% | 85% |

---

## Annotation Tag Vocabulary (for lyrics section headers)

### Intro

**WARNING**: `[Intro]` タグは Suno がインストパッドを前に足す傾向がある。イントロを短くしたい場合は以下の代替を使う:

| 方法 | 記法 | 効果 |
|------|------|------|
| Spoken Word 専用タグ | `[Spoken Word]` | spoken delivery を強制、インスト引き伸ばし回避 |
| Verse 1 統合 | `[Verse 1 - starts spoken then erupts]` | イントロなしで即歌い出し |
| イントロ省略 | `[Verse 1]` から開始 | 完全にイントロを排除 |
| Hook 先頭 | `[Short Instrumental Intro]` の直後に `[Hook]` を置き、そこから歌い出す | 4-8 小節の短イントロを確保しつつ、最初の歌唱を強いフックで先出し |
| 即歌唱 prose | Style 側に `start immediately with guitar and vocal, no intro, no humming` | `no X` を Style に入れる例外ワークアラウンド。stutter / 冒頭ハミングを減らす報告あり（成功率は 50% 程度）。まず構造タグで試し、A/B 用に限定 |

`[Intro]` を使う場合は長いインストが入ることを許容する前提で。
推奨 descriptors: atmospheric, fade in, soft pads, ambient, building, sparse

**Hook 先頭 / 即歌唱 prose の使い所**:
- 広告尺 / TikTok 向け / サビ先行曲で特に有効
- 「ゆっくり入る」ことが曲の呼吸の一部になっている曲では使わない
- Source: Reddit / u/BuffaloConscious7919 ほか（mid April 2026）

### Verse
intimate, storytelling, close vocal, moderate energy, rhythmic, stripped, acoustic

### Pre-Chorus
building, rising energy, anticipation, layering, transitional

### Chorus
explosive, full band, powerful, anthemic, soaring vocal, wide stereo, peak energy, thick harmony

### Bridge
stripped, contrast, piano only, vulnerable, key change, minimal, emotional peak

### Outro
fade out, reverb tail, resolution, gentle ending, atmospheric, echoing
