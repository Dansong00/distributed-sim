# Load Balancing contract freeze

Independently authored before lesson prose. Read only evals/lessons/README.md, rubric.json, backlog.md, and scripts/lesson-eval/cards.mjs in /tmp/system-canvas-card-evals. No existing lesson, contract or evaluation report was inspected.

Eight-card progression: request path -> routing unit -> selection -> readiness -> state -> draining -> retries -> capacity/availability. Each card has one prefix-safe question; earlier-card dependencies are explicit. The first objective establishes when the component is unnecessary. Unfamiliar terms are named and defined in objectives for the author to introduce before using them.

Six whole-stack scenarios use a ticketing service rather than a possible Notes API teaching example. They cover all eight objectives. Each criterion is explicitly requested in the question. Card probes use a catalog service. No product configuration, DNS prerequisite, TLS configuration procedure, queueing stack, or performance tuning is required. HTTP visibility may require decryption; configuring it is outside scope.

Retry scope is limited to a database-backed logical operation. HTTP and atomic database transactions are declared prerequisites. The lesson must teach the bridge between one stable operation key, a shared durable duplicate record, and atomic coordination with the write; a key alone is not sufficient. External payment coordination and implementation recipes are outside scope.

Availability requires a reachable alternate entry path, not just another named balancer box; no particular failover technology is prescribed. Draining distinguishes new connections from new HTTP requests on reused connections. Health is sampled and imperfect. Stickiness never substitutes for state replication. Traffic distribution never creates capacity.

Validated JSON parsing, eight ordered cards, six whole-stack scenarios, one question per card, and earlier-only prerequisites locally. This is structural validation, not a learner evaluation. Keep rubric thresholds unchanged and run the existing lighter whole-stack evaluation and UI loop.
