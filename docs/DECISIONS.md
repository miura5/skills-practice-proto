# Skills Practice prototype: decisions

A small Chart for the claude.ai prototype. Same idea as E.V.'s: one entry per decision,
newest last, never rewritten; a changed mind is a new entry that supersedes an old one.

## D-01 · The prototype runs on the claude.ai artifact runtime (2026-11-01)
Decision: build the first working version as a multi-file artifact, not on Cloudflare.
Why: it is the fastest place to test the outline, Proprietary and the Study kit with real
use before the real build. No build step, no server, no deploys.
Not carried over from E.V. here: Worker, D1, PWA install and offline, CI and hooks, the
Claude API proxy and its caps, scheduled tasks. Each has a stand-in below or waits for
the real build.

## D-02 · Two layers: Proprietary + Study kit (2026-11-01)
Decision: ds/proprietary.css is E.V.'s design system, copied unchanged. ds/study.css is the
Study kit: a theme (light and dark values for Proprietary's colour tokens and a roomier
density) plus sk- components. Screens use only those two; src/app.css holds page layout.
Rule: a change that would help every app goes to Proprietary; a study-only piece stays in
the kit and gets promoted when a second app needs it.
Note: Proprietary's old plain-button rules (lines that style every `button`) were left
out of this copy; in E.V. they sit in a lower layer and lose to Proprietary's own buttons.

## D-03 · Content, logic and screens never share a file (2026-11-01)
Decision: content/ is data, src/core/ is pure functions (no DOM, no storage), src/screens/
draws and handles its own actions, src/app.js routes. core/ runs in Node, so tests run
without a browser: `node tests/core.test.js`.

## D-04 · One content schema, two kinds of set (2026-11-01)
Decision: a set is `procedure` (sections of steps: num, cue, text, star) or `cards`
(front, back). [Bracketed] words are the key words Type it grades on. core/sets.items()
flattens either kind into the items every mode uses; core/sets.validate() guards saves.
Built-in sets ship as files in content/; Med Admin and NG tube were generated from the
prototype's skill files.

## D-05 · Grading: key-word check now, the full matcher later (2026-11-01)
Decision: core/grade checks one typed answer against the current item's key words, with
light stemming and the set's synonyms: 75% of keys = Right, 34% = Shaky, less = Missed.
Deferred: the old prototype's position-aware step matcher (it reads which step a line
belongs to anywhere in the checklist) and the Claude fallback. They slot in behind the
same grade(item, typed, synonyms) call. Every grading bug becomes a line in tests/.

## D-06 · The ladder: Weak / Familiar / Learned (2026-11-01)
Decision: Missed = Weak. Shaky = Familiar. Right in Type it without a hint, twice in a row
= Learned. Self-graded (Next Step, Flashcards) or hinted answers top out at Familiar.

## D-07 · Options are per set and apply live (2026-11-01)
Decision: section, starred only, weak first, skip learned, shuffle. Saved per set.
Changing them mid-round keeps what's answered and rebuilds the rest (round.refilter).

## D-08 · Storage: your account when granted, this browser otherwise (2026-11-01)
Decision: src/store/store.js is the only file that knows where data lives. With the db and
user capabilities it keeps everything private to you in the collection data/users/<your id>
(one document per record: sets~<id>, progress~<id>, settings~<id>, meta); without
them it uses localStorage. Screens read from a memory cache, so storage never blocks a draw.
Edits to a built-in set are saved as your copy; Reset brings the original back.
Stand-in for: D1 + sign-in + sync in the real build.

## D-09 · No framework (2026-11-01)
Decision: plain JavaScript files sharing one namespace (SP), screens return HTML strings,
one click handler routes [data-act] to actions. Small enough to read in one sitting; the
real build can move screens to components without touching core/ or content/.

---

# Proposed (not built yet)

## D-10 · Grading v2: accept close answers, the way the old prototype did (built 2026-11-01, v0.2.0)
Why: in v0.1.0 a correct answer to Med Admin step 1 came back Shaky, and a correct answer
after a hint was always shown as Shaky. Two causes, found by running Matt's exact answer:
1. Bug: a full stop stays stuck to the word before it ("mrn." is not "mrn"), so whole key
   groups failed. Without the full stops the same answer already grades Right.
2. Missing: v0.1.0 has only a flat key-word count. The old prototype first recognised which
   step you meant, then asked for any missing details as blanks right in that row, and
   accepted close wording (stems, synonyms, per-step allowances).
