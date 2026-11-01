// app: state, routing and events. Screens draw; this file decides which one and routes clicks (D-09).
// Every click on [data-act] calls the action of that name; inputs report through [data-edit]
// (editor) and [data-opt] (Options).
(function (SP) {
  'use strict';
  var root = document.getElementById('app');
  var toastTimer = null;
  var painting = false, tapAct = null;   // T-15: sk-tags blur handling (see tag() below)

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
      var html = '<div class="study frame" data-mode="' + theme() + '">' + screen.render(app) + sheet +
        (s.toast ? '<div class="sk-toast" role="status">' + SP.ui.esc(s.toast) + '</div>' : '') + '</div>';
      painting = true; root.innerHTML = html; painting = false;
      var now = root.querySelector('.screen');
      if (now) { now.dataset.key = key(); now.scrollTop = keep; }
      if (now && screen.after) screen.after(app, now);
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
    carPrev: function (a, el) { SP.ui.carouselMove(root, el.dataset.id, -1); },
    carNext: function (a, el) { SP.ui.carouselMove(root, el.dataset.id, 1); },
    carGo: function (a, el) { SP.ui.carouselMove(root, el.dataset.id, 0, Number(el.dataset.n)); },
    options: function (a) { a.update({ sheet: 'options' }); },
    closeSheet: function (a) { a.update({ sheet: null }); if (a.state.screen === 'type') a.focus('#answer'); }
  };
  Object.keys(SP.screens).forEach(function (k) { Object.assign(actions, SP.screens[k].actions || {}); });

  // sk-tags: keys, a typed comma and blur become intents for the editor. A blur that comes from tapping
  // a [data-act] control applies quietly (that action redraws); a blur caused by our own redraw is ignored.
  function tag(e) {
    var it = !painting && SP.ui.tagIntent(e);
    if (it && e.type === 'keydown') e.preventDefault();
    if (it) SP.screens.edit.onTag(app, it, it.blur && !!tapAct);
    return it;
  }
  root.addEventListener('pointerdown', function (e) { tapAct = e.target.closest('[data-act]'); });
  root.addEventListener('focusout', tag);
  // T-28: rows reorder by their grip (kit U.sortBind, sk-sort); the editor moves them (edit.onSort)
  SP.ui.sortBind(root, function (list, from, to) { SP.screens.edit.onSort(app, list, from, to); });

  // T-18 Picker (Proprietary's popover chip): the native popover opens from its chip (popovertarget). Here:
  // aria-expanded follows the menu, the menu is placed under its chip (or as a bottom sheet on the phone, in CSS),
  // and focus goes to the current row. A row tap closes the menu (below). Esc and outside taps close it natively.
  root.addEventListener('toggle', function (e) {
    var pop = e.target, chip = pop.id && root.querySelector('[popovertarget="' + pop.id + '"]');
    if (!chip || !pop.classList.contains('sk-pmenu')) return;
    var open = e.newState === 'open';
    chip.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open) return;
    var r = chip.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var w = pop.offsetWidth, h = pop.offsetHeight;
    var x = Math.max(8, Math.min(r.left, vw - w - 8)), y = r.bottom + 6;
    if (y + h > vh - 8) y = Math.max(8, r.top - h - 6);
    pop.style.setProperty('--pop-x', Math.round(x) + 'px');
    pop.style.setProperty('--pop-y', Math.round(y) + 'px');
    var cur = pop.querySelector('[aria-checked="true"]') || pop.querySelector('button');
    if (cur) cur.focus({ preventScroll: true, focusVisible: false });   // no ring unless the keyboard moves on
  }, true);

  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    tapAct = null;
    var pop = e.target.closest('.sk-pmenu');
    if (el && pop && pop.matches(':popover-open')) pop.hidePopover();   // a Picker row closes its menu
    if (!el || el.disabled) return;
    var fn = actions[el.dataset.act];
    if (fn) { e.preventDefault(); fn(app, el, e); }
  });
  root.addEventListener('input', function (e) {
    if (tag(e)) return;
    if (e.target.dataset.edit) SP.screens.edit.onEdit(app, e.target);
  });
  root.addEventListener('change', function (e) {
    if (e.target.dataset.edit) SP.screens.edit.onEdit(app, e.target);
    if (e.target.dataset.opt) SP.screens.set.onOption(app, e.target);
  });
  root.addEventListener('keydown', function (e) {
    if (tag(e)) return;
    if ((e.target.id === 'answer' || (e.target.classList && e.target.classList.contains('sk-blank'))) && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); SP.screens.type.check(app); }
    if (e.target.id === 'newTitle' && e.key === 'Enter') { e.preventDefault(); actions.createSet(app); }
    if (e.key === 'Escape' && app.state.sheet) actions.closeSheet(app);
    var menu = e.target.closest && e.target.closest('.sk-pmenu');   // Picker rows: arrows move between them
    if (menu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      var rows = [].slice.call(menu.querySelectorAll('.sk-prow')), at = rows.indexOf(e.target);
      var nxt = rows[(at + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length];
      if (nxt) nxt.focus();
    }
  });

  SP.app = app;
  app.render();                       // paints from this browser's copy right away
  SP.store.onChange(function () { if (!app.state.draft) app.render(); });
  SP.store.init();                    // then switches to your account's copy when it's granted
})(window.SP);
