#!/usr/bin/env bash
# Install the /suno skill for every supported agent by symlinking this repo's
# canonical skill directory into each agent's skill folder.
#
#   bash scripts/install-skill.sh            install / repair
#   bash scripts/install-skill.sh --force    replace a real directory (backed up first)
#
# A symlink is used on purpose: the repo stays the single source of truth, and an
# edit here is live for both agents with no re-copy step.
set -u

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO/skills/suno"
FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

TARGETS="$HOME/.claude/skills/suno $HOME/.codex/skills/suno"

if [ ! -d "$SRC" ]; then
  echo "FAIL source skill not found: $SRC" >&2
  exit 2
fi

rc=0
for target in $TARGETS; do
  parent="$(dirname "$target")"
  agent="$(basename "$(dirname "$parent")")"

  if [ ! -d "$parent" ]; then
    # The agent is not installed on this machine. Skipping is correct, not an error.
    echo "SKIP  $agent: $parent does not exist (agent not installed?)"
    continue
  fi

  if [ -L "$target" ]; then
    current="$(readlink "$target")"
    if [ "$current" = "$SRC" ]; then
      echo "OK    $agent: already linked"
      continue
    fi
    ln -sfn "$SRC" "$target"
    echo "RELINK $agent: was -> $current"
    continue
  fi

  if [ -e "$target" ]; then
    # A real file or directory lives here. Never link into it: 'ln -s' would create
    # a nested link INSIDE the directory and still exit 0, leaving the stale copy
    # live while reporting success. Refuse unless the caller asked for --force.
    if [ "$FORCE" -eq 1 ]; then
      backup="$target.bak-$(date +%Y%m%d-%H%M%S)"
      mv "$target" "$backup" || { echo "FAIL  $agent: could not move aside $target" >&2; rc=1; continue; }
      ln -s "$SRC" "$target"
      echo "REPLACED $agent: previous contents moved to $backup"
    else
      echo "BLOCKED $agent: $target exists and is not a symlink." >&2
      echo "        Inspect it, then re-run with --force to back it up and replace it." >&2
      rc=1
    fi
    continue
  fi

  ln -s "$SRC" "$target"
  echo "LINKED $agent"
done

echo
echo "--- result ---"
for target in $TARGETS; do
  if [ -e "$target" ] || [ -L "$target" ]; then
    ls -ld "$target"
  else
    echo "(absent) $target"
  fi
done

exit "$rc"
