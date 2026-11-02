// core/keys: an item's [bracketed] key groups, scored part by part (D-10). Pure, no DOM.
// "[name, DOB, MRN]" is three parts; "[check or calculate]" and "[a / b]" accept either side.
// Wording that counts: stems, a one-letter slip on long words (text.near), and synonyms
// (generic ones below + the set's own list + per-step "loose" wording in set.grading).
(function (SP) {
  'use strict';
  var T = SP.core.text;

  // Generic wording carried over from the old prototype's engine (not step content).
  var BASE = {
    'hand hygiene': ['hh', 'sanitize', 'sanitise', 'sanitizer', 'sanitiser', 'wash hands', 'handwash', 'hand wash', 'hand washing', 'handwashing', 'hand hygeine', 'hand hygene', 'clean hands', 'foam in', 'foam out', 'gel in', 'gel out'],
    'identify patient': ['id', 'ids', 'identifiers', 'identifier', '2 identifiers', 'two identifiers', 'name and dob', 'name and date of birth', 'name dob', 'patient id', 'check id', 'wristband', 'armband', 'id band'],
    'patient': ['pt', 'pts', 'client'],
    '1st': ['first'], '2nd': ['second'], '3rd': ['third'],
    'degrees': ['degree', 'deg'],
    'remove gloves': ['take off gloves', 'take gloves off', 'gloves off', 'doff gloves', 'doff', 'remove glove'],
    'gloves': ['put on gloves', 'put gloves on', 'gloves on', 'glove up', 'don gloves', 'don clean gloves', 'clean gloves', 'glove'],
    'accuracy': ['accurate', 'correct', 'correctness', 'right'], 'completeness': ['complete', 'completion', 'full', 'whole'],
    'dob': ['birth date', 'birthdate', 'date of birth', 'birthday'], 'dose': ['dosage', 'doses', 'amount', 'volume', 'ml', 'draw up', 'drawn up'],
    'mrn': ['medical record number', 'record number', 'medical record'], 'time': ['times', 'timing', 'frequency'],
    'allergies': ['allergy', 'allergic'], 'name': ['names', 'full name']
  };

  function seq(s) { return T.tokens(s).join(' '); }

  // A lexicon turns text into tokens plus the canonical forms of any synonyms in it.
  // Multi-word canons become one token joined by "_" ("hand_hygiene").
  function lexicon(synonyms) {
    var rules = [], canons = {};
    [BASE, synonyms || {}].forEach(function (map) {
      Object.keys(map).forEach(function (c) {
        var ct = seq(c); if (!ct) return;
        var tok = ct.replace(/ /g, '_'); canons[tok] = 1;
        (map[c] || []).forEach(function (v) { var vt = seq(v); if (vt && vt !== ct) rules.push([vt, tok]); });
        if (ct.indexOf(' ') >= 0) rules.push([ct, tok]);
      });
    });
    rules.sort(function (a, b) { return b[0].length - a[0].length; });
    // raw: the plain tokens; all: raw plus every canonical token a synonym points to.
    function read(text) {
      var raw = T.tokens(text), s = ' ' + raw.join(' ') + ' ', add = [];
      rules.forEach(function (r) {
        var p = ' ' + r[0] + ' ';
        if (s.indexOf(p) >= 0) { add.push(r[1]); s = s.split(p).join(' ' + r[1] + ' '); }
      });
      var canon = s.trim().split(' ').filter(Boolean);
      return { raw: raw, canon: canon, all: uniq(raw.concat(add, canon)) };
    }
    return { read: read, isCanon: function (t) { return !!canons[t]; } };
  }
  function uniq(a) { var seen = {}; return a.filter(function (x) { return x && !seen[x] && (seen[x] = 1); }); }

  function splitParts(phrase) {
    return phrase.split(/\s*(?:,|;|&|\band\b)\s*/i).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function splitEither(part) {
    return part.split(/\s*\/\s*|\s+or\s+/i).map(function (x) { return x.trim(); }).filter(Boolean);
  }

  // The key groups of one item, with the set's per-step rules applied:
  //   grading.loose[id][group] = null (not asked) | [extra wording that satisfies the whole group]
  //   grading.require[id][label] = [any of these phrases]
  function groups(item, grading) {
    var g = grading || {}, loose = (g.loose || {})[item.id] || {}, req = (g.require || {})[item.id] || {};
    var out = [];
    (item.keys || []).forEach(function (k) {
      var lo = Object.prototype.hasOwnProperty.call(loose, k) ? loose[k] : undefined;
      if (lo === null) return;
      out.push({ text: k, parts: splitParts(k).map(function (p) { return { text: p, alts: splitEither(p) }; }), loose: lo || null });
    });
    Object.keys(req).forEach(function (label) {
      out.push({ text: label, required: true, parts: [{ text: label, alts: req[label] || [] }], loose: null });
    });
    return out;
  }

  function hasTok(t, said) { return said.some(function (x) { return T.near(t, x); }); }

  // One wording of a part is said when all its words are said, or (for a phrase) when a
  // synonym's canonical word covering at least half the phrase was said ("pulse ox" -> "SpO2 probe").
  function altSaid(alt, said, lex) {
    var r = lex.read(alt);
    if (!r.raw.length) return false;
    if (r.raw.every(function (t) { return hasTok(t, said); })) return true;
    if (r.canon.every(function (t) { return hasTok(t, said); })) return true;
    // D-32 relaxed: a phrase of 2+ words counts when at least half its words (or their synonyms) were said
    // ("below fluid level" <- "below fluid"; "correct volume" <- "dosage").
    if (r.raw.length > 1) {
      var n = Math.max(r.raw.filter(function (t) { return hasTok(t, said); }).length,
        r.canon.reduce(function (k, t) { return k + (hasTok(t, said) ? t.split('_').length : 0); }, 0));
      if (n * 2 >= r.raw.length) return true;
    }
    if (r.raw.length > 1) {
      var hit = r.canon.filter(function (t) { return lex.isCanon(t) && said.indexOf(t) >= 0; });
      var covered = hit.reduce(function (n, t) { return n + t.split('_').length; }, 0);
      if (hit.length && covered * 2 >= r.raw.length) return true;
    }
    return false;
  }

  // Scores an answer: every part of every group, flat. Returns parts with have true/false.
  function score(gs, answer, lex) {
    var said = lex.read(answer).all, parts = [];
    gs.forEach(function (g, gi) {
      var whole = g.loose && g.loose.some(function (a) { return altSaid(a, said, lex); });
      g.parts.forEach(function (p) {
        parts.push({ group: gi, text: p.text, label: g.required ? g.text : p.text,
          have: !!whole || p.alts.some(function (a) { return altSaid(a, said, lex); }) });
      });
    });
    var found = parts.filter(function (p) { return p.have; }), missing = parts.filter(function (p) { return !p.have; });
    return { parts: parts, found: found.map(function (p) { return p.label; }), missing: missing.map(function (p) { return p.label; }),
      share: parts.length ? found.length / parts.length : 1 };
  }

  SP.core.keys = { lexicon: lexicon, groups: groups, score: score, altSaid: altSaid, splitParts: splitParts, splitEither: splitEither, BASE: BASE };
})((typeof window !== 'undefined' ? window : globalThis).SP);
