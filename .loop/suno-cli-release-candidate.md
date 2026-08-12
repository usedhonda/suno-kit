# LOOP: suno-cli next public release candidate

PROJECT PROFILE:
- Public npm CLI package: `@usedhonda/suno-cli`; registry `latest` is the
  release baseline, not a claim that current `main` is published.
- The package has read-only retrieval commands and a credit-consuming live-create
  path. This loop verifies only local, no-network release-candidate behavior.
- Root consistency checks protect the knowledge corpus separately from the npm
  package checks; neither gate substitutes for the other.

GOAL: turn the unreleased `suno-cli` changes after npm `@usedhonda/suno-cli@0.3.0`
into one verified, public-safe release candidate. The loop stops before any tag,
push, npm publish, paid create, browser mint, or credential use.

WHY THIS LOOP EXISTS:
- The registry's `latest` is `0.3.0`, while `main` contains unreleased live-create
  safety and diagnostic changes.
- A public user must not receive documentation that says a CAPTCHA token is always
  required when the current normal live path instead sends null CAPTCHA fields and
  fails closed only when the server requires CAPTCHA.
- A green source test alone does not prove the npm artifact, public instructions,
  and release handoff agree.

SUCCESS CRITERIA (all required):
1. `suno-cli/package.json` has a valid SemVer version greater than the registry
   `latest`; the selected version and justification are recorded in state. Default
   is the next patch unless the actual public contract requires a larger bump.
2. Root README and `suno-cli/README.md` agree with the current contract:
   ordinary `create --live` without explicit CAPTCHA values uses null CAPTCHA
   fields; a server CAPTCHA rejection is fail-closed (`blocked_captcha`); explicit
   token/provider remains an advanced fallback; `--mint-check` is diagnostic only.
3. Build, tests, CLI help, and a no-network dry-run pass from the built package.
4. `npm pack --dry-run` contains only intentional distributable files and excludes
   credentials, runtime data, `node_modules`, source-only private artifacts, and
   local instruction overrides.
5. Tracked public files pass the focused secret/public-safety scan; intentional
   redaction test fixtures are not treated as leaked values.
6. `bash scripts/check-consistency.sh` remains `GATE: GREEN`.
7. State ends with a release handoff containing the proposed version, commit SHA,
   artifact evidence, and exact human-only publish action. No tag or publish is
   performed by this loop.

VERIFY (fastest useful order; stop at first red):
1. `git diff --check`
2. `cd suno-cli && npm run build`
3. `cd suno-cli && npm test`
4. `node suno-cli/dist/src/cli.js --help`
5. `node suno-cli/dist/src/cli.js create --dry-run --title "release candidate probe" --style "lo-fi piano"`
6. `cd suno-cli && npm pack --dry-run`
7. `bash scripts/check-consistency.sh`

STATE FILE: `.loop/suno-cli-release-candidate-state.md`
- Read it before every iteration; resume its recorded release candidate rather
  than starting a different release.
- Record baseline registry version, selected candidate version, touched files,
  every verification result, artifact allowlist decision, and stop reason.

EACH ITERATION:
1. Read this contract and state. Compare `npm view @usedhonda/suno-cli version`
   with local `suno-cli/package.json`; read the release-relevant diff since the
   published `v0.3.0` tag before deciding scope.
   The t=0 baseline is evidence only: it may establish known green checks, but it
   can never satisfy a candidate version, artifact inspection, documentation
   alignment, and release handoff by itself.
2. Identify exactly one failed success criterion or stale public claim. Make the
   smallest source, package, documentation, or focused-test change that fixes it.
3. Do not use a test to bless a false public claim. For a changed public contract,
   update its nearby documentation and one focused regression assertion together.
4. Run the affected check, then VERIFY in order. Inspect the package file list
   directly; do not infer it from `.gitignore`.
5. Commit only the candidate change after all criteria are green. Record the
   candidate handoff, then print `FINAL`. Otherwise print `ITERATING`.

STOP WHEN (write `stop_reason` in state):
- `release_candidate_ready`: every success criterion is green and the handoff is
  complete. Report the candidate; wait for explicit human authorization to tag
  and publish.
- `scope_boundary`: correctness requires an API, policy, pricing, ToS, or release
  version decision that cannot be derived from the repository and registry.
- `no_progress`: the same criterion remains red after two evidence-backed scoped
  attempts.
- `regression`: a previously green criterion turns red; freeze the candidate and
  report the exact diff.
- `iteration_cap`: four iterations are reached without a ready candidate.

RULES:
- This is a release-candidate loop, never a self-publish loop. Do not create tags,
  push, invoke `npm publish`, or edit `.github/workflows/publish.yml`.
- Never run live create, browser mint, auth inspection, or use cookies/JWTs.
- Never edit `.gitignore` or `scripts/check-consistency.sh` to satisfy a criterion.
- Preserve normal live null-CAPTCHA behavior, explicit-token fallback, budgets,
  ledger idempotency, redaction, and the CDP diagnostic option.
- Do not stage `node_modules`, `dist`, `.demo-tmp/`, runtime data, credentials, or
  untracked `suno-cli/AGENTS.md` / `suno-cli/CLAUDE.md`.
- Maker != checker: inspect the final diff and repeat one representative source
  check plus the full VERIFY sequence before declaring the candidate ready.
