// Run: node tests/core.test.js  (no dependencies). Every grading bug gets a line here (D-05).
global.SP = { core: {}, content: { list: [], add(s) { this.list.push(s); } } };
['text', 'sets', 'keys', 'grade', 'progress', 'chunks', 'scope', 'rounds'].forEach((f) => require('../src/core/' + f + '.js'));
['procedures/med-admin', 'procedures/ngt', 'cards/pharm-antibiotics', 'cards/lab-values'].forEach((f) => require('../content/' + f + '.js'));
const { sets, grade, progress, rounds, chunks } = SP.core;
let pass = 0, fail = 0;
const ok = (name, cond) => { cond ? pass++ : (fail++, console.log('FAIL', name)); };
const set = (id) => SP.content.list.find((s) => s.id === id);
const item = (id, n) => sets.items(set(id)).find((i) => i.id === n);

// content is valid
SP.content.list.forEach((s) => ok('valid ' + s.id, sets.validate(s).length === 0));
ok('med admin has 94 steps', sets.items(set('med-admin')).length === 94);
ok('ngt has 60 steps', sets.items(set('ngt')).length === 60);

// grading
const vanc = item('pharm-antibiotics', 'c2');
ok('cards: both keys = right', grade(vanc, 'check trough, infuse slowly').result === 'right');
ok('cards: one key = shaky', grade(vanc, 'check the trough').result === 'shaky');
ok('cards: nothing = missed', grade(vanc, 'give with food').result === 'missed');
ok('cards: empty = missed', grade(vanc, '   ').result === 'missed');
ok('numbers: potassium', grade(item('lab-values', 'c1'), '3.5 to 5').result === 'right');
const ngt = set('ngt');
const i8 = item('ngt', 'I8');
ok('ngt synonym: pulse ox for SpO2', grade(i8, 'put the pulse ox on', ngt.synonyms).result === 'right');

// progress ladder
let r = progress.apply(null, 'right', 'type');
ok('one clean type = familiar', r.state === 'familiar');
r = progress.apply(r, 'right', 'type');
ok('two clean types = learned', r.state === 'learned');
ok('next step caps at familiar', progress.apply(progress.apply(null, 'right', 'next'), 'right', 'next').state === 'familiar');
ok('missed = weak', progress.apply(r, 'missed', 'type').state === 'weak');

// rounds
const med = sets.items(set('med-admin'));
ok('starred only', rounds.build(med, { starred: true }).every((i) => i.star));
ok('section filter', rounds.build(med, { section: 'mar' }).length === 1);

