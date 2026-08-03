# Suno AI V5/V5.5 Reference Guide

## V5.5 New Features (2026-03-26)

### Voices
- Upload your own voice (15s-4min audio, Pro/Premier only)
- Verification required (read displayed text aloud)
- When using Voices: start Audio Influence at 25%, increase +5% per attempt (never exceed 75%)
- Clean acapella recordings work best
- Suno performs stem separation on uploaded audio
- ⚠️ When using Voices for Cover: minimize Style Prompt (remove voice/instrument descriptions to avoid collision)
- Start all sliders at 25/25/25 when Voices is active

### Custom Models
- Train V5.5 on your own songs (min 6 songs, max 3 models)
- Must own rights to all uploaded songs
- Models are private, non-shareable
- Creation takes 2-5 minutes

### My Taste
- Preference learning from your Suno usage patterns
- Magic Wand in Create screen auto-generates personalized Style
- When My Taste is ON: keep Style shorter (3-5 tags) to leave room for auto-completion
- Can be viewed, edited, disabled

### Personas → Voices
- Voices replaces Personas in the Create menu
- Style Personas still available within Voices menu

---

## The Four Pillars of Effective Style Prompts

Every Style Block should address these 4 areas:

| Pillar | What to specify | Example tags |
|--------|----------------|--------------|
| 1. Genre & Style | Specific subgenre, era, fusion | "90s alt-rock", "gospel trap", "dark synthwave" |
| 2. Mood & Emotion | Atmosphere, tone, energy | "melancholic", "anthemic", "high tension" |
| 3. Instruments & Production | Key instruments, sonic qualities | "pulsing 808 bass", "analog pad", "tape saturation" |
| 4. Vocal Settings | Voice type, delivery, effects | "sultry female vocal", "whispery", "robotic male vocal" |

### V5.5 Style Format Rules
- **Tag format**: Short comma-separated noun phrases (NOT prose sentences)
- **Front-load**: genre → BPM → key → mood → vocal → instruments → mix
- **Optimal**: 4-7 descriptors total
- **Limit**: Under 120 characters
- **Max genres**: 2 genre pairs (3+ becomes unstable)

---

## Metatags for Lyrics (Section Tags)

### Standard Section Tags
```
[Intro]       [Verse]        [Verse 1]      [Verse 2]
[Pre-Chorus]  [Chorus]       [Post-Chorus]   [Bridge]
[Solo]        [Breakdown]    [Build]         [Drop]
[Interlude]   [Outro]        [Hook]          [Refrain]
```

### V5.5 Annotation Tags
Add production hints inside the tag bracket:
```
[Verse 1 - intimate, acoustic, close vocal]
[Chorus - explosive, full band, powerful]
[Bridge - stripped, piano only, vulnerable]
[Outro - fade out, reverb tail, atmospheric]
```

Annotation text is NOT sung — it's a production instruction to Suno.

### Special Tags
```
[Instrumental]     — no vocals in this section
[Acapella]         — vocals only, no instruments
[Spoken Word]      — spoken delivery, not singing
[Whispered]        — whispered vocal
[ALL CAPS CUE]     — gets stronger attention from model
```

### Vocal Tags (inside lyrics)
```
[Male Vocal]       [Female Vocal]
[Deep Baritone]    [High Soprano]
[Rap]              [Harmony]
[Falsetto]         [Growl]
```

### Community-reported inline tags (unofficial — verify per song)

Community-sourced, not confirmed official; effect is context-dependent — A/B test one at a time.
- `[Energy: High]` (family: `[Energy: Low/Build/Explosive]`): placed in the lyrics right before a section,
  reported to act as a LOCAL dynamic-peak signal — it raises arrangement intensity for that section only,
  distinct from a song-wide Style energy descriptor. Confidence: medium. Source: jackrighteous.com
  (corroborated by a second tag-list source), 2026-06.
- `[modulate up a key]` in the chorus: reported to force an upward key modulation at that section.
  Confidence: medium (single source). Source: openmusicprompt.com, 2026-06.
