# Apna Ghar Knowledge Base — Design

**Date:** 2026-07-18
**Status:** Approved (pending spec review)
**Author:** Brainstormed with Claude

## Problem

Every new Claude session starts cold with no memory of what Apna Ghar is,
how it's built, or why key decisions were made. Context has to be
re-explained each time. We want a persistent, queryable knowledge base so
that any Claude session already knows the Apna Ghar context — and a
versioned backup of that knowledge on GitHub.

## Goals

- A persistent knowledge base that any Claude session can query on demand.
- Captures **stable, high-value** context that code alone does not explain:
  architecture, domain model, key decisions, and gotchas.
- A versioned, portable backup of the knowledge on GitHub.
- Auto-regeneration: when the Apna Ghar code changes, the notes update
  (via a reviewable pull request), so the knowledge base does not drift
  stale.

## Non-Goals

- No per-file-save or per-commit triggers (push-only, to control cost).
- No volatile API/schema/endpoint reference that merely duplicates code
  (code stays the source of truth for those).
- No GitHub MCP — the existing `gh` CLI covers repo creation and pushing.
- No fully hands-off regeneration to `main` — regen lands as a PR for a
  light review gate.

## Tooling (already set up)

| Component | Status |
|-----------|--------|
| `uv` / `uvx` | Installed (0.11.29) at `C:\Users\chirag\.local\bin` |
| basic-memory package | Installed via `uv tool install --no-build basic-memory` |
| basic-memory MCP server | Registered at **user scope**, health check Connected |
| GitHub access | `gh` CLI, authenticated as `chirushetty` |
| Corp CA bundle | Exported to `~/.local/share/corp-ca-bundle.pem` (needed to get past the network's TLS interception during installs) |

**Install note:** the network does TLS interception with a CA cert that
newer OpenSSL rejects as malformed. `uv` installs must use
`--native-tls` + `--no-build` (wheels only) with `SSL_CERT_FILE` pointed at
the exported bundle. Record this for any future package installs.

## Architecture

### 1. Store & repo

- A dedicated **basic-memory project `apna-ghar`**, isolated from the default
  `main` project.
- The project's Markdown folder **is** the Git repo — no separate copy to
  keep in sync. Single source of truth.
- Proposed folder path: `C:\Users\chirag\basic-memory-apna-ghar`.
- Pushed to a new **private** GitHub repo **`apna-ghar-knowledge`** via `gh`.
- Two roles from one source:
  - **Live context** — queryable in any Claude session via the basic-memory
    MCP.
  - **Versioned backup / portable** — the same folder committed and pushed to
    GitHub.

### 2. Content — four cross-linked notes + index

Auto-extracted by Claude from the codebase (API + frontend + docs + commit
history), then reviewed by the user before first publish. Stable,
high-value content only.

- `architecture-overview` — .NET API ↔ Next.js frontend, key libraries
  (EF Core, SQLite, JWT, FluentValidation), how the pieces fit.
- `domain-model` — what Apna Ghar is as a product; core entities
  (properties, listings, users, auth), relationships, business rules.
- `key-decisions` — the *why* behind notable choices (test-first, atomic
  property update, image right-sizing / orphan cleanup, etc.). Highest-value
  for human review, since intent is not always visible in code.
- `gotchas` — pitfalls when working on the codebase.
- `index` — short note tying the four together.

Notes are cross-linked using basic-memory `[[wiki-link]]` relations so they
form a small knowledge graph.

### 3. Auto-sync (code change → regenerate notes)

- **Trigger:** a `pre-push` git hook on the **Apna Ghar** repo.
- **Filter:** only real source changes (`src/**`, frontend `src/**`);
  ignores `bin/`, `obj/`, `.next/`, and other build output.
- **Detached:** the hook launches the regeneration in the background and
  returns immediately (exit 0) so it never blocks or slows the push.
- **What the background job does:**
  1. Read the last-synced Apna Ghar commit SHA from a `.last-synced-sha`
     marker in the KB repo.
  2. Compute the diff from that SHA to `HEAD` (source files only).
  3. Invoke **headless Claude** (`claude -p "…"`) with that diff and an
     explicit allowed-tools list, instructing it to update the four notes.
  4. Run `basic-memory sync` to re-index.
  5. Commit the note changes on a branch and open a **pull request** on
     `apna-ghar-knowledge`; update `.last-synced-sha` to the new HEAD.
- **Model:** headless regen defaults to a fast/cheaper model (Haiku) to keep
  per-push cost low. Can be switched to Opus for deeper analysis if desired.
- **Safety:**
  - A lock file prevents overlapping regeneration runs.
  - The KB repo is separate from the code repo, so there is no trigger loop.
  - Regen never writes straight to `main`; it always goes through a PR.

### 4. Manual fallback

A `/update-apna-ghar-kb` command (or equivalent script) performs the same
regeneration on demand. This is the reliable path if the git hook misbehaves
(the hook + headless Claude on Windows is the most fragile part of the
system: PATH, auth, detached background execution, and PR creation all have
to work).

## Lifecycle

**Build once:**
1. Create the basic-memory `apna-ghar` project at the chosen path.
2. Draft the four notes (auto-extracted from the codebase) + index.
3. Run `basic-memory sync`.
4. **User reviews** the notes (especially decisions & gotchas).
5. `git init` → commit → `gh repo create apna-ghar-knowledge --private` →
   push.
6. Install the `pre-push` hook in the Apna Ghar repo and seed
   `.last-synced-sha` with the current Apna Ghar HEAD.

**Ongoing:**
- Every push to Apna Ghar → background regen → PR on `apna-ghar-knowledge`
  → user reviews & merges.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Headless Claude in a git hook is fragile on Windows | Manual fallback command; hook runs detached and never blocks push; explicit PATH/auth handling in the plan |
| Token cost of regeneration | Push-only trigger (not per-commit), source-file filter, cheap model by default |
| Unreviewed content drifting into the KB | Regen lands as a PR, never direct to `main` |
| Knowledge base going stale | Auto-regen on push keeps it current; last-synced SHA marker ensures no changes are missed |
| Network TLS interception breaking installs | Documented install flags + exported CA bundle |
| Overlapping regen runs | Lock file |

## Open Confirmations (defaults, change if desired)

- Repo name: `apna-ghar-knowledge`
- Visibility: private
- Folder path: `C:\Users\chirag\basic-memory-apna-ghar`
- Regen model: Haiku (fast/cheap) by default