// grading v2 (D-10)
const T = SP.core.text, medSet = set('med-admin'), m = (n) => item('med-admin', n);
ok('text: full stop dropped', T.tokens('mrn.').join() === 'mrn');
ok('text: decimal stays whole', T.tokens('3.5 mEq.').join() === '3.5,meq');
ok('text: stems meet', T.stem('allergies') === T.stem('allergy') && T.stem('cleansing') === T.stem('cleansed'));
ok('text: one-letter typo on 6+ letters', T.near('medication', 'medicaton') && !T.near('route', 'rote') && !T.near('45', '46'));
const K = SP.core.keys, lex = K.lexicon({});
ok('keys: [name, DOB, MRN] scored part by part', Math.abs(K.score(K.groups({ id: 'x', keys: ['name, DOB, MRN'] }), 'name and mrn', lex).share - 2 / 3) < 1e-9);
ok('keys: a / b either-or', K.score(K.groups({ id: 'x', keys: ['gauze / swab'] }), 'use a swab', lex).share === 1);
const A = 'verify completeness and accuracy of the mar. includes patient name dob and mrn. includes drug name dose route and time. includes allergies';
ok("step 1: Matt's answer = right", grade(m('1'), A, medSet).result === 'right');
const noDob = grade(m('1'), A.replace(' dob', ''), medSet);
ok('step 1 without dob = open with a DOB blank', noDob.result === 'open' && noDob.missing.join() === 'DOB');
ok('step 1 blank filled = right', grade(m('1'), A.replace(' dob', ''), medSet, { fill: ['date of birth'] }).result === 'right');
ok('step 1 blank missed again = shaky', grade(m('1'), A.replace(' dob', ''), medSet, { fill: ['weight'] }).result === 'shaky');
ok('little said = missed', grade(m('1'), 'verify the mar', medSet).result === 'missed');
const h2 = grade(m('2'), 'medication, expected outcomes', medSet, { hinted: true });
ok('step 2 from hint key words = right, hinted', h2.result === 'right' && h2.hinted);
ok('hinted right caps at familiar', progress.apply(progress.apply(null, h2.result, 'hint'), 'right', 'hint').state === 'familiar');
ok('check the dose lands on 13c', grade(m('13c'), 'check the dose', medSet).result === 'right');
const n13 = grade(m('13d'), 'check the dose', medSet);
ok('check the dose on 13d = missed (strict order, D-19)', n13.result === 'missed' && !('nearby' in n13));
ok('25n: safety device accepted (loose)', grade(m('25n'), 'deploy the safety device and put it in the sharps', medSet).result === 'right');
ok('26l: safety cap accepted (loose)', grade(m('26l'), 'deploy safety cap, sharps container', medSet).result === 'right');
const w = grade(m('26d'), 'wipe site with alcohol', medSet);
ok('wipe site with alcohol on 26d = missed (strict order, D-19)', w.result === 'missed' && !('nearby' in w));
ok('wipe site with alcohol on 26e = not missed', grade(m('26e'), 'wipe site with alcohol', medSet).result !== 'missed');
ok('loose: step 9 wording', grade(m('9'), 'one patient at a time, no distractions', medSet).result === 'right');
ok('require: 23 needs gloves', grade(m('23'), 'hand hygiene', medSet).missing.indexOf('clean gloves') >= 0);
ok('synonym counts carried', Object.keys(medSet.synonyms).length === 20 && Object.keys(ngt.synonyms).length === 12);
ok('loose allowances carried', Object.keys(medSet.grading.loose).length === 9);

// saved rounds (T-03)
const ngtItems = sets.items(set('ngt'));
const live = { mode: 'type', ids: ngtItems.slice(0, 5).map((i) => i.id), i: 2, res: [{ id: ngtItems[0].id, result: 'right' }, { id: ngtItems[1].id, result: 'missed' }], notes: {}, before: {}, t0: 5, flip: true, hint: true, open: { typed: 'x' } };
const snap = rounds.snapshot(live);
ok('round snapshot drops on-screen state', !('flip' in snap) && !('open' in snap) && !('hint' in snap) && snap.i === 2 && snap.ids.length === 5);
const back = rounds.restore(snap, ngtItems);
ok('round restores at the same item', back.i === 2 && back.ids.length === 5 && back.res.length === 2 && back.flip === false);
const cut = rounds.restore(snap, ngtItems.filter((i) => i.id !== live.ids[0] && i.id !== live.ids[3]));
ok('round restore drops removed items and clamps i', cut.i === 1 && cut.ids.length === 3 && cut.res.length === 1);
ok('round restore: nothing left = null', rounds.restore(snap, ngtItems.filter((i) => live.ids.slice(2).indexOf(i.id) < 0)) === null && rounds.restore(null, ngtItems) === null);

