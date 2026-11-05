# Key-Value Data Access Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. Keep this combined brief and review ledger concise under the user's lighter workflow.

**Goal:** Teach practical key-value data access, then ship after independent content and browser verification.

**Architecture:** Add one lesson object and a small diagram component to the existing registry/viewer. Reuse existing styles and navigation. Keep the evaluator unchanged and refresh evidence invalidated by the shared renderer registration.

**Tech Stack:** Existing TypeScript/React, JSON contracts, Vitest and Playwright.

**Spec:** The user chose Key-Value Data Access next and approved concept-first lessons with examples only where explanatory. Standing instructions authorize autonomous iteration, commit and shipment once gates pass. The order change overrides the backlog; storage and sharding are not prerequisites to build first. Define any necessary distribution terms locally.

## Scope and choices

- Foundation for Generic Database, DynamoDB, Generic Cache, Redis and Memcached. Retain existing decks/order and append this foundation; no claim of product-specific certification. Other database models keep their existing decks.
- Up to nine focused cards: model, operations, key design, query limits, concurrent changes, retries, lifetime, distributed guarantees and workload choice. Independent author settles contract before prose.
- Direct explanations; small examples for a key collision, alternate lookup or competing change only when useful. No recurring application or required example per card.
- No vendor implementation, new dependencies, new UI or evaluator/hash redesign. Guaranteed behavior must name its scope; source of truth versus cache is an explicit choice.
- Retain only actual current learner/two-reviewer reports and concise summaries in Git. Raw packets, failed attempts and browser proof remain externally archived/checksummed.

## Review focus

- Key names identify records but do not grant authorization; identity collisions and application-managed value formats need clear treatment.
- An absent result is different from a failed read; missing values do not automatically recreate durable truth.
- Conditional updates and retries protect only the operations/boundaries actually specified, never generic exactly-once or cross-key guarantees.
- TTL/eviction, replication freshness and durable acknowledgement must not be conflated or generalized across products.
- Adding the entry preserves existing component eligibility and viewer behavior; new diagrams agree with the lesson at phone/short-height sizes.

## Tasks

- [x] 1. Independently freeze the contract and verify its shape. Audit primary sources; author each card against its objective and prerequisites.
- [x] 2. Add meaningful routing tests, observe missing-entry failures, implement the lesson/diagram/registration and pass unit tests. Add a three-viewport full-deck browser journey plus other eligible entry checks and negative eligibility coverage.
- [x] 3. Export externally. Fresh cold learner and two independent reviews for the new stack; revise actual gaps. Refresh whole-stack evidence for existing decks whose renderer binding changed, without relabeling old reports. Require all current-source gates. Keep thresholds unchanged.
- [x] 4. Run app/evaluator tests/build and the verify-system-canvas skill on the new stack, cache/database entry paths and shared viewer regression. Inspect proof and teardown. Archive actual outputs and copy only current compact reports unchanged.
- [x] 5. Independent final correctness and separate installed Ponytail review; resolve findings and inspect the completed release package.

Release sequence after these gates: commit/PR, wait CI, merge under standing authorization and verify deployed bytes. Preserve final review/deployment beside the sealed archive; publication results are recorded there after the commit rather than asserted in advance.

## Review ledger

Base: 6a7b04f97eaea09853a1bff2f66d24e47f9845aa. Branch: feat/key-value-learning-stack. Reusing the clean isolated worktree; original checkout's unrelated work and the untracked local verification skill are excluded.

The shared viewer registry is part of all existing lesson hashes. Its new entry invalidates existing reports even though their content remains unchanged. Follow the current gate and refresh actual evidence; changing the hash model merely to avoid checks would expand this content task. No rubric change means the previously successful calibration remains applicable; reviewers must still audit the new topic's critical claims.

Contract frozen independently by /root/kv_contract before prose: SHA256 3556ca80631c07e6fdd6f320f2cd5650db8c00f53c8d21a62935fb15241813cb. Nine cards split retry uncertainty and lifetime. Six whole-stack questions, with all criteria explicitly asked. Author audited each objective/prerequisite and live primary sources. Diagrams are limited to identity separation and a version-checked write race.

Routing verification: observed seven missing-entry test failures before implementation. Initial implementation exposed the catalog convention that Generic Database has no technology string; fixed routing to recognize the generic database type with absent technology, without matching other generic database models. All 41 routing tests pass. No evaluator logic or shared styles changed.

New whole-stack evaluation passes at 19/20 in both independent tracks, all six outcomes 2/2 and no hard failures. Both reviewers reject the targeted separate-check/unconditional-write control (9/20 and 10/20; concurrency outcome 0), using the false claim rather than a format defect. Actual files copied unchanged after current-source gate.

Verification: 232 app tests pass; production build passes (existing bundle-size warning). The verification skill passes all 16 selected journeys: new key-value (7), existing caching (5) and component lessons (4). Inspected phone diagrams/retry text and recorded trace; doctor passed, fresh contexts, sources/controls reachable and canvas preserved. All owned listeners are stopped. Raw proof is external; the 98 evaluator tests also pass against refreshed caching evidence. All complete-stack gates and final packaging review pass.

Final: minor (deferred): `src/learn/KeyValueDiagram.tsx:2` imports shared database lesson styles although its two figures use base lesson styles. Retained under the existing diagram-module convention: the CSS is already bundled through other diagrams, so this adds no runtime payload. Deleting this one line would invalidate the passing new-stack snapshot for no user-visible benefit. Independent correctness and separate Ponytail source passes found no blocking issue; final packaging review also passes.

Final evidence: all 15 current-source gates pass against both external and retained reports; actual JSON copies byte-compared unchanged. Existing 14 snapshots differ from the prior release only in LessonDialog.tsx. All reviewer scores are 19–20, all outcomes 2 and no hard failures; new stack 19/19. Evaluator tests: 98/98. Blind negative control rejected in both tracks. No thresholds, rubric or evaluator logic changed.

Archive sealed at `/Users/danielansong/Documents/learning-eval-archives/system-canvas/2026-11-03-key-value-cfa19c0/evidence.tar.gz`, SHA256 `4ab5b982991bd740d5afdd3348119c1e8c00564325146a57150ae366cf3df989`. All 279 files byte-compared after archival; 38,084,440 compressed bytes. Current compact reports only in Git; raw artifacts external. Local verification map updated with the seven new journeys; no harness change or claim of a full skill-maintenance audit.

Final: Ruling: human-learning effectiveness remains unmeasured; the gate establishes content readiness only. Cost if misread: treating model-assisted readiness as evidence of learner improvement.
Final: Ruling: this remains a shared foundation, not vendor certification or an implemented storage/recovery protocol. Product-specific guarantees must still be checked; the lesson explicitly says so.
Final: Ruling: retain the existing viewer apart from diagram registration, with affected regression journeys verified. Unrelated behavior is outside this change and was not exhaustively re-audited.
Final: Ruling: CI, merge and deployment are required release work, not waived as outside the review. The executor owns those final checks and records actual outcomes beside the archive.

Final review complete: `/root/kv_final_review` (fresh gpt-6-astra, high) approved source and final packaging after separate correctness/Ponytail passes. It independently verified all 30 external/retained gate results, the sealed archive checksum and all 45 retained reports against archived originals. No actionable correctness or blocking complexity findings; one minor import retained as above. Final review is preserved beside the archive as `final-review.md`. CI, merge and deployed-byte verification follow under standing authorization.
