// core/progress: the Weak / Familiar / Learned ladder (D-06).
// - missed            -> Weak
// - shaky             -> Familiar (a Learned item drops to Familiar)
// - right, unprompted -> one step of the streak; two in a row in Type it = Learned
// - right in Next Step or with a hint -> Familiar at most
(function (SP) {
  'use strict';
  var RANK = { new: 0, weak: 1, familiar: 2, learned: 3 };

  function blank() { return { state: 'new', streak: 0, seen: 0 }; }

  function apply(rec, result, how) {
    var r = Object.assign(blank(), rec || {});
    r.seen += 1;
    r.last = Date.now();
    if (result === 'missed') { r.state = 'weak'; r.streak = 0; return r; }
    if (result === 'shaky') { r.state = 'familiar'; r.streak = 0; return r; }
    var unprompted = how === 'type';
    r.streak = unprompted ? r.streak + 1 : 0;
    if (unprompted && r.streak >= 2) r.state = 'learned';
    else if (RANK[r.state] < RANK.familiar) r.state = 'familiar';
    return r;
  }

  // Counts for a set: {new, weak, familiar, learned, total}.
  function tally(items, map) {
    var t = { new: 0, weak: 0, familiar: 0, learned: 0, total: items.length };
    items.forEach(function (it) { t[((map || {})[it.id] || blank()).state] += 1; });
    return t;
  }

  SP.core.progress = { blank: blank, apply: apply, tally: tally, RANK: RANK };
})((typeof window !== 'undefined' ? window : globalThis).SP);
