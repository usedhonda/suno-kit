# LOOP: suno-kit release readiness

GOAL: keep the published Suno knowledge surface and `suno-cli` release surface
consistent without weakening their independent gates.

SUCCESS CRITERIA (strict, no soft passes):
- `bash scripts/check-consistency.sh` exits 0 and prints `GATE: GREEN` with no `FAIL` line.
- `cd suno-cli && npm test` exits 0 with no failing test.
- Any change is scoped to the reported invariant or test failure; shared instruction files remain public-safe.

VERIFY - the gate (run fastest -> slowest; stop at first red):
1. `bash scripts/check-consistency.sh`
2. `cd suno-cli && npm test`

STATE FILE: `.loop/release-readiness-state.md`
- Read it before starting. This is a resume, not a restart.
- At each iteration append the gate result, the one scoped action, and the next step.

EACH ITERATION:
1. Re-read this contract and state, then run VERIFY.
2. If a gate is red, select one highest-impact reported invariant or test failure.
3. Search the affected surface, make one smallest evidence-backed change, and add a regression test only for an externally observable uncovered contract.
4. Re-run the affected gate, then the remaining VERIFY command. Record the result.
5. If all criteria pass, print `FINAL`; otherwise print `ITERATING`.

STOP WHEN (write `stop_reason` in state):
- `success`: both VERIFY commands pass.
- `iteration_cap`: 4 iterations reached.
- `no_progress`: the same failure remains after 2 scoped attempts.
- `scope_boundary`: the only repair requires an off-limits target or a policy decision.
- `regression`: a previously green gate becomes red after a change; freeze and report the diff.

RULES:
- The first VERIFY may honestly finish as `FINAL` with no edit.
- Never edit `scripts/check-consistency.sh` to satisfy its own gate.
- Never edit `.gitignore` without explicit user authorization.
- Do not weaken canonical char limits, remove a guard test, or replace a real check with a presence-only workaround.
- Treat `AGENTS.md` and `CLAUDE.md` as tracked public-safe shared instructions; do not add secrets, absolute paths, persona, or private workflow detail.
- Do not run browser mint/live create or send credentials as part of this loop.
- Do not stage runtime output, `node_modules`, `.demo-tmp/`, or untracked `suno-cli/AGENTS.md` / `suno-cli/CLAUDE.md`.
- Maker != checker: inspect the final diff and re-run the applicable gate before commit.
