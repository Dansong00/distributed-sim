# Automatic Diagram Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Offer deterministic whole-diagram cleanup with a disposable preview and one-step undo, reducing tangled connections while preserving diagram meaning.

**Architecture:** Use an ELK layered layout adapter in a cancellable browser worker. Keep its candidate document outside session/history/autosave; Apply checks the live snapshot and stored revision before committing through existing history. Continue rendering connectors with the existing path code.

**Tech Stack:** Existing React/TypeScript/Vite, React Flow, IndexedDB, Vitest and Playwright; one proposed runtime dependency, `elkjs`, with a tested exact version recorded in the lockfile during Task 1.

**Spec:** [Approved cleanup design](../specs/2026-10-18-auto-layout-design.md). User approved the written spec on 2026-10-18. Implementation, acceptance and independent final review complete on `feat/auto-layout`; ready for merge review.

## Global Constraints

- Whole diagram, left-to-right; no selection-only mode, pins or orientation controls.
- Preserve node/edge IDs, parent IDs, component/note sizes, content and connector styles/directions. Change positions, necessary container growth and cardinal attachment sides only.
- Preserve 24-unit container padding, original container minimum dimensions, single-level nesting, 500 elements, 1,000 connections, 5 MiB portable JSON, coordinates within ±1,000,000 and dimensions at most 100,000.
- Connected notes participate in the component graph. Note-only groups/unconnected notes/text use a notes area in their existing parent scope.
- Preview never enters autosave/history; Cancel restores the original viewport; Apply is one content-history entry. Keep existing viewport undo semantics.
- Legacy missing-path edges remain elbow; cleanup never changes connector preferences. No automatic path-style conversion, stored bend points, obstacle router or language-model service.
- Reuse the isolated checkout; do not create a worktree unless requested. Preserve unrelated changes and node measurement-cache fixes. Run only one browser suite/server lifecycle at a time.

## Review Focus

1. A previously clean diagram changes or is deleted in another tab during preview: Apply must detect it even without a local pending save (Task 3).
2. Cancel and immediate restart race with a late worker response: the old candidate must never appear or apply (Task 2).
3. Container minimum sizes, long notes and disconnected groups: real dimensions must prevent overlap without changing membership or clipping content (Task 1).
4. Cycles, bidirectional/parallel edges and ambiguous note ownership: preserve all relations and produce stable output without invented ownership (Task 1).
5. Keyboard shortcuts, drops and viewport callbacks during preview: none may mutate or autosave the candidate through an alternate handler (Tasks 3–4).

## File map

- `src/editor/layout/diagram-layout.ts`: deterministic graph conversion, layout invocation, candidate reconstruction and validation.
- `src/editor/layout/layout.worker.ts`: worker request/result entry; import bundled ELK here, without spawning a second nested worker.
- `src/editor/layout/layout-job.ts`: one worker per cleanup job, cancellation and error handling.
- `src/editor/useAutoLayout.ts`: temporary calculating/preview state and snapshot lifecycle.
- `src/app/useDocumentSession.ts`: narrow snapshot/revision checks and atomic cleanup apply; keep normal storage/history authoritative.
- `src/app/App.tsx`, `src/editor/Toolbar.tsx`, `src/editor/Canvas.tsx`, `src/styles.css`: cleanup controls, inspection mode, fit/restore and mutation guards.
- Unit tests alongside new modules; extend `src/app/useDocumentSession.test.tsx`; browser acceptance in `tests/auto-layout.spec.ts` with `tests/fixtures/auto-layout.json`.
- `package.json`, `package-lock.json`, `README.md`, `docs/BACKLOG.md`: tested dependency and usage/status updates.

## Task 1: Deterministic layout adapter

**Interfaces:** `layoutDiagram(document: Diagram): Promise<Diagram>` in `diagram-layout.ts`. Returns a new validated candidate; never mutates input, changes viewport or writes storage. Later tasks call it inside the worker.

