import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, hash, slideText } from './gate.mjs';

function fixture() {
  const lesson = { title: 'Read a response', slides: [
    { section: 'Flow', title: 'The request', paragraphs: ['A client sends a request.'], remember: 'The server answers.', source: 'https://example.org/request' },
    { section: 'Failure', title: 'The timeout', paragraphs: [{ label: 'Timeout', text: 'A timeout leaves the result unknown.' }], remember: 'Check before retrying.', source: 'https://example.org/timeout' }
  ] };
  const dimensions = ['accuracy', 'coverage', 'clarity', 'transfer', 'sources'];
  const rubric = { dimensions, minDimension: 3, minTotal: 18, maxScore: 4 };
  const packet = { lessonId: 'request', lessonHash: hash(lesson), rubricHash: hash(rubric), lesson, rubric, contract: { audience: 'API engineers', prerequisites: ['Requests and responses'], objectives: [{ id: 'request', description: 'Trace requests and timeouts' }], questions: ['q1', 'q2'].map(id => ({ id, question: 'Explain the request.', criteria: ['Trace the request.'], criticalMisconceptions: [] })) } };
  const evidence = [{ slide: 1, quote: 'A client sends a request.' }];
  const learner = { lessonHash: packet.lessonHash, rubricHash: packet.rubricHash, respondent: 'learner', answers: ['q1', 'q2'].map(id => ({ id, answer: 'The client sends a request.', evidence: structuredClone(evidence) })) };
  const reviews = ['judge-a', 'judge-b'].map(reviewer => ({
    lessonHash: packet.lessonHash, rubricHash: packet.rubricHash, learnerHash: hash(learner), reviewer,
    dimensions: Object.fromEntries(dimensions.map(name => [name, { score: 4, reason: 'The cited sentence supports the answer.', evidence: structuredClone(evidence) }])),
    outcomes: ['q1', 'q2'].map(id => ({ id, score: 2, reason: 'Answer demonstrates the outcome.' })), hardFailures: [],
    sourceChecks: lesson.slides.map((slide, index) => ({ slide: index + 1, url: slide.source, claim: 'The source supports the slide.', verified: true }))
  }));
  return { packet, learner, reviews };
}
function reject(mutator) {
  const data = fixture();
  mutator(data);
  if (data.learner !== undefined) for (const review of data.reviews) {
    if (review) review.learnerHash = hash(data.learner);
  }
  const result = evaluate(data.packet, data.learner, data.reviews);
  assert.equal(result.pass, false);
  assert.ok(result.failures.length > 0);
}

test('valid complete evidence passes and reports each review total', () => {
  const { packet, learner, reviews } = fixture();
  const result = evaluate(packet, learner, reviews);
  assert.equal(result.pass, true);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.scores.map(score => score.total), [20, 20]);
});
test('hash uses SHA256 of the JSON representation', () => {
  assert.equal(hash({}), '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a');
});
test('slideText includes object paragraphs and excludes source metadata', () => {
  assert.equal(slideText(fixture().packet.lesson.slides[1]), 'Failure\nThe timeout\nTimeout\nA timeout leaves the result unknown.\nCheck before retrying.');
});

