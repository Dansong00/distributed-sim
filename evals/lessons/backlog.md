# Autonomous learning stack backlog

Status is local source coverage, not a claim of quality. All stacks require the new eval before being called approved. Existing source currently has Client / Server Model, API Server, Database Overview, CAP, Replication, PostgreSQL, SQLite, MySQL, and Caching Fundamentals. Only Caching Fundamentals is the initial evaluation pilot; prior code-review and browser passes do not retroactively count as learning-quality evaluations.

Default order is shared foundations first, then named technologies. This was offered to the user as the recommended scope; a later response overrides it. Keep the question pending rather than representing silence as approval.

## Shared foundations

Start with Message Queues and Background Workers, because it extends the existing API-server synchronous/asynchronous lesson and covers Generic Queue, Kafka, RabbitMQ, SQS, and Worker. Teach the shared ideas without implying that a replayable log and a work queue have identical semantics. Product distinctions come in their own stacks.

Then, in prerequisite order:

1. Load balancing; API gateways; DNS; CDN and HTTP caching.
2. Object storage; block storage; shared file storage.
3. Sharding and partition keys; document databases; key-value data access.
4. Wide-column, graph, geospatial, time-series, search, analytics, and vector retrieval foundations.
5. Data lakes; lakehouses and table formats; model artifact storage.
6. Embeddings; retrieval; reranking; model serving; feature stores; model registries.
7. Serverless execution and client-specific topics where the shared client/server foundation leaves meaningful gaps.

Use one concrete operation per stack; separate topics only when each has a distinct learning outcome. Do not create repetitive decks merely to fill an icon count. Generic database coverage does not complete specialist database topics.

## Product-specific layer

Add Redis and Memcached after caching; Kafka, RabbitMQ and SQS after messaging; MongoDB and DynamoDB after data-model foundations; then the remaining named technologies in catalog order within their prerequisites. Existing PostgreSQL, SQLite and MySQL still need eval contracts and reviews. A shared foundation does not by itself certify product-specific knowledge.

## Per-topic record

For each topic, keep: frozen contract, exact revision hash, learner output, two independent reviews, gate result, revision attempts, primary sources, unit/build/browser evidence, screenshots, and correctness/complexity review. Store reports under evals/lessons/runs/<topic>-<attempt>/ and update the implementation plan.

Advance only after content and UI gates pass. If three revisions do not resolve a topic, record the specific disagreement or missing evidence and investigate it before continuing. Do not advance to another stack until the current one passes. Never silently reduce the intended learning outcomes or lower thresholds. Publication remains a separate action.
