// core/grade: one typed answer against one item (D-05, D-10). Pure: no DOM, no storage, no state.
//
//   grade(item, typed, set, opts) -> {
//     result: 'right' | 'open' | 'shaky' | 'missed' | 'nearby',
//     parts: [{text, label, have}], found, missing, share, hinted, nearby: {id, num, cue} | null }
//
// Stage 1, recognise: score the answer against the current step and its neighbours (±3) by
//   cue + key words, rarer words weighing more. If a nearby different step fits clearly better
//   and the current step's details don't, the result is 'nearby' (not marked wrong).
// Stage 2, details: every key part said = right. 60%+ = 'open' (the row stays open and the
//   missing parts are asked as inline blanks). 34-59% = shaky. Less = missed.
//   Blanks come back with opts.fill = [text per missing part, in order]: all filled = right,
//   any still missing = shaky.
// opts.hinted: a hinted answer is graded the same and tagged hinted (the ladder caps it, D-06).
// The third argument may also be a bare synonyms map (older callers).
(function (SP) {
  'use strict';
  var T = SP.core.text, K = SP.core.keys;
  var NEAR = 3, MIN_SURE = 0.42, RATIO = 1.25;

  function asSet(x) {
    if (!x) return {};
    return (x.kind || x.sections || x.cards || x.synonyms || x.grading) ? x : { synonyms: x };
  }

  // Word weights for an item: plain text 1, cue 2, key words 3.
  function weights(it, lex) {
    var w = {};
    function add(text, r) { lex.read(text).all.forEach(function (t) { if (!w[t] || w[t] < r) w[t] = r; }); }
    add(it.answer || '', 1); add(it.cue || '', 2); (it.keys || []).forEach(function (k) { add(k, 3); });
    return w;
  }
  function idfOf(ws) {
    var df = {}, idf = {};
    ws.forEach(function (w) { Object.keys(w).forEach(function (t) { df[t] = (df[t] || 0) + 1; }); });
    Object.keys(df).forEach(function (t) { idf[t] = Math.log(1 + ws.length / df[t]); });
    return idf;
  }
  // How well the answer fits one item: share of the answer explained, times key coverage.
  function fit(said, w, idf) {
    var has = {}, m = 0, inM = 0, km = 0, kh = 0;
    said.forEach(function (t) {
      has[t] = 1; var f = idf[t] || 1.5; inM += f;
      var hit = w[t] || Object.keys(w).filter(function (x) { return T.near(x, t); }).map(function (x) { return w[x]; })[0];
      if (hit) m += f * (hit === 1 ? 0.6 : 1);
    });
    Object.keys(w).forEach(function (t) { if (w[t] >= 2) { km += idf[t] || 1; if (has[t]) kh += idf[t] || 1; } });
    var p = inM ? m / inM : 0, cov = km ? kh / km : 0;
    return p * (0.55 + 0.45 * cov);
  }

  function band(share) { return share >= 1 ? 'right' : share >= 0.6 ? 'open' : share >= 0.34 ? 'shaky' : 'missed'; }

  function grade(item, typed, setArg, opts) {
    var set = asSet(setArg), o = opts || {}, lex = K.lexicon(set.synonyms), gr = set.grading || {};
    var gs = K.groups(item, gr);
    var s = K.score(gs, typed || '', lex);
    var out = { result: 'missed', parts: s.parts, found: s.found, missing: s.missing, share: s.share, hinted: !!o.hinted, nearby: null };
    if (!T.tokens(typed).length && !o.fill) { out.share = 0; return out; }

    // Stage 2b: the blanks came back.
    if (o.fill) {
      var k = 0;
      s.parts.forEach(function (p) {
        if (p.have) return;
        var f = o.fill[k++] || '';
        p.have = K.score([{ text: p.text, parts: [{ text: p.text, alts: gs[p.group].parts.filter(function (x) { return x.text === p.text; }).map(function (x) { return x.alts; })[0] || [p.text] }], loose: gs[p.group].loose }], f + ' ' + typed, lex).share === 1;
      });
      out.found = s.parts.filter(function (p) { return p.have; }).map(function (p) { return p.label; });
      out.missing = s.parts.filter(function (p) { return !p.have; }).map(function (p) { return p.label; });
      out.share = s.parts.length ? out.found.length / s.parts.length : 1;
      out.result = out.missing.length ? 'shaky' : 'right';
      return out;
    }

    out.result = band(s.share);

    // Stage 1: recognise against the neighbours (procedures, when the set is known).
    if (out.result !== 'right' && set.kind === 'procedure' && SP.core.sets) {
      var list = SP.core.sets.items(set), at = -1;
      list.forEach(function (x, i) { if (x.id === item.id) at = i; });
      if (at >= 0) {
        var ws = list.map(function (x) { return weights(x, lex); }), idf = idfOf(ws), said = lex.read(typed).canon;
        var cur = fit(said, ws[at], idf), best = null;
        for (var i = Math.max(0, at - NEAR); i <= Math.min(list.length - 1, at + NEAR); i++) {
          if (i === at) continue;
          var f = fit(said, ws[i], idf);
          if (!best || f > best.f) best = { f: f, it: list[i] };
        }
        if (best && best.f >= MIN_SURE && best.f > cur * RATIO && s.share < 0.6) {
          var bs = K.score(K.groups(best.it, gr), typed, lex).share;
          if (bs > s.share) {
            out.result = 'nearby';
            out.nearby = { id: best.it.id, num: best.it.num, cue: best.it.cue };
          }
        }
      }
    }
    return out;
  }

  SP.core.grade = grade;
})((typeof window !== 'undefined' ? window : globalThis).SP);
