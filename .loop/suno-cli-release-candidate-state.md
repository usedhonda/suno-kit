# suno-cli release candidate state

status: final
iteration: 3/4
published_version: 0.3.0
published_tag: v0.3.0
candidate_version: 0.4.0
candidate_commit: bf30ad6
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
iteration_3:
- Why this supersedes iteration 2: the 2026-09-11 V6 sweep changed the CLI again after
  `085e23e`. Tagging that commit today would publish a build that still calls v5.5 "the
  previous generation", emits no retirement warning, and has neither `--variety` nor
  `--max-mode`. Its test is even named "keeps v5.5 as the default".
- This is the same failure the iteration-2 entry retracted for `ff4416b`. A release
  handoff goes stale every time the CLI moves, so it has to be re-pointed in the same
  sweep that moves it — not noticed later.
- Version decision: still `0.4.0`, no further bump. Nothing between `0.3.0` and now has
  been published, so the new flags fold into the same unreleased version. `0.4.0` already
  signalled the behaviour change that matters to an upgrader: `create` with unchanged
  arguments resolves to a different model.
- Candidate change: `bf30ad6`.
- Verification on the candidate: `bash scripts/check-consistency.sh` GREEN; `npm run
  build` clean; `npm test` 84/84; dry-run confirms that omitting `--variety` and
  `--max-mode` leaves the request body unchanged, so no recorded run-id changes hash.
- Carried caveat for the release notes: `--variety` maps onto a wire field name observed
  by a third party and never reproduced here. It is marked as such in the code, the CLI
  README and the knowledge canon. Anyone cutting this release should know that one flag
  rests on weaker evidence than the rest.
release_handoff:
- Candidate version: `0.4.0`
- Candidate commit: `bf30ad6`
- Supersedes the iteration-2 handoff, which named `085e23e`. That instruction is
  retracted for the same reason the iteration-1 one was: acting on it would ship a build
  that predates the V6 work.
- Human-only action after review: create an annotated tag `v0.4.0` at the candidate
  commit, then push that tag. The existing trusted tag workflow performs npm
  publication; do not invoke `npm publish` directly.
next_step: none; candidate is ready for explicit human release authorization.
stop_reason: release_candidate_ready
