// core/grade: one typed answer against one item -> right / shaky / missed (D-05).
// This is the prototype's "details" check only. The position-aware step matcher and the
// Claude fallback come in build step 2 and keep this same signature.
(function (SP) {
  'use strict';
  var T = SP.core.text;

  // A phrase is said when all of its words are in the answer.
  function saidAll(phrase, said) {
    var need = T.tokens(phrase);
    return need.length > 0 && need.every(function (w) { return said.indexOf(w) >= 0; });
  }
  // A key counts when the whole key or a synonym of it is said, or when any of its words has a
  // synonym that was said: "pulse ox" covers "[SpO2 probe]" because the set lists it for "spo2".
  function hasKey(key, said, synonyms) {
    var syn = synonyms || {};
    var whole = [key].concat(syn[T.norm(key)] || []);
    if (whole.some(function (p) { return saidAll(p, said); })) return true;
    return T.norm(key).split(' ').some(function (w) {
      return (syn[w] || []).some(function (p) { return saidAll(p, said); });
    });
  }

  function grade(item, typed, synonyms) {
    var said = T.tokens(typed);
    var found = [], missing = [];
    item.keys.forEach(function (k) { (hasKey(k, said, synonyms) ? found : missing).push(k); });
    var share = item.keys.length ? found.length / item.keys.length : 0;
    var result = !said.length ? 'missed' : share >= 0.75 ? 'right' : share >= 0.34 ? 'shaky' : 'missed';
    return { result: result, found: found, missing: missing, share: share };
  }

  SP.core.grade = grade;
})((typeof window !== 'undefined' ? window : globalThis).SP);