- [x] Add `diagram-layout.test.ts` with a readable fixture: client → API → database, API → queue → two workers, shared cache/storage, feedback cycle, reverse/parallel links, self-loop, one populated and one empty container, a multiply attached note, note chain, isolated note group and long text. Assert semantic fields unchanged, no overlapping sibling boxes, correct parent-relative coordinates and padding, unchanged note sizes, preserved empty container, valid output and finite handles.
- [x] Run `npm test -- src/editor/layout/diagram-layout.test.ts`; confirm failure because layout is absent.
- [x] Inspect `elkjs` package metadata/license and available release, install one exact supported version with the repository's npm workflow. Record version and license in README. Verify its typed bundled entry, layered compound-graph/cross-hierarchy connections and Vite worker build against the fixture. If compound support cannot satisfy membership, stop and report the concrete mismatch rather than silently flattening containers or replacing the engine with a custom router.
- [x] Implement `layoutDiagram`. Canonicalize node/edge ordering by ID, ignore original positions, and use fixed layered RIGHT settings and random seed. Use existing node dimensions; group hierarchy is authoritative. Partition note-only/text groups from the component-connected graph using undirected reachability, with self-loops excluded from rank constraints. Reserve a notes strip below each scope's component layout; keep note-only linked groups together. Pack disconnected blocks using deterministic ordering. Start with 80-unit node gaps, 120-unit layer gaps and 48-unit block gaps; these are internal tuning values, not new user settings.
- [x] Preserve container minimum size before parent-level placement, including the notes strip. Do not inflate a container only after siblings have been positioned. Derive cardinal source/target handles from engine port/section directions where available; use deterministic dominant-axis directions for edges the engine does not route. Keep self-loops attached to their existing handles. Discard engine bend points and preserve every original edge field other than handle IDs. Reconstruct by ID and call existing portable validation before returning.
- [x] Add deterministic/edge-case assertions: `await layoutDiagram(d)` equals a second call; laying out the result does not drift; reorder input arrays and compare geometry by ID; empty input remains unchanged; cycles and both-direction edges preserve direction; an unconnected long note stays in its parent notes strip; invalid/over-limit candidates reject without modifying input. Avoid asserting exact incidental ELK coordinates.
- [x] Run the adapter tests and `npm run build`; inspect the representative fixture rendered with existing edge paths during Task 4, not just engine output. Commit adapter/dependency/tests with `feat: calculate deterministic grouped diagram layouts`.

## Task 2: Cancellable worker and temporary preview state

**Interfaces:** `startLayout(document: Diagram): { result: Promise<Diagram>; cancel(): void }` in `layout-job.ts`. Cancellation rejects with `AbortError` and terminates the worker. Worker messages carry a job ID and either candidate or serializable error. `useAutoLayout()` returns `{ phase: 'idle' | 'calculating' | 'preview', candidate: Diagram | null, error: string | null, start(snapshot: CleanupSnapshot): void, cancel(): void, snapshot: CleanupSnapshot | null }`.

**Shared type:** Define `CleanupSnapshot = { document: Diagram; installation: number; generation: number; revision: number }` in `src/domain/model.ts`; no change to persisted Diagram schema. Task 3 supplies the snapshot. Snapshot document includes the pre-preview viewport.

- [x] Add `layout-job.test.ts` and `useAutoLayout.test.tsx`: success enters preview without touching input; worker error becomes readable error; cancel terminates once; cancel/restart ignores the old response; unmount releases worker; runtime validation rejects malformed worker output. Use a controlled worker double only at the browser Worker boundary.
- [x] Run the two new test files and observe missing-feature failures.
- [x] Implement a Vite module worker via `new Worker(new URL('./layout.worker.ts', import.meta.url), { type: 'module' })`. Run Task 1's adapter inside it. Keep ELK out of the initial application module graph. Reject startup/error/message-error cases; terminate on success, failure or cancel. Avoid a background-job framework or an arbitrary timeout that silently drops valid large diagrams.
- [x] Implement the hook with one active job token. Keep candidate/snapshot exclusively in hook state. Clear old errors on a new request. Candidate identity must match snapshot document ID; check portable validation again at the worker boundary.
- [x] Run focused tests and production build. Verify built worker assets load under Vite's `/distributed-sim/` base as part of Task 4. Commit with `feat: calculate cleanup previews in a cancellable worker`.

## Task 3: Safe preview integration and atomic Apply

