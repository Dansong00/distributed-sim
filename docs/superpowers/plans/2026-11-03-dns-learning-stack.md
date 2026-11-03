# DNS learning stack

Continue the autonomous learning-stack loop. The backlog's next shared foundation is DNS, separate from CDN and HTTP caching. One concrete operation: a Notes client resolves api.notes.example before it connects.

## Design and boundaries

Teach who answers a lookup, how that lookup differs from HTTP, alias versus address records, an address set, TTL reuse, lookup failure versus a missing name, a planned cutover, and why a stable name is not health-aware request distribution. The independent contract freezes card order and transfer criteria before prose. Reuse the existing dialog and styles. Expose the deck only for normalized DNS network components. No resolver implementation, simulator, new dependency, or evaluator change.

Two small diagrams show the stub, recursive resolver, and authoritative server, then two caches expiring at different times. Registration in the shared dialog changes the source hash for caching, queues, load balancing, and API gateways, so those whole-stack reports need fresh sessions. Do not relabel old hashes.

## Tasks and checks

- [x] Freeze independent contract and check each card's objective, source, and prerequisite order.
- [x] Implement lesson, diagrams, and normalized DNS routing. Routing tests pass.
- [x] Fresh whole-stack learner and two independent reviewers. DNS check-release passes at 18/20 and 18/20.
- [x] Refresh caching, queues, load balancing, and API gateways after the shared dialog hash changed. Clarified only the gaps those reviews named.
- [x] App tests 223/223, evaluator tests 98/98, five current-source release gates, typecheck, and repository-URL build passed. Playwright DNS journeys passed at 1280×900, 985×543, and 390×700.
- [x] Correctness pass and Ponytail checklist. The installed Ponytail skill was not present; the checklist found no actionable complexity findings.
- [ ] Commit, PR, and CI.

## Review log

Contract session `bc-faa4bc2b-89d2-57ca-9eb5-3813149b27d3` froze eight cards and six transfer questions before this prose existed. SHA-256 `ffe8eded698e01dff24ba596b2d595cceb7ab282fdb92f572e30ecb2861ebfd2`. Author checked the card order against RFC 1034, RFC 1035, RFC 2308, RFC 8767, the Cloudflare CNAME page, and the Route 53 simple-routing page. The lesson states the contract's 12:00/12:05/86400 examples as this design's illustration, not as protocol defaults. A TTL is described as a per-copy maximum. Serve-stale reuse is allowed when a refresh fails and is not required of every resolver. SERVFAIL is not given the SOA negative-caching TTL. Multiple addresses are not described as health checks, and the Route 53 sentence about the client resending a DNS query is not taught.

Correctness: DNS `check-release` passes. Both reviewers scored 18/20, all six outcomes 2/2, no hard failures. Clarity is 3/4 on both reviews because the TTL and failure slides are dense; that wording stays because the contract requires the countdown, serve-stale permission, negative-caching TTL, and SERVFAIL limit. Playwright DNS journeys passed at three viewports, including navigation, focus return, and preserved component name.

Shared-hash refresh: API gateways passed with unchanged lesson text. Caching, queues, and load balancing needed the sentences named in their release reports. Failed rounds stay in the external archive and were not relabeled. Queues took three content revisions before both reviewers passed; the last gap was treating an invalid payload like a transient receive budget.

Complexity checklist, because `engineering-suite-ponytail:ponytail-review` is not installed: no new dependency, no new lesson framework, no unused configuration, and no feature outside DNS plus the evidence refresh. No actionable complexity findings. The `verify-system-canvas` skill was not in this checkout or the Cursor skills directory, so the DNS Playwright spec is the browser check. A DNS negative-control packet was not run; the rubric and grader were unchanged.
