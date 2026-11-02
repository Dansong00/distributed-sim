# Load Balancing release evidence

Eight cards follow Notes API requests through distribution, L4/L7 routing, selection policies, readiness, session state, draining, retries and capacity/availability limits. The independently frozen contract contains six transfer scenarios. Only network components with normalized Load Balancer technology expose this stack; API Gateway, DNS and CDN remain separate topics.

Current-source `check-release` passes. Fresh learner `/root/lb_learner_p6` answered all six scenarios. Independent reviewers `/root/lb_review_a` and `/root/lb_review_b` each scored 20/20, every outcome 2/2, with no hard failures. They assessed every card objective, diagram meaning and primary sources. Adjacent JSON files are their unchanged final outputs from external case `p6`; there were no separate per-card learner sessions.

Both reviewers rejected control `v3` for false guarantees about health checks, instantaneous detection and transfer of in-flight work (9/20 and 11/20). The control gate failed as expected. This is limited calibration on one topic/model family, not proof of evaluator reliability or human learning.

Validation: 221 app tests, 98 evaluator tests, repository-URL production build and one `verify-system-canvas` run with 26 passing lesson journeys. The new stack was exercised at 1280×900, 985×543 and 390×700; inspected diagrams and scrolled retry text, navigation, focus and preserved editor state. Startup doctor passed, all 26 traces are retained, and owned port 5187 was clear after teardown. Chrome coverage is not a cross-browser matrix.

An initial evaluator-suite run passed 97/98: an empty evidence directory correctly failed, but a test assumed concurrent missing-file reads always report learner.json first. Its assertion now requires ENOENT for any required report while retaining nonzero exit status. The gate, rubric and thresholds are unchanged. Both the failure and passing rerun are archived; no application change required repeating UI checks.

```sh
npm run test:lesson-eval
npm run eval:lessons -- check-release load-balancing evals/lessons/releases/load-balancing
```

Full attempts, control, logs and browser proof: `/Users/danielansong/Documents/learning-eval-archives/system-canvas/2026-11-02-load-balancing-02845ac/evidence.tar.gz`. SHA-256: `c5607a0ec90c06f11b6579205fceec853843038a27ecd6a732bea10a10d5b2b0`. All 143 archived files were byte-checked against originals. Roots: `lb-stack-eval-20261102/` and `system-canvas-verify.SAp4fm/`.

CI uses tracked reports and current source only. No archive download or model call is required. Hashes catch stale/altered evidence; they do not authenticate reviewers or prove semantic correctness.
