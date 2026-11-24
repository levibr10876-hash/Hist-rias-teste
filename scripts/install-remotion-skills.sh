#!/bin/sh
set -eu

root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
ref=a3f4098a2afd0e13f6a6f8c8760e275f75457ea9
temp=$(mktemp -d)
trap 'rm -rf "$temp"' EXIT
git -C "$temp" init -q
git -C "$temp" fetch --quiet --depth 1 https://github.com/remotion-dev/skills.git "$ref"
git -C "$temp" checkout --quiet --detach FETCH_HEAD
test "$(git -C "$temp" rev-parse HEAD)" = "$ref"

mkdir -p "$root/.agents/skills" "$root/.claude/skills"
for name in remotion-best-practices remotion-render remotion-captions; do
  target="$root/.agents/skills/$name"
  if [ ! -e "$target" ] && [ ! -L "$target" ]; then
    cp -R "$temp/skills/$name" "$target"
  fi
  claude="$root/.claude/skills/$name"
  if [ ! -e "$claude" ] && [ ! -L "$claude" ]; then
    ln -s "../../.agents/skills/$name" "$claude"
  fi
  test -f "$target/SKILL.md"
  test -f "$claude/SKILL.md"
done
