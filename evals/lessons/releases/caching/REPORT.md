# Caching release evidence

The three adjacent JSON files are unchanged copies of the final whole-stack evidence originally saved under `caching-card-loop-4/stack/` in commit `7354000b9d0106242bc34e4181756f7b0bbbe004`. No answer, score, quote or hash was changed during cleanup.

Both independent reviewers scored the stack 20/20, all six transfer outcomes 2/2, and no hard failures. They checked every linked primary-source URL. Actual reviewer identities and exact evidence are in the reports.

Run from a clean checkout:

```sh
npm run test:lesson-eval
npm run eval:lessons -- check-release caching evals/lessons/releases/caching
```

The release check rebuilds the current source packet, validates every card contract and checks the full-stack reports, including source/rubric hashes and learner-response binding. No archived packet, browser trace, model call or external download is required. A pass is full-stack content approval, not independent certification of every prefix.

The caching release shipped in [PR #20](https://github.com/Dansong00/distributed-sim/pull/20), merge `533a96a6f16662fc049578da103155f3be88ac35`. Its 212 app unit tests, build and focused browser checks passed. A later run of `verify-system-canvas` passed all 16 selected lesson UI checks with startup/cleanup proof; UI evidence is stored outside Git. Failed content attempts and the negative-control calibration are documented in [ARCHIVE.md](../../ARCHIVE.md).

Limits: independent sessions from one model family, reviewer judgment rather than proof of learning, and Chrome UI coverage rather than a cross-browser matrix. Source/rubric/learner bindings detect stale or altered evidence; they do not authenticate reviewers or prove that their reasoning is correct.
