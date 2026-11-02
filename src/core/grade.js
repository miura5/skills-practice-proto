// core/grade: one typed answer against one item (D-05, D-10, D-19). Pure: no DOM, no storage, no state.
//
//   grade(item, typed, set, opts) -> {
//     result: 'right' | 'open' | 'shaky' | 'missed',
//     parts: [{text, label, have}], found, missing, share, hinted }
//
// Strict order (D-19): the answer is graded only against the current item, never other steps.
// Every key part said = right. 60%+ = 'open' (the row stays open and the missing parts are
//   asked as inline blanks). 34-59% = shaky. Less = missed.
//   Blanks come back with opts.fill = [text per missing part, in order]: all filled = right,
//   any still missing = shaky.
// opts.hinted: a hinted answer is graded the same and tagged hinted (the ladder caps it, D-06).
// The third argument may also be a bare synonyms map (older callers).
(function (SP) {
  'use strict';
  var T = SP.core.text, K = SP.core.keys;

  function asSet(x) {
    if (!x) return {};
    return (x.kind || x.sections || x.cards || x.synonyms || x.grading) ? x : { synonyms: x };
  }

  function band(share) { return share >= 1 ? 'right' : share >= 0.5 ? 'open' : share >= 0.25 ? 'shaky' : 'missed'; }

  function grade(item, typed, setArg, opts) {
    var set = asSet(setArg), o = opts || {}, lex = K.lexicon(set.synonyms), gr = set.grading || {};
    var gs = K.groups(item, gr);
    var s = K.score(gs, typed || '', lex);
    var out = { result: 'missed', parts: s.parts, found: s.found, missing: s.missing, share: s.share, hinted: !!o.hinted };
    if (!T.tokens(typed).length && !o.fill) { out.share = 0; return out; }

    // The blanks came back.
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
    return out;
  }

  SP.core.grade = grade;
})((typeof window !== 'undefined' ? window : globalThis).SP);
