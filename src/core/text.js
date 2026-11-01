// core/text: normalising words for grading. Pure functions, no DOM (D-03).
(function (SP) {
  'use strict';
  var STOP = { the: 1, a: 1, an: 1, and: 1, or: 1, of: 1, to: 1, in: 1, on: 1, for: 1, with: 1, any: 1, each: 1, is: 1, are: 1, be: 1, it: 1, its: 1, as: 1, at: 1, by: 1, if: 1, then: 1 };

  function norm(s) {
    return String(s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9.\s-]/g, ' ').replace(/[-]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  // A light stemmer: enough to make "cleanse/cleansing/cleansed" and "kidney/kidneys" meet.
  function stem(w) {
    if (/^\d/.test(w)) return w.replace(/\.0+$/, '');
    return w.replace(/(ing|ed|es|s|e)$/, '');
  }
  function tokens(s) {
    return norm(s).split(' ').filter(function (w) { return w && !STOP[w]; }).map(stem);
  }
  // [bracketed] phrases are the key words; text without brackets falls back to its longer words.
  function keys(text) {
    var out = [], m, re = /\[([^\]]+)\]/g;
    while ((m = re.exec(text))) out.push(m[1]);
    if (!out.length) out = tokens(text).filter(function (w) { return w.length > 3; }).slice(0, 4);
    return out;
  }
  function plain(text) { return String(text || '').replace(/[\[\]]/g, ''); }

  SP.core.text = { norm: norm, stem: stem, tokens: tokens, keys: keys, plain: plain };
})((typeof window !== 'undefined' ? window : globalThis).SP);
