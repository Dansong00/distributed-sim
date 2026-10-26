# Reconnect connector endpoints

## Approved behavior
Select a connector to reveal endpoint handles. Drag either endpoint to another component or sticky note, including another attachment point on the same node. Preserve its ID, label, comments, direction, stroke, and path. A successful drop is one Undo step. Invalid drops and Escape leave the original connection unchanged. Read-only previews must not reconnect.

## Implementation
- Use React Flow's native reconnection anchors and callbacks.
- Update only the existing edge's endpoints through the existing history transaction.
- Guard the final callback after Escape; do not remove an edge on a failed drop.
- Show small outlined handles on selected connectors only.
- Keep this feature separate from pending lessons and panel changes. User approved publishing on 2026-10-26. Release from current main in an isolated checkout.

## Verification
- Before implementation, six focused tests failed because reconnection was unavailable.
- After implementation, all 12 Canvas tests passed, including two successful endpoint changes and cancellation/no-op/read-only checks using the real history reducer.
- Full unit suite: 208 tests passed. Production build passed with the existing large-chunk warning.
- Browser: 9 tests passed across reconnect, Auto mode, and connector settings. Covers both ends, a sticky note as the source, same-component attachment changes, preservation, one-step Undo/Redo, reopen, invalid drop, Escape, no-op drop, and a fresh drag after cancellation. Added a regression for Escape before the first movement; it failed before the cancellation fix and passed afterward.
- Inspected /tmp/reconnect-endpoints.png: outlined endpoint handles visible on the selected connector.
- git diff --check passed. Existing known sticky-resize geometry test was not part of this targeted browser run.

## Review log
Independent reviewer Halley found one correctness issue at src/editor/Canvas.tsx onReconnectStart: Escape before crossing the drag threshold was overwritten by the delayed start callback. Fixed by retaining cancellation through the pointer gesture and resetting it on a fresh press. The browser regression reproduced the change before the fix and now passes.

Follow-up correctness review: no remaining findings. Separate Ponytail pass: No actionable complexity findings. Reviewer inspected the code and regression; main agent confirmed the subsequent 208-unit, 9-browser, and production-build passes.

## Release verification
- User approved shipping this feature on 2026-10-26.
- Applied only the connector change to main at 85ae36551a855fd6ea4a99c5909e6b02f22503c3.
- Isolated release: 208 unit tests and 9 targeted browser checks passed. Production build with /distributed-sim/ base passed, with the existing bundle-size warning.
- git diff --check passed. Temporary browser configuration and dependency symlink are excluded from the release.
- Final independent release review by Copernicus: no actionable correctness/spec findings. Separate Ponytail pass: No actionable complexity findings. Tests inspected by reviewer; reruns performed by the main agent as recorded above.
