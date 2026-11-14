# Apna Ghar Knowledge Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a persistent, MCP-queryable basic-memory knowledge base for Apna Ghar, backed by a private GitHub repo, that auto-regenerates via a reviewable PR whenever the Apna Ghar code is pushed.

**Architecture:** A dedicated basic-memory project (`apna-ghar`) whose Markdown folder *is* a Git repo pushed to a private GitHub repo `apna-ghar-knowledge`. Four cross-linked notes (architecture, domain model, key decisions, gotchas) plus an index are auto-extracted from the codebase and human-reviewed once. A `pre-push` git hook on the Apna Ghar repo launches a detached regeneration script that diffs the code since the last sync, has headless Claude update the notes, re-indexes, and opens a PR on the knowledge repo.

**Tech Stack:** basic-memory (Python, installed via `uv`), Claude Code CLI (`claude -p` headless), `gh` CLI, Git hooks, Git Bash shell scripting on Windows.

## Global Constraints

- **basic-memory project name:** `apna-ghar` (exact).
- **KB folder path:** `C:\Users\chirag\basic-memory-apna-ghar` (Git Bash: `/c/Users/chirag/basic-memory-apna-ghar`).
- **GitHub repo:** `apna-ghar-knowledge`, **private**, owner `chirushetty`.
- **Apna Ghar repo path:** `C:\AI Projects\project\Apna Ghar` (Git Bash: `/c/AI Projects/project/Apna Ghar` — contains a space, always quote).
- **Apna Ghar default branch:** `main`.
- **Regen model:** `haiku` (fast/cheap) via `--model haiku`.
- **PATH requirement:** every script must prepend `$HOME/.local/bin` so `basic-memory`, `uv`, `claude`, and `gh` resolve.
- **TLS install constraint:** any future `uv`/pip install on this machine must use `--native-tls --no-build` with `SSL_CERT_FILE=$HOME/.local/share/corp-ca-bundle.pem` (network does TLS interception).
- **Notes are stable/high-value only:** architecture, domain model, key decisions, gotchas. No volatile endpoint/schema dumps that duplicate code.
- **Regen never writes to `main` of the KB repo directly** — always via a `kb-sync/*` branch + PR.
- **Trigger is push-only**, filtered to source changes (`apna-ghar-api/src/**/*.cs`, `apna-ghar-frontend/src/**`); never per-commit or per-save.

---

### Task 1: Create the basic-memory project and its Git repo

**Files:**
- Create dir: `C:\Users\chirag\basic-memory-apna-ghar\`
- Create: `C:\Users\chirag\basic-memory-apna-ghar\.gitignore`
- Create: `C:\Users\chirag\basic-memory-apna-ghar\README.md`

**Interfaces:**
- Produces: a registered basic-memory project named `apna-ghar` rooted at the KB folder; a Git repo initialized in that folder. Later tasks write notes into `context/` under it and read `.last-synced-sha` from its root.

- [ ] **Step 1: Create the folder and register the basic-memory project**

```bash
export PATH="$HOME/.local/bin:$PATH"
mkdir -p /c/Users/chirag/basic-memory-apna-ghar
basic-memory project add apna-ghar "C:\\Users\\chirag\\basic-memory-apna-ghar"
```

- [ ] **Step 2: Verify the project is registered**

Run:
```bash
export PATH="$HOME/.local/bin:$PATH"
basic-memory project list
```
Expected: output lists a project named `apna-ghar` with path `C:\Users\chirag\basic-memory-apna-ghar`.

- [ ] **Step 3: Write `.gitignore`**

Create `C:\Users\chirag\basic-memory-apna-ghar\.gitignore`:
```gitignore
# basic-memory local index / db — never commit
.basic-memory/
*.db
*.db-shm
*.db-wal
# regen runtime artifacts
.regen.lock
.regen.log
```

- [ ] **Step 4: Write `README.md`**

Create `C:\Users\chirag\basic-memory-apna-ghar\README.md`:
```markdown
# Apna Ghar Knowledge Base

Persistent context for the Apna Ghar project, stored as basic-memory notes.

