// core/rounds: which items a round asks, from the set's Options (D-07) and the Smart plan (D-19).
// Practice: 'smart' (default: the current chunk from core/chunks, link steps first, or the whole set
// in Run), 'whole' (every item), or a section id (that section). Starred only, skip learned and weak
// first still apply; shuffle applies to card sets only (procedures keep strict order).
(function (SP) {
  'use strict';
  var DEFAULTS = { practice: 'smart', starred: false, weakFirst: false, skipLearned: false, shuffle: false };

  // The Practice choice, reading old saves: a stored section:'<id>' (before D-19) still means that section.
  function practiceOf(opts) {
    var o = opts || {};
    if (o.section && o.section !== 'all') return o.section;
    return o.practice || 'smart';
  }

  // The round's plan: { practice, stage, chunk, label, ids, link }. stage is 'learn' | 'link' | 'run'
  // for Smart and null otherwise; chunk is the chunk id (null in Run). A section that no longer
  // exists falls back to Smart; Smart without a set asks the whole list.
  function plan(items, opts, progress, set) {
    var pr = practiceOf(opts);
    if (pr !== 'smart' && pr !== 'whole' && !(items || []).some(function (it) { return it.section === pr; })) pr = 'smart';
    if (pr !== 'smart' || !set) return { practice: pr, stage: null, chunk: null, label: null, ids: null, link: [] };
    var s = SP.core.chunks.smart(set, progress || {});
    return { practice: 'smart', stage: s.stage, chunk: s.chunk ? s.chunk.id : null, label: s.label, ids: s.ids, link: s.link };
  }

  // build(items, opts, progress, set, basis): the items to ask, in order. progress drives the filters;
  // basis (default: progress) drives the Smart plan, so a mid-round rebuild keeps the round's chunk.
  function build(items, opts, progress, set, basis) {
    var o = Object.assign({}, DEFAULTS, opts || {});
    var p = progress || {};
    var pl = plan(items, o, basis || p, set);
    var list;
    if (pl.ids) {
      var by = {};
      items.forEach(function (it) { by[it.id] = it; });
      list = pl.ids.map(function (id) { return by[id]; }).filter(Boolean);
    } else if (pl.practice === 'smart' || pl.practice === 'whole') list = items.slice();
    else list = items.filter(function (it) { return it.section === pl.practice; });
    list = list.filter(function (it) {
      if (o.starred && !it.star) return false;
      if (o.skipLearned && (p[it.id] || {}).state === 'learned') return false;
      return true;
    });
    // Link steps stay first, in plan order; shuffle and weak first only reorder the rest.
    var head = list.filter(function (it) { return pl.link.indexOf(it.id) >= 0; });
    var body = list.filter(function (it) { return pl.link.indexOf(it.id) < 0; });
    if (o.shuffle && (set ? set.kind === 'cards' : true)) {
      body = body.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; });
    }
    if (o.weakFirst) {
      var weak = body.filter(function (it) { return (p[it.id] || {}).state === 'weak'; });
      body = weak.concat(body.filter(function (it) { return weak.indexOf(it) < 0; }));
    }
    return head.concat(body);
  }

  // A round as saved between visits: JSON-safe, without the on-screen bits (flip, hint, open blanks).
  // stage / chunk / label are the round's Smart plan (null when not Smart; absent in saves before D-19).
  function snapshot(r) {
    if (!r) return null;
    return JSON.parse(JSON.stringify({ mode: r.mode, ids: r.ids, i: r.i, res: r.res || [], notes: r.notes || {}, before: r.before || {}, t0: r.t0,
      stage: r.stage, chunk: r.chunk, label: r.label }));
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
    var r = {
      mode: saved.mode, ids: done.concat(left), i: done.length,
      res: (saved.res || []).filter(function (x) { return x && have[x.id]; }),
      notes: notes, before: Object.assign({}, saved.before), t0: saved.t0 || Date.now(),
      flip: false, hint: false, open: null
    };
    // A save from before D-19 has no plan: stage stays undefined (not null), so screens can tell.
    ['stage', 'chunk', 'label'].forEach(function (k) { if (k in saved) r[k] = saved[k]; });
    return r;
  }

  // T-08: one round per set, shared by every mode. Starting any mode continues the saved round
  // (same ids, i and answers) in that mode; null means build a fresh round.
  function pick(saved, items, mode) {
    var r = restore(saved, items);
    if (r && mode) r.mode = mode;
    return r;
  }

  // The mode label for Results: the one mode used, or 'mixed' when answers came from both.
  function modeOf(r) {
    var seen = {};
    (r.res || []).forEach(function (x) { if (x.mode) seen[x.mode] = true; });
    var k = Object.keys(seen);
    return k.length > 1 ? 'mixed' : k[0] || r.mode;
  }

  // A progress map from a round's before-states ({id: state}): the basis its plan was made from.
  function basisOf(r) {
    var m = {}, b = (r && r.before) || {};
    Object.keys(b).forEach(function (id) { m[id] = { state: b[id] }; });
    return m;
  }

  SP.core.rounds = { build: build, plan: plan, practiceOf: practiceOf, basisOf: basisOf, DEFAULTS: DEFAULTS, snapshot: snapshot, restore: restore, pick: pick, modeOf: modeOf };
})((typeof window !== 'undefined' ? window : globalThis).SP);
