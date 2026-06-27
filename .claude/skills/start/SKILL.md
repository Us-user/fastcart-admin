---
name: start
description: Resume building the FastCart Admin Panel. Reads ROADMAP.md + the latest SESSION_NOTES.md entry, re-scans the images/ mockups, then continues from the first unchecked roadmap task. Use at the beginning of a work session.
---

# /start — Resume the FastCart Admin build

You are continuing a multi-session build of the **FastCart Admin Panel**. Your job at `/start` is to load context and pick up exactly where the last session ended — never restart from scratch.

## Steps

1. **Read the latest session state.**
   - Read `SESSION_NOTES.md` and focus on the **most recent** entry: its "NEXT ACTION", open questions, and decisions. This is the cold-start anchor.

2. **Read the plan.**
   - Read `ROADMAP.md`. Identify the current phase and the **first unchecked (`[ ]` or `[~]`) task**. That is where you resume.

3. **Re-scan the design source.**
   - List the `images/` folder (new mockups may have been added — TRD §0 requires re-scanning each session).
   - You do not need to open every image now — open each screen's mockup when you build that screen (the `/design` skill governs this).

4. **Load relevant spec.**
   - Open the `FastCart_Admin_TRD.md` section(s) covering the tasks you're about to do (don't re-read the whole TRD; jump to the relevant §).

5. **State the plan, then work.**
   - Briefly tell the user: current phase, the specific task(s) you'll do this session, and anything from "open questions" that needs their input.
   - Mark the task you start as in progress (`[~]`) in `ROADMAP.md`.
   - Build it following the TRD for behavior and the matching `images/` mockup for appearance. Use `/design` before writing any screen UI.
   - Honor the mandatory stack (TRD §1) and conventions (TRD §13) — no new libraries.

6. **Keep moving** through roadmap tasks until the user stops you or you hit a blocker. When wrapping up, remind the user to run `/stop` so progress is recorded for next time.

## Rules
- Resume; don't reset. If `SESSION_NOTES.md` and `ROADMAP.md` disagree, trust the checked boxes in `ROADMAP.md` and note the discrepancy.
- Behavior = TRD. Visual design = `images/` mockups. Never invent a visual style for a screen that has a mockup.
- If a task is genuinely blocked (missing decision, backend down), record it and move to the next independent task rather than stalling.
