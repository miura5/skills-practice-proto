// screens/scope: the custom scope editor (D-22, T-23). Pick the steps a custom round covers: type a
// range, use the chips, or tick sections and steps. Each change saves at once (settings.custom, practice
// 'custom'). Back returns to the screen it came from; a round in progress is rebuilt from the new scope.
(function (SP) {
  'use strict';
  var U = SP.ui, S = SP.core.scope;

  function chosen(app) { return S.selected(SP.store.settings(app.set.id), app.items); }

  // Saves the picked ids (any order) as the set's custom scope, in set order.
  // skipped (T-38): the parts of a typed range that named no step; shown under the range field until the next change.
  function save(app, ids, skipped) {
    app.state.scopeSkipped = skipped && skipped.length ? skipped : null;
    var o = SP.store.settings(app.set.id), keep = {};
    ids.forEach(function (id) { keep[id] = true; });
    o.practice = 'custom';
    delete o.section;   // an old section option is replaced by the custom list
    o.custom = app.items.filter(function (it) { return keep[it.id]; }).map(function (it) { return it.id; });
    SP.store.saveSettings(app.set.id, o);
    app.render();
  }

  // The sections in set order, each with its steps.
  function groups(items) {
    var order = [], by = {};
    items.forEach(function (it) {
      if (!by[it.section]) { by[it.section] = { id: it.section, title: it.sectionTitle || it.section, items: [] }; order.push(it.section); }
      by[it.section].items.push(it);
    });
    return order.map(function (k) { return by[k]; });
  }

  function render(app) {
    if (!app.set) return '';
    var items = app.items, picked = chosen(app), on = {};
    picked.forEach(function (id) { on[id] = true; });
    var state = function (n, total) { return n === 0 ? 'off' : n === total ? 'on' : 'mixed'; };
    var rows = groups(items).map(function (g) {
      var n = g.items.filter(function (it) { return on[it.id]; }).length;
      var head = U.scopeRow('sec', g.id, state(n, g.items.length),
        '<b class="sk-scope-t">' + U.esc(g.title) + '</b><span class="sk-meta">· ' + n + '/' + g.items.length + '</span>');
      var steps = g.items.map(function (it) {
        return U.scopeRow('step', it.id, on[it.id] ? 'on' : 'off',
          '<span class="sk-scope-n">' + U.esc(it.num) + '</span><span class="sk-scope-t">' + U.esc(it.cue || it.answer) +
          (it.star ? ' <span class="sk-star" title="Starred">★</span>' : '') + '</span>');
      }).join('');
      return '<div class="sk-scope-group">' + head + '<div class="sk-scope-steps">' + steps + '</div></div>';
    }).join('');
    return '<main class="screen tight">' +
      '<div class="sk-bar"><button data-ui="button" data-kind="ghost" data-act="scopeBack">' + U.icon('back') + 'Back</button>' +
      '<span class="sk-meta sk-scope-count">' + picked.length + '/' + items.length + ' steps</span></div>' +
      '<header class="stack g10"><h1 class="sk-title">Custom scope</h1>' +
      '<p class="sk-meta sk-flush">Pick the steps a custom round covers. Type ranges, or tick sections and steps below.</p></header>' +
      '<section class="sk-scope">' +
      '<div class="sk-scope-range"><label class="sk-field sk-scope-field">Steps<input id="scopeRange" value="' + U.esc(SP.core.scope.format(picked, items)) +
      '" autocomplete="off" inputmode="numeric" enterkeyhint="done" placeholder="1, 8–12"></label>' +
      '<button data-ui="button" data-kind="neutral" data-act="scopeApply">Apply</button></div>' +
      (app.state.scopeSkipped ? '<p class="sk-note sk-flush">Skipped: ' + U.esc(app.state.scopeSkipped.join(', ')) + '</p>' : '') +
      '<div class="sk-scope-chips"><button data-ui="chip" data-act="scopeAll">All</button>' +
      '<button data-ui="chip" data-act="scopeNone">None</button>' +
      '<button data-ui="chip" data-act="scopeStarred">★ Starred only</button></div>' +
      '<div class="sk-scope-list">' + rows + '</div></section>' +
      '</main>';
  }

  // Enter in the range field applies it, the same as Apply.
  function after(app, el) {
    var input = el.querySelector('#scopeRange');
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); actions.scopeApply(app); }
    });
  }

  var actions = {
    scopeBack: function (app) {
      var to = app.state.scopeFrom || 'set', r = app.state.round;
      app.state.screen = to;
      app.state.scopeFrom = null;
      app.state.sheet = null;
      if (r) {
        // The round rebuilds from the new scope (keeps what's answered). refilter may finish it (Results).
        SP.screens.round.refilter(app);
        if (app.state.screen === 'done' && to === 'set') app.state.screen = 'set';
        if (app.state.round && app.state.round.ids.length === 0) {
          SP.store.clearRound(app.set.id);
          app.state.round = null;
          app.state.toast = 'No steps in that scope. Pick some, or Smart.';
        }
      }
      app.render();
      if (to === 'next' || to === 'type') app.focus('#answer');
    },
    scopeApply: function (app) {
      var input = document.getElementById('scopeRange'), text = input ? input.value : '';
      var got = S.parseDetail(text, app.items);
      if (!got.ids.length && text.trim()) return app.toast('Could not read that. Try 1, 8–12, 15–32.');
      save(app, got.ids, got.skipped);
    },
    scopeAll: function (app) { save(app, app.items.map(function (it) { return it.id; })); },
    scopeNone: function (app) { save(app, []); },
    scopeStarred: function (app) { save(app, app.items.filter(function (it) { return it.star; }).map(function (it) { return it.id; })); },
    scopeSec: function (app, el) {
      var g = groups(app.items).filter(function (x) { return x.id === el.dataset.id; })[0];
      if (!g) return;
      var picked = chosen(app), keep = {};
      picked.forEach(function (id) { keep[id] = true; });
      var all = g.items.every(function (it) { return keep[it.id]; });
      g.items.forEach(function (it) { keep[it.id] = !all; });
      save(app, app.items.filter(function (it) { return keep[it.id]; }).map(function (it) { return it.id; }));
    },
    scopeStep: function (app, el) {
      var picked = chosen(app), keep = {}, id = el.dataset.id;
      picked.forEach(function (x) { keep[x] = true; });
      keep[id] = !keep[id];
      save(app, app.items.filter(function (it) { return keep[it.id]; }).map(function (it) { return it.id; }));
    }
  };

  SP.screens.scope = { render: render, after: after, actions: actions };
})(window.SP);
