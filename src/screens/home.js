// screens/home: greeting, Jump back in, Recents. The way into everything else.
(function (SP) {
  'use strict';
  var U = SP.ui;

  // One Jump back in slide: a saved round resumes, otherwise the set opens.
  function slide(app, set) {
    var t = app.tally(set), cards = set.kind === 'cards';
    var r = SP.core.rounds.restore(SP.store.round(set.id), SP.core.sets.items(set));
    var mode = r && (r.mode === 'type' ? 'Type it' : cards ? 'Flashcards' : 'Next Step');
    return '<div class="sk-jump"><span class="sk-meta">' + (cards ? 'Card set' : 'Procedure') + '</span>' +
      '<b>' + U.esc(set.title) + '</b>' + U.mastery(t) +
      '<span class="sk-meta">' + (r ? mode + ' round · ' + r.i + ' of ' + r.ids.length : t.learned + ' of ' + t.total + ' learned · ' + t.weak + ' weak') + '</span>' +
      '<span class="sk-grow"></span>' +
      '<button data-ui="button" data-kind="primary" data-act="' + (r ? 'resumeLast' : 'open') + '" data-id="' + U.esc(set.id) + '" class="sk-pill">' + (r ? 'Resume round' : 'Continue') + '</button>' +
      '<div class="sk-jump-art">' + U.art(r ? (r.mode === 'type' ? 'type' : 'flip') : cards ? 'flip' : 'type') + '</div></div>';
  }

  function render(app) {
    var sets = SP.store.all();
    var last = SP.store.get(SP.store.meta().last) || sets[0];
    var h = new Date().getHours();
    var hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    // T-10: last opened first, then sets with a saved round, then the other recent ones (max 5)
    var others = sets.filter(function (s) { return s.id !== last.id; });
    var saved = others.filter(function (s) { return SP.store.round(s.id); });
    var jump = [last].concat(saved, others.filter(function (s) { return saved.indexOf(s) < 0; })).slice(0, 5);
    var recents = others.slice(0, 4);
    return '<main class="screen">' +
      '<header class="sk-top"><div class="grow stack"><span class="sk-meta">' + hello + ', Matt</span><h1>Study</h1></div>' +
      U.iconBtn('theme', 'Switch light or dark', 'theme') + '</header>' +
      '<section class="stack"><h2 class="sk-h2">Jump back in</h2>' +
      U.carousel('jump', jump.map(function (s) { return slide(app, s); })) + '</section>' +
      '<section class="stack"><div class="row"><h2 class="sk-h2 grow">Recents</h2><button data-ui="button" data-kind="ghost" data-act="tab" data-id="library">See all</button></div>' +
      recents.map(function (s) { return U.setRow(s, app.tally(s)); }).join('') + '</section>' +
      '</main>' + U.tabbar('home');
  }

    var actions = {
    // Open the set, then step straight back into its saved round.
    resumeLast: function (app, el) {
      SP.store.saveMeta({ last: el.dataset.id });
      app.update({ screen: 'set', setId: el.dataset.id, pv: 0, pvFlip: false, round: null });
      SP.screens.round.resume(app);
    }
  };

  SP.screens.home = { render: render, after: function (app, el) { U.carouselBind(el); }, actions: actions };
})(window.SP);
