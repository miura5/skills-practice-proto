# Handover

Last updated 2026-11-01 by the D-19 batch chat (build manager). THREE lane agents are running (D-20).

## Where things stand
- Live: v0.4.2 at https://claude.ai/artifact/UUj5psocojXR1xkK2QVAbh (same link every release).
- Tests: `node tests/core.test.js` passes 48.
- Shipped today: Grading v2 (D-10), resume rounds (D-12), Type it current row first (D-14, works on
  iPhone), item transitions (D-15), Study kit clean-up + ladder colours (D-16), one shared round per
  set + Start over in Options (D-17), Home carousel sk-carousel (D-18, T-11..T-13 fixes).
- Account saving is set up; not yet confirmed with real data (list data/users/me via ArtifactData).

## Now: the D-19 batch (chunked learning), in progress
Matt said go 2026-11-01, then asked for parallel lanes (D-20, no pause between tasks).
T-14 done (src/core/chunks.js), pushed on branch claude/ecstatic-feynman-vglfce; not on main yet.
Lanes A (T-15), B (T-16), C (T-17) run as agents in their own git worktrees, with lane anchors in
tests/core.test.js, ds/study.css and src/ui/kit.js. If this chat ends before they finish: their
worktree commits are local and lost with the container; restart the lanes from the D-20 file split.
After the lanes: merge A, B, C into the branch, review the whole diff, test, republish once, merge to main.
Read D-19 in docs/DECISIONS.md first; it is the full design. Tasks, in this order:
1. T-14 Core chunking (src/core/chunks.js + tests).
2. T-15 Data + Edit: scene tags, sk-tags (generic Study kit tag input), Proprietary Picker per section,
   seed Med Admin + NG tube scenes from the old prototype.
3. T-16 Rounds + screens: Smart rounds, segmented session bar, scene in prompt, Options Practice,
   Results "Next: <chunk>".
4. T-17 Grading: strict order; remove the nearby-step stage and stored order rules.
Batch rule: one agent per task; after each task commit + push, then PAUSE and wait for Matt's go
(he checks his usage). Review the whole batch's diff once at the end, then republish once.
Check the Tasks list in DECISIONS.md for which tasks are ticked.

## How we work (CLAUDE.md Roles)
- Every request or bug becomes a backlog task in DECISIONS.md, an agent codes it, the build manager
  reviews the diff for drift before shipping: Proprietary (ds/proprietary.css) untouched; all looks
  in Study kit sk- components with tokens (ds/study.css); no static inline styles in screens (only
  computed values like gauge widths); content / core / screens / app split; tests for core logic.
- Republish: Artifact publish with url = live link, file_path index.html, root = repo, files = every
  changed file. Read any live file first if this chat hasn't seen it (the tool refuses otherwise).
- The repo's commit check flags an agent's in-progress files; leave them uncommitted until shipped.
- file:// test pages show "Â·" for "·" (no charset there); the live artifact is fine. Ignore it.

## Things Matt said that matter
- Strict order always; hints are the help. Learners can reorder steps in Edit if they want.
- Chunking should feel natural (from progress), not a toggle; Options keeps an override.
- All styling through the two layers (Proprietary + Study kit). sk-tags may later move to Proprietary.
- Revalidation is Wed 11/4.
- Old prototype (reference only): https://claude.ai/artifact/JCf1xzWxc33pHtw6RWHwUn
- Rebuild outline: https://claude.ai/artifact/YTKc8MPEFekfaNYdC7vydp
- Design mock-ups: https://claude.ai/artifact/CKY7aAw1o71ZwUammgp9E9
- Keep it a prototype: no unnecessary safeguards, no production workflow.
