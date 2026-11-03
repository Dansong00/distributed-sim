# Message Queues and Background Workers release evidence

Object-storage registration changed the shared dialog hash. Lesson text is unchanged. Learner `queues-learner-refresh` and reviewers `queues-review-a` and `queues-review-b` scored 20/20 and 20/20, every outcome 2/2, no hard failures.

```sh
npm run eval:lessons -- check-release queues evals/lessons/releases/queues
```

Current-source gate passes. Snapshot validation: 224 app tests, 98 evaluator tests, build and eight focused browser journeys. This unchanged deck was not rerun in the browser; earlier UI proof remains in its release history. Archive/checksum and selected UI scope: [CDN report](../cdn-http-caching/REPORT.md). CI needs no external download.

Originally shipped in [PR #22](https://github.com/Dansong00/distributed-sim/pull/22). [Earlier report](https://github.com/Dansong00/distributed-sim/blob/2daf96dc22654010d6eccdf84fccea5cffb2fc39/evals/lessons/releases/queues/REPORT.md) and [ARCHIVE.md](../../ARCHIVE.md) preserve prior calibration/provenance. These evaluations assess content readiness, not human learning.
