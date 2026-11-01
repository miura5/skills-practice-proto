// ui/kit: Study kit components as markup helpers (D-02). Each returns an HTML string that uses
// Proprietary's data-ui components and the sk- classes from ds/study.css. No state, no events:
// buttons carry data-act="<action>" and app.js routes the click.
(function (SP) {
  'use strict';
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // [key words] shown as marked text
  function marked(raw) { return esc(raw).replace(/\[([^\]]+)\]/g, '<mark class="sk-key">$1</mark>'); }

  var PATHS = {
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    next: '<path d="M9 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    theme: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    library: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    cards: '<rect x="7" y="4" width="13" height="16" rx="2"/><path d="M4 7v11a2 2 0 0 0 2 2"/>',
    procedure: '<path d="M4 6l2 2 3-3M4 13l2 2 3-3M12 7h8M12 14h8M12 20h8M5 20h1"/>',
    options: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (PATHS[name] || '') + '</svg>'; }
  function iconBtn(name, label, act, extra) {
    return '<button data-ui="button" class="icon" aria-label="' + esc(label) + '" data-act="' + act + '"' + (extra || '') + '>' + icon(name) + '</button>';
  }

  // Meter with the ladder's colours: learned (green), familiar (yellow), weak (red): the Study theme's ladder tokens
  function mastery(t, cls) {
    var pc = function (n) { return t.total ? (100 * n / t.total).toFixed(1) : 0; };
    return '<span class="gauge ' + (cls || '') + '" role="img" aria-label="' + t.learned + ' learned of ' + t.total + '">' +
      '<i data-tone="learned" style="width:' + pc(t.learned) + '%"></i><i data-tone="familiar" style="width:' + pc(t.familiar) + '%"></i><i data-tone="weak" style="width:' + pc(t.weak) + '%"></i></span>';
  }

  function setRow(s, t) {
    var count = s.kind === 'cards' ? t.total + ' cards' : t.total + ' steps';
    return '<button class="sk-set" data-act="open" data-id="' + esc(s.id) + '">' +
      '<span class="sk-ico" data-kind="' + s.kind + '">' + icon(s.kind) + '</span>' +
      '<span class="sk-set-b"><b>' + esc(s.title) + '</b><span>' + count + ' · ' + t.learned + ' learned' + (s.edited ? ' · edited' : '') + '</span></span>' +
      mastery(t) + '</button>';
  }

  var ART = {
    flip: '<svg viewBox="0 0 120 72" aria-hidden="true"><rect x="10" y="20" width="56" height="42" rx="6" class="art-back" transform="rotate(-8 38 41)"/><rect x="28" y="8" width="58" height="44" rx="6" class="art-face" stroke="currentColor" stroke-width="2.5"/><text x="57" y="38" text-anchor="middle" font-size="20" font-weight="700" fill="currentColor" font-family="system-ui">?</text><circle cx="92" cy="54" r="12" fill="currentColor"/><path d="M86 54h11M93 49l5 5-5 5" class="art-arrow" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    type: '<svg viewBox="0 0 120 72" aria-hidden="true"><rect x="16" y="6" width="88" height="24" rx="6" class="art-face" stroke="currentColor" stroke-width="2.5"/><rect x="24" y="15" width="40" height="6" rx="3" fill="currentColor"/><rect x="70" y="12" width="2" height="12" fill="currentColor"/><g class="art-back"><rect x="16" y="38" width="15" height="10" rx="2"/><rect x="35" y="38" width="15" height="10" rx="2"/><rect x="54" y="38" width="15" height="10" rx="2"/><rect x="73" y="38" width="15" height="10" rx="2"/><rect x="92" y="38" width="12" height="10" rx="2"/><rect x="30" y="54" width="60" height="10" rx="2"/></g></svg>'
  };
  function art(name) { return ART[name]; }
  function practice(title, art, act) {
    return '<button class="sk-practice" data-act="' + act + '"><b>' + esc(title) + '</b><div class="sk-art">' + ART[art] + '</div></button>';
  }

  function flip(o) {
    return '<button class="sk-flip" aria-pressed="' + (o.flipped ? 'true' : 'false') + '" aria-label="Flashcard, tap to flip" data-act="' + o.act + '" style="--sk-flip-h:' + (o.h || 220) + 'px">' +
      '<div class="sk-flip-in">' +
      '<div class="sk-face front"><small>' + esc(o.lead) + '</small><span class="ask">' + esc(o.ask) + '</span><small>Tap to flip</small></div>' +
      '<div class="sk-face back"><span class="num">' + esc(o.label) + '</span><span class="ans">' + esc(o.answer) + '</span></div>' +
      '</div></button>';
  }

  // bar: optional markup that replaces the plain round meter (T-16: segbar)
  function session(done, total, bar) {
    var pc = total ? Math.round(100 * done / total) : 0;
    return '<div class="sk-session">' + iconBtn('close', 'End round', 'end') +
      (bar || '<div class="gauge" role="progressbar" aria-label="Round progress" aria-valuenow="' + pc + '" aria-valuemin="0" aria-valuemax="100"><i data-tone="ok" style="width:' + pc + '%"></i></div>') +
      '<span class="sk-count">' + done + ' / ' + total + '</span>' + iconBtn('options', 'Options', 'options') + '</div>';
  }

  function tabbar(current) {
    var tab = function (id, label) {
      return '<button aria-current="' + (current === id ? 'page' : 'false') + '" data-act="tab" data-id="' + id + '">' + icon(id) + label + '</button>';
    };
    return '<nav class="sk-tabbar" aria-label="Main">' + tab('home', 'Home') + tab('library', 'Library') + '</nav>';
  }

  function toggle(name, label, on, note) {
    return '<label class="sk-switch"><span><b>' + esc(label) + '</b>' + (note ? '<small>' + esc(note) + '</small>' : '') + '</span>' +
      '<input type="checkbox" role="switch" data-opt="' + name + '"' + (on ? ' checked' : '') + '><i aria-hidden="true"></i></label>';
  }

  // T-10: a horizontal carousel of slides (HTML strings). id names it for the carPrev/carNext/carGo actions.
  function carousel(id, slides) {
    var n = slides.length;
    return '<div class="sk-carousel" data-car="' + esc(id) + '">' +
      '<button data-ui="button" data-kind="neutral" class="icon sk-car-prev" aria-label="Previous" data-act="carPrev" data-id="' + esc(id) + '" disabled>' + icon('back') + '</button>' +
      '<div class="sk-track">' + slides.map(function (s, i) { return '<div class="sk-slide" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + n + '">' + s + '</div>'; }).join('') + '</div>' +
      '<button data-ui="button" data-kind="neutral" class="icon sk-car-next" aria-label="Next" data-act="carNext" data-id="' + esc(id) + '"' + (n < 2 ? ' disabled' : '') + '>' + icon('next') + '</button>' +
      (n > 1 ? '<div class="sk-dots">' + slides.map(function (s, i) { return '<button aria-label="Slide ' + (i + 1) + '" aria-current="' + (i === 0) + '" data-act="carGo" data-id="' + esc(id) + '" data-n="' + i + '"></button>'; }).join('') + '</div>' : '') +
      '</div>';
  }
  // Keeps arrows and dots in step with the track's scroll position. Call after render.
  function carouselBind(root) {
    [].forEach.call(root.querySelectorAll('.sk-carousel'), function (c) {
      var t = c.querySelector('.sk-track'), raf = 0;
      var sync = function () {
        raf = 0;
        var w = t.firstElementChild ? t.firstElementChild.offsetWidth + 12 : 1, i = Math.round(t.scrollLeft / w), n = t.children.length;
        var end = t.scrollLeft >= t.scrollWidth - t.clientWidth - 2;
        if (end) i = n - 1;
        [].forEach.call(c.querySelectorAll('.sk-dots button'), function (d, k) { d.setAttribute('aria-current', String(k === i)); });
        c.querySelector('.sk-car-prev').disabled = t.scrollLeft < 2;
        c.querySelector('.sk-car-next').disabled = end;
      };
      t.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(sync); }, { passive: true });
      sync();
    });
  }
  function carouselMove(root, id, by, to) {
    var c = root.querySelector('.sk-carousel[data-car="' + id + '"]'), t = c && c.querySelector('.sk-track');
    if (!t || !t.firstElementChild) return;
    var w = t.firstElementChild.offsetWidth + 12;
    t.scrollTo({ left: to != null ? to * w : t.scrollLeft + by * w });
  }

  // ---- T-15 helpers (Lane A) ----
  // sk-tags (D-19): a generic tag input. Badges are Proprietary chips; tapping one edits it in place
  // (editingId), x removes it. o = {label, placeholder}. Taps route as data-act tagEdit / tagRemove.
  function tags(name, list, editingId, o) {
    o = o || {};
    var n = esc(name), at = ' data-tags="' + n + '" data-id="';
    var tone = function (i) { return o.tones ? ' data-tone="' + sceneTone(i) + '"' : ''; };   // T-18: colour by index
    return '<div class="sk-field"><label for="sk-tags-' + n + '">' + esc(o.label || name) + '</label><div class="sk-tags">' +
      list.map(function (t, i) {
        var l = esc(t.label), id = esc(t.id);
        if (t.id === editingId) {
          return '<input id="sk-tags-' + n + '-edit" class="sk-tags-in sk-tags-edit"' + at + id + '"' + tone(i) + ' value="' + l + '" size="' +
            Math.max(4, String(t.label).length + 1) + '" aria-label="Rename ' + l + '" autocomplete="off" enterkeyhint="done">';
        }
        return '<span data-ui="chip" class="sk-tag"' + tone(i) + '><button type="button" class="sk-tag-l" data-act="tagEdit"' + at + id + '" aria-label="Rename ' + l + '">' + l + '</button>' +
          '<button type="button" class="sk-tag-x" data-act="tagRemove"' + at + id + '" aria-label="Remove ' + l + '">' + icon('close') + '</button></span>';
      }).join('') +
      '<input id="sk-tags-' + n + '" class="sk-tags-in" data-tags="' + n + '" placeholder="' + esc(o.placeholder || '') + '" autocomplete="off" enterkeyhint="done">' +
      '</div></div>';
  }
  // Turns a keydown, input or focusout on an sk-tags input into an intent, or null:
  // {type: add | commit | pull | cancel, name, id (the tag being edited), value, blur}.
  function tagIntent(e) {
    var t = e.target;
    if (!t || !t.classList || !t.classList.contains('sk-tags-in')) return null;
    var id = t.dataset.id || '', v = t.value, it = function (type, value) {
      return { type: type, name: t.dataset.tags, id: id, value: value == null ? v : value, blur: e.type === 'focusout' };
    };
    var done = id ? 'commit' : 'add';
    if (e.type === 'focusout') return id || v.trim() ? it(done) : null;
    if (e.type === 'input') return v.indexOf(',') >= 0 ? it(done, v.split(',')[0]) : null;   // soft keyboards that hide the key
    if (e.type !== 'keydown' || e.isComposing) return null;
    if (e.key === ',' || e.key === 'Enter') return it(done);
    if (e.key === 'Backspace' && !v) return it(id ? 'commit' : 'pull', '');
    if (e.key === 'Escape' && id) return it('cancel');
    return null;
  }
  // After a redraw: focus the tag being edited (caret at the end) or the new-tag input.
  function tagsFocus(name, editing) {
    var el = document.getElementById('sk-tags-' + name + (editing ? '-edit' : ''));
    if (!el) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(el.value.length, el.value.length);
  }


  // ---- T-16 helpers (Lane B) ----
  // sk-segbar: the chunked session bar (D-19, v2 in D-22). segs: [{label, fill 0..1}], one equal-width
  // segment per chunk; at: the current chunk. One progressbar for the round, named by the current chunk.
  function segbar(segs, at, done, total) {
    var cur = segs[at] || {};
    return '<div class="sk-segbar" role="progressbar" aria-label="' + esc(cur.label) + ', part ' + (at + 1) + ' of ' + segs.length + '" aria-valuenow="' + done + '" aria-valuemin="0" aria-valuemax="' + total + '">' +
      segs.map(function (s, k) {
        return '<span class="sk-seg"' + (k === at ? ' data-current="true"' : '') + ' title="' + esc(s.label) + '"><i style="width:' + (100 * s.fill).toFixed(1) + '%"></i></span>';
      }).join('') + '</div>';
  }


  // ---- T-18 helpers (Lane A) ----
  // Scene colour by position: the Nth tag (0-based) takes scene-1..scene-6, then wraps (index mod 6).
  function sceneTone(i) { return 'scene-' + ((i % 6) + 1); }
  // Proprietary's Picker (generic, no scene logic): a chip button that opens a .popover menu on the native
  // popover attribute. id names it (popover id pk-<id>, chip id pkc-<id>); value is the chosen option's value;
  // options = [{value, label, tone?}]; o = {label (caption for screen readers), act (data-act of a row)}.
  // Each row is a button carrying data-act, data-id (= id) and data-value. The app positions and closes it.
  function picker(id, value, options, o) {
    o = o || {};
    var n = esc(id), cur = options.filter(function (x) { return x.value === value; })[0] || options[0] || { label: '' };
    var pid = 'pk-' + n;
    return '<button type="button" id="pkc-' + n + '" data-ui="chip" class="sk-picker"' + (cur.tone ? ' data-tone="' + esc(cur.tone) + '"' : '') +
      ' popovertarget="' + pid + '" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(o.label ? o.label + ': ' : '') + esc(cur.label) + '">' +
      (cur.tone ? '<i class="sk-pdot" aria-hidden="true"></i>' : '') + '<span class="sk-picker-l">' + esc(cur.label) + '</span>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg></button>' +
      '<div id="' + pid + '" class="popover sk-pmenu" popover="auto" role="menu" aria-label="' + esc(o.label || 'Choose') + '">' +
      options.map(function (x) {
        var on = x.value === value;
        return '<button type="button" class="popover-i sk-prow" role="menuitemradio" aria-checked="' + (on ? 'true' : 'false') + '"' +
          ' data-act="' + esc(o.act || '') + '" data-id="' + n + '" data-value="' + esc(x.value) + '">' +
          (x.tone ? '<i class="sk-pdot" data-tone="' + esc(x.tone) + '" aria-hidden="true"></i>' : '') + '<span>' + esc(x.label) + '</span></button>';
      }).join('') + '</div>';
  }


  // ---- T-20 helpers (Lane B) ----


  // ---- T-23 helpers (Lane C) ----
  // radio: one row of the Options Scope list (D-22). The label is the tap target (title, sub-line, radio
  // on the right); extra is markup under the row (the Custom row's Edit selection button).
  function radio(name, value, title, sub, checked, extra) {
    return '<div class="sk-radio-row"><label class="sk-radio"><span class="sk-radio-t"><b>' + esc(title) + '</b>' +
      (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' +
      '<input type="radio" name="' + esc(name) + '" value="' + esc(value) + '" data-opt="' + esc(name) + '"' + (checked ? ' checked' : '') + '><i aria-hidden="true"></i></label>' +
      (extra || '') + '</div>';
  }
  // scopeRow: one row of the custom scope editor (sk-scope). kind 'sec' (a section) or 'step'; state
  // 'on' | 'mixed' | 'off' drives the tri-state box. Clicks route as data-act scopeSec / scopeStep.
  function scopeRow(kind, id, state, body) {
    var aria = state === 'mixed' ? 'mixed' : state === 'on' ? 'true' : 'false';
    return '<button type="button" role="checkbox" aria-checked="' + aria + '" class="sk-scope-row" data-kind="' + kind + '" data-act="' +
      (kind === 'sec' ? 'scopeSec' : 'scopeStep') + '" data-id="' + esc(id) + '">' +
      '<span class="sk-scope-mark" data-s="' + state + '" aria-hidden="true"></span>' + body + '</button>';
  }


  SP.ui = { carousel: carousel, carouselBind: carouselBind, carouselMove: carouselMove, esc: esc, marked: marked, icon: icon, iconBtn: iconBtn, mastery: mastery, setRow: setRow, practice: practice, art: art, flip: flip, session: session, tabbar: tabbar, toggle: toggle, tags: tags, tagIntent: tagIntent, tagsFocus: tagsFocus, segbar: segbar, picker: picker, sceneTone: sceneTone, radio: radio, scopeRow: scopeRow };
})(window.SP);
