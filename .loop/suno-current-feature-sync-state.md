# Current Suno feature compatibility state

status: final
iteration: 4/4
research_watermark: 2026-09-12

feature_matrix:
- feature: Suno V6 release (v6 / v6-wild / v6-mini)
  status: official
  date: 2026-09-09
  evidence:
    - https://suno.com/blog/introducing-v6
    - https://suno.com/release-notes
  affected_surfaces:
    - skills/suno/knowledge/suno_v6_reference.md (new)
    - skills/suno/knowledge/v55_to_v6_migration.md (new)
    - skills/suno/SKILL.md
    - suno-cli model mapping
  decision: implemented. Recorded only what Suno states (three intent-split models,
    plain-language local edit, single-lyric edit, role-assigned multi-source mashup,
    sample/isolate, multimodal input, vibe prompting) and listed separately what it
    does not state (character/token limits, sampling controls, context window,
    embedding API, V6 duration, output codec). v6 and v6-wild are paid-only.
- feature: V6 internal model identifiers
  status: observed
  date: 2026-09-10
  evidence:
    - first-party session, web app model-tier map
    - first-party session, library response carrying major_model_version + model_name
  affected_surfaces:
    - suno-cli/src/create/body.ts MODEL_ALIASES
  decision: implemented. v6 -> chirp-hawk (two independent paths), v6-mini ->
    chirp-goose. The same map reproduces the already-known v5.5 -> chirp-fenix,
    which is what made the new rows trustworthy rather than guesswork.
- feature: v6-wild request parameter
  status: evidence_gap
  date: 2026-09-10
  evidence:
    - two songs generated with v6-wild selected both returned
      major_model_version v6 and model_name chirp-hawk
    - v6-wild is not a tier in the app's model map
    - the string chirp-hawk-wild exists in client state on the wild picker row
  affected_surfaces:
    - suno-cli/src/create/body.ts MODEL_ALIASES
  decision: deferred, no alias added. Wild does not surface as a distinct mv value,
    so it most likely travels as a separate flag or a server-side variant. The
    generate request body itself was not captured: the app does not route it through
    a patched window.fetch or XMLHttpRequest. Sending chirp-hawk-wild as mv would be
    a guess.
- feature: default model generation
  status: decided
  date: 2026-09-10
  evidence:
    - V6 is the current generation per the official release above
  affected_surfaces:
    - suno-cli/src/create/body.ts
    - skills/suno/SKILL.md, knowledge/yaml_template.md, both READMEs
  decision: default flipped from v5.5 to v6 across every surface that asserted it.
    v5.5 remains fully supported behind an explicit --model v5.5 and is documented
    as the previous generation. The earlier free-tier justification for defaulting
    to v5.5 was an untested assumption, and the free-friendly choice would have been
    v6-mini in any case. CLI bumped to 0.4.0 because callers now reach a different
    model with unchanged arguments.
- feature: Duration Slider on Web
  status: official
  date: 2026-07-20
  evidence:
    - https://suno.com/release-notes/duration-slider-on-web
    - https://www.reddit.com/r/SunoAI/comments/1v1ynhm/
    - https://www.reddit.com/r/SunoAI/comments/1vkmvtq/
  affected_surfaces:
    - skills/suno/knowledge/suno_v55_reference.md
    - suno-cli create (no duration option yet)
  decision: knowledge repair committed in 101abff52b3fa4256f042e450cf45a64581e88d4;
    CLI mapping deferred until Tier W request-contract evidence establishes the
    duration field, type, and mode rules. Still V5.5/Web only; no V6 statement
    exists, so it was not inherited into the V6 guidance.
- feature: Lyrics improvements on Web
  status: official
  date: 2026-07-09
  evidence:
    - https://suno.com/release-notes
  affected_surfaces:
    - skills/suno/SKILL.md
    - skills/suno/knowledge/song_structures.md
  decision: already compatible. The skill's generated lyric structure and bracket
    labels are an existing workflow; do not claim support for Suno's private
    Lyricist, autosave, or natural-language editor without a separate contract.
