# Distributed systems canvas — first release

## Purpose and agreed scope

Build a dependable visual workspace for studying and explaining distributed web systems. Users assemble meaningful infrastructure components, connect them, and annotate their decisions. The first release succeeds when a user can create, edit, save, export, and reopen a system diagram without losing its structure or layout.

The user approved a structured canvas with annotations, real containers, flexible connections, grouped component presets, multiple local diagrams, a starter chooser, and a crisp modern appearance. The interaction details below make those decisions implementable; defaults not explicitly discussed are proposed for review in this specification.

Live simulation, system analysis, language-model integration, Practice/Review coaching, learning decks, glossary, accounts, collaboration, and cloud synchronization are deferred. Hand-drawn mode is also deferred. Do not show inactive controls for these features. The uploaded TSX prototype is a reference for the domain, not an engine to preserve: its simulation is outside this release.

## Main experience

- A diagram picker offers create, open, rename, duplicate, export, and delete.
- Creating a diagram opens a starter chooser: Blank (default), Basic Web App, or Note-Taking App. The user can name it before creation.
- The editor has a top toolbar, searchable component palette on the left, central canvas, and properties panel on the right when an element is selected.
- The toolbar exposes diagram selection, save status, undo/redo, import/export, and fit-to-view. Canvas controls offer zoom and pan.
- Use a light dotted canvas, crisp cards, readable typography, restrained category colors, and recognizable technology icons with text labels. Provide a generic icon fallback; icons must not require runtime third-party requests.
- Primary target is desktop pointer and keyboard use. At narrower widths, panels collapse into drawers to preserve canvas space. A dedicated phone editing experience is deferred.

## Components and palette

Clicking a category expands its presets. Search matches category, label, and technology across groups. Clicking a preset adds it near the viewport center; dragging it onto the canvas places it at the drop position. New elements are selected immediately.

Initial catalog:

| Category | Presets |
| --- | --- |
| Clients | Generic Client, Web Browser, Mobile App, CLI |
| Compute | Generic Server, API Server, Worker, Serverless Function |
| Databases | Generic Database, PostgreSQL, MySQL, MongoDB, DynamoDB |
| Caches | Generic Cache, Redis, Memcached |
| Messaging | Generic Queue, Kafka, RabbitMQ, SQS |
| Networking | Load Balancer, API Gateway, CDN, DNS |
| Storage | Generic Object Storage, S3, Google Cloud Storage |

Every component has a stable ID, category/type, editable name, optional technology, short preset description, notes, position, and dimensions. Technology choices change presentation only; they do not introduce capacity, protocol, or deployment assumptions. Users may clear or edit the technology label. Preserve a generic type independently of its display name for future analysis.

Single-click selects a component and displays its properties. Dragging moves it without opening a modal. Edits update the canvas immediately. No learning action appears until actual learning content is implemented.

## Connections

- Any component can connect to any other component without compatibility restrictions. Containers and annotations are not connection endpoints.
- Connect via visible handles; each connection stores stable endpoint IDs and handle IDs.
- Optional editable text labels and one-way or bidirectional arrows are supported. Initial direction is one-way, from drag source to target.
- Multiple edges between the same pair are allowed, including opposite directions. Offset parallel paths so they remain individually selectable. Self-connections are allowed and rendered as loops.
- Select a connection to edit its label/direction or delete it. Moving a component preserves its connections.
- Deleting a component removes its incident edges in the same undoable operation.
- Connection labels describe intent; the editor does not validate protocols or claim to simulate traffic.

## Connector configuration follow-up — 2026-10-16

Status: merged into main via PR #4 (`1eb13a1`). Feature status and deferred work are tracked in [the backlog](../../BACKLOG.md). This section extends the original connection requirements. The editor now supports the settings below. Optional additive schema-1 fields `stroke` and `path` retain compatibility with existing files; absent values render as solid + elbow.

### Confirmed requirements

