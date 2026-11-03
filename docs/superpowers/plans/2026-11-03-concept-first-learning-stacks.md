# Concept-first Learning Stacks Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. Keep this combined brief and review ledger concise; the user requested the lighter workflow.

**Goal:** Revise all 14 existing stacks so examples appear only when they help explain a concept, mechanism, trade-off or failure.

**Architecture:** Preserve the existing lesson objects, card counts, routing and renderer. Audit each card for unnecessary story setup; rewrite affected explanations and diagrams directly. Retain useful worked examples without forcing one application across a stack or across modules.

**Tech Stack:** Existing TypeScript lesson content, React diagrams, JSON quality contracts and Playwright verification.

**Spec:** The user's explicit correction in this chat, including “Revise all existing stacks,” is the binding editorial brief. Existing technical objectives remain required. This plan also records the implementation choices made under standing autonomous-work and shipping authorization.

## Global constraints and review focus

- No required example on every card, no recurring Notes/browser story as the default. A request flow can use generic client/server roles.
- Coherence comes from prerequisites, causal explanations and connected decisions. Do not replace stories with an unconnected glossary.
- Preserve technical accuracy, safety limits, transfer coverage, existing card counts and >=18/20 gates. Example labels are not learning objectives.
- Introduce no dependencies, renderer redesign or simulator. Keep raw attempts and browser proof outside Git; compact current reports only.
- Review: diagrams must match revised text; examples must clarify rather than decorate; definitions must precede use; conceptual explanations must support unfamiliar transfer scenarios; no removal of failure/consistency/privacy caveats.

## Tasks

- [x] 1. Freeze independent contracts: generalize framing in six existing contracts without removing technical requirements; add contracts for the eight older stacks using their existing outlines. Update rubric/guidance to assess conceptual coherence and useful examples rather than mandatory story continuity. Recalibrate the changed rubric with existing blind caching controls.
- [x] 2. Audit and revise all 14 lessons and their diagrams. Preserve card count and routing; record material editorial choices below. Add source references to previously unsourced substantive cards where needed. No tests that merely assert forbidden words.
- [x] 3. Export current packets externally; fresh learner per stack/control and two independent reviewers; iterate only actual gaps. Require all current-source gates, unchanged score thresholds and technical criteria. Add CI checks for newly evaluated existing stacks.
- [x] 4. Run app/evaluator tests and production build. Use verify-system-canvas for all changed lesson families, inspect representative screenshots and traces, confirm teardown. Adapt text-dependent tests only for deliberate editorial changes; add a meaningful journey only where an existing deck lacks coverage.
- [x] 5. Preserve actual outputs as compact JSON; archive full attempts and browser proof with checksum/byte verification. Independent correctness and separate installed Ponytail review; resolve actionable findings. Prepare the authorized release; commit, PR, CI, merge and deployed-byte verification are recorded after this review in the archive sidecars.

## Review ledger

Base: de77e3a4ef3cc8f813a3e032c1bc32d78e49ea08. Isolated branch: feat/concept-first-learning-stacks. Original unrelated work and local verification skill remain outside the commit.

The eight older stacks had no content contracts. They need independently frozen contracts and current evidence for this revision; this is validation of existing coverage, not new lesson scope. Existing five-card and eight/nine-card layouts remain intact.

Independent contracts frozen before prose: /root/concept_contract_foundations (four), /root/concept_contract_databases (four), /root/concept_contract_existing (six audited; only three framing changes). Full checksums retained externally in checks/frozen-contracts.json. Existing technical criteria preserved; older stacks receive their first contracts. Rubric version 2 preserves all thresholds and replaces mandatory scenario continuity with prerequisite/causal/decision connections. Recalibration passed: both independent reviewers accepted the current caching candidate and rejected all four negative controls for semantic failures, including the false freshness guarantee.