// one round per set, any mode (T-08)
const cont = rounds.pick(snap, ngtItems, 'next');
ok('pick: another mode continues the same round', cont.mode === 'next' && cont.i === 2 && cont.ids.join() === snap.ids.join() && cont.res.length === 2);
ok('pick: no saved round = fresh (null)', rounds.pick(null, ngtItems, 'type') === null);
ok('modeOf: one mode / mixed', rounds.modeOf({ mode: 'type', res: [{ mode: 'type' }] }) === 'type' && rounds.modeOf({ mode: 'next', res: [{ mode: 'type' }, { mode: 'next' }] }) === 'mixed' && rounds.modeOf({ mode: 'next', res: [] }) === 'next');
// chunks (D-19)
const C = chunks;
const cardSet = (n) => ({ id: 'cs', kind: 'cards', title: 'x', cards: Array.from({ length: n }, (_, i) => ({ id: 'c' + (i + 1), front: 'f', back: 'b' })) });
const sizes = (cs) => cs.map((c) => c.ids.length).join();
ok('chunks: 3 cards = one chunk of 3', sizes(C.list(cardSet(3))) === '3');
ok('chunks: 10 cards = one chunk of 10', sizes(C.list(cardSet(10))) === '10');
ok('chunks: 11 cards = 7 + 4', sizes(C.list(cardSet(11))) === '7,4');
ok('chunks: 14 cards = 7 + 7', sizes(C.list(cardSet(14))) === '7,7');
ok('chunks: 15 cards = 7 + 8', sizes(C.list(cardSet(15))) === '7,8');
const c11 = C.list(cardSet(11));
ok('chunks: card ids and labels', c11.map((c) => c.id).join() === 'k1,k2' && c11[0].label === 'Cards 1–7' && c11[1].label === 'Cards 8–11' && c11[1].ids[0] === 'c8' && c11[0].sections.length === 0);
ok('chunks: constants', C.MAX === 12 && C.CARD_SIZE === 7);
const steps = (sec, n) => Array.from({ length: n }, (_, i) => ({ id: sec + (i + 1), text: 'do ' + sec + ' ' + (i + 1) }));
const sec = (id, n, scene) => ({ id, title: 'T ' + id, steps: steps(id, n), scene });
const proc = { id: 'pr', kind: 'procedure', title: 'P', scenes: [{ id: 'room', label: 'Med room' }, { id: 'bed', label: 'Bedside' }],
  sections: [sec('a', 2), sec('b', 3, 'room'), sec('c', 2, 'bed'), sec('d', 2, 'room'), sec('e', 0, 'bed'), sec('f', 2, 'ghost'), sec('g', 1)] };
const pc = C.list(proc);
ok('chunks: procedure chunk order', pc.map((c) => c.id).join() === 'sec:a,scene:room,scene:bed,sec:f,sec:g');
ok('chunks: scene spans non-adjacent sections in set order', pc[1].sections.join() === 'b,d' && pc[1].ids.join() === 'b1,b2,b3,d1,d2' && pc[1].label === 'Med room');
ok('chunks: untagged section is its own chunk, labelled by title', pc[0].label === 'T a' && pc[0].ids.join() === 'a1,a2' && pc[0].sections.join() === 'a');
ok('chunks: unknown scene id = untagged', pc[3].id === 'sec:f' && pc[3].label === 'T f');
ok('chunks: empty section makes no chunk', pc[2].sections.join() === 'c' && pc.every((c) => c.ids.length > 0));
ok('chunks: ids together = all items', pc.reduce((a, c) => a.concat(c.ids), []).sort().join() === sets.items(proc).map((i) => i.id).sort().join());
const big = { id: 'bg', kind: 'procedure', title: 'B', scenes: [{ id: 's', label: 'Prep' }, { id: 'h', label: 'Huge' }],
  sections: [sec('a', 5, 's'), sec('b', 5, 's'), sec('c', 4, 's'), sec('d', 9, 's'), sec('e', 15, 'h'), sec('f', 13)] };
