# Database Overview and PostgreSQL Lessons

## Approved Scope

Two independently navigable decks, each eight slides, opened from the existing Properties learning list. PostgreSQL shows Database Overview first, then PostgreSQL. Other database components show the shared overview. Name edits preserve eligibility; the current Technology field chooses the product-specific deck, matching the API lesson behavior.

The overview connects data models to replication, CAP, and costs. Compare relational, document, key-value, wide-column, graph and vector workloads, including geospatial/extension overlap. Do not assign CP/AP labels by database family. The PostgreSQL deck follows the same order/inventory example through relationships, constraints, ACID, competing purchases, indexes, replica lag and costs. Distinguish ACID consistency from CAP consistency.

CAP as a separate deck, SQLite and MySQL content remain pending editorial drafting. Do not expose unfinished entries. No quizzes, persistence changes, new dependencies or content management system.

## Implementation

- Added repository-owned content modules `src/learn/databases.ts` and `src/learn/postgresql.ts`, with primary source links and reviewed date.
- Extended the existing lesson lookup and component eligibility. The broad overview appears for the Databases category and legacy generic database types. Product-specific selection uses normalized Technology, not editable Name.
- Added `DatabaseDiagrams.tsx` and scoped CSS: a tables/document comparison, partition and replica examples, ACID transaction boundary, conditional stock update and explicit paired costs.
- Replaced the two-deck conditional renderer with an exhaustive map for the four available deck IDs. Existing overlay lifecycle, navigation and focus behavior are reused.
- Kept the separately prepared SQLite, header and panel edits intact. Reviewed the panel implementation and reran its focused tests with the lessons.

## Verification and Review

Observed nine eligibility tests fail before implementation and pass afterward. The full unit suite passes: 197 tests in 17 files. Production build passes. Vite reports a JavaScript chunk above its advisory 500 kB size threshold; no code splitting or threshold changes added for this slice.

Fourteen Playwright cases pass across database lessons, existing component lessons, retractable panels and accessibility. Database tests traverse every slide in both decks at 1280x900, 985x543 and 390x700, check horizontal fit, navigation boundaries, focus restoration, independent reset, Delete isolation, selection, node count and viewport preservation. Product changes update lesson eligibility. Desktop, short-window and phone screenshots inspected. The full browser suite was not rerun.

Independent correctness/spec review: no actionable findings. The reviewer could not run tests due to sandbox temporary-write restrictions; execution evidence above is from the parent. Separate Ponytail complexity review: No actionable complexity findings. No generic diagram engine, schema change or new dependency was introduced.

Panel review: desktop booleans remain independent, compact drawers remain mutually exclusive, panels stay mounted, and visibility changes release canvas width. Six panel browser cases and three existing accessibility cases pass in the combined run. Unrelated in-progress header code was preserved.

Initial implementation was local. Release approval received on 2026-10-26.

## Release Verification

Prepared the release on current main (367c15b) in an isolated checkout. Includes stacked lessons, API Server, Database Overview, PostgreSQL, bold concept labels, and the previously requested SQLite palette entry. Unrelated local panels and canvas changes are excluded.

Release checkout: all 202 unit tests and the production build pass. Eight browser cases pass on a separate local server, covering component lessons, all database slides at three viewport sizes, and accessibility. The full browser suite was not rerun. The existing bundle-size advisory remains.

Final correctness/spec review: no actionable findings. Eligibility, deck/diagram order, modal focus restoration, and explicit label rendering match the approved behavior. Separate Ponytail complexity pass: No actionable complexity findings. Existing content records and shared modal support the new decks without dependencies, persistence changes, or an authoring framework.

## Editorial References

### Overview feedback follow-up

PostgreSQL emphasis follow-up: split the ACID definitions into four paragraphs with bold concept labels using the existing labeled-paragraph renderer. Production build and all three database browser cases pass, including mobile and short windows. Correctness review: definitions preserved. Separate Ponytail pass: No actionable complexity findings; content-only change reuses existing rendering.

Reframed slide 2 as Database Choice around queries and data rules. Moved the brief CAP introduction after database families, capabilities, and trade-offs. Removed the overview's replication diagram and simplified consistency and availability definitions while retaining successful responses and the network-partition condition. Six family paragraphs now use explicit labels rendered with semantic strong elements. The deck remains eight slides.

Verification: production build, 17 focused lesson unit tests, and 5 component/database browser tests pass. Browser checks cover all slides at desktop, short-window, and mobile sizes. Inspected mobile model and short-window CAP screenshots. Existing bundle-size advisory remains. Correctness/spec review found no actionable issues. Separate Ponytail pass: No actionable complexity findings; labeled paragraphs use a small data union without a markdown parser or dependency. Changes remain local.

- PostgreSQL: relational model, JSON, constraints, transactions, transaction isolation, indexes, standby replication and asynchronous commit documentation.
- MongoDB: data modeling and embedded document guidance.
- Redis: keys and values documentation.
- Apache Cassandra: logical data modeling and partition design.
- Neo4j: graph database concepts.
- PostGIS: spatial capabilities and documentation.
- pgvector: project documentation for exact/approximate similarity search in PostgreSQL.
- FoundationDB: CAP theorem explanation, including consistency/availability under partitions.
