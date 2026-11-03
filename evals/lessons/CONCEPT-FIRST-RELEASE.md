# Concept-first revision — 2026-11-03

Historical record of the editorial release. The unchanged lessons received fresh bound reports when the key-value diagram was registered in the shared viewer; see [the current release](releases/key-value/REPORT.md).

All 14 existing stacks now explain connected concepts directly. Examples remain where they clarify a mechanism, distinction, trade-off or failure; a recurring application is optional. Card counts, component eligibility and renderer are unchanged.

Eight older stacks received their first independently frozen contracts. The existing six retained their technical criteria; only application-specific framing changed in three. Rubric version 2 removes mandatory scenario continuity without changing thresholds (18/20, every dimension at least 3, every outcome 2, no hard failures, score disagreement at most 1). Contracts were frozen before prose; original checksums are archived.

| Stack | Independent review scores /20 |
| --- | --- |
| client-server | 20 / 20 |
| api-server | 20 / 20 |
| databases | 19 / 19 |
| cap | 20 / 20 |
| replication | 20 / 19 |
| postgresql | 19 / 19 |
| sqlite | 19 / 20 |
| mysql | 19 / 19 |
| caching | 20 / 20 |
| queues | 20 / 20 |
| load-balancing | 20 / 20 |
| api-gateways | 20 / 20 |
| dns | 20 / 20 |
| cdn-http-caching | 20 / 20 |

All fourteen current-source gates pass using the adjacent retained learner/two-reviewer files, copied unchanged. CI rebuilds packets from source and requires all fourteen gates, without downloading archives. Fresh learner sessions saw only their assigned lesson/questions; reviewers saw actual responses and checked primary sources and diagram semantics.

Calibration accepted current caching in both tracks and rejected all four existing weak controls: glossary, jargon, irrelevant prose and a false freshness guarantee. This checks the changed rubric on one topic; it does not establish universal evaluator reliability or measured human learning.

## Verification and revisions

224 application tests and 98 evaluator tests passed; production build passed with the existing chunk-size warning. All 37 browser journeys passed across eight suites, traversing every deck at desktop, short-height and phone sizes. A nine-journey database refresh followed CAP/SQLite/MySQL fixes; final SQLite and replication three-viewport refreshes also passed. Doctors, traces, screenshots, scroll-reachable source links/controls, bounded navigation, focus/reopen behavior and preserved canvas state were checked. One Chrome launch-permission failure occurred before doctor/journeys and was preserved; the permitted rerun passed. All owned servers were stopped.

CAP gained the missing capacity/cost limitation; SQLite gained reliable-storage and foreign-key enforcement explanations, with premature configuration shorthand removed; MySQL gained a join definition; Replication made ordered application explicit. Failed attempts remain archived and thresholds were not changed. See the [implementation/review ledger](../../docs/superpowers/plans/2026-11-03-concept-first-learning-stacks.md) for final correctness/complexity review and dispositions.

## External evidence

- Archive: `/Users/danielansong/Documents/learning-eval-archives/system-canvas/2026-11-03-concept-first-3c0387f/evidence.tar.gz`
- SHA-256: `b6008652dce250f5d593b1e6936fa28939d244e136bed66551aefa7d342a6242`
- 1381 files; 261,236,474 compressed bytes. Every archived file byte-compared with its source after writing.

Includes packets, actual current and failed responses/reviews, blind controls/key, gate logs, frozen-contract checksums and browser proof. Current compact reports remain in Git; generated packets and browser artifacts do not. Session provenance is recorded in the chat; identities/hashes alone do not prove reviewer independence. Deployment/final review records may be stored beside the sealed archive.
