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
- [x] T-04 Type it: keep the current row in view above the phone keyboard (D-13). Shipped 2026-11-01 as v0.3.1.
- [x] T-05 Type it layout without scrolling (D-14). Shipped 2026-11-01 as v0.3.2 (Matt: works on iPhone).
- [x] T-06 Smooth transition to the next item: procedures slide vertically (Next Step, Type it), card sets slide horizontally (Flashcards, Type it) (D-15). Shipped 2026-11-01 as v0.3.3.
- [x] T-07 Study kit clean-up + ladder colours (D-16). Shipped 2026-11-01 as v0.3.4.
- [x] T-08 One round per set, shared across modes: any mode continues the saved round at its number (D-17). Shipped v0.4.0.
- [x] T-09 Set overview: remove the Resume card; Start over moves to the bottom of the in-round Options sheet in red. Home keeps the round card (D-17). Shipped v0.4.0.
- [x] T-10 Home "Jump back in" as an sk-carousel (Study kit): cards, arrows on desktop, swipe on phone, dots (D-18). Shipped v0.4.0.
- [x] T-11 Bug: carousel left arrow unfilled and dead at the last slide (D-18). Fixed in v0.4.1: slides and arrows shared z-index 1, so later DOM painted over prev; track now isolates, arrows z 2, 56px desktop gutter.
- [x] T-12 Carousel: pre-T-11 slide width (85% of track - 40px), centred snap with symmetric padding, art .75 in the carousel only, arrows 6px from the edge (D-18). Shipped v0.4.2.
- [x] T-13 Set overview mode cards: captions removed (U.practice(title, art, act)); art pinned to the card bottom so both align. Shipped v0.4.2. Build manager review passed.
- [x] T-14 Core chunking: src/core/chunks.js (chunks, stages, Smart round list) + tests (D-19). Batch 1 of 4. Done 2026-11-01.
- [x] T-15 Data + Edit: scene tags in set data; sk-tags tag input (Study kit, generic); Proprietary Picker per section; seed Med Admin + NG tube scenes from the old prototype (D-19). Batch 2 of 4. Done 2026-11-01 (Lane A).
- [x] T-16 Rounds + screens: Smart rounds, segmented session bar (Study kit), scene in the prompt, Options Practice Smart / Whole set / Section, Results "Next: <chunk>" (D-19). Batch 3 of 4. Done 2026-11-01 (Lane B).
- [x] T-17 Grading simplification: strict order; remove the nearby-step stage and the stored strict/before/anytime rules; update tests (D-19). Batch 4 of 4. Done 2026-11-01 (Lane C).
- [x] T-18 Proprietary pop-up Picker for scenes (phone + PC) + per-scene colours (D-22). Done 2026-11-01 (Lane A).
- [x] T-19 Round header shows the scene in Learn/Link only; prompt prefix removed (D-22). Done 2026-11-01 (Lane B).
- [x] T-20 sk-segbar: equal segments, fill per own steps, green, count pill (D-22). Done 2026-11-01 (Lane B).
- [x] T-21 Results after Smart: Continue: <next chunk> + Back to set (D-22). Done 2026-11-01 (Lane B).
- [x] T-22 Options "Scope": Smart / Whole set / Custom (D-22). Done 2026-11-01 (Lane C).
- [x] T-23 Custom scope editor sk-scope + core/scope.js + tests (D-22). Done 2026-11-01 (Lane C).
- [x] T-24 sk-segbar min segment width + right fade (D-24). Done 2026-11-01 (build manager).
- [x] T-25 Step numbering: core/numbers.js (generated nums, sub-steps, per part) + sets.items uses it + tests (D-25). Done 2026-11-01 (Lane B).
- [x] T-26 Picker chip / rows: remove leftover native button border, shadow and highlight (D-25). Done 2026-11-01 (Lane B).
- [x] T-27 Editor redesign: folding section rows with scene badge, flat step rows, star icon, grip + ⋯ menu, header ⋯ (D-25). Done 2026-11-01 (Lane A).
- [x] T-28 sk-sort: Study kit drag-to-reorder from a grip only (pointer + keyboard-free fallback via menu) (D-25). Done 2026-11-01 (Lane A).
- [x] T-29 Editor section header: step range + compact scene badge, aligned (D-27). Done 2026-11-01 (build manager).
- [x] T-30 Smart v2 core: chunk = scene (no split), no Link; stages learn -> run; rounds.stale (D-28). Done 2026-11-01 (Lane A).
- [x] T-31 Sync: core/sync.js merge (newest wins; progress per item) + store live updates and refresh on focus (D-28). Done 2026-11-01 (Lane A).
- [x] T-32 Round screens: header scene · section; bar (done green, current fills, later grey); Results Next / Again (D-28). Done 2026-11-01 (Lane B).
- [x] T-33 Stale saved round replaced on start; Home and set screen show the same round and count (D-28). Done 2026-11-01 (Lane B).
- [x] T-34 Result rows: editor rows renamed sk-erow; round and Results rows get their padding back (D-28). Done 2026-11-01 (Lane B).
- [x] T-35 Round time counts active time only (D-28). Done 2026-11-01 (Lane B).
- [x] T-36 Open round adopts the newest saved copy on focus / store change (no stale-tab overwrite) (D-30). Agent. Done 2026-11-01.
- [x] T-37 Type it: empty Check does nothing; rows and Results show "You typed: …" for Shaky/Missed (D-30). Agent. Done 2026-11-01.
- [x] T-38 Options change that leaves no items mid-round: toast, keep the round; scope.parse safe on any word, reports skipped parts (D-30). Agent. Done 2026-11-01.
- [x] T-39 Wording "Right" everywhere, "Missed · hint used"; Home carousel arrows clear of the cards (D-30). Build manager + agent (Results tag). Done 2026-11-01.
- [x] T-40 Visual test fixes: carousel art + arrows, Custom chips, one toast spot, hint pill, Edit selection indent (D-31). Done 2026-11-01 (build manager).

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

