# Caching Fundamentals design

Approved scope: the user accepted the eight-card proposal and requested implementation on 2026-10-29.

Teach caching through one popular product page: repeated reads, cache hits and misses, cache-aside, a changed price, expiration and eviction, local versus shared caches, failure under load, and deciding whether caching is worthwhile.

Use the existing lesson dialog and data format. Provide one shared Caching Fundamentals stack for Generic Cache, Redis, and Memcached. Select by cache component type/category, never display name. Include plain language, emphasized concepts, primary-source links, and two targeted diagrams. Preserve navigation, dismissal, focus restoration, and diagram state.

Approaches: a shared foundation fits all three components and is the approved choice. Separate product decks would repeat these basics; Redis-specific details are deferred. No traffic simulation, dependencies, persistence changes, quizzes, or new lesson framework.

Acceptance: eight cards; all three cache presets expose the stack even after renaming; unrelated components and annotations do not; every card works at desktop and narrow widths without horizontal overflow; keyboard navigation, reset on reopen, and canvas state remain intact.
