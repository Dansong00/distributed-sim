# Message Queues and Background Workers release evidence

Eight connected cards cover the independently frozen queue contract. Generic Queue, Kafka, RabbitMQ and SQS expose this shared stack; Worker retains Client / Server Model first. This is foundation teaching, not product-specific broker certification.

Current-source `check-release queues evals/lessons/releases/queues` passes. Fresh learner `/root/queue_cold_q8` answered all six transfer scenarios; independent reviewers `/root/queue_review_a` and `/root/queue_review_b` each scored 20/20, every outcome 2/2, and no hard failures. They assessed all card objectives, diagram meaning and linked primary sources. The three adjacent JSON files are their unchanged outputs from external case `q8`; there are no independent per-card certifications.

The initial draft `q7` was superseded after an author check added the partition definition and corrected the retry reference. Blind control `m4`, based on that draft, falsely claimed commit-before-ack guarantees exactly-once effects and removes the need for atomic duplicate protection. Both reviewers rejected those semantic errors (11/20 and 9/20); the archived-packet gate failed as expected. This one control is a limited topic calibration, not proof of evaluator reliability or human learning.

Validation: 217 app tests, 98 evaluator tests and production build passed. One `verify-system-canvas` run passed 23 lesson journeys, including seven new queue/worker checks and 16 existing checks. Queue cards were exercised at 1280×900, 985×543 and 390×700. Inspected diagrams, the long idempotency card, navigation and preserved canvas state. Startup doctor passed; all 23 traces remain in the archive; owned port 5188 was clear after teardown. Port 5187 already had an unrelated listener and was left alone. Coverage is installed Chrome, not a cross-browser matrix.

Reproduce the content gate without external files:

```sh
npm run test:lesson-eval
npm run eval:lessons -- check-release queues evals/lessons/releases/queues
```

Full attempts, control, check logs and browser proof are preserved in `/Users/danielansong/Documents/learning-eval-archives/system-canvas/2026-11-01-queues-a87bbd7/evidence.tar.gz` (103 files, all byte-checked against their originals). SHA-256: `b5c7fa50dec2c6304657d1cf6c07d2b7d82bd2c834ae21fe1d7c3212170d77cf`. Archive roots are `queue-stack-eval-20261101/` and `system-canvas-verify.yjS9Cg/`. CI needs only tracked reports and current source; hashes detect stale evidence but do not authenticate reviewers or prove their reasoning.
