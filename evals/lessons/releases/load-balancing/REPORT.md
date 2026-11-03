# Load Balancing release evidence

API Gateway diagram registration changed the shared LessonDialog source bound by the existing hash. This stack's content, diagram and eligibility are unchanged. Fresh whole-stack evidence preserves that binding instead of relabeling previous hashes.

Learner `/root/gateway_learner_t2` and independent reviewers `/root/gateway_review_a` and `/root/gateway_review_b` evaluated external case `t2`. Both reviewers scored 20/20, every outcome 2/2, no hard failures; all card objectives, diagrams and distinct linked sources were checked. Adjacent JSON files are unchanged outputs. Current-source `check-release` passes.

```sh
npm run eval:lessons -- check-release load-balancing evals/lessons/releases/load-balancing
```

This snapshot passed 222 app tests, 98 evaluator tests, production build and 29 verification-skill lesson journeys, including all three load-balancing checks. Fresh packets and browser proof share the external archive/checksum in [the API Gateways report](../api-gateways/REPORT.md). CI requires no external download.

Originally shipped in [PR #23](https://github.com/Dansong00/distributed-sim/pull/23). Earlier reports remain in Git history; original calibration/archive provenance is in [the earlier report](https://github.com/Dansong00/distributed-sim/blob/fa495049a09d0f9a82d4406df7abeb48257e5d1b/evals/lessons/releases/load-balancing/REPORT.md) and [ARCHIVE.md](../../ARCHIVE.md). This is content readiness from independent sessions in one model family, not human learning or independent per-card certification.
