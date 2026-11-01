// core/numbers: step numbers generated from position (D-25). Procedures only; cards number by position in sets.items().
//   Counting: sections with the same part share a counter; a new part (a change from the previous counted section's
//   part) restarts it at 1. No parts on the set -> one counter across the whole set.
//   Sub-steps: step.sub === true makes a step a sub-step of the one before. When sub is unset, a num ending in a
//   letter other than 'a' (13b, 28c) counts as a sub-step. The first step of a counter run is never a sub-step.
//   A main step followed by sub-steps is Na, its subs Nb, Nc, ... (packet style: no bare N). Otherwise just N.
(function (SP) {
  'use strict';

  // Sub-step test for a step (its own fields only; the first-of-run rule is applied by of()).
  function isSub(st) {
    if (!st) return false;
    if (st.sub === true) return true;
    if (st.sub === false) return false;
    var m = /^\d+([a-z]+)$/i.exec(String(st.num == null ? '' : st.num).trim());
    return !!m && m[1].toLowerCase() !== 'a';
  }

  // Letter for the k-th sub-step (0 -> a, 25 -> z, 26 -> aa).
  function letter(k) {
    var s = '', n = k + 1;
    while (n > 0) { s = String.fromCharCode(97 + ((n - 1) % 26)) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }

  // Labels one run of steps (already grouped by counter) into out.
  function label(steps, out) {
    var n = 0, i = 0;
    while (i < steps.length) {
      n++;
      var subs = 0;
      // i is a main step; the steps after it that are sub-steps belong to it (never the first of the run).
      while (i + subs + 1 < steps.length && isSub(steps[i + subs + 1])) subs++;
      if (subs) {
        out[steps[i].id] = n + 'a';
        for (var m = 1; m <= subs; m++) out[steps[i + m].id] = n + letter(m);
      } else {
        out[steps[i].id] = String(n);
      }
      i += 1 + subs;
    }
  }

  // {stepId: label} for a procedure set; {} for anything else.
  function of(set) {
    var out = {};
    if (!set || set.kind !== 'procedure') return out;
    var usesParts = Array.isArray(set.parts) && set.parts.length > 0;
    var groups = [], cur = null;
    (set.sections || []).forEach(function (sec) {
      var steps = sec.steps || [];
      if (!steps.length) return;
      var part = usesParts && sec.part != null ? String(sec.part) : '';
      if (!cur || part !== cur.part) { cur = { part: part, steps: [] }; groups.push(cur); }
      steps.forEach(function (st) { cur.steps.push(st); });
    });
    groups.forEach(function (g) { label(g.steps, out); });
    return out;
  }

  // True when a label is a sub-step label (13b, 27aa); a main step with subs is 13a, which is not.
  function isSubLabel(lab) {
    var m = /^\d+([a-z]+)$/i.exec(String(lab));
    return !!m && m[1].toLowerCase() !== 'a';
  }

  SP.core.numbers = { of: of, isSub: isSub, isSubLabel: isSubLabel };
})((typeof window !== 'undefined' ? window : globalThis).SP);
