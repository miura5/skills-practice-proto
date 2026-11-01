// screens/round: a round's life (start, record an answer, live re-filter, finish) and Results.
// The two modes (next.js, type.js) only draw the current item and call record().
(function (SP) {
  'use strict';
  var U = SP.ui, P = SP.core.progress;
  var ACTIVE_CAP = 2 * 60000;   // T-35: a pause longer than 2 minutes between answers is not round time

  // T-08: a saved round is continued in whichever mode was chosen; otherwise a fresh one.
  function start(app, mode) {
    dropStale(app);
    var raw = SP.store.round(app.set.id), r = SP.core.rounds.pick(raw, app.items, mode);
    if (!r) return fresh(app, mode);
    attach(r, raw);
    save(app, r);
    app.update({ screen: mode, sheet: null, round: r });
    app.focus('#answer');
  }

  // T-33: a saved learn round whose chunk is done (or gone) is cleared, so the next start is fresh.
  function stale(saved, set, p) {
    return !!(saved && SP.core.rounds.stale && SP.core.rounds.stale(saved, set, p || SP.store.progress(set.id)));
  }
  function dropStale(app) {
    if (stale(SP.store.round(app.set.id), app.set)) SP.store.clearRound(app.set.id);
  }

  // T-35: the round's active time (ms). Kept beside the round in the save; snapshot/restore do not carry it,
  // so it is put back here. last = when the previous answer (or the start / resume) happened.
  function attach(r, raw) {
    r.active = raw && typeof raw.active === 'number' ? raw.active : undefined;
    r.last = Date.now();
  }

  // over (optional): settings to use instead of the set's saved Options (Continue forces Smart).
  function fresh(app, mode, over) {
    var set = app.set, p = SP.store.progress(set.id), o = over || SP.store.settings(set.id);
    var list = SP.core.rounds.build(app.items, o, p, set);
    if (!list.length) return app.toast('No items match these Options. Open Options to widen the round.');
    var before = {};
    app.items.forEach(function (it) { before[it.id] = (p[it.id] || P.blank()).state; });
    var r = { mode: mode, ids: list.map(function (it) { return it.id; }), i: 0, res: [], flip: false, hint: false, notes: {}, before: before, t0: Date.now(), active: 0, last: Date.now() };
    keepPlan(r, SP.core.rounds.plan(app.items, o, p, set));
    save(app, r);
    app.update({ screen: mode, sheet: null, round: r });
    app.focus('#answer');
  }

  // D-19: the round remembers its Smart plan (stage, chunk id, label; null when not Smart).
  function keepPlan(r, pl) { r.stage = pl.stage; r.chunk = pl.chunk; r.label = pl.label; }

  // The round in progress is kept per set, so leaving and coming back picks it up (T-03).
  function save(app, r) {
    var s = SP.core.rounds.snapshot(r);
    if (s && typeof r.active === 'number') s.active = r.active;
    SP.store.saveRound(app.set.id, s);
  }
  // Results first: clearing the save re-renders (store change), and the mode screen has no item left.
  function finish(app, r) { r.t1 = Date.now(); app.state.screen = 'done'; SP.store.clearRound(app.set.id); }

  // Back into the saved round, checked against the set as it is now. False if there's nothing to resume.
  function resume(app) {
    dropStale(app);
    var raw = SP.store.round(app.set.id), r = SP.core.rounds.restore(raw, app.items);
    if (!r) { SP.store.clearRound(app.set.id); return false; }
    attach(r, raw);
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

  // D-19/D-22/D-28: the session bar. A Smart learn round gets one equal segment per chunk: earlier chunks
  // are full (green), the current one fills with this round's answers over the round's length, later ones
  // are empty. Run, non-Smart and old rounds: the plain bar.
  function bar(app) {
    var r = app.state.round, C = SP.core.chunks, chunks = r.chunk && r.stage !== 'run' ? C.list(app.set) : [], at = -1;
    chunks.forEach(function (c, k) { if (c.id === r.chunk) at = k; });
    if (at < 0) return U.session(r.i, r.ids.length);
    var inCur = {}, got = 0;
    chunks[at].ids.forEach(function (id) { inCur[id] = true; });
    (r.res || []).forEach(function (x) { if (inCur[x.id]) got += 1; });
    var segs = chunks.map(function (c, k) {
      var fill = k < at ? 1 : k === at ? Math.min(1, got / (r.ids.length || 1)) : 0;
      return { label: c.label, fill: fill };
    });
    return U.session(r.i, r.ids.length, U.segbar(segs, at, r.i, r.ids.length));
  }

  // D-19/D-22/D-28: the round header line on the mode screens, always drawn (a non-breaking space when
  // empty) so nothing moves. In a Smart learn round (stage learn; 'link' from older saves counts as learn;
  // saves from before D-19 have no stage) a procedure shows "<chunk> · <section>" and cards show the chunk.
  // The section is left out when it is the chunk's own name. Run and non-Smart rounds show nothing.
  function header(app, it) {
    var r = app.state.round, c = null;
    if (r.stage === undefined || r.stage === 'learn' || r.stage === 'link') c = SP.core.chunks.of(app.set, it.id);
    var text = '';
    if (c) {
      var sec = app.set.kind === 'cards' ? '' : (it.sectionTitle || '');
      text = sec && sec !== c.label ? c.label + ' · ' + sec : c.label;
    }
    return '<span class="sk-meta center">' + (text ? U.esc(text) : '&nbsp;') + '</span>';
  }

  // how: 'type' (unprompted), 'hint' (typed after a hint), 'next' (self-graded)
  function record(app, result, how, note) {
    var r = app.state.round, it = current(app), now = Date.now();
    r.active = (r.active || 0) + Math.min(ACTIVE_CAP, Math.max(0, now - (r.last || r.t0 || now)));
    r.last = now;
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
    // T-35: active time; rounds saved before it existed fall back to the clock from start to finish.
    var ms = typeof r.active === 'number' ? r.active : (r.t1 || Date.now()) - r.t0;
    var mins = Math.max(1, Math.round(ms / 60000));
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
      '<div class="stack g8">' +
      (r.stage === undefined || r.stage === null
        ? '<button data-ui="button" data-kind="primary" data-act="again" class="sk-tall">Practice again</button>'
        : '<button data-ui="button" data-kind="primary" data-act="continue" class="sk-tall">' + U.esc(nextLabel(r, p, app)) + '</button>') +
      '<button data-ui="button" data-kind="neutral" data-act="toSet" class="sk-tall">Back to set</button></div></main>';
  }

  // T-32c: the Results button after a Smart round. Still in the same learn chunk -> Again: <chunk>;
  // otherwise the next chunk, or the whole set once every chunk is learned (Again when this was a Run round).
  function nextLabel(r, p, app) {
    var s = SP.core.chunks.smart(app.set, p), learn = r.stage === 'learn' || r.stage === 'link';
    if (learn && s.chunk && s.chunk.id === r.chunk) return 'Again: ' + r.label;
    if (s.stage === 'run') return (r.stage === 'run' ? 'Again: ' : 'Next: ') + 'Whole set';
    return 'Next: ' + s.label;
  }

  // T-33: the one summary both Home and the set screen show. A non-stale saved round gives its label and
  // i of n; otherwise the next Smart round's label and its size out of the set. arg: a set, or the app.
  function summary(arg) {
    var set = arg.set || arg, items = SP.core.sets.items(set), o = SP.store.settings(set.id), p = SP.store.progress(set.id);
    var raw = SP.store.round(set.id), r = SP.core.rounds.restore(raw, items);
    if (r && !stale(raw, set, p)) return { label: r.label || null, i: r.i, n: r.ids.length, total: items.length, saved: r };
    var pl = SP.core.rounds.plan(items, o, p, set);
    return { label: pl.label || null, i: 0, n: SP.core.rounds.build(items, o, p, set).length, total: items.length, saved: null };
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
    // D-22: after a Smart round, a fresh Smart round in the same mode (whatever Scope is saved).
    continue: function (app) { fresh(app, app.state.round.mode, Object.assign({}, SP.store.settings(app.set.id), { practice: 'smart', section: null })); },
    // Options sheet, in a round: drop the saved round and begin a fresh one in the same mode.
    startOver: function (app) { var m = app.state.round.mode; SP.store.clearRound(app.set.id); app.state.round = null; fresh(app, m); },
    resume: function (app) { if (!resume(app)) app.toast('That round can’t be picked up any more.'); },
    end: function (app) { app.update({ screen: 'set', round: null }); },
    toSet: function (app) { app.update({ screen: 'set', round: null }); }
  };

  SP.screens.round = { start: start, fresh: fresh, resume: resume, current: current, enter: enter, bar: bar, header: header, record: record, refilter: refilter, render: results, modeName: modeName, summary: summary, actions: actions };
})(window.SP);
