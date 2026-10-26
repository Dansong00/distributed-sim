# Stacked Component Lessons

## Approved Scope

API Server shows Client / Server Model first and API Server second below Notes. Each button opens an independent five-slide deck in the existing overlay. Other clients and servers keep the shared deck only. No mobile-specific content, quizzes or persistence changes. API content follows the user-approved What Is It?, Core Concept, Variants, Trade-offs and Interview Tip draft.

## Implementation and Decisions

- Added a small lesson lookup and ordered eligibility function, reusing the same shared content object.
- Passed the chosen lesson ID into the existing modal; keyed instances reset navigation between decks.
- Added API-specific content and diagrams, with MDN, OWASP and Microsoft primary references.
- Eligibility uses the current server Technology field, normalized for case and whitespace. API Server presets and existing starter/imported API nodes work without migration. Renaming Name does not change eligibility. Changing Technology intentionally changes the specific lesson available. No preset-identity schema was introduced.
- Existing uncommitted SQLite edits are left untouched.

## Verification and Review

187 unit tests and production build pass. Seven new unit cases cover ordering, renamed API nodes, technology changes, unrelated presets and five-slide structure. Both lesson browser tests pass, covering separate decks, all five slides, reset, focus restoration and narrow-screen navigation. Desktop and narrow screenshots inspected. Full browser suite not rerun; prior release has a known unrelated sticky-connection geometry failure.

Correctness/spec pass: no actionable findings for the scoped change. Separate Ponytail complexity pass: no actionable complexity findings. No new dependencies, schema changes or generic content engine. Content and diagrams remain separate from saved diagrams. Not committed or published.
