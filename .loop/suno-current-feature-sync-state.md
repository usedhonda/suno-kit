# Current Suno feature compatibility state

status: final
iteration: 2/4
research_watermark: 2026-09-10

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
next_step: none; begin a new sweep only after the next official release-note or
  independently corroborated community change. The one open thread is the v6-wild
  request parameter, which needs a captured generate request rather than more
  research.
stop_reason: evidence_gap
