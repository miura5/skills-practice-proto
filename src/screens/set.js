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

  // The round left part-way, if any: Resume picks it up, Start over begins a fresh one in the same mode.
  function resumeCard(app) {
    var r = SP.core.rounds.restore(SP.store.round(app.set.id), app.items);
    if (!r) return '';
    var mode = r.mode === 'type' ? 'Type it' : app.set.kind === 'cards' ? 'Flashcards' : 'Next Step';
    var pc = Math.round(100 * r.i / r.ids.length);
    return '<div class="sk-resume"><div class="row"><b class="grow">' + mode + ' round</b><span class="sk-meta">' + r.i + ' of ' + r.ids.length + '</span></div>' +
      '<div class="gauge" role="progressbar" aria-label="Round progress" aria-valuenow="' + pc + '" aria-valuemin="0" aria-valuemax="100"><i data-tone="ok" style="width:' + pc + '%"></i></div>' +
      '<div class="row" style="gap:8px"><button data-ui="button" data-kind="primary" data-act="resume" class="grow" style="height:48px;border-radius:99px">Resume round</button>' +
      '<button data-ui="button" data-kind="ghost" data-act="startOver" data-id="' + r.mode + '">Start over</button></div></div>';
  }

  function render(app) {
    var set = app.set, items = app.items, cards = set.kind === 'cards', t = app.tally(set);
    var inRound = SP.core.rounds.build(items, SP.store.settings(set.id), SP.store.progress(set.id)).length;
    return '<main class="screen tight">' +
      '<div class="sk-bar">' + U.iconBtn('back', 'Back', 'back') + '<b></b>' +
      '<button data-ui="button" data-kind="ghost" data-act="edit">' + U.icon('edit') + 'Edit</button>' +
      '<button data-ui="button" data-kind="neutral" data-act="options" style="border-radius:99px;padding:0 14px">' + U.icon('options') + 'Options</button></div>' +
      '<header class="stack" style="gap:10px"><h1 style="margin:0;font-size:26px;font-weight:700;letter-spacing:-.02em">' + U.esc(set.title) + '</h1>' +
      U.mastery(t, 'sk-big') +
      '<div class="sk-legend"><span><i style="--x:var(--ok)"></i>Learned ' + t.learned + '</span><span><i style="--x:var(--fam)"></i>Familiar ' + t.familiar + '</span><span><i style="--x:var(--warn)"></i>Weak ' + t.weak + '</span></div></header>' +
      '<section class="stack"><div class="row"><h2 class="sk-h2 grow">Practice</h2><span class="sk-meta">' + inRound + ' of ' + items.length + ' in a round</span></div>' + resumeCard(app) + '<div class="two">' +
      U.practice(cards ? 'Flashcards' : 'Next Step', cards ? 'See the front, recall it, flip to check' : 'Say the next step, reveal, grade yourself', 'flip', 'startNext') +
      U.practice('Type it', cards ? 'Type the back from memory' : 'Type the steps from memory', 'type', 'startType') +
      '</div></section>' +
      '<section class="stack"><h2 class="sk-h2">' + (cards ? 'Cards' : 'Full skill') + ' <span class="sk-meta" style="font-weight:400">· ' + items.length + (cards ? ' cards' : ' steps') + '</span></h2>' + previewCard(app, items) + '</section>' +
      '<section class="stack" style="gap:8px"><h2 class="sk-h2">' + (cards ? 'All cards' : 'Steps') + '</h2>' + list(app, items) + '</section>' +
      '</main>';
  }

  function sheet(app) {
    var set = app.set, o = SP.store.settings(set.id), cards = set.kind === 'cards';
    var n = SP.core.rounds.build(app.items, o, SP.store.progress(set.id)).length;
    var sections = cards ? '' : '<label class="sk-field">Section<select data-opt="section"><option value="all">All sections</option>' +
      (set.sections || []).map(function (s) { return '<option value="' + U.esc(s.id) + '"' + (o.section === s.id ? ' selected' : '') + '>' + U.esc(s.title) + '</option>'; }).join('') + '</select></label>';
    return '<div class="sk-scrim" data-act="closeSheet"></div><section class="sk-sheet" role="dialog" aria-label="Options">' +
      '<div class="sk-sheet-h"><h2>Options</h2>' + U.iconBtn('close', 'Close', 'closeSheet') + '</div>' + sections +
      '<div class="stack" style="gap:0">' +
      (cards ? '' : U.toggle('starred', 'Starred steps only', o.starred, 'The ones you can’t miss')) +
      U.toggle('weakFirst', 'Weak first', o.weakFirst) +
      U.toggle('skipLearned', 'Skip learned', o.skipLearned) +
      U.toggle('shuffle', 'Shuffle', o.shuffle, cards ? '' : 'Off keeps the checklist order') + '</div>' +
      '<p class="sk-meta" style="margin:0">' + n + ' of ' + app.items.length + ' in a round. Changes apply to the round you’re in.</p>' +
      '<button data-ui="button" data-kind="primary" data-act="closeSheet" style="height:52px">Done</button></section>';
  }

  var actions = {
    flipPreview: function (app) { app.update({ pvFlip: !app.state.pvFlip }); },
    pv: function (app, el) { app.update({ pv: Math.max(0, (app.state.pv || 0) + Number(el.dataset.id)), pvFlip: false }); },
    startOver: function (app, el) { SP.store.clearRound(app.set.id); SP.screens.round.start(app, el.dataset.id); },
    edit: function (app) { SP.screens.edit.start(app, app.set, false); }
  };

  // Options change live: saved per set, and the current round is rebuilt from them.
  function onOption(app, el) {
    var o = SP.store.settings(app.set.id);
    o[el.dataset.opt] = el.type === 'checkbox' ? el.checked : el.value;
    SP.store.saveSettings(app.set.id, o);
    if (app.state.round) SP.screens.round.refilter(app);
    app.render();
  }

  SP.screens.set = { resumeCard: resumeCard, render: render, sheet: sheet, actions: actions, onOption: onOption };
})(window.SP);