- Live context: queried by Claude via the basic-memory MCP (project `apna-ghar`).
- Notes live in `context/`: architecture-overview, domain-model,
  key-decisions, gotchas, index.
- Auto-regenerated on push to the Apna Ghar repo (see `scripts/regenerate-kb.sh`),
  landing as a `kb-sync/*` PR for review.
- `.last-synced-sha` tracks the last Apna Ghar commit reflected in these notes.

Do not edit `main` directly for auto-generated updates — review the PR instead.
```

- [ ] **Step 5: Initialize the Git repo**

```bash
cd /c/Users/chirag/basic-memory-apna-ghar
git init -b main
git add .gitignore README.md
git commit -m "chore: initialize Apna Ghar knowledge base repo"
```

- [ ] **Step 6: Verify**

Run: `cd /c/Users/chirag/basic-memory-apna-ghar && git log --oneline && ls -a`
Expected: one commit; `.gitignore` and `README.md` present; `.git/` present.

---

### Task 2: Auto-extract the four notes + index, then human review

**Files:**
- Create: `C:\Users\chirag\basic-memory-apna-ghar\context\architecture-overview.md`
- Create: `C:\Users\chirag\basic-memory-apna-ghar\context\domain-model.md`
- Create: `C:\Users\chirag\basic-memory-apna-ghar\context\key-decisions.md`
- Create: `C:\Users\chirag\basic-memory-apna-ghar\context\gotchas.md`
- Create: `C:\Users\chirag\basic-memory-apna-ghar\context\index.md`

**Interfaces:**
- Consumes: the registered `apna-ghar` project from Task 1.
- Produces: five Markdown notes in `context/`, cross-linked via `[[wiki-links]]`, indexed by basic-memory. These are the files headless Claude edits during regeneration (Task 4).

- [ ] **Step 1: Read the codebase to gather material**

Read these to ground the notes (do not guess — quote from source):
- API entry/config: `apna-ghar-api/src/ApnaGhar.Api/Program.cs`
- Entities: `apna-ghar-api/src/ApnaGhar.Api/Entities/` (`Property.cs`, `PropertyImage.cs`, `PropertyAmenity.cs`, `User.cs`, `Enums.cs`)
- Data: `apna-ghar-api/src/ApnaGhar.Api/Data/ApnaGharDbContext.cs`, `Data/Repositories/`, `Data/Seed/`
- Services: `Services/PropertyService.cs`, `Services/AuthService.cs`
- Auth: `Auth/TokenService.cs`, `Auth/JwtOptions.cs`, `Auth/CurrentUser.cs`
- Controllers: `Controllers/PropertiesController.cs`, `Controllers/AuthController.cs`, `Controllers/MetaController.cs`
- Storage: `Storage/` (image handling)
- Validators: `Validators/`
- Frontend: `apna-ghar-frontend/src/app/`, `src/components/`, `src/lib/`, `src/types/`
- Existing design docs: `docs/superpowers/specs/2026-06-13-dotnet-backend-design.md`
- Recent history: `git -C "/c/AI Projects/project/Apna Ghar" log --oneline -30`

- [ ] **Step 2: Write `architecture-overview` note**

```bash
export PATH="$HOME/.local/bin:$PATH"
cat <<'EOF' | basic-memory --project apna-ghar tool write-note --title "Architecture Overview" --folder context
# Architecture Overview

<!-- Replace this scaffold with real, sourced content from Step 1.
     Keep it stable/high-level. Cover: -->

## System shape
- .NET 10 Web API (`apna-ghar-api`) + Next.js frontend (`apna-ghar-frontend`).
- How they communicate (REST, base URL/config in `src/lib`).

## API layers
- Controllers -> Services -> Repositories/DbContext (EF Core + SQLite).
- Auth via JWT (`Auth/TokenService.cs`), validation via FluentValidation (`Validators/`).

## Frontend shape
- App Router pages (`src/app`), components (`src/components`), API client (`src/lib`), shared types (`src/types`).

