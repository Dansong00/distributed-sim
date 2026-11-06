# Shared File Storage implementation plan

**Goal:** Teach a shared file-storage foundation through Generic File Storage and Amazon EFS, then ship after the established content and UI gates.
**Architecture:** One lesson, focused diagrams using existing styles, component-type routing and existing dialog registration. No new dependencies, evaluator features or unrelated content changes.
**Tech stack:** Existing React, TypeScript, Vitest, Playwright and local lesson evaluator.
**Spec:** Independently frozen `evals/lessons/contracts/shared-file-storage.json`, authored before lesson prose.

## Scope and constraints

Teach file operations and mounting, cache/coordination boundaries, identity and permissions, network and durability failures, recovery, performance and workload choice. Product details illustrate bounded claims; no full EFS administration course. Use concrete examples only where they clarify a mechanism. A recurring story is not required.

User has authorized autonomous execution and shipment after the same lighter loop. Keep one compact plan/review ledger, required current reports in Git and raw packets/browser proof in a checksummed external archive. Existing isolated checkout `/tmp/system-canvas-block-storage` is reused on `feat/shared-file-storage-learning-stack`; base `ed6891187f30b32d89864e9f62f2c6c9bae51772`. Original developer checkout remains untouched. No existing file-storage branch or implementation PR was found.

## Review focus

- Missing/renamed technology and non-component nodes: route by component type after the kind guard.
- Client caches and advisory locks: no automatic transaction or latest-read guarantee.
- Mount access versus file authorization: do not imply matching usernames or network access are sufficient.
- Completion, outages and backups: distinguish durable data, current reachability and recoverable historical state.
- Phone/short viewports and keyboard dismissal: readable cards and intact canvas state.

## Tasks

- [x] Freeze independent contract; add routing regression and observe failure; implement `shared-file-storage.ts`, `SharedFileStorageDiagram.tsx`, registry/dialog and CI gate. Run routing/app tests and production build.
- [x] Export whole stack outside Git; fresh learner and two independent reviewers assess every objective and linked primary source. Resolve gaps until current-source gate passes. Refresh evidence affected by shared renderer registration without changing existing lessons or relabeling reports.
- [x] Add `tests/shared-file-storage-lessons.spec.ts`; run new, block-storage and component journeys through verify-system-canvas once. Inspect screenshots/trace and teardown. Run evaluator tests.
- [x] Preserve exact current reports, concise summaries and sealed external archive. Independent final correctness and separate installed Ponytail review; resolve actionable findings.
- [ ] Commit, PR, passing CI, merge and deployed-byte match. Record post-merge results beside sealed archive.

## Review ledger

Baseline: 234 application tests passed on current main before edits. Existing source and evaluator interfaces reused. Native inline execution follows the established lighter loop; per-card independent sessions are reserved for a diagnosed gap. Diagram registration changes the shared renderer hash, so affected stacks require fresh bound evidence.

Contract frozen by `/root/file_contract`: SHA256 `dd461deb864c6becdff2f8e7d9d0c0eb28312866b23cbc201a11a8a38bac6401`, nine cards and six transfer questions. Exact copy retained before prose. Routing regression observed 1 failure/43 passes, then all 235 app tests passed with the implementation. Production repository-base build passed. Candidate case-46 hash `c94ff7fc513debc6c18a5c081d619a4ee448b0a9e6dba472681e04bb5fde82e6`. Author checked each objective and primary sources; no unresolved drafting gaps.

Initial semantic reviews: A 20/20, B 19/20, all outcomes 2/2, no hard failures. First gate rejected supplementary source URL rows because each sourceChecks.url must exactly match its slide source. Actual supplementary browsing is retained in claim prose; reviewers correct their own output format, with original reports archived under checks/initial-report-format. The browser command was accidentally sequenced after this failed structural gate without shell failure gating; it runs against unchanged semantically reviewed source. Preserve this order and the run; do not infer a gate pass or rerun unaffected UI merely to hide it.

Corrected candidate current-source gate passes. Both blinded control reports reject false automatic coordination/advisory enforcement with semantic hard failures. Browser first attempt stopped before doctor at Chrome SIGABRT inside sandbox; preserved uKqIUq proof. Approved outside-sandbox run eLwdwq passed all 12 journeys in 36.2s, doctor ready, no failed/retried tests. Phone diagrams 2/4 and short-screen completion text inspected; phone card 4 trace action/AX/screenshot inspected. Owned server/viewer stopped and temporary tab closed.

Evidence scope: source comparison confirms all 17 prior lessons, own diagrams, eligibility, contracts and rubric are unchanged; only the shared LessonDialog asset differs. Fresh separate learners are being evaluated by two independent reviewer sessions. Reviewers compactly serialized their own outputs with parsed judgments unchanged; the parent retains exact bytes. Candidate clarity B3/4 reflects density on card 3, not a missing outcome or required content correction. No source edits after evaluation export/build/browser proof.

All 18 current candidate learners completed in fresh sessions; exact-quote and hash audit passes. Two independent content reviewer tracks continue through the17 affected existing stacks. Separate final correctness/Ponytail reviewer `/root/file_final_review` started against the actual working-tree diff including untracked additions; evidence packaging remains pending.

All 98 evaluator tests passed after retaining fresh passing caching reports. Initial independent whole-branch correctness and separate installed Ponytail review found no actionable findings or deferred minors. Reviewer verified current candidate gate and exact contract/output copies, inspected actual app/build/UI proof, and independently viewed the three responsive screenshots. No source change required.

Review scope rulings: final evidence/archive review is pending and will run before shipment; CI/deployment will be observed after commit. Full EFS operational certification and human-learning efficacy are outside the authorized conceptual lesson scope and are not claimed. UI claims stay limited to the 12 journeys at three sizes and the listed visual sample; untested viewports are not certified.

All18 external and retained current-source gates pass, with54 exact original output copies. All581 learner quotations match their assigned slides. Both independent reviewer tracks completed every assigned source check before FINAL. The false-coordination control is rejected by both at6/20 on semantic grounds. All final learner/report JSON remains compact; no raw packets or UI proof are tracked.

Archive sealed outside Git:355 files,43,058,981 compressed bytes; every archived file byte-compared with its source. SHA256 `946f8b0a9c55cc2ae1627e1ce7cf53ce140f3fb0799329724bf995a9e3c944cc`. Location in the Shared File Storage release report. Final review/deployment records remain separate beside the sealed archive. Final packaging followup is pending.

Final independent packaging correctness and separate Ponytail review passed with no actionable findings. Reviewer independently reran all 18 retained gates, verified 54 exact report copies and 581 quotes, and byte-compared all 355 archived files. No source or evidence change was required. CI and deployed-byte verification remain shipment steps; the final review is retained beside the sealed archive.
