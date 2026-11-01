# Learning stack evaluation implementation plan

> **For agentic workers:** Use superpowers:executing-plans for integration and independent read-only review.

**Goal:** Establish and calibrate a reusable evaluation before autonomous lesson expansion.
**Architecture:** Existing Vite loads lesson data; a local Node CLI exports hashed review packets, checks independent reports, and inventories coverage. Pure evidence checks use Node's test runner. No new dependency or external API key.
**Spec:** ../specs/2026-10-29-lesson-evaluation-design.md

## Review focus

Missing or stale evidence must fail closed. Distinct identities are not authentication. A score cannot override a factual error. Exact quotes must exist in the referenced slide. Sources must actually support claims. Negative controls must fail semantic judgment, not merely structure. Existing lesson data and runtime behavior stay intact.

## Tasks

- [x] Independent contract: freeze audience, objectives and six transfer questions without reading the existing deck.
- [x] Build evidence gate with tests first; scoped subagent reports 59 Node tests passing.
- [x] Integrate CLI, rubric, packet generation and documented autonomous workflow.
- [x] Run blind negative-control calibration and caching pilot; revise teaching or eval defects and rerun as needed.
- [x] Review correctness and separate Ponytail complexity pass; run relevant checks and save actual reports.
- [x] Record catalog backlog and the next safe autonomous action.

## Execution and review log

- Existing lesson unit and browser evidence is from the prior caching task, not a new quality evaluation.
- Work in the existing feature checkout because it contains the uncommitted lesson framework. Preserve unrelated edits; no publication or bulk commits.
- Scope question sent asynchronously: shared foundations then technology-specific stacks is the default if unanswered.
- Separate agents own the independent contract and pure evidence gate; neither edits lesson content.

- CLI packet-integrity regression initially failed, then passed after archived lesson/contract hashes were checked. Learner-binding regressions initially failed, then passed after reviews were bound to SHA256 of the exact learner response.
- Final executable checks: 64 Node tests pass; independent reviewer reran all 64 successfully. CLI exports withheld-criteria learner packets, refuses overwrites, rejects unknown lessons and detects modified archived packets.
- Blind calibration saved in evals/lessons/runs/caching-calibration-1/. Four deliberately weak variants were rejected semantically by BOTH reviewers: 8/8 negative decisions, zero false acceptances in this small set.
- Candidate Caching Fundamentals: reviewer A 19/20, reviewer B 20/20; six of six transfer outcomes 2/2 from both; no hard failures. Current-source CLI check passed with lessonHash 7757831a306dd0370e8882837fe5ef45403e7b5ae8eec0b7eff69156b16bfd08 and rubricHash 18d3ab6d55c604ebde5c150e5827ebccc1a63fa0ad4d3c6ef5afde5b41d9a85d.
- Independent code review: no actionable correctness findings. Separate engineering-suite-ponytail:ponytail-review pass: No actionable complexity findings. No dependencies added.
- Review boundaries retained: source truth, independent identity, and quotation entailment require actual reviewer judgment; these are not proven by hash/shape checks. Human learning is unmeasured. Browser evidence is from the preceding caching implementation (same current content and UI), not rerun by the code reviewer. No application source changed during this eval task.
- Source inventory: 71 component presets, nine existing stacks, 30 presets with no lesson. Shared general database coverage does not count as specialist coverage. Remaining stacks are not implemented or evaluated by this task.
- Added the quality workflow to AGENTS.md, preserving all previous content. Autonomous backlog begins with Message Queues and Background Workers, then networking/storage/data/AI foundations before named-product depth unless the user changes the pending preference.
- Local only; no commit, PR, deployment, scheduled job, or externally hosted eval service created.