**Session interfaces:** Add `prepareCleanup(): Promise<CleanupSnapshot>` and `applyCleanup(snapshot: CleanupSnapshot, candidate: Diagram): Promise<boolean>` to `useDocumentSession`. Prepare commits any valid pending text transaction, waits for current normal saves, checks the stored revision, and returns a cloned snapshot. Apply validates candidate permissions, snapshot identity/content generation and current stored revision, then synchronously dispatches preview+commit as one history transaction; return false and use existing warning/conflict/error UI on failure. Existing optimistic storage transaction remains the final race guard if another tab writes after the revision read.

**Canvas interface:** Add `readOnly?: boolean` and `onPreviewViewport?: (viewport: Viewport) => void` to `CanvasProps`, plus `setViewport(viewport: Viewport): void` to `CanvasHandle` alongside existing `fit()`. App owns the original viewport and preview candidate viewport. Read-only viewport events update preview state only, never session dispatch.

- [x] Extend session tests: preparing flushes only original content; applying adds one undo step and redo restores geometry/handles; no-op adds none; stale installation/generation rejects; stored revision changed or deleted while locally clean enters conflict; save failure retains edited memory and recovery options. Assert fake IndexedDB never receives preview coordinates before Apply. Test a malicious candidate changing parent IDs, text, edges or note dimensions is rejected by comparison with snapshot, not merely by schema validation.
- [x] Run `npm test -- src/app/useDocumentSession.test.tsx`; observe failures for missing cleanup API, then implement the narrow methods using existing `flush`, `fail`, generation, revision, history and serialization paths. During async checks block competing session mutations; recheck snapshot generation after every await. Do not use the existing history preview action for viewing an unapproved layout.
- [x] Add hook/App/Canvas integration tests for preview isolation and keyboard guards. The toolbar exposes Clean up, then “Arranging…” with Cancel, then Apply/Cancel. Clean up is disabled for an empty diagram, busy/conflicted/error session or active pointer gesture. Blur valid text edits before preparing. Announce status/errors accessibly and return focus to Clean up on exit.
- [x] Wire App to display `candidate ?? document`. Disable palette, inspector, diagram lifecycle actions, export and mutation shortcuts while preparing/calculating/previewing; permit canvas pan/zoom in preview. Guard handler code as well as disabled controls: add/drop, move, resize, connect, delete, duplicate, undo/redo and imperative add must not reach session while locked. Preserve measured-node reuse and explicit dimensions. Escape cancels via App, without the canvas also executing its normal Escape action.
- [x] Fit the candidate when it arrives. Cancel restores snapshot viewport and original rendering without a history/save event. Apply keeps the inspected viewport separately from the content transaction, clears preview only on successful commit, then runs normal autosave. Keep the candidate out of current-diagram export. On session identity/content change or detected conflict, cancel the active job/preview. A clean-tab remote write that emits no local event is still caught by the mandatory stored-revision read before Apply; do not claim existing storage provides live remote notifications.
- [x] Run focused unit tests, typecheck and build. Commit with `feat: preview and apply diagram cleanup atomically`.

## Task 4: Browser acceptance, limits and release documentation

**Files:** `tests/auto-layout.spec.ts`, `tests/fixtures/auto-layout.json`, README, backlog and spec status. No permanent test hooks in product code.

