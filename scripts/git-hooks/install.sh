#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cp "$REPO_ROOT/scripts/git-hooks/pre-push" "$REPO_ROOT/.git/hooks/pre-push"
chmod +x "$REPO_ROOT/.git/hooks/pre-push"
echo "Installed pre-push hook."
