# Skills Practice prototype: the codebase

    index.html              loads the CSS, then the scripts in order (no build step)
    ds/
      proprietary.css       layer 1: E.V.'s design system, unchanged (D-02)
      study.css             layer 2: Study theme + sk- components
    content/                built-in sets, one file each (D-04)
      procedures/           med-admin.js (94 steps), ngt.js (60 steps)
      cards/                pharm-antibiotics.js, lab-values.js (placeholders)
    src/
      sp.js                 the SP namespace and the content registry
      core/                 pure functions, no DOM, no storage (D-03)
        text.js             normalising, stems, [key words]
        sets.js             schema, items(), validate()
        grade.js            one answer -> right / shaky / missed (D-05)
        progress.js         Weak / Familiar / Learned ladder (D-06)
        chunks.js           scenes / card chunks, Learn-Link-Run, Smart round (D-19)
        scope.js            custom scope: range text ("1, 8–12") and the picked steps (D-22)
        rounds.js           which items a round asks (D-07)
      store/store.js        account or browser storage (D-08)
      ui/kit.js             Study kit markup helpers
      screens/              home, library, set (+ Options), round (+ Results),
                            next, type, edit, about
      app.js                state, routing, events (D-09)
      app.css               page layout only
    tests/core.test.js      node tests/core.test.js
    docs/                   DECISIONS.md (this Chart), README.md (this file)

## Where to change things
- Add or edit content in the app (Library > +, or a set's Edit), or edit a file in content/.
- A new mode: a screen file that draws the current item and calls round.record().
- A grading rule: core/grade.js plus a test line in tests/core.test.js.
- A look: the token values in ds/study.css (theme) or an sk- component there.

## Mapping to the real build (the outline)
    content/        -> content/ + schema/ (CI-validated)
    src/core/       -> src/core/ (grading, progress, rounds)
    src/screens/    -> src/modes/ + src/screens/
    ds/             -> Proprietary package + study kit
    src/store/      -> src/sync/ + worker/ (D1, sign-in)
    tests/          -> tests/unit/; tests/e2e/ comes with the real build
