# Archived evaluation attempts

The 189 raw caching artifacts formerly under `evals/lessons/runs/` were copied outside the repository and checked file-by-file before removal. They included calibration controls, failed attempts, an unused export and successful per-card/stack runs. Shared Git history was not rewritten.

- Local archive: `~/Documents/learning-eval-archives/system-canvas/2026-11-01-caching-7354000/runs.tar.gz`
- SHA-256: `c3da9e6cc8199d9e870c573632dee07ce9edc198daded694ba766599b52956dc`
- Size: 644,618 bytes; 189 files, with individual hashes in adjacent `manifest.json`.
- Portable recovery: the same raw files remain at commit `7354000b9d0106242bc34e4181756f7b0bbbe004`, under `evals/lessons/runs/`. Retrieve them into an external directory for historical investigation, not the working tree.

CI does not read this archive. Current passing evidence is in [releases/caching](releases/caching/REPORT.md), and the packet is rebuilt from tracked source.

The original calibration accepted its candidate at 19/20 and 20/20 and rejected four deliberately weak variants in both reviewer tracks. Later prefix checks exposed implicit initial-read costs, a compressed stale-refill explanation and missing shared-cache failure scope. Those cards were revised. A separate contract-only audit made a hidden cost criterion explicit and strengthened failure comparison without removing any criterion or lowering thresholds. The final full-stack review scored 20/20 twice with all six outcomes passing.

This is one-topic content-readiness evidence, not proof of human learning or general evaluator reliability. Full reports, exact question changes, failed outcomes and source checks are recoverable from the archive/history above.
