// store: the only file that knows where data lives (D-08).
// Account (claude.ai db capability, private to the viewer under data/users/<id>/) when the page
// is granted it; this browser's localStorage otherwise. Everything is cached in memory, so
// screens read synchronously and writes go out in the background.
// One private collection, data/users/<your id>, one document per record, each {value}:
//   sets~<id>      a set you made, or your edited copy of a built-in set
//   progress~<id>  Weak / Familiar / Learned per item of that set
//   settings~<id>  that set's Options
//   meta           {last, theme}
(function (SP) {
  'use strict';
  var C = SP.core;
  var cache = { sets: {}, progress: {}, settings: {}, meta: {} };
  var backend = { name: 'browser', write: null, remove: null };
  var listeners = [];
  var LS = 'sp:v1';

  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } }); }

  // ---------- backends ----------
  function local() {
    try { var raw = localStorage.getItem(LS); if (raw) cache = Object.assign(cache, JSON.parse(raw)); } catch (e) { /* private window */ }
    var save = function () { try { localStorage.setItem(LS, JSON.stringify(cache)); } catch (e) { /* full or blocked */ } };
    backend = { name: 'browser', write: save, remove: save };
  }

  async function account() {
    if (!window.claude || !window.claude.use) return false;
    var db = await window.claude.use('db');
    var user = await window.claude.use('user');
    var uid = user && (await user.id());
    if (!db || !uid) return false;
    // Your private collection holds every document; the id says what it is: sets~<id>, progress~<id>, settings~<id>, meta.
    var mine = db.collection('data/users/' + uid);
    var snap = await mine.get();
    snap.docs.forEach(function (d) {
      var v = d.data() || {}, p = d.id.split('~');
      if (d.id === 'meta') cache.meta = v.value || {};
      else if (cache[p[0]]) cache[p[0]][p.slice(1).join('~')] = v.value;
    });
    var docId = function (name, id) { return name === 'meta' ? 'meta' : name + '~' + id; };
    backend = {
      name: 'account',
      write: function (name, id) {
        var value = name === 'meta' ? cache.meta : cache[name][id];
        return mine.doc(docId(name, id)).set({ value: JSON.parse(JSON.stringify(value)) })
          .catch(function (e) { console.warn('save failed', e); SP.store.lastError = e; emit(); });
      },
      remove: function (name, id) { return mine.doc(docId(name, id)).delete().catch(function (e) { console.warn(e); }); }
    };
    return true;
  }

  async function init() {
    var ok = false;
    try { ok = await account(); } catch (e) { console.warn('account storage unavailable', e); }
    if (!ok) local();
    emit();
  }

  function put(name, id, value) {
    if (name === 'meta') cache.meta = value; else cache[name][id] = value;
    backend.write && backend.write(name, id);
    emit();
  }
  function drop(name, id) {
    delete cache[name][id];
    backend.remove && backend.remove(name, id);
    emit();
  }

  // ---------- sets ----------
  function builtins() { return SP.content.all(); }
  function isBuiltin(id) { return builtins().some(function (s) { return s.id === id; }); }

  function all() {
    var out = builtins().map(function (s) {
      var mine = cache.sets[s.id];
      return Object.assign({}, mine || s, { builtin: true, edited: !!mine });
    });
    Object.keys(cache.sets).forEach(function (id) {
      if (!isBuiltin(id)) out.push(Object.assign({}, cache.sets[id], { builtin: false, edited: false }));
    });
    return out;
  }
  function get(id) { return all().find(function (s) { return s.id === id; }) || null; }

  function saveSet(set) {
    var clean = JSON.parse(JSON.stringify(set));
    delete clean.builtin; delete clean.edited;
    var errs = C.sets.validate(clean);
    if (errs.length) return errs;
    put('sets', clean.id, clean);
    return [];
  }
  // A built-in set goes back to its shipped content; a set you made is removed.
  function removeSet(id) { drop('sets', id); if (!isBuiltin(id)) { drop('progress', id); drop('settings', id); } }
  function newId(title) {
    var base = C.sets.slug(title), id = base, n = 2;
    while (get(id)) id = base + '-' + n++;
    return id;
  }

  // ---------- progress, settings, meta ----------
  function progress(id) { return cache.progress[id] || {}; }
  function saveProgress(id, map) { put('progress', id, map); }
  function settings(id) { return Object.assign({}, C.rounds.DEFAULTS, cache.settings[id] || {}); }
  function saveSettings(id, opts) { put('settings', id, opts); }
  function meta() { return cache.meta || {}; }
  function saveMeta(patch) { put('meta', null, Object.assign({}, cache.meta, patch)); }

  SP.store = {
    ready: null, init: init, backend: function () { return backend.name; },
    onChange: function (fn) { listeners.push(fn); },
    all: all, get: get, saveSet: saveSet, removeSet: removeSet, newId: newId, isBuiltin: isBuiltin,
    progress: progress, saveProgress: saveProgress, settings: settings, saveSettings: saveSettings,
    meta: meta, saveMeta: saveMeta
  };
})(window.SP);
