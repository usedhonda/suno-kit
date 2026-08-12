# Current Suno feature compatibility state

status: pending
iteration: 0/4
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
  decision: repair stale knowledge guidance first; defer CLI mapping until Tier W
    request-contract evidence establishes the duration field, type, and mode rules.
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

first_repair: update Duration Slider guidance without claiming an undocumented CLI
  request field; preserve structural length controls as fallback guidance.
next_step: run iteration 1 research and implement the first verified knowledge repair.
stop_reason: none
