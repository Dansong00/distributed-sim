# Caching release evidence

The load-balancing renderer registration changed shared LessonDialog source bound by the existing hash. Caching content, its diagram and eligibility are unchanged. Fresh whole-stack evidence preserves the conservative binding instead of relabeling old hashes.

Learner `/root/lb_learner_r2` and independent reviewers `/root/lb_review_a` and `/root/lb_review_b` evaluated external case `r2`. Both reviewers scored 20/20, every outcome 2/2, no hard failures; all card objectives, diagrams and linked sources were checked. Adjacent JSON files are their unchanged final outputs. Current-source `check-release` passes.

```sh
npm run eval:lessons -- check-release caching evals/lessons/releases/caching
```

This snapshot passed 221 app tests, 98 evaluator tests, production build and 26 verification-skill lesson journeys, including all five caching checks. Fresh packets and browser proof share the external archive/checksum in [the Load Balancing report](../load-balancing/REPORT.md). CI requires no external evidence download.

Caching originally shipped in [PR #20](https://github.com/Dansong00/distributed-sim/pull/20). Earlier reports remain in Git history; original calibration and failed attempts remain in [ARCHIVE.md](../../ARCHIVE.md). This is content readiness from independent sessions in one model family, not proof of human learning or separate per-card certification.
