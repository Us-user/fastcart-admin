---
name: stop
description: End a FastCart Admin work session. Summarizes what was done, checks off completed ROADMAP.md tasks, appends a new SESSION_NOTES.md entry with the exact next action, and commits + pushes to GitHub so the next /start can resume cold.
---

# /stop — Wrap up and hand off to the next session

Your job at `/stop` is to make this session's work resumable by a future session that remembers nothing. Be accurate — do not claim work that wasn't actually completed.

## Steps

1. **Update the roadmap.**
   - In `ROADMAP.md`, check off (`[x]`) every task fully completed **and** matched to its mockup. Mark partially-done tasks `[~]`. Leave untouched tasks as `[ ]`.

2. **Append a new SESSION_NOTES.md entry** at the **bottom** (newest last), using this template:

   ```markdown
   ## Session N — YYYY-MM-DD — <short title>

   **Phase:** <current phase>

   **Done this session**
   - <concrete, verifiable items>

   **Decisions made**
   - <choices that future sessions must keep consistent, with the why>

   **Open questions / blockers**
   - <anything needing the user, or backend/API surprises discovered>

   **NEXT ACTION (start here):**
   > <the single most specific next step — file/endpoint/screen — so /start resumes instantly>
   ```
   - Use the real current date. Increment the session number.
   - Keep it concise but cold-start sufficient: file paths, endpoint names, and decisions, not vague prose.

3. **Commit and push.**
   - Stage changes, commit with a clear message summarizing the session (end the message with the required `Co-Authored-By` trailer), and push to the GitHub remote.
   - Only commit/push if the user has authorized git operations for this project; otherwise stage and report what would be pushed.

4. **Report** to the user: what was completed, what's checked off, the next action, and the commit/push result.

## Rules
- Honesty: if tests failed or a task is half-done, say so and mark it `[~]`, not `[x]`.
- The "NEXT ACTION" line is the most important output — it is what `/start` keys off of. Make it specific.
- Don't summarize the whole project history each time — only this session's delta.
