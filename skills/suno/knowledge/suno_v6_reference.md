# Suno V6 Reference Guide

V6 released **2026-09-09**. This file records what Suno itself states about V6, what it
deliberately does **not** state, and the prompt patterns this kit recommends on top of the
confirmed capabilities.

Migration decisions for each V5.5 rule live in `v55_to_v6_migration.md`.
V6 is the kit default. Suno retired every earlier model on 2026-09-09 — "All models prior
to v6 have been retired, but your songs will still be in your library and remain
unchanged" (v6 FAQ) — so V5.5 is no longer something to generate with. It stays
documented in `suno_v55_reference.md` as a record of how the V5.5-era songs were made.

---

## Evidence status vocabulary

Every claim in this file carries one of these. Do not invent new values.

| Status | Meaning |
|---|---|
| `confirmed_v6` | Stated by Suno for V6 (blog / release notes / help center) |
| `observed_v6` | Reproduced first-hand on V6, with the observation date recorded |
| `legacy_v55_candidate` | Worked on V5.5, not yet re-tested on V6 — treat as a hypothesis |
| `community_experimental` | Community-reported, unverified. A/B test one at a time |
| `deprecated` | Known not to apply to V6 |

An unlabeled claim is a bug in this file.

---

## Model family — `confirmed_v6`

Three models, split by intent rather than by version number.

| Model | Suno's stated purpose | Use it for | Access |
|---|---|---|---|
| `v6` | "reliable, precise and consistently delivers polished music across every genre and style" | Finishing, precision, the take you keep | Paid only |
| `v6-wild` | "built for exploration"; "less predictable and more varied, producing unexpected, textured and ambitious results" | Finding an idea you would not have written | Paid only |
| `v6-mini` | "faster, more efficient version"; "delivers better, faster results than any free model" | Fast drafts, iteration, free tier | Available to everyone |

**Explore → converge.** Suno describes `v6-wild` output as ideas "to riff on, build from or bring
back into v6 for further refinement". Treat model choice as a creative mode, not a version bump:
explore wide on `v6-wild`, then rebuild the winning idea on `v6`.

⚠️ `v6` and `v6-wild` are **paid-only**. Never assume a user can reach them. `v6-mini` is the only
V6 model available on the free tier, so a free account must ask for `v6-mini` explicitly.
The kit defaults to `v6`.

---

## Capabilities — `confirmed_v6`

Each row is a capability Suno states for V6, with Suno's own example prompt.

| Capability | What Suno states | Official example |
|---|---|---|
| Local edit | "Edit part of an existing song using plain language. Change one section while preserving everything else you already love." | *"Change the chorus so it's sung by a gospel choir"* |
| Single-lyric edit | "Update a single lyric without rebuilding the entire song" | *"Change the lyric from 'love' to 'light.'"* |
| Multi-source mashup | "Build a mashup from multiple sources in one request. Combine elements from your different songs and describe how they should work together." | *"Take the vocals from x, drums from y, and add new lyrics about losing control, make it 80s synthwave"* |
| Sample / isolate | "Sample, isolate and build a new beat in a single workflow." | *"Sample the riff at 0:45, isolate the guitar, build a beat around it"* |
| Multimodal input | "Create with text, audio, images and video." | *"Make a song based on this image, this audio, and my journal entry"* |
| Vibe / reference | "Create from a vibe, genre or mix of inspirations. v6 can understand the feeling behind a reference and use it as the starting point for something original." | *"Make a song that feels like midnight on a rooftop"* |

**The two structural changes** for prompt design:

1. **Revision is no longer regeneration.** Before V6, fixing one section meant rolling the dice on
   the whole song. Now the fix is a sentence. Reach for a local edit before regenerating.
2. **References carry roles.** Suno's own mashup example assigns a job to each source
   ("vocals from x, drums from y"). State what each source is *for*, not just that it exists.

---

## Generation controls — `confirmed_v6`