for (const [name, mutate] of [
  ['missing audience', d => delete d.packet.contract.audience],
  ['missing prerequisites', d => delete d.packet.contract.prerequisites],
  ['blank prerequisite', d => d.packet.contract.prerequisites = [' ']],
  ['missing objectives', d => delete d.packet.contract.objectives],
  ['empty objectives', d => d.packet.contract.objectives = []],
  ['blank objective', d => d.packet.contract.objectives[0].description = ' '],
  ['duplicate objective ID', d => d.packet.contract.objectives.push(d.packet.contract.objectives[0])],
  ['blank stack question', d => d.packet.contract.questions[0].question = ''],
  ['missing stack criteria', d => delete d.packet.contract.questions[0].criteria],
  ['empty stack criteria', d => d.packet.contract.questions[0].criteria = []],
  ['blank criterion', d => d.packet.contract.questions[0].criteria = [' ']],
  ['missing misconception list', d => delete d.packet.contract.questions[0].criticalMisconceptions],
  ['malformed misconception list', d => d.packet.contract.questions[0].criticalMisconceptions = 'wrong'],
  ['blank misconception', d => d.packet.contract.questions[0].criticalMisconceptions = [' ']],
  ['stale learner hash', d => d.learner.lessonHash = 'old'],
  ['stale review hash', d => d.reviews[0].rubricHash = 'old'],
  ['missing review', d => d.reviews.pop()],
  ['extra review', d => d.reviews.push(structuredClone(d.reviews[0]))],
  ['missing learner', d => d.learner = undefined],
  ['null review', d => d.reviews[0] = null],
  ['duplicate reviewers', d => d.reviews[1].reviewer = d.reviews[0].reviewer],
  ['reviewer is learner', d => d.reviews[0].reviewer = d.learner.respondent],
  ['whitespace reviewer identity', d => d.reviews[0].reviewer = ' '],
  ['empty answer', d => d.learner.answers[0].answer = ' '],
  ['missing answer', d => d.learner.answers.pop()],
  ['duplicate answer ID', d => d.learner.answers[1].id = 'q1'],
  ['extra answer ID', d => d.learner.answers.push({ ...d.learner.answers[0], id: 'extra' })],
  ['unsupported answer', d => d.learner.answers[0].evidence = []],
  ['fabricated learner quote', d => d.learner.answers[0].evidence[0].quote = 'Every request succeeds.'],
  ['fabricated review quote', d => d.reviews[0].dimensions.accuracy.evidence[0].quote = 'Every request succeeds.'],
  ['zero slide index', d => d.learner.answers[0].evidence[0].slide = 0],
  ['oversized slide index', d => d.learner.answers[0].evidence[0].slide = 3],
  ['fractional slide index', d => d.learner.answers[0].evidence[0].slide = 1.5],
  ['empty quote', d => d.learner.answers[0].evidence[0].quote = ''],
  ['negative score', d => d.reviews[0].dimensions.accuracy.score = -1],
  ['oversized score', d => d.reviews[0].dimensions.accuracy.score = 5],
  ['fractional score', d => d.reviews[0].dimensions.accuracy.score = 3.5],
  ['NaN score', d => d.reviews[0].dimensions.accuracy.score = NaN],
  ['string score', d => d.reviews[0].dimensions.accuracy.score = '4'],
  ['low dimension', d => d.reviews[0].dimensions.accuracy.score = 2],
  ['low total', d => Object.values(d.reviews[0].dimensions).forEach(v => v.score = 3)],
  ['missing dimension', d => delete d.reviews[0].dimensions.accuracy],
  ['extra dimension', d => d.reviews[0].dimensions.extra = d.reviews[0].dimensions.accuracy],
  ['missing reason', d => d.reviews[0].dimensions.accuracy.reason = ''],
  ['missing outcomes', d => delete d.reviews[0].outcomes],
  ['duplicate outcome', d => d.reviews[0].outcomes[1].id = 'q1'],
  ['low outcome', d => d.reviews[0].outcomes[0].score = 1],
  ['outcome without reason', d => d.reviews[0].outcomes[0].reason = ''],
  ['hard failure veto', d => d.reviews[0].hardFailures = ['False central claim']],
  ['missing hard failure list', d => delete d.reviews[0].hardFailures],
  ['missing source check', d => d.reviews[0].sourceChecks.pop()],
  ['unverified source', d => d.reviews[0].sourceChecks[0].verified = false],
  ['source URL mismatch', d => d.reviews[0].sourceChecks[0].url = 'https://other.org'],
  ['source slide mismatch', d => d.reviews[0].sourceChecks[0].slide = 2],
  ['empty source claim', d => d.reviews[0].sourceChecks[0].claim = ''],
  ['empty source checks', d => d.reviews[0].sourceChecks = []],
  ['invalid lesson title', d => d.packet.lesson.title = ''],
  ['empty slides', d => d.packet.lesson.slides = []],
  ['too many slides', d => d.packet.lesson.slides = Array(10).fill(d.packet.lesson.slides[0])],
  ['empty slide heading', d => d.packet.lesson.slides[0].title = ''],
  ['empty paragraphs', d => d.packet.lesson.slides[0].paragraphs = []],
  ['empty remember', d => d.packet.lesson.slides[0].remember = ''],
  ['HTTP source', d => d.packet.lesson.slides[0].source = 'http://example.org'],
  ['malformed source', d => d.packet.lesson.slides[0].source = 'https://'],
  ['missing rubric', d => delete d.packet.rubric],
  ['missing contract', d => delete d.packet.contract],
  ['missing packet hashes', d => { delete d.packet.lessonHash; delete d.learner.lessonHash; d.reviews.forEach(r => delete r.lessonHash); }]
]) test(`rejects ${name}`, () => reject(mutate));

test('missing and malformed top-level data fail closed without throwing', () => {
  for (const value of [undefined, null, false, 3, '', [], {}]) {
    const result = evaluate(value, value, value);
    assert.equal(result.pass, false);
    assert.ok(result.failures.length);
  }
});
test('disagreement greater than one point is explicitly rejected', () => {
  const { packet, learner, reviews } = fixture();
  reviews[0].dimensions.accuracy.score = 2;
  assert.ok(evaluate(packet, learner, reviews).failures.some(f => /disagree|contradict/i.test(f)));
});

test('malformed learner identity fails closed without invoking an arbitrary trim field', () => {
  reject(d => d.learner.respondent = { trim: 'not a function' });
});

test('rejects changed answers even when their lesson and rubric hashes match', () => {
  const { packet, learner, reviews } = fixture();
  learner.answers[0].answer = 'A different, unreviewed answer.';
  const result = evaluate(packet, learner, reviews);
  assert.equal(result.pass, false);
  assert.ok(result.failures.some(message => message.includes('learner response changed')));
});
test('rejects reviews without a learner response binding', () => {
  const { packet, learner, reviews } = fixture();
  delete reviews[0].learnerHash;
  const result = evaluate(packet, learner, reviews);
  assert.equal(result.pass, false);
  assert.ok(result.failures.some(message => message.includes('learner response changed')));
});
