// Run: node tests/core.test.js  (no dependencies). Every grading bug gets a line here (D-05).
global.SP = { core: {}, content: { list: [], add(s) { this.list.push(s); } } };
['text', 'sets', 'keys', 'grade', 'progress', 'rounds'].forEach((f) => require('../src/core/' + f + '.js'));
['procedures/med-admin', 'procedures/ngt', 'cards/pharm-antibiotics', 'cards/lab-values'].forEach((f) => require('../content/' + f + '.js'));
const { sets, grade, progress, rounds } = SP.core;
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
ok('check the dose on 13d = nearby 13c', n13.result === 'nearby' && n13.nearby.id === '13c');
ok('25n: safety device accepted (loose)', grade(m('25n'), 'deploy the safety device and put it in the sharps', medSet).result === 'right');
ok('26l: safety cap accepted (loose)', grade(m('26l'), 'deploy safety cap, sharps container', medSet).result === 'right');
const w = grade(m('26d'), 'wipe site with alcohol', medSet);
ok('wipe site with alcohol on 26d = nearby 26e', w.result === 'nearby' && w.nearby.id === '26e');
ok('wipe site with alcohol on 26e = not missed', grade(m('26e'), 'wipe site with alcohol', medSet).result !== 'missed');
ok('loose: step 9 wording', grade(m('9'), 'one patient at a time, no distractions', medSet).result === 'right');
ok('require: 23 needs gloves', grade(m('23'), 'hand hygiene', medSet).missing.indexOf('clean gloves') >= 0);
ok('synonym counts carried', Object.keys(medSet.synonyms).length === 20 && Object.keys(ngt.synonyms).length === 12);
ok('loose allowances carried', Object.keys(medSet.grading.loose).length === 9);

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
