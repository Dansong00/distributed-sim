# Product backlog

Updated: 2026-10-16. This is the feature/status index, not a promise of delivery dates. Detailed agreed behavior lives in the [canvas spec](superpowers/specs/2026-10-15-canvas-design.md); completed implementation history lives in the [original plan](superpowers/plans/2026-10-15-canvas.md). Update this list as decisions change or features ship.

## Current focus — connector configuration

Status: design agreed; implementation in progress. See the [connector requirements](superpowers/specs/2026-10-15-canvas-design.md#connector-configuration-follow-up--2026-10-16).

- [ ] Independent stroke styles (solid, dashed, dotted) and path shapes (straight, curved, elbow).
- [ ] Every new connection defaults to solid + elbow, with a matching drawing preview. Existing connections without settings use those defaults; duplicates preserve settings.
- [ ] Automatic simple routing, without obstacle avoidance or manual bend editing. Aligned, facing handles permit a straight elbow segment.
- [ ] Visible self-loops: rectangular for elbow/straight, rounded for curved; explain the straight fallback in the inspector.
- [ ] Keep multiple connections allowed; straight paths may overlap. Preserve separation for curved/elbow paths.
- [ ] Visible line-only selection highlighting across all styles.
- [ ] Batch stroke/path editing with Mixed values, property-specific changes and one undo per batch. Mixed component/connector selections expose Connections (N) and modify only connectors.
- [ ] Preserve settings through local saving, reopening, duplication, undo/redo and JSON import/export; validate legacy and invalid data.
- [ ] Extend routing, selection and persistence coverage while retaining drag/connector reliability regressions.

Labels remain automatically positioned; crossings have no bridge arcs or junction dots and imply no connection. Robust routing for very close/overlapping endpoints also needs implementation validation; no obstacle-avoidance guarantee is implied.

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

## Outside the current release

The original spec also excludes accounts, collaboration/cloud synchronization, Practice/Review coaching, and dedicated phone editing. These exclusions do not imply approved future feature designs. Current revision-conflict detection protects shared local browser storage; it is not cross-device collaboration.

## Implemented baseline

- Architecture canvas with grouped component presets, labels, annotations, real single-level containers and starter diagrams.
- Selection, multi-selection, movement, duplication and undo/redo.
- Multiple local diagrams, autosave, JSON import/export and revision-conflict recovery.
- GitHub Pages build/deployment workflow; user confirmed hosting works.
- Drag visibility and connector measurement fixes; user confirmed smooth connector behavior. Latest recorded verification at connector-fix commit e9224dc: 72 unit tests and 25 Chromium browser tests, typecheck and production build passed. This is not validation of the pending configuration feature.

## Implementation walkthrough to include

Explain the IndexedDB revision-check/save-conflict mechanism using the existing code when implementation resumes, as requested by the user.
