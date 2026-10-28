# Replication learning stack implementation plan

Goal: Add the approved nine-card Replication deck immediately after CAP for every database component, before any product-specific deck.

Spec: Approved draft in this conversation. Plain English, bold concept labels, sources, and existing modal behavior. Release approved on 2026-10-28. Prepared from main at 0bd80d7acff4b4560ceea64d8ee56b90043a5d94.

Architecture: Add replication.ts and ReplicationDiagram.tsx; register in lessons.ts and LessonDialog.tsx. Reuse existing paragraph renderer, diagrams styles, and navigation. No new dependencies or persistence.

- [x] Extend selection tests and observe failure before wiring Replication.
- [x] Add the approved nine cards, targeted diagrams, and ordered database eligibility.
- [x] Extend browser coverage for navigation, reset, focus, viewport preservation, and desktop/mobile layout.
- [x] Run unit suite, production build, and focused browser matrix; inspect screenshots.
- [x] Review correctness and perform separate Ponytail complexity pass; record results below.

Review focus: all database families, name/technology changes, non-database exclusions, under ten slides, and preservation of existing decks.

Review log:
- Correctness/spec: nine approved cards implemented with bold concept labels and sources; three diagrams clarify the copy process, stale reads, and safe failover. Ordering is overview, CAP, Replication, then product deck for all databases. Existing unrelated component behavior is preserved. Reviewed changed integration files against a before-edit snapshot, plus new content and diagrams.
- Selection checks initially failed on the nine affected database cases. All 17 lesson tests subsequently passed as part of the full 208-test unit suite (18 files).
- Production build passed with the existing bundle-size advisory. Focused browser matrix: 11 passed across 1280x900, 985x543, and 390x700. Covers all nine Replication cards, bold acknowledgment concepts, ordering, keyboard navigation, disabled boundaries, close/reopen reset, focus restoration, and canvas selection/viewport preservation. Full browser suite not run.
- Inspected desktop synchronous-replication screenshot and mobile lag/failover screenshots. No actionable layout findings. git diff --check passed.
- Separate engineering-suite-ponytail:ponytail-review pass: No actionable complexity findings. Reuses existing lesson data, modal, selection logic, paragraph rendering, and diagram styles. No new dependency or persistence.
- Release prepared in an isolated checkout; unrelated local changes preserved.

Release verification (2026-10-28):
- Fresh isolated-release checks: 208 unit tests passed across 18 files; production build passed with the existing bundle-size advisory; all 11 focused browser tests passed across desktop, tablet, and mobile. Full browser suite not run.
- Final correctness/spec review: seven scoped files only; nine cards, registration, ordering after CAP for every database, existing dialog behavior, and product decks verified. Mobile failover screenshot inspected. No actionable findings.
- Separate final engineering-suite-ponytail:ponytail-review pass: No actionable complexity findings. Existing data shape, renderer, styles, and test matrix are reused. No new dependencies or speculative abstractions. Lean already. Ship.
