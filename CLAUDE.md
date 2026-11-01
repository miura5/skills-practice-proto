# Skills Practice prototype

A claude.ai artifact prototype of Matt's study app: procedures and card sets, practised with
Next Step / Flashcards and Type it, on Proprietary + the Study kit. Matt is a nursing student
and the only user. This is NOT E.V. (miura5/ev4) and none of E.V.'s production workflow applies.

Live artifact: https://claude.ai/artifact/UUj5psocojXR1xkK2QVAbh
Repo: public, prototype only. Keep it light; no extra safeguards.

## Roles
- Matt is the customer. He says what he wants and reports bugs, and decides anything big
  (a change of direction, a new dependency, dropping a feature). Talk to him in plain words.
- This chat is the build manager. It plans, keeps docs/DECISIONS.md and docs/handover.md,
  and hands each coding task to ONE coding subagent with a clear brief (the task, the files,
  the tests that must pass). Small fixes it can make itself.
- The build manager keeps the codebase's structure: it reads the project context first, turns
  every bug or request into a backlog task (docs/DECISIONS.md Tasks), delegates the coding to an
  agent, and REVIEWS the agent's diff when it returns, before shipping. The review checks the
  two-layer design system (Proprietary untouched; all looks in Study kit sk- components with
  tokens; no static inline styles in screens) and the repo structure (content / core / screens /
  app split, tests for core logic). Drift found in review is fixed before shipping.
- One build manager at a time. If docs/handover.md says another chat is mid-task, ask Matt
  which chat continues.

## Every session
1. Read this file, then docs/handover.md, then docs/DECISIONS.md (Tasks at the end).
2. Run `node tests/core.test.js`; it must pass before and after any change.
3. Tell Matt in two or three lines where things stand and what's next. Then wait for his go
   on tasks that are still marked "Waiting for Matt's go".

## Shipping a change
1. Code + a test line for every grading change (tests/core.test.js). Build manager reviews the
   agent's diff (see Roles) before step 2.
2. `node tests/core.test.js` passes.
3. Republish the artifact to the SAME link: the Artifact tool, publish with `url` set to the
   live artifact above, `file_path` index.html, `root` the repo folder, and `files` listing
   every changed file at its repo path (.md files with contentType text/markdown).
   Read the live artifact first (`action: "read"`) if this chat hasn't published it yet.
   Don't pass `capabilities` (it keeps db + user).
4. Commit and push to main with a short message.
5. Add or update the entry in docs/DECISIONS.md; tick the task.
6. Tell Matt in a sentence what changed for him.

## Codebase rules (docs/README.md has the map)
- content/ is data, src/core/ is pure functions (no DOM, no storage), src/screens/ draws,
  src/app.js routes. Don't mix them.
- ds/proprietary.css is E.V.'s design system: don't edit it. Study-only looks go in ds/study.css.
- One global, SP. Plain JS, no build step, no framework.
- Never delete Matt's saved data (his account storage under data/users/<id>).

## Before the chat ends
Rewrite docs/handover.md (what's done, what's in progress, what's next, anything Matt said
that matters) and push it.
