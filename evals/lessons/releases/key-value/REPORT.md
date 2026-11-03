# Key-Value Data Access release evidence

Nine concept-first cards cover the access model, basic operations, key/value design, queries beyond a key, concurrent updates, uncertain retries, lifetime, distributed guarantees and workload fit. Two diagrams clarify identity separation and atomic version checking. Generic Database, DynamoDB, Generic Cache, Redis and Memcached expose the new foundation after their existing decks; this is not product-specific certification.

Contract independently frozen before prose by `/root/kv_contract`, SHA-256 `3556ca80631c07e6fdd6f320f2cd5650db8c00f53c8d21a62935fb15241813cb`. Fresh learner `/root/kv_learner_32`; independent reviewers `/root/kv_review_new_a` and `/root/kv_review_new_b`. Both score **19/20**, every transfer outcome 2/2, no hard failures. Reviewers assessed every card objective, diagram meaning and linked primary source. The adjacent three JSON files are byte-identical copies of the finalized actual outputs.

```sh
npm run eval:lessons -- check-release key-value evals/lessons/releases/key-value
```

Current-source gate passes. Lesson hash: `1f662886be86b067677e8babe52bec7445cccd772120cb53525efdc57253c828`. Rubric/contract hash: `b88ec72c23f775952ec2b1eb7d9e082ce7ffd4fec45807af1a90844d6afeab29`.

Both review tracks rejected a targeted blind control that claimed a separate version check followed by an unconditional write prevents lost updates: scores 9/20 and 10/20, concurrency outcome 0, false claim explicitly identified. No rubric, threshold or evaluator logic changed. This supports content readiness, not demonstrated human learning or universal evaluator reliability.

## Shared-renderer refresh

Registering the new diagram changes `LessonDialog.tsx`, which is bound into every lesson hash. All fourteen existing lessons, diagrams, eligibility mappings, contracts and rubric are unchanged; only that shared asset differs. Fresh learners and two independent reviewer sessions refreshed all fourteen actual reports; all fifteen current-source gates pass from both external and retained evidence. CI requires each gate without downloading archives. Previous evidence remains in Git history and the [editorial archive](../../CONCEPT-FIRST-RELEASE.md).


| Stack | Review scores /20 |
| --- | --- |
| key-value | 19 / 19 |
| client-server | 20 / 20 |
| api-server | 20 / 20 |
| databases | 19 / 20 |
| cap | 20 / 20 |
| replication | 20 / 20 |
| postgresql | 19 / 19 |
| sqlite | 20 / 19 |
| mysql | 20 / 19 |
| caching | 20 / 20 |
| queues | 20 / 20 |
| load-balancing | 20 / 20 |
| api-gateways | 20 / 20 |
| dns | 20 / 20 |
| cdn-http-caching | 20 / 19 |

## Verification

232 app tests pass, including routing tests observed failing before implementation. The production build passes with its existing bundle-size warning. All 98 evaluator tests pass against the refreshed current reports.

The `verify-system-canvas` skill passed 16 browser journeys: seven key-value checks, five caching regressions and four component-lesson checks. The nine-card deck is traversed at desktop, short-height and phone sizes; all five eligible component entries are checked. Proof verifies source/control reachability, no horizontal overflow, bounded navigation, keyboard isolation, focus/reopen behavior and preserved canvas state. Phone diagrams/retry text and the recorded trace were visually inspected. Doctor passed; all owned listeners and temporary browser tabs were closed.

Independent final correctness and separate installed Ponytail review are recorded in the [implementation/review ledger](../../../../docs/superpowers/plans/2026-11-03-key-value-learning-stack.md). Raw packets, controls, screenshots and traces remain outside Git; CI requires only source and the compact passing reports.

## External archive

- Archive: `/Users/danielansong/Documents/learning-eval-archives/system-canvas/2026-11-03-key-value-cfa19c0/evidence.tar.gz`
- SHA-256: `4ab5b982991bd740d5afdd3348119c1e8c00564325146a57150ae366cf3df989`
- 279 files; 38,084,440 compressed bytes. Every archived file byte-compared against its source.

Includes frozen contract notes, packets, actual learner/reviewer outputs, blind control and key, gate/test logs, source-comparison proof and browser artifacts. Final code review and deployment records are stored beside the sealed archive. Previous evidence remains recoverable from Git history and the linked editorial archive.
