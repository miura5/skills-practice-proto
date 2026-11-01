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

  SP.core.rounds = { build: build, DEFAULTS: DEFAULTS };
})((typeof window !== 'undefined' ? window : globalThis).SP);
