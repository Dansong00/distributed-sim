# Default Auto canvas mode

Approved in chat: add Auto as the default. Drag empty canvas to pan, click a component to select it, and drag a component to move it. Keep Select and Pan as manual overrides.

The alternatives were changing Select's existing behavior or automatically switching the visible mode as the pointer moves. A separate Auto option preserves explicit Select box-selection and Pan behavior without changing modes underneath the user.

Use existing React Flow gesture options. Preserve Shift multi-selection, Space temporary pan, connectors, sticky notes, undo, viewport persistence, and cleanup read-only mode. No storage migration, new dependencies, custom gesture engine, or persisted tool preference. The tool remains session-local as today.
