# Object Storage learning stack

Continuation of Cursor PR #29 on 2026-11-05. User asked to check existing work first, then continue Object Storage under the established lighter evaluation/verification loop and standing shipment authorization.

Initial base main: `448c3fb02f9fecaa91122c2efbf56f9c02d4cb49`; final integration base: `c993cc17f453b6fafcec3cf0df1232ed62033f46` (PR31 retractable panels). Original Cursor head: `a043a54159136ed15438b64e019b0609d6bb99ba`. Isolated checkout `/tmp/system-canvas-object-storage`; branch `cursor/object-storage-learning-stack-a282`. Main is merged into this existing branch without rewriting its history. The original developer checkout's unfinished work is untouched.

## Scope

Reuse the eight-card object-storage foundation, registration, diagram component and tests for Generic Object Storage, S3 and Google Cloud Storage. Revise the recurring Notes story into connected concepts, with examples only where explanatory. Existing foundations retain main's content. No new dependency, viewer redesign or evaluator change. Raw evidence stays outside Git; retain actual current learner/two-reviewer reports and concise summaries only.

The original Cursor contract mixed foundation outcomes with exact vendor percentages, propagation delays, page-size constants and API spellings. An independent contract-only audit retained all foundational safety/decision outcomes while moving that memorization to future product-specific teaching. It explicitly covers metadata/query limits and basic workload placement. This scope was frozen before revised prose, not changed in reaction to scores.

## Review focus

- Define object, bucket, key and metadata before using them. Scope flat-namespace and whole-object guarantees.
- Confirm the intended object before publishing a ready reference; two writes do not share a transaction. Explain orphaned objects and premature references without inventing a recovery protocol.
- A timeout, existing key or rejected precondition cannot establish successful storage of the intended bytes. Conditions have explicit atomic/provider boundaries.
- Keep durability, availability, acknowledgment, retention and failure domains distinct. Credential policies do not automatically enforce application ownership.
- Exact-key lookup and paginated prefix listing are not application queries or a multi-key snapshot. Preserve all existing lesson routing and viewer behavior.

## Tasks and evidence

- [x] Locate Cursor PR29, inspect actual source and reconcile with current main. Preserve original Cursor reports/source externally and in Git history.
- [x] Independent contract freeze, then revise eight cards and two focused diagrams against it.
- [x] Fresh full-stack learner/two-reviewer evaluation and targeted blind false-guarantee control. Refresh existing evidence invalidated by the shared viewer registration; no stale hash relabeling.
- [x] Relevant tests/build and verify-system-canvas browser journeys, screenshot/trace inspection, teardown, external checksum archive and unchanged report copies.
- [x] Independent correctness and separate installed Ponytail review of the complete branch; resolve findings and inspect packaging.

After these gates: commit the reconciled branch, update PR29, wait CI, merge under standing authorization and verify deployed bytes. Preserve final review/deployment beside the sealed archive.

## Review ledger

Contract author `/root/object_contract_refresh` saw only the old contract, schema/rubric/guidance and catalog, never lesson/diagram/answers/reviews. New contract SHA256 `9faac70b4b452b2e2fe7065f36cb0f8456a046bac9514560ff56d083e55fb73d`. Eight original card IDs retained, six whole-stack questions with explicit criteria. Thresholds and rubric unchanged. Parent audited each card objective and primary AWS/GCS sources before export.

Merge conflicts resolved by preserving current main's existing lesson content/reports/guidance, then retaining the object-storage registration and release gate. The 15 old lesson packets are freshly exported because only their shared LessonDialog asset changed. Original Cursor evidence is preserved in `/tmp/object-storage-eval-20261105/cursor-original.tar`; its remote-run raw archive is historical provenance, not independently verified current evidence.

Unit tests: 233 pass after adapting the existing implementation. Browser proof extends Cursor's three viewports with both other catalog entries, all-card end screenshots and preserved viewport/keyboard behavior. Existing implementation already supplied working routing; no artificial failing test was manufactured for unchanged behavior.

Main advanced during review. Checkpoint `179fbfe` reconciled the original Cursor branch and initial main; the newer panel release merged without conflicts. Lesson content/assets and the Object Storage hash remain unchanged. Repeated app tests (233) and production build pass. A 22-journey browser run passed 20, with two screenshot-capture stalls (143.9s and 61.8s) exhausting test budgets; traces identify capture delays before the reported assertion timeout. Focused retry uses identical tests/timeouts, with all attempts preserved.

Focused retry: both journeys passed without source or test changes (34.6s total). This establishes passing evidence for all 22 unique integrated journeys across the two runs, not a single 22/22 run. Screenshot stalls remain a recorded test-environment limitation.

Evaluator suite: all 98 tests pass after retaining refreshed caching evidence. All sixteen learner answer files passed an independent exact-quote audit. No source or rubric changes followed Object Storage evaluation.

All 16 current-source gates passed against both external and retained evidence. Every retained learner/reviewer file is a byte-identical copy of finalized actual output. Object Storage scored 20/20 in both tracks; both reject the false timeout guarantee. All 15 unchanged foundations also pass after current-renderer refresh. External archive: see the Object Storage release report for the checksum and 572 byte-verified files (92,424,392 compressed bytes). Final review and deployment records will be stored beside this sealed archive.

Final independent review `/root/object_final_review`: no actionable correctness findings; separate installed Ponytail pass: No actionable complexity findings. Reviewer independently reran all 16 retained gates, verified all 48 actual/retained/archive report bytes and the archive checksum/file count. No deferred minors.

Final: Ruling: accept upstream PR31 panels as the main baseline and verify lesson interaction, rather than re-audit that unrelated implementation — six panel and all affected lesson journeys have passing evidence; unrelated panel internals remain outside this review.
Final: Ruling: keep exact vendor APIs, numerical targets and production recovery protocols outside the frozen foundation scope — this teaches shared decisions and boundaries; it does not certify S3/GCS operational implementation.
Final: Ruling: treat CI and production deployment as still pending at code-review completion — the release executor must observe both before claiming shipped; review approval alone is insufficient.
Final: Ruling: interpret evaluation scores as content readiness only — no claim of measured human learning or universal evaluator reliability.
