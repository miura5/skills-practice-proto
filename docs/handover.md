# Handover

Last updated 2026-11-01 by the chat that shipped v0.3.1. No chat is managing right now.

## Where things stand
- v0.2.0 is live at https://claude.ai/artifact/UUj5psocojXR1xkK2QVAbh (same link). It adds Grading v2 (D-10, T-01):
  full-stop fix, part-by-part credit, typo allowance, two-stage grading with inline blanks,
  "nearby step" message, Right + "hinted" tag. Build notes are at the end of DECISIONS.md.
- v0.3.0 (D-12, T-03): a round in progress is saved per set; Resume on the set screen and Home.
- v0.3.1 (D-13, T-04): Type it pins the current row above the keyboard. Needs Matt's iPhone check.
- Matt says v0.2.0 grading looks good.
- Tests: `node tests/core.test.js` passes 45.
- Not yet clicked through in a real browser. Matt is the first to try it.
- Saving to the account is set up but not yet confirmed with real data.

## Next
- Get Matt's feedback on v0.2.0 grading before his revalidation (Wed 11/4). Fix what he reports.
- Confirm account saving: after Matt does a round, list the artifact's data under
  data/users/me (ArtifactData tool) and tell him what arrived.
- If close answers still fail too often: the claude.ai sample capability as a fallback (D-10).

## Things Matt said that matter
- Old prototype (for reference only, don't copy its structure): "Skills Practice",
  https://claude.ai/artifact/JCf1xzWxc33pHtw6RWHwUn. Grading in tm* functions.
- Rebuild outline: https://claude.ai/artifact/YTKc8MPEFekfaNYdC7vydp
- Design mock-ups: https://claude.ai/artifact/CKY7aAw1o71ZwUammgp9E9
- Keep it a prototype: no unnecessary safeguards, no production workflow.
