# Component Lessons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Read one five-slide Client / Server Model lesson from the inspector and return to an unchanged diagram.

**Architecture:** Repository-owned content feeds a focused lesson overlay built on the existing native Dialog. Inspector supplies an opt-in callback and App owns transient open state; diagram persistence remains unchanged.

**Tech Stack:** Existing React, TypeScript, Lucide, CSS, Vitest and Playwright. No new packages.

**Spec:** `docs/superpowers/specs/2026-10-23-component-lessons-design.md`

## Global Constraints

- Exactly five sections: What Is It?, Core Concept, Variants, Trade-offs, Interview Tip.
- No quizzes, completion tracking, CMS, remote content loading or diagram schema changes.
- Native modal, dimmed backdrop, Escape/X/backdrop dismissal, bounded arrows and focus restoration.
- Content is original, verified against primary sources and reviewed before publication.
- Preserve diagram, selection, viewport and undo history; keep the canvas mounted.

## Review Focus

- Editor shortcuts while reading must not delete, move or undo canvas content (Task 2 browser test).
- Clicking inside the dialog or dragging from inside to outside must not accidentally dismiss (Task 1 browser test).
- Narrow and short screens must keep navigation and close controls reachable (Task 2 viewport checks).
- Renamed components and multi-selections must retain correct eligibility (Task 2 inspector tests).
- Other native dialogs must not acquire backdrop dismissal (Task 1 regression test).

## Task 1: Content and Accessible Lesson Overlay

**Files:** Create `src/learn/client-server.ts`, `src/learn/LessonDialog.tsx`, `src/learn/LessonDialog.test.tsx`; modify `src/ui/Dialog.tsx`, `src/styles.css`; create `tests/e2e/component-lessons.spec.ts`.

**Interfaces:** Content exports `clientServerLesson` with ID, title, five ordered slide records, references and reviewed date. `LessonDialog({ onClose }: { onClose: () => void })` consumes that content. Extend Dialog with optional `className?: string` and `closeOnBackdrop?: boolean` (default false).

- [ ] Draft original concise copy and diagrams; verify claims using primary sources and include source links. Present draft for user editorial review before publishing.
- [ ] Write tests asserting five ordered sections, initial 1 of 5, bounded navigation, X callback and source links. Run `npm test -- src/learn/LessonDialog.test.tsx` and confirm missing implementation fails.
- [ ] Implement the content module and overlay with Lucide arrows/X, accessible button names, visible position and slide heading updates. Keep diagram assets local and inspect them visually. Do not introduce a generic content renderer or new graph engine for this one deck.
- [ ] Extend Dialog minimally with opt-in sizing and backdrop dismissal. Require a pointer gesture originating and ending outside dialog bounds; preserve native cancel/focus behavior.
- [ ] Add browser coverage for Escape, backdrop, inside clicks, inside-to-outside drag, focus trapping/restoration and an existing confirmation dialog ignoring backdrop clicks.
- [ ] Run focused tests and build. Record correctness and separate Ponytail complexity review findings in the review log; resolve findings before Task 2.

## Task 2: Inspector Entry and End-to-End Verification

**Files:** Modify `src/editor/Inspector.tsx`, `src/editor/Inspector.test.tsx`, `src/app/App.tsx`, `tests/e2e/component-lessons.spec.ts`, `README.md`, `docs/BACKLOG.md`.

**Interfaces:** Inspector accepts optional `onLearn?: () => void`; show the Learn button only for exactly one selected component with componentType client or server and no selected edges. App opens LessonDialog without dispatching history actions or unmounting Canvas. Closing clears only lesson state.

- [ ] Add failing inspector tests: client/server eligible after rename; database, annotations, edges and multi-selection ineligible; disabled inspector cannot open lesson. Run `npm test -- src/editor/Inspector.test.tsx` to establish failure.
- [ ] Add the book-icon Learn action beneath description and transient App dialog state using existing blocked-state handling. Use the clear label Learn about client/server.
- [ ] Extend browser tests: all five slides via buttons and keyboard; reopening resets; document, selection, viewport and undo state unchanged after reading/closing. Exercise Delete, arrows and undo shortcuts with modal focus to prove background isolation.
- [ ] Inspect screenshots at desktop 1280x800 and narrow/short 390x700 and 1100x600 viewports. Verify real assets, scrolling, focus indication and all controls fit.
- [ ] Run `npm test`, `npm run build`, and the focused Playwright spec using the repository's browser configuration. Start or reuse a verified dev server and give the user its URL for content/UI review.
- [ ] Update README/backlog with delivered scope only. Perform final correctness/spec review and separate Ponytail complexity review; record evidence below. Do not merge or publish without authorization.

## Review Log

2026-10-24 trade-offs correction: replaced the lost-response example with approved client/server benefits and costs, a matching two-column comparison, and an MDN source about client/server responsibilities. Removed obsolete failure-diagram branches, icon and CSS. Production build and focused Playwright test pass; the test asserts the new heading and comparison labels. Screenshot inspected. Correctness and separate complexity pass: no actionable findings for this scoped change.

2026-10-23 visual/copy follow-up: moved the lesson entry below Notes, matched button font/borders/icon alignment, styled navigation and source links, replaced inline diagram labels with separate request/response flows and a two-column state comparison. Rewrote all five slides in plain English without changing the lesson scope. Existing 179 tests and production build pass; browser coverage now visits all five slides and checks both navigation boundaries. Desktop and mobile screenshots inspected. Correctness review retained native focus/dismissal behavior. Separate Ponytail complexity pass: no actionable complexity findings; no new dependencies or generic diagram engine.

Implemented 2026-10-23: approved five-slide copy, source links, inspector entry, portal-mounted native modal, bounded arrow navigation and three dismissal methods. Ruling: lesson state lives in Inspector because it has one entry point; a portal prevents responsive inspector visibility from hiding the modal. No diagram state or schema changes. Eligibility uses broad persisted client/server types as approved during grilling.

Verification: 179 existing unit tests passed; production build passed; new Playwright flow passes for button/keyboard navigation, reopening, all dismissal methods, focus restoration and narrow-screen navigation. Desktop and 390x700 screenshots inspected. Independent review found a focus-loss bug when switching from a source link, allowing Delete to reach the canvas; fixed by retaining the article and focusing its persistent heading before navigation, with browser regression. Separate Ponytail review reported no actionable complexity findings. Full browser suite and exhaustive persistence/history checks have not been run. No publish or merge performed.

Planning: checked against approved scope and current Inspector, Dialog, catalog and model. Existing componentType groups are broader than individual presets; eligibility deliberately uses those stable values instead of editable labels. Implementation and validation have not run.