Verified against the v6 FAQ on **2026-09-11** [see Sources]. These are not prompt syntax:
they sit beside the prompt and change what Suno does with it.

| Control | What Suno states |
|---|---|
| **Variety** | "The Variety slider is designed to introduce variety in your outputs by adjusting and updating your style prompts." To keep a hand-written Style exactly as written: "If you'd like to retain full control of your style tags, reduce the Variety slider to 0." |
| **Max Mode** | "an option you can turn on for any generation when you want v6 to spend more on getting it right. It costs more credits and it's best for: songs longer than two minutes, covers where you want the result to stay close to the original, transferring the style of one song onto another, and keeping vocals and style consistent through the whole track." |
| **Simple Mode** | "In Simple Mode, you don't need to know which tool to reach for (like Cover, Remix, Extend) when creating with v6. The model figures out the workflow if you want it to." |

**Variety changes what reproducibility means.** Above zero, Suno may rewrite the style prompt
it was given, so *saving the prompt text is no longer enough to reproduce a result*. Record the
whole recipe — model, mode, every control value, the references used — or record nothing useful.

When you want to judge the prompt itself (A/B tests, benchmarks, a style you engineered
deliberately), set Variety to zero. Otherwise you cannot tell your change from Suno's.

### Model lifecycle — `confirmed_v6`

- **Every model before v6 is retired**: "All models prior to v6 have been retired, but your songs
  will still be in your library and remain unchanged." They are not selectable for new work.
- **Custom Models work on v6**: "Fine-tune v6 on your own tracks for a personalized sound."
  Existing ones carry over — "Any custom models you've created will automatically get upgraded so
  that v6 powers your model moving forward. Songs created with your old v5.5 custom model will
  still be available, playable and unaffected by the v6 update."

### Wire names for these controls — **third-party, not observed here**

A third-party project reports that the web client sends Variety as
`metadata.control_sliders.aug_creativity` on a 0..1 scale, alongside `metadata.is_max_mode`.

⚠️ **This kit has not reproduced that first-hand**, so it is *not* `observed_v6` — unlike the model
identifiers below, which were seen directly in a first-party session. `suno-cli` sends these names
because the owner asked for the controls, and the code says plainly that the names are unverified.
Re-verify against a live request before trusting them. This is the same standard that keeps
`v6-wild` without an alias.

---

## Not stated by Suno — `unspecified`

As of **2026-09-11**, none of the following appear in Suno's V6 blog post, release notes,
Current Models page, or the v6 FAQ — all four were read directly, not summarised from a report.
**Do not fill these in with guesses, and do not copy them from third-party API wrappers.**

| Item | Status |
|---|---|
| Style field character / token limit | unspecified |
| Lyrics field character / token limit | unspecified |
| Internal model identifier (the `mv` value) | **partly observed** — see below. Still unspecified for `v6-wild` |
| temperature / top_p / top_k / seed | unspecified — Suno exposes no such controls publicly |
| Context window | unspecified |
| System prompt | unspecified |
| Embedding API | unspecified |
| Duration Slider on V6 | unspecified — the slider shipped 2026-07-20 for **V5.5 / Web only** |
| Maximum song length | unspecified |
| Weirdness / Style Influence / Audio Influence semantics on V6 | unspecified — do not assume V5.5 behaviour carries over |
| Voices / My Taste / Persona compatibility | unspecified for V6 specifically — **Custom Models are the exception and are confirmed**, see Generation controls above. Do not treat the four as one group |
| Output codec / sample rate / bitrate | unspecified |
| Image / video / audio input limits, formats, counts | unspecified |

**Weirdness is a Suno creative control. It is not a documented sampling temperature.**
Never present it as one.

### Model identifiers — `observed_v6`

Observed **2026-09-10** from a first-party logged-in session, two independent ways: the web app's
own model-tier map, and a live library response whose clips carry `major_model_version: "v6"`
next to `model_name: "chirp-hawk"`. The same map reproduces the already-known
`v5.5 -> chirp-fenix`, which is what makes the new rows trustworthy.

