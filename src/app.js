// app: state, routing and events. Screens draw; this file decides which one and routes clicks (D-09).
// Every click on [data-act] calls the action of that name; inputs report through [data-edit]
// (editor) and [data-opt] (Options).
(function (SP) {
  'use strict';
  var root = document.getElementById('app');
  var toastTimer = null;

  var app = {
    state: { screen: 'home', setId: null, filter: 'all', sheet: null, round: null, draft: null, pv: 0, pvFlip: false },
    set: null, items: [], byId: {},

    update: function (patch) { Object.assign(app.state, patch); app.render(); },
    focus: function (sel) { var el = root.querySelector(sel); if (el) el.focus({ preventScroll: true }); },
    toast: function (msg) {
      app.state.toast = msg; app.render();
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { app.state.toast = null; app.render(); }, 2600);
    },
    tally: function (set) { return SP.core.progress.tally(SP.core.sets.items(set), SP.store.progress(set.id)); },

    render: function () {
      var s = app.state;
      app.set = s.setId ? SP.store.get(s.setId) : null;
      if (!app.set && ['set', 'next', 'type', 'done'].indexOf(s.screen) >= 0) s.screen = 'library';
      app.items = app.set ? SP.core.sets.items(app.set) : [];
      app.byId = {};
      app.items.forEach(function (it) { app.byId[it.id] = it; });

      var screen = SP.screens[{ next: 'next', type: 'type', done: 'round' }[s.screen] || s.screen];
      var old = root.querySelector('.screen'), keep = old && old.dataset.key === key() ? old.scrollTop : 0;
      var sheet = s.sheet === 'options' ? SP.screens.set.sheet(app) : s.sheet === 'new' ? SP.screens.library.sheet(app) : '';
      root.innerHTML = '<div class="study frame" data-mode="' + theme() + '">' + screen.render(app) + sheet +
        (s.toast ? '<div class="sk-toast" role="status">' + SP.ui.esc(s.toast) + '</div>' : '') + '</div>';
      var now = root.querySelector('.screen');
      if (now) { now.dataset.key = key(); now.scrollTop = keep; }
    }
  };
  function key() { return app.state.screen + ':' + (app.state.setId || ''); }
  function theme() {
    var t = SP.store.meta().theme;
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // ---------- actions that belong to no single screen ----------
  var actions = {
    tab: function (a, el) { a.update({ screen: el.dataset.id, sheet: null }); },
    go: function (a, el) { a.update({ screen: el.dataset.id }); },
    open: function (a, el) {
      SP.store.saveMeta({ last: el.dataset.id });
      a.update({ screen: 'set', setId: el.dataset.id, pv: 0, pvFlip: false, round: null });
    },
    back: function (a) { a.update({ screen: 'library', round: null }); },
    theme: function (a) { SP.store.saveMeta({ theme: theme() === 'dark' ? 'light' : 'dark' }); a.render(); },
    options: function (a) { a.update({ sheet: 'options' }); },
    closeSheet: function (a) { a.update({ sheet: null }); if (a.state.screen === 'type') a.focus('#answer'); }
  };
  Object.keys(SP.screens).forEach(function (k) { Object.assign(actions, SP.screens[k].actions || {}); });

  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var fn = actions[el.dataset.act];
    if (fn) { e.preventDefault(); fn(app, el, e); }
  });
  root.addEventListener('input', function (e) {
    if (e.target.dataset.edit) SP.screens.edit.onEdit(app, e.target);
  });
  root.addEventListener('change', function (e) {
    if (e.target.dataset.edit) SP.screens.edit.onEdit(app, e.target);
    if (e.target.dataset.opt) SP.screens.set.onOption(app, e.target);
  });
  root.addEventListener('keydown', function (e) {
    if (e.target.id === 'answer' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); SP.screens.type.check(app); }
    if (e.target.id === 'newTitle' && e.key === 'Enter') { e.preventDefault(); actions.createSet(app); }
    if (e.key === 'Escape' && app.state.sheet) actions.closeSheet(app);
  });

  SP.app = app;
  app.render();                       // paints from this browser's copy right away
  SP.store.onChange(function () { if (!app.state.draft) app.render(); });
  SP.store.init();                    // then switches to your account's copy when it's granted
})(window.SP);
