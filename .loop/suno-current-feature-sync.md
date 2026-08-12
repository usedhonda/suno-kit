# LOOP: current Suno feature compatibility sweep

PROJECT PROFILE:
- `skills/suno/knowledge/` is the public prompt-and-workflow guidance layer.
- `suno-cli/` is a TypeScript/Node 22 execution and retrieval layer. Its live
  endpoint is unofficial, so an observed UI feature is never sufficient proof of
  an HTTP request field.
- This is a bounded closed loop: research current Suno changes, repair verified
  drift, and leave a durable evidence ledger. It is not an unattended scraper or
  a self-publishing loop.

GOAL: make the current Suno guidance and supported CLI surface accurate for the
latest verified feature changes, starting with the official V5.5 Duration Slider
release and the now-stale knowledge claim that no seconds field exists.

INITIAL EVIDENCE (2026-08-13):
- Official: Suno released the Web Duration Slider for V5.5 on 2026-07-20.
  Source: https://suno.com/release-notes/duration-slider-on-web
- Community: recent r/SunoAI reports confirm V5.5 visibility, gradual rollout,
  and unreliable adherence. These reports are operational context, not an API
  schema. Sources: https://www.reddit.com/r/SunoAI/comments/1v1ynhm/ and
  https://www.reddit.com/r/SunoAI/comments/1vkmvtq/
- Repository mismatch: `skills/suno/knowledge/suno_v55_reference.md` says Suno
  has no seconds field; `suno-cli` exposes no duration flag or request mapping.

SUCCESS CRITERIA (all required):
1. A dated feature matrix records every current candidate as `official`,
   `community-corroborated`, `community-only`, `unsupported`, or `deferred`, with
   source URLs, affected product surface, and a specific decision.
2. The first verified mismatch is repaired: duration guidance no longer denies the
   official V5.5 slider, explains its V5.5/Web scope and non-deterministic result,
   and retains structural-length guidance as a fallback rather than a false
   replacement.
3. Each accepted CLI change has exact current request-contract evidence. It adds
   input validation, dry-run/mock coverage, README/help coverage, and no live
   request is sent during verification. No evidence means no new CLI flag/body
   field.
4. Each accepted knowledge/skill change separates official facts from community
   reports, names its confidence and date, and does not invent performance claims.
5. Applicable focused tests pass; any `suno-cli` change also passes `npm run build`
   and `npm test`; `bash scripts/check-consistency.sh` prints `GATE: GREEN`.
6. The final state records what was implemented, what was deliberately deferred,
   and the next research watermark. It must not call incomplete schema inference
   a compatibility fix.

EVIDENCE POLICY:
- Tier O (official): Suno release notes, help center, or an official announcement.
  Sufficient for user-facing documentation and skill guidance.
- Tier C (community): two independent current community reports, or one maintained
  public implementation plus a second independent report. Sufficient to rank a
  candidate or document a clearly labeled operational caveat, never to infer an
  HTTP body field.
- Tier W (wire contract): a current first-party request capture approved for this
  purpose, or an equivalent authoritative contract record with field name, type,
  allowed values, and mode constraints. Required before changing `suno-cli` HTTP
  bodies or adding a flag that promises wire support.
- Reject stale, anonymous, undated, copied, or contradictory claims. Record the
  rejection rather than laundering it into knowledge.

VERIFY (run only what the accepted change can affect; final pass is required):
1. `git diff --check`
2. For knowledge/skill-only changes: `bash scripts/check-consistency.sh`
3. For CLI changes: `cd suno-cli && npm run build && npm test`
4. For new or changed CLI create options: built `--help` plus a no-network
   `create --dry-run` using an isolated temporary data directory; inspect JSON,
   validation, redaction, and no-live-submit behavior.
5. Re-read every changed public claim against the evidence matrix and inspect the
   final diff. A passing test cannot replace source evidence.

STATE FILE: `.loop/suno-current-feature-sync-state.md`
- Read before each iteration. Preserve the evidence matrix, source dates, rejected
  claims, feature decisions, changed files, checks, and next watermark.
- t=0 research is not success. `FINAL` requires an evidence-backed repair or a
  precise, recorded evidence gap for every in-scope candidate.

EACH ITERATION (cap: 4):
1. Read the contract and state. Search official Suno release notes/help since the
   state watermark, then sample current community discussion from r/SunoAI and
   one independent public technical/community source. Use public read-only pages;
   do not automate login, scrape private surfaces, or collect credentials.
2. Update the feature matrix. Rank candidates by user impact, evidence tier, and
   affected surface. Start with the Duration Slider mismatch already recorded.
3. Select one highest-confidence repair. For guidance, change only the relevant
   knowledge/skill text. For CLI, require Tier W and make a small flag -> body ->
   dry-run test -> README/help vertical slice.
4. Run the applicable VERIFY commands. Add one focused regression test for a
   changed CLI or machine-checkable public contract; do not add speculative tests.
5. Commit the scoped repair, record evidence and results in state, then continue
   only if another accepted candidate remains. Print `FINAL` only when every
   in-scope candidate has a completed or explicitly deferred decision; otherwise
   print `ITERATING`.

STOP WHEN (write `stop_reason`):
- `compatibility_ready`: all in-scope candidates are repaired or evidence-backed
  deferred, and final verification is green.
- `evidence_gap`: an otherwise valuable CLI change lacks Tier W evidence after two
  research passes. Keep the public guidance accurate and defer the wire change.
- `regression`: a previously green check becomes red; freeze and report the diff.
- `scope_boundary`: repair needs a paid live create, authenticated capture, API
  policy decision, or a feature outside knowledge/CLI ownership.
- `iteration_cap`: four iterations are reached; report the matrix and resume from
  state later rather than broadening the scope.

RULES:
- Never add request headers, endpoint fields, CAPTCHA behavior, browser stealth,
  auth flow, or model IDs merely because another community project claims them.
- Never run live create, browser mint, account/login inspection, paid generation,
  tag, push, or npm publish. Do not use or log cookies, JWTs, tokens, or profiles.
- Do not edit `.gitignore` or `scripts/check-consistency.sh` to satisfy a check.
- Preserve existing normal live null-CAPTCHA behavior, explicit-token fallback,
  budgets, ledger idempotency, redaction, and CDP diagnostic safety boundary.
- Do not stage `node_modules`, `dist`, `.demo-tmp/`, runtime data, credentials, or
  untracked `suno-cli/AGENTS.md` / `suno-cli/CLAUDE.md`.
- Maker != checker: inspect both the source citations and final diff before commit.
