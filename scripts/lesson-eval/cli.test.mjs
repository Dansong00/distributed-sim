import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('./cli.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

test('exports a blind learner packet, binds criteria, and refuses to overwrite evidence', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lesson-eval-cli-test-'));
  try {
    const result = run('packet', 'caching', dir);
    assert.equal(result.status, 0, result.stderr);
    const packet = JSON.parse(readFileSync(join(dir, 'packet.json')));
    const learner = JSON.parse(readFileSync(join(dir, 'learner-input.json')));
    assert.equal(packet.contract.questions.length, 6);
    assert.deepEqual(learner.questions, packet.contract.questions.map(({ id, question }) => ({ id, question })));
    assert.equal(learner.rubric, undefined);
    assert.equal(learner.contract, undefined);
    assert.equal(learner.assets, undefined);
    assert.equal(learner.lessonHash, packet.lessonHash);
    assert.equal(learner.rubricHash, packet.rubricHash);
    const previous = readFileSync(join(dir, 'packet.json'), 'utf8');
    assert.equal(run('packet', 'caching', dir).status, 1);
    assert.equal(readFileSync(join(dir, 'packet.json'), 'utf8'), previous);
  } finally { rmSync(dir, { recursive: true }); }
});

test('rejects a tampered archived packet before evaluating reports', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lesson-eval-tamper-test-'));
  try {
    assert.equal(run('packet', 'caching', dir).status, 0);
    const packetPath = join(dir, 'packet.json');
    const packet = JSON.parse(readFileSync(packetPath));
    packet.lesson.slides[0].remember = 'An unreviewed alteration';
    writeFileSync(packetPath, JSON.stringify(packet));
    const result = run('check-packet', packetPath, 'missing-learner.json', 'missing-a.json', 'missing-b.json');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Packet integrity mismatch/);
  } finally { rmSync(dir, { recursive: true }); }
});

test('unknown lesson and command fail explicitly', () => {
  assert.equal(run('packet', 'nonexistent-lesson', '/tmp/should-not-be-created-by-lesson-eval').status, 1);
  assert.match(run('not-a-command').stderr, /Usage:/);
});

test('card export hides later teaching and gold answers; release rejects missing evidence', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lesson-card-cli-test-'));
  try {
    const result = run('packet-card', 'caching', 'why-cache', dir);
    assert.equal(result.status, 0, result.stderr);
    const packet = JSON.parse(readFileSync(join(dir, 'packet.json')));
    const learner = JSON.parse(readFileSync(join(dir, 'learner-input.json')));
    assert.equal(learner.lesson.slides.length, 1);
    assert.equal(learner.questions.length, packet.contract.questions.length);
    assert.deepEqual(Object.keys(learner.questions[0]).sort(), ['id', 'question']);
    assert.equal(learner.contract, undefined);
    assert.equal(learner.assets, undefined);
    assert.equal(learner.cardId, 'why-cache');
    assert.equal(run('packet-card', 'caching', 'why-cache', dir).status, 1);
    const missing = run('check-release', 'caching', dir);
    assert.equal(missing.status, 1);
    assert.match(missing.stdout, /cards\/why-cache/);
    assert.equal(run('check-card', 'caching', 'unknown', 'missing', 'missing', 'missing').status, 1);
  } finally { rmSync(dir, { recursive: true }); }
});

test('release passes only with current evidence for every card and the entire stack', async () => {
  const { hash, slideText } = await import('./gate.mjs');
  const { cardPacket } = await import('./cards.mjs');
  const { mkdirSync } = await import('node:fs');
  const dir = mkdtempSync(join(tmpdir(), 'lesson-release-cli-test-'));
  try {
    assert.equal(run('packet', 'caching', join(dir, 'stack')).status, 0);
    const full = JSON.parse(readFileSync(join(dir, 'stack', 'packet.json')));
    // Synthetic gate fixtures, never stored as actual content-review evidence.
    function reports(packet, subdir) {
      const path = join(dir, subdir); mkdirSync(path, { recursive: true });
      const evidence = [{ slide: 1, quote: slideText(packet.lesson.slides[0]) }];
      const learner = { lessonHash: packet.lessonHash, rubricHash: packet.rubricHash, respondent: 'test-learner',
        answers: packet.contract.questions.map(q => ({ id: q.id, answer: 'Synthetic test answer', evidence })) };
      writeFileSync(join(path, 'learner.json'), JSON.stringify(learner));
      for (const name of ['review-a', 'review-b']) writeFileSync(join(path, `${name}.json`), JSON.stringify({
        lessonHash: packet.lessonHash, rubricHash: packet.rubricHash, learnerHash: hash(learner), reviewer: `test-${name}`,
        dimensions: Object.fromEntries(packet.rubric.dimensions.map(d => [d, { score: 4, reason: 'Test fixture', evidence }])),
        outcomes: packet.contract.questions.map(q => ({ id: q.id, score: 2, reason: 'Test fixture' })), hardFailures: [],
        sourceChecks: packet.lesson.slides.map((s, i) => ({ slide: i + 1, url: s.source, claim: 'Test fixture', verified: true })),
      }));
    }
    reports(full, 'stack');
    assert.equal(run('check-release', 'caching', dir).status, 1, 'stack pass cannot substitute for cards');
    for (const card of full.contract.cards) reports(cardPacket(full, card.id), `cards/${card.id}`);
    const green = run('check-release', 'caching', dir);
    assert.equal(green.status, 0, green.stdout + green.stderr);
    assert.equal(JSON.parse(green.stdout).results.length, 9);
    const learnerPath = join(dir, 'cards', full.contract.cards[0].id, 'learner.json');
    const learner = JSON.parse(readFileSync(learnerPath)); learner.answers[0].answer = 'Changed after review';
    writeFileSync(learnerPath, JSON.stringify(learner));
    const stale = run('check-release', 'caching', dir);
    assert.equal(stale.status, 1);
    assert.match(stale.stdout, /learner response changed/);
  } finally { rmSync(dir, { recursive: true }); }
});
