# Handover

Last updated 2026-11-02 by the D-32 chat (build manager). No agent is running.

## v0.9.0 (D-32)
Relaxed grading, "I was correct" on Missed/Shaky rows, placeholder card sets removed, Smart is a switch on
top of Whole set / Custom, Reset data on Home. Matt is testing it himself next.

## Where things stand
- Live: v0.9.0 (before: v0.8.2) at https://claude.ai/artifact/UUj5psocojXR1xkK2QVAbh (same link every release; version 14).
- Tests: `node tests/core.test.js` passes 363.
- Shipped today (v0.5.0): chunked learning, D-19 + D-21, tasks T-14..T-17 all ticked.
  - Chunks: card groups of 7; procedure scenes (Med Admin 9 chunks, NG tube 9). Smart rounds go
    Learn -> Link (last 3 steps of the previous chunk) -> Run (whole set) from progress.
  - Segmented session bar (sk-segbar), scene label in the prompt, Options "Practice: Smart / Whole set /
    section", Results "Next: <chunk>".
  - Edit: Scenes field (sk-tags on Proprietary's Chip) and a scene Picker per section.
  - Grading: strict order; no nearby-step stage, no stored order rules.
- Earlier today: v0.4.2 and before (D-10..D-18). Account saving set up; not yet confirmed with real data
  (list data/users/me via ArtifactData).

## v0.8.0 (D-28, D-29; T-30..T-35)
Smart v2: one scene (never split) or 7 cards per round, then the whole set; no Link. Header scene · section.
Results Next / Again. Sync: live account updates, newest wins, per-item progress merge, round tombstones.
OPEN: Matt to test phone <-> PC sync with his account.

## v0.7.0 (D-25, D-26; T-25..T-28)
Editor redesign: folding section rows with the scene badge, flat step rows, star icon, grip drag + ⋯ menus,
generated step numbers with sub-steps (core/numbers.js), Picker look fixes.

## v0.6.0 (D-22, D-23; T-18..T-23)
Scene Picker pop-up + scene colours, round header = scene only, segbar v2 (equal, green), Continue after
Smart rounds, Options Scope (Smart / Whole set / Custom) and the Custom scope screen (core/scope.js).
Ran as 3 Haiku lanes; anchors verified before launch; merged and smoke-tested together.

## How the D-19 batch ran (D-20)
T-14 first, then three lane agents in git worktrees with file ownership; the build manager merged and
reviewed each lane, fixed small drift (raw radius -> --r-pill, study.css header list), smoke-tested the
combined build in Chromium (390px, no console errors), and republished once. Lesson: check that lane
anchors really landed in every shared file before launching lanes (the tests anchor did not).

## Open for Matt
- Smart + Starred only can give an empty round when the current chunk has no starred steps (toast). Possible
  follow-up: skip to the next chunk with starred steps.
- A copy of Med Admin or NG tube that Matt edited before v0.5.0 has no scenes (his saved copy wins). Reset in
  Edit brings the built-in scenes back, or he adds tags himself.

## How we work
CLAUDE.md "A batch" and "Shipping" are the workflow (design -> lanes -> Haiku agents in worktrees ->
merge + review -> ship). Don't repeat it here.

## Things Matt said that matter
- Strict order always; hints are the help. Learners can reorder steps in Edit if they want.
- Chunking should feel natural (from progress), not a toggle; Options keeps an override.
- All styling through the two layers (Proprietary + Study kit). sk-tags may later move to Proprietary.
- Every batch: design into decisions/tasks, 2-3 lanes, Haiku agents, build manager reviews and ships.
- Revalidation is Wed 11/4.
- Old prototype (reference only): https://claude.ai/artifact/JCf1xzWxc33pHtw6RWHwUn
- Rebuild outline: https://claude.ai/artifact/YTKc8MPEFekfaNYdC7vydp
- Design mock-ups: https://claude.ai/artifact/CKY7aAw1o71ZwUammgp9E9
- Keep it a prototype: no unnecessary safeguards, no production workflow.
- Phone layout on every screen size (Matt likes a small study window); no PC layout.