- Stroke style and path shape are independent settings on each connection.
- Stroke choices: solid, dashed, dotted. Default: solid.
- When components and connectors are selected together, expose connector styling under “Connections (N)”, where N is the selected connector count. These edits affect only selected connectors and leave components unchanged.
- Batch stroke/path editing applies to all selected connectors. Each control shows “Mixed” when its selected values differ. Changing one property preserves the other, and one undo restores the entire batch.
- Selected connectors visibly highlight the line with an accent color and slightly increased thickness across all stroke/path styles. Do not add endpoint selection handles in this iteration. Selection feedback must work for individual and multiple selected connectors.
- Every newly drawn connection starts solid + elbow, regardless of the last edited connection. Duplicating a connection preserves its settings.
- Path choices: straight, curved, elbow. Default: elbow, replacing the current curved default.
- Straight means a direct line between endpoints, not a different arrowhead.
- Elbow means horizontal/vertical segments joined by sharp 90-degree turns. Collapse to a straight segment only when the selected handles align and face each other (right-to-left or bottom-to-top, in either direction). Otherwise retain orthogonal turns that leave and enter the chosen sides naturally. Moving components automatically updates the route without changing the attached handles.
- Edit these settings in the connection inspector and retain them across saving, reopening, duplication, export/import, and undo/redo.
- Multiple connections between the same components remain allowed. Straight connectors remain direct endpoint-to-endpoint lines even when they overlap; users can choose different handles or curved/elbow paths to separate them. This is an explicit exception to the original offset-path requirement for parallel straight connectors.
- Self-connections always render as visible loops: rectangular for elbow and rounded for curved. Straight self-connections fall back to rectangular loops, with a brief inspector note explaining the exception.
- Labels remain automatically positioned along their connector. Crossing lines have no bridge arcs or junction dots and do not imply connections. Manual label placement, label overlap avoidance and special crossing indicators are deferred.
- Routing is automatic; no manual bend editing in this iteration. The live drawing preview uses solid + elbow to match newly completed connections.
- Routing is simple for this iteration: paths may cross intervening components or container boundaries. Automatic obstacle avoidance is deferred.
- Existing connections without an explicit path setting use elbow; absent stroke settings use solid. Existing one-way/bidirectional direction is independent of these settings.

### Edge-case decision record

1. Obstacle routing is resolved: simple routing, with no automatic obstacle avoidance. Manual bend editing is deferred.
2. Parallel/reverse straight connections are resolved: preserve straight geometry and allow overlap. Users can choose different handles or curved/elbow paths for separation; no additional overlap-selection control is required for this iteration.
3. Self-connections are resolved: visible rectangular loops for elbow or straight, rounded loops for curved; explain the straight fallback in the inspector.
4. Alignment and handles are resolved for the straight shortcut: chosen handles must align and face each other; moving components updates routing while preserving attachment. Same-side handles retain orthogonal turns. Overlapping cards and very close endpoints still need robust finite routing without a promise of obstacle avoidance.
5. Before this follow-up, multi-selection already existed (Shift-click and select all), but the inspector edited only one selected item. Line-only connector selection highlighting and batch stroke/path editing are approved, including Mixed values and one undo per batch. New connections always start solid + elbow; duplication preserves settings. Mixed component/connector selection exposes Connections (N) styling and changes only selected connectors. The live drag preview uses solid + elbow; manual bend editing is deferred.
6. Labels and crossings are resolved: labels remain automatic; plain crossings have no bridges or junction dots and imply no connection. Manual label placement, label overlap avoidance and special crossing indicators are deferred.

### Validation

Preserve connector reliability during selection, pan, drag and autosave, including the pending-measurement connection-start regression. Cover all stroke/path combinations, horizontal/vertical alignment, non-facing handles, parallel/reverse links, self-loops, and movements that change alignment. Verify one-way/bidirectional arrowheads and selectable dashed/dotted paths. Cover legacy files without settings, invalid setting values, save/reload, import/export, duplication, and undo/redo. Recorded verification: 103 unit tests and 29 Chromium browser tests passed, along with typecheck and production build. New browser checks cover all nine style combinations, actual line selection, solid hit targets, arrowheads, batch Mixed/undo, defaults/preview, save/reopen, duplication/import and visible self-loop selection. Existing drag/measurement-cache regressions remain green. This is not cross-browser certification.

## Rounded elbow routing follow-up — 2026-10-16

Status: implemented on `fix/rounded-elbow-routing`; awaiting merge and deployment. This supersedes the sharp-corner elbow requirement above. The user reported small rectangular detours and requested smoother elbows, with an Excalidraw example.

