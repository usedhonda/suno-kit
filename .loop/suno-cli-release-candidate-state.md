# suno-cli release candidate state

status: final
iteration: 2/4
published_version: 0.3.0
published_tag: v0.3.0
candidate_version: 0.4.0
candidate_commit: 085e23e
baseline:
- Registry query on 2026-08-12 returned `@usedhonda/suno-cli` latest `0.3.0`.
- `0.3.1` was prepared but never tagged or published, so `0.3.0` is still the
  published version and `0.3.1` never reached anyone.
iteration_1:
- Scope: release the unreleased safety/diagnostic corrections after `v0.3.0` as a
  patch. No public command was removed; the root README was the only stale claim.
- Candidate change: `ff4416b7b857d2385ff98867b27979a97ef66506`
  (`release: prepare suno cli 0.3.1`).
- Verification at that revision: `npm test` 82/82, gate GREEN, `npm pack --dry-run`
  24 intended files.
- SUPERSEDED by iteration 2. Do not act on this iteration's handoff.
iteration_2:
- Why this supersedes iteration 1: Suno released V6 on 2026-09-09 and the kit was
  updated for it. Three further CLI commits landed after `ff4416b` — `c45eee0`
  (document the `--model` flag), `5b716b4` (add the observed `v6`/`v6-mini`
  aliases) and `07392ba` (make v6 the default). Tagging `ff4416b` today would
  publish a build with no V6 support at all.
- Version decision: `0.4.0`, not another patch. `create` with unchanged arguments
  now resolves to a different model (`chirp-hawk` instead of `chirp-fenix`), which
  is a behaviour change. The iteration-1 reasoning — "smallest SemVer bump for
  compatible behavior and documentation corrections" — no longer describes the
  diff, so a patch bump would have misrepresented it to anyone upgrading.
- Candidate change: `085e23e` (`chore(release): bump suno-cli to 0.4.0`).
- Verification on the candidate: `bash scripts/check-consistency.sh` GREEN;
  `cd suno-cli && npm run build` passed; `npm test` 83/83; `npm pack --dry-run
  --json` produced 24 entries / 95689 bytes for `@usedhonda/suno-cli@0.4.0`;
  isolated `create --dry-run` with no `--model` returned `mv: chirp-hawk` and with
  `--model v5.5` returned `mv: chirp-fenix`; `git diff --check` clean.
- Package decision unchanged: browser diagnostic code stays because `--mint-check`
  remains a documented explicit diagnostic. No runtime state, credentials,
  `node_modules`, local overrides, or test files are in the artifact.
- Not performed: tag creation, npm publish, live create, browser mint.
release_handoff:
- Candidate version: `0.4.0`
- Candidate commit: `085e23e`
- Supersedes the iteration-1 handoff, which named `ff4416b` / `v0.3.1`. That
  instruction is retracted: acting on it would ship a pre-V6 build.
- Human-only action after review: create an annotated tag `v0.4.0` at the candidate
  commit, then push that tag. The existing trusted tag workflow performs npm
  publication; do not invoke `npm publish` directly.
next_step: none; candidate is ready for explicit human release authorization.
stop_reason: release_candidate_ready
