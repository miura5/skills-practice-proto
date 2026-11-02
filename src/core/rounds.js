// core/rounds: which items a round asks, from the set's Options (D-07), the Smart plan (D-19, D-28) and the
// Scope (D-22). Practice: 'smart' (default: the current chunk from core/chunks, or the whole set in Run),
// 'whole' (every item), or 'custom' (the steps picked in the scope editor, core/scope). An old saved section
// option (pre-D-22) means 'custom' with that section's steps.
// Starred only, skip learned and weak first still apply; shuffle applies to card sets only.
(function (SP) {
  'use strict';
  var DEFAULTS = { practice: 'smart', starred: false, weakFirst: false, skipLearned: false, shuffle: false };
  var S = SP.core.scope;

  // The Practice choice. An old section option (stored section:'<id>', or an unknown practice id) reads
  // as 'custom': that section's steps (core/scope.legacy).
  function practiceOf(opts) {
    var o = opts || {};
    if (S.legacy(o)) return 'custom';
    return o.practice === 'whole' || o.practice === 'custom' ? o.practice : 'smart';
  }

  // The round's plan: { practice, stage, chunk, label, ids }. stage is 'learn' | 'run' for Smart and null
  // otherwise; chunk is the chunk id (null in Run). An old section that no longer exists falls back to
  // Smart; Smart without a set asks the whole list.
  // D-32: Smart is its own switch (opts.smart), on top of the Scope (whole / custom). Saves from before
  // D-32 have no switch: practice 'smart' means on, anything else off.
  function smartOn(opts) {
    var o = opts || {};
    return typeof o.smart === 'boolean' ? o.smart : practiceOf(o) === 'smart';
  }
  function scopeOf(opts) { return practiceOf(opts) === 'custom' ? 'custom' : 'whole'; }

  function plan(items, opts, progress, set) {
    var pr = practiceOf(opts), sec = S.legacy(opts), o = opts || {};
    if (sec && !(items || []).some(function (it) { return it.section === sec; })) pr = 'smart';
    var on = typeof o.smart === 'boolean' ? o.smart : pr === 'smart';
    if (!on || !set) return { practice: pr === 'smart' && set ? 'whole' : pr, stage: null, chunk: null, label: null, ids: null };
    var s = SP.core.chunks.smart(set, progress || {}, pr === 'custom' ? S.selected(o, items) : null);
    return { practice: 'smart', stage: s.stage, chunk: s.chunk ? s.chunk.id : null, label: s.label, ids: s.ids };
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
    } else if (pl.practice === 'custom') {
      var picked = {};
      S.selected(o, items).forEach(function (id) { picked[id] = true; });
      list = items.filter(function (it) { return picked[it.id]; });
    } else list = items.slice();
    list = list.filter(function (it) {
      if (o.starred && !it.star) return false;
      if (o.skipLearned && (p[it.id] || {}).state === 'learned') return false;
      return true;
    });
    if (o.shuffle && (set ? set.kind === 'cards' : true)) {
      list = list.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; });
    }
    if (o.weakFirst) {
      var weak = list.filter(function (it) { return (p[it.id] || {}).state === 'weak'; });
      list = weak.concat(list.filter(function (it) { return weak.indexOf(it) < 0; }));
    }
    return list;
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

  // stale (D-28): a saved Smart learn round whose chunk is already done or gone is replaced by the current
  // chunk. Old 'link' rounds (pre-D-28) are always stale. Run rounds, non-Smart rounds and no save: false.
  function stale(saved, set, progress) {
    if (!saved) return false;
    if (saved.stage === 'link') return true;
    if (saved.stage !== 'learn') return false;
    var c = SP.core.chunks.list(set).filter(function (x) { return x.id === saved.chunk; })[0];
    return !c || SP.core.chunks.isLearned(c, progress || {});
  }

  // T-36 (D-30): is the saved copy of a round newer than this screen's copy? saved: the store's record (u = when
  // it was saved; null when cleared or none). mine: this screen's round (u = its own last save, when known).
  // Both stamped: the later stamp wins. Otherwise the copy with more answers wins.
  function newer(saved, mine) {
    if (!saved || saved.cleared) return false;
    if (!mine) return true;
    if (typeof saved.u === 'number' && typeof mine.u === 'number') return saved.u > mine.u;
    return (saved.res || []).length > (mine.res || []).length;
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

  SP.core.rounds = { build: build, selected: S.selected, plan: plan, practiceOf: practiceOf, smartOn: smartOn, scopeOf: scopeOf, basisOf: basisOf, DEFAULTS: DEFAULTS, snapshot: snapshot, restore: restore, pick: pick, stale: stale, modeOf: modeOf, newer: newer };
})((typeof window !== 'undefined' ? window : globalThis).SP);