| UI name | Identifier sent as `mv` | Status |
|---|---|---|
| v5.5 | `chirp-fenix` | previously known, re-confirmed |
| v6 | `chirp-hawk` | `observed_v6` (two independent paths) |
| v6-mini | `chirp-goose` | `observed_v6` (app model-tier map) |
| **v6-wild** | **none of its own** | see below — **do not add an alias** |

### Why `v6-wild` has no identifier of its own

Tested 2026-09-10 by generating **two** songs with `v6-wild` genuinely selected in the picker
(the selector read `v6-wild` immediately before each create). Both resulting clips came back as:

```
major_model_version: "v6"      model_name: "chirp-hawk"
```

— identical to a plain `v6` clip. Supporting evidence pointing the same way: `v6-wild` is not a
tier in the app's model map, which lists only `... v5_5, v6_mini, v6`.

The one contrary signal is that the string `chirp-hawk-wild` does exist in the client state
attached to the `v6-wild` row in the picker. So the most likely shape is that "wild" travels as a
**separate flag or a server-side variant**, and the stored model is normalised back to
`chirp-hawk` — not that `chirp-hawk-wild` is what a create request carries.

**Consequence for `suno-cli`:** do **not** add a `v6-wild` alias. There is no observed wire value
to map it to, and the observable outcome of picking wild is a `chirp-hawk` clip. Sending
`chirp-hawk-wild` as `mv` would be a guess. Whatever selects wild is not `mv` alone, and that
parameter has not been identified.

These are observations of a closed, server-side product, not a published contract. Re-verify
after any Suno update.

---

## Prompt patterns

⚠️ **These are this kit's recommendations, not Suno syntax.** They are built on the confirmed
capabilities above. There is no evidence that V6 parses `Core identity:` or any other literal
label — the headings exist to keep *our* generation organised and to force the relationships to
be stated. Do not claim Suno interprets them specially.

The ordering principle: **identity first, constraints last.**

```
identity + must-have  →  arrangement / vocal / structure / vibe  →  avoid + preserve
```

### compact — fast iteration, benchmarks

One sentence. Genre, groove, voice, vibe. Nothing else.

```text
Bright modern J-pop around 124 BPM, restrained close vocal in the verse opening into a wide
melodic chorus.
```

### directed — the V6 default

State the **relationships** between attributes, not just a list of attributes. Length is not the
point; explicitness is.

```text
Core identity:
Modern melodic J-pop with a tight, forward-moving groove around 124 BPM.

Vocal:
Intimate close-mic female lead in the verses; clearer, stronger chest voice in the chorus.
Natural diction, emotionally restrained rather than theatrical.

Arrangement:
Clean muted guitar and compact drums in the verse.
Open the harmony and stereo width in the pre-chorus.
Full bass, brighter guitars and layered backing vocals only in the chorus.

Production:
Polished studio sound, controlled high end, punchy but not over-compressed.

Vibe:
Like being alone on the last train home after deciding not to send a message.

Avoid:
crowd noise, arena chants, excessive vocal runs, overly bright cymbals
```

### exploratory — for `v6-wild`

This is a **meta-prompt for the LLM stage**, not text to paste into Suno. It produces several
genuinely different briefs from one idea, so `v6-wild` explores instead of re-rolling the same
arrangement.

```text
Create five materially different Suno v6-wild briefs from the same core idea.

Keep invariant:
- Japanese female lead vocal
- melancholic but danceable
- 120-128 BPM
- no crowd or live ambience

Vary aggressively:
- groove architecture
- harmonic colour
- instrumental palette
- verse/chorus density contrast
- production texture

Do not name artists.
For each variant, state one "novelty hypothesis" — what makes it distinct.
Do not produce five synonym-level rewrites of the same arrangement.
```

### local edit

