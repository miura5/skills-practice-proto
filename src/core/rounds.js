// core/rounds: which items a round asks, from the set's Options (D-07).
(function (SP) {
  'use strict';
  var DEFAULTS = { section: 'all', starred: false, weakFirst: false, skipLearned: false, shuffle: false };

  function build(items, opts, progress) {
    var o = Object.assign({}, DEFAULTS, opts || {});
    var p = progress || {};
    var list = items.filter(function (it) {
      if (o.section !== 'all' && it.section !== o.section) return false;
      if (o.starred && !it.star) return false;
      if (o.skipLearned && (p[it.id] || {}).state === 'learned') return false;
      return true;
    });
    if (o.shuffle) list = list.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; });
    if (o.weakFirst) {
      var weak = list.filter(function (it) { return (p[it.id] || {}).state === 'weak'; });
      list = weak.concat(list.filter(function (it) { return weak.indexOf(it) < 0; }));
    }
    return list;
  }

  // A round as saved between visits: JSON-safe, without the on-screen bits (flip, hint, open blanks, nearby).
  function snapshot(r) {
    if (!r) return null;
    return JSON.parse(JSON.stringify({ mode: r.mode, ids: r.ids, i: r.i, res: r.res || [], notes: r.notes || {}, before: r.before || {}, t0: r.t0 }));
  }

  // A saved round checked against the set as it is now: ids gone from the set are dropped (and their
  // answers), i is clamped. null when nothing is left to ask or the save is unusable.
  function restore(saved, items) {
    if (!saved || !Array.isArray(saved.ids) || (saved.mode !== 'next' && saved.mode !== 'type')) return null;
    var have = {};
    (items || []).forEach(function (it) { have[it.id] = true; });
    var done = saved.ids.slice(0, saved.i || 0).filter(function (id) { return have[id]; });
    var left = saved.ids.slice(saved.i || 0).filter(function (id) { return have[id] && done.indexOf(id) < 0; });
    if (!left.length) return null;
    var notes = {};
    Object.keys(saved.notes || {}).forEach(function (id) { if (have[id]) notes[id] = saved.notes[id]; });
    return {
      mode: saved.mode, ids: done.concat(left), i: done.length,
      res: (saved.res || []).filter(function (x) { return x && have[x.id]; }),
      notes: notes, before: Object.assign({}, saved.before), t0: saved.t0 || Date.now(),
      flip: false, hint: false, open: null, nearby: null
    };
  }

  SP.core.rounds = { build: build, DEFAULTS: DEFAULTS, snapshot: snapshot, restore: restore };
})((typeof window !== 'undefined' ? window : globalThis).SP);