## D-13 · Type it keeps the current row at the top (2026-11-01, v0.3.1)
Why: on iPhone the next row slid under the keyboard after each answer.
Decision: screens may export after(app, el), called by app.render. Type it pins the focus row 8px
below the top of .screen, adding only the bottom padding it needs; it resets window scroll and
re-pins on visualViewport resize (keyboard). Tested in Playwright at 390x500; iOS keyboard untested.

## D-14 · Type it draws the current row first (2026-11-01, v0.3.2)
Why: D-13's scroll pinning did nothing on Matt's iPhone in the claude.ai app.
Decision: no scroll tricks. The focus row is the first row under the meta line; the last answer is
one compact line below it (result, hinted, Missing: max 2 lines); older answers only on Results;
1-2 faded upcoming rows. after() just resets scrollTop to 0. Supersedes D-13's pin.

## D-15 · Item transitions (2026-11-01, v0.3.3)
Decision: enter-only CSS animation (240ms, --ease-out) on each advance. Procedures: up 24px + fade.
Cards: in from the right 32px + fade. round.enter() decides (index changed, 200ms window to survive
the store's redraw). No slide-out, so input stays instant. Reduced motion: fade only.

## D-16 · Study kit clean-up and ladder colours (2026-11-01, v0.3.4)
Drift found: T-03/T-05 added a few inline styles in screens; older v0.1.0 ones too. All static
inline styles now live in sk- classes (ds/study.css) or layout helpers (src/app.css). Only computed
values stay inline (gauge widths, --sk-flip-h). Hard-coded #fff -> var(--on-her).
Ladder tokens in the Study theme: --learned = --ok (green), --familiar = lch(80% 78 92) light /
lch(84% 72 95) dark (yellow, was brown --fam), --weak = --bad (red, was --warn).
Right/Shaky/Missed keep ok/warn/bad. Rule from now on: no static inline styles in screens.

## D-17 · One round per set, shared across modes (2026-11-01, v0.4.0)
Decision: any mode continues the set's saved round (core.rounds.pick); fresh rounds only when
none is saved, after Results, or Start over. Each answer stores its mode; Results says "Mixed"
when both were used. The set overview drops the Resume card for a quiet "Round in progress · N of M"
note; Start over is the last item in the in-round Options sheet, red, no confirm.

## D-18 · Home carousel, sk-carousel (2026-11-01, v0.4.0)
Decision: Study kit sk-carousel (scroll-snap track, 85% slides, arrows only on fine pointers,
tappable dots), markup via U.carousel. Home's Jump back in: last set, then sets with a saved
round, then others, max 5; Resume round or Continue; practice art bottom-right.

## D-19 · Chunked learning: scenes, chunks, stages; strict order (approved by Matt 2026-11-01)
Why: start-to-finish recall from "After: …" alone was harder than the old prototype's scenes.
Chunking (working memory), context cues and part-then-whole training support learning by scene first,
then joining scenes, then full runs, which match the checkoff.
Decision:
- One concept for both set types: chunks.
  - Cards: fixed chunks of 7 in set order; a last chunk under 4 joins the one before.
  - Procedures: scenes. A set has a list of scene tags {id, label}; each section has at most one
    scene id (a scene can hold many sections; a section never has two scenes). A scene = all sections
    with its tag; scenes run in the order of their first section. An untagged section is its own
    chunk. A scene over ~12 steps splits at a section boundary.
- Stages per chunk, from progress (no setting):
  1. Learn: the round is the chunk; procedures show the scene in the prompt ("Med room · After: …").
     Done when every item in the chunk is Familiar or better.
  2. Link (procedures only): the next chunk's round starts with the last 3 steps of the previous chunk.
  3. Run: when every chunk is past Learn, the default round is the whole set, start to finish.
- Rounds stay one-per-set and shared across modes (D-17); a round = the current chunk. Results shows
  "Next: <chunk>". Existing saved rounds are kept until finished or Start over. Progress is per item, kept.
- Session bar: one segment per chunk, current one filling; a plain bar in Run. New Study kit component.
- Options: "Practice: Smart (default) / Whole set / Section" replaces the Section select. Starred,
  weak-first, skip-learned stay; shuffle applies to cards only (procedures are strict).
- Strict order, always. No free order. A Type it answer is graded only against the current step.
  Remove D-10's recognise / "nearby step" stage and the stored strict/before/anytime rules. Keep
  synonyms, loose allowances, required wording, typo allowance and part-by-part blanks.
- Edit: no separate scene manager. Edit procedure gets a "Scenes" field under Title using a new
  Study kit component sk-tags: comma or Enter turns text into a badge; Backspace on empty pulls the
  last badge back to text; tap a badge to edit it in place; blur or comma commits; x removes (clears
  that scene from its sections). Tags keep a stable id, so renaming keeps assignments; badge order
  doesn't matter. sk-tags is generic (no scene logic), built only from Proprietary tokens and its
  Badge/Chip, so it can move to Proprietary later. Each section gets Proprietary's Picker
  (data-ui="picker"): "No scene" + the tags.
- Built-in scenes for Med Admin and NG tube come from the old prototype artifact
  (https://claude.ai/artifact/JCf1xzWxc33pHtw6RWHwUn, its skills/*.js scene lists).
Batch rule (Matt): T-14..T-17 run in order, one agent each; after each task the build manager commits,
pushes and PAUSES for Matt's go. The build manager reviews the whole batch's diff at the end (design
system + structure), then republishes once.

## D-20 · The D-19 batch runs in lanes (Matt, 2026-11-01)
Supersedes D-19's batch rule (one task at a time, pause after each). Matt asked for the fastest finish
with up to 3 agents in parallel and no pause. T-14 was done first (all lanes need it). Then three lanes,
each an agent in its own git worktree, each owning its files; the build manager merges and reviews:
- Lane A = T-15: content scenes, sets.js, edit.js, app.js (tag keys), sk-tags.
- Lane B = T-16: rounds.js, set.js, round.js, next.js, type.js (incl. removing the nearby-step UI), sk-segbar.
- Lane C = T-17: grade.js, keys.js, the content files' grading.strict/before/anytime keys only, about.js.
Shared files (tests, study.css, kit.js) have one marked insertion point per lane.


## D-21 · Chunked learning shipped (2026-11-01, v0.5.0; T-14..T-17, built in lanes per D-20)
Build notes on choices the D-19 design left open:
- Chunks (core/chunks.js): a scene over 12 steps splits into "<label> 1, 2, 3" at section boundaries; a single
  section is never split. Run lists the whole set in set order (scenes can pull later sections forward in Learn).
  Seeded: Med Admin 9 chunks (Med room and Giving the meds split in 3), NG tube 9.
- Smart (core/rounds.js plan/build): Starred and Skip learned also filter link steps; link steps stay first.
  Starred only can give an empty Smart round when the chunk has no starred steps (the usual toast). An old
  saved Section option still means that section. Changing Options mid-round keeps the round's chunk.
- The prompt names the chunk in Learn and Link (and in rounds saved before D-19); not in Run or non-Smart rounds.
  Link steps show their own chunk's label. Results shows "Next: <chunk>" after a Smart round.
- sk-segbar: segments sized by item count; learned chunks full (--learned), the current one fills (--her).
- sk-tags on Proprietary's Chip. Backspace on the empty input pulls the last tag back to text with its id kept;
  committing it empty removes it and clears its sections. A duplicate label is ignored. Scene Picker = native
  select with data-ui="picker" (iOS wheel), not Proprietary's popover chip; Matt can ask for the popover.
- Grading (D-10 superseded in part): no nearby stage, no stored strict/before/anytime rules. 1876 sampled
  answers that never hit the old nearby stage grade the same as before.
- Fixed in passing: finishing a round logged a TypeError (the store redraw ran on the mode screen with no item).

## D-22 · Round polish + Scope (Matt, 2026-11-01; T-18..T-23)
- Scene picker: Proprietary's pop-up Picker (chip + .popover menu) on phone and PC, not a native select.
  Each scene tag gets its own colour: Study kit tokens --scene-1..--scene-6 (light + dark), by tag order;
  the chips in sk-tags, the Picker chip and its menu rows show the colour.
- Round header: the "Set · Mode" line is gone. Procedures in a Smart round in Learn or Link show the scene
  (chunk) name there instead; otherwise no line, with no layout jump. The prompt drops its scene prefix.
- sk-segbar (Study kit, changed): equal-width segments, one per chunk; each fills by its own steps
  (a 1-step chunk is a full-width segment that fills when done); green (--ok); the count pill stays.
- Results after a Smart round: "Continue: <next chunk>" (primary, starts that round in the same mode) and
  "Back to set". Practice again stays for non-Smart rounds.
- Options: the "Practice" select becomes "Scope", radio rows: Smart · Whole set · Custom (procedures only).
  Custom shows "<n> steps · 1, 8–12, 15–32" and "Edit selection ›".
- Custom scope (new Study kit sk-scope, a sub-screen): range field + Apply, All / None / Starred only chips,
  section rows with tri-state checkboxes and step rows (number, star, cue). Saved in the set's settings as
  {practice:'custom', custom:[ids]}; reachable from the set's Options and the in-round Options; Back returns
  where you came from. Range parsing/formatting is pure (core/scope.js) with tests.
Lanes: A = T-18 (edit.js, app.js); B = T-19..T-21 (round.js, next.js, type.js, segbar); C = T-22..T-23
(set.js, rounds.js, core/scope.js, screens/scope.js, index.html). Agents run on Haiku (Matt).

## D-23 · Round polish + Scope shipped (2026-11-01, v0.6.0; T-18..T-23, lanes on Haiku)
Build notes:
- Picker (kit U.picker, generic): Proprietary chip + .popover menu on the native popover attribute, placed
  under its chip; a bottom sheet under 600px. Scene colours --scene-1..6 (+ -bg) by tag order, mod 6.
- The round header line is always drawn (blank when no scene) so nothing moves between items.
- Continue always starts a Smart round in the same mode, whatever Scope is saved.
- Scope: an old Section option now reads as Custom with that section's steps. In ranges a bare number
  means its lettered steps (15 = 15a..15q). index.html gained <meta charset="utf-8"> (fixes "Â·" locally).

## D-24 · sk-segbar keeps a minimum segment width (Matt, 2026-11-01, v0.6.1)
Why: with many chunks, equal segments got too thin. Decision: each segment is at least 40px (fills more when
few). When they overflow, the rail slides so one finished chunk shows before the current one, and the
overflow fades out on the right (container units + mask; --n/--at computed inline). Count pill unchanged.
Also confirmed by Matt: a bare step number in Custom ranges covers all its lettered sub-steps.

## D-25 · A cleaner editor; generated step numbers with sub-steps (Matt approved, 2026-11-01)
- Sections are folding rows (chevron, title, scene badge in its colour that opens the Picker, "n steps"),
  all folded at first; the title is editable inside an open section. No separate Scene label.
- Flat: no card per step; rows with hairlines; fields borderless with a soft fill and the focus ring.
  Step text placeholder "Put [brackets] around the key words" (no caption). Star = a star icon toggle.
- Reorder: a grip (drag starts only there) + a ⋯ menu per row: Move up, Move down, Make / Undo sub-step,
  Delete. Sections: grip + ⋯ (Move up, Move down, Delete). Header ⋯ holds "Reset to built-in"; the
  "This is a built-in set…" text is gone. Card sets get the same flat rows + grip.
- Numbers are generated from position, per part (NG tube restarts for Removal), else across the set.
  step.sub = true makes a step a sub-step of the one before: a main step followed by sub-steps is Na,
  its subs Nb, Nc… (packet style: 13a–13d, no bare 13). Steps without `sub` get it from their old num
  (a letter other than a = sub), so built-in numbers stay the same. Stored num is no longer used.
- Bugs: Starred checkbox styles fought (gone with the icon); Picker chip showed the native button border.
Lanes: A = T-27, T-28 (edit.js, app.js); B = T-25, T-26 (core/numbers.js, sets.js, index.html, Picker CSS).
API between them: SP.core.numbers.of(set) -> {stepId: '13a', ...}; sets.items() uses it for num.

## D-26 · Cleaner editor shipped (2026-11-01, v0.7.0; T-25..T-28, Haiku lanes)
Build notes and review fixes:
- core/numbers.js generates every built-in number exactly as stored (all 154 steps checked in tests).
  Parts restart numbering; letters past z go aa, ab. Edit's Make sub-step stores step.sub explicitly.
- sk-sort (kit U.sortBind): drag only from .sk-grip, Escape cancels, auto-scroll; Move up/down in ⋯ menus
  covers moves across sections. Header ⋯ holds Reset to built-in; Delete set stays at the bottom (custom sets).
- Review fixes by the build manager: section header is two lines (full title; "n steps" + scene badge
  below), since the badge cut titles to "As…" on phones; the editor's section wrapper is .sk-esec, not
  .sk-sec (that class is the set screen's section label); a Picker menu opened by tap no longer shows
  the focus ring on the current row (focusVisible:false).

## D-27 · Editor section header: range + quiet badge (Matt, 2026-11-01, v0.7.1)
Replaces D-26's two-line header. Each section row: chevron, title, its step range in small muted tabular
numbers ("2–7", "13a–13d", one step = "1"), then the scene badge. The badge is the Study kit Picker at a new
generic size, data-size="sm" (U.picker o.size; 24px, fs-1; a larger invisible tap area on touch). From 600px
it sits on the same line, pinned right before the ⋯ so badges line up; on phones it drops under the title,
aligned with the title's first letter. "n steps" left the row (the screen reader label keeps it).

## D-28 · Smart v2: one scene at a time, then the whole set; sync fixes (Matt, 2026-11-01)
Why: Smart's hidden rules (Link warm-ups, auto-split scenes, later chunks pre-filled) made 7 become 12 and
confused Matt; the phone and PC overwrote each other's rounds. Supersedes D-19's Link stage and scene split.
- Stage 1 (learn): a round is one chunk: 7 cards, or one scene exactly as tagged (never split; Med room = 41).
  Untagged sections are their own chunk. Counter = the chunk's items. The chunk is done when all its items are
  Familiar or better. Results: "Next: <chunk>" when it's done, else "Again: <chunk>".
- Stage 2 (run): every chunk done -> a round is the whole set, start to finish, plain bar. "Again: Whole set".
- No Link stage, no warm-up steps. The round header shows "<scene> · <section>" (cards: "Cards 1–7").
- Bar in stage 1: one segment per chunk; done chunks green, the current one fills with this round, later grey.
- A saved Smart round whose chunk is already done (or gone) is dropped and the current chunk starts.
  Home and the set screen show the saved round if there is one, else the next Smart round.
- Sync: every saved record carries u (time saved). Newest wins per record; progress merges per item by
  `last`. The store listens to the account collection while open and re-reads it when the tab comes back.
- Rows: the editor's .sk-row clashed with round/Results rows (v0.7.0 regression) -> editor uses .sk-erow.
- Round time = active time (gaps over 2 min between answers count as 2 min).
Lanes: A = T-30, T-31 (core/chunks.js, core/rounds.js, new core/sync.js, store/store.js, index.html);
B = T-32..T-35 (screens round/next/type/set/home/edit, study.css). API: chunks.smart(set, p) ->
{stage:'learn'|'run', chunk, index, ids, label, next}; rounds.plan stage 'learn'|'run'|null;
rounds.stale(saved, set, p) -> true when a saved learn round's chunk is done or gone.

## D-29 · Smart v2 + sync shipped (2026-11-01, v0.8.0; T-30..T-35, Haiku lanes)
Build notes:
- Store: records stamped u; account mode listens (onSnapshot, else a 30 s re-read) and re-reads on focus;
  progress writes merge per item; a finished round is a tombstone {cleared:true}, never resurrected. Known
  gaps: a set deleted while another device is open can come back; clock skew can lose a non-progress write.
- R.summary(set) feeds Home and the set screen ("<label> · i of n" for a saved round, else the next round).
  The separate "Round in progress" note is gone. Old 'link' saves count as stale.
- Round rows: one padding/number/tag layout for round and Results; the editor's rows are .sk-erow.
- Active time: r.active, gaps capped at 2 min; kept by round.js around the snapshot.
- Verified together at 390px: 0/7 first scene, "Again: Review and assess" after a miss, "Next: Med room"
  (0/41, "Med room · Prepare: all meds") after all right, a stale saved round replaced. Account sync
  across devices not testable here (Matt to check).

## D-30 · Fixes from the spike/probe test (Matt chose, 2026-11-01)
Fix: stale open tab overwriting newer answers; empty Check graded Missed; typed answer not shown; Custom with
no steps ending a round silently; scope.parse crash on "constructor"/"__proto__" (+ "Skipped: …" note for
unreadable parts); "Got it" -> "Right", "Missed hinted" -> "Missed · hint used"; Jump back in arrow overlap.
Not now (Matt): Library "0 learned" wording, "4 of 4" on Home for small card sets, Practice line wrap.
Not bugs: Shaky -> Familiar (ladder D-06), New set flow, "32-1" range.
Build notes (v0.8.1): rounds.newer compares u stamps (else answer counts); round.js adopts a newer saved round
on store change/focus, keeps typed text; a round finished elsewhere returns to the set with a toast. res.typed
holds the typed answer. refilter never finishes a round now. scope.parseDetail -> {ids, skipped}.
Build manager review fix: Start over crashed (a save now redraws at once, and the round was null) -> start,
fresh and resume set the round before saving. Editor Move up/down stays within a section (by design).

## D-31 · Visual test fixes; phone layout everywhere (Matt, 2026-11-01, v0.8.2)
Matt: the app stays a phone column on every screen size (a small study window); no PC layout.
Fixes from the visual tester (390/320, light + dark): Jump back in art smaller and under the button's layer,
hidden below 360px; carousel arrows centred around the dots; Custom chips = Proprietary Chip at Study size
(inherited font, soft --line2 ring); one toast spot, fixed at the top of the column above sheets; hint pill
"hint used" without a stray dot; "Edit selection ›" aligned with the labels.
Not bugs: editor ⋯ menu as a bottom sheet on phones; Type it hint shows only first words (D-10); one-line cue
inputs clip long text.


## D-32 · Relaxed grading, "I was correct", Smart switch, Reset data (Matt, 2026-11-02, v0.9.0)
- Grading relaxed: a key phrase of 2+ words counts when half its words (or synonyms) are said; "dose" also
  takes volume / ml / draw up. Bands: all = Right, 50%+ = open blanks, 25%+ = Shaky, less = Missed.
- Type it: the last-answer row shows "I was correct" on Missed / Shaky. It turns the answer Right and redoes
  the progress step from the item's state before it (rec.prev, rec.how).
- Placeholder card sets Pharm: Antibiotics and Normal lab values removed from the app; kept as test fixtures
  (tests/fixtures/).
- Options: Scope is Whole set / Custom. Smart is its own switch (opts.smart): scene by scene inside the scope,
  then the whole scope ("Whole set" or "Custom set"). Old saves: practice 'smart' = Whole set + Smart on.
- Home: Reset data (second tap confirms on the page; window.confirm is blocked in the artifact frame) clears all saved sets, progress, Options, rounds and meta (store.reset).
- Built by the build manager alone (small batch, no lanes). Tests 361.

## D-33 · Grading: joined/split spellings meet; check = assessment (Matt, 2026-11-02)
- Adjacent typed words also count joined ("pre administration" = "preadministration"), and a key's
  adjacent words count when typed as one word. Synonym: assessment = assess / check / evaluate.
- "I was correct" stays for real edge cases. Tests 363.
