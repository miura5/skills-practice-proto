// screens/library: every set, filtered by kind; New set; the build notes.
(function (SP) {
  'use strict';
  var U = SP.ui;

  function render(app) {
    var f = app.state.filter || 'all';
    var sets = SP.store.all().filter(function (s) { return f === 'all' || s.kind === f; });
    var seg = function (id, label) { return '<button aria-pressed="' + (f === id) + '" data-act="filter" data-id="' + id + '">' + label + '</button>'; };
    return '<main class="screen g20">' +
      '<header class="sk-top"><div class="grow stack"><span class="sk-meta">' + SP.store.all().length + ' sets · saved to your ' + SP.store.backend() + '</span><h1>Library</h1></div>' +
      '<button data-ui="button" data-kind="primary" aria-label="New set" data-act="newSet" class="icon sk-pill">' + U.icon('plus') + '</button></header>' +
      '<div data-ui="segmented" role="group" aria-label="Show">' + seg('all', 'All') + seg('cards', 'Card sets') + seg('procedure', 'Procedures') + '</div>' +
      '<div class="stack g10">' + (sets.length ? sets.map(function (s) { return U.setRow(s, app.tally(s)); }).join('') : '<p class="sk-meta center">Nothing here yet.</p>') + '</div>' +
      '</main>' + U.tabbar('library');
  }

  // The New set sheet
  function sheet(app) {
    var k = app.state.newKind || 'cards';
    var seg = function (id, label) { return '<button aria-pressed="' + (k === id) + '" data-act="newKind" data-id="' + id + '">' + label + '</button>'; };
    return '<div class="sk-scrim" data-act="closeSheet"></div><section class="sk-sheet" role="dialog" aria-label="New set">' +
      '<div class="sk-sheet-h"><h2>New set</h2>' + U.iconBtn('close', 'Close', 'closeSheet') + '</div>' +
      '<div data-ui="segmented" role="group" aria-label="Kind">' + seg('cards', 'Card set') + seg('procedure', 'Procedure') + '</div>' +
      '<label class="sk-field">Title<input id="newTitle" autocomplete="off" placeholder="' + (k === 'cards' ? 'e.g. Muscles lab' : 'e.g. Sterile dressing') + '"></label>' +
      '<button data-ui="button" data-kind="primary" data-act="createSet" class="sk-tall">Create and add ' + (k === 'cards' ? 'cards' : 'steps') + '</button></section>';
  }

  var actions = {
    filter: function (app, el) { app.update({ filter: el.dataset.id }); },
    newSet: function (app) { app.update({ sheet: 'new', newKind: 'cards' }); app.focus('#newTitle'); },
    newKind: function (app, el) { app.update({ newKind: el.dataset.id }); app.focus('#newTitle'); },
    createSet: function (app) {
      var title = (document.getElementById('newTitle').value || '').trim();
      if (!title) return app.toast('Give the set a title first.');
      var id = SP.store.newId(title), kind = app.state.newKind || 'cards';
      var set = kind === 'cards'
        ? { id: id, kind: 'cards', title: title, cards: [{ id: 'c1', front: '', back: '' }] }
        : { id: id, kind: 'procedure', title: title, sections: [{ id: 's1', title: 'Steps', steps: [{ id: '1', num: '1', star: false, cue: '', text: '' }] }] };
      app.update({ sheet: null });
      SP.screens.edit.start(app, set, true);
    }
  };

  SP.screens.library = { render: render, sheet: sheet, actions: actions };
})(window.SP);