**State what to preserve, not only what to change.** The whole value of the feature is that
everything unnamed stays put, so name the things that must survive.

```text
Change only the second chorus.

Replace the stacked synth lead with a small gospel choir and handclaps.
Keep the lead-vocal melody, lyrics, tempo, key, bass line and all other sections unchanged.
Do not alter the first chorus.
```

### multi-source

Give every source a job. Say explicitly what must **not** be carried over.

```text
Source A: use only the vocal phrasing and melodic contour.
Source B: use only the drum groove.
Source C: use only the atmospheric texture.

Do not copy lyrics from any source.

Combine into: minimal dark synth-pop, restrained verses, larger final chorus.
Preserve: A's vocal timing and B's rhythmic pocket.
Transform: instrumentation, harmony colour and production into a new arrangement.
```

### multimodal

Name the role of each attachment. Without a role, a reference bleeds into everything.

```text
Image: use only for atmosphere, colour and emotional temperature.
Voice memo: use as the primary melodic reference.
Journal entry: use as the lyrical theme and point of view.
Video: use its sense of motion, but do not infer tempo from the edit cuts.

Target: slow-burning alternative pop that grows from intimate to cinematic.
```

**Rights preflight** — before attaching anything, confirm you hold the rights to it. This is not
housekeeping: V6 was built with industry partners, and Suno says it "introduced safeguards to
screen uploaded audio files and lyrics for unauthorized use", so an unclear source can stop the
generation rather than quietly degrade it.

The terms effective 2026-09-03 require the uploader to warrant they hold "all rights, licenses,
consents, permissions, power and/or authority necessary to submit and use" what they upload. Voice
references are stricter still: a user "can only create a Voice Model resembling your own voice" and
agrees "not to create, or attempt to create, a Voice Model of another person". With multi-source
and multimodal input this now has to be checked per attachment, not once per song.

---

## Carrying V5.5 technique into V6

V6 was rebuilt, so a convention that V5.5 happened to honour may or may not survive. The ranking
this kit uses:

> **Semantic instruction is primary. Tags are an experimental secondary signal.**

Do not delete the V5.5 tag vocabulary — section tags and annotation tags remain the natural way to
carry section-local direction, and `suno_v55_reference.md` is still the reference for them. But
every community-discovered inline trick (`[Energy: High]`, `[modulate up a key]`, inline chord
brackets, the bracket-reliability hierarchy) drops to `legacy_v55_candidate` until re-tested on V6.

Per-rule verdicts: see `v55_to_v6_migration.md`.

---

## Community findings

Everything below is `community_experimental` until this kit reproduces it.

**Provenance, stated once for the whole section.** These entries come from a research report dated
2026-09-12 that summarised Reddit threads posted 2026-09-09..09-12. **The threads themselves were
not retrieved** — Reddit blocks this kit's fetcher — so the attribution is to the report, not to a
thread anyone here has read. Thread titles, dates and handles are kept so a human can find the
originals and check them.

Semantic instruction stays primary (see *Carrying V5.5 technique into V6*). Nothing here promotes
tags back to a primary control: every tag entry is a recovery move to A/B, never a default.

### V6-era corroboration of rules this kit already had

Not new techniques. Testers working on V6 independently arrived at three rules this kit has
documented since V5.5. That is not confirmation, but it is evidence the rules survived the
rebuild — which is what `legacy_v55_candidate` was waiting for.

| Rule this kit already had | Where it lives | What V6 testers reported |
|---|---|---|
| Negations belong in Exclude, never in Style | `suno_v55_reference.md` Exclude Best Practices — "Use the Exclude field, NOT \"no X\" in Style" | `NO reverb, no echo` written into Style reportedly left reverb in the output; positive wording (`dry, close-mic'd, narrow stereo image`) plus a separate Exclude worked better |
| Commas mark breath, CAPS pushes delivery | `lyric_craft.md` punctuation table | Mid-line commas used as breath marks, selective CAPS for stronger delivery |
| `[Silence]` controls timing | `suno_v55_reference.md` | Reported still effective on V6. The new detail is granularity — at the end of every lyric line, not only between sections |

