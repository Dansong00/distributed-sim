# Retractable panel release

## Scope

Port the existing local implementation onto current main (448c3fb). Components
and Properties collapse independently above 900px and release their width to the
canvas. Keep mutually exclusive compact drawers, native tooltip/icon controls,
keyboard operation, accurate aria-expanded state, selection and undo history.
Panel choices last for the current app session; no persistence or dependencies.
Preserve unrelated work in the original checkout.

## Verification

- Baseline main: 232 unit tests passed.
- Existing panel regression fails on main at 1280x800 because the Components
  panel control is hidden. Evidence: system-canvas-verify.Da0kvW.
- Release: `npm test` passed all 232 unit tests.
- `npm run build -- --base /distributed-sim/` passed, with the existing
  large-chunk advisory.
- Using the copied project verification skill and installed Chrome:
  `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' .cursor/skills/verify-system-canvas/scripts/run.sh suite tests/panels.spec.ts tests/accessibility.spec.ts tests/header.spec.ts tests/canvas.spec.ts tests/auto-mode.spec.ts tests/auto-layout.spec.ts`
  passed all 31 browser cases. The doctor passed; port 5187 was closed afterward.
- Panel cases cover independent collapse/reopen at 1280x800 and 985x543,
  compact drawers at 900px and 390px, resize across the breakpoint, keyboard
  activation/focus, canvas width, selection, edits, viewport and undo/redo.
- Inspected collapsed 1280px/900px and reopened 985px/390px screenshots.
  Controls remain visible; compact drawers overlay the canvas as intended.
- Traces, doctor checks, screenshots and JSON results preserved outside Git in
  the adjacent beat the system workspace under
  `artifacts/retractable-panels-release-2026-11-05/` (baseline and release).
- `git diff --check` passed. Firefox/Safari and the full browser suite were not run.

## Correctness review

Reviewed App state/control flow, CSS breakpoint/specificity, and all six panel
regressions against the approved scope. Hidden panels remain mounted; desktop
choices are independent and preserved through compact mode. The existing
compact union remains mutually exclusive. Resize listener cleanup and keyboard
Space handling are compatible with current main. No document, storage, history,
canvas gesture or learning content changes. No actionable correctness findings.

## Separate Ponytail complexity review

Read and applied `engineering-suite-ponytail:ponytail-review` separately after
the correctness pass, against the complete four-file release. Two booleans and
the existing compact union express the required states directly. No abstraction,
dependency, persistence layer or custom event infrastructure was added. Scoped
CSS retains the existing implementation without changing shared responsive
styles. Tests exercise user-visible behavior. No actionable complexity findings.
Lean already. Ship.