- feature: Stem Separation improvements
  status: official
  date: 2026-06-11
  evidence:
    - https://suno.com/release-notes
  affected_surfaces:
    - skills/suno/knowledge/suno_v55_reference.md
    - suno-cli retrieval
  decision: existing knowledge already treats Studio stems as a manual workflow.
    Advanced Split and Split from Mix have no approved current CLI contract, so
    no endpoint, download, or credit behavior is inferred.
- feature: Voices mobile and Cover Art improvements
  status: official
  date: 2026-07-31 to 2026-08-07
  evidence:
    - https://suno.com/release-notes
  affected_surfaces:
    - none in the current prompt/CLI ownership boundary
  decision: out of scope. Mobile voice capture and image/video cover-art editing
    are neither prompt-generation nor current CLI retrieval behavior.
- feature: iMessage, mobile share inputs, and soccer anthem flows
  status: official
  date: 2026-06-04 to 2026-07-15
  evidence:
    - https://suno.com/release-notes
  affected_surfaces:
    - none in the current prompt/CLI ownership boundary
  decision: out of scope. These are iOS/Android entry points and guided mobile
    experiences; they do not change the Web prompt contract or supported CLI API.
- feature: new model generation announcement
  status: resolved
  date: 2026-08-12, resolved 2026-09-10
  evidence:
    - https://www.reddit.com/r/SunoAI/comments/1vl36t2/
  affected_surfaces:
    - model documentation
    - suno-cli model mapping
  decision: superseded. This entry deferred action until an official release and a
    supported model contract existed. Both arrived on 2026-09-09 / 2026-09-10; see
    the V6 release and identifier entries above.
- feature: browser-token and device-id header claims
  status: unsupported
  date: 2026-08-13
  evidence:
    - https://github.com/jackwener/OpenCLI/blob/main/docs/adapters/browser/suno.md
  affected_surfaces:
    - suno-cli HTTP client
  decision: reject as a community implementation claim without Tier W evidence;
    do not add authentication or anti-bot behavior.
- feature: retirement of every pre-v6 model
  status: official
  date: 2026-09-09, read 2026-09-11
  evidence:
    - https://help.suno.com/en/articles/13924481 (v6 FAQ): "All models prior to v6 have
      been retired, but your songs will still be in your library and remain unchanged."
  affected_surfaces:
    - README.md, skills/suno/SKILL.md, knowledge/yaml_template.md
    - knowledge/suno_v6_reference.md, knowledge/v55_to_v6_migration.md
    - suno-cli README, src/create/body.ts, test/create.test.ts
  decision: implemented. The kit had been telling users v5.5 was a selectable previous
    generation, which was wrong on every surface including the two canonical V6 files.
    The alias is kept so an identifier already recorded in a ledger still resolves, and
    create now warns on stderr; stdout stays pure JSON. Whether Suno still accepts such a
    request is Suno's call and is not claimed either way.
- feature: Variety / Max Mode / Simple Mode
  status: official
  date: 2026-09-09, read 2026-09-11
  evidence:
    - https://help.suno.com/en/articles/13924481 (v6 FAQ), read directly rather than via
      the research report that surfaced them
  affected_surfaces:
    - knowledge/suno_v6_reference.md
    - suno-cli/src/create/body.ts, src/cli.ts, src/commands/create.ts, README
  decision: implemented on owner instruction. Max Mode maps onto metadata.is_max_mode,
    which this repo already sent as a constant, so exposing it changes nothing when the
    flag is omitted. Variety is sent as metadata.control_sliders.aug_creativity on a 0..1
    scale -- that wire name is a THIRD-PARTY observation, never reproduced here, and is
    marked as such in code, CLI README and knowledge. It is deliberately not labelled
    observed_v6. Verified by dry-run that omitting both flags leaves the body unchanged,
    so no existing run-id changes hash, and that Variety 0 survives rather than being
    dropped as falsy.
