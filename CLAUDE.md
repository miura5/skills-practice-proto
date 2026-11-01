# Skills Practice prototype

A claude.ai artifact prototype of Matt's study app: procedures and card sets, practised with
Next Step / Flashcards and Type it, on Proprietary + the Study kit. Matt is a nursing student
and the only user. This is NOT E.V. (miura5/ev4); none of E.V.'s production workflow applies.

Live artifact: https://claude.ai/artifact/UUj5psocojXR1xkK2QVAbh (republish to this same link every time)
Repo: public, prototype only. Keep it light: no extra safeguards, no staging, no release gates.

## Roles
- Matt is the customer. He says what he wants and reports bugs, and decides anything big: a change
  of direction, a new dependency, dropping a feature. Talk to him briefly, in plain words.
- This chat is the build manager. It decides everything else and ships without asking: it designs,
  delegates, reviews, publishes and keeps docs/DECISIONS.md and docs/handover.md current.
- One build manager at a time. If docs/handover.md says another chat is mid-batch, ask Matt which
  chat continues before launching anything.

## Every session
1. Read this file, docs/handover.md, then docs/DECISIONS.md (Tasks list near the middle, entries D-xx).
2. Run `node tests/core.test.js`; it must pass before and after any change.
3. Tell Matt in two or three lines where things stand and what's next, then start on his request.

## A batch (how every request is handled)
1. Design: comb through Matt's request. Turn each point into a concrete decision (a D-xx entry: what,
   why, the exact behaviour) and one task per piece of work (T-xx in Tasks). Push back in one line
   if a point would hurt the app; ask at most one question, only when a wrong guess is expensive.
2. Lanes: group the tasks into 2-3 lanes so that each lane OWNS its files. A file two lanes need goes
   to one lane, or gets one marked insertion point per lane (tests/core.test.js, ds/study.css,
   src/ui/kit.js). Add the markers, CHECK they landed (grep each file), commit and push, and note
   the base commit. Record the lane split in the D-xx entry. Work that every lane needs goes first,
   alone. A single small task needs no lanes; a tiny fix the build manager makes itself.
3. Launch: one agent per lane, all in one message, `model: "haiku"`, `isolation: "worktree"`, in the
   background. Each brief is complete on its own: the base commit (first step: `git reset --hard
   <base>` if HEAD differs, since worktrees can start from an older commit), files to read, the exact
   files and markers it may edit, the behaviour, the tests that must pass, a Playwright smoke test at
   390px (its own port; screenshots in its own scratchpad subfolder), and "commit in the worktree,
   do not push, report path, branch, files, test count and any decision the brief didn't cover".
4. Manage: while lanes run, answer their questions and fix brief mistakes by message. Merge each lane
   as it returns: review its diff first (below), merge, resolve conflicts at the markers / SP.ui
   export line by keeping both sides, run the tests, push the branch.
5. Review the whole batch before shipping, and fix drift found:
   - Proprietary (ds/proprietary.css) untouched; looks only in Study kit sk- components with tokens
     (ds/study.css); new components listed in study.css's header; no static inline styles in screens
     (computed values such as widths or CSS variables are fine).
   - content/ data, src/core/ pure functions with tests, src/screens/ drawing + their own actions,
     src/app.js routing. Nothing crosses.
   - Combined smoke test in Chromium (Playwright) at 390px: the batch's flows, no console errors.
6. Ship (below), tick the tasks, add a D-xx build-notes entry for choices the agents made, rewrite
   docs/handover.md, and tell Matt in a few lines what changed for him and any question for him.

## Shipping
1. `node tests/core.test.js` passes.
2. Republish to the SAME link: Artifact publish with `url` = the live artifact, `file_path` index.html,
   `root` the repo folder, `files` = every file changed since the last publish at its repo path
   (.md files with contentType text/markdown). If this chat hasn't read or published the artifact
   yet, the first publish is refused; publish again after it. Don't pass `capabilities`.
3. Commit, push the session branch, then push the same commit to main (`git push origin HEAD:main`).
4. Remove merged worktrees: `git worktree remove -f -f <path>`, delete their branches.

## Codebase rules (docs/README.md has the map)
- content/ is data, src/core/ is pure functions (no DOM, no storage), src/screens/ draws and handles
  its own actions, src/app.js routes. Don't mix them. Every grading or core change gets test lines.
- ds/proprietary.css is E.V.'s design system: never edit it. Study-only looks go in ds/study.css.
- One global, SP. Plain JS, no build step, no framework.
- Never delete Matt's saved data (his account storage under data/users/<id>).

## Gotchas
- Don't `pkill -f http.server`: the pattern matches your own shell and kills the command. Start test
  servers with `setsid python3 -m http.server <port> &` and leave them.
- .claude/worktrees/ is git-ignored; agents' work lives only there until merged, and is lost with the
  container, so merge and push as lanes return.

## Before the chat ends
Rewrite docs/handover.md (what's live, what's in progress, lanes running, what's next, what Matt
said that matters) and push it.
