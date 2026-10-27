# MySQL Learning Stack

## Approved Scope

Add the approved nine-card, concept-first MySQL deck below Database Overview for MySQL components. Use MySQL 8.4 with InnoDB as the reference. Reuse bold labels, source links, modal behavior, and the existing visual style. Examples support individual concepts rather than driving the deck.

## Implementation

Added mysql.ts and MySQLDiagram.tsx. Registered the deck and normalized Technology eligibility using the existing patterns. Diagrams cover client/server access, the InnoDB engine, secondary-to-clustered index lookups, replica lag, and point-in-time recovery. Added no dependencies, persistence changes, or new content abstractions.

Extended existing eligibility tests for MySQL, renaming, and technology changes. Extended the database browser matrix to MySQL with nine slides and emphasized ACID concepts. MongoDB remains the shared-overview-only fallback scenario.

## Verification

Three new/changed eligibility expectations failed before implementation and then passed. All 17 focused lesson unit cases, the production build, and 11 component/database browser cases pass. Browser coverage traverses every database slide at 1280x900, 985x543, and 390x700 and checks ordered entries, bounded navigation, independent reset, focus restoration, Delete isolation, horizontal fit, and preserved selection/viewport. Inspected desktop index and mobile replication screenshots. Local dev server started at localhost:5173 for review.

Full unit and browser suites were not rerun. Existing Vite bundle-size advisory remains.

## Review

Correctness/spec review: no actionable findings. All nine approved topics are present. MySQL follows the overview, edited display names do not change eligibility, and the approved InnoDB/version scope is explicit.

Separate Ponytail complexity pass: No actionable complexity findings. Existing paragraph rendering, CSS, and test scenarios are reused; no parser or authoring framework was added.

Official MySQL documentation was checked during the approved draft: What is MySQL, InnoDB, SQL modes, CHECK constraints, transactions, isolation, deadlocks, clustered/secondary indexes, replication, and point-in-time recovery. Slides retain direct reference links.

Initial implementation was local; release approved on 2026-10-27. Unrelated workspace changes preserved.

## Clarity Review Follow-up

Addressed all eleven browser comments in cards 1-5. Explained client/server as separately running programs on the same or different computers and replaced the ambiguous opening takeaway. Removed the visible MySQL version statement while retaining InnoDB scope. Separated column types, primary-key uniqueness/non-null requirements, foreign keys, and other constraints. Defined strict mode using an invalid integer-input example.

Defined transaction and commit before autocommit. Added concrete consistency rules, row-version/lock mechanisms for isolation, and redo-log flushing and crash recovery for durability. Explained Repeatable Read with plain SELECT and a price example, including visibility of a transaction's own changes. Described update locks, their release at transaction end, locking reads, and a two-transaction deadlock.

Verified technical wording against official documentation for consistent nonlocking reads, locking reads, strict SQL mode, and innodb_flush_log_at_trx_commit. Source URLs remain version-pinned for reference accuracy; lesson prose is version-neutral.

Production build and all three MySQL browser cases pass at desktop, short-window, and mobile sizes. Inspected desktop ACID and mobile concurrency screenshots. Nine-card count unchanged. Correctness review: no actionable findings. Separate Ponytail pass: No actionable complexity findings; changes are content and opening-diagram labels only. No dependencies or new rendering features. Existing bundle-size advisory remains.

## Release Verification

Prepared in an isolated checkout from current main (7d82a1d). The release includes only the MySQL deck, diagrams, registration, related tests, and this plan. All 208 unit tests, production build, and 11 focused browser cases pass on the release checkout. Browser cases cover the shared overview, all three database stacks, and existing component lessons across desktop and mobile layouts. The full browser suite was not rerun. Final correctness/spec and separate Ponytail complexity reviews found no actionable issues. Existing bundle-size advisory remains.
