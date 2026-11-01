# Caching release evidence

Adding the queue renderer registration changed the shared LessonDialog source bound by the existing hash. The caching lesson, diagram and eligibility are unchanged; this refresh preserves that conservative binding instead of relabeling prior reports.

A fresh learner `/root/cache_cold_c3` and independent reviewers `/root/queue_review_a` and `/root/queue_review_b` evaluated external case `c3`. Both reviewers scored 20/20, every transfer outcome 2/2, with no hard failures. They checked all card objectives, diagrams and linked primary sources. The three adjacent JSON files are their unchanged outputs. Current-source `check-release` passes.

```sh
npm run test:lesson-eval
npm run eval:lessons -- check-release caching evals/lessons/releases/caching
```

This release also passed 217 app tests, 98 evaluator tests, production build and the verification skill's 23 selected lesson journeys, including all five caching checks. The fresh packets, responses and browser proof share the external archive and checksum documented in [the queue report](../queues/REPORT.md). CI requires no archive download, model call or personal filesystem.

The original caching release shipped in [PR #20](https://github.com/Dansong00/distributed-sim/pull/20); its original reports remain in Git history and the earlier calibration/failed attempts remain in [ARCHIVE.md](../../ARCHIVE.md). This refresh is full-stack content approval, not independent prefix certification or proof of human learning. Reviewers are independent sessions from one model family; UI coverage is Chrome rather than a cross-browser matrix.