One entry in this kit runs against the first row: `yaml_template.md` documents `no intro, no
humming` inside Style as a deliberate workaround with a reported ~50% success rate. It is flagged
there now. A/B it rather than assuming either side is right.

### Lyric markup — `community_experimental`

- **Line-end `[Silence]` against rushed vocals.** Put `[Silence]` at the end of every lyric line in
  the affected sections. Do not give the tag its own line, and do not stack punctuation in front of
  it. Reported effect: more room between lines, less hurry, melody regains its length. Caveat: one
  glam-metal power ballad, no controls, genre dependence likely.
- **Parentheses as a vocal-role marker.** `( ... )` around backing lines with the lead singing only
  the unparenthesised ones reportedly improved lead separation and call-and-response. Caveat:
  observed on an a cappella quartet, untested on a band arrangement. This kit's existing duet
  guidance in `suno_v55_reference.md` points the other way for *real* duets — split the parts
  rather than making one generation sing both. The two are different requests; check before mixing.
- **Stacking stop markers is not monotonic.** Extra terminal markers reportedly interfered rather
  than reinforced. `[2 Bar Rest]` was reported ignored while `[Silence]` acted, suggesting unknown
  tags are dropped rather than approximated.

### Style patterns — `community_experimental`

- **Instruments as actions, not nouns.** `continuous foreground riffs, interlocking leads,
  alternate picking` instead of `electric guitar`; fills, double bass, ghost notes instead of
  `drums`. Reported to stop instruments dropping out during verses. Caveat: rock-centric trials.
- **A production-quality clause.** A short tail such as `close-mic vocals, crisp transients, clear
  instrument separation, open low-mids, stable tonal balance`. The individual descriptors already
  exist in `style_catalog.md`; what is new is using them as one deliberate block. Caveat: its
  author calls it unofficial, and a long clause crowds out the musical direction.
- **Style length is unresolved — do not pick a winner.** Three incompatible recommendations
  circulated in the same week: fill the 1000-character UI limit with dense comma-separated tags;
  keep to 8-14 words for older-model texture; or ignore length entirely and order the content by
  musical hierarchy (genre, vocal, drums, guitars, bass, arrangement, production, ending). Treat
  these as three profiles to benchmark, not as a rule.

### Workflow — `community_experimental`

- **Short sections as edit boundaries.** Size each `[Verse]` / `[Pre-Chorus]` / `[Chorus]` to the
  unit you would want to re-roll, because on V6 the section is also the editing unit. A weak verse
  can then be replaced while a good chorus is kept untouched. This is a consequence of local edit
  (see *local edit*), not a prompt trick.
- **Sibling mashup.** Mash together the two candidate takes returned by a single create request.
  Reported gains in fidelity, cohesion and overall sound quality. For an older song: remaster it
  twice on V6, then mash those two. This is the documented multi-source mashup fed an unusual
  input — that feature is described as combining *different* songs.
- **Variety has two regimes.** Use `0` for calibration and prompt A/B, because Variety rewrites the
  style prompt itself (see *Generation controls*). But one report found `Bold` escaped a
  rushed-vocal failure that `0` could not. Read it as a mutation operator for climbing out of a
  failure basin, then return to `0` and try to reproduce the win under control.
- **Late-song density is a diagnostic, not a fix.** On long songs, watch the back half for low-mid
  buildup, vocal count creeping upward, and section resets getting weaker. One controlled test
  found arrangement density partly stochastic — identical prompt and settings produced both sparse
  and muddy takes — so judge a recipe by its success rate across takes, never by one good result.

---

## Known weak points

`community_experimental` — independent first-day hands-on reporting, single reviewer, small sample.
Recorded so we test rather than assume.