## Relations
- Depends on the domain in [[Domain Model]].
- Rationale for choices in [[Key Decisions]].
EOF
```
Then edit the created file to replace the scaffold with accurate, sourced detail.

- [ ] **Step 3: Write `domain-model` note**

```bash
export PATH="$HOME/.local/bin:$PATH"
cat <<'EOF' | basic-memory --project apna-ghar tool write-note --title "Domain Model" --folder context
# Domain Model

<!-- Replace scaffold with real content from Entities + DbContext. Cover: -->

## What Apna Ghar is
- (Product summary: property listings platform — confirm from code/docs.)

## Core entities
- Property, PropertyImage, PropertyAmenity, User (+ enums in `Entities/Enums.cs`).
- Relationships (one Property has many images/amenities; ownership by User).

## Business rules
- (e.g., listing status, ownership checks, image constraints — sourced from services/validators.)

## Relations
- Realized by the code described in [[Architecture Overview]].
EOF
```
Then edit to replace the scaffold with accurate detail from `Entities/` and `ApnaGharDbContext.cs`.

- [ ] **Step 4: Write `key-decisions` note**

```bash
export PATH="$HOME/.local/bin:$PATH"
cat <<'EOF' | basic-memory --project apna-ghar tool write-note --title "Key Decisions" --folder context
# Key Decisions

<!-- The WHY behind choices. Source hints from git history + code. Cover: -->

## Test-first backend
- (Why TDD; where tests live: `tests/ApnaGhar.Api.Tests`.)

## Atomic property update
- (Commit `0235887` — atomic update + image-upload orphan cleanup. Explain the problem it solved.)

## Image right-sizing & lazy loading
- (Commit `418662f` — perf: right-size property images and lazy-load gallery.)

## Auth approach
- (JWT via `TokenService`; why JWT over alternatives.)

## Relations
- Constraints show up as [[Gotchas]].
EOF
```
Then edit to replace the scaffold with accurate rationale. **This note is the highest-value target for human review.**

- [ ] **Step 5: Write `gotchas` note**

```bash
export PATH="$HOME/.local/bin:$PATH"
cat <<'EOF' | basic-memory --project apna-ghar tool write-note --title "Gotchas" --folder context
# Gotchas

<!-- Pitfalls when working on Apna Ghar. Cover real ones found in code/tests: -->

- Image uploads: orphan cleanup on failed/updated property writes.
- SQLite specifics / migrations (`Migrations/`).
- Auth/JWT config expectations (`JwtOptions`, env/config keys).
- Frontend<->API base URL/config coupling.

## Relations
- Rooted in [[Key Decisions]] and [[Architecture Overview]].
EOF
```
Then edit to replace the scaffold with accurate, sourced gotchas.

- [ ] **Step 6: Write `index` note**

```bash
export PATH="$HOME/.local/bin:$PATH"
cat <<'EOF' | basic-memory --project apna-ghar tool write-note --title "Apna Ghar Index" --folder context
# Apna Ghar — Knowledge Base Index

Start here. This knowledge base captures stable, high-value context for the
Apna Ghar project.

- [[Architecture Overview]] — how the API and frontend fit together.
- [[Domain Model]] — entities, relationships, business rules.
- [[Key Decisions]] — the why behind notable choices.
- [[Gotchas]] — pitfalls when working on the codebase.

