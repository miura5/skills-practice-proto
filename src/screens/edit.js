// screens/edit: add and edit cards or steps. Works on a draft copy; Save validates
// (core/sets) and stores it. Editing a built-in set saves your copy; Reset brings back the original.
// Procedures have scene tags (D-19): a Scenes field (sk-tags) under Title and a scene Picker per section.
(function (SP) {
  'use strict';
  var U = SP.ui;
  var uid = function (p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };

  function start(app, set, isNew) {
    var draft = JSON.parse(JSON.stringify(set));
    delete draft.builtin; delete draft.edited;
    if (draft.kind === 'procedure') draft.scenes = draft.scenes || [];
    app.update({ screen: 'edit', draft: draft, draftNew: !!isNew, confirm: false, setId: set.id, tagEdit: null });
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
        return '<section class="stack">' + field('Section', 'sections.' + si + '.title', s.title) + picker(d.scenes, si, s.scene) +
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
      (cards ? '' : U.tags('scenes', d.scenes, app.state.tagEdit, { label: 'Scenes', placeholder: d.scenes.length ? 'Add a scene' : 'Type a scene, then comma' })) +
      (live && live.builtin && !live.edited ? '<p class="sk-meta sk-flush">This is a built-in set. Saving keeps your copy; you can reset it later.</p>' : '') +
      body + danger + '</main>';
  }

  // Proprietary's Picker (a native select): "No scene" + the set's scene tags. Hidden until there are tags.
  function picker(scenes, si, current) {
    if (!scenes.length) return '';
    var opt = function (id, label) { return '<option value="' + U.esc(id) + '"' + ((current || '') === id ? ' selected' : '') + '>' + U.esc(label) + '</option>'; };
    return '<label class="sk-field">Scene<select data-ui="picker" data-edit="sections.' + si + '.scene">' + opt('', 'No scene') +
      scenes.map(function (t) { return opt(t.id, t.label); }).join('') + '</select></label>';
  }

  // Applies an sk-tags intent (SP.ui.tagIntent, or a badge tap) to the draft's scenes.
  // quiet: a tap on another control is coming and will redraw, so don't redraw under it.
  function onTag(app, it, quiet) {
    var d = app.state.draft, list = d && d[it.name], v = (it.value || '').trim();
    if (!list) return;
    var find = function (id) { return list.filter(function (t) { return t.id === id; })[0]; };
    var drop = function (id) {
      d[it.name] = list.filter(function (t) { return t.id !== id; });
      d.sections.forEach(function (s) { if (s.scene === id) s.scene = ''; });   // removing a scene clears it everywhere
    };
    var editing = null, t = find(it.id);
    if (it.type === 'add' && v && !list.some(function (x) { return x.label.toLowerCase() === v.toLowerCase(); })) {
      list.push({ id: SP.core.sets.tagId(v, list.map(function (x) { return x.id; })), label: v });
    }
    if (it.type === 'commit' && t) { if (v) t.label = v; else drop(t.id); }
    if (it.type === 'remove') drop(it.id);
    if (it.type === 'edit') editing = it.id;
    if (it.type === 'pull' && list.length) editing = list[list.length - 1].id;
    app.state.tagEdit = editing;
    if (quiet) return;
    app.render();
    if (!it.blur) U.tagsFocus(it.name, editing);
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
      if (!s.scene) delete s.scene;
      return s;
    }).filter(function (s) { return s.steps.length; });
    return d;
  }

  var actions = {
    tagEdit: function (app, el) { onTag(app, { type: 'edit', name: el.dataset.tags, id: el.dataset.id }); },
    tagRemove: function (app, el) { onTag(app, { type: 'remove', name: el.dataset.tags, id: el.dataset.id }); },
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

  SP.screens.edit = { start: start, render: render, actions: actions, onEdit: onEdit, onTag: onTag };
})(window.SP);