- Keep three path choices: Straight, Curved, Elbow. Rounded elbows replace sharp elbows everywhere, including existing connections and elbow self-loops; no fourth shape or per-corner setting.
- Elbows retain horizontal/vertical runs joined by gently rounded corners. Reduce the radius for short segments. Aligned facing endpoints remain a straight segment.
- Choose a simple route with as few turns as practical, respecting chosen handle exit/entry directions. Remove unnecessary overshoot, backtracking and self-crossings that create tiny rectangles.
- Self-loops use a compact outside route; choose the shorter direction around the component when possible. Same-handle self-connections remain visible loops. Retain straight self-loop fallback behavior and Curved as a distinct path choice.
- Keep distinct selectable paths for parallel/reverse elbows and preserve stroke styles, selection, labels, arrows and saved endpoint choices.
- Drawing preview uses the same rounded routing as completed elbows. Existing no-obstacle-avoidance and no-manual-bend scope remains.
- Verify screenshot-like perpendicular connections (bottom-to-left and left-to-top), aligned/nonaligned facing handles, same-side/backward/close endpoints, parallel/reverse routes, compact self-loops and no degenerate rounded corners. Browser checks inspect actual path geometry and preview, while retaining prior connector/drag/sticky regressions.

## Annotations and containers

Provide sticky notes, plain text, and resizable labeled containers. Text is plain text; do not render imported HTML. Notes and text can be edited from the properties panel. Sticky notes support a small color palette.

Containers have explicit membership. Moving a container moves its members and updates connected edge paths. Components and annotations can be members; containers cannot be nested in this release.

On drag completion, an element joins the container containing its center. If more than one qualifies, choose the smallest containing rectangle, breaking ties by stable ID. Persist membership explicitly rather than repeatedly inferring it during rendering. Adding a component directly within a container follows the same rule.

Dragging a member out removes membership while preserving its world position. Resizing a container cannot shrink it past its members plus padding. Creating or resizing a container does not silently adopt stationary elements; moving an element into it establishes membership. This keeps resize and overlapping-boundary behavior predictable.

Deleting a container preserves its members at their existing world positions and removes their parent assignment. If the selection explicitly includes both a container and a member, the member is also deleted. Undo restores the complete previous structure.

## Sticky-note sizing follow-up — 2026-10-16

Status: merged into main via PR #5 (`f1568bd`). The user reported text overflowing the fixed sticky-note background.

- Grow the note vertically as necessary to contain its title and body at its chosen width; wrap long words and preserve newlines.
- Show drag-to-resize handles when selected. Support enlarging and shrinking width/height, keeping enough height for the text. Preserve intentionally added whitespace; automatic growth need not shrink a note after text deletion (manual resize controls that).
- Persist dimensions through save/reopen, import/export and duplication. One resize gesture is one undoable operation; text edits and their required growth must undo coherently.
- Keep the existing 10,000-character body limit and 200-character title limit. A visible character counter is deferred. No collapse/expand button is requested.
- Preserve existing container membership and world-position semantics, and retain node/connector measurement-cache stability.
- Verify actual browser text containment, width-dependent wrapping, long titles/words/newlines, all resize directions, undo/redo and persistence. Respect existing portable dimension/document limits.
- Minimum manual/normalized note width is 80px. At the existing 100,000px dimension ceiling, extremely tall text scrolls inside the note. Valid legacy stored notes whose growth would exceed the portable byte budget retain their saved geometry and scroll safely.

Verification: 103 unit tests, 43 Chromium browser tests (14 new sticky-note cases), typecheck, production build and whitespace checks passed. Tests cover all four corners, pure horizontal narrowing from top corners, atomic text-growth/resize history, real text containment, local/file round trips, container membership and legacy stored-note repair. Independent review caught an opposite-edge anchoring defect; the fix passed both new regressions and independent Chromium reproduction. Final visual inspection shows the full text inside the background with all four resize handles.

## Editing and history

Support selection, Shift multi-selection, selection marquee, dragging, pan, zoom, fit-to-view, delete, and duplication. Empty-canvas dragging draws a selection marquee; Space-drag or middle-button drag pans. A pan tool provides an alternative without keyboard modifiers.

Use platform-appropriate Ctrl/Cmd shortcuts for undo, redo, select all, and duplicate. Delete/Backspace deletes selected elements only when no text field is being edited. Escape cancels an in-progress connection or clears selection. Do not hijack normal input editing shortcuts.

Duplicate selected elements with new IDs and an offset. Duplicate edges only when both endpoints are duplicated. Duplicating a container includes its members exactly once. Duplicating a member alone retains its parent if its offset position still fits, otherwise detaches it.

History covers additions, deletions, moves, resize, property changes, membership, and connections. One drag or resize is one history entry; text edits coalesce until blur. History is per open diagram, bounded to 100 entries, and does not survive reload. Switching diagrams clears transient selection and connection state. Viewport changes are saved but do not consume undo history.

