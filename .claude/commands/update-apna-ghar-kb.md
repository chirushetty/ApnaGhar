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
