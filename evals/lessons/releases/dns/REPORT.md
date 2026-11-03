# DNS release evidence

Eight cards follow one Notes hostname lookup: who answers, how that differs from HTTP, an alias versus address records, an address set, per-cache TTL, lookup failure versus NXDOMAIN, a planned cutover, and why a stable name is not health-aware request distribution. The independently frozen contract has six transfer scenarios. Only network components with normalized DNS technology expose this stack.

Current-source `check-release` passes. Fresh learner `dns-learner-1` answered all six scenarios. Independent reviewers `dns-review-a` and `dns-review-b` scored 18/20 and 18/20; every outcome is 2/2 with no hard failures. Both gave clarity 3/4 because the TTL and failure cards are dense but sufficient. Accuracy and mechanisms differ by one point. All eight card objectives, both diagrams, and the distinct primary sources were checked. Adjacent JSON files are unchanged outputs from `/tmp/dns-eval/candidate`.

Registering the diagram changed the shared dialog hash, so caching, queues, load balancing, and API gateways were re-evaluated with fresh sessions. Caching, queues, and load balancing also received the small clarifications those reviews required. API gateway lesson text was unchanged.

Validation in this checkout: 223 app tests, 98 evaluator tests, five current-source release gates, typecheck, repository-URL production build, and the Playwright DNS journey at 1280×900, 985×543, and 390×700. The `verify-system-canvas` skill and the Ponytail skill were not present here. The Ponytail checklist found no actionable complexity findings. A separate DNS negative-control packet was not run; the rubric and grader were not changed.

```sh
npm run eval:lessons -- check-release dns evals/lessons/releases/dns
```

Raw attempts, including failed refresh rounds: `/tmp/system-canvas-learning-archive/2026-11-03-dns-evidence.tar.gz`. SHA-256: `447f5fc603e54c6ad26216c1338ec6ac8cbc8540815587d9f9016ba8d3efe29a`. 57 archived files. This machine-local archive is not a durable personal-documents store.

CI validates current source against tracked reports without downloading the archive. These checks establish content readiness and reject stale evidence; they cannot authenticate reviewers or prove human learning.
