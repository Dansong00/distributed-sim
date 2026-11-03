# Caching release evidence

Object-storage registration changed the shared dialog hash. Two sentences were added so a re-review could state where a stale outage copy remains and that losing cache access does not by itself decide whether requests fail. Learner `caching-learner-r4` and reviewers `caching-review-r4a` and `caching-review-r4b` scored 18/20 and 19/20, every outcome 2/2, no hard failures.

```sh
npm run eval:lessons -- check-release caching evals/lessons/releases/caching
```

Current-source gate passes. Snapshot validation: 224 app tests, 98 evaluator tests, build and eight focused browser journeys. This unchanged deck was not rerun in the browser; earlier UI proof remains in its release history. Archive/checksum and selected UI scope: [CDN report](../cdn-http-caching/REPORT.md). CI needs no external download.

Originally shipped in [PR #20](https://github.com/Dansong00/distributed-sim/pull/20). [Earlier report](https://github.com/Dansong00/distributed-sim/blob/82b96e9ae2dc21c052f87a04045dbaeea46fa27f/evals/lessons/releases/caching/REPORT.md) and [ARCHIVE.md](../../ARCHIVE.md) preserve prior calibration/provenance. These evaluations assess content readiness, not human learning.