- feature: Custom Models on V6
  status: official
  date: 2026-09-09, read 2026-09-11
  evidence:
    - v6 FAQ: "Any custom models you've created will automatically get upgraded so that
      v6 powers your model moving forward."
  affected_surfaces:
    - knowledge/suno_v6_reference.md (unspecified table corrected)
    - agent/suno_flow_generate.md, agent/suno_flow_album.md
  decision: implemented. The unspecified table had grouped Voices / Custom Models / My
    Taste / Persona as one undocumented block. Custom Models is confirmed; the other
    three are not. The group was split so the confirmed one is not buried.
- feature: maximum song length of 8 minutes for the V6 family
  status: rejected
  date: 2026-09-11
  evidence:
    - claimed by `deep-research-report (8).md`
    - help.suno.com/en/articles/2409473 returned HTTP 404 on direct fetch, twice
    - absent from the v6 FAQ, Current Models, and the release notes
    - the only text seen attributing 8 minutes came from a search summary and assigned
      it to V4.5 / V5, not to v6
  affected_surfaces:
    - knowledge/suno_v6_reference.md ("Maximum song length" row)
  decision: NOT adopted. Left as unspecified. Recorded here so the next sweep does not
    re-research it from scratch, and does not adopt it on the report's word alone.
- feature: consistency gate C6 cannot see filenames containing digits
  status: observed
  date: 2026-09-11
  evidence:
    - C6 extracts tokens with `knowledge/[a-z_]+\.md`, which cannot match
      suno_v6_reference.md, v55_to_v6_migration.md or suno_v55_reference.md
  affected_surfaces:
    - scripts/check-consistency.sh (NOT modified)
  decision: reported, not fixed. `maker != checker` forbids editing the frozen checker.
    A mistyped V6 knowledge path passes the gate silently, so every commit in this sweep
    also ran a manual resolution check over `knowledge/[a-z0-9_]+\.md`. That compensating
    check is written into the plan and should stay in use.

- feature: independent WildSongBench comparison of Suno v5 / v5.5 / v6 / v6-wild
  status: independent
  date: 2026-09-12
  evidence:
    - https://huggingface.co/m-a-p/YuE2-3B
  note: all six columns checked against the source and matched. v6 leads v5.5 only on Q3O
    prompt adherence; Musicality, SongBench average, MuLan and phoneme error rate are worse.
    The benchmark itself states v6 and v6-wild used a different candidate-selection protocol
    than the older proprietary systems, so this is not a like-for-like result and must not be
    quoted as "v6 sounds worse".
- feature: Suno strips artist names and redirects to descriptive characteristics
  status: official
  date: 2026-09-12
  evidence:
    - https://suno.com/blog/building-the-future-of-music-responsibly
    - https://help.suno.com/en/articles/3198209
  note: confirms migration verdict 12. The kit's decomposition rule mirrors what the service
    already does internally rather than evading a ban. Attribution correction - the redirect
    sentence is on the responsibly blog, NOT on the help article, which only says a song may
    fail to generate. The first pass cited the help article for both because a web search
    summary blended several pages; the help article was then fetched directly and the claim
    was absent. Cite from a page that was fetched, never from a search summary.
- feature: download limits explained as a measure against mass export
  status: rejected
  date: 2026-09-12
  evidence:
    - https://help.suno.com/en/articles/13876865
  note: claimed by the 2026-09-12 research report. The downloads page states allowances but
    gives no reason for them. Same treatment as the rejected 8-minute claim above. The
    allowances themselves did verify (Pro 20/month, Premier 60/month, Suno Studio workflows
    exempt, 7 trial downloads for pre-09-03 free accounts, trial downloads not commercial)
    but were deliberately kept out of the knowledge layer as billing policy, not prompt craft.
