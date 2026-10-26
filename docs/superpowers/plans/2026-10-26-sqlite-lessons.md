# SQLite Learning Stack

## Approved Scope

Add the approved nine-slide, concept-led SQLite deck below Database Overview when a SQLite component is selected. Examples are optional and do not drive the whole deck. Reuse the existing modal, source links, bold labels, and navigation. Keep the active diagram, selection, viewport, and history intact.

## Implementation

- Add SQLite content and register it in the existing lesson and diagram maps.
- Match the normalized Technology field, consistent with PostgreSQL and API Server. Renaming a component does not change eligibility.
- Use four diagrams for embedded versus separate processes, writer contention, WAL/checkpoints, and index access. Other slides use the approved explanatory text.
- Extend existing database browser coverage to both products, with SQLite's nine-slide count and bold ACID labels.

## Verification and Review

The production build and 17 focused lesson unit cases pass. Eight browser cases pass: PostgreSQL and SQLite at 1280x900, 985x543, and 390x700, plus existing component lesson cases. They verify ordered entries, every slide, independent reset, navigation boundaries, focus restoration, keyboard isolation, horizontal fit, and preservation of selected nodes and viewport. Desktop opening-slide and mobile WAL screenshots inspected. Existing Vite bundle-size advisory remains; the full unit/browser suites were not rerun for this addition.

Correctness/spec review: no actionable findings. All nine approved topics are present, important terms use semantic strong labels, and SQLite remains below the shared overview. No new persistence or dependencies.

Separate Ponytail complexity pass: No actionable complexity findings. Reused labeled paragraphs, diagram CSS, and browser scenarios. No content framework or formatting parser added.

Release approved on 2026-10-26. Prepared in an isolated checkout from current main (c30ac84), preserving unrelated in-progress workspace changes. All 208 unit tests, production build, and eight focused browser cases pass on the release checkout. The full browser suite was not rerun. Final correctness/spec review and separate Ponytail complexity pass found no actionable issues. Existing bundle-size advisory remains.

## Editorial Sources

SQLite official documentation: Appropriate Uses, Datatypes, STRICT Tables, Foreign Keys, Transactions, synchronous PRAGMA, Isolation, WAL, Query Planning, Online Backup API, and ALTER TABLE. Sources were checked during the approved draft; slides retain direct source links.
