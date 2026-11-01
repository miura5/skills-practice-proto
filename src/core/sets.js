// core/sets: the content schema (D-04). One set has a kind; the app reads it only through items().
//   procedure: {id, kind:'procedure', title, parts?, scenes?, sections:[{id, title, scene?, steps:[{id, num, star, cue, text}]}], synonyms?}
//              scenes: [{id, label}] tags (D-19); a section's scene is '' / missing or one scene id.
//              Tag ids are stable (sets.tagId), so renaming a label keeps the sections' assignments.
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
        out.push({ id: st.id, num: st.num || st.id, section: sec.id, sectionTitle: sec.title, scene: sec.scene || null, star: !!st.star,
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
    // Scene tags (D-19): ids like set ids, non-empty labels, no duplicates; sections point at a known one.
    var tags = {};
    if (set.scenes != null && !Array.isArray(set.scenes)) errs.push('scenes must be a list');
    else (set.scenes || []).forEach(function (t) {
      var id = t && t.id;
      if (!/^[a-z0-9-]{1,60}$/.test(id || '')) errs.push('scene id must be lowercase letters, digits or dashes');
      else if (tags[id]) errs.push('duplicate scene ' + id);
      if (!t || !String(t.label || '').trim()) errs.push('scene ' + (id || '?') + ' has no name');
      if (id) tags[id] = 1;
    });
    (set.sections || []).forEach(function (sec) {
      if (sec.scene && !tags[sec.scene]) errs.push('section ' + (sec.title || sec.id) + ' has an unknown scene ' + sec.scene);
    });
    return errs;
  }

  function slug(s) { return T.norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'set'; }

  // A stable id for a new tag: the label's slug, made unique against taken (a list of ids).
  function tagId(label, taken) {
    var base = slug(label), id = base, n = 2, used = {};
    (taken || []).forEach(function (t) { used[t] = 1; });
    while (used[id]) id = base + '-' + n++;
    return id;
  }

  SP.core.sets = { items: items, validate: validate, slug: slug, tagId: tagId };
})((typeof window !== 'undefined' ? window : globalThis).SP);
