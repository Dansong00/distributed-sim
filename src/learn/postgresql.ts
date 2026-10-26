export const postgresqlLesson = {
  title: "PostgreSQL",
  reviewed: "2026-10-26",
  slides: [
    {
      section: "Why PostgreSQL?", title: "An order connects several pieces of data",
      paragraphs: [
        "Our store has customers, products, orders, and inventory. We need to connect these records and keep them correct as people shop.",
        "PostgreSQL, often called Postgres, fits the relational model from the overview. Tables describe each kind of record, and queries combine them when needed.",
        "Choosing Postgres is the start. We still need to define valid data, handle competing purchases, and decide what happens when servers fail. Follow two customers trying to buy the last item.",
      ],
      remember: "The database choice follows from the relationships and rules our store needs.",
      source: "https://www.postgresql.org/docs/current/tutorial-concepts.html",
    },
    {
      section: "Data Rules", title: "Make invalid data harder to save",
      paragraphs: [
        "Each order references a customer. Each order item references a product. Inventory must not fall below zero.",
        "Postgres can enforce these rules with constraints. Foreign keys check references. Unique constraints prevent duplicate values. Check constraints test conditions such as nonnegative stock.",
        "The database does not know every business rule automatically. We must encode the rules in constraints or application logic. A stock check protects the saved value, but the purchase logic must still decide who gets the last item.",
      ],
      remember: "Define the rules before relying on the database to preserve them.",
      source: "https://www.postgresql.org/docs/current/ddl-constraints.html",
    },
    {
      section: "ACID", title: "Treat the purchase as one controlled change",
      paragraphs: [
        "Creating an order and reducing its stock belong in one database transaction. ACID describes four properties of transactions.",
        { label: "Atomicity", text: "Save both changes, or neither." },
        { label: "Consistency", text: "Preserve the data rules we defined." },
        { label: "Isolation", text: "Control how simultaneous transactions affect each other." },
        { label: "Durability", text: "Preserve committed changes through a crash under the configured durability guarantees." },
        "These properties work together, but they depend on correct rules, application logic, and configuration. A Postgres transaction also does not automatically include a payment made through an external service.",
      ],
      remember: "ACID connects the order and stock changes. Isolation still needs attention when two customers buy at once.",
      source: "https://www.postgresql.org/docs/current/tutorial-transactions.html",
    },
    {
      section: "Competing Purchases", title: "What if both customers see one item left?",
      paragraphs: [
        'Two requests can both read "stock: 1" before either finishes. Reading first and deciding later can produce the wrong result.',
        "One approach is a conditional update: reduce stock only if enough remains. The application creates the order only when that update succeeds, within the same transaction. If either step fails, roll back both changes.",
        "Postgres coordinates competing updates to the same row. At its default Read Committed isolation level, a waiting update checks its condition again after the other update commits.",
        "Stronger isolation can protect more complex rules, but some transactions then need to be retried. Wrapping a read and a write in a transaction does not automatically make every purchase algorithm safe.",
      ],
      remember: "Use the transaction, update condition, and isolation behavior together to protect the last item.",
      source: "https://www.postgresql.org/docs/current/transaction-iso.html",
    },
    {
      section: "Reading Orders", title: "Correct data still needs efficient queries",
      paragraphs: [
        "Now the customer opens their order history. The application asks for recent orders belonging to that customer.",
        "An index on customer ID and order date can help Postgres find and return those rows without scanning and sorting the whole table. Postgres chooses whether an index helps a particular query.",
        "Indexes take storage and add maintenance work when data changes. Choose them for actual queries rather than indexing every column.",
      ],
      remember: "Design the query first, then evaluate an index that supports it.",
      source: "https://www.postgresql.org/docs/current/indexes-intro.html",
    },
    {
      section: "Replication and CAP", title: "A second copy introduces a new question",
      paragraphs: [
        "A replica receives changes from the primary database. It can serve reads, but it can lag behind.",
        "The customer saves an order on the primary, then reads from a replica that has not received it. Their order appears missing even though it committed. Lag can happen even without a network partition.",
        "CAP concerns the failure case where a network partition stops copies from communicating. A distributed system cannot guarantee both strong consistency and availability for every request during that split.",
        "ACID consistency means preserving data rules. CAP consistency means operations behave like one up-to-date copy. A transaction on the primary does not guarantee a fresh read from every replica.",
      ],
      remember: "Decide which reads can tolerate lag. Do not attach a fixed CP label to Postgres without describing the deployment and its behavior.",
      source: "https://apple.github.io/foundationdb/cap-theorem.html",
    },
    {
      section: "Trade-offs", title: "Every extra guarantee has a cost",
      paragraphs: [
        "Coordinating purchases protects stock, but competing updates can wait or require retries.",
        "Indexes can speed up order-history reads, but consume space and add write work.",
        "Replicas can spread read traffic, but introduce lag and failover decisions. Waiting for a replica during commit can improve protection against losing recent writes, but adds delay and dependence on that replica.",
        "Replication does not replace backups. An accidental deletion can reach the replicas too.",
      ],
      remember: "Choose guarantees for the operation: a purchase and a browsing page can have different needs.",
      source: "https://www.postgresql.org/docs/current/warm-standby.html",
    },
    {
      section: "Interview Application", title: "Explain the design through one purchase",
      paragraphs: [
        '"We have related customer, order, and inventory records, so I would start with Postgres."',
        '"I would reserve stock and create the order in one transaction, using a conditional update to prevent overselling. I would index the order-history query by customer and date."',
        '"If we add read replicas, I would decide which reads can tolerate older data. The immediate order confirmation must not depend on a replica that has not caught up."',
        "Each mechanism solves a requirement we named earlier. Explain the cost of that mechanism and what you would measure before adding more infrastructure.",
      ],
      remember: "Connect the model, rules, transaction boundary, queries, and failure behavior to the same user action.", source: "",
    },
  ],
};
