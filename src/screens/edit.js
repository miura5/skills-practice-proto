// screens/edit: the procedure and card-set editor (D-25). Works on a draft copy; Save validates
// (core/sets) and stores it. Editing a built-in set saves your copy; Reset (the ⋯ menu) brings back the original.
// Procedures: folding section rows (chevron, title, scene badge, ⋯), flat step rows (grip, number, star, cue, text).
// Card sets: flat rows (grip, number, front, back). Rows reorder by their grip (U.sortBind -> onSort).
// Numbers come from SP.core.numbers.of(draft) when that module is loaded (D-25); new steps carry no num.
(function (SP) {
  'use strict';
  var U = SP.ui;
  var uid = function (p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };

  function start(app, set, isNew) {
    var draft = JSON.parse(JSON.stringify(set));
    delete draft.builtin; delete draft.edited;
    if (draft.kind === 'procedure') {
      draft.scenes = draft.scenes || [];
      draft.sections.forEach(function (s) {
        s.id = s.id || uid('sec');
        s.steps.forEach(function (st) { st.id = st.id || uid('s'); });
      });
    } else draft.cards.forEach(function (c) { c.id = c.id || uid('c'); });
    app.update({ screen: 'edit', draft: draft, draftNew: !!isNew, confirm: false, setId: set.id, tagEdit: null, open: {} });
  }

  // A step is a sub-step when its flag says so. Built-in steps without the flag take it from an old letter num (13b).
  function isSub(st) { return typeof st.sub === 'boolean' ? st.sub : /[b-z]$/i.test(String(st.num || '')); }

  function field(label, path, value) {
    return '<label class="sk-field">' + label + '<input data-edit="' + path + '" value="' + U.esc(value || '') + '" autocomplete="off"></label>';
  }

  // Move up / Move down items for a row at i of n in list (disabled at the ends).
  function moves(list, i, n) {
    return [
      { label: 'Move up', act: 'moveRow', disabled: i === 0, data: { list: list, from: i, to: i - 1 } },
      { label: 'Move down', act: 'moveRow', disabled: i === n - 1, data: { list: list, from: i, to: i + 1 } }
    ];
  }

  function render(app) {
    var s = app.state, d = s.draft, cards = d.kind === 'cards', live = SP.store.get(d.id), open = s.open || {};
    var nums = (!cards && SP.core.numbers && SP.core.numbers.of) ? SP.core.numbers.of(d) : {};
    var body;
    if (cards) {
      body = '<div class="sk-rows">' + d.cards.map(function (c, i) {
        var p = 'cards.' + i + '.';
        return '<div class="sk-row" data-sort="cards" data-sort-i="' + i + '">' + U.grip() +
          '<span class="sk-num">' + (i + 1) + '</span>' +
          '<div class="sk-body"><input class="sk-flat" aria-label="Front" placeholder="Front" autocomplete="off" data-edit="' + p + 'front" value="' + U.esc(c.front) + '">' +
          '<textarea class="sk-flat sk-text" rows="2" aria-label="Back" placeholder="Back · [brackets] mark key words" data-edit="' + p + 'back">' + U.esc(c.back) + '</textarea></div>' +
          U.more('c-' + i, 'Card ' + (i + 1) + ' menu', moves('cards', i, d.cards.length).concat([
            { label: 'Delete', act: 'delItem', id: String(i), danger: true }
          ])) + '</div>';
      }).join('') + '</div>' +
        '<button data-ui="button" data-kind="ghost" class="sk-add" data-act="addItem">' + U.icon('plus') + 'Add card</button>';
    } else {
      body = '<div class="sk-secs">' + d.sections.map(function (sec, si) {
        var isOpen = !!open[sec.id], n = sec.steps.length, sid = String(sec.id);
        var first = sec.steps.length ? nums[sec.steps[0].id] : '', last = sec.steps.length ? nums[sec.steps[sec.steps.length - 1].id] : '';
        var range = !first ? '' : first === last ? first : first + '\u2013' + last;
        var head = '<div class="sk-sec-h">' + U.grip() +
          '<button type="button" class="sk-sec-t" data-act="toggleSec" data-id="' + U.esc(sid) + '" aria-expanded="' + (isOpen ? 'true' : 'false') + '"' +
          ' aria-label="' + U.esc((sec.title || 'Untitled section') + ', ' + n + (n === 1 ? ' step' : ' steps')) + '">' +
          U.chevron + '<b>' + U.esc(sec.title || 'Untitled section') + '</b>' +
          (range ? '<span class="sk-range">' + U.esc(range) + '</span>' : '') + '</button>' +
          (d.scenes.length ? U.picker('scene-' + si, sec.scene || '', [{ value: '', label: 'No scene' }].concat(d.scenes.map(function (t, i) {
            return { value: t.id, label: t.label, tone: U.sceneTone(i) };
          })), { label: 'Scene', act: 'pickScene', size: 'sm' }) : '') +
          U.more('sec-' + si, 'Section menu', moves('sections', si, d.sections.length).concat([
            { label: 'Delete section', act: 'delSection', id: String(si), danger: true }
          ])) + '</div>';
        var rest = '';
        if (isOpen) {
          rest = '<div class="sk-sec-b">' +
            '<input class="sk-flat sk-sec-title" aria-label="Section title" autocomplete="off" data-edit="sections.' + si + '.title" value="' + U.esc(sec.title) + '">' +
            '<div class="sk-steps">' + sec.steps.map(function (st, j) {
              var p = 'sections.' + si + '.steps.' + j + '.', sub = isSub(st), key = si + '.' + j;
              return '<div class="sk-row sk-step' + (sub ? ' sk-sub' : '') + '" data-sort="steps-' + si + '" data-sort-i="' + j + '">' + U.grip() +
                '<span class="sk-num">' + U.esc(nums[st.id] || '') + '</span>' + U.starToggle(!!st.star, key) +
                '<div class="sk-body"><input class="sk-flat sk-cue" aria-label="Cue" placeholder="Cue" autocomplete="off" data-edit="' + p + 'cue" value="' + U.esc(st.cue) + '">' +
                '<textarea class="sk-flat sk-text" rows="2" aria-label="Step text" placeholder="Put [brackets] around the key words" data-edit="' + p + 'text">' + U.esc(st.text) + '</textarea></div>' +
                U.more('st-' + si + '-' + j, 'Step menu', moves('steps-' + si, j, n).concat([
                  j === 0 ? null : { label: sub ? 'Undo sub-step' : 'Make sub-step', act: 'toggleSub', id: key },
                  { label: 'Delete', act: 'delItem', id: key, danger: true }
                ])) + '</div>';
            }).join('') + '</div>' +
            '<button data-ui="button" data-kind="ghost" class="sk-add" data-act="addItem" data-id="' + si + '">' + U.icon('plus') + 'Add step</button>' +
            '</div>';
        }
        return '<section class="sk-esec" data-sort="sections" data-sort-i="' + si + '">' + head + rest + '</section>';
      }).join('') + '</div>' +
        '<button data-ui="button" data-kind="ghost" class="sk-add" data-act="addSection">' + U.icon('plus') + 'Add section</button>';
    }

    var resetMenu = live && live.builtin && live.edited
      ? U.more('set', 'Set menu', [{ label: s.confirm ? 'Tap again to reset to the original' : 'Reset to built-in', act: 'remove', danger: true }])
      : '';
    var del = live && !live.builtin
      ? '<button data-ui="button" data-kind="ghost" data-act="remove" class="sk-danger">' + (s.confirm ? 'Tap again to delete this set' : 'Delete set') + '</button>'
      : '';
    return '<main class="screen tight">' +
      '<div class="sk-bar">' + U.iconBtn('close', 'Cancel', 'cancelEdit') + '<b>' + (s.draftNew ? 'New ' : 'Edit ') + (cards ? 'card set' : 'procedure') + '</b>' +
      '<button data-ui="button" data-kind="primary" data-act="save" class="sk-pill">Save</button>' + resetMenu + '</div>' +
      field('Title', 'title', d.title) +
      (cards ? '' : U.tags('scenes', d.scenes, s.tagEdit, { label: 'Scenes', tones: true, placeholder: d.scenes.length ? 'Add a scene' : 'Type a scene, then comma' })) +
      body + del + '</main>';
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
    if (el.tagName === 'TEXTAREA') U.autosize(el);
  }

  // Drag or menu move: list is 'sections', 'cards' or 'steps-<si>'. A first step is never a sub-step.
  function onSort(app, list, from, to) {
    var d = app.state.draft;
    if (!d) return;
    var arr = list === 'sections' ? d.sections : list === 'cards' ? d.cards : (d.sections[Number(list.split('-')[1])] || {}).steps;
    if (!U.moveItem(arr, from, to)) return;
    if (list.indexOf('steps-') === 0 && arr[0]) arr[0].sub = false;
    app.render();
  }

  function tidy(d) {
    if (d.kind === 'cards') d.cards = d.cards.filter(function (c) { return (c.front || '').trim() || (c.back || '').trim(); });
    else d.sections = d.sections.map(function (s) {
      s.steps = s.steps.filter(function (st) { return (st.text || '').trim() || (st.cue || '').trim(); });
      if (!s.scene) delete s.scene;
      if (s.steps[0]) s.steps[0].sub = false;   // a section's first step is never a sub-step
      return s;
    }).filter(function (s) { return s.steps.length; });
    return d;
  }

  var actions = {
    tagEdit: function (app, el) { onTag(app, { type: 'edit', name: el.dataset.tags, id: el.dataset.id }); },
    tagRemove: function (app, el) { onTag(app, { type: 'remove', name: el.dataset.tags, id: el.dataset.id }); },
    // A Picker row: sets the section's scene (blank = No scene). The app closes the menu before this runs.
    pickScene: function (app, el) {
      var si = Number(el.dataset.id.split('-')[1]), s = app.state.draft.sections[si];
      if (!s) return;
      s.scene = el.dataset.value || '';
      app.render();
      app.focus('#pkc-scene-' + si);
    },
    toggleSec: function (app, el) {
      var o = app.state.open || (app.state.open = {}), id = el.dataset.id;
      o[id] = !o[id];
      app.render();
    },
    toggleStar: function (app, el) {
      var p = el.dataset.id.split('.'), st = app.state.draft.sections[Number(p[0])].steps[Number(p[1])];
      st.star = !st.star;
      app.render();
    },
    toggleSub: function (app, el) {
      var p = el.dataset.id.split('.'), st = app.state.draft.sections[Number(p[0])].steps[Number(p[1])];
      st.sub = !isSub(st);
      app.render();
    },
    moveRow: function (app, el) { onSort(app, el.dataset.list, Number(el.dataset.from), Number(el.dataset.to)); },
    addItem: function (app, el) {
      var d = app.state.draft;
      if (d.kind === 'cards') d.cards.push({ id: uid('c'), front: '', back: '' });
      else {
        var si = Number(el.dataset.id);
        d.sections[si].steps.push({ id: uid('s'), star: false, cue: '', text: '' });
        app.state.open[d.sections[si].id] = true;
      }
      app.render();
    },
    delItem: function (app, el) {
      var d = app.state.draft, id = el.dataset.id;
      if (d.kind === 'cards') d.cards.splice(Number(id), 1);
      else { var p = id.split('.'); d.sections[Number(p[0])].steps.splice(Number(p[1]), 1); }
      app.render();
    },
    addSection: function (app) {
      var sec = { id: uid('sec'), title: 'New section', steps: [{ id: uid('s'), star: false, cue: '', text: '' }] };
      app.state.draft.sections.push(sec);
      app.state.open[sec.id] = true;
      app.render();
    },
    delSection: function (app, el) {
      app.state.draft.sections.splice(Number(el.dataset.id), 1);
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

  // After each draw: size the step and card text areas to their text.
  function after(app, el) {
    [].forEach.call(el.querySelectorAll('textarea'), function (t) { U.autosize(t); });
  }

  SP.screens.edit = { start: start, render: render, actions: actions, onEdit: onEdit, onTag: onTag, onSort: onSort, after: after };
})(window.SP);
