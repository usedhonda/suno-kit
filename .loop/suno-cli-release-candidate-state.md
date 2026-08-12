# suno-cli release candidate state

status: final
iteration: 1/4
published_version: 0.3.0
published_tag: v0.3.0
candidate_version: 0.3.1
baseline:
- Registry query on 2026-08-12 returned `@usedhonda/suno-cli` latest `0.3.0`.
- `main` contains unreleased CLI changes after `v0.3.0`, including normal live
  null-CAPTCHA submission, fail-closed CAPTCHA classification, and CDP diagnostic
  support.
- Baseline checks already observed on this revision: `npm test` 81 passed, root
  consistency gate GREEN, and `npm pack --dry-run` clean. Re-run them only after
  a candidate change or to establish final candidate evidence.
  These observations are t=0 evidence, not a release-candidate pass.
iteration_1:
- Scope: release the unreleased safety/diagnostic corrections after `v0.3.0` as a
  patch. No public command was removed; the root README was the only stale claim.
- Candidate change: `ff4416b7b857d2385ff98867b27979a97ef66506`
  (`release: prepare suno cli 0.3.1`). It updates package and lock versions,
  corrects the root live-create description, and adds the focused onboarding guard.
- Version decision: `0.3.1` is greater than registry `latest` `0.3.0` and is the
  smallest SemVer bump for compatible behavior and documentation corrections.
- Verification: `git diff --check` passed; `cd suno-cli && npm run build` passed;
  `cd suno-cli && npm test` passed (82/82); built `--help` returned JSON `ok:true`;
  isolated `create --dry-run` returned `ok:true`, `liveFire:false`, and redacted
  token fields; `npm pack --dry-run --json` produced 24 intended files only
  (`LICENSE`, package README, package.json, and `dist/src/**`); focused tracked
  secret scan was clean; `bash scripts/check-consistency.sh` returned `GATE: GREEN`.
- Package decision: browser diagnostic code is intentional because `--mint-check`
  remains a documented explicit diagnostic; no runtime state, credentials,
  `node_modules`, local overrides, or test files were in the package artifact.
release_handoff:
- Candidate version: `0.3.1`
- Candidate commit: `ff4416b7b857d2385ff98867b27979a97ef66506`
- Human-only action after review: push `main`, create annotated tag `v0.3.1` at
  the candidate commit, then push that tag. The existing trusted tag workflow
  performs npm publication; do not invoke `npm publish` directly.
- Not performed: tag creation, push, npm publish, live create, browser mint,
  authentication, or credential use.
next_step: none; candidate is ready for explicit human release authorization.
stop_reason: release_candidate_ready
