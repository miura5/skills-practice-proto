// core/chunks: chunked learning (D-19, v2 in D-28). A set splits into chunks; a Smart round works through them.
//   cards:     fixed chunks of 7 in set order; a last chunk under 4 joins the one before.
//   procedure: scenes. set.scenes = [{id, label}]; a section has at most one section.scene.
//              A scene = all sections with its tag, ordered by its first section, never split (one
//              scene = one chunk however long). An untagged section (or one with an unknown scene id)
//              is its own chunk.
// Smart (D-28): learn the first chunk that is not all Familiar or better, one chunk per round; once every
// chunk is done, run the whole set once. No Link steps.
(function (SP) {
  'use strict';
  var CARD_SIZE = 7, CARD_MIN = 4, WHOLE = 'Whole set';

  function ids(list) { return list.map(function (it) { return it.id; }); }

  function cardChunks(all) {
    var groups = [];
    for (var i = 0; i < all.length; i += CARD_SIZE) groups.push(all.slice(i, i + CARD_SIZE));
    if (groups.length > 1 && groups[groups.length - 1].length < CARD_MIN) {
      var last = groups.pop();
      groups[groups.length - 1] = groups[groups.length - 1].concat(last);
    }
    var start = 1;
    return groups.map(function (g, n) {
      var c = { id: 'k' + (n + 1), label: 'Cards ' + start + '–' + (start + g.length - 1), ids: ids(g), sections: [] };
      start += g.length;
      return c;
    });
  }

  function procChunks(set, all) {
    var scenes = {};
    (set.scenes || []).forEach(function (s) { if (s && s.id) scenes[s.id] = s; });
    var bySec = {};
    all.forEach(function (it) { (bySec[it.section] = bySec[it.section] || []).push(it); });
    // Only sections with steps count, in set order.
    var secs = (set.sections || []).filter(function (sec) { return bySec[sec.id]; });
    var out = [], done = {};
    secs.forEach(function (sec) {
      var tag = sec.scene && scenes[sec.scene] ? sec.scene : null;
      if (!tag) {
        out.push({ id: 'sec:' + sec.id, label: sec.title || sec.id, ids: ids(bySec[sec.id]), sections: [sec.id] });
        return;
      }
      if (done[tag]) return;
      done[tag] = 1;
      var members = secs.filter(function (s) { return s.scene === tag; });
      out.push({
        id: 'scene:' + tag,
        label: scenes[tag].label || tag,
        ids: members.reduce(function (acc, s) { return acc.concat(ids(bySec[s.id])); }, []),
        sections: members.map(function (s) { return s.id; })
      });
    });
    return out;
  }

  function list(set) {
    if (!set) return [];
    var all = SP.core.sets.items(set);
    if (!all.length) return [];
    return set.kind === 'cards' ? cardChunks(all) : procChunks(set, all);
  }

  function ready(chunk, map) {
    var R = SP.core.progress.RANK, m = map || {};
    return chunk.ids.filter(function (id) { return R[(m[id] || { state: 'new' }).state] >= R.familiar; }).length;
  }

  function segments(chunks, map) {
    return chunks.map(function (c) { return { id: c.id, label: c.label, total: c.ids.length, ready: ready(c, map) }; });
  }

  function isLearned(chunk, map) { return ready(chunk, map) === chunk.ids.length; }

  // The Smart plan: { stage, chunk, index, ids, label, next }.
  //   learn: chunk = the first chunk not learned; ids = exactly its ids; next = the label of the following
  //          chunk not learned, or 'Whole set'.
  //   run:   every chunk learned; ids = the whole set in set order; chunk null, index -1, next null.
  function smart(set, map) {
    var chunks = list(set);
    var index = -1;
    for (var i = 0; i < chunks.length; i++) if (!isLearned(chunks[i], map)) { index = i; break; }
    if (index < 0) {
      var whole = set ? ids(SP.core.sets.items(set)) : [];
      return { stage: 'run', chunk: null, index: -1, ids: whole, label: WHOLE, next: null };
    }
    var chunk = chunks[index], next = WHOLE;
    for (var j = index + 1; j < chunks.length; j++) if (!isLearned(chunks[j], map)) { next = chunks[j].label; break; }
    return { stage: 'learn', chunk: chunk, index: index, ids: chunk.ids.slice(), label: chunk.label, next: next };
  }

  function of(set, itemId) {
    var chunks = list(set);
    for (var i = 0; i < chunks.length; i++) if (chunks[i].ids.indexOf(itemId) >= 0) return chunks[i];
    return null;
  }

  SP.core.chunks = { list: list, segments: segments, isLearned: isLearned, smart: smart, of: of, CARD_SIZE: CARD_SIZE };
})((typeof window !== 'undefined' ? window : globalThis).SP);
