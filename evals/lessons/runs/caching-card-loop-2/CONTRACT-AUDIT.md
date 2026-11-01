# Assessment-contract audit

Read only the supplied caching contract. No lesson, attempt, review, or source inspection informed this audit.

Changes are justified in three questions. All existing objectives, criteria, and critical misconceptions are preserved verbatim. No thresholds or outcomes are relaxed.

## Exact deltas

- **Stack `q1-station-guides`, question:** Insert immediately before `You do not need to calculate an average latency.`: `Explain what work and cost remain on a miss and what extra operations the cache adds.`
  **Criteria:** No change. The final existing criterion requires recognizing miss work and cache-operation cost, but the original question asks only why caching helps, its key, its flow, and its actor. The addition makes that cost requirement explicit without giving the answer.
- **Stack `q4-event-room-map`, question:** Insert immediately before the final assumptions sentence: `Explain where local and shared lookups happen. Compare which instances lose cache access if one local cache is lost versus if the shared cache is unreachable.`
  **Criteria:** Append: `Explains that losing one independent local cache leaves the other instances' local copies accessible, whereas an unreachable shared cache removes cache access for every instance using it; losing cache access does not by itself establish whether application requests fail.`
- **Card `local-and-shared` / `card-6-museum-audio`, question:** Append: `Explain where local and shared lookups happen. Compare which instances lose cache access if one local cache is lost versus if the shared cache is unreachable.`
  **Criteria:** Append the same failure-comparison criterion used for stack q4, verbatim.

The local/shared objective explicitly requires copy visibility, network access/cost, and failure consequences. Originally, both corresponding questions and criteria permitted a network-latency answer to substitute for failure reasoning. The added comparison tests the previously optional failure dimension. Asking where lookups occur also directly elicits the existing local-versus-network criterion. The distinction concerns cache access, so it does not falsely assume a cache outage necessarily takes down the API. The original cost-or-failure criterion remains unchanged.

## Remaining coverage

The remaining stack and card questions provide enough scenario constraints and explicit requests to elicit their criteria. In particular, explaining a stale refill elicits why the fetched value remains old; tracing eviction before TTL elapses elicits that TTL does not guarantee residency; and source-of-truth wording in card 3 already supplies the cache-copy relationship. Those checks do not require extra recitation questions. Stack freshness requirements are exercised in q2 and card-level decision freshness is explicitly exercised in card 8. No other contract edits are warranted from this contract-only audit.
