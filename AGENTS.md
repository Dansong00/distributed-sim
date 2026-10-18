# Review requirements

For each implementation task and the final branch review:

1. Review correctness and alignment with the approved spec, including relevant test evidence.
2. Run a separate complexity pass using `engineering-suite-ponytail:ponytail-review`. Read the installed skill before applying it. If unavailable, report that and use the checklist below; do not claim the skill ran.
3. Look for unnecessary dependencies, code duplicating existing helpers or platform features, unused configuration, speculative abstractions and features outside the approved scope.
4. Record each actionable finding with its file/line, proposed simplification and disposition: fixed, or retained with a concrete reason. Record “No actionable complexity findings” when appropriate. Keep this evidence in the implementation plan's review log; summarize important decisions in progress updates and the PR.
5. Resolve actionable findings before proceeding to dependent work or finalizing the PR. Rerun affected checks after fixes. Do not remove required behavior, validation, data-loss protection, accessibility or meaningful tests merely to reduce line count. Scope-changing tradeoffs go back to the user.

The same independent reviewer may perform both passes; a second reviewer agent is not required solely for Ponytail. Ponytail review complements correctness review and does not replace it. Review is scoped to the task diff, then the combined branch diff at the end—not the entire repository on every task.
