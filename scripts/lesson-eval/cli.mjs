import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createServer } from 'vite';
import { hash, evaluate } from './gate.mjs';
import { cardPacket, releasePackets } from './cards.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const json = value => JSON.stringify(value, null, 2) + '\n';

async function loadApp() {
  const cacheDir = await mkdtemp(join(tmpdir(), 'lesson-eval-vite-'));
  const server = await createServer({ root, configFile: false, cacheDir,
    logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { lessons, lessonsFor } = await server.ssrLoadModule('/src/learn/lessons.ts');
    const { presets, createComponent } = await server.ssrLoadModule('/src/domain/catalog.ts');
    return { lessons, coverage: presets.map(preset => ({
      id: preset.id, label: preset.label, category: preset.category,
      componentType: preset.componentType,
      lessons: lessonsFor(createComponent(preset.id, { x: 0, y: 0 })),
    })) };
  } finally { await server.close(); await rm(cacheDir, { recursive: true }); }
}

async function packetFor(id) {
  const { lessons, coverage } = await loadApp();
  if (!Object.hasOwn(lessons, id)) throw new Error(`Unknown lesson: ${id}`);
  const contract = await readJson(join(root, 'evals/lessons/contracts', `${id}.json`));
  const rubric = await readJson(join(root, 'evals/lessons/rubric.json'));
  const assets = {};
  for (const path of [contract.diagramFile, 'src/learn/LessonDialog.tsx', 'src/styles.css', 'src/learn/database-lessons.css']) {
    assets[path] = await readFile(join(root, path), 'utf8');
  }
  const eligibility = coverage.filter(preset => preset.lessons.includes(id)).map(preset => preset.id);
  const lesson = lessons[id];
  return { lessonId: id, lessonHash: hash({ lesson, assets, eligibility }),
    rubricHash: hash({ rubric, contract }), lesson, contract, rubric, assets, eligibility };
}

async function writePacket(packet, dir) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'packet.json'), json(packet), { flag: 'wx' });
  const learner = { lessonId: packet.lessonId, lessonHash: packet.lessonHash,
    rubricHash: packet.rubricHash, ...(packet.contract.card ? { cardId: packet.contract.card.id } : {}), audience: packet.contract.audience,
    prerequisites: packet.contract.prerequisites, lesson: packet.lesson,
    questions: packet.contract.questions.map(({ id, question }) => ({ id, question })) };
  await writeFile(join(dir, 'learner-input.json'), json(learner), { flag: 'wx' });
}

