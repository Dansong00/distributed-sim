# Lean lesson evaluation

The user requested removing duplicated evaluation artifacts, retaining the quality gate, and reducing review overhead before starting the next stack.

## Scope

- Archive all existing runs outside Git and verify every archived file before removing tracked copies. Preserve the original passing whole-stack learner and two reviewer reports unchanged under `evals/lessons/releases/caching/`.
- Rebuild the packet from current source in CI. Validate the complete card contract and grade the whole-stack reports with the existing thresholds, hashes, learner binding, source checks and failure vetoes.
- Check cards during authoring without automatically creating separate learner/reviewer sessions for each prefix. Keep targeted prefix evaluation available for diagnosis. After a content edit, obtain fresh whole-stack reports for the changed snapshot; never patch their hashes.
- Use the project verification skill once before release; repeat only affected checks after an actual change or failure.
- Do not change lesson text, rendering assets, rubric thresholds, question criteria, or the next-stack branch. Do not rewrite shared Git history.

## Work

- [x] Archive 189 files and verify each SHA-256; copy three passing reports byte-for-byte.
- [x] Update release checks and regression tests; remove obsolete per-card aggregation.
- [x] Remove tracked run snapshots; update CI, instructions, ignore rules and concise release provenance.
- [x] Run quality checks, verification skill, independent correctness and Ponytail review.
- [ ] Commit, merge and verify deployment.

## Evidence and decisions

Archive: `/Users/danielansong/Documents/learning-eval-archives/system-canvas/2026-11-01-caching-7354000/runs.tar.gz`.
Archive SHA-256: `c3da9e6cc8199d9e870c573632dee07ce9edc198daded694ba766599b52956dc`.

Ruling: mandatory independent assessment moves from every prefix plus the stack to one complete-stack assessment by two reviewers. This follows the requested lighter process. It retains scoring thresholds and source binding, but does not claim independently tested learning after every individual prefix. Card objectives, prerequisites and transfer questions remain authoring checks; targeted blind card tests remain available when needed.

Full historical evidence stays recoverable from the archive and existing Git history. Only current passing report data needed by CI stays tracked. The archive is not a CI dependency.

- Validation: observed the new compact-release integration test fail before changing the CLI, then 98/98 evaluator tests passed. Existing source/rubric/response bindings, source checks, thresholds and hard vetoes remain covered. Current release passes with both original 20/20 reviews. App tests 212/212; production build passed with the existing size warning.
- Independent correctness review verified retained reports and all archived files byte-for-byte, current-source behavior and no external CI dependency; no actionable findings. Separate Ponytail pass: No actionable complexity findings.
- Reviewer exclusions: original semantic judgments/provenance and human learning were not re-audited because content and reports are unchanged. Live deployment remains a separate check.
- Ran verify-system-canvas once for tests/caching-lessons.spec.ts: 5/5 passed, doctor ready, five traces retained, mobile trace/screenshot inspected, and port 5187 clean after teardown. Full proof is outside Git at ~/Documents/learning-eval-archives/system-canvas/2026-11-01-cleanup-verification-NulNgQ/.
- Evidence footprint: 189 raw files (~27,000 lines) replaced by three original reports plus a short summary (507 lines). The next-stack branch is untouched.