Editorial pass: removed recurring Notes story and decorative setup. Kept focused cache-race, queue-ordering, HTTP age arithmetic, DNS TTL, CAP split and database concurrency/index demonstrations. PostgreSQL introductory/design cards now explain concepts directly. SQLite/MySQL/replication mostly retained direct structure, with definitions and boundary clarifications required by the independent contracts. Unnecessary introductory order diagrams and repeated API trade-off illustration removed; other diagrams aligned with revised prose. All original card counts/routing preserved.

Initial checks: 224 app tests pass. Full-stack learners are fresh isolated sessions reading only their assigned inputs. Raw work root: /tmp/concept-first-eval-20261103; current topic-to-case mapping in release-cases.json. Reviewers assess rubric v2 and all objectives, including example usefulness. CI now includes all fourteen topic gates. Browser coverage updated to visit shared database decks once per viewport, retaining every product deck, and to check both client/server and API cards at three sizes; screenshot evidence uses per-run paths.

Review finding (CAP): /root/concept_review_foundations_a identified that the final transfer criterion asks what CAP does not determine about normal-operation capacity/cost, but prose covered only latency and partition scope. The learner explicitly reported the missing cost explanation. Fixed with one sentence on card 9; original attempt q04 retained externally. New attempt q04-r2 requires a fresh learner and two current reviews, with the same frozen contract and thresholds. Rerun the affected CAP browser path and final build after content revisions settle.

Review findings (SQLite/MySQL): /root/concept_review_foundations_a found omitted storage reliability in SQLite durability and an undefined join in MySQL. Added one short definition/boundary to each; original q07/q08 attempts preserved. Fresh q07-r2/q08-r2 learners and reviews required under unchanged contracts. Final app tests/build and all nine database browser journeys rerun because CAP, SQLite and MySQL changed.

SQLite follow-up: reviewer /root/concept_review_revisions_a found foreign keys named without defining valid references or checking enforcement. Accepted and clarified card 3; card 4 now explains delayed storage flushing without using WAL/synchronous terminology before introduction. q07-r2 preserved; q07-r3 gets a fresh learner and two independent reviewers. This is the second content revision, with criteria/thresholds unchanged. The reviewer also initially marked an answer-local omission despite support elsewhere in the learner response; asked them to distinguish whole-stack evidence, and they corrected that outcome themselves before finalizing.

Verification: initial all-topic run passed 37/37; current database refresh passed 9/9 after CAP/SQLite/MySQL changes, with SQLite subsequently requiring its three-viewport refresh after the foreign-key edit. Both doctors passed, screenshots and PostgreSQL phone trace inspected, no listener remained. One Chrome launch-permission failure before doctor was preserved and successfully rerun with permitted launch. App tests 224/224, evaluator tests 98/98, production build passed; final SQLite content build/affected journey refresh remains.

Replication finding: reviewer B distinguished leader-side write ordering (already taught) from ordered replica application (missing). Added one causal sentence on preserving required source order and the older-value hazard. Original q05 evidence retained; q05-r2 requires a fresh learner and two fresh independent case reviewers. Unchanged contract and threshold.

Final content results: all fourteen stacks have two passing independent reviews (19–20/20, every outcome 2/2, no hard failures, disagreement <=1). Current frozen contracts are unchanged byte-for-byte. Replication reviewers accepted equivalent whole-stack support for single-leader write capacity and connection redirection rather than requiring a preferred phrase. No scope or threshold change was made. Final app tests 224/224 and build passed; 98 evaluator tests passed. The final SQLite and replication targeted browser refreshes passed three journeys each, doctors passed, screenshots inspected, and port 5187 was clear.

Final whole-branch review: /root/concept_final_review (independent fresh session) reviewed correctness/spec and separately applied the installed engineering-suite-ponytail:ponytail-review skill. No actionable correctness findings; No actionable complexity findings; no declined-to-judge items. Independently reran all14 retained current-source gates, compared all42 actual reports, verified frozen contracts and archive metadata. Full report and independent gate results are preserved beside the sealed archive. All local release gates are complete. Publication/deployment runs follow this commit under standing authorization and are recorded in deployment.json beside that archive.
