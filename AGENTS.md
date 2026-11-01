# Review requirements

For each implementation task and the final branch review:

1. Review correctness and alignment with the approved spec, including relevant test evidence.
2. Run a separate complexity pass using `engineering-suite-ponytail:ponytail-review`. Read the installed skill before applying it. If unavailable, report that and use the checklist below; do not claim the skill ran.
3. Look for unnecessary dependencies, code duplicating existing helpers or platform features, unused configuration, speculative abstractions and features outside the approved scope.
4. Record each actionable finding with its file/line, proposed simplification and disposition: fixed, or retained with a concrete reason. Record “No actionable complexity findings” when appropriate. Keep this evidence in the implementation plan's review log; summarize important decisions in progress updates and the PR.
5. Resolve actionable findings before proceeding to dependent work or finalizing the PR. Rerun affected checks after fixes. Do not remove required behavior, validation, data-loss protection, accessibility or meaningful tests merely to reduce line count. Scope-changing tradeoffs go back to the user.

The same independent reviewer may perform both passes; a second reviewer agent is not required solely for Ponytail. Ponytail review complements correctness review and does not replace it. Review is scoped to the task diff, then the combined branch diff at the end—not the entire repository on every task.

# Learning stack quality gate

For learning stacks, follow [evals/lessons/README.md](evals/lessons/README.md) and [the backlog](evals/lessons/backlog.md).

- Freeze an independently authored contract before writing. Check each card's objective, sources and prerequisite order during drafting. Use targeted blind card evaluation only when a specific gap needs diagnosis.
- Evaluate the complete stack with one fresh learner and two independent reviewer sessions. Preserve their actual outputs. Assess every objective; never fabricate reviews, lower thresholds or relabel stale reports.
- Run current-source `check-release` before publishing or advancing. It validates card contracts and the full-stack evidence. Archived packet checks are not release approval.
- Revise identified gaps until the gate passes. After three unsuccessful revisions, investigate lesson versus assessment; escalate only an unresolved learning-goal or scope decision.
- Keep only current passing learner/reviewer reports and a concise summary under `evals/lessons/releases/`. Store generated packets, failed attempts, calibration history and browser proof outside Git. Preserve and checksum archives before removing tracked copies.
- Use the existing `verify-system-canvas` skill for affected UI journeys once before release, alongside relevant tests/build and the correctness/Ponytail reviews above. Locate/copy the existing project skill into isolated checkouts when necessary. Repeat affected checks only after changes or failures.
- Honor release authorization already given in the active conversation. Preserve unrelated work and verify deployment. Evaluations measure content readiness, not human learning.
