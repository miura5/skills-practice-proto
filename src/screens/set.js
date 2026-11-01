// screens/set: one set's overview (the prototype's old home screen) and its Options sheet.
(function (SP) {
  'use strict';
  var U = SP.ui;

  function previewCard(app, items) {
    var i = Math.min(app.state.pv || 0, items.length - 1), it = items[i], cards = app.set.kind === 'cards';
    if (!it) return '<p class="sk-meta">This set is empty. Tap Edit to add ' + (cards ? 'cards' : 'steps') + '.</p>';
    return U.flip({
      act: 'flipPreview', flipped: app.state.pvFlip, h: 220,
      lead: cards ? 'Card ' + (i + 1) + ' of ' + items.length : (it.prev ? 'After: ' + (it.prev.cue || it.prev.answer) : 'Start of the checklist'),
      ask: cards ? it.front : 'What’s next?',
      label: cards ? it.front : 'Step ' + it.num, answer: it.answer
    }) + '<div class="sk-pager">' +
      '<button data-ui="button" data-kind="neutral" class="icon" aria-label="Previous" data-act="pv" data-id="-1"' + (i === 0 ? ' disabled' : '') + '>' + U.icon('back') + '</button>' +
      '<output>' + (i + 1) + ' / ' + items.length + '</output>' +
      '<button data-ui="button" data-kind="neutral" class="icon" aria-label="Next" data-act="pv" data-id="1"' + (i === items.length - 1 ? ' disabled' : '') + '>' + U.icon('next') + '</button></div>';
  }

  function list(app, items) {
    var p = SP.store.progress(app.set.id), sec = null, out = '';
    items.forEach(function (it) {
      if (it.section && it.section !== sec) { sec = it.section; out += '<h3 class="sk-sec">' + U.esc(it.sectionTitle) + '</h3>'; }
      var s = (p[it.id] || {}).state || 'new';
      out += '<div class="sk-item"><span class="n">' + U.esc(it.num) + '</span><span class="b">' +
        (app.set.kind === 'cards' ? '<b>' + U.esc(it.front) + '</b><span class="sk-meta">' + U.esc(it.answer) + '</span>'
          : (it.cue ? '<b>' + U.esc(it.cue) + (it.star ? ' <span class="sk-star" title="Starred">★</span>' : '') + '</b>' : '') + '<span class="sk-meta">' + U.marked(it.raw) + '</span>') +
        '</span><span class="sk-dot" data-s="' + s + '" title="' + s + '"></span></div>';
    });
    return out;
  }

  // T-09: the saved round, as a quiet note. The mode cards continue it (T-08).
  function roundNote(app) {
    var r = SP.core.rounds.restore(SP.store.round(app.set.id), app.items);
    return r ? '<span class="sk-inround">Round in progress · ' + r.i + ' of ' + r.ids.length + '</span>' : '';
  }

  function render(app) {
    var set = app.set, items = app.items, cards = set.kind === 'cards', t = app.tally(set);
    var o = SP.store.settings(set.id), p = SP.store.progress(set.id);
    var inRound = SP.core.rounds.build(items, o, p, set).length, pl = SP.core.rounds.plan(items, o, p, set);
    var what = (pl.label ? U.esc(pl.label) + ' · ' : '') + inRound + ' of ' + items.length + ' in a round';
    return '<main class="screen tight">' +
      '<div class="sk-bar">' + U.iconBtn('back', 'Back', 'back') + '<b></b>' +
      '<button data-ui="button" data-kind="ghost" data-act="edit">' + U.icon('edit') + 'Edit</button>' +
      '<button data-ui="button" data-kind="neutral" data-act="options" class="sk-pill sm">' + U.icon('options') + 'Options</button></div>' +
      '<header class="stack g10"><h1 class="sk-title">' + U.esc(set.title) + '</h1>' +
      U.mastery(t, 'sk-big') +
      '<div class="sk-legend"><span><i data-s="learned"></i>Learned ' + t.learned + '</span><span><i data-s="familiar"></i>Familiar ' + t.familiar + '</span><span><i data-s="weak"></i>Weak ' + t.weak + '</span></div></header>' +
      '<section class="stack"><div class="row"><h2 class="sk-h2 grow">Practice</h2><span class="sk-meta">' + what + '</span></div>' + roundNote(app) + '<div class="two">' +
      U.practice(cards ? 'Flashcards' : 'Next Step', 'flip', 'startNext') +
      U.practice('Type it', 'type', 'startType') +
      '</div></section>' +
      '<section class="stack"><h2 class="sk-h2">' + (cards ? 'Cards' : 'Full skill') + ' <span class="sk-meta">· ' + items.length + (cards ? ' cards' : ' steps') + '</span></h2>' + previewCard(app, items) + '</section>' +
      '<section class="stack g8"><h2 class="sk-h2">' + (cards ? 'All cards' : 'Steps') + '</h2>' + list(app, items) + '</section>' +
      '</main>';
  }

  function sheet(app) {
    var set = app.set, o = SP.store.settings(set.id), cards = set.kind === 'cards';
    var p = SP.store.progress(set.id), n = SP.core.rounds.build(app.items, o, p, set).length;
    // D-19 Practice: Smart (default) / Whole set / one entry per section (procedures). An old saved
    // section option shows as that section (rounds.plan reads it).
    var cur = SP.core.rounds.plan(app.items, o, p, set).practice;
    var opt = function (v, label) { return '<option value="' + U.esc(v) + '"' + (cur === v ? ' selected' : '') + '>' + U.esc(label) + '</option>'; };
    var practice = '<label class="sk-field">Practice<select data-opt="practice">' + opt('smart', 'Smart') + opt('whole', 'Whole set') +
      (cards ? '' : (set.sections || []).map(function (s) { return opt(s.id, s.title || s.id); }).join('')) + '</select></label>';
    return '<div class="sk-scrim" data-act="closeSheet"></div><section class="sk-sheet" role="dialog" aria-label="Options">' +
      '<div class="sk-sheet-h"><h2>Options</h2>' + U.iconBtn('close', 'Close', 'closeSheet') + '</div>' + practice +
      '<div class="stack g0">' +
      (cards ? '' : U.toggle('starred', 'Starred steps only', o.starred, 'The ones you can’t miss')) +
      U.toggle('weakFirst', 'Weak first', o.weakFirst) +
      U.toggle('skipLearned', 'Skip learned', o.skipLearned) +
      (cards ? U.toggle('shuffle', 'Shuffle', o.shuffle) : '') + '</div>' +
      '<p class="sk-meta sk-flush">' + n + ' of ' + app.items.length + ' in a round. Changes apply to the round you’re in.</p>' +
      '<button data-ui="button" data-kind="primary" data-act="closeSheet" class="sk-tall">Done</button>' +
      (app.state.round ? '<button data-ui="button" data-kind="ghost" data-act="startOver" class="sk-danger sk-tall">Start over</button>' : '') + '</section>';
  }

  var actions = {
    flipPreview: function (app) { app.update({ pvFlip: !app.state.pvFlip }); },
    pv: function (app, el) { app.update({ pv: Math.max(0, (app.state.pv || 0) + Number(el.dataset.id)), pvFlip: false }); },
    edit: function (app) { SP.screens.edit.start(app, app.set, false); }
  };

  // Options change live: saved per set, and the current round is rebuilt from them.
  function onOption(app, el) {
    var o = SP.store.settings(app.set.id);
    o[el.dataset.opt] = el.type === 'checkbox' ? el.checked : el.value;
    if (el.dataset.opt === 'practice') delete o.section;   // the pre-D-19 Section option gives way
    SP.store.saveSettings(app.set.id, o);
    if (app.state.round) SP.screens.round.refilter(app);
    app.render();
  }

  SP.screens.set = { render: render, sheet: sheet, actions: actions, onOption: onOption };
})(window.SP);
