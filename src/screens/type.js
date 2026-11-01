// screens/type: Type it. The wheel shows the last answers, the focused row with the answer box,
// and what's coming. Enter or Check grades with core/grade; Hint caps the item at Familiar.
(function (SP) {
  'use strict';
  var U = SP.ui, R = SP.screens.round;
  var TAG = { right: 'Right', shaky: 'Shaky', missed: 'Missed' };

  // The step's text with each missing key part as an inline blank (D-10).
  function blanks(it, open) {
    var k = 0, miss = {};
    open.parts.forEach(function (p) { if (!p.have) miss[p.text] = (miss[p.text] || 0) + 1; });
    var html = U.esc(it.raw).replace(/\[([^\]]+)\]/g, function (all, g) {
      return g.split(/(\s*(?:,|;|&amp;|\band\b)\s*)/i).map(function (bit) {
        var t = bit.trim();
        var key = t.replace(/&amp;/g, '&');
        if (!t || !miss[key]) return /^\s*(?:,|;|&amp;|and)\s*$/i.test(bit) ? bit : '<mark class="sk-key">' + bit + '</mark>';
        miss[key] -= 1;
        return '<input class="sk-blank" data-i="' + (k++) + '" aria-label="Missing: ' + t + '" autocomplete="off" autocapitalize="off" size="' + Math.max(4, t.length) + '">';
      }).join('');
    });
    // Required wording that isn't in the text (e.g. "2nd check") gets its own blank.
    Object.keys(miss).filter(function (t) { return miss[t] > 0; }).forEach(function (t) { html += ' <input class="sk-blank" data-i="' + (k++) + '" aria-label="Missing: ' + U.esc(t) + '" placeholder="' + U.esc(t) + '…" autocomplete="off">'; });
    return html;
  }

  function render(app) {
    var r = app.state.round, it = R.current(app), cards = app.set.kind === 'cards';
    var past = r.res.slice(-3).map(function (x, k, arr) {
      var p = app.byId[x.id], note = r.notes[x.id];
      return '<li class="sk-row" data-result="' + x.result + '" data-d="' + (arr.length - k >= 3 ? 'far' : arr.length - k === 2 ? 'near' : '') + '">' +
        '<span class="n">' + U.esc(p.num) + '</span><span style="flex:1;display:flex;flex-direction:column;gap:4px">' +
        '<span>' + (cards ? '<b>' + U.esc(p.front) + ':</b> ' : '') + U.marked(p.raw) + '</span>' +
        (note && note.missing && note.missing.length && x.result !== 'right' ? '<span class="sk-note">Missing: ' + U.esc(note.missing.join(', ')) + '</span>' : '') +
        '</span><span class="tag">' + TAG[x.result] + (x.hinted ? ' <span class="sk-hinted">hinted</span>' : '') + '</span></li>';
    }).join('');
    var upcoming = r.ids.slice(r.i + 1, r.i + 3).map(function (id, k) {
      var u = app.byId[id];
      return '<li class="sk-row" data-d="' + (k ? 'far' : 'near') + '"><span class="n">' + U.esc(u.num) + '</span><span style="flex:1;color:var(--faint)">' + (cards ? U.esc(u.front) : '· · ·') + '</span></li>';
    }).join('');
    var lead = cards ? 'Card ' + it.num : (it.prev ? 'After: ' + (it.prev.cue || it.prev.answer) : 'Start of the checklist');
    var hint = r.hint ? '<span class="sk-meta">Key words: ' + U.esc(it.keys.map(function (k) { return k.split(' ')[0] + '…'; }).join(', ')) + '</span>' : '';
    var open = r.open, near = r.nearby && app.byId[r.nearby.id];
    var msg = near ? '<span class="sk-nearby" role="status">That’s a nearby step: ' + U.esc(near.num) + ' · ' + U.esc(near.cue || near.answer) + '. Which step comes here?</span>' : '';
    var box = open
      ? '<p class="sk-fill">' + blanks(it, open) + '</p><span class="sk-meta">Almost: fill in what’s missing.</span>'
      : '<label for="answer" class="sr">Your answer</label>' +
        '<textarea id="answer" class="sk-input" rows="3" autocomplete="off" autocapitalize="off" placeholder="' + (cards ? 'Type what’s on the back…' : 'Type the step…') + '"></textarea>' + hint + msg;
    return U.session(r.i, r.ids.length) +
      '<main class="screen" style="gap:12px;padding-top:8px">' +
      '<span class="sk-meta center">' + U.esc(app.set.title) + ' · Type it</span>' +
      '<ol class="sk-wheel">' + past +
      '<li class="sk-row focus">' +
      '<div class="row" style="align-items:baseline;gap:12px"><span class="n" style="color:var(--her)">' + U.esc(it.num) + '</span>' +
      '<span class="stack" style="gap:2px"><span class="sk-meta">' + U.esc(lead) + '</span><b style="font-size:var(--fs-4)">' + U.esc(cards ? it.front : 'What’s the next step?') + '</b></span></div>' +
      box +
      '<div class="row">' + (open ? '' : '<button data-ui="button" data-kind="ghost" data-act="hint">Hint</button>') + '<button data-ui="button" data-kind="ghost" data-act="skip">Skip</button><span class="grow"></span>' +
      '<button data-ui="button" data-kind="primary" data-act="check" style="padding:0 22px">Check</button></div></li>' +
      upcoming + '</ol></main>';
  }

  // Grade, or hold the row open for the missing parts. A hinted right answer stays Right
  // (tagged hinted); record() with how 'hint' caps the ladder at Familiar (D-06).
  function done(app, g) {
    var r = app.state.round, hinted = r.hint;
    r.open = null; r.nearby = null;
    R.record(app, g.result, hinted ? 'hint' : 'type', { missing: g.missing, hinted: hinted });
  }
  function check(app) {
    var it = R.current(app), r = app.state.round, g;
    if (r.open) {
      var fill = [].slice.call(document.querySelectorAll('.sk-blank')).map(function (el) { return el.value; });
      g = SP.core.grade(it, r.open.typed, app.set, { hinted: r.hint, fill: fill });
      return done(app, g);
    }
    var box = document.getElementById('answer'), typed = box ? box.value : '';
    g = SP.core.grade(it, typed, app.set, { hinted: r.hint });
    if (g.result === 'nearby') { r.nearby = g.nearby; app.render(); app.focus && app.focus('#answer'); return; }
    if (g.result === 'open') {
      r.open = { typed: typed, parts: g.parts }; r.nearby = null; app.render();
      var b = document.querySelector('.sk-blank'); if (b) b.focus();
      return;
    }
    done(app, g);
  }

  var actions = {
    check: check,
    skip: function (app) {
      var r = app.state.round;
      if (r.open) { var g = SP.core.grade(R.current(app), r.open.typed, app.set, { hinted: r.hint, fill: [] }); return done(app, g); }
      r.nearby = null; R.record(app, 'missed', 'type', { missing: R.current(app).keys });
    },
    hint: function (app) {
      var box = document.getElementById('answer'), keep = box ? box.value : '';
      app.state.round.hint = true; app.render();
      var b2 = document.getElementById('answer'); if (b2) { b2.value = keep; b2.focus(); }
    }
  };

  SP.screens.type = { render: render, actions: actions, check: check };
})(window.SP);
