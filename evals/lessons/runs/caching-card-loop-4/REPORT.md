# Caching release evaluation: passed

The current-source `check-release caching evals/lessons/runs/caching-card-loop-4` command passes every card and the complete stack. See summary.json for the machine result and each directory for the exact packet, learner response and independent reviews.

| Evaluation | Reviewer A | Reviewer B | Transfer outcomes |
|---|---:|---:|---|
| Why cache | 20/20 | 20/20 | Pass |
| Hits and misses | 19/20 | 19/20 | Pass |
| Cache-aside and keys | 20/20 | 20/20 | Pass |
| Invalidation and old fills | 19/20 | 19/20 | Pass |
| TTL and eviction | 19/20 | 19/20 | Pass |
| Local and shared | 20/20 | 20/20 | Pass |
| Stampede and outage | 20/20 | 20/20 | Pass |
| Cache or not | 20/20 | 20/20 | Pass |
| Complete stack | 20/20 | 20/20 | All six 2/2, both reviewers |

## What the loop changed

- Card 1 now explains that the first read still performs the source lookup and that keeping a copy costs memory and a cache write.
- Card 4 traces the actual old-read, pause, deletion and stale-refill order in plain language, and connects source validation to avoiding the wrong checkout price.
- Card 6 compares losing one local process's copy with every client losing access to an unreachable shared cache.
- A separate contract-only audit clarified an unasked cost criterion and strengthened the local/shared failure comparison. All original objectives, criteria and misconceptions were retained; score thresholds were unchanged. Exact deltas remain in attempt 2/CONTRACT-AUDIT.md.

## Evidence provenance

Cards 1–5 reuse unchanged reports from attempt 2 only after verifying both current hashes match. Changes were confined to later teaching and assessment, so those prefix approvals remain valid. Cards 6–8 and the full stack have fresh learner sessions and two new independent reviewer tracks. Each reviewer saved a prefix assessment before reading a later packet and checked linked primary sources. The source checks can be reused within that reviewer track; the tracks do not share reports.

Attempts 1 and 2 remain failed evidence. Attempt 3 was an unevaluated export superseded by the independent contract audit. This is the third evaluated candidate, stored under export directory 4. No earlier response or review was rewritten to carry a new hash.

## Release checks

- 98 executable evaluation regression tests.
- 212 app unit tests.
- Production build for `/distributed-sim/`.
- Seven focused browser tests initially passed. After content revisions, all affected desktop/mobile traversals passed again at 1280x900, 985x543 and 390x700; screenshots of the diagrams and revised cards were inspected.
- Independent code review and separate Ponytail pass. One malformed-contract validation finding was fixed with failing-then-passing tests. No actionable complexity findings.
- CI runs unit tests, evaluation tests, the current-source release evidence check and production build before Pages publication. The pull request and Actions deployment record provide the release commit and remote status.

## Limits

This evaluates supported reasoning and content readiness, not human learning. Reviewers are independent sessions from one model family, and grading variation occurred. Hashes and identity fields do not authenticate sources or establish semantic entailment. Calibration is still one topic, including the original four deliberately weak controls. The browser checks use Chrome, not a cross-browser matrix. The build retains its existing bundle-size warning.
