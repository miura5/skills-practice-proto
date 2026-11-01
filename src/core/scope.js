// core/scope: the Scope of a round (D-22). Custom scope is a list of item ids in set order, kept in the
// set's settings as settings.custom. Here: reading and writing a range text ("1, 8–12, 15–32"), and the
// selection itself, including the old saved section option (pre-D-22), which means that section's steps.
(function (SP) {
  'use strict';
  var KNOWN = ['smart', 'whole', 'custom'];

  function norm(n) { return String(n == null ? '' : n).trim().toLowerCase(); }

  // The old section option, if the settings still carry one: a section id in settings.section (or an
  // unknown id in settings.practice, from before D-19's Practice select). null otherwise.
  function legacy(o) {
    o = o || {};
    if (o.practice === 'custom') return null;
    if (o.section && o.section !== 'all') return o.section;
    if (o.practice && KNOWN.indexOf(o.practice) < 0) return o.practice;
    return null;
  }

  // The item ids a custom scope covers, in set order. Unknown ids are dropped. An old section option
  // covers that section's steps.
  function selected(opts, items) {
    var o = opts || {}, all = items || [], sec = legacy(o), mine = {};
    if (sec) return all.filter(function (it) { return it.section === sec; }).map(function (it) { return it.id; });
    (o.custom || []).forEach(function (id) { mine[id] = true; });
    return all.filter(function (it) { return mine[it.id]; }).map(function (it) { return it.id; });
  }

  // Reads "1, 8–12, 15a-32": commas or semicolons between parts; a part is one step number or a range
  // a–b (en dash, em dash or hyphen, spaces allowed). A range spans set order from a to b inclusive,
  // whichever comes first. A bare number also means its lettered steps: 15 is 15a..15q. Unknown
  // numbers are ignored (a range with an unknown end is dropped). Returns ids in set order.
  function parse(text, items) {
    var list = items || [], at = {}, family = {}, hit = {};
    var base = function (n) { return norm(n).replace(/[a-z]+$/, ''); };
    list.forEach(function (it, k) {
      if (!(norm(it.num) in at)) at[norm(it.num)] = k;
      (family[base(it.num)] = family[base(it.num)] || []).push(k);
    });
    // The item indexes a token names: its exact step, else all steps with that number.
    var named = function (tok) {
      var k = at[norm(tok)];
      if (k != null) return [k];
      return family[norm(tok)] || [];
    };
    String(text == null ? '' : text).split(/[,;]+/).forEach(function (part) {
      var t = part.trim(), ends, x, y, lo, hi, k;
      if (!t) return;
      ends = t.split(/\s*[\u2013\u2014-]\s*/);
      if (ends.length === 2) {
        x = named(ends[0]);
        y = named(ends[1]);
        if (!x.length || !y.length) return;
        lo = Math.min(x[0], y[0]);
        hi = Math.max(x[x.length - 1], y[y.length - 1]);
        for (k = lo; k <= hi; k++) hit[list[k].id] = true;
      } else if (ends.length === 1) {
        named(t).forEach(function (j) { hit[list[j].id] = true; });
      }
    });
    return list.filter(function (it) { return hit[it.id]; }).map(function (it) { return it.id; });
  }

  // Writes ids as "1, 8–12, 15–32": runs that are consecutive in set order become a range.
  function format(ids, items) {
    var sel = {}, out = [], run = null;
    (ids || []).forEach(function (id) { sel[id] = true; });
    var close = function () {
      if (!run) return;
      out.push(run.length === 1 ? run[0].num : run[0].num + '–' + run[run.length - 1].num);
      run = null;
    };
    (items || []).forEach(function (it) {
      if (!sel[it.id]) { close(); return; }
      if (run) run.push(it); else run = [it];
    });
    close();
    return out.join(', ');
  }

  SP.core.scope = { legacy: legacy, selected: selected, parse: parse, format: format };
})((typeof window !== 'undefined' ? window : globalThis).SP);