- feature: community sources for V6 prompt technique are not retrievable by this kit
  status: constraint
  date: 2026-09-12
  note: Reddit blocks this kit's fetcher and the research reports cite internal markers rather
    than URLs. Every V6 community technique therefore enters as community_experimental
    attributed to the report, never to a thread anyone here has read. Do not upgrade any of
    them on the strength of a later report that cites the same unreachable threads.
iteration_1:
- Official release notes were read on 2026-08-13 through the current top entries:
  Voices mobile (2026-08-07), Cover Art improvements (2026-07-31), Duration Slider
  (2026-07-20), Lyrics improvements (2026-07-09), and Stem Separation improvements
  (2026-06-11), plus iMessage/mobile-share/mobile-anthem entry points.
- Community corroboration for Duration was refreshed on 2026-08-13. It supports a
  reliability caveat only; it does not provide a Tier W CLI request contract.
- Verification: `git diff --check` passed and `bash scripts/check-consistency.sh`
  returned `GATE: GREEN` after the Duration guidance repair.
- Deferred intentionally: CLI duration field, upcoming-model support, header
  additions, lyric-editor automation, and stem operations. Each lacks either an
  in-scope product surface or Tier W request-contract evidence.

iteration_2:
- Re-entered on 2026-09-10 because the trigger this loop was waiting for fired:
  Suno published V6 on 2026-09-09. Both official pages were read directly rather
  than relying on a secondary summary.
- Repaired: the kit had no V6 content at all. Added two knowledge files, wired the
  skill's model-intent routing and local-edit path, documented the previously
  undocumented --model flag, added the two observed aliases, and flipped the default.
- Baseline defects found and fixed on the way, because V6 guidance would have been
  layered on a self-contradicting V5.5 baseline: Style limits stated as 120/400/1000
  without saying they are different layers, a documented 4500-char YAML budget that
  the actual check never enforced, a Section Matching Rule referring to a removed
  field, and a README that told readers both to copy the skill into ~/.claude/skills
  and that no sync was needed.
- Separate defect found: the installed skill at ~/.claude/skills/suno was a symlink
  to the pre-rename sunomanual path and had been dangling since the repository was
  renamed, so /suno was unreachable with no error surfaced. Repointed, and the README
  now documents how to detect it.
- Knowledge file count moved 7 -> 9, so the hardcoded C4 count and the README and
  SKILL tables were updated in the same commit.
- Harvest loop (docs/loop/, non-public) retargeted from V5.5 to V6 candidates, with
  its append target moved to the new V6 reference. Left PAUSED: its tools are
  currently unreachable in the scheduled environment (intent-guard and bird not
  found, WebFetch approval-required), so resuming would spin without collecting.
- Verification: `bash scripts/check-consistency.sh` GREEN; `cd suno-cli && npm test`
  83/83; `create --dry-run` with no --model returns chirp-hawk and with --model v5.5
  returns chirp-fenix; `git diff --check` clean.
iteration_3:
- Trigger: the owner supplied `deep-research-report (8).md` and asked for every remaining
  V5.5 surface to be brought to V6. The report is a secondary source, so each load-bearing
  claim was checked against the official page it cited before anything was written.
- That check changed the outcome twice. It confirmed Variety, Max Mode, Simple Mode and
  the Custom Model upgrade, and it surfaced the model retirement, which the kit had wrong
  everywhere. It also rejected the 8-minute claim, which no official page supports.
- Scope covered: agent/ (all six flows, including the reference contract, which pointed at
  the V5-era master and named no V6 file at all), mygpts/ (both GPTs; version numbers
  removed from the display names on owner instruction), the skill's default Style path,
  the knowledge templates, and the master reference.
- The master reference was rewritten from 1491 lines to 280. It had become a third copy of
  V5.5 facts; it now states none of its own and cites the knowledge layer instead. It
  contains no numeric parameters at all, which makes inventing a V6 number structurally
  impossible and leaves nothing to drift. The V5-era text and its 81 citations are frozen
  byte-identically at archive/SunoV5_Prompt_MASTER_REFERENCE_v1.5.0.md.