Volatile detail (exact endpoints, schemas, file paths) intentionally lives in
the code, not here.
EOF
```

- [ ] **Step 7: Sync and verify the notes indexed**

Run:
```bash
export PATH="$HOME/.local/bin:$PATH"
basic-memory --project apna-ghar sync --verbose
basic-memory --project apna-ghar tool search-notes --query "architecture"
```
Expected: sync reports 5 files; search returns the Architecture Overview note.

- [ ] **Step 8: Human review gate**

Present the five notes to the user (paste `context/*.md`). The user confirms
accuracy — especially `key-decisions` and `gotchas`. Apply corrections, then
re-run Step 7. **Do not proceed to Task 3 until the user approves the content.**

- [ ] **Step 9: Commit the notes**

```bash
cd /c/Users/chirag/basic-memory-apna-ghar
git add context
git commit -m "docs: add initial Apna Ghar knowledge base notes"
```

---

### Task 3: Publish the knowledge base to a private GitHub repo

**Files:**
- No new files; creates the remote `apna-ghar-knowledge` and pushes existing commits.

**Interfaces:**
- Consumes: the local Git repo from Tasks 1–2.
- Produces: remote `https://github.com/chirushetty/apna-ghar-knowledge` with `main` populated. Later tasks push `kb-sync/*` branches and open PRs against this remote.

- [ ] **Step 1: Create the private repo and push**

```bash
cd /c/Users/chirag/basic-memory-apna-ghar
gh repo create apna-ghar-knowledge --private --source=. --remote=origin --push
```

- [ ] **Step 2: Verify**

Run: `cd /c/Users/chirag/basic-memory-apna-ghar && gh repo view --json name,visibility,defaultBranchRef -q '.name, .visibility, .defaultBranchRef.name'`
Expected: `apna-ghar-knowledge`, `PRIVATE`, `main`.

---

### Task 4: Write the regeneration script

**Files:**
- Create: `C:\Users\chirag\basic-memory-apna-ghar\scripts\regenerate-kb.sh`

**Interfaces:**
- Consumes: the `apna-ghar` project, the notes in `context/`, `.last-synced-sha`, the Apna Ghar repo at the fixed path.
- Produces: an executable script `regenerate-kb.sh` that, given the current Apna Ghar HEAD, updates notes and opens a `kb-sync/*` PR. Invoked by the hook (Task 5) and the fallback command (Task 6). Accepts no arguments; reads all state from disk.

- [ ] **Step 1: Write the script**

Create `C:\Users\chirag\basic-memory-apna-ghar\scripts\regenerate-kb.sh`:
```bash
#!/usr/bin/env bash
# Regenerate the Apna Ghar knowledge base from code changes since last sync.
# Detached, idempotent-ish, safe: opens a PR, never writes KB main directly.
set -uo pipefail

export PATH="$HOME/.local/bin:$PATH"

KB_DIR="/c/Users/chirag/basic-memory-apna-ghar"
APP_DIR="/c/AI Projects/project/Apna Ghar"
PROJECT="apna-ghar"
MODEL="haiku"
LOCK="$KB_DIR/.regen.lock"
LOG="$KB_DIR/.regen.log"
MARKER="$KB_DIR/.last-synced-sha"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >>"$LOG"; }

# --- Single-instance lock (stale after 30 min) ---
if [ -d "$LOCK" ]; then
  if [ -n "$(find "$LOCK" -mmin +30 2>/dev/null)" ]; then
    log "Removing stale lock"; rm -rf "$LOCK"
  else
    log "Another regen is running; exiting"; exit 0
  fi
fi
mkdir "$LOCK" 2>/dev/null || { log "Could not acquire lock; exiting"; exit 0; }
trap 'rm -rf "$LOCK"' EXIT

# --- Determine change range ---
HEAD_SHA="$(git -C "$APP_DIR" rev-parse HEAD)"
if [ -f "$MARKER" ]; then LAST_SHA="$(cat "$MARKER")"; else LAST_SHA=""; fi
if [ "$LAST_SHA" = "$HEAD_SHA" ]; then log "No new commits ($HEAD_SHA); exiting"; exit 0; fi

RANGE="${LAST_SHA:+$LAST_SHA..}$HEAD_SHA"
CHANGED="$(git -C "$APP_DIR" diff --name-only $RANGE -- \
  'apna-ghar-api/src/**/*.cs' 'apna-ghar-frontend/src/**' \
  ':(exclude)**/bin/**' ':(exclude)**/obj/**' ':(exclude)**/.next/**' 2>/dev/null)"
if [ -z "$CHANGED" ]; then
  log "No relevant source changes in $RANGE; advancing marker only"
  echo "$HEAD_SHA" >"$MARKER"
  git -C "$KB_DIR" add "$(basename "$MARKER")" >/dev/null 2>&1
  git -C "$KB_DIR" commit -m "chore: advance sync marker (no source changes)" >/dev/null 2>&1
  git -C "$KB_DIR" push origin main >/dev/null 2>&1
  exit 0
fi
log "Relevant changes: $(echo "$CHANGED" | tr '\n' ' ')"

DIFF="$(git -C "$APP_DIR" diff $RANGE -- $CHANGED 2>/dev/null | head -c 60000)"

# --- Have headless Claude update the notes ---
PROMPT="You are updating the Apna Ghar knowledge base in ./context/*.md.
The following source changes were pushed to the Apna Ghar repo. Update ONLY
the affected notes (architecture-overview, domain-model, key-decisions,
gotchas, index) to stay accurate. Keep content stable/high-value; do not add
volatile endpoint/schema dumps. Preserve [[wiki-links]] and frontmatter.
If nothing meaningful changed for the notes, make no edits.

Changed files:
$CHANGED

Diff (truncated):
$DIFF"

cd "$KB_DIR" || { log "cd KB_DIR failed"; exit 1; }
claude -p "$PROMPT" \
  --model "$MODEL" \
  --permission-mode acceptEdits \
  --allowedTools "Read" "Edit" "Bash(basic-memory:*)" \
  --add-dir "$APP_DIR" \
  >>"$LOG" 2>&1

basic-memory --project "$PROJECT" sync >>"$LOG" 2>&1

# --- If notes changed, open a PR; always advance the marker ---
if [ -n "$(git -C "$KB_DIR" status --porcelain context)" ]; then
  BRANCH="kb-sync/$(date '+%Y%m%d-%H%M%S')"
  git -C "$KB_DIR" checkout -b "$BRANCH" >>"$LOG" 2>&1
  echo "$HEAD_SHA" >"$MARKER"
  git -C "$KB_DIR" add context "$(basename "$MARKER")" >>"$LOG" 2>&1
  git -C "$KB_DIR" commit -m "docs: sync KB to Apna Ghar $HEAD_SHA" >>"$LOG" 2>&1
  git -C "$KB_DIR" push -u origin "$BRANCH" >>"$LOG" 2>&1
  gh --repo chirushetty/apna-ghar-knowledge pr create \
    --base main --head "$BRANCH" \
    --title "KB sync: Apna Ghar $HEAD_SHA" \
    --body "Auto-generated knowledge base update from Apna Ghar changes ($RANGE).\n\nChanged files:\n$CHANGED" \
    >>"$LOG" 2>&1
  git -C "$KB_DIR" checkout main >>"$LOG" 2>&1
  log "Opened PR from $BRANCH"
else
  log "Claude made no note edits; advancing marker on main"
  echo "$HEAD_SHA" >"$MARKER"
  git -C "$KB_DIR" add "$(basename "$MARKER")" >>"$LOG" 2>&1
  git -C "$KB_DIR" commit -m "chore: advance sync marker to $HEAD_SHA" >>"$LOG" 2>&1
  git -C "$KB_DIR" push origin main >>"$LOG" 2>&1
fi
log "Done"
```

- [ ] **Step 2: Make it executable and syntax-check**

```bash
chmod +x /c/Users/chirag/basic-memory-apna-ghar/scripts/regenerate-kb.sh
bash -n /c/Users/chirag/basic-memory-apna-ghar/scripts/regenerate-kb.sh && echo "SYNTAX OK"
```
Expected: `SYNTAX OK`.

- [ ] **Step 3: Dry-run with the marker already at HEAD (no-op path)**

```bash
export PATH="$HOME/.local/bin:$PATH"
git -C "/c/AI Projects/project/Apna Ghar" rev-parse HEAD > /c/Users/chirag/basic-memory-apna-ghar/.last-synced-sha
bash /c/Users/chirag/basic-memory-apna-ghar/scripts/regenerate-kb.sh
tail -3 /c/Users/chirag/basic-memory-apna-ghar/.regen.log
```
Expected: log ends with `No new commits ...; exiting` (proves lock, marker read, and early-exit all work without spending tokens).

- [ ] **Step 4: Commit the script**

```bash
cd /c/Users/chirag/basic-memory-apna-ghar
git add scripts/regenerate-kb.sh
git commit -m "feat: add KB regeneration script"
git push origin main
```

---

### Task 5: Install the pre-push hook on the Apna Ghar repo

**Files:**
- Create (tracked, for reproducibility): `C:\AI Projects\project\Apna Ghar\scripts\git-hooks\pre-push`
- Create (tracked): `C:\AI Projects\project\Apna Ghar\scripts\git-hooks\install.sh`
- Install (not tracked): `C:\AI Projects\project\Apna Ghar\.git\hooks\pre-push`
- Create: `C:\Users\chirag\basic-memory-apna-ghar\.last-synced-sha` (seed)

**Interfaces:**
- Consumes: `regenerate-kb.sh` from Task 4.
- Produces: a `pre-push` hook that launches regeneration detached and returns 0 immediately.

- [ ] **Step 1: Write the tracked hook source**

Create `C:\AI Projects\project\Apna Ghar\scripts\git-hooks\pre-push`:
```bash
#!/usr/bin/env bash
# Apna Ghar pre-push hook: fire-and-forget KB regeneration. Never blocks push.
REGEN="/c/Users/chirag/basic-memory-apna-ghar/scripts/regenerate-kb.sh"
if [ -x "$REGEN" ]; then
  # Detach fully so the push is never delayed or affected by regen outcome.
  ( setsid bash "$REGEN" >/dev/null 2>&1 & ) 2>/dev/null \
    || ( nohup bash "$REGEN" >/dev/null 2>&1 & )
fi
exit 0
```

- [ ] **Step 2: Write the install script**

Create `C:\AI Projects\project\Apna Ghar\scripts\git-hooks\install.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cp "$REPO_ROOT/scripts/git-hooks/pre-push" "$REPO_ROOT/.git/hooks/pre-push"
chmod +x "$REPO_ROOT/.git/hooks/pre-push"
echo "Installed pre-push hook."
```

- [ ] **Step 3: Install the hook**

```bash
chmod +x "/c/AI Projects/project/Apna Ghar/scripts/git-hooks/install.sh"
bash "/c/AI Projects/project/Apna Ghar/scripts/git-hooks/install.sh"
```
Expected: `Installed pre-push hook.`

- [ ] **Step 4: Seed the sync marker to current HEAD**

```bash
git -C "/c/AI Projects/project/Apna Ghar" rev-parse HEAD \
  > /c/Users/chirag/basic-memory-apna-ghar/.last-synced-sha
cd /c/Users/chirag/basic-memory-apna-ghar
git add .last-synced-sha
git commit -m "chore: seed sync marker at current Apna Ghar HEAD"
git push origin main
```

- [ ] **Step 5: Verify the hook is installed and valid**

Run:
```bash
bash -n "/c/AI Projects/project/Apna Ghar/.git/hooks/pre-push" && echo "HOOK OK"
ls -l "/c/AI Projects/project/Apna Ghar/.git/hooks/pre-push"
```
Expected: `HOOK OK`; file exists and is executable.

- [ ] **Step 6: Commit the tracked hook sources**

```bash
cd "/c/AI Projects/project/Apna Ghar"
git add scripts/git-hooks/pre-push scripts/git-hooks/install.sh
git commit -m "chore: add pre-push KB-sync hook and installer"
```

---

### Task 6: Manual fallback command

**Files:**
- Create: `C:\AI Projects\project\Apna Ghar\.claude\commands\update-apna-ghar-kb.md`

**Interfaces:**
- Consumes: `regenerate-kb.sh` from Task 4.
- Produces: a `/update-apna-ghar-kb` slash command that runs the same regeneration on demand.

- [ ] **Step 1: Write the slash command**

Create `C:\AI Projects\project\Apna Ghar\.claude\commands\update-apna-ghar-kb.md`:
```markdown
---
description: Regenerate the Apna Ghar knowledge base from recent code changes (manual fallback for the pre-push hook).
---

Run the knowledge base regeneration script and report the result.

1. Run:
   `bash /c/Users/chirag/basic-memory-apna-ghar/scripts/regenerate-kb.sh`
2. Then show the last 15 lines of the log:
   `tail -15 /c/Users/chirag/basic-memory-apna-ghar/.regen.log`
3. If a PR was opened, run `gh --repo chirushetty/apna-ghar-knowledge pr list`
   and report the new PR link. If no changes were needed, say so.
```

- [ ] **Step 2: Verify the command file is discoverable**

Run: `ls "/c/AI Projects/project/Apna Ghar/.claude/commands/update-apna-ghar-kb.md" && head -3 "/c/AI Projects/project/Apna Ghar/.claude/commands/update-apna-ghar-kb.md"`
Expected: file exists; frontmatter `description:` line prints.

- [ ] **Step 3: Commit**

```bash
cd "/c/AI Projects/project/Apna Ghar"
git add .claude/commands/update-apna-ghar-kb.md
git commit -m "feat: add /update-apna-ghar-kb fallback command"
```

---

### Task 7: End-to-end verification

**Files:** none (exercises the full pipeline).

**Interfaces:**
- Consumes: everything from Tasks 1–6.
- Produces: evidence that a push regenerates notes and opens a PR.

- [ ] **Step 1: Make a small, real source change on a throwaway branch**

```bash
cd "/c/AI Projects/project/Apna Ghar"
git checkout -b kb-e2e-test
# Append a harmless XML doc comment to a controller to create a real src diff.
printf '\n// KB e2e test marker\n' >> apna-ghar-api/src/ApnaGhar.Api/Controllers/MetaController.cs
git add apna-ghar-api/src/ApnaGhar.Api/Controllers/MetaController.cs
git commit -m "test: kb e2e marker"
```

- [ ] **Step 2: Push and let the hook fire**

```bash
cd "/c/AI Projects/project/Apna Ghar"
git push -u origin kb-e2e-test
```
Expected: push succeeds immediately (hook is non-blocking).

- [ ] **Step 3: Watch the regen log until it finishes**

Run (poll a few times over ~1–3 min; headless Claude takes time):
```bash
tail -20 /c/Users/chirag/basic-memory-apna-ghar/.regen.log
```
Expected: log progresses to either `Opened PR from kb-sync/...` or `Claude made no note edits; advancing marker`.

- [ ] **Step 4: Confirm the PR (or marker advance)**

```bash
export PATH="$HOME/.local/bin:$PATH"
gh --repo chirushetty/apna-ghar-knowledge pr list
cat /c/Users/chirag/basic-memory-apna-ghar/.last-synced-sha
```
Expected: either a `kb-sync/*` PR is listed, or (if Claude judged no note change needed) the marker equals the test commit SHA. Both are valid outcomes proving the pipeline ran.

- [ ] **Step 5: Clean up the test artifacts**

The test change is committed on `kb-e2e-test` only, so `main`'s working tree
is already clean — no reset needed. Just drop the branch and any throwaway PR:
```bash
cd "/c/AI Projects/project/Apna Ghar"
git checkout main
git branch -D kb-e2e-test
git push origin --delete kb-e2e-test
# Close the throwaway KB PR if one was opened:
# gh --repo chirushetty/apna-ghar-knowledge pr close <number> --delete-branch
```
Then reset the marker to `main` HEAD so future runs start clean:
```bash
git -C "/c/AI Projects/project/Apna Ghar" rev-parse HEAD \
  > /c/Users/chirag/basic-memory-apna-ghar/.last-synced-sha
cd /c/Users/chirag/basic-memory-apna-ghar && git add .last-synced-sha \
  && git commit -m "chore: reset sync marker after e2e test" && git push origin main
```

---

## Notes for the implementer

- **MCP visibility:** the basic-memory MCP tools only refresh in a Claude session after a reload; Tasks 1–2 use the `basic-memory` CLI directly, so no reload is needed mid-plan.
- **Windows detach:** the hook tries `setsid` then falls back to `nohup`; under Git Bash one of these detaches the regen so the push returns instantly. If neither is present, the regen still runs but may briefly hold the terminal — acceptable, but prefer Git Bash with coreutils.
- **Token spend:** only Task 7 and real future pushes invoke headless Claude. Tasks 1–6 spend no model tokens except the human-in-the-loop note authoring in Task 2 (done by the implementing session, not headless).
- **If the hook proves flaky**, `/update-apna-ghar-kb` (Task 6) is the reliable manual path and exercises identical logic.