const bc = C.list(big);
ok('chunks: scene over 12 splits at section boundaries', bc.slice(0, 3).map((c) => c.id + '=' + c.sections.join('')).join() === 'scene:s:1=ab,scene:s:2=c,scene:s:3=d' && bc[0].label === 'Prep 1' && bc[2].label === 'Prep 3');
ok('chunks: single big section not split', bc[3].id === 'scene:h' && bc[3].label === 'Huge' && bc[3].ids.length === 15 && bc[4].id === 'sec:f' && bc[4].ids.length === 13);
const pm = { b1: { state: 'familiar' }, b2: { state: 'learned' }, b3: { state: 'weak' }, d1: { state: 'new' } };
const seg = C.segments(pc, pm);
ok('chunks: segments count Familiar or better', seg[1].total === 5 && seg[1].ready === 2 && seg[0].ready === 0 && seg[1].label === 'Med room' && seg.length === 5);
ok('chunks: isLearned', !C.isLearned(pc[1], pm) && C.isLearned(pc[0], { a1: { state: 'familiar' }, a2: { state: 'learned' } }));
let sm = C.smart(proc, {});
ok('smart: first chunk = learn', sm.stage === 'learn' && sm.index === 0 && sm.chunk.id === 'sec:a' && sm.ids.join() === 'a1,a2' && sm.link.length === 0 && sm.label === 'T a' && sm.next === 'Med room');
const fam = (list) => list.reduce((m, id) => (m[id] = { state: 'familiar' }, m), {});
sm = C.smart(proc, fam(['a1', 'a2', 'c1', 'c2']));
ok('smart: link = last 3 of previous chunk + current', sm.stage === 'link' && sm.index === 1 && sm.link.join() === 'a1,a2' && sm.ids.join() === 'a1,a2,b1,b2,b3,d1,d2' && sm.label === 'Med room' && sm.next === 'T f');
sm = C.smart(proc, fam(['a1', 'a2', 'b1', 'b2', 'b3', 'd1', 'd2']));
ok('smart: link takes only the last 3', sm.chunk.id === 'scene:bed' && sm.link.join() === 'b3,d1,d2' && sm.ids.join() === 'b3,d1,d2,c1,c2');
sm = C.smart(proc, fam(['a1', 'a2', 'b1', 'b2', 'b3', 'd1', 'd2', 'c1', 'c2', 'f1', 'f2']));
ok('smart: last chunk next = Whole set', sm.chunk.id === 'sec:g' && sm.next === 'Whole set');
sm = C.smart(proc, fam(sets.items(proc).map((i) => i.id)));
ok('smart: all learned = run, whole set in set order', sm.stage === 'run' && sm.chunk === null && sm.index === -1 && sm.link.length === 0 && sm.label === 'Whole set' && sm.next === null && sm.ids.join() === sets.items(proc).map((i) => i.id).join());
sm = C.smart(cardSet(14), fam(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']));
ok('smart: cards never link', sm.stage === 'learn' && sm.index === 1 && sm.link.length === 0 && sm.ids.join() === 'c8,c9,c10,c11,c12,c13,c14' && sm.next === 'Whole set');
ok('smart: one chunk still learns first', C.smart(cardSet(3), {}).stage === 'learn');
const empty = C.smart({ id: 'em', kind: 'procedure', title: 'E', sections: [] }, {});
ok('smart: empty set = run with no ids', empty.stage === 'run' && empty.ids.length === 0 && empty.chunk === null && empty.next === null && empty.label === 'Whole set');
ok('chunks: empty sets = []', C.list({ id: 'em', kind: 'cards', title: 'E', cards: [] }).length === 0 && C.list({ id: 'em', kind: 'procedure', title: 'E', sections: [sec('a', 0)] }).length === 0);
ok('of: finds the chunk, null when missing', C.of(proc, 'd2').id === 'scene:room' && C.of(proc, 'g1').id === 'sec:g' && C.of(proc, 'zz') === null);
['med-admin', 'ngt'].forEach((id) => {
  const s = set(id), cs = C.list(s), secs = s.sections.filter((x) => (x.steps || []).length);
  ok('real ' + id + ': every section in one scene chunk, in set order (T-15 seeds)', cs.every((c) => c.id.indexOf('scene:') === 0) && cs.reduce((a, c) => a.concat(c.sections), []).join() === secs.map((x) => x.id).join());
  ok('real ' + id + ': chunk ids = all items', cs.reduce((a, c) => a.concat(c.ids), []).join() === sets.items(s).map((i) => i.id).join());
});

// ---- T-15 tests (Lane A: scenes data) ----
const t15proc = (scenes, secScenes) => ({ id: 't15', kind: 'procedure', title: 'T', scenes,
  sections: secScenes.map((sc, i) => ({ id: 's' + i, title: 'S' + i, scene: sc, steps: [{ id: 'x' + i, num: '1', text: 'do [it]' }] })) });
const t15errs = (p) => sets.validate(p).join(' | ');
ok('t15 validate: good scenes pass', sets.validate(t15proc([{ id: 'a', label: 'A' }, { id: 'b-2', label: 'B' }], ['a', '', undefined, 'b-2'])).length === 0);
ok('t15 validate: duplicate scene id', /duplicate scene a/.test(t15errs(t15proc([{ id: 'a', label: 'A' }, { id: 'a', label: 'B' }], []))));
ok('t15 validate: empty label', /has no name/.test(t15errs(t15proc([{ id: 'a', label: '  ' }], []))));
ok('t15 validate: bad scene id', /scene id must be/.test(t15errs(t15proc([{ id: 'Med Room', label: 'Med room' }], []))) && /scene id must be/.test(t15errs(t15proc([{ label: 'X' }], []))));
ok('t15 validate: unknown section scene', /unknown scene zz/.test(t15errs(t15proc([{ id: 'a', label: 'A' }], ['zz']))));
ok('t15 validate: section scene with no scenes list', /unknown scene a/.test(t15errs(t15proc(undefined, ['a']))));
ok('t15 validate: scenes must be a list', /scenes must be a list/.test(t15errs(t15proc({ a: 'A' }, []))));
ok('t15 tagId: slug of the label', sets.tagId('Med room', []) === 'med-room' && sets.tagId('Removal: set up') === 'removal-set-up');
ok('t15 tagId: unique against taken', sets.tagId('Med room', ['med-room']) === 'med-room-2' && sets.tagId('Med room', ['med-room', 'med-room-2']) === 'med-room-3');
ok('t15 tagId: valid scene id', /^[a-z0-9-]{1,60}$/.test(sets.tagId('Ünïcode & 2 things!', [])));
ok('t15 items carry scene', item('med-admin', '1').scene === 'review' && sets.items(set('ngt')).every((i) => i.scene) && sets.items(t15proc([{ id: 'a', label: 'A' }], ['', 'a']))[0].scene === null && sets.items(t15proc([{ id: 'a', label: 'A' }], ['', 'a']))[1].scene === 'a');
ok('t15 seeded med-admin chunks', chunks.list(set('med-admin')).map((c) => c.label).join('|') === 'Review and assess|Med room 1|Med room 2|Med room 3|Walking in|Giving the meds 1|Giving the meds 2|Giving the meds 3|Walking out');
ok('t15 seeded ngt chunks', chunks.list(set('ngt')).map((c) => c.label).join('|') === 'Assess|Plan|Set up|Pass the tube|Secure and finish|Evaluate and document|Removal: assess and plan|Removal: set up|Removal: take it out');
ok('t15 seeded: every section has a scene', ['med-admin', 'ngt'].every((id) => set(id).sections.every((x) => x.scene)));
// ---- T-17 tests (Lane C: strict grading) ----
const g13 = grade(m('13d'), m('13c').answer, medSet), g26 = grade(m('26d'), m('26e').answer, medSet);
ok("strict: 13c's exact text on 13d = missed, no nearby field", g13.result === 'missed' && !('nearby' in g13));
ok("strict: 26e's exact text on 26d = missed, no nearby field", g26.result === 'missed' && !('nearby' in g26));
ok('strict: no step ever grades nearby (neighbour text, both sets)', ['med-admin', 'ngt'].every((id) => {
  const s = set(id), its = sets.items(s);
  return its.every((it, i) => [its[i - 1], its[i + 1]].filter(Boolean).every((o) => {
    const g = grade(it, o.answer, s); return g.result !== 'nearby' && !('nearby' in g);
  }));
}));
const t17Out = (g) => [g.result, g.share.toFixed(3), g.found.join('|'), g.missing.join('|')].join(' ');
ok('strict: right unchanged', t17Out(grade(m('26d'), 'inspect skin, masses or tenderness, rotate', medSet)) === 'right 1.000 inspect skin|masses or tenderness|rotate ');
ok('strict: open unchanged', t17Out(grade(m('26d'), 'inspect skin and rotate', medSet)) === 'open 0.667 inspect skin|rotate masses or tenderness');
ok('strict: shaky unchanged', t17Out(grade(m('26e'), 'relax', medSet)) === 'shaky 0.500 relax antiseptic swab');
ok('strict: missed unchanged', t17Out(grade(m('26d'), 'rotate', medSet)) === 'missed 0.333 rotate inspect skin|masses or tenderness');
ok('strict: grading blocks have no order rules', ['med-admin', 'ngt'].every((id) => ['strict', 'before', 'anytime'].every((k) => !(k in (set(id).grading || {})))));
ok('strict: loose + require kept', Object.keys(medSet.grading.loose).length === 9 && Object.keys(medSet.grading.require).length > 0
  && grade(m('26l'), 'deploy safety cap, sharps container', medSet).result === 'right' && grade(m('23'), 'hand hygiene', medSet).missing.indexOf('clean gloves') >= 0);
ok('strict: synonym still counts', grade(i8, 'put the pulse ox on', ngt).result === 'right');
// ---- T-16 tests (Lane B: Smart rounds) ----
const t16Steps = (s, n, star) => Array.from({ length: n }, (_, i) => ({ id: s + (i + 1), text: 'do ' + s + ' ' + (i + 1), star: star === i + 1 }));
const t16Proc = { id: 't16p', kind: 'procedure', title: 'P', scenes: [{ id: 'room', label: 'Med room' }],
  sections: [{ id: 'a', title: 'Prep', steps: t16Steps('a', 2) }, { id: 'b', title: 'Draw up', scene: 'room', steps: t16Steps('b', 3, 2) }, { id: 'c', title: 'Give', steps: t16Steps('c', 2) }] };
const t16Items = sets.items(t16Proc);
const t16Ids = (list) => list.map((i) => i.id).join();
const t16Map = (pairs) => Object.keys(pairs).reduce((m, id) => (m[id] = { state: pairs[id] }, m), {});
const t16A = t16Map({ a1: 'familiar', a2: 'learned' });
ok('t16 DEFAULTS: practice smart, no section', rounds.DEFAULTS.practice === 'smart' && !('section' in rounds.DEFAULTS));
ok('t16 build smart (default) = first chunk', t16Ids(rounds.build(t16Items, {}, {}, t16Proc)) === 'a1,a2');
ok('t16 build smart = link steps + current chunk', t16Ids(rounds.build(t16Items, { practice: 'smart' }, t16A, t16Proc)) === 'a1,a2,b1,b2,b3');
ok('t16 build whole = all items in order', t16Ids(rounds.build(t16Items, { practice: 'whole' }, t16A, t16Proc)) === t16Ids(t16Items));
ok('t16 build section = that section', t16Ids(rounds.build(t16Items, { practice: 'c' }, {}, t16Proc)) === 'c1,c2');
ok('t16 old section option still means that section (now Custom, D-22)', t16Ids(rounds.build(t16Items, { section: 'b' }, {}, t16Proc)) === 'b1,b2,b3' && rounds.practiceOf({ section: 'b', practice: 'smart' }) === 'custom');
ok('t16 old section all = smart', rounds.practiceOf({ section: 'all' }) === 'smart' && t16Ids(rounds.build(t16Items, { section: 'all' }, {}, t16Proc)) === 'a1,a2');
ok('t16 unknown section falls back to smart', rounds.plan(t16Items, { practice: 'gone' }, {}, t16Proc).practice === 'smart' && t16Ids(rounds.build(t16Items, { section: 'gone' }, {}, t16Proc)) === 'a1,a2');
ok('t16 smart + starred only', t16Ids(rounds.build(t16Items, { starred: true }, t16A, t16Proc)) === 'b2');
ok('t16 smart + skip learned drops learned link steps', t16Ids(rounds.build(t16Items, { skipLearned: true }, t16A, t16Proc)) === 'a1,b1,b2,b3');
ok('t16 weak first keeps link steps first', t16Ids(rounds.build(t16Items, { weakFirst: true }, Object.assign({ b3: { state: 'weak' } }, t16A), t16Proc)) === 'a1,a2,b3,b1,b2');
ok('t16 shuffle ignored for procedures', t16Ids(rounds.build(t16Items, { practice: 'whole', shuffle: true }, {}, t16Proc)) === t16Ids(t16Items));
const t16Cards = { id: 't16c', kind: 'cards', title: 'C', cards: Array.from({ length: 14 }, (_, i) => ({ id: 'q' + (i + 1), front: 'f' + i, back: 'b' + i })) };
const t16CItems = sets.items(t16Cards), t16Sh = rounds.build(t16CItems, { shuffle: true }, {}, t16Cards);
ok('t16 cards smart = first 7, shuffle stays inside the chunk', t16Sh.length === 7 && t16Ids(t16Sh.slice().sort((x, y) => x.id.localeCompare(y.id, 'en', { numeric: true }))) === 'q1,q2,q3,q4,q5,q6,q7');
const t16All = t16Map(t16Items.reduce((m, i) => (m[i.id] = 'familiar', m), {}));
ok('t16 run = whole set', t16Ids(rounds.build(t16Items, {}, t16All, t16Proc)) === t16Ids(t16Items));
ok('t16 no set = whole list (legacy call)', rounds.build(t16Items, {}, {}).length === t16Items.length);
let t16P = rounds.plan(t16Items, {}, t16A, t16Proc);
ok('t16 plan: link stage, chunk id and label', t16P.stage === 'link' && t16P.chunk === 'scene:room' && t16P.label === 'Med room' && t16P.link.join() === 'a1,a2');
ok('t16 plan: learn, run, and null when not smart', rounds.plan(t16Items, {}, {}, t16Proc).stage === 'learn' && rounds.plan(t16Items, {}, t16All, t16Proc).stage === 'run' &&
  rounds.plan(t16Items, {}, t16All, t16Proc).chunk === null && rounds.plan(t16Items, { practice: 'whole' }, {}, t16Proc).stage === null);
ok('t16 basis: the plan from a round\'s before-states', t16Ids(rounds.build(t16Items, {}, t16All, t16Proc, rounds.basisOf({ before: { a1: 'familiar', a2: 'familiar' } }))) === 'a1,a2,b1,b2,b3');
const t16Live = { mode: 'next', ids: ['a1', 'a2', 'b1', 'b2', 'b3'], i: 1, res: [{ id: 'a1', result: 'right' }], notes: {}, before: {}, t0: 1, stage: 'link', chunk: 'scene:room', label: 'Med room', nearby: { id: 'x' } };
const t16Snap = rounds.snapshot(t16Live), t16Back = rounds.restore(t16Snap, t16Items);
ok('t16 snapshot/restore keep stage, chunk and label', t16Snap.stage === 'link' && t16Back.stage === 'link' && t16Back.chunk === 'scene:room' && t16Back.label === 'Med room');
ok('t16 pick keeps the plan', rounds.pick(t16Snap, t16Items, 'type').chunk === 'scene:room');
const t16None = rounds.restore(rounds.snapshot(Object.assign({}, t16Live, { stage: null, chunk: null, label: null })), t16Items);
ok('t16 non-smart round restores with stage null', t16None.stage === null && t16None.chunk === null);
const t16Old = rounds.restore({ mode: 'type', ids: ['a1', 'a2'], i: 0, res: [], notes: {}, before: {}, t0: 1, nearby: { id: 'a2' } }, t16Items);
ok('t16 old save (no plan) restores, stage undefined', t16Old && t16Old.i === 0 && !('stage' in t16Old) && !('chunk' in t16Old));
ok('t16 no nearby in restored rounds', !('nearby' in t16Old) && !('nearby' in t16Back) && !('nearby' in t16Snap));
// ---- T-18 tests (Lane A) ----


// ---- T-19..T-21 tests (Lane B) ----
// T-19: a link step names its own chunk (the previous one), a learn step its own.
ok('t19 link step labels with its own chunk', chunks.of(t16Proc, 'a1').label === 'Prep' && chunks.of(t16Proc, 'b1').label === 'Med room');
// T-21: Continue names the next Smart chunk; in Run it is Whole set.
ok('t21 continue label = next chunk, Whole set in Run', chunks.smart(t16Proc, t16A).label === 'Med room' && chunks.smart(t16Proc, t16All).label === 'Whole set');


// ---- T-22..T-23 tests (Lane C) ----
const { scope: S } = SP.core;
const nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '13a', '13b', '13c', '13d'];
for (let n = 14; n <= 32; n++) nums.push(String(n));
const sx = nums.map((num, k) => ({ id: 'x' + num, num, section: k < 7 ? 'a' : k < 13 ? 'b' : 'c', star: num === '9' }));
const sxText = '1, 8–12, 15–32';
const sxPick = ['1', '8', '9', '10', '11', '12', ...Array.from({ length: 18 }, (_, i) => String(15 + i))].map((n) => 'x' + n);
ok('scope parse: en dash ranges and single numbers', S.parse(sxText, sx).join() === sxPick.join());
ok('scope format: runs collapse to en-dash ranges', S.format(sxPick, sx) === sxText);
ok('scope format: a single step is its number', S.format(['x13b'], sx) === '13b' && S.format([], sx) === '');
ok('scope parse: hyphen, spaces and reversed range', S.parse('8-12', sx).join() === 'x8,x9,x10,x11,x12' && S.parse('12 – 8', sx).length === 5);
ok('scope parse: step numbers 13a..13d', S.parse('13a–13c', sx).join() === 'x13a,x13b,x13c' && S.parse('13d', sx).join() === 'x13d');
ok('scope parse: ranges span set order across sections', S.parse('6–9', sx).join() === 'x6,x7,x8,x9' && S.parse('6–9', sx).length === 4);
ok('scope parse: bad input and unknown numbers ignored', S.parse('', sx).length === 0 && S.parse('!!, ,;', sx).length === 0 &&
  S.parse('99, zz, 5–99', sx).length === 0 && S.parse('1, 99, 2', sx).join() === 'x1,x2');
ok('scope parse: unknown range end drops only that range', S.parse('1, 3–99', sx).join() === 'x1');
ok('scope round trip: parse(format(ids)) = ids', S.parse(S.format(sxPick, sx), sx).join() === sxPick.join());
const sxMed = sets.items(set('med-admin')), medNums = sxMed.map((i) => i.num);
ok('scope med admin: nums include 13a..13d', ['13a', '13b', '13c', '13d'].every((n) => medNums.indexOf(n) >= 0));
const medPick = sxMed.filter((i, k) => k === 0 || (k >= 7 && k <= 11) || (k >= 14 && k <= 31)).map((i) => i.id);
ok('scope med admin: round trip on real steps', S.parse(S.format(medPick, sxMed), sxMed).join() === medPick.join());
ok('scope med admin: a bare number takes its lettered steps (15 = 15a..15q)', S.parse('15', sxMed).length === 17 && S.parse('15', sxMed)[0] === sxMed.find((i) => i.num === '15a').id);
ok('scope med admin: 15–32 starts at 15a, ends at 32', S.parse('15–32', sxMed).length === 63 && S.parse('15a-32', sxMed).length === 63);
ok('scope med admin: 1, 8–12, 15–32 = 69 steps, formats as 1, 8–12, 15a–32', S.parse('1, 8–12, 15–32', sxMed).length === 69 && S.format(S.parse('1, 8–12, 15–32', sxMed), sxMed) === '1, 8–12, 15a–32');
ok('scope med admin: 13a–13d = four steps', S.parse('13a–13d', sxMed).map((id) => sxMed.find((i) => i.id === id).num).join() === '13a,13b,13c,13d');
ok('scope custom build: set order, unknown ids dropped', rounds.build(sx, { practice: 'custom', custom: ['x9', 'x3', 'zz'] }).map((i) => i.id).join() === 'x3,x9');
ok('scope custom build: empty = no items', rounds.build(sx, { practice: 'custom', custom: [] }).length === 0 && rounds.build(sx, { practice: 'custom' }).length === 0);
ok('scope custom build: starred still filters', rounds.build(sx, { practice: 'custom', custom: ['x9', 'x3'], starred: true }).map((i) => i.id).join() === 'x9');
ok('scope custom: stage null, practiceOf custom', rounds.practiceOf({ practice: 'custom' }) === 'custom' && rounds.plan(t16Items, { practice: 'custom', custom: ['a1'] }, t16A, t16Proc).stage === null);
ok('scope custom: a custom list beats an old section (practice custom)', S.selected({ practice: 'custom', section: 'b', custom: ['x1'] }, sx).join() === 'x1');
ok('scope old section -> custom with that section step ids', rounds.practiceOf({ section: 'a' }) === 'custom' && S.selected({ section: 'a' }, sx).join() === 'x1,x2,x3,x4,x5,x6,x7');
ok('scope old practice id -> custom; unknown section still falls back to smart', rounds.practiceOf({ practice: 'b' }) === 'custom' && rounds.plan(t16Items, { section: 'gone' }, {}, t16Proc).practice === 'smart');
ok('scope old section as custom: builds that section', rounds.build(sx, { section: 'c' }).map((i) => i.id).join() === ['x13a', 'x13b', 'x13c', 'x13d'].concat(Array.from({ length: 19 }, (_, i) => 'x' + (14 + i))).join());
ok('scope legacy: none for practice whole/smart/custom', S.legacy({ practice: 'whole' }) === null && S.legacy({ practice: 'smart', section: 'all' }) === null && S.legacy({}) === null);


// ---- T-25 tests (Lane B) ----


// ---- T-27..T-28 tests (Lane A) ----


console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