- Bracket-type reliability hierarchy: `[square brackets]` are the most reliably honored tag container
  (hard directives — structure, vocal delivery, instrumentation), `(parentheses)` are a softer secondary
  tier read as ad-libs / background / production cues rather than hard directives, and `{curly braces}`
  are the least reliable. Practical effect: place anything that must be obeyed in square brackets and
  reserve parentheses for non-critical color. Confidence: medium (two independent domains; one quantifies
  it as ~90/70/50% compliance — treat the figures as illustrative). Source: acetaggen.com (2026-04),
  hookgenius.app (2026-05).
- Inline chord-name brackets in the lyric box: writing chord symbols as their own bracketed tokens
  (e.g. `[Am7] [G] [Cmaj7]` or `[Bm] [A] [G]`) on a separate line above/between the sung lines is
  reported to raise the likelihood that the generated harmony follows that chord progression. Keep the
  chord tokens on their own line, separated from lyric text, so they are not vocalized. Confidence:
  medium (two independent domains; one reports partial hands-on verification). Source: zenn.dev,
  note.com, 2026-08.

---

## Creative Sliders

### Weirdness (Safe ↔ Chaos)
- 0-30%: Safe, conventional, predictable
- 35-50%: Standard, balanced (default)
- 55-70%: Explorative, experimental touches
- 75-100%: Chaotic, unexpected, may break structure

### Style Influence (Loose ↔ Strong)
- 0-30%: Loose, creative freedom
- 35-50%: Balanced
- 55-70%: Moderate adherence to Style tags
- 75-100%: Strong, strict tag compliance

### Audio Influence (for Voices/audio upload)
- 0%: No audio reference
- 15-25%: Starting point for Cover/Sample tuning
- 25-50%: Moderate reference (increment +5% to find "latch on")
- 60-75%: Featured, voice-forward (Cover sweet spot)
- >75%: ⚠️ WARNING — artifacts, pronunciation breakdown, diminishing returns
- Exception recipes below may intentionally use 85-100% (whole-song Sample preservation / v5.5 vocal upgrade). Treat those as A/B exceptions, not the default safety range.

### Section-Specific Recommendations

| Section | Weirdness | Style Influence | Rationale |
|---------|-----------|-----------------|-----------|
| Chorus | 35-45% | 70-85% | Consistency, recognizable hook |
| Verse | 40-55% | 55-70% | Balanced, room for variation |
| Bridge | 55-70% | 45-60% | Exploration, contrast |
| Intro/Outro | 30-40% | 60-75% | Clean entry/exit |

### Slider Safety: Red Zone Warning
- UI turns red near 0 and 100 — these extremes cause breakage
- Safe operating range for all sliders: **15-85**
- Red zone (0-14, 86-100) → unpredictable output, structure collapse
- Default values are often the safest starting point

### V5.5 Combo Finding
- Weirdness HIGH + Style Influence HIGH = better lyric tag compliance
- Section tags, vocal assignments are more strictly followed
- Useful when precise structure control is needed

---

## Cover / Sample / Inspo Mode Selection (V5.5)

### Mode Decision

| Situation | Recommended Mode | Settings |
|-----------|-----------------|----------|
| Faithful recreation of original | Cover | Audio 25% start, +5% increments |
| Cover deviates/truncates | **Sample (full-song range)** | **Weird=0, Style=100, Audio=100** |
| Lock melody/bridge | Inspo (3+ takes) | Weirdness 0, Style 50, Influence 85 |
| Using Voices | Cover + minimize Style | All sliders start at 25 |
| Metallic voice/sibilance | Remaster (Subtle) | Apply incrementally, multiple takes |
| Vocals only upgrade | v5 instrumental → v5.5 Add Vocals | Audio 85-90% |
| FX generation (riser/swoosh) | Studio: switch to v5 | Use Studio model dropdown |

### Decision Flow
1. Start with Cover → if deviation → switch to Sample (full range)
2. If melody still off → Inspo with 3+ takes
3. If Voices active → strip voice/instrument descriptions from Style
4. If metallic voice → Remaster at Subtle strength

