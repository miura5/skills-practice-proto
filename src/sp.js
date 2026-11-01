// The one global: SP. Every other file adds to it and nothing else touches window.
// Load order (index.html): sp.js, content/*, core/*, store/*, ui/*, screens/*, app.js.
(function () {
  'use strict';
  var registry = [];
  window.SP = {
    version: '0.1.0',
    // content/*.js call SP.content.add(set) with a built-in set (D-04).
    content: {
      add: function (set) { registry.push(set); },
      all: function () { return registry.slice(); }
    },
    core: {},    // no UI, no storage: grading, progress, rounds, sets (D-03)
    store: null, // src/store/store.js
    ui: {},      // Study kit helpers that return markup
    screens: {}  // one file per screen; each exports render(state) and its actions
  };
})();
