// core/sync: how two copies of one saved record combine (D-28). Pure: no DOM, no storage.
//   progress (a map of item id -> record): merged per item; the record with the larger `last` wins
//           (missing last = 0). Items on one side only are kept.
//   anything else (a set, settings, a round, meta): the copy with the larger `u` (time saved) wins
//           (missing u = 0). A tie goes to remote.
//   A null side gives the other side. A round tombstone ({cleared:true, u}) merges like any record.
(function (SP) {
  'use strict';

  function newer(local, remote, field) {
    var a = local && typeof local[field] === 'number' ? local[field] : 0;
    var b = remote && typeof remote[field] === 'number' ? remote[field] : 0;
    return b >= a ? remote : local;
  }

  function mergeProgress(local, remote) {
    var out = {}, a = local || {}, b = remote || {};
    Object.keys(Object.assign({}, a, b)).forEach(function (id) {
      if (a[id] == null) out[id] = b[id];
      else if (b[id] == null) out[id] = a[id];
      else out[id] = newer(a[id], b[id], 'last');
    });
    return out;
  }

  // merge(name, local, remote) for one record value. Returns the combined value (null if both are null).
  function merge(name, local, remote) {
    if (remote == null) return local == null ? null : local;
    if (local == null) return remote;
    if (name === 'progress') return mergeProgress(local, remote);
    return newer(local, remote, 'u');
  }

  SP.core.sync = { merge: merge, mergeProgress: mergeProgress, newer: newer };
})((typeof window !== 'undefined' ? window : globalThis).SP);