### Remaster Workflow
- Subtle strength first (not Standard)
- If still harsh: try staged Remaster (v4.5 → v5 → v5.5)
- Results are source-dependent — not guaranteed
- If Cover changes too much: treat Remaster as a lighter full-song replace/regenerate path
- Franken-track workflow: stitch best sections externally, then Remaster to unify tone
- **Strength guide**: Subtle = safest micro-fix, Normal = small change, High = near-complete regen
- **Micro-fix pattern**: run Subtle multiple times, pick best take. Style: "Only fix: [specific issue]"

### Performance Direction in Style
- V5.5 responds better to performance-direction prose than pure tag soup in some cases
- Use role labels inside Style:
  - `Verse: restrained, talk-sung, conversational`
  - `Chorus: louder, rougher, borderline shouted`
  - `Band: heavy, slightly behind the beat`
- Best use case: when genre is correct but delivery/attitude is wrong
- Caution: over-hyped directives can produce exaggerated ad-libs later in the song

### [studio recording] Tag for Anti-Live Control
- Problem: v5.5 Cover may inject fake crowd / clapping / "live" ambience
- Fix:
  - Write Style as full-sentence environment control, not only comma tags
  - Put `[studio recording]` at the top of Lyrics
- Example Style:
  - `Remove fake crowd cheering and clapping.`
  - `This should feel like a small studio room, not a stadium.`
  - `Keep the lead vocal controlled, not shouted.`
- Use when negative prompting alone fails

### v5.5 → v5.0 Downgrade Cleanup
- Workaround for hiss / white noise / top-end shimmer in v5.5 outputs
- Two paths:
  - v5.5 song → v5.0 Subtle Remaster
  - v5.5 song → v5.0 Cover
- This is a cleanup pass, not a permanent fix

### Model Split Workflow
- If vocals are better in v5.5 but accompaniment is steadier in v4.5+/v5:
  1. Build instrumental in v4.5+ or v5
  2. Generate vocals in v5.5 using Add Vocals / Cover (Audio: 85-90% recommended)
  3. Export stems and replace/combine externally
- Best use case: keep v5.5 vocal expression without inheriting unstable v5.5 backing
- Audio=85-100% is an exception recipe for preservation; it increases glitch risk and should be backed down if artifacts appear
- ⚠️ Add Vocals path may not support Voices/Persona — use Cover if Persona is needed
- Caution: stem reverb / phase / ambience may not align cleanly

### Whole-song Sampling (Cover Alternative)
- When Cover breaks mid-song or deviates too far, use **Sample mode** with full-song selection
- **Recipe**: Weirdness=0% / Style=100% / Audio=100% (maximum preservation)
- Alternative: Weirdness low / Style mid-high / Audio max
- Style example: `Keep exact melody and chords. Only improve: tighter drums, cleaner bass, reduce hiss.`
- More stable than Cover for maintaining song structure while improving quality
- Note: endings and break positions may shift slightly

### Studio Model Switch
- Studio has a small dropdown in the Style field to switch between v5.5 / v5 / v4.5
- Use case: v5.5 struggles with certain FX (riser, swoosh) — switch to v5 for those
- Style/Lyrics character limits may fluctuate (1000/5000 vs 200/1250) depending on UI state
- Not all users may see the same UI (gradual rollout possible)

---

## Recent V5.5 Operational Findings (2026-03 to 2026-04)

### Slider Two-Phase Workflow
- Treat sliders as a **two-pass system**:
  - **Exploration**: Style 50-60, Weirdness 10-20
  - **Convergence**: Style 20-40, Weirdness 5-15
- Do not rush to Style 100 in the first pass. It often over-locks the output and increases genre drift or unstable vocals.
- Use this when the broad genre is right but the song still needs several takes to "latch on."

### Voice Description over Gender Labels
- `male vocal` / `female vocal` alone is weaker than **physical voice description**.
- Prefer descriptors such as:
  - `deep low chest register, baritone, slow controlled delivery`
  - `breathy airy alto, soft attack, intimate tone`
- When Voices or Cover are active, treat gender as a secondary hint. Lead with register, airflow, attack, and delivery.

### Low-End Anchoring and Filler-Noise Exclusions
- If you want weight, write low-end intent explicitly:
  - `deep sub-bass constant, clearly felt beneath all elements`
- If the arrangement fills with junk texture, move cleanup into Exclude:
  - `metallic ticks, random glitch sounds, harsh shakers, brittle hats`
