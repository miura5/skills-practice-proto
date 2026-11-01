// screens/type: Type it. The wheel shows the last answers, the focused row with the answer box,
// and what's coming. Enter or Check grades with core/grade; Hint caps the item at Familiar.
(function (SP) {
  'use strict';
  var U = SP.ui, R = SP.screens.round;
  var TAG = { right: 'Right', shaky: 'Shaky', missed: 'Missed' };

  function render(app) {
    var r = app.state.round, it = R.current(app), cards = app.set.kind === 'cards';
    var past = r.res.slice(-3).map(function (x, k, arr) {
      var p = app.byId[x.id], note = r.notes[x.id];
      return '<li class="sk-row" data-result="' + x.result + '" data-d="' + (arr.length - k >= 3 ? 'far' : arr.length - k === 2 ? 'near' : '') + '">' +
        '<span class="n">' + U.esc(p.num) + '</span><span style="flex:1;display:flex;flex-direction:column;gap:4px">' +
        '<span>' + (cards ? '<b>' + U.esc(p.front) + ':</b> ' : '') + U.marked(p.raw) + '</span>' +
        (note && note.missing && note.missing.length && x.result !== 'right' ? '<span class="sk-note">Missing: ' + U.esc(note.missing.join(', ')) + '</span>' : '') +
        '</span><span class="tag">' + TAG[x.result] + '</span></li>';
    }).join('');
    var upcoming = r.ids.slice(r.i + 1, r.i + 3).map(function (id, k) {
      var u = app.byId[id];
      return '<li class="sk-row" data-d="' + (k ? 'far' : 'near') + '"><span class="n">' + U.esc(u.num) + '</span><span style="flex:1;color:var(--faint)">' + (cards ? U.esc(u.front) : '· · ·') + '</span></li>';
    }).join('');
    var lead = cards ? 'Card ' + it.num : (it.prev ? 'After: ' + (it.prev.cue || it.prev.answer) : 'Start of the checklist');
    var hint = r.hint ? '<span class="sk-meta">Key words: ' + U.esc(it.keys.map(function (k) { return k.split(' ')[0] + '…'; }).join(', ')) + '</span>' : '';
    return U.session(r.i, r.ids.length) +
      '<main class="screen" style="gap:12px;padding-top:8px">' +
      '<span class="sk-meta center">' + U.esc(app.set.title) + ' · Type it</span>' +
      '<ol class="sk-wheel">' + past +
      '<li class="sk-row focus">' +
      '<div class="row" style="align-items:baseline;gap:12px"><span class="n" style="color:var(--her)">' + U.esc(it.num) + '</span>' +
      '<span class="stack" style="gap:2px"><span class="sk-meta">' + U.esc(lead) + '</span><b style="font-size:var(--fs-4)">' + U.esc(cards ? it.front : 'What’s the next step?') + '</b></span></div>' +
      '<label for="answer" class="sr">Your answer</label>' +
      '<textarea id="answer" class="sk-input" rows="3" autocomplete="off" autocapitalize="off" placeholder="' + (cards ? 'Type what’s on the back…' : 'Type the step…') + '"></textarea>' + hint +
      '<div class="row"><button data-ui="button" data-kind="ghost" data-act="hint">Hint</button><button data-ui="button" data-kind="ghost" data-act="skip">Skip</button><span class="grow"></span>' +
      '<button data-ui="button" data-kind="primary" data-act="check" style="padding:0 22px">Check</button></div></li>' +
      upcoming + '</ol></main>';
  }

  function check(app) {
    var box = document.getElementById('answer'), it = R.current(app), r = app.state.round;
    var g = SP.core.grade(it, box ? box.value : '', app.set.synonyms);
    var result = r.hint && g.result === 'right' ? 'shaky' : g.result;
    R.record(app, result, r.hint ? 'hint' : 'type', { missing: g.missing });
  }

  var actions = {
    check: check,
    skip: function (app) { R.record(app, 'missed', 'type', { missing: R.current(app).keys }); },
    hint: function (app) {
      var box = document.getElementById('answer'), keep = box ? box.value : '';
      app.state.round.hint = true; app.render();
      var b2 = document.getElementById('answer'); if (b2) { b2.value = keep; b2.focus(); }
    }
  };

  SP.screens.type = { render: render, actions: actions, check: check };
})(window.SP);