3. My rule: "hinted = Shaky" read as "partly wrong". The ladder cap is right; the label isn't.

Decision (to build as task T-01): keep grade(item, typed, set) as the one entry point, and
split it into small, separately tested pieces in src/core/:
- text.js: punctuation fix (decimals like 3.5 stay whole); a slightly better stemmer; a
  one-letter typo allowance for words of 6+ letters.
- keys.js (new): a [bracketed] group is scored part by part. "[name, DOB, MRN]" is three
  parts, so two of three counts as two thirds, not zero. Either-or groups ("a / b") accept
  either.
- grade.js: two stages, like the old prototype but without its global state.
  1. Recognise: is this answer about the current step? Score it against the current step and
     its neighbours (cue + key words, rarer words weigh more). If the best match is a nearby
     different step, say so instead of marking it wrong.
  2. Details: every key part present = Right. Most present (60%+) = the row stays open with
     the missing parts as inline blanks; fill them = Right, miss them again = Shaky.
     Little present = Missed, with the answer shown.
- content: carry over the old per-step allowances ("loose", 9 in Med Admin) and the
  required/strict wording rules, and keep NG tube's 12 and Med Admin's 20 synonym lists.
- Hints: a correct hinted answer shows Right with a "hinted" tag; the ladder still caps it
  at Familiar (D-06 unchanged).
Not included: the whole-checklist matcher that lets you type any step in any order, scenes,
and the Claude fallback. If close answers still fail too often, the next step is the
claude.ai sample capability as the fallback (no Worker or key needed on this runtime).

Acceptance tests (tests/core.test.js), each must pass before T-01 ships:
- Step 1, Matt's answer: "verify completeness and accuracy of the mar. includes patient
  name dob and mrn. includes drug name dose route and time. includes allergies" = Right.
- Step 1 with "dob" left out = details blank for it, not Missed.
- Step 2 typed from the hint's key words = Right, tagged hinted, ladder Familiar.
- The old regression lines: "check the dose" lands on 13c; 25n vs 26l; "wipe site with
  alcohol" on 26e (as "that's a nearby step" where it isn't the current one).
- Everything already in tests/ still passes.

## D-11 · The prototype gets its own GitHub repo and a light build-manager workflow (2026-11-01)
Decision: a public repo, miura5/skills-practice-proto, holds exactly these files (it holds
nothing private; it's a prototype, so no extra safeguards). A new chat attaches it, reads CLAUDE.md and docs/handover.md, and acts as the
prototype's build manager: plans, keeps this Chart, hands each task to one coding subagent,
runs `node tests/core.test.js`, republishes the artifact to the same link, and rewrites the
handover before the chat ends.
Scaled down from E.V.: no staging/live split (the artifact link is the only environment),
no CI, hooks, watchdog or scheduled tasks, one subagent instead of lanes. Kept: ADRs, tests
before shipping, Matt decides anything big, nothing of his deleted.
Matt hands it to a new chat by attaching the repo; CLAUDE.md sets the role.

# Tasks
- [x] T-01 Grading v2 (D-10). Shipped 2026-11-01 as v0.2.0, 41 tests.
- [x] T-02 Repo + CLAUDE.md + handover (D-11).
- [x] T-03 Resume a round (D-12). Shipped 2026-11-01 as v0.3.0, 45 tests.
- [ ] T-04 Type it: keep the current row in view above the phone keyboard, no scrolling (Matt, 2026-11-01). In progress.

## D-10 build notes (2026-11-01)
- Bands: 100% Right; 60%+ row stays open with blanks; 34-59% Shaky; under 34% Missed.
- A synonym counts for a two-word key part if it covers half of it ("pulse ox" = "SpO2 probe").
- The hint shows only first words; typing just those grades Shaky, the full key words grade Right + hinted.
- Order rules (strict/before/anytime) are stored in content but not used until the whole-checklist matcher.
- Rules came from the old prototype's skills/med-admin.js and skills/ngt.js typeMode blocks, copied as is.

## D-12 · Resume a round (2026-11-01, v0.3.0)
Why: Matt leaves a round and comes back to 0.
Decision: the round in progress is saved per set (store 'rounds', doc rounds~<setId>, account or
browser) at start and after every answer; cleared at Results or on Start over. Leaving keeps it.
The set screen shows a Resume card (mode, "12 of 30", gauge, Resume / Start over); Home's Jump
back in resumes too. core.rounds.snapshot/restore keep it JSON-safe and drop items removed
from an edited set. The Results time includes time away; a resumed round keeps its item list.
