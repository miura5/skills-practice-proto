// core/sets: the content schema (D-04). One set has a kind; the app reads it only through items().
//   procedure: {id, kind:'procedure', title, parts?, sections:[{id, title, steps:[{id, num, star, cue, text}]}], synonyms?}
//   cards:     {id, kind:'cards', title, cards:[{id, front, back}]}
// A step's or card's [bracketed] words are its key words for Type it.
(function (SP) {
  'use strict';
  var T = SP.core.text;

  // Flatten any set into the items every mode works on.
  function items(set) {
    if (set.kind === 'cards') {
      return (set.cards || []).map(function (c, i) {
        return { id: c.id, num: String(i + 1), section: null, star: false, front: c.front,
          cue: c.front, answer: T.plain(c.back), raw: c.back, keys: T.keys(c.back) };
      });
    }
    var out = [];
    (set.sections || []).forEach(function (sec) {
      (sec.steps || []).forEach(function (st) {
        out.push({ id: st.id, num: st.num || st.id, section: sec.id, sectionTitle: sec.title, star: !!st.star,
          cue: st.cue || '', answer: T.plain(st.text), raw: st.text, keys: T.keys(st.text) });
      });
    });
    out.forEach(function (it, i) { it.prev = i ? out[i - 1] : null; });
    return out;
  }

  // Returns a list of problems; empty means the set is valid.
  function validate(set) {
    var errs = [];
    if (!set || typeof set !== 'object') return ['not a set'];
    if (!/^[a-z0-9-]{2,60}$/.test(set.id || '')) errs.push('id must be 2–60 lowercase letters, digits or dashes');
    if (!set.title) errs.push('title is missing');
    if (set.kind !== 'procedure' && set.kind !== 'cards') errs.push('kind must be procedure or cards');
    var list = items(set), seen = {};
    list.forEach(function (it) {
      if (seen[it.id]) errs.push('duplicate item id ' + it.id);
      seen[it.id] = 1;
      if (!it.answer.trim()) errs.push('item ' + it.num + ' has no text');
    });
    return errs;
  }

  function slug(s) { return T.norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'set'; }

  SP.core.sets = { items: items, validate: validate, slug: slug };
})((typeof window !== 'undefined' ? window : globalThis).SP);