- Deliberate imperfection is reportedly hard to obtain: `off-key`, `out-of-tune`, `slightly
  dissonant`, `monotone vocals`, even `no drums` were reported as ignored in some attempts.
- Some AI-artefact character was reported in V6 vocals in specific takes.
- The audible gap between `v6` and `v6-wild` was reported as smaller than expected on some prompts.

Treat all three as **things to A/B test**, not as established V6 properties.
Observed 2026-09-09, single source, not reproduced by this kit.

---

## Independent benchmark — external measurement

The rows below are quoted from a named external document, not claims this kit makes about how V6
behaves. WildSongBench (192 prompts, 94 Chinese / 98 English) as published on the YuE2-3B model
card; every figure was checked against the source when read on 2026-09-12.

| Metric | Suno v5 | Suno v5.5 | Suno v6 | Suno v6 Wild |
|---|---:|---:|---:|---:|
| Musicality (higher better) | 5.9918 | 5.8087 | 5.6558 | 5.5644 |
| SongBench average (higher better) | 6.8721 | 6.7150 | 6.5562 | 6.4195 |
| MuLan (higher better) | 0.5428 | 0.5089 | 0.4916 | 0.4999 |
| AllMusicCaps (higher better) | 0.4353 | 0.3917 | 0.4305 | 0.4316 |
| Q3O prompt adherence (higher better) | 4.5907 | 4.5914 | 4.6258 | 4.5898 |
| Phoneme error rate (lower better) | 8.10% | 5.96% | 7.58% | 7.45% |

**It is not a like-for-like comparison**, and the benchmark says so: "Open baselines, Suno v6, and
Suno v6 Wild use two candidates and four ASR passes per candidate, followed by lower-PER selection;
earlier proprietary systems retain their delivered-candidate protocols."

What survives that caveat is narrow: **V6 does not lead V5.5 across the board here.** Q3O, the
prompt-adherence measure, is slightly higher on v6, while Musicality, SongBench average and MuLan
are lower and the phoneme error rate is worse. Do not stretch this into a claim about which model
sounds better. It is one external benchmark, with an acknowledged protocol difference, and it is
not Suno's. It is recorded because it is measured and retrievable, which the *Known weak points*
above are not.

---

## Sources

| Tier | Source | Date | Used for |
|---|---|---|---|
| Official | https://suno.com/blog/introducing-v6 | 2026-09-09 | Model family, capabilities, official example prompts |
| Official | https://suno.com/release-notes | 2026-09-09 | Release date, paid-only access |
| Official | https://suno.com/release-notes | 2026-07-20 | Duration Slider = V5.5 / Web only |
| Official | https://help.suno.com/en/articles/13924481 (v6 FAQ) | read 2026-09-11 | Variety, Max Mode, Simple Mode, retirement of pre-v6 models, Custom Model upgrade |
| Official | https://help.suno.com/en/articles/13924737 (Current Models) | read 2026-09-11 | Model family and access tiers |
| Independent | The Verge, first-day hands-on | 2026-09-09 | Known weak points (unverified) |
| Official | https://suno.com/blog/introducing-v6 | read 2026-09-12 | Industry partners, upload safeguards |
| Official | https://suno.com/terms (effective 2026-09-03) | read 2026-09-12 | Upload rights warranty, Voice Model own-voice-only rule |
| Official | https://help.suno.com/en/articles/3198209 (Does Suno moderate songs?) | read 2026-09-12 | Artist-name and trademark blocking |
| Independent | https://huggingface.co/m-a-p/YuE2-3B (YuE2-3B model card) | read 2026-09-12 | WildSongBench figures and its candidate-selection caveat |
| Community | Research report 2026-09-12, summarising Reddit threads 2026-09-09..09-12 | 2026-09-12 | Everything under *Community findings*. Threads not retrieved — Reddit blocks this kit's fetcher |

Last verified against source: **2026-09-12**.
Re-verify after any Suno model update — V6 is a closed, server-side model and may change silently.
