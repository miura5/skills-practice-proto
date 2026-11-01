// screens/round: a round's life (start, record an answer, live re-filter, finish) and Results.
// The two modes (next.js, type.js) only draw the current item and call record().
(function (SP) {
  'use strict';
  var U = SP.ui, P = SP.core.progress;

  function start(app, mode) {
    var set = app.set, p = SP.store.progress(set.id);
    var list = SP.core.rounds.build(app.items, SP.store.settings(set.id), p);
    if (!list.length) return app.toast('No items match these Options. Open Options to widen the round.');
    var before = {};
    app.items.forEach(function (it) { before[it.id] = (p[it.id] || P.blank()).state; });
    app.update({ screen: mode, sheet: null, round: { mode: mode, ids: list.map(function (it) { return it.id; }), i: 0, res: [], flip: false, hint: false, notes: {}, before: before, t0: Date.now() } });
    app.focus('#answer');
  }

  function current(app) {
    var r = app.state.round;
    return r && app.byId[r.ids[r.i]];
  }

  // how: 'type' (unprompted), 'hint' (typed after a hint), 'next' (self-graded)
  function record(app, result, how, note) {
    var r = app.state.round, it = current(app);
    var map = Object.assign({}, SP.store.progress(app.set.id));
    map[it.id] = P.apply(map[it.id], result, how);
    SP.store.saveProgress(app.set.id, map);
    r.res.push({ id: it.id, result: result });
    if (note) r.notes[it.id] = note;
    r.i += 1; r.flip = false; r.hint = false;
    if (r.i >= r.ids.length) { r.t1 = Date.now(); app.update({ screen: 'done' }); }
    else { app.render(); app.focus('#answer'); }
  }

  // Options changed mid-round: keep what's answered, rebuild what's left.
  function refilter(app) {
    var r = app.state.round, done = r.ids.slice(0, r.i);
    var next = SP.core.rounds.build(app.items, SP.store.settings(app.set.id), SP.store.progress(app.set.id))
      .map(function (it) { return it.id; }).filter(function (id) { return done.indexOf(id) < 0; });
    r.ids = done.concat(next);
    if (r.i >= r.ids.length && r.i > 0) { r.t1 = Date.now(); app.state.screen = 'done'; }
  }

  function results(app) {
    var r = app.state.round, cards = app.set.kind === 'cards', p = SP.store.progress(app.set.id);
    var n = function (k) { return r.res.filter(function (x) { return x.result === k; }).length; };
    var mins = Math.max(1, Math.round(((r.t1 || Date.now()) - r.t0) / 60000));
    var TAG = { right: 'Right', shaky: 'Shaky', missed: 'Missed' };
    var changed = r.res.filter(function (x) { return (p[x.id] || {}).state !== r.before[x.id]; });
    var stat = function (k, label, tone) { return '<div class="sk-stat" style="--x:var(--' + tone + ');--x-bg:var(--' + tone + '-bg)"><b>' + n(k) + '</b><span>' + label + '</span></div>'; };
    var row = function (x) {
      var it = app.byId[x.id];
      return '<li class="sk-row" data-result="' + x.result + '"><span class="n">' + U.esc(it.num) + '</span><span style="flex:1">' + U.esc(cards ? it.front : (it.cue || it.answer)) + '</span><span class="tag">' + TAG[x.result] + '</span></li>';
    };
    return '<main class="screen">' +
      '<header class="sk-top"><div class="grow stack" style="gap:6px"><span class="sk-meta">' + U.esc(app.set.title) + ' · ' + modeName(app) + ' · ' + mins + ' min</span><h1>Round done</h1></div></header>' +
      '<div class="sk-stats">' + stat('right', 'Right', 'ok') + stat('shaky', 'Shaky', 'warn') + stat('missed', 'Missed', 'bad') + '</div>' +
      (changed.length ? '<section class="stack"><h2 class="sk-h2">What changed</h2><ul class="sk-wheel">' + changed.map(function (x) {
        return '<li class="sk-row"><span class="n">' + U.esc(app.byId[x.id].num) + '</span><span style="flex:1">' + U.esc(cards ? app.byId[x.id].front : (app.byId[x.id].cue || app.byId[x.id].answer)) + '</span><span class="sk-meta">' + r.before[x.id] + ' → ' + p[x.id].state + '</span></li>';
      }).join('') + '</ul></section>' : '') +
      '<section class="stack"><h2 class="sk-h2">Every answer</h2><ol class="sk-wheel">' + r.res.map(row).join('') + '</ol></section>' +
      '<div class="stack" style="gap:8px"><button data-ui="button" data-kind="primary" data-act="again" style="height:52px">Practice again</button>' +
      '<button data-ui="button" data-kind="neutral" data-act="toSet" style="height:52px">Back to set</button></div></main>';
  }

  function modeName(app) {
    var m = app.state.round.mode;
    return m === 'type' ? 'Type it' : app.set.kind === 'cards' ? 'Flashcards' : 'Next Step';
  }

  var actions = {
    startNext: function (app) { start(app, 'next'); },
    startType: function (app) { start(app, 'type'); },
    again: function (app) { start(app, app.state.round.mode); },
    end: function (app) { app.update({ screen: 'set', round: null }); },
    toSet: function (app) { app.update({ screen: 'set', round: null }); }
  };

  SP.screens.round = { start: start, current: current, record: record, refilter: refilter, render: results, modeName: modeName, actions: actions };
})(window.SP);
