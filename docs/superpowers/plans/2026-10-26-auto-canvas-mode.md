# Auto canvas mode implementation plan

> Implement inline using executing-plans; keep this separate from the shipped header release.

**Goal:** Make Auto the default while retaining Select and Pan.
**Architecture:** Extend the existing tool union and React Flow flags; no new state machine.
**Tech stack:** React, TypeScript, React Flow, Vitest, Playwright.
**Spec:** ../specs/2026-10-26-auto-canvas-mode-design.md

## Constraints and review focus

Keep existing manual mode behavior, Space override, Shift selection, connectors, undo, and read-only cleanup. No dependencies or storage changes. Verify both node movement and viewport movement rather than just toolbar state.

## One behavioral slice

- [x] Add failing mode-matrix unit tests and a browser workflow for background pan, node select/drag/undo, manual box selection and Pan, Space override, and narrow toolbar visibility.
- [x] Update App's default and the tool unions in App, Toolbar, and Canvas. Add Auto to the existing mode controls. Enable node dragging outside Pan; enable background panning outside Select.
- [x] Run unit/build checks and browser regressions on port 5174; inspect desktop/mobile screenshots.
- [x] Review correctness and complexity, then sync only these edits into the user's local preview for review. Do not publish this next feature without approval.

## Review log

- Observed red tests before implementation: Auto flag matrix and missing default Auto button. Both pass after the small production change.
- Ruling: preserve existing manual Pan behavior rather than broaden node-start panning; the browser test checks immovable nodes and background panning separately. An existing box-selection overlay can capture a node-start drag. This behavior predates Auto.
- Isolated branch verification: 184 unit tests, build, and 27 browser regressions passed. Covered Auto/Select/Pan, temporary Space, node moves/undo, connectors, container movement, cleanup/read-only, and lesson dismissal.
- Desktop and 390px screenshots inspected: mode controls visible, no toolbar overlap.
- Local combined preview: 202 unit tests and eight browser tests for Auto/header/panels passed.
- Independent correctness review: no actionable findings. Separate Ponytail complexity review: no actionable findings. No new dependency, custom gesture engine, or persisted preference.
- User approved shipping Auto on 2026-10-26. Header PR12 was independently merged and deployed before this change. Release is isolated from pending SQLite, lesson-deck, and retractable-panel work.
- Release recheck: 184 unit tests, the production-base build, and all 27 targeted browser regressions passed on the unchanged reviewed implementation. The known unrelated sticky-connector resize endpoint failure is outside this targeted run; no claim of a green full browser suite.
