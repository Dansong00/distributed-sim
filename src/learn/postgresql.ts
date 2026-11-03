export const postgresqlLesson = {
  title: "PostgreSQL",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "Why PostgreSQL?", title: "Relational data with a shared database server",
      paragraphs: [
        "PostgreSQL runs as a database server. Application clients connect and issue SQL queries against relational tables; joins combine related rows, and transactions coordinate changes.",
        "It fits workloads that need relationships, queries and database-enforced rules. Choosing it does not supply the schema, concurrency policy or recovery plan automatically.",
        "For simple local storage, an embedded database can avoid a separate service. Requirements beyond one server's write capacity need further design; relational storage does not make PostgreSQL mandatory for every workload.",
      ],
      remember: "Choose the database from access patterns, correctness rules and deployment needs.",
      source: "https://www.postgresql.org/docs/current/tutorial-concepts.html",
    },
    {
      section: "Data Rules", title: "Make invalid data harder to save",
      paragraphs: [
        "A primary key uniquely identifies a row and cannot be null. UNIQUE prevents duplicate values; nulls are distinct by default unless configured otherwise. NOT NULL requires a value.",
        "A foreign key requires a non-null reference to match an allowed key in the referenced table. It protects the relationship, not every business rule about it.",
        "CHECK rejects values for which its expression is false. For required nonnegative stock, combine stock >= 0 with NOT NULL: a check alone does not reject a null result.",
        "A violating statement fails rather than saving the invalid change. Cross-row workflows and competing updates may still require transaction logic, locking or appropriate isolation.",
      ],
      remember: "Define the rules before relying on the database to preserve them.",
      source: "https://www.postgresql.org/docs/current/ddl-constraints.html",
    },
    {
      section: "ACID", title: "Group related database changes in a transaction",
      paragraphs: [
        "A transaction makes related database changes commit together or roll back together. ACID names four properties of that boundary.",
        {"label": "Atomicity", "text": "Commit all of its changes, or none."},
        {"label": "Consistency", "text": "Preserve rules encoded in constraints and correctly written application logic."},
        {"label": "Isolation", "text": "Control interactions between concurrent transactions. Weaker isolation levels do not make every execution equivalent to running transactions one at a time."},
        {"label": "Durability", "text": "Retain committed changes under the configured persistence guarantees and failure assumptions."},
        "A database transaction does not automatically include an external HTTP payment or undo it on rollback. Durability also does not replace historical backups.",
      ],
      remember: "The transaction boundary protects its database work; correct rules and concurrency behavior still matter.",
      source: "https://www.postgresql.org/docs/current/tutorial-transactions.html",
    },
    {
      section: "Competing Purchases", title: "What if both customers see one item left?",
      paragraphs: [
        "Multi-version concurrency control (MVCC) keeps row versions so reads can use a snapshot: data visible under the transaction's rules. Default Read Committed normally gives each statement a fresh snapshot of committed data, not one frozen view for the entire transaction.",
        "Two purchase requests can both observe stock: 1 before either changes it. A transaction boundary alone does not reserve the observed unit.",
        "Use a conditional update that decrements stock only while stock > 0, then check whether a row changed. Create the order only after a successful decrement in the same transaction; roll back both if required work fails. No row changed means no allocation.",
        "At Read Committed, a competing update waits and rechecks its condition after the other update commits. MVCC reduces many reader/writer conflicts, but does not eliminate locks or retries. Stronger isolation can protect broader rules and can require retrying an aborted transaction.",
      ],
      remember: "Use the transaction, update condition, and isolation behavior together to protect the last item.",
      source: "https://www.postgresql.org/docs/current/transaction-iso.html",
    },
    {
      section: "Queries and Indexes", title: "Correct data still needs efficient queries",
      paragraphs: [
        "An index is an additional access structure that can find or order matching rows without scanning every row. Choose its columns and order for the query's filters, joins and sorting.",
        "For recent orders by one customer, a customer-ID/order-date index can support the filter and ordering. The planner still decides how to execute the query.",
        "EXPLAIN shows that query plan: the chosen access and processing steps. Measure representative queries; a scan may be cheaper for a small table or a query that returns many rows.",
        "Indexes consume storage and require maintenance on relevant writes. Add them for demonstrated query needs rather than indexing every column.",
      ],
      remember: "Design the query first, then evaluate an index that supports it.",
      source: "https://www.postgresql.org/docs/current/indexes-intro.html",
    },
    {
      section: "Replication and CAP", title: "A second copy introduces a new question",
      paragraphs: [
        "Write-ahead logging (WAL) records changes for recovery before the corresponding changed data pages need to reach persistent storage. The primary accepts writes; a physical standby is a replica that receives and replays WAL to maintain its copy.",
        "A standby can lag in receipt or replay, so reads may be old. Asynchronous acknowledgement does not wait for a standby; permanently losing the primary before a surviving copy obtains a write can lose that acknowledged write.",
        "Synchronous settings wait for configured standby acknowledgements at a chosen stage. This trades commit latency and write availability for stronger protection; it does not make every standby instantly current.",
        "During a network partition, servers cannot communicate. Preserving one authoritative current history can require delaying or refusing affected operations. This CAP trade-off differs from ACID consistency, which preserves data rules.",
        "Promotion needs an eligible, sufficiently current standby, exclusive write authority and client routing. These policies determine behavior; a universal CP/AP label leaves them unexplained.",
      ],
      remember: "Decide which reads can tolerate lag. Do not attach a fixed CP label to Postgres without describing the deployment and its behavior.",
      source: "https://www.postgresql.org/docs/current/warm-standby.html",
    },
    {
      section: "Trade-offs", title: "Every extra guarantee has a cost",
      paragraphs: [
        "Coordinated writes can wait or require retries. Indexes add storage and write work; replicas add network, storage and failover work. Read replicas can offload suitable reads, but primary writes still pass through the primary.",
        "Connections and active queries consume server resources. Bound connection demand with sensible limits or pooling rather than opening unlimited connections.",
        "Replication can copy an accidental deletion. Retain historical backups and test that restores recover usable data within the required time.",
        "Choose which reads may be old, how much confirmed data loss is acceptable, and the required write latency and recovery time. Those targets determine which costs are justified.",
      ],
      remember: "Every guarantee has a scope, a failure assumption and an operating cost.",
      source: "https://www.postgresql.org/docs/current/continuous-archiving.html",
    },
    {
      section: "Interview Application", title: "Connect requirements to mechanisms",
      paragraphs: [
        "Use keys and references for relationships, constraints for valid values and transactions for coupled changes. Protect concurrent decisions with conditional updates or appropriate locking and isolation.",
        "Design the query and candidate index together, then inspect plans and measure. A relational model does not remove the cost of reads, writes or additional indexes.",
        "Specify stale-read tolerance, acceptable acknowledged-write loss and recovery targets before adding replicas. Choose acknowledgement and routing policies, safe failover and tested backups accordingly.",
        "Clarify unknown workload and deployment needs. Explain how these mechanisms satisfy the requirements at an acceptable cost.",
      ],
      remember: "Explain the model, rules, transaction boundary, access paths and failure behavior.",
      source: "https://www.postgresql.org/docs/current/tutorial-concepts.html",
    },
  ],
};
