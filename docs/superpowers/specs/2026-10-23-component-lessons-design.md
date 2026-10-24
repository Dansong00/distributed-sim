# Contextual Component Lessons

## Approved Experience

Open a short Client / Server Model deck from the selected component's Properties panel. A book icon and descriptive Learn button sit below the component description and above Notes. The lesson opens in an overlay over a dimmed canvas. Closing returns to the same diagram, selection and viewport; reading never changes the diagram or undo history.

The five slides, in order, are What Is It?, Core Concept, Variants, Trade-offs, and Interview Tip. Use original explanations and focused diagrams where helpful. The supplied screenshots guide organization and behavior, not factual authority or copied wording.

Navigation uses left/right icon buttons and ArrowLeft/ArrowRight keys, a visible position such as 2 of 5, and disabled boundary buttons without wraparound. Close with Escape, an X icon, or a click on the dimmed backdrop. Focus stays in the modal and returns to the opener. Reopening starts at slide 1. Body content scrolls on short screens while navigation remains reachable.

## Content and Editorial Ownership

The user supplies references and reviews the draft. The assistant writes original copy, verifies technical claims against primary sources, and supplies references. Store the lesson as a dedicated repository content module with a stable ID, ordered slides, source references and an honest last-reviewed date. Updates use ordinary reviewed releases; no remote content loading or CMS.

Draft scope: explain the client/server exchange, responsibilities and request/response flow; contrast stateful and stateless service designs; explain relevant costs and failure modes; offer requirement-driven interview advice. Separate definitions from heuristics. Load balancing is an optional extension, not a universal requirement. Present the content for editorial review before publishing.

## Implementation Boundaries

Reuse the existing native Dialog component. Backdrop dismissal and lesson sizing are opt-in; other dialogs retain their behavior. Keep the canvas mounted and lesson state transient. Use existing Lucide icons. Avoid new dependencies, persistence/schema changes, quizzes, completion tracking, a learning home page, search and generic lesson-authoring infrastructure.

Initial eligibility uses persisted componentType values client and server, not editable names or Technology. This includes the existing client presets and Compute presets; they share broad catalog types. Offer the same clearly titled Client / Server Model lesson, not a specialized lesson for each preset. Hide the action for unrelated components, annotations, connections and multi-selections. Disable it during cleanup or other blocked editor operations.

## Acceptance

- All five slides are reachable using buttons and keyboard; boundaries do not wrap.
- Escape, X and backdrop close; clicks within the overlay do not close it.
- Dialog focus is contained and restored; editor shortcuts do not mutate the canvas underneath.
- Opening/reading/closing leaves document data, selection, viewport and undo history unchanged.
- Desktop and narrow/short viewport checks show readable diagrams and no clipped controls.
- Existing dialogs and the full test/build checks still pass.
