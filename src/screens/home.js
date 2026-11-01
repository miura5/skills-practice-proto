// screens/home: greeting, Jump back in, Recents. The way into everything else.
(function (SP) {
  'use strict';
  var U = SP.ui;

  function render(app) {
    var sets = SP.store.all();
    var last = SP.store.get(SP.store.meta().last) || sets[0];
    var h = new Date().getHours();
    var hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    var t = app.tally(last);
    var recents = sets.filter(function (s) { return s.id !== last.id; }).slice(0, 4);
    return '<main class="screen">' +
      '<header class="sk-top"><div class="grow stack" style="gap:6px"><span class="sk-meta">' + hello + ', Matt</span><h1>Study</h1></div>' +
      U.iconBtn('theme', 'Switch light or dark', 'theme') + '</header>' +
      '<section class="stack"><h2 class="sk-h2">Jump back in</h2>' +
      '<div class="sk-jump"><span class="sk-meta">' + (last.kind === 'cards' ? 'Card set' : 'Procedure') + '</span>' +
      '<b>' + U.esc(last.title) + '</b>' + U.mastery(t) +
      '<span class="sk-meta">' + t.learned + ' of ' + t.total + ' learned · ' + t.weak + ' weak</span>' +
      '<button data-ui="button" data-kind="primary" data-act="open" data-id="' + U.esc(last.id) + '" style="align-self:flex-start;padding:0 22px;border-radius:99px">Continue</button></div></section>' +
      '<section class="stack"><div class="row"><h2 class="sk-h2 grow">Recents</h2><button data-ui="button" data-kind="ghost" data-act="tab" data-id="library">See all</button></div>' +
      recents.map(function (s) { return U.setRow(s, app.tally(s)); }).join('') + '</section>' +
      '</main>' + U.tabbar('home');
  }

  SP.screens.home = { render: render, actions: {} };
})(window.SP);