- Defects fixed in passing: a padding instruction in two files that told the model to fill
  the Style field (V6 guidance rejects it), a self-contradiction in the analyzer about
  per-section arrays, a heading naming a file that does not exist, and an unverifiable Suno
  screen path that now reports and stops instead of forcing its way on.
- Verification: gate GREEN at every commit; `npm test` 84/84; `npm run build` clean; the
  no-number invariant checked line by line on the rewritten master; a manual
  `knowledge/[a-z0-9_]+\.md` resolution check at every step because C6 cannot see those
  paths; dry-run evidence that the new CLI flags change nothing when omitted.
iteration_4:
- Trigger: the owner supplied a second research report dated 2026-09-12 and said community
  experiments matter a great deal. This was a MANUAL feed. The harvest loop is still PAUSED,
  so on resume it must not treat the Community findings section as empty and append again.
- Unlike report 8, this one carries almost no official claims. Its substance is Reddit
  threads from 2026-09-09..09-12, so the verification problem was different: not "is the
  official page saying this" but "can the source be retrieved at all".
- It cannot. Reddit blocks this kit's fetcher, and the report cites internal markers rather
  than URLs. Seven of the nine techniques therefore rest on the report's summary alone.
  Recorded as `community_experimental` with the provenance stated once for the whole
  section, explicitly attributing to the report rather than to a thread anyone here read.
- Verified against primary sources instead: the WildSongBench table on the YuE2-3B model
  card matched on all six columns for four Suno models, including its own statement that
  v6 and v6-wild use a different candidate-selection protocol than the older systems; the
  V6 blog's industry partners and upload safeguards; the 2026-09-03 terms (upload rights
  warranty, Voice Model own-voice-only); and the moderation page.
- The moderation page produced the most useful single fact: Suno says it strips an artist
  name from a prompt and redirects the request toward descriptive musical characteristics.
  The kit's decomposition rule is therefore not a workaround for a ban, it mirrors what the
  service already does internally. Recorded under migration verdict 12.
- Rejected one claim, as in iteration 3: the report states Suno explains download limits as
  curbing mass export. The downloads page gives no reason at all. Not recorded.
- Corrected the report's own framing. Of its nine "new" techniques only four or five are new
  to this kit. Line-end `[Silence]`, mid-line commas and CAPS, and the rule that negations
  belong in Exclude were all already documented — the last since V5.5, where the kit already
  wrote that "no fiddles" can cause fiddles to appear. Those three are filed as V6-era
  corroboration of existing rules, which is worth more than three extra tricks: it is the
  first outside evidence that they survived the V6 rebuild.
- One internal conflict surfaced and was flagged rather than resolved: `yaml_template.md`
  documents `no intro, no humming` inside Style as a deliberate workaround with a
  self-reported 50% success rate, which runs against the negation rule the V6 reports
  reinforce. A technique that already admits to 50% is not refuted by a thread nobody here
  could open, so the line now carries a re-test note instead of being removed.
- Verified but deliberately NOT filed into the knowledge layer: the download allowances and
  commercial-rights tiers (Pro 20/month, Premier 60/month, Suno Studio workflows exempt,
  7 trial downloads for pre-09-03 free accounts, trial downloads not commercial). That is
  platform billing policy, not prompt craft; placed in a prompt reference it would go stale
  without anyone noticing. Recorded here instead.
- Owner decision: the report's own design proposals — an experiment YAML schema, an eight
  axis evaluation, a negative-wording lint, an expanded recipe metadata block — were left
  out. They are the report author's opinion about how the kit should work, not findings.
next_step: none from this sweep. Open threads, in order of value: the v6-wild request
  parameter still needs a captured generate request; the `aug_creativity` wire name needs
  first-party confirmation before it should be trusted; the Suno Create screen path in
  agent/suno_flow_style_extract.md needs a human to look at the current UI.
stop_reason: evidence_gap
