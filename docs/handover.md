# Handover

Last updated 2026-11-01 by the D-19 batch chat (build manager). No agent is running.

## Where things stand
- Live: v0.6.0 at https://claude.ai/artifact/UUj5psocojXR1xkK2QVAbh (same link every release; version 14).
- Tests: `node tests/core.test.js` passes 152.
- Shipped today (v0.5.0): chunked learning, D-19 + D-21, tasks T-14..T-17 all ticked.
  - Chunks: card groups of 7; procedure scenes (Med Admin 9 chunks, NG tube 9). Smart rounds go
    Learn -> Link (last 3 steps of the previous chunk) -> Run (whole set) from progress.
  - Segmented session bar (sk-segbar), scene label in the prompt, Options "Practice: Smart / Whole set /
    section", Results "Next: <chunk>".
  - Edit: Scenes field (sk-tags on Proprietary's Chip) and a scene Picker per section.
  - Grading: strict order; no nearby-step stage, no stored order rules.
- Earlier today: v0.4.2 and before (D-10..D-18). Account saving set up; not yet confirmed with real data
  (list data/users/me via ArtifactData).

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
- Range rule to confirm with Matt: a bare "15" means 15a..15q.
- Smart + Starred only can give an empty round when the current chunk has no starred steps (toast). Possible
  follow-up: skip to the next chunk with starred steps.
- A copy of Med Admin or NG tube that Matt edited before v0.5.0 has no scenes (his saved copy wins). Reset in
  Edit brings the built-in scenes back, or he adds tags himself.

## How we work (CLAUDE.md Roles)
- Every request or bug becomes a backlog task in DECISIONS.md, an agent codes it, the build manager
  reviews the diff for drift before shipping: Proprietary (ds/proprietary.css) untouched; all looks
  in Study kit sk- components with tokens (ds/study.css); no static inline styles in screens (only
  computed values like gauge widths); content / core / screens / app split; tests for core logic.
- Republish: Artifact publish with url = live link, file_path index.html, root = repo, files = every
  changed file. Read the live artifact first if this chat hasn't published it (the tool refuses otherwise).
- file:// and python http.server pages show "Â·" for "·" (no charset there); the live artifact is fine.

## Things Matt said that matter
- Strict order always; hints are the help. Learners can reorder steps in Edit if they want.
- Chunking should feel natural (from progress), not a toggle; Options keeps an override.
- All styling through the two layers (Proprietary + Study kit). sk-tags may later move to Proprietary.
- Lanes are fine: up to 2-3 agents in parallel when files don't overlap (D-20).
- Revalidation is Wed 11/4.
- Old prototype (reference only): https://claude.ai/artifact/JCf1xzWxc33pHtw6RWHwUn
- Rebuild outline: https://claude.ai/artifact/YTKc8MPEFekfaNYdC7vydp
- Design mock-ups: https://claude.ai/artifact/CKY7aAw1o71ZwUammgp9E9
- Keep it a prototype: no unnecessary safeguards, no production workflow.
