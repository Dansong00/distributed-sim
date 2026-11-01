# First card-level attempt: rejected

This retrofits the previously calibrated caching stack with independently authored card contracts. The contract author read the existing topic contract but not the deck. Eight fresh learners received only their target prefix. Two separate reviewer sessions assessed prefixes in order and saved each result before opening the next; each then assessed a fresh whole-stack learner.

| Card | Reviewer A | Reviewer B | Gate |
|---|---:|---:|---|
| Why cache | 16 | 14 | Fail |
| Hits and misses | 19 | 19 | Pass |
| Cache-aside and keys | 20 | 19 | Pass |
| Invalidation and old fills | 18 | 17 | Fail |
| TTL and eviction | 19 | 19 | Pass |
| Local and shared | 19 | 18 | Pass |
| Stampede and outage | 19 | 19 | Pass |
| Cache or not | 19 | 19 | Pass |
| Whole stack | 18 | 18 | Fail: one transfer outcome incomplete |

Both reviewers found that card 1 left the initial read and concrete copy costs implicit. One reviewer found card 4's explanation too compressed, with “atomic” undefined and little rationale for the freshness-sensitive choice. The whole-stack learner did not explicitly identify the added cache-operation cost in its first answer, which one reviewer scored as partial. The author accepted these findings and revised cards 1 and 4. Contracts and thresholds were not changed.

The second attempt reruns every prefix because card 1 changed, plus the complete stack. These original packets and reports remain immutable. `summary.json` is an archived reproduction, not current-source approval. The reviewers checked all four primary-source URLs; no material false guarantee was found.

This shows the new loop detecting specific teaching gaps. It does not measure human learning or establish reliability beyond this topic/model family.
