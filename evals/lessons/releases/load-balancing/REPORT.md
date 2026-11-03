# Load Balancing release evidence

DNS diagram registration changed the shared LessonDialog source bound by the existing hash. The drain slide now cites Network Load Balancer deregistration delay, which describes open connections that can still carry traffic until the delay ends. The availability slide cites the Azure load-balancing overview for a regional single point of failure and a surviving zone.

Learner `load-balancing-learner-r3` and independent reviewers `load-balancing-review-r3-a` and `load-balancing-review-r3-b` each scored 19/20. Every outcome is 2/2, with no hard failures. Both gave accuracy 3/4. Adjacent JSON files are unchanged outputs. Current-source `check-release` passes.

```sh
npm run eval:lessons -- check-release load-balancing evals/lessons/releases/load-balancing
```

This refresh was checked with the DNS release. See [the DNS report](../dns/REPORT.md) for the test commands, the missing verification skill, and the external archive checksum. CI requires no external download.

Originally shipped in [PR #23](https://github.com/Dansong00/distributed-sim/pull/23). Earlier reports remain in Git history; original calibration/archive provenance is in [the earlier report](https://github.com/Dansong00/distributed-sim/blob/fa495049a09d0f9a82d4406df7abeb48257e5d1b/evals/lessons/releases/load-balancing/REPORT.md) and [ARCHIVE.md](../../ARCHIVE.md). This is content readiness from independent sessions in one model family, not human learning or independent per-card certification.