- Do not over-exclude instruments that define the genre. Remove filler first, not the groove core.

### Ending Control Workflow
- Ending problems are easier to prevent than to repair.
- Put ending intent in the **first generation**, not only after failure:
  - `clear ending with full stop`
  - `no looping or continuation`
- In Lyrics, give the final line a resolved landing and keep Outro short.
- If the ending still breaks, prefer **Remix before Extend**. Extend tends to drag unresolved loops forward.

### Lyrics-as-Control-Panel
- If Style grows too strong and stops listening, shorten Style and move control into Lyrics tags.
- Use annotation tags to encode:
  - section energy
  - sparse/full instrumentation
  - silence between phrases
  - section length hints such as `16 bars`, `32 bars`
- Best use case: when broad genre is already correct, but section pacing, density, and dramatic spacing are wrong.
- Working range reported by the community:
  - Weirdness around 65
  - Style Influence around 35
- Keep this lighter than a full specification dump. Overlong tag text still breaks.

### Song Duration Control (length levers)

Suno has **no seconds field** — duration is an emergent property of structure, not a setting. Cross-project corpus testing (artist-runtime / used::honda, 2026-06) quantified what actually moves it.

- **Lyric body length ≠ duration.** Body char count (excluding YAML META) correlates with final duration at only **r≈0.11** — effectively uncorrelated. "More lyrics = longer song" is false. Worse: very long bodies (5000-7000 chars) get **compressed/truncated** down to 40-76 seconds; a ~1300-char body reliably yields 2-2.5 minutes.
- **What actually drives length:** section count + bar hints (`[Verse - 16 bars]`) + **physical chorus re-show** (write the chorus out ~3×, don't rely on the model to repeat) + pacing + BPM. See `song_structures.md` patterns A-H: 6-section patterns land "under 2 min", 9-section (3-verse) patterns run long.
- **Pacing cues that SHORTEN (silent side effect):** `tight flow`, `short refrain`, `sparse`, `silence between phrases` read as compression and crush duration. They are listed above as **energy** controls — be aware they double as **length-reducers**. Don't stack them when you want a longer track.
- **Style bloat cancels the structure.** An over-long Style competes with and overrides the lyric-box structural tags that create duration. This is `Bracket Theory` (structure tags ~10× stronger than Style; the model *reads* the lyric box) colliding with `Lyrics-as-Control-Panel` (a too-strong Style "stops listening"). Field-confirmed: a downstream consumer's `buildStyle` padded Style to 800-1000 chars with generic filler (a `while(len<800)` loop), which silently suppressed its own bar-hint / chorus-reshow duration plan. **Keep Style short (core ≤120, total ≤400 target) so the structural tags can do their job.**
- **Syllable contrast is also a length lever.** Varying syllable count between sections (Verse 8-10 → Chorus 5-7) sharpens Suno's section-boundary recognition (see `song_structures.md` energy-curve principle, `lyric_craft.md` §5), so all sections actually render instead of being merged/skipped — protecting length, not just singability.
- **Extend is a weak length lever.** Build length in the first generation via structure. Extend drags tempo and pulls unresolved loops forward (see `Ending Control Workflow` above).

Confidence: medium-high (r≈0.11 and the truncation thresholds are corpus-quantified; the Style-bloat mechanism is synthesized from `Bracket Theory` + `Lyrics-as-Control-Panel` and field-confirmed). Source: artist-runtime corpus (used::honda) + community Bracket Theory.

### Studio Stem Duet Workflow
- For "real" duets, do not force the first generation to sing both roles at once.
- More reliable workflow:
  1. Generate the song as a solo performance
  2. Open in Studio
  3. Export or split stems
  4. Duplicate the vocal stem
  5. Run Cover on the duplicated vocal only with the new voice direction
  6. Re-import only the new vocal stem
  7. Manually mute, cut, and fade lines into duet form
- This costs more credits and manual editing time, but it is more controllable than one-shot duet prompting.

### My Taste Advanced Tuning
- My Taste responds to **behavior shaping**, not only passive usage.
- Strong community pattern:
  - Spend about 2 weeks generating almost only the target genre
  - Like / save strong outputs
  - Ignore weak takes instead of "teaching" noise
- If the report UI is editable, users also report success from hand-tuning the preference text and then using Magic Wand on top of a short base prompt.
- If the model keeps flipping gender or role, a hard suffix such as `male vocal only` can calm it down, but use it sparingly.

### Voices Recording Checklist
- Voices quality starts with the input recording, not the generation prompt.
- Best-practice checklist:
  - dead room or closet-like space
  - mouth 30-50 cm from mic, slightly off-axis
  - air conditioner / fan / ventilation off
  - natural voice, not exaggerated "character voice"
  - 3-4 minute acapella take when possible
- This extends the existing "clean acapella works best" rule into a repeatable capture standard.

### Persona Resume for Voices / Custom Models
- A short fictional "resume" can stabilize worldbuilding for repeat generations:
  - age / background
  - roots
  - frustration or wound
  - imagined recording environment
- Keep it short and use it as a pre-generation framing device, not as bloated Style prose.
- This is best treated as a continuity scaffold for artist identity, not a magic keyword trick.

### Climax Design: Silence -> Half-Step Transposition
- Community experiments around v5.5 report that **longer conversational Style prose** plus structural metatags can work well for high-drama section design.
- Treat this as a **Pattern A technique**. For Pattern B, keep user lyrics unchanged and do not force this structure by rewriting the text.
- Climax recipe:
  1. Build the song to about 80% of its final intensity
  2. Drop for a moment with a structural tag such as `[Silence]`
  3. Re-enter with a **half-step transposition** (for example `D -> Eb`)
  4. Increase density and emotional pressure on the entry
- Basic `[Silence]` usage belongs to `Community-Discovered Techniques -> Negative Space Technique`. This section is about **climax architecture**, not silence as a general timing tool.
- Reported YAML-style split for planning:
  - `style:` = conversational long-form style direction
  - `lyrics:` = structural metatags and section flow
  - `exclude_styles:` = negative constraints
- If you apply this planning model, keep it aligned with `knowledge/yaml_template.md` so role separation stays consistent.
- Confidence: medium. The experiment archive is systematic, but outside replication is still unconfirmed.
- Risk: overlong Style prose can break adherence, and the frisson effect is not guaranteed on every genre or take.
- Source note: `danlex/suno-lab` (GitHub experimental archive, latest commit displayed as 2026-04-08).

### External CLI Automation (Non-Official)
- Community tools such as SunoCli can speed up batch generation, JSON piping, and section replacement.
- Treat them as **non-official automation**:
  - external API dependency
  - auth / token handling
  - logging and privacy risk
  - terms-of-service review required
- Use only after security and policy review. Do not assume parity with official Suno product behavior.

### Emotional / Action Words over Technical Terms (Style Block)
- In V5.5, leading the Style Block with **emotional or motion language** often produces stronger arcs than stacking acoustic-template vocabulary alone.
- Reported to land reliably:
  - `desperate`, `late-night confession`, `cracked voice` (情動語)
  - `building intensity`, `anthemic chorus`, `low headroom` (展開と質感ガード)
- Suggested ordering: `[情動語], [場面/時刻], [強度の動き], [声の物理描写], [サビ性質], [質感ガード]`.
  - Example: `desperate, late-night confession, building intensity, cracked voice, anthemic chorus, low headroom, matte unpolished finish`
- Do not drop acoustic vocabulary entirely. Lead with emotion + motion, keep acoustic control (register, attack, mix) in the **second half** of the Style prose.
- Risk: over-loading emotion words blurs genre edges, and `anthemic chorus` pushed too far makes every take sound oversized.
- Confidence: medium. Reddit / u/Budget_Coach9124 and related threads (late March 2026).

### Instrument and Amp Anchoring
- For guitar / organ / horn-driven songs, **instrument model + amp + playing verb** shifts tone more than genre labels alone.
- Usable patterns (1-2 concrete models per prompt, not a gear catalog):
  - `Epiphone Les Paul Standard, G major blues chord progression`
  - `Fender American Tele through Vox AC30, choppy rhythm chops`
  - `Gretsch G5422TG, clean tremolo, held chords`
  - `Hammond B3 with rotary speaker, slow swell into chorus`
- Best fit: blues, garage, southern rock, alt-country, soul-organ, classic jazz.
- Weaker on synth-dominant tracks, abstract electronic, or percussion-first genres. Brand names become noise if stacked.
- Keep **one** hero instrument + the playing verb. Do not list three brands in one prompt.
- Confidence: medium-low. Reddit / u/AdSeveral2196, u/Middle-Style-9691 (late March 2026).

### Tag Extraction via Self-Upload
- Workflow to reverse-engineer a hit you already made:
  1. Download the winning track from Suno
  2. Re-upload it (**own material or cleared rights only**)
  3. V5.5 writes auto-generated style tags into the Lyrics field as part of its analysis
  4. Clean the transcript (drop obvious artifacts, keep the signal tags)
  5. Run **Cover** on the original track with the cleaned tag set
- Use case: capture what made one specific take land, in **Suno's own vocabulary**, so you can re-apply it to future generations.
- Notes:
  - Auto-extracted tags mix real style signals with transcription residue. Do not paste them raw. Edit first.
  - Never do this with other people's copyrighted audio. The technique is for self-reuse and cleared sources only.
  - Technique is new in the 5.5 cycle; replication reports are still limited.
- Confidence: medium. Reddit / u/Jstnwrds55 (mid April 2026, search UI: last week).

### Vocal Ornament Exclusion Patterns
- Extends `Exclude Best Practices` (see Critical Safety Rules below) specifically for **vocal flourishes** (runs, melisma, ad-libs, shouted tags) that the general rule does not enumerate.
- Target behaviors: overwrought gospel-style runs, excessive melisma, filler ad-libs between lines, "yeah / uh" tags on every bar.
- Paired-write rule: negative phrasing alone is unstable. Always add a **positive replacement** for the vocal behavior.
  - Exclude field: `ad-libs, runs, melisma`
  - Style Block: `straight tone, punk delivery, raw vocals, low register`
- Works well for: post-punk, coldwave, punk, lo-fi, dry-vocal indie, spoken-leaning folk.
- Cap at 2-3 negative vocal items per prompt. Suno can latch onto `no X` and emphasize the very thing you excluded.
- Confidence: low-medium. Reddit / u/BuffaloConscious7919 and related threads (mid April 2026).

---

## Community-Discovered Techniques

### 1. Anchoring Strategy
Repeat critical vibe/mood terms at the START and END of Style Block.
Increases keyword weight, prevents style drift in long generations.

### 2. The 4-7 Descriptors Rule
Optimal: 4-7 descriptors per section. More than 50 tags causes "prompt fatigue" (generic output, robotic vocals).

### 3. Top-Anchor Technique
Information at the very beginning of Style Block gets strongest attention.
Always lead with genre and tempo.

### 4. Vocal Anchor Method
Repeat vocal descriptors (e.g., "deep male baritone") multiple times in lyrics to force vocal consistency.

### 5. Avoid "Tag Soup"
More tags ≠ better. Keep it focused. 5000+ song validation confirms 4-7 is the sweet spot.

### 6. Negative Space Technique
Using silence/pause markers `[...]` or `[Silence]` to control timing between sections.

### 7. Phonetic Spelling Hack
For homophones: "live" → "lyve", "bass" → "basss" to get intended pronunciation.

---

## Odd Time Signature / 変拍子プロンプト戦略

5/4・7/8 等の奇数拍子（odd meter）を Suno V5.5 で「当てに行く」ための体系的戦略。
公式 KB・Reddit・日本語コミュニティ記事・音楽理論資料からの統合知見。
**大半の技法は出典元でも「未検証」と明記されている**点に注意。

### Fundamental Caveat（まず知るべき事実）

- **Suno Studio の time signature 設定は edit grid 専用で、モデル条件には送られない**（Suno 公式 KB）。Studio で拍子を指定しても新規生成には影響しない
- **直接 `5/4` / `7/8` と書いても 4/4 に吸われやすい**。ラベルは高い確率で無視される
- **「ラベルを信じず必ず数えろ」が鉄則**。出力が出たら人間がカウントして検証する
- 成功率は曲調・モデル・スライダー・シード有無で大きく変動する
- 変拍子は「当たればラッキー」ではなく「**当てに行く工程設計**」が必要

### Strategy Ladder（推奨順・堅牢性の順）

#### A. 連符語彙戦略（基本）

拍子記号ではなく「連符（tuplet）語彙」で 5/7 のまとまりを作る。Reddit で最も再現性が高いと報告されている手法:

- `quintuplet` / `quintuplet groove` / `quintuplet subdivision` / `5-note grouping` → 5 拍子狙い
- `septuplet` / `septuplet groove` / `septuplet subdivision` / `7-note grouping` → 7 拍子狙い

Style にも Lyrics にも分散配置する。

#### B. メトリック・モジュレーション（BPM 関係式）

テンポ変換の理屈で「実質の拍子」を作る手法。Suno はテンポ変更は扱える前提。

**式**: `new_tempo = base_tempo / tuplet_division × meter_base`

**例**: 5:4 感を狙う場合 → 120 BPM を 120 / 5 × 4 = **96 BPM** に。Style/Lyrics に `base 120 BPM, metric modulation 5:4, derived 96 BPM` のように書く。

#### C. 不規則グルーヴ語彙（補助）

以下の語彙で「変拍子っぽさ」を誘発できるという報告:

`irregular meter` / `shifting rhythms` / `polyrhythmic` / `contrametric` / `extra-metric`

※ `polymeter` は報告では効かないとされる。避ける。

#### D. アクセント分割の明示

奇数拍子の体感は「等分」ではなく「非対称分割」で生まれる:

- **5拍子**: `accent 3+2` または `accent 2+3`
- **7拍子**: `accent 2+2+3`（最典型）/ `3+2+2` / `2+3+2`

これらを Style にもセクションタグにも書く。例: `[Verse - quintuplet feel, accent 3+2]`

#### E. シード戦略（最堅牢）

**言語誘導より堅い**。Upload Audio で 5/4 や 7/8 のクリック/ドラムループを入れ、Extend で延長する。公式の一般 Upload Audio 上限は plan により異なる（Free は最大 8 分、Pro/Premier は最大 30 分）。変拍子シード素材としては、拍頭が明確な 6-60 秒程度のクリック/ドラムループが実用的。

拍頭が分かるよう、各拍頭にクラッシュ/キック等を明確に入れるのがコツ（日本語コミュニティ検証記事より）。

#### F. Song Editor で拍数指定

公式の Song Editor は「追加セクションの拍（beats）数」を調整できる。拍子そのものの保証にはならないが、奇数拍のフレーズ長を保ちやすくなる。

### Slider Settings for Odd Meter

変拍子は構造が壊れやすいので、Weirdness は低め・Style Influence は高めで安定させる:

| スライダー | 推奨値 | 理由 |
|-----------|-------|------|
| Weirdness | 25-40 | 低め → 構造崩壊を防ぐ |
| Style Influence | 70-85 | 高め → 連符語彙・アクセント分割への追従を強める |
| Audio Influence | 60-75（シード使用時のみ） | シード拍頭を維持する |

### Prompt Templates

#### Example A: 5/4 狙い（progressive rock, 英語）

**Style:**
```
progressive rock, tight drums, base 120 BPM, quintuplet-driven groove, accent 3+2, clear downbeats, broken pulse
```

**Lyrics (Intro):**
```
[Intro - instrumental, count-in, quintuplet feel, accent 3+2]
one two three | one two
```

#### Example B: 7/8 狙い（math rock, 日本語）

**Style:**
```
マスロック、140 BPM、septuplet（7連）グルーヴ、7/8 フィール、アクセント 2+2+3、歯切れの良いギター、タイトなスネア、拍頭明確
```

**Lyrics (Intro):**
```
[Intro - インスト、カウント、7/8 feel, accent 2+2+3]
いち に｜いち に｜いち に さん
```

#### Example C: シード前提（Upload Audio + Extend）

**Style:**
```
math rock, quintuple meter feel, accent 3+2, locked to uploaded click track, dry drums
```

**運用:**
1. 5/4 や 7/8 のクリック/ドラムループ（実用目安 6-60秒）を Upload Audio
2. Extend で曲を構築
3. Style に「locked to uploaded click track」を含める
4. Audio Influence 60-75% でシード拍頭を維持

### Lyrics Design for Odd Meter（Step 2 連携）

#### Pattern A（テーマから生成 — ゼロから書く場合）

- フレーズ長を奇数拍に合わせる: 5拍子なら「3音節 + 2音節」の息づかい、7拍子なら「2 + 2 + 3」
- セクション冒頭にカウント歌詞を置く（`one two three | one two` / `いち に さん｜いち に`）
- アクセント分割をアノテーションタグに明示: `[Verse - quintuplet feel, accent 3+2]`
- 行の音節数は 4/4 用の 6-12 音節ルールを無理に適用しない。**拍数のまとまりを優先**

#### Pattern B（持ち込み歌詞 — ユーザー提供）

🚨 **Pattern B 絶対ルール: 歌詞本文は一字一句変更しない**。変拍子狙いでも歌詞保護は破らない。

できること:
- アノテーションタグに変拍子指示を追加: `[Verse - 7/8 feel, accent 2+2+3]`
- Style 側に連符語彙・アクセント分割・スライダー推奨値を反映
- ユーザーに「この歌詞は 4/4 前提で書かれている可能性が高い。変拍子のフレーズ長と噛み合わないリスクがある」と注意喚起する

できないこと:
- 歌詞の行分割・単語追加・カウント歌詞挿入（歌詞保護違反）

### Troubleshooting Flow（4/4 に戻ってしまう場合）

コスト（クレジット）と試行回数を抑える順序:

1. **カウントして確認**: まずラベルを信じず人間が数える。これで「本当に 4/4 か」を確定させる
2. **連符語彙 + アクセント分割を追加**: `quintuplet` / `septuplet` / `accent 3+2` / `accent 2+2+3` を Style と Lyrics タグに散りばめる
3. **シードに切り替え**: 言語誘導で効かなければ Upload Audio に 5/4 or 7/8 クリック → Extend（最も強い）
4. **Song Editor で拍数調整**: セクションの beats 数を指定してフレーズ長を奇数拍に固定
5. **スライダー再調整**: Weirdness を下げ、Style Influence を上げる

### Vocabulary Cheat Sheet

**効きやすい語:**
- `quintuplet` / `septuplet`
- `quintuple meter` / `septuple meter`
- `5-note grouping` / `7-note grouping`
- `accent 3+2` / `accent 2+2+3` / `accent 3+2+2` / `accent 2+3+2`
- `polyrhythmic` / `contrametric` / `extra-metric`
- `irregular meter` / `shifting rhythms`
- `metric modulation` / `5:4 modulation` / `7:8 modulation`
- `clear downbeats` / `strong downbeat` / `tight drums` / `locked to click track`

**避けるべき:**
- 直接的な `5/4` / `7/8` 記号**だけ**に依存すること（4/4 に吸われやすい）
- `polymeter`（報告では効かない）
- 曖昧な「odd time」だけで具体指示なし

---

## Critical Safety Rules

### Command Text Gets Sung
NEVER put instruction text in the lyrics field outside of brackets. Suno will sing it literally.
- BAD: `ここでテンポを上げる` (this will be sung)
- GOOD: `[Bridge - tempo increase, building energy]`

### Exclude Best Practices
- Keep to 2-5 specific items
- Use the Exclude field, NOT "no X" in Style
- "no fiddles" can cause fiddles to appear (word gets emphasized)
- Sometimes removing ALL Exclude items improves output

### Kanji → Hiragana Conversion
Critical for Japanese lyrics. Suno's voice synthesis requires hiragana.
- ALL kanji → hiragana
- ALL numbers → hiragana (3 → さん, 100 → ひゃく)
- Keep katakana as-is
- Keep English as-is

### Copyright Safety
- Never include artist names in Style Block
- Never include song titles in Style Block
- Never include album names
- Describe the SOUND, not the SOURCE

---

## V5.5 Official Sources
- https://suno.com/blog/v5-5
- https://help.suno.com/en/articles/11362305
- https://help.suno.com/en/articles/11362369 (Voices)
- https://help.suno.com/en/articles/11362497 (Custom Models)
- https://help.suno.com/en/articles/11362561 (My Taste)
