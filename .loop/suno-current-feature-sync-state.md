# Current Suno feature compatibility state

status: final
iteration: 1/4
research_watermark: 2026-08-13

feature_matrix:
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
    duration field, type, and mode rules.
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
  status: community-only
  date: 2026-08-12
  evidence:
    - https://www.reddit.com/r/SunoAI/comments/1vl36t2/
  affected_surfaces:
    - model documentation
    - suno-cli model mapping
  decision: do not implement before an official release and supported model contract.
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
next_step: none; begin a new sweep only after the next official release-note or
  independently corroborated community change.
stop_reason: compatibility_ready
