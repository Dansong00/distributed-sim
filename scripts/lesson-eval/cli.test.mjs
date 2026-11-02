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
    // All three reports are absent; concurrent reads may report any one first.
    assert.match(missing.stdout + missing.stderr, /ENOENT.*(?:learner|review-[ab])\.json/);
    assert.equal(run('check-card', 'caching', 'unknown', 'missing', 'missing', 'missing').status, 1);
  } finally { rmSync(dir, { recursive: true }); }
});

test('release works with only unchanged passing stack reports and rejects incomplete or altered evidence', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lesson-release-cli-test-'));
  const source = fileURLToPath(new URL('../../evals/lessons/releases/caching/', import.meta.url));
  try {
    for (const name of ['learner.json', 'review-a.json', 'review-b.json']) {
      writeFileSync(join(dir, name), readFileSync(join(source, name)));
    }
    const good = run('check-release', 'caching', dir);
    assert.equal(good.status, 0, good.stdout + good.stderr);
    assert.equal(JSON.parse(good.stdout).pass, true);
    assert.equal(JSON.parse(good.stdout).scope, 'current-release');
    assert.equal(JSON.parse(good.stdout).scores.length, 2);
    // The release check needs no packet snapshots, browser artifacts or per-card reports.
    const path = join(dir, 'learner.json');
    const original = readFileSync(path);
    const learner = JSON.parse(original);
    learner.answers[0].answer += ' Changed after review.';
    writeFileSync(path, JSON.stringify(learner));
    const altered = run('check-release', 'caching', dir);
    assert.equal(altered.status, 1);
    assert.match(altered.stdout, /learner response changed/);
    writeFileSync(path, original);
    rmSync(join(dir, 'review-b.json'));
    assert.equal(run('check-release', 'caching', dir).status, 1);
  } finally { rmSync(dir, { recursive: true }); }
});

test('release rejects stale source hashes, bad source evidence and failed learning outcomes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'lesson-release-reject-test-'));
  const source = fileURLToPath(new URL('../../evals/lessons/releases/caching/', import.meta.url));
  try {
    const names = ['learner.json', 'review-a.json', 'review-b.json'];
    const originals = names.map(name => JSON.parse(readFileSync(join(source, name))));
    for (const mutate of [
      reports => reports[0].lessonHash = 'old source',
      reports => reports[1].rubricHash = 'old contract',
      reports => reports[1].outcomes[0].score = 1,
      reports => reports[1].sourceChecks[0].verified = false,
      reports => reports[1].hardFailures = ['False guarantee'],
      reports => reports[1].dimensions.accuracy.score = 2,
    ]) {
      const reports = structuredClone(originals); mutate(reports);
      names.forEach((name, i) => writeFileSync(join(dir, name), JSON.stringify(reports[i])));
      assert.equal(run('check-release', 'caching', dir).status, 1);
    }
  } finally { rmSync(dir, { recursive: true }); }
});
