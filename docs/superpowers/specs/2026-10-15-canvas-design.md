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

## Annotations and containers

Provide sticky notes, plain text, and resizable labeled containers. Text is plain text; do not render imported HTML. Notes and text can be edited from the properties panel. Sticky notes support a small color palette.

Containers have explicit membership. Moving a container moves its members and updates connected edge paths. Components and annotations can be members; containers cannot be nested in this release.

On drag completion, an element joins the container containing its center. If more than one qualifies, choose the smallest containing rectangle, breaking ties by stable ID. Persist membership explicitly rather than repeatedly inferring it during rendering. Adding a component directly within a container follows the same rule.

Dragging a member out removes membership while preserving its world position. Resizing a container cannot shrink it past its members plus padding. Creating or resizing a container does not silently adopt stationary elements; moving an element into it establishes membership. This keeps resize and overlapping-boundary behavior predictable.

Deleting a container preserves its members at their existing world positions and removes their parent assignment. If the selection explicitly includes both a container and a member, the member is also deleted. Undo restores the complete previous structure.

## Editing and history

Support selection, Shift multi-selection, selection marquee, dragging, pan, zoom, fit-to-view, delete, and duplication. Empty-canvas dragging draws a selection marquee; Space-drag or middle-button drag pans. A pan tool provides an alternative without keyboard modifiers.

Use platform-appropriate Ctrl/Cmd shortcuts for undo, redo, select all, and duplicate. Delete/Backspace deletes selected elements only when no text field is being edited. Escape cancels an in-progress connection or clears selection. Do not hijack normal input editing shortcuts.

Duplicate selected elements with new IDs and an offset. Duplicate edges only when both endpoints are duplicated. Duplicating a container includes its members exactly once. Duplicating a member alone retains its parent if its offset position still fits, otherwise detaches it.

History covers additions, deletions, moves, resize, property changes, membership, and connections. One drag or resize is one history entry; text edits coalesce until blur. History is per open diagram, bounded to 100 entries, and does not survive reload. Switching diagrams clears transient selection and connection state. Viewport changes are saved but do not consume undo history.

## Local saving and portability

Use IndexedDB through a small persistence adapter. Store each diagram separately with a schema version, ID, name, creation/update timestamps, nodes, edges, membership, and viewport. Keep the catalog separate from persisted instances; instance fields must be sufficient to reopen a diagram even if its preset is later removed.

Autosave after edits with a short debounce, flush before changing diagrams, and show Saving, Saved, or Save failed status. Never claim success before the write completes. If a save fails, keep the in-memory document and offer retry and JSON export. Do not discard unsaved work when navigating to another diagram; allow navigation only after saving or an explicit discard choice. Warn on browser navigation while a write is pending, recognizing browsers cannot guarantee last-moment persistence.

New and duplicated diagrams receive new IDs. Duplicate uses a snapshot of the current document, including pending edits. Deleting a saved diagram requires confirmation. Deleting the last diagram returns to the chooser. Browser storage is local to that browser/origin and can be cleared; provide a concise explanation alongside export.

JSON export contains the schema version, diagram content, and viewport, without transient selection or history. Import always creates a new diagram and never overwrites an existing one. Validate before saving: supported version, recognized element kinds, unique IDs, finite coordinates and dimensions, bounded strings, valid endpoints and parent references, and no nested containers. Reject malformed files with useful errors, leaving current work unchanged. Remap IDs consistently on import. Unsupported future schema versions are rejected rather than guessed. Cap imports at 5 MiB, 500 elements, and 1,000 connections; explain exceeded limits.

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
