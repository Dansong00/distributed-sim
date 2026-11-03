export const databasesLesson = {
  title: "Database Overview",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "What Is It?", title: "Your database shapes how the system works",
      paragraphs: [
        "A database manages stored data and operations for retrieving and changing it. Persistent data can outlive the application process that wrote it.",
        "Its data layout affects how applications express queries, perform updates and enforce correctness rules. Moving to another database can require moving data and rewriting those operations.",
        "Persistence still depends on storage and recovery configuration. Hardware failures and accidental changes require appropriate backups, recovery procedures and testing.",
      ],
      remember: "Keep the requirements in view: what do we store, what do we ask, and what must stay correct?",
      source: "https://www.postgresql.org/docs/current/tutorial-concepts.html",
    },
    {
      section: "Database Choice", title: "Choose around your data, queries, and rules",
      paragraphs: [
        "The data model describes how information is organized: tables, documents, keys and values, or connected nodes. An access pattern describes how the application finds, filters, combines or updates that information.",
        "Identify records and relationships, main queries, rules that must hold across updates, expected data and traffic growth, and latency requirements. Also consider whether the team can operate and recover the system.",
        "Categories describe common strengths, not exclusive capabilities. A relational database can store JSON; a document database can support transactions. Check the actual product, deployment and operation rather than assuming a category supplies the required guarantee.",
      ],
      remember: "Start with the data, the questions you ask, and the rules that must hold. Then compare database products.",
      source: "https://www.postgresql.org/docs/current/datatype-json.html",
    },
    {
      section: "Models: Records", title: "Tables, documents, and direct lookups",
      paragraphs: [
        {"label": "Relational", "text": "Rows represent records and columns represent fields. Relationships connect records; joins combine matching records for a query. Constraints can enforce valid values and references."},
        {"label": "Document", "text": "A document groups fields and nested data into one record. Embedding related details can simplify reading them together; copying shared details into many documents creates more places to update."},
        {"label": "Key-value", "text": "Retrieve a value using a known key. This fits direct lookups; queries on other fields depend on additional capabilities or data structures."},
        "The diagram represents the same product using different layouts. Compare the resulting read and update work, not just the label attached to the database.",
      ],
      remember: "A flexible document still needs rules. A table can hold flexible fields. Compare the data layout and supported guarantees, not just the label.",
      source: "https://www.mongodb.com/docs/manual/data-modeling/",
    },
    {
      section: "Models: Specialized Queries", title: "Choose a structure that fits the question",
      paragraphs: [
        {"label": "Wide-column", "text": "In Cassandra-style layouts, a partition key groups records for targeted access. Design that grouping around known queries. Poor keys can overload a partition; a new query may need a new table. This data partition is distinct from a network partition, which is a communication failure."},
        {"label": "Graph", "text": "Entities are nodes and relationships are edges. Traversal follows these connections to answer path questions. Merely having related records does not require a graph store."},
        {"label": "Vector", "text": "An embedding represents an item as a list of numbers. Similarity search finds nearby vectors under a chosen measure; it can support retrieval by meaning. Approximate search trades some result accuracy for speed. Similarity does not prove exact equality or factual correctness."},
      ],
      remember: "Partition lookups, relationship paths, and similarity searches are different workloads. Name the query before choosing a specialized store.",
      source: "https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/data-modeling_logical.html",
    },
    {
      section: "Overlapping Capabilities", title: "One database can support several kinds of data",
      paragraphs: [
        "Geospatial queries work with locations, routes, and areas. They answer questions such as which drivers are nearby or whether an address is inside a delivery area.",
        "These capabilities do not always require a separate product. PostGIS adds spatial types, indexes, and queries to PostgreSQL. The pgvector extension adds vector search to PostgreSQL.",
        "Keeping these tasks together can reduce the number of systems to run. A separate service can still make sense when workload needs or operating limits justify it. Measure those needs instead of assuming one store must do everything.",
      ],
      remember: "A data capability, such as geospatial or vector search, can overlap with a database model, such as relational tables.",
      source: "https://postgis.net/documentation/",
    },
    {
      section: "Trade-offs", title: "Each useful choice brings a cost",
      paragraphs: [
        "An index is an extra access structure that can locate relevant rows without examining every record for suitable queries. It consumes storage and needs maintenance when data changes.",
        "Keeping shared facts in one place reduces duplicate updates but can require joins at read time. Embedding copies can simplify reads while adding updates to coordinate. A new access pattern may need another layout or index.",
        "Distributing data can add capacity or resilience, but introduces remote communication, partial failures and coordination. Adding a specialized store also adds backups, monitoring and synchronization.",
        "No model eliminates these costs. Evaluate actual queries and failure behavior before adding another index, copy or database.",
      ],
      remember: "Explain both the benefit and the cost. Check the actual product, deployment, and operation before claiming a guarantee.",
      source: "https://www.postgresql.org/docs/current/indexes-intro.html",
    },
    {
      section: "Trade-offs: CAP", title: "When does CAP matter?",
      paragraphs: [
        "Replication maintains copies of data on multiple servers. A network partition prevents some servers from communicating while they may remain running and reachable by clients.",
        "CAP consistency means operations behave as one current copy, with completed writes reflected in later reads. CAP availability requires requests to non-failing nodes to complete with the operation's response.",
        "An isolated reader cannot learn a completed write from an unreachable copy. Returning old data sacrifices consistency; waiting indefinitely or refusing the affected operation sacrifices availability.",
        "That conflict applies during the partition. Guarantees depend on the operation and configuration, not a universal relational, document, SQL or NoSQL label.",
      ],
      remember: "CAP is a trade-off during network failures. A database type, such as relational or document, does not determine its CAP guarantees.",
      source: "https://apple.github.io/foundationdb/cap-theorem.html",
    },
    {
      section: "Interview Tip", title: "Connect the requirement to the choice",
      paragraphs: [
        "Start with records, relationships and main queries. State which changes must succeed together, acceptable staleness, expected load and recovery needs.",
        "Connect each requirement to a data layout or capability, then name its write, storage, coordination or operating cost. If copies are distributed, explain behavior when they cannot communicate.",
        "Measure representative queries and updates. Changed access patterns, traffic or recovery requirements can change the choice; popularity and product names are not substitutes for this reasoning.",
      ],
      remember: "Requirements lead to a model, queries, and guarantees. Product names come after that reasoning.",
      source: "https://www.postgresql.org/docs/current/tutorial-concepts.html",
    },
  ],
};
