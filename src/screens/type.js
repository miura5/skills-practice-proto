// screens/type: Type it. The focused row with the answer box comes first, then the
// last answer as one line, then what's coming. Enter or Check grades with core/grade; Hint caps the item at Familiar.
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
    // Only the last answer, as one compact line under the focus row (T-05): nothing tall above it.
    var last = r.res[r.res.length - 1], fb = '';
    if (last) {
      var p = app.byId[last.id], note = r.notes[last.id];
      var miss = note && note.missing && note.missing.length && last.result !== 'right' ? note.missing.join(', ') : '';
      fb = '<li class="sk-row sk-last" data-result="' + last.result + '"><span class="n">' + U.esc(p.num) + '</span>' +
        '<span class="sk-last-body"><span class="sk-last-label">' + U.esc(cards ? p.front : (p.cue || p.answer)) + '</span>' +
        (miss ? '<span class="sk-note sk-clamp">Missing: ' + U.esc(miss) + '</span>' : '') +
        '</span><span class="tag">' + TAG[last.result] + (last.hinted ? ' <span class="sk-hinted">hinted</span>' : '') + '</span></li>';
    }
    var upcoming = r.ids.slice(r.i + 1, r.i + 3).map(function (id, k) {
      var u = app.byId[id];
      return '<li class="sk-row" data-d="' + (k ? 'far' : 'near') + '"><span class="n">' + U.esc(u.num) + '</span><span class="grow sk-faint">' + (cards ? U.esc(u.front) : '· · ·') + '</span></li>';
    }).join('');
    var lead = cards ? 'Card ' + it.num : (it.prev ? 'After: ' + (it.prev.cue || it.prev.answer) : 'Start of the checklist');
    var hint = r.hint ? '<span class="sk-meta">Key words: ' + U.esc(it.keys.map(function (k) { return k.split(' ')[0] + '…'; }).join(', ')) + '</span>' : '';
    var open = r.open;
    var box = open
      ? '<p class="sk-fill">' + blanks(it, open) + '</p><span class="sk-meta">Almost: fill in what’s missing.</span>'
      : '<label for="answer" class="sr">Your answer</label>' +
        '<textarea id="answer" class="sk-input" rows="3" autocomplete="off" autocapitalize="off" placeholder="' + (cards ? 'Type what’s on the back…' : 'Type the step…') + '"></textarea>' + hint;
    var enter = R.enter(seen, r, cards);
    return R.bar(app) +
      '<main class="screen g12 snug">' +
      R.header(app, it) +
      '<ol class="sk-wheel"' + enter + '>' +
      '<li class="sk-row focus">' +
      '<div class="row sk-q"><span class="n">' + U.esc(it.num) + '</span>' +
      '<span class="stack g2"><span class="sk-meta">' + U.esc(lead) + '</span><b>' + U.esc(cards ? it.front : 'What’s the next step?') + '</b></span></div>' +
      box +
      '<div class="row">' + (open ? '' : '<button data-ui="button" data-kind="ghost" data-act="hint">Hint</button>') + '<button data-ui="button" data-kind="ghost" data-act="skip">Skip</button><span class="grow"></span>' +
      '<button data-ui="button" data-kind="primary" data-act="check" class="sk-pad">Check</button></div></li>' +
      fb + upcoming + '</ol></main>';
  }

  // Grade, or hold the row open for the missing parts. A hinted right answer stays Right
  // (tagged hinted); record() with how 'hint' caps the ladder at Familiar (D-06).
  var seen = {};   // last round + index drawn (T-06)
  function done(app, g) {
    var r = app.state.round, hinted = r.hint;
    r.open = null;
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
    if (g.result === 'open') {
      r.open = { typed: typed, parts: g.parts }; app.render();
      var b = document.querySelector('.sk-blank'); if (b) b.focus({ preventScroll: true });
      return;
    }
    done(app, g);
  }

  var actions = {
    check: check,
    skip: function (app) {
      var r = app.state.round;
      if (r.open) { var g = SP.core.grade(R.current(app), r.open.typed, app.set, { hinted: r.hint, fill: [] }); return done(app, g); }
      R.record(app, 'missed', 'type', { missing: R.current(app).keys });
    },
    hint: function (app) {
      var box = document.getElementById('answer'), keep = box ? box.value : '';
      app.state.round.hint = true; app.render();
      var b2 = document.getElementById('answer'); if (b2) { b2.value = keep; b2.focus({ preventScroll: true }); }
    }
  };

  // Each new item starts at the top; the focus row is drawn first so it sits above the keyboard.
  function after(app, screen) { screen.scrollTop = 0; }

  SP.screens.type = { after: after, render: render, actions: actions, check: check };
})(window.SP);
