// screens/edit: add and edit cards or steps. Works on a draft copy; Save validates
// (core/sets) and stores it. Editing a built-in set saves your copy; Reset brings back the original.
(function (SP) {
  'use strict';
  var U = SP.ui;
  var uid = function (p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };

  function start(app, set, isNew) {
    var draft = JSON.parse(JSON.stringify(set));
    delete draft.builtin; delete draft.edited;
    app.update({ screen: 'edit', draft: draft, draftNew: !!isNew, confirm: false, setId: set.id });
  }

  function field(label, path, value, multi) {
    var v = U.esc(value || '');
    return '<label class="sk-field">' + label + (multi
      ? '<textarea data-edit="' + path + '" rows="3">' + v + '</textarea>'
      : '<input data-edit="' + path + '" value="' + v + '" autocomplete="off">') + '</label>';
  }

  function render(app) {
    var d = app.state.draft, cards = d.kind === 'cards', live = SP.store.get(d.id);
    var body = cards
      ? d.cards.map(function (c, i) {
        return '<div class="sk-edit"><div class="sk-edit-h"><b>Card ' + (i + 1) + '</b>' + U.iconBtn('trash', 'Remove card ' + (i + 1), 'delItem', ' data-id="' + i + '"') + '</div>' +
          field('Front', 'cards.' + i + '.front', c.front) + field('Back · put [brackets] around the key words', 'cards.' + i + '.back', c.back, true) + '</div>';
      }).join('') + '<button data-ui="button" data-kind="neutral" data-act="addItem">' + U.icon('plus') + 'Add card</button>'
      : d.sections.map(function (s, si) {
        return '<section class="stack">' + field('Section', 'sections.' + si + '.title', s.title) +
          s.steps.map(function (st, j) {
            var p = 'sections.' + si + '.steps.' + j + '.';
            return '<div class="sk-edit"><div class="sk-edit-h"><b>Step</b>' +
              '<label class="sk-check"><input type="checkbox" data-edit="' + p + 'star"' + (st.star ? ' checked' : '') + '>Starred</label>' +
              U.iconBtn('trash', 'Remove step', 'delItem', ' data-id="' + si + '.' + j + '"') + '</div>' +
              '<div class="row end"><div class="w72">' + field('No.', p + 'num', st.num) + '</div><div class="grow">' + field('Cue', p + 'cue', st.cue) + '</div></div>' +
              field('Step · put [brackets] around the key words', p + 'text', st.text, true) + '</div>';
          }).join('') +
          '<button data-ui="button" data-kind="neutral" data-act="addItem" data-id="' + si + '">' + U.icon('plus') + 'Add step to ' + U.esc(s.title || 'this section') + '</button></section>';
      }).join('') + '<button data-ui="button" data-kind="ghost" data-act="addSection">' + U.icon('plus') + 'Add section</button>';
    var danger = !live ? '' : live.builtin
      ? (live.edited ? '<button data-ui="button" data-kind="ghost" data-act="remove">' + (app.state.confirm ? 'Tap again to reset to the original' : 'Reset to the original') + '</button>' : '')
      : '<button data-ui="button" data-kind="ghost" data-act="remove" class="sk-danger">' + (app.state.confirm ? 'Tap again to delete this set' : 'Delete set') + '</button>';
    return '<main class="screen tight">' +
      '<div class="sk-bar">' + U.iconBtn('close', 'Cancel', 'cancelEdit') + '<b>' + (app.state.draftNew ? 'New ' : 'Edit ') + (cards ? 'card set' : 'procedure') + '</b>' +
      '<button data-ui="button" data-kind="primary" data-act="save" class="sk-pill">Save</button></div>' +
      field('Title', 'title', d.title) +
      (live && live.builtin && !live.edited ? '<p class="sk-meta sk-flush">This is a built-in set. Saving keeps your copy; you can reset it later.</p>' : '') +
      body + danger + '</main>';
  }

  // data-edit="a.b.0.c" -> sets draft.a.b[0].c
  function onEdit(app, el) {
    var path = el.dataset.edit.split('.'), o = app.state.draft;
    for (var i = 0; i < path.length - 1; i++) o = o[path[i]];
    o[path[path.length - 1]] = el.type === 'checkbox' ? el.checked : el.value;
  }

  function tidy(d) {
    if (d.kind === 'cards') d.cards = d.cards.filter(function (c) { return (c.front || '').trim() || (c.back || '').trim(); });
    else d.sections = d.sections.map(function (s) {
      s.steps = s.steps.filter(function (st) { return (st.text || '').trim() || (st.cue || '').trim(); });
      return s;
    }).filter(function (s) { return s.steps.length; });
    return d;
  }

  var actions = {
    addItem: function (app, el) {
      var d = app.state.draft;
      if (d.kind === 'cards') d.cards.push({ id: uid('c'), front: '', back: '' });
      else { var s = d.sections[Number(el.dataset.id)]; s.steps.push({ id: uid('s'), num: String(s.steps.length + 1), star: false, cue: '', text: '' }); }
      app.render();
    },
    delItem: function (app, el) {
      var d = app.state.draft, id = el.dataset.id;
      if (d.kind === 'cards') d.cards.splice(Number(id), 1);
      else { var p = id.split('.'); d.sections[Number(p[0])].steps.splice(Number(p[1]), 1); }
      app.render();
    },
    addSection: function (app) {
      app.state.draft.sections.push({ id: uid('sec'), title: 'New section', steps: [{ id: uid('s'), num: '1', star: false, cue: '', text: '' }] });
      app.render();
    },
    save: function (app) {
      var d = tidy(JSON.parse(JSON.stringify(app.state.draft)));
      var errs = SP.store.saveSet(d);
      if (errs.length) return app.toast('Can’t save yet: ' + errs[0] + '.');
      app.update({ screen: 'set', setId: d.id, draft: null, pv: 0, pvFlip: false });
      app.toast('Saved.');
    },
    cancelEdit: function (app) {
      app.update({ screen: app.state.draftNew ? 'library' : 'set', draft: null });
    },
    remove: function (app) {
      if (!app.state.confirm) return app.update({ confirm: true });
      var id = app.state.draft.id, builtin = SP.store.isBuiltin(id);
      SP.store.removeSet(id);
      app.update(builtin ? { screen: 'set', draft: null, confirm: false } : { screen: 'library', draft: null, confirm: false, setId: null });
      app.toast(builtin ? 'Back to the original.' : 'Set deleted.');
    }
  };

  SP.screens.edit = { start: start, render: render, actions: actions, onEdit: onEdit };
})(window.SP);
