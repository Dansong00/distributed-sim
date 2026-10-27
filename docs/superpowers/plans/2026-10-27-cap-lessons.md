# CAP theorem learning stack implementation plan

Goal: Add the approved nine-card CAP Theorem deck immediately below Database Overview for every database component.

Spec: User-approved nine-card draft in this conversation. Keep plain English, bold concept labels, official sources, and the existing modal behavior. Order: overview, CAP, then PostgreSQL/SQLite/MySQL when applicable. Release approved by the user on 2026-10-27.

Architecture: Add cap.ts and CAPDiagram.tsx using existing lesson data and diagram styles. Register them in lessons.ts and LessonDialog.tsx. No new dependencies or persistence.

- [x] Update lesson-selection tests for all database presets and confirm failure before implementation.
- [x] Add nine cards and diagrams for the split and quorum; preserve the approved text.
- [x] Extend existing browser matrix to visit CAP and confirm navigation, reset, focus, viewport, and selection preservation.
- [x] Run unit tests, production build, and focused browser tests; inspect desktop/mobile screenshots.
- [x] Review correctness and separately run Ponytail complexity review. Record evidence below.

Review focus: all database families; renamed nodes and technology changes; unrelated components excluded; narrow screens; lesson ordering and independence.

Review log:
- Correctness/spec pass: approved nine cards implemented with bold concept labels, sources, and existing dialog behavior. CAP immediately follows overview for all database components, including generic and nonrelational presets. Specific decks remain after CAP. Non-database components and annotations remain unchanged. Reviewed scoped changes against the previous MySQL release rather than the unrelated dirty checkout.
- Validation: lesson-selection tests first failed on 9 changed database cases, then all 17 passed. Full unit suite: 208 passed across 18 files. Production build passed; existing large-bundle advisory remains. Focused browser matrix: 11 passed across desktop, short desktop, and mobile, visiting all CAP cards alongside existing decks and checking navigation, reset, focus, selection and viewport preservation. Full browser suite not run.
- Visual review: inspected desktop quorum and mobile partition diagrams. CAPDiagram.tsx quorum caption initially occupied only one grid column; fixed with a full-width grid span. Desktop/mobile browser checks rerun: 2 passed, final production build passed, and both corrected quorum screenshots inspected.
- Separate engineering-suite-ponytail:ponytail-review pass: No actionable complexity findings. Uses existing data, modal, selection function, and styles. No dependency, new persistence, or generalized framework added.
- Release prepared in a clean checkout from main 00eaa165da373c52efde2594bbee0b7d8dd54cfa. Existing unrelated local work preserved. Release verification on this checkout: 208 unit tests and 11 focused browser checks passed; production build passed with the existing bundle-size advisory. Initial restricted browser launch failed before tests ran; rerun with Chrome launch permission passed. Full browser suite not rerun. Final correctness/spec and separate Ponytail complexity passes: no actionable findings. Mobile quorum screenshot re-inspected.
