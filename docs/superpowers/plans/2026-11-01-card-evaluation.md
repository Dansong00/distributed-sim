# Card evaluation and incremental releases

Historical record: the current workflow is in `evals/lessons/README.md`; mandatory per-card sessions were superseded by the user-requested lighter loop. Referenced raw run paths were moved to the external archive documented in `evals/lessons/ARCHIVE.md`.

Approved in chat: evaluate a card using only its prefix, revise until it passes, test the complete stack, and commit/ship approved cards without asking again.

## Design

Reuse the existing five-dimension gate and report schema. A topic contract maps stable card IDs to ordered slides, objectives, earlier prerequisites, and new-scenario questions. A card packet contains only the prefix through that card and its own questions. Bind that prefix, rendering assets, eligibility, and contract to reports. Changes to a prerequisite invalidate dependent reports. Keep failed attempts immutable.

Add packet-card and check-card commands. Add check-release to require every card plus the complete stack on current source. A card may be committed after passing; publish only the currently complete, coherent stack after its integration gate. This preserves the agreed stack gate while allowing small commits. The user's shipping permission covers merge and deployment after checks.

## Tasks

- [x] Isolate prior caching/eval work from unrelated edits on current main.
- [x] Implement prefix packets and release aggregation, with failing regression tests first.
- [x] Add independently authored caching card contracts and exercise the loop.
- [x] Evaluate current caching stack and cards, preserving actual reports.
- [x] Unit/build/browser/visual verification and independent correctness/Ponytail review.
- [ ] Commit, push, merge, and verify deployment; proceed to queues/workers.

## Review log

- Existing dirty checkout preserved. Native worktree tool rejected sourceRoot because the chat is attached to the historical prototype; Git fallback at /tmp/system-canvas-card-evals, based on freshly fetched origin/main 043b9eb.
- Ported only caching, evaluation scripts/evidence/contracts, associated plans, and minimal registry/dialog/package changes. Prior calibration reports remain historical and require fresh current-source checks.
- Ruling: release coherence remains mandatory. A passing card can be committed immediately, but publication of an incomplete stack waits for the stack integration gate; shipping authorization does not waive evaluation.

- Test evidence: 17 prefix tests observed red then green; CLI export observed red then green; release integration checks missing cards and changed learner binding. A missing final card ID passed regex coercion, caught by regression then fixed with explicit nonempty-string validation. 84 gate tests now pass.
- First content attempt: both reviewers rejected card 1 for implicit first-load work and lack of concrete copy cost; reviewer B scored card 4 at 17 for compressed concurrency explanation and undefined atomic. Revised card 1 with initial lookup, memory and cache write costs; revised card 4 with explicit old-fetch/pause/refill trace and checkout consequence. Contract and thresholds unchanged. All prefixes require rerun because card 1 changed.
- Verification before revisions: 212 unit tests, production build, 7 installed-Chrome browser checks passed. Chrome required sandbox escalation to launch. Inspected mobile invalidation and desktop hit/miss screenshots. Repeat changed-card visuals after revision.
- Reviewers are two independent fresh tracks reading each card prefix in order, saving its report before reading later cards. Each learner uses a separate fresh context. They may reuse their verified primary-source findings within a track; a revision gets new reviewer tracks.
- Independent final code reviewer (gpt-6-astra, high) found one P2 in gate.mjs: full-stack contracts validated IDs but not question text/criteria. Fixed with shared validQuestions validation used by stack and card gates. Also enforced documented audience, prerequisite-list and objective shapes. Fourteen malformed-contract regressions observed red then green; full eval suite 98/98. The app unit suite remains 212/212.
- Independent Ponytail pass: No actionable complexity findings. The fix reuses one validator instead of duplicating card/stack checks.
- Ruling on reviewer exclusions: content scores/source truth belong to the two independent content tracks; those actual reports must pass the release command. Agent independence is established by fresh dispatches, not claimed from identity strings. Visual correctness is covered by browser runs and inspected desktop/mobile screenshots. Deployment readiness remains pending until remote CI/deployment checks succeed. These limits are reported rather than silently treated as code-review approval.
- Revised UI verification: 5 caching browser tests passed across 1280x900, 985x543 and 390x700; inspected revised mobile cards 1/4 and desktop hit/miss diagram. Build passed with the existing bundle-size warning.

- Second content attempt: cards 1–5 passed both reviewers. Reviewer A rejected card 6 for missing required failure scope; added an explicit local-restart versus shared-unreachable comparison. Reviewer B accepted the network cost but noted the same improvement. Both full-stack reviews were 20/20 but failed q1 because the answer omitted cache overhead despite teaching it.
- Ruling: audit the assessment rather than repeat an unasked requirement indefinitely. A fresh contract-only author independently confirmed q1 wording did not elicit its cost criterion. The audit added an explicit cost question and strengthened local/shared questions and criteria to test failure scope. No original objective, criterion, misconception or threshold was removed or weakened. Exact deltas are saved in attempt 2/CONTRACT-AUDIT.md.
- Attempt 3 packets were exported but never evaluated before that audit; retained with a superseded notice. Attempt 4 is the third evaluated revision. Cards 1–5 reuse byte-for-byte reports from attempt 2 only after matching both current hashes; fresh learners/reviewers assess cards 6–8 and whole-stack integration.
- Final card-6 UI verification: all three viewport traversal tests passed; inspected mobile local/shared card. Production build passed again. No further application code changed after this run.

- Current-source check-release passed all eight cards and the stack. Final card scores are 19–20/20 for both reviewers; stack 20/20 from each, every transfer outcome 2/2. The complete report is evals/lessons/runs/caching-card-loop-4/REPORT.md.
