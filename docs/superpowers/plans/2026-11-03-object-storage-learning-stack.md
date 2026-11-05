# Object Storage learning stack

Continuation of Cursor PR #29 on 2026-11-05. User asked to check existing work first, then continue Object Storage under the established lighter evaluation/verification loop and standing shipment authorization.

Base main: `448c3fb02f9fecaa91122c2efbf56f9c02d4cb49`. Original Cursor head: `a043a54159136ed15438b64e019b0609d6bb99ba`. Isolated checkout `/tmp/system-canvas-object-storage`; branch `cursor/object-storage-learning-stack-a282`. Main is merged into this existing branch without rewriting its history. The original developer checkout's unfinished work is untouched.

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
- [ ] Fresh full-stack learner/two-reviewer evaluation and targeted blind false-guarantee control. Refresh existing evidence invalidated by the shared viewer registration; no stale hash relabeling.
- [ ] Relevant tests/build and verify-system-canvas browser journeys, screenshot/trace inspection, teardown, external checksum archive and unchanged report copies.
- [ ] Independent correctness and separate installed Ponytail review of the complete branch; resolve findings and inspect packaging.

After these gates: commit the reconciled branch, update PR29, wait CI, merge under standing authorization and verify deployed bytes. Preserve final review/deployment beside the sealed archive.

## Review ledger

Contract author `/root/object_contract_refresh` saw only the old contract, schema/rubric/guidance and catalog, never lesson/diagram/answers/reviews. New contract SHA256 `9faac70b4b452b2e2fe7065f36cb0f8456a046bac9514560ff56d083e55fb73d`. Eight original card IDs retained, six whole-stack questions with explicit criteria. Thresholds and rubric unchanged. Parent audited each card objective and primary AWS/GCS sources before export.

Merge conflicts resolved by preserving current main's existing lesson content/reports/guidance, then retaining the object-storage registration and release gate. The 15 old lesson packets are freshly exported because only their shared LessonDialog asset changed. Original Cursor evidence is preserved in `/tmp/object-storage-eval-20261105/cursor-original.tar`; its remote-run raw archive is historical provenance, not independently verified current evidence.

Unit tests: 233 pass after adapting the existing implementation. Browser proof extends Cursor's three viewports with both other catalog entries, all-card end screenshots and preserved viewport/keyboard behavior. Existing implementation already supplied working routing; no artificial failing test was manufactured for unchanged behavior.
