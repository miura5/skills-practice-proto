// screens/round: a round's life (start, record an answer, live re-filter, finish) and Results.
// The two modes (next.js, type.js) only draw the current item and call record().
(function (SP) {
  'use strict';
  var U = SP.ui, P = SP.core.progress;

  // T-08: a saved round is continued in whichever mode was chosen; otherwise a fresh one.
  function start(app, mode) {
    var r = SP.core.rounds.pick(SP.store.round(app.set.id), app.items, mode);
    if (!r) return fresh(app, mode);
    save(app, r);
    app.update({ screen: mode, sheet: null, round: r });
    app.focus('#answer');
  }

  function fresh(app, mode) {
    var set = app.set, p = SP.store.progress(set.id), o = SP.store.settings(set.id);
    var list = SP.core.rounds.build(app.items, o, p, set);
    if (!list.length) return app.toast('No items match these Options. Open Options to widen the round.');
    var before = {};
    app.items.forEach(function (it) { before[it.id] = (p[it.id] || P.blank()).state; });
    var r = { mode: mode, ids: list.map(function (it) { return it.id; }), i: 0, res: [], flip: false, hint: false, notes: {}, before: before, t0: Date.now() };
    keepPlan(r, SP.core.rounds.plan(app.items, o, p, set));
    save(app, r);
    app.update({ screen: mode, sheet: null, round: r });
    app.focus('#answer');
  }

  // D-19: the round remembers its Smart plan (stage, chunk id, label; null when not Smart).
  function keepPlan(r, pl) { r.stage = pl.stage; r.chunk = pl.chunk; r.label = pl.label; }

  // The round in progress is kept per set, so leaving and coming back picks it up (T-03).
  function save(app, r) { SP.store.saveRound(app.set.id, SP.core.rounds.snapshot(r)); }
  // Results first: clearing the save re-renders (store change), and the mode screen has no item left.
  function finish(app, r) { r.t1 = Date.now(); app.state.screen = 'done'; SP.store.clearRound(app.set.id); }

  // Back into the saved round, checked against the set as it is now. False if there's nothing to resume.
  function resume(app) {
    var r = SP.core.rounds.restore(SP.store.round(app.set.id), app.items);
    if (!r) { SP.store.clearRound(app.set.id); return false; }
    save(app, r);
    app.update({ screen: r.mode, sheet: null, round: r });
    app.focus('#answer');
    return true;
  }

  // T-06: ' data-enter="up|left"' when this draw shows a different item than the last draw
  // (a new round or a new index), '' on any other re-render. memo is the screen's own {}.
  // A save redraws again straight after the advance, so draws in the next 200ms keep the class.
  function enter(memo, r, cards) {
    if (memo.r !== r || memo.i !== r.i) { memo.r = r; memo.i = r.i; memo.t = Date.now(); }
    return Date.now() - memo.t < 200 ? ' data-enter="' + (cards ? 'left' : 'up') + '"' : '';
  }
  function current(app) {
    var r = app.state.round;
    return r && app.byId[r.ids[r.i]];
  }

  // D-19: the session bar. A Smart round in Learn or Link gets one segment per chunk: earlier chunks
  // full, the current one filling with the round, later ones full only if already learned.
  // Run, non-Smart and old saved rounds get the plain bar.
  function bar(app) {
    var r = app.state.round, C = SP.core.chunks, chunks = r.chunk && r.stage !== 'run' ? C.list(app.set) : [], at = -1;
    chunks.forEach(function (c, k) { if (c.id === r.chunk) at = k; });
    if (at < 0) return U.session(r.i, r.ids.length);
    var segs = C.segments(chunks, SP.store.progress(app.set.id)).map(function (s, k) {
      return { label: s.label, size: s.total, fill: k === at ? r.i / r.ids.length : k < at || s.ready === s.total ? 1 : 0 };
    });
    return U.session(r.i, r.ids.length, U.segbar(segs, at, r.i, r.ids.length));
  }

  // D-19: a procedure's prompt names the item's chunk ("Med room · ") in Learn and Link, and in
  // rounds saved before D-19 (no stage); not in Run or non-Smart rounds.
  function scene(app, it) {
    var r = app.state.round;
    if (app.set.kind === 'cards' || r.stage === 'run' || r.stage === null) return '';
    var c = SP.core.chunks.of(app.set, it.id);
    return c ? c.label + ' · ' : '';
  }

  // how: 'type' (unprompted), 'hint' (typed after a hint), 'next' (self-graded)
  function record(app, result, how, note) {
    var r = app.state.round, it = current(app);
    var map = Object.assign({}, SP.store.progress(app.set.id));
    map[it.id] = P.apply(map[it.id], result, how);
    SP.store.saveProgress(app.set.id, map);
    r.res.push({ id: it.id, mode: r.mode, result: result, hinted: !!(note && note.hinted) });
    if (note) r.notes[it.id] = note;
    r.i += 1; r.flip = false; r.hint = false; r.open = null;
    if (r.i >= r.ids.length) { finish(app, r); app.render(); }
    else { save(app, r); app.render(); app.focus('#answer'); }
  }

  // Options changed mid-round: keep what's answered, rebuild what's left. The Smart plan is made from
  // the progress at the round's start, so the round keeps its chunk while you answer.
  function refilter(app) {
    var r = app.state.round, done = r.ids.slice(0, r.i), R = SP.core.rounds;
    var o = SP.store.settings(app.set.id), p = SP.store.progress(app.set.id);
    var basis = Object.keys(r.before || {}).length ? R.basisOf(r) : p;
    var next = R.build(app.items, o, p, app.set, basis)
      .map(function (it) { return it.id; }).filter(function (id) { return done.indexOf(id) < 0; });
    keepPlan(r, R.plan(app.items, o, basis, app.set));
    r.ids = done.concat(next);
    if (r.i >= r.ids.length && r.i > 0) finish(app, r);
    else save(app, r);
  }

  function results(app) {
    var r = app.state.round, cards = app.set.kind === 'cards', p = SP.store.progress(app.set.id);
    var n = function (k) { return r.res.filter(function (x) { return x.result === k; }).length; };
    var mins = Math.max(1, Math.round(((r.t1 || Date.now()) - r.t0) / 60000));
    var TAG = { right: 'Right', shaky: 'Shaky', missed: 'Missed' };
    var changed = r.res.filter(function (x) { return (p[x.id] || {}).state !== r.before[x.id]; });
    var stat = function (k, label, tone) { return '<div class="sk-stat" data-tone="' + tone + '"><b>' + n(k) + '</b><span>' + label + '</span></div>'; };
    var row = function (x) {
      var it = app.byId[x.id];
      return '<li class="sk-row" data-result="' + x.result + '"><span class="n">' + U.esc(it.num) + '</span><span class="grow">' + U.esc(cards ? it.front : (it.cue || it.answer)) + '</span><span class="tag">' + TAG[x.result] + (x.hinted ? ' <span class="sk-hinted">hinted</span>' : '') + '</span></li>';
    };
    return '<main class="screen">' +
      '<header class="sk-top"><div class="grow stack"><span class="sk-meta">' + U.esc(app.set.title) + ' · ' + modeName(app, true) + ' · ' + mins + ' min</span><h1>Round done</h1></div></header>' +
      '<div class="sk-stats">' + stat('right', 'Right', 'ok') + stat('shaky', 'Shaky', 'warn') + stat('missed', 'Missed', 'bad') + '</div>' +
      (changed.length ? '<section class="stack"><h2 class="sk-h2">What changed</h2><ul class="sk-wheel">' + changed.map(function (x) {
        return '<li class="sk-row"><span class="n">' + U.esc(app.byId[x.id].num) + '</span><span class="grow">' + U.esc(cards ? app.byId[x.id].front : (app.byId[x.id].cue || app.byId[x.id].answer)) + '</span><span class="sk-meta">' + r.before[x.id] + ' → ' + p[x.id].state + '</span></li>';
      }).join('') + '</ul></section>' : '') +
      '<section class="stack"><h2 class="sk-h2">Every answer</h2><ol class="sk-wheel">' + r.res.map(row).join('') + '</ol></section>' +
      '<div class="stack g8">' + (r.stage ? '<p class="sk-meta sk-flush center">Next: ' + U.esc(SP.core.chunks.smart(app.set, p).label) + '</p>' : '') +
      '<button data-ui="button" data-kind="primary" data-act="again" class="sk-tall">Practice again</button>' +
      '<button data-ui="button" data-kind="neutral" data-act="toSet" class="sk-tall">Back to set</button></div></main>';
  }

  // whole: Results' label, which is 'Mixed' when the round used both modes
  function modeName(app, whole) {
    var m = whole ? SP.core.rounds.modeOf(app.state.round) : app.state.round.mode;
    if (m === 'mixed') return 'Mixed';
    return m === 'type' ? 'Type it' : app.set.kind === 'cards' ? 'Flashcards' : 'Next Step';
  }

  var actions = {
    startNext: function (app) { start(app, 'next'); },
    startType: function (app) { start(app, 'type'); },
    again: function (app) { fresh(app, app.state.round.mode); },
    // Options sheet, in a round: drop the saved round and begin a fresh one in the same mode.
    startOver: function (app) { var m = app.state.round.mode; SP.store.clearRound(app.set.id); app.state.round = null; fresh(app, m); },
    resume: function (app) { if (!resume(app)) app.toast('That round can’t be picked up any more.'); },
    end: function (app) { app.update({ screen: 'set', round: null }); },
    toSet: function (app) { app.update({ screen: 'set', round: null }); }
  };

  SP.screens.round = { start: start, fresh: fresh, resume: resume, current: current, enter: enter, bar: bar, scene: scene, record: record, refilter: refilter, render: results, modeName: modeName, actions: actions };
})(window.SP);
