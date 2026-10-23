# Product backlog

Updated: 2026-10-22. This is the feature/status index, not a promise of delivery dates. Detailed agreed behavior lives in the [canvas spec](superpowers/specs/2026-10-15-canvas-design.md); completed implementation history lives in the [original plan](superpowers/plans/2026-10-15-canvas.md). Update this list as decisions change or features ship.

## Implemented - connector comments

Approved scope: a multiline Comments property for a single selected connector, separate from its visible label. Reuse text-edit transactions and local persistence; preserve comments through cleanup and portable JSON. Accept older diagrams without comments and enforce the existing 10,000-character note limit. Canvas comment bubbles need further design before implementation. Sticky-note-to-connector links are a separate follow-up after comments.

Release approved on `feat/connector-comments`. Verification: 179 unit tests, production build including TypeScript, six cleanup browser tests and five connector browser tests passed. Independent correctness and Ponytail complexity reviews found no actionable issues. See the [review log](superpowers/plans/2026-10-15-canvas.md#connector-comments-review-log---2026-10-22).

## Proposed order for small releases

Relative scope estimates, not delivery dates. Each row is an independently useful release; designs remain subject to discussion. Finish connector comments first. Favor one user-visible behavior per PR, including its persistence and undo behavior where relevant.

| Rank | First release | Scope | Stop before |
| --- | --- | --- | --- |
| 1 | Character counter for sticky-note text | XS: reuse the existing text limit and textarea | Warnings, configurable limits or broader text editing |
| 2 | Searchable glossary with 10 core terms | S: static definitions and text search | Full learning curriculum or generated content |
| 3 | One complete Learn topic with five short slides | S-M: navigation and reviewed educational content | Building all 37 topics at once |
| 4 | Clickable comment indicator opening existing Properties | S-M: requires interaction design first | Popovers, threads, replies or collaboration |
| 5 | Manual connector label placement | M: one saved offset with drag, reset and undo | Automatic collision avoidance |
| 6 | Sticky-note annotation attached to a connector midpoint | M-L: design edge references and deletion/duplication behavior | Arbitrary attachment positions or general edge-to-edge connections |
| 7 | One manually movable connector bend | L: route data, editing, history and cleanup interaction | Full path editor |
| 8 | Hand-drawn appearance for connector strokes only | L: compare a visual prototype first | Restyling nodes, labels and the entire canvas |
| 9 | Crossing indicators for straight connectors only | L: intersection detection and readable rendering | All path shapes or junction semantics |
| 10 | Label overlap avoidance for one connector path style | L: placement rules and repeatable visual cases | Global routing optimization |
| 11 | Obstacle-aware routing for elbow connectors only | XL: routing and editing behavior | Mixed-style automatic optimization |
| 12 | Analyze my system for one defined scenario and explicit checks | XL: agree the input model and useful feedback first | General architecture grading or open-ended AI advice |
| 13 | Simulate one client-service-queue scenario | XL: define workload and model assumptions first | Arbitrary architecture simulation |

Connector-style optimization remains an experiment after collecting real diagrams where cleanup is hard to read. Accounts, cloud collaboration and dedicated phone editing remain outside the current release.

## Current focus — automatic diagram cleanup

Status: merged into main via PR #8 (`cfaf836`). The [written design](superpowers/specs/2026-10-18-auto-layout-design.md) and [implementation plan](superpowers/plans/2026-10-18-auto-layout.md) record completed implementation, acceptance checks and independent review.

- [x] Agree free rearrangement, preview with Apply/Cancel, one-step undo and movable connector attachment sides.
- [x] Agree connected notes follow components and unconnected notes use a notes area.
- [x] Review written edge-case behavior for containers, multiply attached notes, cycles and preview persistence.
- [x] Write and self-review the implementation plan; retain the user’s subagent-driven execution preference.
- [x] User reviews the plan before implementation begins.

## Implemented — sticky connections, remembered defaults and AI catalog

Status: merged into main via PR #7 (`5e90a02`). See the [updated requirements](superpowers/specs/2026-10-15-canvas-design.md#sticky-connections-remembered-defaults-and-ai-catalog--2026-10-16).

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
- Clickable connector comment bubbles, pending a separate design discussion.
- Connect a sticky note to a connector, after the connector comments feature.

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
