import test from 'node:test';
import assert from 'node:assert/strict';
import { cardPacket, releasePackets } from './cards.mjs';
import { hash } from './gate.mjs';

const fixture = () => ({
  lessonId: 'demo', lesson: { title: 'Demo', slides: [{ title: 'First' }, { title: 'Second' }, { title: 'Third' }] },
  assets: { 'diagram.tsx': 'diagram' }, eligibility: ['demo'], rubric: { version: 1 },
  contract: { audience: 'Engineer', prerequisites: ['APIs'], objectives: ['Whole lesson'], questions: [{ id: 'stack-q' }], cards: [
    { id: 'first', slide: 1, objective: 'First goal', prerequisites: [], questions: [{ id: 'one', question: 'First?', criteria: ['Reason'], criticalMisconceptions: ['Wrong'] }] },
    { id: 'second', slide: 2, objective: 'Second goal', prerequisites: ['first'], questions: [{ id: 'two', question: 'Second?', criteria: ['Reason'], criticalMisconceptions: [] }] },
    { id: 'third', slide: 3, objective: 'Third goal', prerequisites: ['second'], questions: [{ id: 'three', question: 'Third?', criteria: ['Reason'], criticalMisconceptions: [] }] },
  ] },
});

test('card sees only its prefix, objective and questions, without mutating the stack', () => {
  const full = fixture(); const before = structuredClone(full);
  const card = cardPacket(full, 'second');
  assert.deepEqual(card.lesson.slides, full.lesson.slides.slice(0, 2));
  assert.deepEqual(card.contract.questions, full.contract.cards[1].questions);
  assert.deepEqual(card.contract.objectives, [{ id: 'second', description: 'Second goal' }]);
  assert.equal(card.contract.cards, undefined);
  assert.deepEqual(card.contract.card.prerequisites, ['first']);
  assert.equal(card.lessonHash, hash({ lesson: card.lesson, assets: card.assets, eligibility: card.eligibility }));
  assert.equal(card.rubricHash, hash({ rubric: card.rubric, contract: card.contract }));
  assert.deepEqual(full, before);
});

test('earlier content and prerequisite contract changes invalidate later approvals, future text does not', () => {
  const full = fixture(); const original = cardPacket(full, 'second');
  full.lesson.slides[2].title = 'Future edit';
  assert.equal(cardPacket(full, 'second').lessonHash, original.lessonHash);
  full.lesson.slides[0].title = 'Prerequisite edit';
  assert.notEqual(cardPacket(full, 'second').lessonHash, original.lessonHash);
  full.contract.cards[0].objective = 'Changed prerequisite';
  assert.notEqual(cardPacket(full, 'second').rubricHash, original.rubricHash);
});

test('release requires every ordered card and the full stack, not one approved prefix', () => {
  const full = fixture(); const packets = releasePackets(full);
  assert.deepEqual(packets.map(p => p.directory), ['cards/first', 'cards/second', 'cards/third', 'stack']);
  assert.deepEqual(packets.at(-1).packet, full);
});

for (const [label, change] of [
  ['missing cards', p => delete p.contract.cards],
  ['unmapped slide', p => p.contract.cards.pop()],
  ['duplicate card', p => p.contract.cards[1].id = 'first'],
  ['missing ID', p => delete p.contract.cards[2].id],
  ['unsafe ID', p => p.contract.cards[1].id = '../escape'],
  ['out-of-order mapping', p => p.contract.cards[1].slide = 3],
  ['missing objective', p => p.contract.cards[0].objective = ''],
  ['future dependency', p => p.contract.cards[0].prerequisites = ['third']],
  ['unknown dependency', p => p.contract.cards[1].prerequisites = ['unknown']],
  ['duplicate dependency', p => p.contract.cards[1].prerequisites = ['first', 'first']],
  ['missing dependency list', p => delete p.contract.cards[0].prerequisites],
  ['empty questions', p => p.contract.cards[0].questions = []],
  ['empty criteria', p => p.contract.cards[0].questions[0].criteria = []],
  ['duplicate questions', p => p.contract.cards[0].questions.push(p.contract.cards[0].questions[0])],
]) test(`rejects ${label}`, () => { const p = fixture(); change(p); assert.throws(() => cardPacket(p, 'first')); });
test('unknown card cannot fall back to a stack evaluation', () => assert.throws(() => cardPacket(fixture(), 'unknown')));
