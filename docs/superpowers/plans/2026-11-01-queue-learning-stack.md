# Message Queues and Background Workers

Build the next shared stack using the independently frozen contract in evals/lessons/contracts/queues.json. The user confirmed PR #21 merged; its lighter workflow is now the base. No new evaluation framework or copied packets in Git.

## Design

Eight cards follow a receipt job: acceptance/completion, producer/broker/worker, redelivery/idempotency, bounded retries, ordering, overload, work queue versus retained log, and choosing the request boundary. Reuse existing layout styles with a handoff diagram and queue/log comparison. Offer the stack on Generic Queue, Kafka, RabbitMQ and SQS; Worker keeps Client / Server Model first, then this stack. Other server/client and database/cache routing stays unchanged.

## Checks

- [x] Routing tests observed red then green; author content and diagrams from primary sources.
- [x] One blind whole-stack learner and two reviewers; a plausible false-acknowledgement negative control for this new topic. Keep actual attempts outside Git and only current passing reports inside.
- [x] Refresh caching evidence because adding a renderer registration changes its bound shared LessonDialog source. Do not relabel old report hashes.
- [x] App/evaluator tests and build, one verification-skill run for queues and existing lessons; inspect responsive diagrams and long cards.
- [x] Independent correctness and separate Ponytail review.
- [ ] Focused commit/PR and CI.

## Decisions and evidence

The original queue contract was independently written before the deck and is unchanged. All required outcomes stay in scope, including an atomic duplicate-safe database effect and external-effect limits. The task is a learning stack, not a broker implementation or traffic simulator.

Ruling: preserve the existing conservative rendering hash rather than refactor the lesson architecture during a content task. Refresh the affected caching whole-stack reports once; no per-card sessions. This costs an extra evaluation but preserves the current-source gate without exceptions.

Author check: all eight card objectives and prerequisite order are covered. Added an explicit definition of partition before semantic review; the initial cold-reader artifact is superseded and remains external. Card 4 links the retry policy reference; the linked competing-consumers and load-leveling references also cover terminal isolation. Routing observed 7 failures before implementation and 26 passing afterward. App suite: 217 tests; production build passed with the existing bundle-size warning.

Final content: q8 and refreshed caching c3 passed current-source gates, two reviewers 20/20 each and all outcomes 2/2. Control m4 rejected 11/20 and 9/20 for false commit-before-ack guarantees and absent atomic duplicate protection. No rubric/contract thresholds changed. Evaluator tests: 98 passed.

Verification skill: one run at isolated port 5188, doctor ready, 23/23 lesson checks passed, 23 traces retained, screenshots/phone trace inspected, port 5188 clear afterward. Existing unrelated 5187 listener left untouched. New queue tests cover all five eligible presets and eight cards at desktop, short-height and phone sizes. Long text scrolls with sticky navigation and reachable source links. External evidence: releases/queues/REPORT.md records archive/checksum; 103 archived files byte-checked.

## Review log

Independent reviewer `/root/queue_code_review` inspected application integration, contract alignment, sources, tests and gates: no actionable correctness findings. Separate installed Ponytail pass: No actionable complexity findings. Retained existing layout classes and direct lesson registration; no dependencies, framework changes or generic test abstraction. Final archive/docs review completed: reviewer independently matched all six retained reports to originals, verified all 103 archived files and the checksum, and inspected UI results, traces and phone screenshots. Ready for commit/PR/CI.

Review boundaries: source/evidence checks establish this snapshot, not human learning, cross-browser compatibility, product-specific broker guarantees or live deployment. Those are not claimed by the release.
