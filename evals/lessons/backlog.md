# Autonomous learning stack backlog

Status is local source coverage, not a claim of quality. All stacks require the new eval before being called approved. Existing source currently has Client / Server Model, API Server, Database Overview, CAP, Replication, PostgreSQL, SQLite, MySQL, Caching Fundamentals, Message Queues and Background Workers, Load Balancing, API Gateways, DNS, and CDN and HTTP Caching. Caching, messaging, load balancing, API gateways, DNS and CDN/HTTP caching have current passing evaluation reports; prior code-review and browser passes do not retroactively count as learning-quality evaluations.

Default order is shared foundations first, then named technologies. The user approved continuing to CDN and HTTP caching after DNS; future scope corrections override this order.

## Shared foundations

Message Queues and Background Workers is implemented and evaluated for Generic Queue, Kafka, RabbitMQ, SQS, and Worker. It distinguishes competing work distribution from independently consumed retained history. Product distinctions still need their own stacks. See releases/queues/REPORT.md for current content and UI evidence.

Load Balancing is implemented and evaluated for its component, with connection/request routing, policy limits, readiness, state, draining, retries and availability. See releases/load-balancing/REPORT.md for evidence.

API Gateways is implemented for API Gateway components, covering shared routing/policies, identity and resource access, traffic-limit scope, deadline and retry responsibility, aggregation and availability. See releases/api-gateways/REPORT.md for release evidence.

DNS is implemented for DNS components, covering discovery, delegation, record types, cache changes, negative answers, steering, availability and DNSSEC/HTTPS boundaries. See releases/dns/REPORT.md for current evidence.

CDN and HTTP Caching is implemented for CDN components, covering response layers, freshness, conditional validation, private-data policies, variants, updates, bounded stale reuse and cost. See releases/cdn-http-caching/REPORT.md for current evidence.

Next, in prerequisite order:
1. Object storage; block storage; shared file storage.
2. Sharding and partition keys; document databases; key-value data access.
3. Wide-column, graph, geospatial, time-series, search, analytics, and vector retrieval foundations.
4. Data lakes; lakehouses and table formats; model artifact storage.
5. Embeddings; retrieval; reranking; model serving; feature stores; model registries.
6. Serverless execution and client-specific topics where the shared client/server foundation leaves meaningful gaps.

Use one concrete operation per stack; separate topics only when each has a distinct learning outcome. Do not create repetitive decks merely to fill an icon count. Generic database coverage does not complete specialist database topics.

## Product-specific layer

Add Redis and Memcached after caching; Kafka, RabbitMQ and SQS after messaging; MongoDB and DynamoDB after data-model foundations; then the remaining named technologies in catalog order within their prerequisites. Existing PostgreSQL, SQLite and MySQL still need eval contracts and reviews. A shared foundation does not by itself certify product-specific knowledge.

## Per-topic record

For each topic, keep: frozen contract, exact revision hash, learner output, two independent reviews, gate result, revision attempts, primary sources, unit/build/browser evidence, screenshots, and correctness/complexity review. Keep only the current passing learner and two reviewer reports plus a short summary under evals/lessons/releases/<topic>/. Archive full attempts and UI proof outside Git. Follow the lighter loop in README.md.

Advance only after content and UI gates pass. If three revisions do not resolve a topic, record the specific disagreement or missing evidence and investigate it before continuing. Do not advance to another stack until the current one passes. Never silently reduce the intended learning outcomes or lower thresholds. Publication remains a separate action.
