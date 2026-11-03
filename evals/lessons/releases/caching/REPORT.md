# Caching release evidence

DNS diagram registration changed the shared LessonDialog source bound by the existing hash. Fresh reviews also required two clarifications: where a stale copy can remain when the cache is unreachable, and that losing cache access does not by itself decide whether requests fail. Least-recently-used eviction now says accessed rather than read.

Learner `caching-learner-r2` and independent reviewers `caching-review-r2-a` and `caching-review-r2-b` scored 19/20 and 20/20. Every outcome is 2/2, with no hard failures. Adjacent JSON files are unchanged outputs. Current-source `check-release` passes.

```sh
npm run eval:lessons -- check-release caching evals/lessons/releases/caching
```

This refresh was checked with the DNS release. See [the DNS report](../dns/REPORT.md) for the test commands, the missing verification skill, and the external archive checksum. CI requires no external download.

Originally shipped in [PR #20](https://github.com/Dansong00/distributed-sim/pull/20). Earlier reports remain in Git history; original calibration/archive provenance is in [the earlier report](https://github.com/Dansong00/distributed-sim/blob/82b96e9ae2dc21c052f87a04045dbaeea46fa27f/evals/lessons/releases/caching/REPORT.md) and [ARCHIVE.md](../../ARCHIVE.md). This is content readiness from independent sessions in one model family, not human learning or independent per-card certification.
