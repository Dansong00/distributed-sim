# Learning stack evaluation design

Historical record: the current workflow is in `evals/lessons/README.md`; mandatory per-card sessions were superseded by the user-requested lighter loop. Referenced raw run paths were moved to the external archive documented in `evals/lessons/ARCHIVE.md`.

The user authorized autonomous completion of the remaining learning stacks, with an evaluation and revision loop established first. Start with a calibrated caching pilot. A report measures content readiness under this rubric, not demonstrated human learning.

## Choice

Use a small local CLI with existing Node/Vite dependencies, a frozen topic contract, a cold-reader task, and two independent reviewers. A checklist alone cannot judge causal explanations. An LLM score alone can reward confident prose and let the author grade itself. Combining executable evidence validation with independent judgment addresses both weaknesses without adding a hosted evaluation service or credentials.

## Contract

Before authoring, record audience, prerequisites, learning objectives, transfer questions, answer criteria, and critical misconceptions. Someone other than the lesson author creates this contract. Freeze it and the rubric by hash. The learner sees only the lesson and question text, not criteria, reviewer scores, or control labels. It must answer from the supplied material and quote slide evidence, reporting missing teaching rather than filling gaps from outside knowledge.

Two fresh reviewers grade accuracy, mechanisms, coherence, decisions, and clarity on anchored 0-4 scales. Each must score every dimension at least 3 and total at least 18/20. Every transfer question must receive 2/2 from both. Any material factual error, misleading guarantee, missing prerequisite, or unsupported critical claim vetoes a pass. Reviewers verify source support; an HTTP link alone is not evidence. Scores differing by more than one point fail pending resolution.

The CLI checks exact current lesson/rubric hashes, distinct reviewer identities, complete outcomes, exact slide quotations, source attestations, score ranges, thresholds, and hard-failure vetoes. This validates evidence shape and freshness; it cannot authenticate agent identities or mechanically prove entailment or source truth. The orchestrating agent is responsible for dispatching separate reviewers and preserving their actual outputs.

## Test the evaluator

Create anonymous variants of the same stack: original, glossary-only, a plausible false guarantee, unexplained jargon, and polished irrelevant prose. Preserve superficial length and source structure so semantic rejection cannot be credited to formatting alone. Grade blindly. Every negative control must be rejected by both reviewers. The original is a candidate, not a pre-certified positive. Revise the candidate when its evaluation identifies teaching gaps, freeze a new snapshot, and rerun. Record all runs rather than overwriting failures.

## Completion gate and autonomy

A content pass is necessary but not sufficient to finish a stack. Run the unit suite, build, and lesson browser checks; visually inspect diagrams and long cards. Preserve diagram data, selection, viewport, focus, and undo behavior. Record the commands and review evidence. New content is local only unless publication is separately requested.

Iterate until the topic passes. After three unsuccessful revisions, investigate whether the lesson or the evaluation is at fault; record the blocker and do not advance until it is resolved. Never lower the threshold, remove a test, silently change criteria, accept a missing report, or waive a factual error to proceed. Contract changes require a versioned rationale and invalidate old reports. Ask the user only for scope or learning-goal decisions that cannot be inferred.

## Initial scope

Deliver CLI, reusable rubric/playbook, caching contract, calibrated blind-control results, and a passed-or-explicitly-failed caching pilot. Inventory the existing component catalog and lesson coverage. Use the validated gate for subsequent stacks, shared foundations before product-specific detail unless the user chooses otherwise. No runtime quizzes, progress tracking, learner telemetry, simulation, or new app framework.
