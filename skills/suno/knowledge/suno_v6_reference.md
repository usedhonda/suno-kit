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
  The Custom Models help page (read 2026-09-16) adds two hard numbers: it takes "as few as six
  songs", and "You must own the rights to all of the songs you upload to create your custom
  model." Which base model version a custom model is built from is **not** stated there.

### Maximum song length — `confirmed_v6`

> "Suno can generate up to 8 minutes of music in a single generation across v6, v6-wild, and
> v6-mini"

Eight minutes is the ceiling for **one generation**, not a lifetime cap on a song — the same page
points at Extend for going further. It applies to all three V6 models, with no separate figure for
`v6-mini`.

⚠️ **This entry supersedes a rejection.** On 2026-09-11 this kit recorded the 8-minute figure as
*rejected* because the report that carried it cited an article that returned 404, the number was
absent from the FAQ and Current Models pages, and search results attributed 8 minutes to V4.5/V5.
That rejection was the right call on the evidence available and still the wrong answer: the claim
was true and the citation was broken. A later report supplied a working article, which was read
directly. **Rejecting an unverifiable citation never makes the claim false** — it only parks it.
Anything parked this way is worth re-testing when a new source appears.

Generating up to eight minutes is not the same as eight minutes of *stable* output. Community
reports of drift past the four-minute mark live under *Community findings*.

### Wire names for these controls — **third-party, not observed here**

A third-party project reports that the web client sends Variety as
`metadata.control_sliders.aug_creativity` on a 0..1 scale, alongside `metadata.is_max_mode`.

⚠️ **This kit has not reproduced that first-hand**, so it is *not* `observed_v6` — unlike the model
identifiers below, which were seen directly in a first-party session. `suno-cli` sends these names
because the owner asked for the controls, and the code says plainly that the names are unverified.
Re-verify against a live request before trusting them. This is the same standard that keeps
`v6-wild` without an alias.

#### The Variety scale is now actively disputed — 2026-09-16

A second third-party project, BetterSuno, added V6 support on 2026-09-14 and documents the **same
field with a different type**. Its API reference was fetched and read directly:

```
| control_sliders.aug_creativity | 0-4 | V6 Variety level:
  0=off, 1=normal, 2=high, 3=extra, 4=max (only V6 models) |
```

Discrete integers, not a normalised fraction. `suno-cli` currently sends `variety / 100`, i.e.
`0.0..1.0`. **If BetterSuno is right, `--variety 100` sends `1.0`, which would be "normal" rather
than "max"** — the flag would be quietly capped near the bottom of its range. `--variety 0` happens
to mean "off" under both readings.

Do **not** switch to 0..4 on this. Two third-party projects disagreeing does not make the louder
one correct, and neither has been reproduced here. **The field name is now better supported than
before** — two independent projects name `aug_creativity` — while **its type is less certain than
the kit previously implied.** Both statements are recorded as such.

This is decided by capture, not by argument: set Variety to each level in a logged-in browser and
compare the `generate` request bodies. Until then the flag stays as it is and stays flagged.

#### Other fields the same project reports — capture targets, not adopted

| Field | Reported shape | Why it is not adopted |
|---|---|---|
| `duration` | seconds, 10-360, 5-second steps, omit for auto | Third-party only. Note 360 s is six minutes, below the official eight-minute generation ceiling, so an explicit target and the model's limit are probably different things — that reading is inference, not documentation |
| `use_personalization`, `do_personalize_lyrics`, `personalization_user_uuid` | booleans plus a uuid, for My Taste | Third-party only. Official pages still name no V6 compatibility for My Taste |
| `gpt_description_prompt: ""` | empty string keeps Custom mode | Third-party only, and an omitted key versus an empty string is exactly the kind of difference a capture settles |
| `mv: "chirp-hawk-wild"` | the `v6-wild` identifier | **Contradicted by first-party testing here** — see *Why `v6-wild` has no identifier of its own*. This kit already found that string in client state and still saw both wild generations come back as `chirp-hawk`. The report corroborates that the string exists; it does not show a create request carrying it |

