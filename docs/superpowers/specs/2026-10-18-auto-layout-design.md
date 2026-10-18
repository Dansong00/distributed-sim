# Automatic diagram cleanup

Status: written design approved by the user on 2026-10-18. The [implementation plan](../plans/2026-10-18-auto-layout.md) is approved; implementation and acceptance checks are complete on `feat/auto-layout`; final review and publication pending.

## Goal and agreed behavior

Make complex architecture diagrams easier to follow by freely rearranging their contents to reduce tangled connections. The motivating diagram contains a request path, shared storage/cache services, workers, a messaging service and explanatory sticky notes. Alignment alone does not resolve its overlapping connection paths.

The user approved a whole-diagram Clean up action, a preview with Apply/Cancel, one-step undo, preservation of diagram meaning and container membership, and permission to change connector attachment sides. Connected notes travel with the relevant components; unconnected notes move into a separate notes area. Computation is deterministic and local to the browser; no language model or external service is involved.

This is best-effort graph layout, not a promise that every diagram becomes crossing-free. Existing straight/curved/elbow styles remain intact. Their current renderers may still produce crossings or shared segments even after placement improves.

## Proposed first-release defaults

These details resolve edge cases for review rather than introducing additional controls:

- Clean up operates on the entire open diagram, irrespective of selection. Primary flow is left-to-right. Selection-only layout, alternative orientations and pinned items are deferred.
- Rearrange components and connected notes using actual saved dimensions; preserve text, names, technologies, colors and component/note sizes. Reserve spacing around cards and labels. Never truncate note content to make layout fit.
- Treat single-level containers as groups: lay out their contents and arrange groups with the surrounding graph. Preserve every parent ID. Grow a container only when necessary to enclose its children with the existing padding; do not silently remove, shrink or nest containers. Empty containers remain present.
- A sticky note connected directly or through other notes to the component graph participates in that graph. A note attached to several components has no invented single owner; place it near the connected cluster according to its links. Preserve its container even if it links outside that container.
- Unconnected notes and note-only connected groups go into a separate notes area within their existing parent scope, using non-overlapping rows and their real dimensions. Unconnected text annotations join this area because the model has no reliable text-to-component association. Preserve links within note-only groups.
- Disconnected component subgraphs are arranged as separate blocks with consistent spacing. Isolated components are retained. Cycles, reverse links, bidirectional links and self-loops must not prevent layout. Arrow directions are never changed to make an acyclic graph.
- Choose new cardinal attachment sides from the resulting layout. Preserve source/target IDs, direction, labels, stroke and path. Keep distinct parallel links and visible self-loops; straight parallel links may still overlap as already documented. Cleanup never changes remembered connector preferences.
- Stable element/edge ordering and fixed algorithm settings make the same diagram produce the same result. Repeating cleanup on unchanged contents should not cause continuing positional drift.

## User interaction and data safety

1. Clean up is available when an open diagram contains elements and is editable. Finish active text/drag transactions first. Do not start while a document conflict or invalid unsaved edit blocks normal editing.
2. Capture a snapshot and calculate a candidate layout. Show a busy state with Cancel; do not block browser interaction during layout computation.
3. Show the candidate on the canvas with Apply and Cancel. Fit the candidate into view. Allow pan/zoom inspection, but disable content edits, diagram switching and other mutations until the user applies or cancels. Escape cancels.
4. Keep the candidate separate from the live document and history. Autosave may finish saving the original document, but must never save unapproved positions. Export must not accidentally export the candidate; disable it during preview.
5. Apply validates the complete candidate against existing element, coordinate, dimension and portable-file limits, then commits positions, container dimensions and handle changes together as one undoable operation. Normal autosave follows. A no-op creates no history entry. Undo/redo restores/reapplies content geometry and attachment sides together; viewport continues to follow the existing separate viewport-history policy.
6. Cancel restores the pre-preview canvas and viewport without dirtying the document or adding history. Canceling an in-flight computation invalidates its result. Errors and invalid/oversized results leave the original diagram intact and show a useful message.
7. Results are tied to the captured diagram identity and content. If another tab changes the stored diagram or the session changes while work is pending, invalidate the candidate and use the existing conflict handling. Never apply stale layout over a newer document.

## Technical direction

The repository already uses React Flow, persisted node dimensions and cardinal handles, single-level parent-relative containers, and transactional document history. It has no automatic layout engine. Rendering geometry and calculating placement are separate concerns.

Prefer an established layered layout engine with compound-graph support, such as ELK, behind a small diagram-to-layout adapter. A lighter engine such as Dagre offers simpler flat layout but needs additional grouping work; a custom crossing-minimization algorithm would add considerably more code and maintenance. Confirm the chosen engine's browser worker packaging, license, deterministic settings and compound-edge behavior during implementation planning before adding a dependency.

The adapter must preserve IDs, transform parent-relative/world coordinates correctly, and return only allowed geometry and attachment changes. Use explicit dimensions rather than querying live DOM positions during layout. Ignore self-loops as ranking constraints while preserving them in the result. Use the existing edge renderers for final drawing; do not store an engine's bend points that those renderers cannot reproduce. Container boundaries are groups, not connection endpoints.

Perform calculation outside the main UI thread where necessary to keep Cancel responsive up to the existing 500-element/1,000-connection limits. Keep the job/result lifecycle local to cleanup rather than introducing a general background-task framework. Existing storage and history remain authoritative; the preview is temporary UI state.

## Acceptance checks

- A representative client/API/cache/database/queue/worker graph with cross-links produces a readable left-to-right arrangement, consistent gaps and no card overlap. Compare the visible result, not only coordinates.
- Container members stay within their original containers; cross-container links, empty containers and non-overlapping disconnected groups remain valid.
- Connected notes, multiply attached notes, note chains, note-only groups, unconnected notes, text and long content follow the stated placement rules without losing content or changing note dimensions.
- All nodes/edges and semantic fields survive. Only positions, necessary container growth and attachment sides change. Test cycles, parallel/reverse links, self-loops and every path style.
- The same input is deterministic; repeated cleanup is stable. Finite output validates against existing bounds. Layout failure or an over-limit result never partly changes a diagram.
- Preview never autosaves candidate geometry. Apply is one undo/redo step and survives save/reopen and JSON round trips. Cancel/Escape, canceled computation, stale results, conflict arrival and storage failure preserve existing recovery behavior.
- Test representative large diagrams for responsive cancellation and report measured behavior; do not claim performance at the limits without measuring it. Retain existing dragging, connector, sticky resizing and persistence regressions.

## Deferred

Manual routing/bends, obstacle-aware connector routing, guaranteed label collision avoidance, bridge arcs, hovered-path tracing, selection-only cleanup, pinned elements, configurable orientation and automatic relayout while editing. These are separate follow-ups, not hidden prerequisites for the first cleanup button.
