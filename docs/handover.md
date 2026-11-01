# Handover

Last updated 2026-11-01 by the chat that built v0.1.0. No chat is managing right now.

## Where things stand
- v0.1.0 is live at https://claude.ai/artifact/UUj5psocojXR1xkK2QVAbh: Home, Library, set
  overviews, Options, Next Step / Flashcards, Type it, Results, add and edit sets, light/dark,
  saving to Matt's claude.ai account (browser fallback).
- Content: Medication Administration (94 steps) and NG tube (60 steps), generated from the old
  prototype's skill files; two placeholder card sets.
- Tests: `node tests/core.test.js` passes (18).
- Saving to the account is set up but not yet confirmed with real data.

## Next (both need Matt's go)
- T-01 Grading v2 (D-10). Matt's step 1 answer was graded Shaky because of a full-stop bug
  plus the missing two-stage grading. He wants close answers accepted like the old
  prototype, kept clean, usable until his revalidation (Wed 11/4). The full plan and its
  acceptance tests are in D-10.
- Confirm account saving: after Matt does a round, list the artifact's data under
  data/users/me (ArtifactData tool) and tell him what arrived.

## Things Matt said that matter
- Old prototype (for reference only, don't copy its structure): the single-file claude.ai
  artifact "Skills Practice", https://claude.ai/artifact/JCf1xzWxc33pHtw6RWHwUn.
  Its grading lives in tm* functions (tmScore, tmGradeStep, tmBlanks, tmDetail).
- Rebuild outline (the real build later): https://claude.ai/artifact/YTKc8MPEFekfaNYdC7vydp
- Design mock-ups: https://claude.ai/artifact/CKY7aAw1o71ZwUammgp9E9
- Keep it a prototype: no unnecessary safeguards, no production workflow.
