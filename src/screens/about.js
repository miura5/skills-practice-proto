// screens/about: the build notes (docs/DECISIONS.md and docs/README.md), read from the artifact's own files.
(function (SP) {
  'use strict';
  var U = SP.ui, cache = {};

  function load(app, file) {
    if (cache[file]) return;
    cache[file] = 'Loading…';
    fetch(file).then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
      .then(function (t) { cache[file] = t; }, function () { cache[file] = 'Couldn’t load ' + file + '.'; })
      .then(function () { app.render(); });
  }

  function render(app) {
    var file = app.state.doc || 'docs/DECISIONS.md';
    load(app, file);
    var tab = function (f, label) { return '<button aria-pressed="' + (file === f) + '" data-act="doc" data-id="' + f + '">' + label + '</button>'; };
    return '<main class="screen tight">' +
      '<div class="sk-bar">' + U.iconBtn('back', 'Back', 'tab', ' data-id="library"') + '<b>How this prototype is built</b></div>' +
      '<div data-ui="segmented" role="group" aria-label="Document">' + tab('docs/DECISIONS.md', 'Decisions') + tab('docs/README.md', 'Codebase') + '</div>' +
      '<p class="sk-meta" style="margin:0">Version ' + SP.version + ' · data saved to your ' + SP.store.backend() + '.</p>' +
      '<div class="doc">' + U.esc(cache[file]) + '</div></main>';
  }

  SP.screens.about = { render: render, actions: { doc: function (app, el) { app.update({ doc: el.dataset.id }); } } };
})(window.SP);
