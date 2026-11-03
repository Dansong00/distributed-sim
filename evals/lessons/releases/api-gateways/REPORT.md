# API Gateways release evidence

Object-storage registration changed the shared dialog hash. Lesson text is unchanged. Learner `api-gateways-learner-refresh` and reviewers `api-gateways-review-a` and `api-gateways-review-b` scored 20/20 and 20/20, every outcome 2/2, no hard failures.

```sh
npm run eval:lessons -- check-release api-gateways evals/lessons/releases/api-gateways
```

Current-source gate passes. Snapshot validation: 224 app tests, 98 evaluator tests, build and eight focused browser journeys. This unchanged deck was not rerun in the browser; earlier UI proof remains in its release history. Archive/checksum and selected UI scope: [CDN report](../cdn-http-caching/REPORT.md). CI needs no external download.

Originally shipped in [PR #24](https://github.com/Dansong00/distributed-sim/pull/24). [Earlier report](https://github.com/Dansong00/distributed-sim/blob/578d6d954ce1f4119e1357060921fdf586c4a870/evals/lessons/releases/api-gateways/REPORT.md) and [ARCHIVE.md](../../ARCHIVE.md) preserve prior calibration/provenance. These evaluations assess content readiness, not human learning.