## Local saving and portability

Use IndexedDB through a small persistence adapter. Store each diagram separately with a schema version, ID, name, creation/update timestamps, nodes, edges, membership, and viewport. Keep the catalog separate from persisted instances; instance fields must be sufficient to reopen a diagram even if its preset is later removed.

Autosave after edits with a short debounce, flush before changing diagrams, and show Saving, Saved, or Save failed status. Never claim success before the write completes. If a save fails, keep the in-memory document and offer retry and JSON export. Do not discard unsaved work when navigating to another diagram; allow navigation only after saving or an explicit discard choice. Warn on browser navigation while a write is pending, recognizing browsers cannot guarantee last-moment persistence.

New and duplicated diagrams receive new IDs. Duplicate uses a snapshot of the current document, including pending edits. Deleting a saved diagram requires confirmation. Deleting the last diagram returns to the chooser. Browser storage is local to that browser/origin and can be cleared; provide a concise explanation alongside export.

JSON export contains the schema version, diagram content, and viewport, without transient selection or history. Import always creates a new diagram and never overwrites an existing one. Validate before saving: supported version, recognized element kinds, unique IDs, finite coordinates and dimensions, bounded strings, valid endpoints and parent references, and no nested containers. Reject malformed files with useful errors, leaving current work unchanged. Remap IDs consistently on import. Unsupported future schema versions are rejected rather than guessed. Cap imports at 5 MiB, 500 elements, and 1,000 connections; explain exceeded limits. Enforce the same portable limits before accepting editor changes, rejecting a whole operation with an explanation while preserving the previous document, selection, and history. This ensures accepted documents remain saveable and exportable.

Use record revisions to detect another tab changing the same diagram. On a conflict, retain local work and offer saving it as a copy or reloading the stored version; do not silently overwrite.

## Starter diagrams

- Blank: an empty canvas with a brief add-component hint.
- Basic Web App: Browser → API Server → Generic Database, with illustrative connection labels.
- Note-Taking App: Browser → Notes API → PostgreSQL, enclosed in an Application container as appropriate, plus a sticky note describing a modest single-region example and its assumptions.

Templates create independent editable copies. Describe them as starting points, not universally correct architectures. No simulation or performance scores appear.

## Technical architecture

Use React, TypeScript, Vite, and React Flow. React Flow provides graph interaction, handles, viewport transforms, and parented nodes. Custom node rendering provides infrastructure cards, annotations, and boundaries. Use ordinary CSS for the visual system and an icon package plus bundled assets as needed.

Separate the typed diagram model and editing operations from rendering, catalog data, persistence, and import/export validation. Keep history and diagram edits in one state owner so compound operations are atomic; use a reducer rather than adding a global state framework without a demonstrated need. Use a small IndexedDB wrapper if it materially reduces error-prone database boilerplate. No backend or external credentials are needed.

Stable domain types must not depend on React components or icon objects. A serializer maps domain records to the editor representation. Persist actual document changes, not React Flow's temporary dragging or selection flags.

Use the existing isolated checkout at `/workspace/distributed-sim`; no additional worktree is needed. Establish package scripts for development, production build, type checking, unit tests, and browser tests, with a committed lockfile. Preserve the uploaded prototype as reference without overwriting it.

## Validation and acceptance

Unit tests exercise operations where data loss or structural corruption is possible: deleting/undoing containers and components, membership coordinate conversion, duplication and ID remapping, parallel edges, import validation, and history grouping. Persistence tests cover round trips, failed saves, and revision conflicts.

Browser tests verify these user workflows:

1. Start a blank diagram, add components by click and drag, connect and label them, edit properties, and undo/redo edits.
2. Create a container, move members in/out, move the container, delete it without losing members, and undo deletion.
3. Add annotations, zoom/pan, and fit the diagram to the viewport.
4. Create each starter, rename/duplicate a diagram, switch diagrams, reload, and verify stored content and viewport.
5. Export and reimport a diagram as a new document with matching structure; reject invalid input without changing current work.
6. Confirm deletion of a saved diagram; cancel confirmation without losing it.

Run type checking and a production build. Validate keyboard controls, input-focus guards, visible focus, accessible labels, dialog focus handling, and readable selection states. Exercise a representative 100-component/200-edge diagram for responsive dragging and pan/zoom, without claiming a formal performance guarantee.

The release is complete when these workflows pass and there are no dead controls implying deferred capabilities.
