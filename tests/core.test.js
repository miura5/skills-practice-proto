// Run: node tests/core.test.js  (no dependencies). Every grading bug gets a line here (D-05).
global.SP = { core: {}, content: { list: [], add(s) { this.list.push(s); } } };
['text', 'sets', 'grade', 'progress', 'rounds'].forEach((f) => require('../src/core/' + f + '.js'));
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

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
