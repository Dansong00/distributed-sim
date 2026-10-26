# Editable title and file menu

## Scope

- Edit the diagram title in place. Enter or blur saves a trimmed name; Escape cancels.
- Keep the existing 200-character limit. Blank edits preserve the current name.
- Replace header file buttons with one icon menu. Retain save status, all file actions, and delete confirmation.
- Preserve existing autosave, conflict recovery, and cleanup locks. No storage or lesson changes.

## Implementation

- EditableTitle owns its temporary draft; the existing session rename operation persists it.
- FileMenu uses native buttons and Tab navigation, closes on outside click, focus leaving, Escape, or command activation.
- The menu returns focus to its trigger before opening a dialog. Keyboard events inside it do not reach canvas shortcuts.
- Existing browser tests now open the menu and edit the title directly; their persistence and safety assertions remain.

## Review Log

- Correctness: verified Enter/blur save, Escape cancellation, blank rejection, reload, new/delete dialogs, import/export, copy, cleanup locks, and cross-tab conflict recovery.
- Fixed: persistence conflict test raced the second tab's asynchronous open. Wait for its title before editing the first tab.
- Fixed: FileMenu keyboard events could reach canvas shortcuts. Stop propagation and test Delete with a selected component.
- Separate Ponytail complexity pass: No actionable complexity findings. The two small stateful components keep transient editing/menu state out of App. No dependencies or generic menu framework added; obsolete rename dialog and state removed.
- Visual review: desktop and 390px screenshots show readable title, visible save status, icon labels, and an in-viewport menu.
- Build passed (existing bundle-size warning). Final unit rerun: 197 passed. An earlier run encountered nine unfinished database-deck tests; concurrent lesson implementation resolved them without changes from this task.
- Browser regression run: 62 passed, one known sticky-connector resize failure (expected endpoint 589, actual 581), matching the documented baseline. Newly added database-deck browser tests were outside this run. Final focused header rerun passed, including keyboard isolation and outside-click dismissal.
- `git diff --check` passed. Existing local server remains available on port 5173.

## Release

User approved shipping the header cleanup on 2026-10-26. Prepared an isolated branch from main 4429d75, excluding pending SQLite, learning-deck, and retractable-panel changes. The original working directory is untouched.

- Isolated release verification: 179 unit tests passed, production-base build passed, 15 focused header/accessibility/persistence/layout browser tests passed on port 5174.
- Remaining migrated browser tests: 35 passed, for 50 release browser checks in total. The known sticky-connector endpoint failure was excluded and remains documented above. Independent correctness/complexity review is in progress before merge.
- Canvas Auto mode is a separate proposal, not part of this release.
