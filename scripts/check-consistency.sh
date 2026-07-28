#!/usr/bin/env bash
# suno-kit consistency gate (Loop 1) — deterministic, positive-presence checks.
# PASS = exit 0 (prints "GATE: GREEN"). FAIL = exit 1 (prints "GATE: RED" + one FAIL line per broken invariant).
# This is the frozen checker. maker != checker: never edit this to make the loop pass.
# Runbook: docs/loop/consistency-audit.md
set -uo pipefail
cd "$(dirname "$0")/.." || exit 2   # repo root

rc=0
fail() { echo "FAIL $*"; rc=1; }

yt="skills/suno/knowledge/yaml_template.md"
sk="skills/suno/SKILL.md"
sa="mygpts/style-analyzer/instructions.md"
lw="mygpts/lyrics-writer/instructions.md"

# C1 — canonical char-limits literally present in the canonical files (120/400/200/4500/5000 etc.)
for s in "4-7 descriptors" "120文字以内" "2 genre pairs" "4500 chars" "400-600 chars" "200 characters" "2-5 items" "5000"; do
  grep -qF -- "$s" "$yt" || fail "C1 yaml_template missing canonical string: $s"
done
for s in "コアタグ 120文字以内" "400以内" "200文字以内" "5000文字"; do
  grep -qF -- "$s" "$sk" || fail "C1 SKILL missing canonical string: $s"
done

# C2 — legacy files carry their LEGACY marker AND point to the canonical source
{ grep -qF -- "MAINTAINER NOTE" "$sa" && grep -qF -- "NOT the project canonical" "$sa" && grep -qF -- "skills/suno/knowledge/" "$sa"; } \
  || fail "C2 style-analyzer missing legacy marker / canonical pointer"
dp="docs/prompt.md"   # gitignored (non-public); check only if present locally
if [ -f "$dp" ]; then
  { grep -qF -- "LEGACY" "$dp" && grep -qF -- "正本ではない" "$dp"; } || fail "C2 docs/prompt.md missing legacy marker"
fi

# C3 — gitignore boundary holds (strongest check; secret-leak guard).
# Existence-independent: assert the .gitignore rule exists AND nothing is tracked.
# (git check-ignore on a path only matches a dir-pattern when the dir exists on disk;
#  grepping .gitignore is robust whether or not the ignored dir is present.)
# CLAUDE.md and AGENTS.md are deliberately outside this boundary: 1d52155 published
# them as the tracked shared-instruction layer (public-safe by contract). Private
# instructions live in CLAUDE.local.md and .codex/config.toml, which stay ignored.
for p in "docs/" ".claude/" ".local" ".codex/"; do
  grep -qF -- "$p" .gitignore || fail "C3 .gitignore missing boundary entry: $p"
done
if git ls-files | grep -qE '^(docs/|\.claude/|\.local|\.codex/)'; then
  fail "C3 a boundary path is TRACKED in git (non-public content leaked)"
fi

# C4 — README + SKILL knowledge table reference every knowledge file; count is exactly 7
kn=0
for f in skills/suno/knowledge/*.md; do
  b=$(basename "$f"); kn=$((kn + 1))
  grep -qF -- "$b" README.md || fail "C4 README does not reference knowledge file: $b"
  grep -qF -- "$b" "$sk" || fail "C4 SKILL does not reference knowledge file: $b"
done
[ "$kn" -eq 7 ] || fail "C4 knowledge file count is $kn, expected 7 (update README + SKILL on change)"

# C5 — each agent/*.md `reference:` path resolves to a real file
for f in agent/*.md; do
  ref=$(grep -m1 -oE 'reference: *"[^"]+"' "$f" | sed -E 's/.*"([^"]+)".*/\1/')
  if [ -z "$ref" ]; then fail "C5 no reference: field in $f"; continue; fi
  ( cd agent && [ -f "$ref" ] ) || fail "C5 $f -> $ref does not resolve"
done

# C6 — no dangling knowledge/<x>.md cross-references in the PUBLIC surface (docs/ research notes excluded)
for tok in $(grep -rhoE 'knowledge/[a-z_]+\.md' --include='*.md' skills agent mygpts README.md SunoV5_Prompt_MASTER_REFERENCE.md 2>/dev/null | sort -u); do
  b=$(basename "$tok")
  [ -f "skills/suno/knowledge/$b" ] || fail "C6 dangling cross-reference: $tok"
done

# C7 — key invariant phrases present where required (regression tripwire; presence not semantics)
grep -qF -- "sacred" "$yt" || fail "C7 yaml_template lost lyrics-sacred phrase"
grep -qF -- "一字一句" "$sk" || fail "C7 SKILL lost Pattern-B sacred phrase"
grep -qF -- "一字一句" "$lw" || fail "C7 lyrics-writer lost sacred phrase"
for f in "$sk" "$yt" "$sa"; do
  grep -qiE 'english only|英語のみ|全て英語|100% english' "$f" || fail "C7 English-only phrase missing in $f"
done

echo "GATE: $([ $rc -eq 0 ] && echo GREEN || echo RED)"
exit $rc
