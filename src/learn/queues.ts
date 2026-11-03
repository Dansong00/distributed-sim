export const queuesLesson = {
  title: "Message Queues and Background Workers",
  reviewed: "2026-11-01",
  slides: [
    {
      section: "Why Defer Work?", title: "Accepted does not mean ready",
      paragraphs: [
        "Generating a receipt takes longer than the client can wait for an HTTP response. The API can accept a job, return its ID, and let a background worker finish later.",
        "The client checks that ID for pending, ready, or failed status. Only ready means the receipt can be used; an accepted response is not the receipt.",
        "This shortens the initial wait, not the work itself. It adds delayed results, status tracking, and failures that must remain visible after the request ends.",
      ],
      remember: "Move work out of the request only when the caller can continue without its result.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply",
    },
    {
      section: "Follow the Job", title: "Three actors, two different acknowledgements",
      paragraphs: [
        { label: "Producer", text: "The API publishes a message containing the job ID and receipt inputs. It confirms the handoff before telling the client the job was accepted." },
        { label: "Broker", text: "Holds work for consumers. A publisher confirmation means broker acceptance under the configured durability rules, not a completed receipt." },
        { label: "Worker", text: "Receives the message, saves the receipt and ready status, then acknowledges processing to the broker. A consumer acknowledgement lets the broker retire that delivery." },
        "These acknowledgements cover different boundaries. Neither makes a broker operation atomic with a database write or proves an arbitrary business effect succeeded.",
      ],
      remember: "Trace publish → broker acceptance → worker effect → consumer acknowledgement. The client observes completion through status.",
      source: "https://www.rabbitmq.com/docs/confirms",
    },
    {
      section: "Redelivery", title: "The receipt was saved. The acknowledgement was lost.",
      paragraphs: [
        "A worker commits its database changes, then crashes before acknowledging. With at-least-once delivery, the broker can deliver the job again. Acknowledging first instead risks losing the work if the worker crashes before saving it.",
        { label: "Idempotency", text: "Repeating the same operation has the same effect as doing it once. Reuse a stable business-operation ID across retries, not a new ID per attempt." },
        "In one database transaction, insert that ID into a durable processed-jobs table with a unique constraint and apply the receipt changes. Commit both or neither. A duplicate ID skips the effect. A separate check followed by a write can race or crash between steps.",
        "That transaction makes the database effect safe to repeat. It does not make delivery of the message exactly once.",
      ],
      remember: "Expect repeated delivery; make the effect duplicate-safe at its own boundary.",
      source: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
    },
    {
      section: "Failures", title: "Retry a temporary problem; isolate a broken job",
      paragraphs: [
        "A temporary storage outage may recover. Give that message a higher maxReceiveCount and enough time to process so a short outage can clear. Immediate endless receives can exhaust the count and deepen the outage.",
        "An unsupported receipt format will not improve if it is received again unchanged. Do not give it the transient retry budget. A maxReceiveCount of one moves that message to the dead-letter queue after a single failure. The dead-letter queue isolates it for investigation and makes the failure visible, so other jobs can continue.",
        "Healthy jobs can continue. Before deliberately replaying a failed job, fix its cause and check whether an earlier attempt already applied an effect. Replay still needs duplicate safety.",
      ],
      remember: "A dead-letter queue contains failure; it does not repair the job.",
      source: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html",
    },
    {
      section: "Ordering", title: "Starting first does not mean finishing first",
      paragraphs: [
        "Two updates change one receipt's address: old, then new. Workers receive them in order, but the slower old update finishes last and overwrites new.",
        "Serialize effects per receipt ID: keep later updates waiting while an earlier one runs or retries. Different receipts can still run in parallel. Adding more workers does not remove that per-receipt dependency. A busy receipt becomes a throughput bottleneck.",
        "Moving the earlier job to a dead-letter queue does not resolve the dependency. Decide how to repair or cancel it before releasing dependent updates.",
      ],
      remember: "Ordered delivery alone does not guarantee ordered effects.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers",
    },
    {
      section: "Overload", title: "A queue buys time, not unlimited capacity",
      paragraphs: [
        "If 100 receipt jobs arrive each second and 70 finish, unfinished work grows by 30 jobs per second. Watch backlog and oldest-job age: a growing wait can violate the promise to the client.",
        "Storage and retention are finite. A queue can absorb a burst only if capacity later catches up before those limits or the allowed delay are reached.",
        { label: "Backpressure", text: "Bound worker concurrency to protect the database. Throttle or reject new requests with a visible busy response, or explicitly defer them within an agreed limit." },
        "More workers help when workers are the bottleneck and downstream services have spare capacity. If the database is already saturated, more workers increase contention instead.",
      ],
      remember: "Control arrivals and downstream work; do not hide sustained overload in a growing queue.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling",
    },
    {
      section: "Queue or Log?", title: "Sharing jobs differs from sharing event history",
      paragraphs: [
        "A work queue divides receipt jobs among competing workers; it does not give every independent application every job. Failed deliveries can still repeat.",
        "If receipts and analytics each need every purchase event, a retained log such as Kafka supports separate consumer groups. A partition is an ordered slice of the log. Each group tracks its own position, called an offset, for each partition. Workers within a group share the partitions.",
        "Committing an offset records progress; it does not delete the event. Analytics can rewind and replay only while the required events remain under the retention policy.",
        "Ordering is per partition, not global across all partitions. Retained history and offsets do not by themselves make external effects exactly once.",
      ],
      remember: "Choose job distribution for shared work, or independent group positions and retained history when applications need replay.",
      source: "https://kafka.apache.org/41/design/design/",
    },
    {
      section: "Make the Decision", title: "Which result must the caller have now?",
      paragraphs: [
        "Authorization must finish before showing a private receipt. Queueing the decision and granting access immediately would use a result we do not yet have.",
        "Receipt generation can be deferred if the caller accepts a job ID and later status. Confirm the handoff before acceptance; report ready only after the required result is saved, and expose terminal failure.",
        "The tradeoff includes operating the broker and workers, tracking status, handling duplicates and retries, and watching backlog. A queue does not solve sustained overload.",
      ],
      remember: "Choose the request boundary from what the caller needs next, then own the deferred work until completion or visible failure.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply",
    },
  ],
};
