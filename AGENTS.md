# Review requirements

For each implementation task and the final branch review:

1. Review correctness and alignment with the approved spec, including relevant test evidence.
2. Run a separate complexity pass using `engineering-suite-ponytail:ponytail-review`. Read the installed skill before applying it. If unavailable, report that and use the checklist below; do not claim the skill ran.
3. Look for unnecessary dependencies, code duplicating existing helpers or platform features, unused configuration, speculative abstractions and features outside the approved scope.
4. Record each actionable finding with its file/line, proposed simplification and disposition: fixed, or retained with a concrete reason. Record “No actionable complexity findings” when appropriate. Keep this evidence in the implementation plan's review log; summarize important decisions in progress updates and the PR.
5. Resolve actionable findings before proceeding to dependent work or finalizing the PR. Rerun affected checks after fixes. Do not remove required behavior, validation, data-loss protection, accessibility or meaningful tests merely to reduce line count. Scope-changing tradeoffs go back to the user.

The same independent reviewer may perform both passes; a second reviewer agent is not required solely for Ponytail. Ponytail review complements correctness review and does not replace it. Review is scoped to the task diff, then the combined branch diff at the end—not the entire repository on every task.

# Learning stack quality gate

For any new or substantively revised learning stack, follow [evals/lessons/README.md](evals/lessons/README.md) before declaring it complete or advancing the autonomous backlog. Use [evals/lessons/backlog.md](evals/lessons/backlog.md) for prerequisite order and coverage boundaries.

- Freeze a topic contract before authoring. Use a separate agent to define objectives and transfer questions without inspecting the candidate deck.
- Use a fresh learner session with only the learner packet, then two independent reviewer sessions. Preserve their actual outputs; the author must not fabricate reviews, waive failures, or lower thresholds to pass.
- Run the current-source `check` gate. An archived packet pass, missing contract, stale report, or prior code-review pass is not quality approval.
- Correct material errors and teaching gaps, export a new revision, and rerun the evaluation. After three unsuccessful revisions, investigate whether the lesson or the evaluation is at fault. Do not advance to the next stack until the current stack passes; escalate only an unresolved scope or learning-goal decision.
- Content quality and UI correctness are separate gates. Run relevant unit/build/browser checks and inspect diagrams and long cards at desktop/mobile widths. Follow the correctness and Ponytail review requirements above.
- Keep per-attempt evidence under evals/lessons/runs/. Caching calibration is a pilot, not proof of reliability for every topic or of human learning; add topic-specific negative controls as coverage expands.

- Each card also needs a frozen objective, earlier prerequisites and a transfer question. Use `packet-card` and `check-card` with fresh learners and independent reviews; use `check-release` for all cards plus the full-stack current-source gate before publication. Preserve failed attempts and re-evaluate affected prefixes after prerequisite edits.
- Honor release authorization already given in the active conversation. Preserve coherent public stacks, unrelated local work, required checks, and deployment verification. Archived evidence is not current approval.
