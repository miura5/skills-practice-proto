// store: the only file that knows where data lives (D-08).
// Account (claude.ai db capability, private to the viewer under data/users/<id>/) when the page
// is granted it; this browser's localStorage otherwise. Everything is cached in memory, so
// screens read synchronously and writes go out in the background.
// One private collection, data/users/<your id>, one document per record, each {value, u}:
//   sets~<id>      a set you made, or your edited copy of a built-in set
//   progress~<id>  Weak / Familiar / Learned per item of that set
//   settings~<id>  that set's Options
//   rounds~<id>    the round you left part-way (not progress; a cleared round is a tombstone {cleared:true})
//   meta           {last, theme}
// Sync (D-28): every record value carries u (time saved). Incoming copies merge into the cache with
// core/sync (newest wins; progress per item). Account mode listens to the collection while the page is
// open and re-reads it on focus or when the tab comes back; browser mode re-reads localStorage the same way.
(function (SP) {
  'use strict';
  var C = SP.core;
  var cache = { sets: {}, progress: {}, settings: {}, rounds: {}, meta: {} };
  var received = {};   // 'name~id' (or 'meta') -> the last copy the server sent for it
  var backend = { name: 'browser', write: null, remove: null, refresh: null };
  var listeners = [];
  var LS = 'sp:v1';
  var col = null;      // the account collection, once open

  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } }); }
  function keyOf(name, id) { return name === 'meta' ? 'meta' : name + '~' + id; }
  function docsOf(snap) { return snap && snap.docs ? snap.docs : (Array.isArray(snap) ? snap : []); }

  // Merge one incoming copy into the cache. Returns true when the cache changed.
  function take(name, id, remote) {
    if (remote == null || (name !== 'meta' && !cache[name])) return false;
    received[keyOf(name, id)] = remote;
    var cur = name === 'meta' ? cache.meta : cache[name][id];
    var next = C.sync.merge(name, cur, remote);
    if (next == null) return false;
    var changed = JSON.stringify(cur === undefined ? null : cur) !== JSON.stringify(next);
    if (name === 'meta') cache.meta = next; else cache[name][id] = next;
    return changed;
  }

  // Merge a batch of account docs (or a snapshot) into the cache; emit only if something changed.
  function applyDocs(docs) {
    var changed = false;
    (docs || []).forEach(function (d) {
      try {
        var v = (d.data && d.data()) || {};
        if (v.value == null) return;
        if (d.id === 'meta') { changed = take('meta', null, v.value) || changed; return; }
        var p = d.id.split('~');
        changed = take(p[0], p.slice(1).join('~'), v.value) || changed;
      } catch (e) { /* one bad doc does not stop the rest */ }
    });
    if (changed) emit();
  }

  // ---------- backends ----------
  function readLocal() {
    try {
      var raw = localStorage.getItem(LS);
      if (!raw) return;
      var saved = JSON.parse(raw), changed = false;
      ['sets', 'progress', 'settings', 'rounds'].forEach(function (name) {
        Object.keys(saved[name] || {}).forEach(function (id) { changed = take(name, id, saved[name][id]) || changed; });
      });
      if (saved.meta) changed = take('meta', null, saved.meta) || changed;
      if (changed) emit();
    } catch (e) { /* private window or bad data */ }
  }

  function local() {
    var save = function () { try { localStorage.setItem(LS, JSON.stringify(cache)); } catch (e) { /* full or blocked */ } };
    backend = { name: 'browser', write: save, remove: save, refresh: readLocal };
    readLocal();
  }

  async function account() {
    if (!window.claude || !window.claude.use) return false;
    var db = await window.claude.use('db');
    var user = await window.claude.use('user');
    var uid = user && (await user.id());
    if (!db || !uid) return false;
    // Your private collection holds every document; the id says what it is: sets~<id>, progress~<id>, settings~<id>, meta.
    col = db.collection('data/users/' + uid);
    applyDocs(docsOf(await col.get()));
    backend = {
      name: 'account',
      write: function (name, id, value) {
        return col.doc(keyOf(name, id)).set({ value: JSON.parse(JSON.stringify(value)), u: Date.now() })
          .catch(function (e) { console.warn('save failed', e); SP.store.lastError = e; emit(); });
      },
      remove: function (name, id) { return col.doc(keyOf(name, id)).delete().catch(function (e) { console.warn(e); }); },
      refresh: function () { return col.get().then(function (snap) { applyDocs(docsOf(snap)); }).catch(function () { /* offline: keep the cache */ }); }
    };
    listen();
    return true;
  }

  // Live updates: subscribe once. If the subscription is not available or fails, re-read every 30 s instead
  // (focus and visibility re-reads still happen either way).
  function listen() {
    var live = false;
    try {
      if (typeof col.onSnapshot !== 'function') throw new Error('onSnapshot not available');
      var p = col.onSnapshot(function (snap) { applyDocs(docsOf(snap)); });
      if (p && p.catch) p.catch(function (e) { console.warn('live updates off', e); });
      live = true;
    } catch (e) { console.warn('live updates off, re-reading instead', e); }
    if (!live) setInterval(function () { if (document.visibilityState !== 'hidden') refresh(); }, 30000);
  }

  function refresh() { if (backend.refresh) return backend.refresh(); }

  async function init() {
    var ok = false;
    try { ok = await account(); } catch (e) { console.warn('account storage unavailable', e); }
    if (!ok) local();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', refresh);
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') refresh(); });
    }
    emit();
  }

  // Every write is stamped (value.u) and goes out in the background. Progress merges with the copy the server
  // last sent, so a stale device never drops newer per-item progress.
  function put(name, id, value) {
    var key = keyOf(name, id);
    if (name === 'progress') value = C.sync.merge(name, value, received[key]);
    else value = Object.assign({}, value, { u: Date.now() });
    if (name === 'meta') cache.meta = value; else cache[name][id] = value;
    backend.write && backend.write(name, id, value);
    emit();
  }
  function drop(name, id) {
    delete cache[name][id];
    delete received[keyOf(name, id)];
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
    delete clean.builtin; delete clean.edited; delete clean.u;
    var errs = C.sets.validate(clean);
    if (errs.length) return errs;
    put('sets', clean.id, clean);
    return [];
  }
  // A built-in set goes back to its shipped content; a set you made is removed.
  function removeSet(id) { drop('sets', id); if (!isBuiltin(id)) { drop('progress', id); drop('settings', id); } clearRound(id); }
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
  function round(id) { var r = cache.rounds[id]; return r && !r.cleared ? r : null; }
  function saveRound(id, r) { put('rounds', id, r); }
  // A tombstone, not a delete: an old copy of the round arriving later cannot bring it back.
  function clearRound(id) { var r = cache.rounds[id]; if (r && !r.cleared) put('rounds', id, { cleared: true }); }
  function meta() { return cache.meta || {}; }
  function saveMeta(patch) { put('meta', null, Object.assign({}, cache.meta, patch)); }

  SP.store = {
    ready: null, init: init, backend: function () { return backend.name; }, refresh: refresh,
    onChange: function (fn) { listeners.push(fn); },
    all: all, get: get, saveSet: saveSet, removeSet: removeSet, newId: newId, isBuiltin: isBuiltin,
    progress: progress, saveProgress: saveProgress, settings: settings, saveSettings: saveSettings,
    round: round, saveRound: saveRound, clearRound: clearRound,
    meta: meta, saveMeta: saveMeta
  };
})(window.SP);