async function calibrate(id, dir) {
  const original = await packetFor(id);
  if (id !== 'caching') throw new Error('Blind controls are calibrated for caching only; create topic controls before expanding.');
  // Fixed opaque IDs make results reproducible. Do not give reviewers this key or source.
  const cases = [
    ['case-17', 'false-guarantee', lesson => {
      lesson.slides[3].paragraphs = [
        'Commit the database update, then delete the cache key. This guarantees every later read sees the new value, even if another reader was already filling the cache.',
        'Deletion cancels every in-flight cache fill, so concurrency cannot bring back an old value.'
      ];
      lesson.slides[3].remember = 'Commit then delete always guarantees fresh reads.';
    }],
    ['case-42', 'candidate', () => {}],
    ['case-63', 'glossary', lesson => {
      const terms = ['Cache: a stored copy.', 'Hit: data is present. Miss: data is absent.', 'Cache-aside: a caching pattern.', 'Invalidation: removing data.', 'TTL: time to live. Eviction: removal.', 'Local: nearby. Shared: used by many.', 'Stampede: many misses.', 'Trade-off: a benefit and a cost.'];
      lesson.slides.forEach((slide, index) => { slide.paragraphs = [terms[index]]; slide.remember = terms[index]; });
    }],
    ['case-85', 'jargon', lesson => {
      lesson.slides.forEach(slide => {
        slide.paragraphs = ['Use read-through locality amortization, keyspace canonicalization, singleflight, TTL jitter, LRU, coherence fencing and bounded origin concurrency.', 'Optimize p99 under cache coherence, stale-while-revalidate, CAS, and invalidation topology.'];
        slide.remember = 'Choose the correct coherence strategy and admission policy.';
      });
    }],
    ['case-96', 'irrelevant', lesson => {
      lesson.slides.forEach(slide => {
        slide.paragraphs = ['Reliable software starts with clear ownership and thoughtful planning. Teams should communicate goals, measure outcomes, and focus on user needs.', 'Simple systems help engineers make confident decisions and adapt as requirements change.'];
        slide.remember = 'Choose clarity and thoughtful design.';
      });
    }],
  ];
  const key = [];
  for (const [caseId, kind, mutate] of cases) {
    const packet = structuredClone(original);
    mutate(packet.lesson);
    packet.lessonHash = hash({ lesson: packet.lesson, assets: packet.assets, eligibility: packet.eligibility });
    await writePacket(packet, join(dir, caseId));
    key.push({ caseId, kind, expected: kind === 'candidate' ? 'measure' : 'reject' });
  }
  await writeFile(`${dir}-key.json`, json(key), { flag: 'wx' });
  return { directory: dir, cases: cases.map(([id]) => id), key: `${dir}-key.json` };
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === 'inventory' && args.length === 0) {
    const { lessons, coverage } = await loadApp();
    console.log(json({ lessons: Object.keys(lessons), components: coverage,
      withoutAnyLesson: coverage.filter(preset => !preset.lessons.length).map(preset => preset.id),
      note: 'Presence is not quality approval. Existing generic database coverage is not a specialized lesson.' }));
  } else if (command === 'packet' && args.length === 2) {
    const packet = await packetFor(args[0]);
    await writePacket(packet, resolve(args[1]));
    console.log(json({ directory: resolve(args[1]), lessonHash: packet.lessonHash, rubricHash: packet.rubricHash }));
  } else if (command === 'packet-card' && args.length === 3) {
    const packet = cardPacket(await packetFor(args[0]), args[1]);
    await writePacket(packet, resolve(args[2]));
    console.log(json({ directory: resolve(args[2]), lessonHash: packet.lessonHash, rubricHash: packet.rubricHash }));
  } else if (command === 'check-release' && args.length === 2) {
    const results = [];
    for (const { directory, packet } of releasePackets(await packetFor(args[0]))) {
      try {
        const [learner, ...reviews] = await Promise.all(['learner.json', 'review-a.json', 'review-b.json']
          .map(name => readJson(resolve(args[1], directory, name))));
        results.push({ directory, ...evaluate(packet, learner, reviews) });
      } catch (error) { results.push({ directory, pass: false, failures: [error.message] }); }
    }
    const pass = results.every(result => result.pass);
    console.log(json({ scope: 'current-release', lessonId: args[0], pass, results }));
    process.exitCode = pass ? 0 : 1;
  } else if (command === 'calibrate' && args.length === 2) {
    console.log(json(await calibrate(args[0], resolve(args[1]))));
  } else if ((['check', 'check-packet'].includes(command) && args.length === 4)
    || (command === 'check-card' && args.length === 5)) {
    const packet = command === 'check-card' ? cardPacket(await packetFor(args[0]), args[1])
      : command === 'check' ? await packetFor(args[0]) : await readJson(resolve(args[0]));
    if (packet.lessonHash !== hash({ lesson: packet.lesson, assets: packet.assets, eligibility: packet.eligibility })
      || packet.rubricHash !== hash({ rubric: packet.rubric, contract: packet.contract })) {
      throw new Error('Packet integrity mismatch: content or contract changed after export');
    }
    const [learner, ...reviews] = await Promise.all(args.slice(command === 'check-card' ? 2 : 1).map(path => readJson(resolve(path))));
    const result = evaluate(packet, learner, reviews);
    console.log(json({ scope: command === 'check-packet' ? 'archived-packet-only' : command === 'check-card' ? 'current-card' : 'current-content',
      lessonId: packet.lessonId, lessonHash: packet.lessonHash, rubricHash: packet.rubricHash, ...result }));
    process.exitCode = result.pass ? 0 : 1;
  } else {
    throw new Error('Usage: npm run eval:lessons -- inventory | packet <id> <new-dir> | packet-card <id> <card-id> <new-dir> | check-card <id> <card-id> <learner.json> <review-a.json> <review-b.json> | check-release <id> <run-dir> | calibrate caching <new-dir> | check <id> <learner.json> <review-a.json> <review-b.json> | check-packet <packet.json> <learner.json> <review-a.json> <review-b.json>');
  }
} catch (error) {
  console.error(json({ pass: false, error: error.message }));
  process.exitCode = 1;
}
