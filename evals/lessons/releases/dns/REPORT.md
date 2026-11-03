# DNS release evidence

CDN registration changed the shared renderer bound by the existing hash. This stack's content, diagram and eligibility are unchanged. Fresh learner `/root/cdn_learner_v3` and independent reviewers `/root/cdn_review_a` and `/root/cdn_review_b` evaluated external case `v3`: 20/20 and 19/20, every outcome 2/2, no hard failures. All objectives, diagram meaning and distinct sources checked. Adjacent JSON files match the original reports; no old hashes were relabeled.

```sh
npm run eval:lessons -- check-release dns evals/lessons/releases/dns
```

Current-source gate passes. Snapshot validation: 224 app tests, 98 evaluator tests, build and eight focused browser journeys. DNS was rerun at three viewports. Archive/checksum and selected UI scope: [CDN report](../cdn-http-caching/REPORT.md). CI needs no external download.

Originally shipped in [PR #25](https://github.com/Dansong00/distributed-sim/pull/25). [Earlier report](https://github.com/Dansong00/distributed-sim/blob/c700965ec4c6c730cd312e2fff1f3088aa8fde2c/evals/lessons/releases/dns/REPORT.md) and [ARCHIVE.md](../../ARCHIVE.md) preserve prior calibration/provenance. These evaluations assess content readiness, not human learning.
