# Caching evaluation pilot

This is a small content-readiness calibration, not a measurement of human learning.

| Candidate | Reviewer A | Reviewer B | Decision |
|---|---:|---:|---|
| Current Caching Fundamentals | 19/20 | 20/20 | Pass |
| False freshness guarantee | 11/20 | 13/20 | Reject |
| Glossary without mechanisms | 6/20 | 5/20 | Reject |
| Unexplained jargon | 3/20 | 4/20 | Reject |
| Polished unrelated prose | 3/20 | 3/20 | Reject |

Both reviewers accepted all six current-stack transfer outcomes and found no hard failures. Both rejected every negative for semantic reasons. Formatting or missing-evidence failures were not counted as successful semantic detection. The reviewers used separate contexts from the author and learner and did not see control identities or each other's scores.

The current stack passed the live-source check, not only archived replay. Its prior unit/build/browser validation remains separate. No application code changed in the evaluation task.

## Reproduce the current-content decision

From the repository root:

```sh
npm run test:lesson-eval
npm run eval:lessons -- check caching evals/lessons/runs/caching-calibration-1/case-42/learner.json evals/lessons/runs/caching-calibration-1/case-42/review-a.json evals/lessons/runs/caching-calibration-1/case-42/review-b.json
```

For a negative control, use `check-packet` with that case's packet and reports. A nonzero exit is expected. `summary.json` retains all control labels, scores, semantic decisions, and gate failure reasons. Each case folder contains its actual packet, cold-reader answers, and both independent reviews.

## Limits and next use

Four negatives and one passing candidate from one topic are a starting calibration. Both reviewers use the same model family. Stronger claims require more topics, subtler negative controls, and eventually actual learner feedback. The command validates saved evidence; the documented agent workflow performs the cold-reader and reviewer tasks. It does not secretly call a hosted model API or schedule background work.

The eight other existing stacks have not passed this new eval. The autonomous backlog starts with messaging/worker foundations. Future topics need their own independently frozen contracts and negative controls, not copied caching questions.
