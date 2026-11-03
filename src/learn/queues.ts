export const queuesLesson = {
  title: "Message Queues and Background Workers",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "Why Defer Work?", title: "Accepted does not mean ready",
      paragraphs: [
        "A queue holds work until a consumer can process it. A background worker runs that work separately from the original request, allowing the API to return before the result is ready.",
        "Acceptance confirms responsibility for the job, not completion. Return a job ID and make pending, ready and failed status observable; ready means the required result has actually been saved.",
        "This shortens the initial wait, not the work itself. It adds delayed results, status tracking and failures that must remain visible after the request ends.",
      ],
      remember: "Move work out of the request only when the caller can continue without its result.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply",
    },
    {
      section: "Follow the Job", title: "Three actors, two different acknowledgements",
      paragraphs: [
        {"label": "Producer", "text": "Publishes a message containing the job ID and inputs. An API must confirm the handoff before telling the client the job was accepted."},
        {"label": "Broker", "text": "Holds work for consumers. A publisher confirmation means broker acceptance under the configured durability rules, not completed application work."},
        {"label": "Worker", "text": "Receives the message, saves the required result and ready status, then acknowledges processing to the broker. A consumer acknowledgement lets the broker retire that delivery."},
        "These acknowledgements cover different boundaries. Neither makes a broker operation atomic with a database write or proves an arbitrary business effect succeeded.",
      ],
      remember: "Trace publish → broker acceptance → worker effect → consumer acknowledgement. The client observes completion through status.",
      source: "https://www.rabbitmq.com/docs/confirms",
    },
    {
      section: "Redelivery", title: "Commit and acknowledgement are separate steps",
      paragraphs: [
        "A worker commits its database changes, then crashes before acknowledging. With at-least-once delivery, the broker can deliver the job again. Acknowledging first instead risks losing the work if the worker crashes before saving it.",
        {"label": "Idempotency", "text": "Repeating the same operation has the same effect as doing it once. Reuse a stable business-operation ID across retries, not a new ID per attempt."},
        "In one database transaction, insert that ID into a durable processed-jobs table with a unique constraint and apply the job's database effect. Commit both or neither. A duplicate ID skips the effect. A separate check followed by a write can race or crash between steps.",
        "That transaction protects its database effects. It does not make an external email or payment atomic, or turn delivery into a universal exactly-once guarantee.",
      ],
      remember: "Expect repeated delivery; make the effect duplicate-safe at its own boundary.",
      source: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
    },
    {
      section: "Failures", title: "Retry a temporary problem; isolate a broken job",
      paragraphs: [
        "A temporary storage outage may recover. Retry with increasing delays and a finite attempt or time budget; immediate retries can deepen the outage.",
        "An unsupported input format will not improve with waiting. Isolate it, or any job that exhausts its budget, in a dead-letter queue for investigation and expose failed status.",
        "Healthy jobs can continue. Before deliberately replaying a failed job, fix its cause and check whether an earlier attempt already applied an effect. Replay still needs duplicate safety.",
      ],
      remember: "A dead-letter queue contains failure; it does not repair the job.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/retry",
    },
    {
      section: "Ordering", title: "Starting first does not mean finishing first",
      paragraphs: [
        "Delivery order and completion order are different. Two updates set the same address to old, then new. Workers receive them in order, but the slower old update finishes last and overwrites new.",
        "Serialize effects per entity ID: keep later updates waiting while an earlier one runs or retries. Different entities can still run in parallel. A busy entity becomes a throughput bottleneck.",
        "Moving the earlier job to a dead-letter queue does not resolve the dependency. Decide how to repair or cancel it before releasing dependent updates.",
      ],
      remember: "Ordered delivery alone does not guarantee ordered effects.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers",
    },
    {
      section: "Overload", title: "A queue buys time, not unlimited capacity",
      paragraphs: [
        "If 100 jobs arrive each second and 70 finish, unfinished work grows by 30 jobs per second. Watch backlog and oldest-job age: a growing wait can violate the promise to the client.",
        "Storage and retention are finite. A queue can absorb a burst only if capacity later catches up before those limits or the allowed delay are reached.",
        {"label": "Backpressure", "text": "Bound worker concurrency to protect the database. Throttle or reject new requests with a visible busy response, or explicitly defer them within an agreed limit."},
        "More workers help when workers are the bottleneck and downstream services have spare capacity. If the database is already saturated, more workers increase contention instead.",
      ],
      remember: "Control arrivals and downstream work; do not hide sustained overload in a growing queue.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling",
    },
    {
      section: "Queue or Log?", title: "Sharing jobs differs from sharing event history",
      paragraphs: [
        "A work queue divides jobs among competing workers; it does not give every independent application every job. Failed deliveries can still repeat.",
        "A retained log keeps event history for consumers to read independently. If billing and analytics each need every purchase event, separate consumer groups can track their own progress.",
        "In Kafka, a partition is an ordered slice of the log. Each group tracks its own position, called an offset, for each partition. Workers within a group share the partitions. Committing an offset records progress; it does not delete the event.",
        "A group can rewind and replay only while the required events remain under the retention policy. Ordering is per partition, not global. Retained history and offsets do not by themselves make external effects exactly once.",
      ],
      remember: "Choose job distribution for shared work, or independent group positions and retained history when applications need replay.",
      source: "https://kafka.apache.org/41/design/design/",
    },
    {
      section: "Make the Decision", title: "Which result must the caller have now?",
      paragraphs: [
        "Keep decisions synchronous when the next action requires their result. Authorization must finish before granting access to a private resource; queueing that decision cannot justify granting access immediately.",
        "Defer work when the caller can proceed with a job ID and later status. Confirm the handoff before acceptance; report ready only after saving the required result, and expose terminal failure.",
        "The trade-off includes operating the broker and workers, tracking status, handling duplicates and retries, and watching backlog. A queue does not solve sustained overload.",
      ],
      remember: "Choose the request boundary from what the caller needs next, then own the deferred work until completion or visible failure.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply",
    },
  ],
};
