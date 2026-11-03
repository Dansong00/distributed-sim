# Load Balancing release evidence

DNS diagram registration changed the shared LessonDialog source bound by the existing hash. This stack's content, diagram and eligibility are unchanged. Fresh whole-stack evidence preserves that binding instead of relabeling previous reports.

Learner `/root/dns_learner_p8` and independent reviewers `/root/dns_review_a` and `/root/dns_review_b` evaluated external case `p8`. Review scores are 20/20 and 20/20; every outcome is 2/2 with no hard failures. All card objectives, diagram meaning and distinct sources were checked. Adjacent JSON files match original outputs. Current-source `check-release` passes.

```sh
npm run eval:lessons -- check-release load-balancing evals/lessons/releases/load-balancing
```

This snapshot passed 223 app tests, 98 evaluator tests, production build and eight targeted verification-skill journeys. This unchanged deck was not rerun in the browser; its earlier UI proof remains in release history. Fresh evaluation and selected browser evidence share the archive/checksum in [the DNS report](../dns/REPORT.md). CI requires no external download.

Originally shipped in [PR #23](https://github.com/Dansong00/distributed-sim/pull/23). Prior calibration/archive provenance remains in [the earlier report](https://github.com/Dansong00/distributed-sim/blob/fa495049a09d0f9a82d4406df7abeb48257e5d1b/evals/lessons/releases/load-balancing/REPORT.md) and [ARCHIVE.md](../../ARCHIVE.md). These evaluations assess content readiness, not human learning or independent per-card certification.
