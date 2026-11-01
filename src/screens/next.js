// screens/next: Next Step (procedures) and Flashcards (cards). Flip, then grade yourself.
// Self-graded answers top out at Familiar (core/progress).
(function (SP) {
  'use strict';
  var U = SP.ui, R = SP.screens.round;

  var seen = {};   // last round + index drawn, so only a move to a new item animates (T-06)
  function render(app) {
    var r = app.state.round, it = R.current(app), cards = app.set.kind === 'cards';
    var enter = R.enter(seen, r, cards);
    return R.bar(app) +
      '<main class="screen g20 snug">' +
      '<span class="sk-meta center">' + U.esc(app.set.title) + ' · ' + R.modeName(app) + '</span>' +
      '<div class="grow vcenter">' +
      '<div class="sk-enter"' + enter + '>' + U.flip({
        act: 'flipCard', flipped: r.flip, h: 380,
        lead: cards ? 'Card ' + it.num : R.scene(app, it) + (it.prev ? 'After: ' + (it.prev.cue || it.prev.answer) : 'Start of the checklist'),
        ask: cards ? it.front : 'What’s next?',
        label: cards ? it.front : 'Step ' + it.num + (it.star ? ' ★' : ''), answer: it.answer
      }) + '</div></div>' +
      (r.flip
        ? '<div class="sk-grade"><button data-tone="bad" data-act="grade" data-id="missed">Missed</button><button data-tone="warn" data-act="grade" data-id="shaky">Shaky</button><button data-tone="ok" data-act="grade" data-id="right">Got it</button></div>'
        : '<p class="sk-meta sk-say">Say it out loud, then flip</p>') +
      '</main>';
  }

  var actions = {
    flipCard: function (app) { app.state.round.flip = !app.state.round.flip; app.render(); },
    grade: function (app, el) { R.record(app, el.dataset.id, 'next'); }
  };

  SP.screens.next = { render: render, actions: actions };
})(window.SP);
