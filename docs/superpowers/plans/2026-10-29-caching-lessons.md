# Caching Fundamentals Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline.

**Goal:** Add the approved eight-card caching foundation to all cache components.
**Architecture:** Add caching.ts and CachingDiagram.tsx, register them in the existing lesson selector and dialog. Reuse existing diagram styles and navigation.
**Tech Stack:** React, TypeScript, Vitest, Playwright. No new dependencies.
**Spec:** ../specs/2026-10-29-caching-lessons-design.md

## Constraints and review focus

- One product-page example; distinguish cached copies from authoritative data.
- Explain that invalidation and TTL do not guarantee freshness during concurrent operations.
- Separate time expiration from memory eviction; do not present fallback as unlimited database capacity.
- All cache presets remain eligible after renaming; unrelated nodes remain unchanged.
- Check all eight cards on desktop, short desktop, and mobile, including preserved canvas state and focus.

## Task 1: Shared caching stack

Files: create src/learn/caching.ts, src/learn/CachingDiagram.tsx, tests/caching-lessons.spec.ts; modify src/learn/lessons.ts, src/learn/lessons.test.ts, src/learn/LessonDialog.tsx.
Interface: cachingLesson follows existing lesson data; CachingDiagram accepts { slide: number }; lessonsFor returns ['caching'] for cache components.

- [x] Add eligibility and browser coverage. Run eligibility tests and observe missing-stack failures.
- [x] Implement eight sourced cards and two diagrams; register selection and rendering.
- [x] Run unit tests, production build, focused lesson browser tests; inspect screenshots.
- [x] Review correctness and perform a separate Ponytail complexity pass; resolve findings and record evidence.

## Execution log

- Baseline: existing 17 lesson tests pass.
- Ruling: work in the current feature checkout because the required lesson framework is uncommitted there. Preserve a before-edit snapshot under /tmp/caching-stack-baseline and limit edits to this feature. No commit or publication of unrelated work.
- User approved the topic and outline and explicitly requested building it; implement that scope without another approval round.

- RED: the three cache preset tests failed because lessonsFor returned []; the other 18 checks passed.
- Implemented the approved eight cards and two diagrams using existing styles and dialog behavior.

## Validation and review log

- GREEN: full Vitest suite passed, 212 tests across 18 files; includes all 21 lesson checks.
- Production build passed. Vite reported the existing large-chunk advisory.
- Browser verification: 7 tests passed using installed Chrome via PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. The first attempt could not launch because Playwright's expected Chromium build was absent; no application test ran in that attempt.
- All eight caching cards exercised at 1280x900, 985x543, and 390x700. Verified no horizontal overflow, accessible navigation, source links, two diagrams, keyboard navigation, dismissal/focus restoration, reset on reopening, rename preservation, node count, selection, and viewport. Generic Cache and Memcached entrypoints pass separately; Redis drives the full traversal. Existing client/server and API Server browser checks pass.
- Visually inspected /tmp/caching-1280-2.png, /tmp/caching-390-4.png, and /tmp/caching-390-7.png. Hit/miss diagram, stale price diagram, and mobile failure-under-load card are readable with accessible navigation. Longer cards scroll in the existing dialog.
- Independent read-only review: no actionable correctness or pedagogy findings. Reviewer inspected scoped files and pre-edit snapshots, not unrelated changes; did not independently rerun tests or inspect screenshots.
- Separate engineering-suite-ponytail:ponytail-review pass: No actionable complexity findings. New lesson data and two small diagrams reuse existing rendering, CSS, and navigation. No new dependencies or abstractions.
- Scoped diffs against /tmp/caching-stack-baseline confirm only the caching registration, rendering map, and cache eligibility checks changed in shared files. git diff --check passed.
- Local implementation only, not committed or published. Existing unrelated changes remain in place. Preview started at http://localhost:5173/.