---

## Not stated by Suno — `unspecified`

As of **2026-09-16**, none of the following appear in Suno's V6 blog post, release notes,
Current Models page, the v6 FAQ, the song-length article, the Custom Models article or the My Taste
article — all were read directly, not summarised from a report.
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
| Duration Slider on V6 | unspecified — the slider shipped 2026-07-20 for **V5.5 / Web only**. A third-party client reports an explicit `duration` field; see *Wire names* |
| Weirdness / Style Influence / Audio Influence semantics on V6 | unspecified — do not assume V5.5 behaviour carries over |
| Voices / My Taste / Persona compatibility | unspecified for V6 specifically — **Custom Models are the exception and are confirmed**, see Generation controls above. Do not treat the four as one group. My Taste's own help page (read 2026-09-16) defines it — "My Taste learns about what you're enjoying on Suno" from "your listening and creation habits" — but names **no model compatibility at all**, so V6 support is still not an official claim. A third-party client implements V6 personalization fields; see *Wire names* |
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

**Provenance, stated once for the whole section.** These entries come from two research reports,
dated 2026-09-12 and 2026-09-16, which between them summarise Reddit threads posted
2026-09-09..09-16. **The threads themselves were not retrieved** — Reddit blocks this kit's
fetcher — so the attribution is to the reports, not to a thread anyone here has read. Thread
titles, dates and handles are kept so a human can find the originals and check them. Where the
same reports made official or third-party claims, those were fetched and read directly instead,
and they live in the confirmed sections above rather than here.

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
- **Give each genre in a fusion a job.** Instead of listing `folktronica, EDM, cinematic folk`,
  name one primary identity and say what each other genre contributes — the sub-bass pulse, the
  plucked lead texture — and what it must not take over. This is the kit's existing "write the
  relationships between attributes" rule applied to fusion specifically. Reported 2026-09-15.
- **Compile an old prompt rather than discarding it.** Write the V5.5-era Style as you always did,
  then have a language model convert it into a V6 production brief: one primary identity, a job
  for each secondary genre, instruments as performance behaviour, groove stated apart from BPM,
  the vocalist described as a performer, section contrast, instrument hierarchy, mix hierarchy.
  Delete any clause that would not change a musical decision. Reported 2026-09-16. Caveat: the
  headings in such a template are for the language model's benefit — **Suno guarantees no literal
  syntax here**, so do not let a template harden into invented tags.

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

**The 2026-09-16 report adds a different kind of move: change the route, not the prompt.**

- **Simple and Advanced are different paths, not skill levels.** Suno says Simple Mode decides the
  workflow for you (see *Generation controls*), so the same brief can come out differently in each.
  One tester found a detailed brief that was technically correct but emotionally flat in Advanced
  became more expressive in Simple; another found Simple rewrote supplied lyrics and had to switch
  back to Advanced to keep them intact. The usable reading is a routing rule, not a winner:
  **exact lyrics or structure go to Advanced / Custom; open interpretation can try Simple.**
  Reported 2026-09-14.
- **Escalate by route before rewriting.** If a take fails, hold the prompt fixed and change one
  route at a time — mode first, then model variant. It separates "the prompt was wrong" from "that
  path was wrong", which rewriting cannot. This is the V6-shaped replacement for the V5.5 habit of
  editing the prompt and re-rolling the same model.
- **`v6-mini` as a specialist fallback.** One report had flagship `v6` miss a 1950s-60s
  double-snare backbeat that `v6-mini` caught on the same prompt and tags. Single anecdote — it
  does not make mini better at rhythm. It does suggest the family is not a plain quality ladder,
  so a smaller sibling is worth one A/B on a specific failure. Reported 2026-09-14.
