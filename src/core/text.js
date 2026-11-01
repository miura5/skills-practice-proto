// core/text: normalising words for grading. Pure functions, no DOM (D-03, D-10).
(function (SP) {
  'use strict';
  var STOP = { the: 1, a: 1, an: 1, and: 1, or: 1, of: 1, to: 1, in: 1, on: 1, for: 1, with: 1, any: 1, each: 1, is: 1, are: 1, be: 1, it: 1, its: 1, as: 1, at: 1, by: 1, if: 1, then: 1,
    my: 1, your: 1, his: 1, her: 1, their: 1, i: 1, do: 1, from: 1, this: 1, that: 1, you: 1, we: 1, will: 1, now: 1, next: 1, so: 1, make: 1, sure: 1 };

  // Lowercase, words and numbers only. A full stop is dropped unless it sits inside a number
  // ("mrn." -> "mrn", but "3.5" stays "3.5"). "½" and "°" become words.
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/½/g, ' 1 2 ').replace(/°/g, ' degrees ')
      .replace(/[’']s\b/g, '').replace(/[’']/g, '')
      .replace(/[&+]/g, ' and ')
      .replace(/(\d)\.(\d)/g, '$1\u0001$2')
      .replace(/[^a-z0-9\u0001]+/g, ' ')
      .replace(/\u0001/g, '.')
      .replace(/\s+/g, ' ').trim();
  }

  // A light stemmer: "cleanse/cleansing/cleansed", "kidney/kidneys", "allergies/allergy",
  // "verify/verified", "slowly/slow" meet. Numbers lose a trailing ".0"; short words are kept.
  function stem(w) {
    if (/^\d/.test(w)) return w.replace(/\.0+$/, '');
    if (w.length <= 3 || /ss$/.test(w)) return w;
    var m;
    if ((m = w.match(/^(.{3,})(?:ies|ied)$/))) return m[1] + 'y';
    if ((m = w.match(/^(.{3,})(?:ingly|edly|ly)$/))) w = m[1];
    if ((m = w.match(/^(.{3,}?)(?:ing|ed|es|s|e)$/))) w = m[1];
    if (/(.)\1$/.test(w) && !/(ll|ss|ff|zz)$/.test(w) && w.length > 3) w = w.slice(0, -1); // "clipped" -> "clip"
    return w;
  }

  function tokens(s) {
    return norm(s).split(' ').filter(function (w) { return w && !STOP[w]; }).map(stem);
  }

  // One small slip is fine on longer words: a word of 6+ letters may differ by one letter
  // (added, dropped or changed). Numbers must match exactly.
  function near(a, b) {
    if (a === b) return true;
    if (/^\d/.test(a) || /^\d/.test(b)) return false;
    if (Math.min(a.length, b.length) >= 5 && (a.indexOf(b) === 0 || b.indexOf(a) === 0) && Math.abs(a.length - b.length) <= 2) return true;
    if (Math.max(a.length, b.length) < 6 || Math.min(a.length, b.length) < 5 || Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, d = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++d > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return d + (a.length - i) + (b.length - j) <= 1;
  }

  // [bracketed] phrases are the key words; text without brackets falls back to its longer words.
  function keys(text) {
    var out = [], m, re = /\[([^\]]+)\]/g;
    while ((m = re.exec(text))) out.push(m[1]);
    if (!out.length) out = tokens(text).filter(function (w) { return w.length > 3; }).slice(0, 4);
    return out;
  }
  function plain(text) { return String(text || '').replace(/[\[\]]/g, ''); }

  SP.core.text = { norm: norm, stem: stem, tokens: tokens, near: near, keys: keys, plain: plain, STOP: STOP };
})((typeof window !== 'undefined' ? window : globalThis).SP);