- [x] Add browser cases covering the representative fixture: preview changes displayed positions but IndexedDB remains original after waiting past autosave; Cancel/Escape restores geometry/viewport; Apply yields one Undo/Redo entry, save/reopen/export/import retain the result; connector styles/default preferences remain unchanged. Try keyboard duplicate/delete/undo, palette drag/drop and export during preview and verify no mutation or candidate leak.
- [x] Add two-tab tests: clean original in tab A previews; tab B changes or deletes it; A's Apply enters recovery without overwriting B. Use controlled worker completion in unit tests for stale/cancel races, and a real large graph in browser to verify cancellation responsiveness.
- [x] Inspect actual paths, labels and cards in the screenshot-like fixture, including long notes and containers. Check non-overlap with rendered bounding boxes and confirm major request flow is legible. Record screenshot and observations. Tune internal spacing only if rendered evidence warrants it; do not switch connector styles or add routing features to make a screenshot look better.
- [x] Measure layout duration and main-thread interaction on a deterministic 500-node/1,000-edge fixture. Record machine/browser, elapsed time and observed cancellation behavior without presenting one run as a benchmark guarantee. Invalid oversized output leaves input intact with a useful error.
- [x] Run `npm test`, `npm run typecheck`, `npm run build`, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` serially as appropriate. Preserve exit statuses and inspect counts. After a failure, fix its cause and rerun affected checks; do not repeatedly rerun unrelated passing suites.
- [x] Build with `npm run build -- --base /distributed-sim/` and smoke-test the production preview at that prefix, including a real cleanup calculation, to verify worker asset loading. Stop only servers started for this check.
- [ ] Update README usage/limits, mark backlog and spec implementation status accurately, and record verification/measurements. Obtain a fresh whole-branch review focused on the five review risks. Fix concrete findings and rerun relevant checks. Commit final docs, push a reviewable branch and create a PR through available authorized GitHub tooling; report any API restriction honestly. Do not merge or deploy directly.

## Execution handoff

The user previously chose subagent-driven execution; retain that preference. After plan review, use one implementation worker at a time, review each task before the next dependent task, and finish with a whole-branch review. Task order is 1 → 2 → 3 → 4. No extra approvals between implementation tasks unless scope genuinely changes or an external permission is required.

Each task review and the final branch review must follow [the repository review requirements](../../../AGENTS.md): correctness/spec alignment first, then an explicit `engineering-suite-ponytail:ponytail-review` pass. The same independent reviewer can perform both. Resolve actionable complexity findings or document why the implementation is retained; rerun affected checks after changes. Do not proceed to dependent work with unresolved findings.

### Review log

Record reviewed commit/diff, actionable findings and their dispositions, or an explicit no-findings result. Completed independent review results are recorded below.

| Checkpoint | Correctness/spec review | Ponytail complexity review | Findings/disposition and evidence |
| --- | --- | --- | --- |
| Task 1 | Passed | No actionable complexity findings | `58c6910`; independent review; 131 unit tests, build and worker packaging passed. |
| Task 2 | Passed | No actionable complexity findings | `b294a9c`; independent lifecycle review; 148 unit tests and build passed. |
| Task 3 | Passed after fix | No actionable complexity findings (AGENTS fallback) | `5d789ad` + `556fc7c`; fixed no-op after reparenting; 171 full unit tests, 31 focused tests after fix, typecheck/build; scoped rereview passed. |
| Task 4 | Passed | No actionable complexity findings (AGENTS fallback) | `fb03a20`; independent review; 172 unit and 53 Chromium tests, typecheck, default/prefix builds and real production worker smoke passed. Worker compatibility choices reviewed and retained for reproduced failures. |
| Final branch | Passed | No actionable complexity findings (AGENTS fallback) | Independent review of `877f164..af17e31` covered all five risks, prior fix and ELK/Vite compatibility decisions. No additional test reruns needed. |

Self-review: all approved spec sections map to the four tasks. Container growth precedes outer placement; output preserves renderer-compatible geometry; preview storage isolation and clean-tab revision checks are explicit. Execution began after user approval; task review evidence is recorded above.

### Browser compatibility decisions

Real browser acceptance exposed ELK 0.12.0 bundled worker environment detection. The disposable outer worker temporarily supplies a `document` marker during dynamic import and the synchronous ELK constructor, removes it in `finally`, then awaits computation. This selects its in-process shim without nested workers or a UI-thread fallback. Retain this pinned-library boundary; upgrades must repeat actual worker tests. Vite explicitly prebundles this worker-only dependency to prevent a reproduced cold-start reload, and emits ES module workers to support the dynamic import. Development cold-cache and production `/distributed-sim/` worker checks passed.

Final implementation validation: 172 unit tests, 53 Chromium tests, typecheck, default and prefixed production builds passed. Production preview/apply/save/undo ran through the actual worker under `/distributed-sim/` with no page errors. Two maximum-size observations took roughly 4 seconds to preview and under 1 second to cancel; main-thread interval gaps reached 654 ms, so these are bounded observations, not a smooth-frame guarantee. Existing connector crossings and label overlap remain possible.