- **Three layers of context, if you use My Taste.** One tester kept the band's enduring identity in
  My Taste, only song-specific conditions in Style, and section-local performance direction inside
  the lyrics, and reported a much higher share of usable takes. Note the reproducibility cost:
  My Taste is personalization that keeps learning, so a My Taste generation is **not reproducible
  from the prompt alone**. Benchmark with it off; use it for final work. Reported 2026-09-14.
- **Checkpoint long songs around four minutes.** Eight minutes is generatable (see *Maximum song
  length*), but drift past roughly 4:15 was reported, Max Mode included. Score the back half
  separately rather than judging a long take as one object; if a genre keeps failing after the
  checkpoint, prefer Extend or local edit over one long generation. Reported 2026-09-15.
- **Some failures do not answer to prompting at all.** A 2026-09-16 report describes changing
  genre wording, production language, structure, settings and arrangement instructions and still
  converging on the same strong kick and snare, the same late percussion escalation, the same
  sparse arrangement. Treat that as its own failure class: when varied prompts collapse to one
  output, stop rewriting and change route, model, or approach.

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

## Independent benchmark

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
| Official | https://help.suno.com/en/articles/3198209 (Does Suno moderate songs?) | read 2026-09-12 | A song may fail to generate if it contains well-known artist or people names, or copyrighted / trademarked terms |
| Official | https://suno.com/blog/building-the-future-of-music-responsibly | read 2026-09-12 | Suno removes an artist name from a prompt and redirects toward descriptive musical characteristics |
| Independent | https://huggingface.co/m-a-p/YuE2-3B (YuE2-3B model card) | read 2026-09-12 | WildSongBench figures and its candidate-selection caveat |
| Community | Research report 2026-09-12, summarising Reddit threads 2026-09-09..09-12 | 2026-09-12 | Everything under *Community findings*. Threads not retrieved — Reddit blocks this kit's fetcher |

| Official | https://help.suno.com/en/articles/13924929 (song length) | read 2026-09-16 | Eight-minute ceiling for one generation across v6, v6-wild and v6-mini |
| Official | https://help.suno.com/en/articles/11362497 (Custom Models) | read 2026-09-16 | Six-song minimum, and the requirement to own the rights to every uploaded song |
| Official | https://help.suno.com/en/articles/11362561 (My Taste) | read 2026-09-16 | What My Taste is and what it learns from. Names no model compatibility |
| Third-party | https://github.com/MrDoe/BetterSuno — `docs/suno-api-reference.md` | read 2026-09-16 | The disputed 0-4 Variety scale, plus the duration and personalization fields listed as capture targets. Not adopted |
| Community | Research report 2026-09-16, summarising Reddit threads 2026-09-14..09-16 | 2026-09-16 | The route-before-prompt entries under *Community findings*. Threads not retrieved |

### Thread addresses for the 2026-09-16 community entries

The 2026-09-16 report supplied thread URLs, which the 2026-09-12 one did not. They are recorded
here so a human can check the originals in one click. **This kit has not opened them** — Reddit
blocks its fetcher — so they are addresses, not evidence that anyone here read the thread.

| Entry | Thread |
|---|---|
| Simple and Advanced as different paths | https://www.reddit.com/r/SunoAI/comments/1wehqi9/ |
| Three layers of context with My Taste; `v6-mini` as a specialist fallback | https://www.reddit.com/r/SunoAI/comments/1weq2kw/ |
| Give each genre in a fusion a job | https://www.reddit.com/r/SunoAI/comments/1wfhxg5/ |
| Compile an old prompt into a V6 brief | https://www.reddit.com/r/SunoAI/comments/1wgb1yl/ |
| Checkpoint long songs around four minutes | https://www.reddit.com/r/SunoAI/comments/1wdysw9/ |
| Varied prompts collapsing to one arrangement | https://www.reddit.com/r/SunoAI/comments/1wguw9i/ |
| Probing the Simple Mode orchestration layer | https://www.reddit.com/r/SunoAI/comments/1wf5stu/ |

Last verified against source: **2026-09-16**.
Re-verify after any Suno model update — V6 is a closed, server-side model and may change silently.
