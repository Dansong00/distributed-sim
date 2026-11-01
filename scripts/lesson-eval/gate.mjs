import { createHash } from 'node:crypto';

const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const list = value => Array.isArray(value) ? value : [];

export function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function slideText(slide) {
  const paragraphs = list(slide?.paragraphs).flatMap(paragraph =>
    typeof paragraph === 'string' ? [paragraph] : [paragraph?.label, paragraph?.text]);
  return [slide?.section, slide?.title, ...paragraphs, slide?.remember]
    .filter(value => typeof value === 'string').join('\n');
}

export function validQuestions(questions) {
  return Array.isArray(questions) && questions.length > 0
    && new Set(questions.map(q => q?.id)).size === questions.length
    && questions.every(q => nonempty(q?.id) && nonempty(q.question)
      && Array.isArray(q.criteria) && q.criteria.length > 0 && q.criteria.every(nonempty)
      && Array.isArray(q.criticalMisconceptions) && q.criticalMisconceptions.every(nonempty));
}

function https(value) {
  if (!nonempty(value)) return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

function exactIds(items, expected) {
  if (!Array.isArray(items) || items.length !== expected.length) return false;
  const ids = items.map(item => item?.id);
  return new Set(ids).size === ids.length && ids.every(id => expected.includes(id));
}

// Checks structured evidence only. Independent judges supply reasoning and source
// verification; matching identities, hashes, or quotes does not prove provenance.
export function evaluate(packet, learner, reviews) {
  const failures = [];
  const scores = [];
  const require = (condition, message) => { if (!condition) failures.push(message); };
  const lesson = packet?.lesson;
  const slides = list(lesson?.slides);
  const rubric = packet?.rubric;
  const dimensions = list(rubric?.dimensions);
  const questions = list(packet?.contract?.questions);
  const questionIds = questions.map(question => question?.id);

  require(nonempty(packet?.lessonId), 'Missing lesson ID');
  require(nonempty(packet?.lessonHash) && nonempty(packet?.rubricHash), 'Missing packet hashes');
  require(nonempty(lesson?.title), 'Lesson title is empty');
  require(slides.length >= 1 && slides.length <= 9, 'Lesson must contain 1 to 9 slides');
  slides.forEach((slide, index) => {
    const location = `Slide ${index + 1}`;
    require(nonempty(slide?.section) && nonempty(slide?.title), `${location}: missing heading`);
    const paragraphs = list(slide?.paragraphs);
    require(paragraphs.length > 0 && paragraphs.every(paragraph =>
      nonempty(paragraph) || (object(paragraph) && nonempty(paragraph.label) && nonempty(paragraph.text))),
    `${location}: missing paragraph text`);
    require(nonempty(slide?.remember), `${location}: missing remember text`);
    require(https(slide?.source), `${location}: source must be an HTTPS URL`);
  });
  require(dimensions.length === 5 && dimensions.every(nonempty) && new Set(dimensions).size === dimensions.length,
    'Rubric must contain five distinct dimensions');
  require(rubric?.minDimension === 3 && rubric?.minTotal === 18 && rubric?.maxScore === 4,
    'Rubric must use minDimension 3, minTotal 18, and maxScore 4');
  require(nonempty(packet?.contract?.audience), 'Contract requires an audience');
  require(Array.isArray(packet?.contract?.prerequisites) && packet.contract.prerequisites.every(nonempty),
    'Contract requires a prerequisite list with nonempty entries');
  const objectives = list(packet?.contract?.objectives);
  require(objectives.length > 0 && new Set(objectives.map(o => o?.id)).size === objectives.length
    && objectives.every(o => nonempty(o?.id) && nonempty(o.description)),
    'Contract requires distinct objectives with descriptions');
  require(validQuestions(questions),
    'Contract requires distinct question IDs, question text, grading criteria and misconception lists');

  function checkHashes(report, location) {
    require(nonempty(report?.lessonHash) && report.lessonHash === packet?.lessonHash,
      `${location}: stale or missing lesson hash`);
    require(nonempty(report?.rubricHash) && report.rubricHash === packet?.rubricHash,
      `${location}: stale or missing rubric hash`);
  }
  function checkEvidence(evidence, location) {
    require(Array.isArray(evidence) && evidence.length > 0, `${location}: missing evidence`);
    list(evidence).forEach(item => {
      const validSlide = Number.isInteger(item?.slide) && item.slide >= 1 && item.slide <= slides.length;
      require(validSlide && nonempty(item?.quote) && slideText(slides[item.slide - 1]).includes(item.quote),
        `${location}: evidence must quote the referenced slide exactly`);
    });
  }
  checkHashes(learner, 'Learner');
  require(nonempty(learner?.respondent), 'Missing learner identity');
  const respondent = typeof learner?.respondent === 'string' ? learner.respondent.trim() : '';
  require(exactIds(learner?.answers, questionIds), 'Learner answers must contain every question ID exactly once');
  list(learner?.answers).forEach(answer => {
    const location = `Answer ${answer?.id}`;
    require(nonempty(answer?.answer), `${location}: missing answer`);
    checkEvidence(answer?.evidence, location);
  });

  require(Array.isArray(reviews) && reviews.length === 2, 'Exactly two independent reviews are required');
  const reviewers = new Set();
  list(reviews).forEach((review, index) => {
    const location = `Review ${index + 1}`;
    checkHashes(review, location);
    require(object(learner) && review?.learnerHash === hash(learner),
      `${location}: learner response changed or binding missing`);
    const identity = typeof review?.reviewer === 'string' ? review.reviewer.trim() : '';
    require(nonempty(identity) && !reviewers.has(identity) && identity !== respondent,
      `${location}: reviewer must be distinct from the learner and other reviewer`);
    reviewers.add(identity);
    const dimensionKeys = object(review?.dimensions) ? Object.keys(review.dimensions) : [];
    require(dimensionKeys.length === dimensions.length && dimensions.every(name => dimensionKeys.includes(name)),
      `${location}: dimensions must exactly match the rubric`);
    const dimensionScores = [];
    let total = 0;
    let validTotal = true;
    dimensions.forEach(name => {
      const item = review?.dimensions?.[name];
      const validScore = Number.isInteger(item?.score) && item.score >= 0 && item.score <= 4;
      require(validScore, `${location}, ${name}: score must be an integer from 0 to 4`);
      require(validScore && item.score >= 3, `${location}, ${name}: dimension score below 3`);
      require(nonempty(item?.reason), `${location}, ${name}: missing reason`);
      checkEvidence(item?.evidence, `${location}, ${name}`);
      dimensionScores.push([name, validScore ? item.score : null]);
      if (validScore) total += item.score;
      else validTotal = false;
    });
    require(validTotal && total >= 18, `${location}: total score below 18 or invalid`);
    scores.push({ reviewer: identity, total: validTotal ? total : null, dimensions: Object.fromEntries(dimensionScores) });
    require(exactIds(review?.outcomes, questionIds), `${location}: outcomes must contain every question ID exactly once`);
    list(review?.outcomes).forEach(outcome => {
      require(outcome?.score === 2 && nonempty(outcome?.reason), `${location}, outcome ${outcome?.id}: requires score 2 and reason`);
    });
    require(Array.isArray(review?.hardFailures) && review.hardFailures.length === 0,
      `${location}: hard failure veto or missing hardFailures list`);
    require(Array.isArray(review?.sourceChecks) && review.sourceChecks.length > 0, `${location}: missing source checks`);
    const checkedSources = new Set();
    list(review?.sourceChecks).forEach(check => {
      const validSlide = Number.isInteger(check?.slide) && check.slide >= 1 && check.slide <= slides.length;
      const valid = validSlide && check.url === slides[check.slide - 1]?.source && https(check.url)
        && nonempty(check.claim) && check.verified === true;
      require(valid, `${location}: source check needs a matching slide URL, claim, and verified true`);
      if (valid) checkedSources.add(check.url);
    });
    require(slides.every(slide => checkedSources.has(slide?.source)), `${location}: not every lesson source was checked`);
  });
  if (scores.length === 2) dimensions.forEach(name => {
    const [first, second] = scores.map(score => score.dimensions[name]);
    require(first === null || second === null || Math.abs(first - second) <= 1,
      `Reviews disagree by more than one point on ${name}`);
  });
  return { pass: failures.length === 0, failures, scores };
}
