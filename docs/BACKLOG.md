# Product backlog

Updated: 2026-10-18. This is the feature/status index, not a promise of delivery dates. Detailed agreed behavior lives in the [canvas spec](superpowers/specs/2026-10-15-canvas-design.md); completed implementation history lives in the [original plan](superpowers/plans/2026-10-15-canvas.md). Update this list as decisions change or features ship.

## Current focus — automatic diagram cleanup

Status: interaction concept approved; [written design](superpowers/specs/2026-10-18-auto-layout-design.md) awaiting review. Implementation has not started.

- [x] Agree free rearrangement, preview with Apply/Cancel, one-step undo and movable connector attachment sides.
- [x] Agree connected notes follow components and unconnected notes use a notes area.
- [ ] Review written edge-case behavior for containers, multiply attached notes, cycles and preview persistence.
- [ ] After design review, write the implementation plan and choose execution method.

## Implemented — sticky connections, remembered defaults and AI catalog

Status: implemented on `feat/sticky-connections-ai-catalog`; awaiting merge and deployment. See the [updated requirements](superpowers/specs/2026-10-15-canvas-design.md#sticky-connections-remembered-defaults-and-ai-catalog--2026-10-16).

- [x] Connect sticky notes to notes and components, preserving resize, persistence and undo/redo behavior.
- [x] Start new connectors straight; remember the last explicitly edited stroke, path and direction across reloads/diagrams. Keep existing edges unchanged.
- [x] Add specialized database/storage presets and an AI category, with capability descriptions and search.
- [x] Verify new behavior and existing regressions, review and push for merge.

Verification: 122 unit tests, typecheck and production build passed. All 47 Chromium cases passed across the full run and targeted reruns after updating the old no-sticky-handles assertion and moving edge-resize test gestures away from connection handles. Independent review found no blockers; its minor literal-type search suggestion was applied and tested. Screenshot inspected.

## Completed — rounded elbow routing

Status: merged into main via PR #6 (`733225d`). See the [rounded-elbow requirements](superpowers/specs/2026-10-15-canvas-design.md#rounded-elbow-routing-follow-up--2026-10-16).

- [x] Replace sharp elbow corners with adaptive rounded corners, including existing edges, self-loops and drawing previews.
- [x] Remove tiny rectangles caused by overshooting and backtracking; prefer simple routes respecting selected handles.
- [x] Use compact self-loop routes while preserving aligned shortcuts, parallel/reverse separation and existing styling/persistence behavior.
- [x] Verify screenshot-like layouts, route geometry and existing editor regressions; independent review and visual validation.

Verification: 115 unit tests, 44 Chromium tests and a final five-test connector rerun, typecheck and build passed. Independent review and screenshot inspection completed.

## Completed — sticky-note sizing

Status: merged into main via PR #5 (`f1568bd`). See the [sticky-note requirements](superpowers/specs/2026-10-15-canvas-design.md#sticky-note-sizing-follow-up--2026-10-16).

- [x] Fix overflowing text by growing note height to fit title/body at the chosen width.
- [x] Add selected-note resize handles for enlarging/shrinking, with content-safe minimum height.
- [x] Persist dimensions and support one undo/redo step per resize gesture, with coherent text-edit growth history.
- [x] Verify wrapping, container membership, save/reopen, import/export and prior interaction regressions.

The existing 10,000-character body limit remains; a character counter is deferred. Verification: 103 unit tests, 43 Chromium browser tests, typecheck and production build passed. Independent review verified the corner-anchor correction.

## Completed — connector configuration

Status: merged into main via PR #4 (`1eb13a1`). See the [connector requirements](superpowers/specs/2026-10-15-canvas-design.md#connector-configuration-follow-up--2026-10-16).

- [x] Independent stroke styles (solid, dashed, dotted) and path shapes (straight, curved, elbow).
- [x] Originally new connections defaulted to solid + elbow; superseded by remembered defaults in the current follow-up. Legacy connections without settings retain solid + elbow; duplicates preserve settings.
- [x] Automatic simple routing, without obstacle avoidance or manual bend editing. Aligned, facing handles permit a straight elbow segment.
- [x] Visible self-loops: rectangular for straight, rounded for elbow/curved (updated by the rounded-elbow follow-up); explain the straight fallback in the inspector.
- [x] Keep multiple connections allowed; straight paths may overlap. Preserve separation for curved/elbow paths.
- [x] Visible line-only selection highlighting across all styles.
- [x] Batch stroke/path editing with Mixed values, property-specific changes and one undo per batch. Mixed component/connector selections expose Connections (N) and modify only connectors.
- [x] Preserve settings through local saving, reopening, duplication, undo/redo and JSON import/export; validate legacy and invalid data.
- [x] Extend routing, selection and persistence coverage while retaining drag/connector reliability regressions.

Labels remain automatically positioned; crossings have no bridge arcs or junction dots and imply no connection. Routing tests cover very close/overlapping endpoints; no obstacle-avoidance guarantee is implied. Verification: 103 unit tests, 29 Chromium browser tests, typecheck and production build passed.

## Deferred — requested product directions

These are future scope, with no implementation order or dates agreed.

- Learn section: tiles for the 37 system-design topics, each opening a concise five-slide explanation including relevant technologies.
- Searchable glossary of terms used in the learning material.
- Analyze my system: evaluate a diagram against its problem statement, explain strengths/weaknesses and suggest improvements. Design the analysis system and any language-model integration separately.
- Live system simulation.
- Hand-drawn presentation mode.

## Deferred — editor enhancements discussed

These are recorded possibilities, not commitments to build.

- Manual connector bend editing.
- Automatic routing around intervening components.
- Manual label placement and automatic label overlap avoidance.
- Bridge arcs or other special crossing indicators.
- Sticky-note character counter (existing text limit remains enforced).

## Outside the current release

The original spec also excludes accounts, collaboration/cloud synchronization, Practice/Review coaching, and dedicated phone editing. These exclusions do not imply approved future feature designs. Current revision-conflict detection protects shared local browser storage; it is not cross-device collaboration.

## Implemented baseline

- Architecture canvas with grouped component presets, labels, annotations, real single-level containers and starter diagrams.
- Selection, multi-selection, movement, duplication and undo/redo.
- Multiple local diagrams, autosave, JSON import/export and revision-conflict recovery.
- GitHub Pages build/deployment workflow; user confirmed hosting works.
- Drag visibility and connector measurement fixes; user confirmed smooth connector behavior. Latest recorded verification at connector-fix commit e9224dc: 72 unit tests and 25 Chromium browser tests, typecheck and production build passed. Those counts describe the prior fix; current configuration verification is recorded above.

## Implementation walkthrough delivered

Explained the IndexedDB revision-check/save-conflict mechanism during connector implementation: a save compares its expected revision with stored data and writes the next revision in one read/write transaction. A stale tab preserves local edits and offers recovery instead of overwriting a newer record. See `src/storage/diagram-store.ts` (`mutate`) and `src/app/useDocumentSession.ts` (save coordination).
