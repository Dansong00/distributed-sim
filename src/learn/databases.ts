export const databasesLesson = {
  title: "Database Overview",
  reviewed: "2026-10-26",
  slides: [
    {
      section: "What Is It?", title: "Your database shapes how the system works",
      paragraphs: [
        "A database stores and organizes the data your application needs. Its design affects how you read, update, protect, and grow that data.",
        "Consider a store: customers place orders, products have different details, and stock must not fall below zero. These needs affect the data model, the rules you enforce, and the queries you run.",
        "Changing databases later can mean moving data and rewriting queries. Start with the work your system must do, then evaluate the products that fit.",
      ],
      remember: "Keep the requirements in view: what do we store, what do we ask, and what must stay correct?",
      source: "https://www.postgresql.org/docs/current/tutorial-concepts.html",
    },
    {
      section: "Database Choice", title: "Choose around your data, queries, and rules",
      paragraphs: [
        "The data model describes how you organize information: tables, documents, keys and values, or connected nodes. It helps determine which queries are natural to express.",
        "Database choice means finding a product that supports your main queries and protects your data rules. For our store, that includes finding orders and preventing sales when stock runs out.",
        "A relational database can store JSON. A document database can support transactions. Check what each product offers, how much traffic it can handle, and the work it takes to run.",
      ],
      remember: "Start with the data, the questions you ask, and the rules that must hold. Then compare database products.",
      source: "https://www.postgresql.org/docs/current/datatype-json.html",
    },
    {
      section: "Models: Records", title: "Tables, documents, and direct lookups",
      paragraphs: [
        { label: "Relational", text: "Store customers, orders, and products in tables, then join related records when needed. Constraints can enforce references and valid values. Examples include PostgreSQL, MySQL, and SQLite." },
        { label: "Document", text: "Often organize a record around an embedded document, such as a product with its specifications and sizes. Reading related details together can be convenient. Copying shared details into many documents creates more places to update. MongoDB is one example." },
        { label: "Key-value", text: "Retrieve a value using a known key, such as session:123. This fits direct lookups. Queries on other fields depend on the product's extra capabilities or additional data structures. Redis is one example." },
        "These are modeling choices, not exclusive abilities. The same product can be represented in relational tables or a JSON column. Compare the queries and updates each layout requires.",
      ],
      remember: "A flexible document still needs rules. A table can hold flexible fields. Compare the data layout and supported guarantees, not just the label.",
      source: "https://www.mongodb.com/docs/manual/data-modeling/",
    },
    {
      section: "Models: Specialized Queries", title: "Choose a structure that fits the question",
      paragraphs: [
        { label: "Wide-column", text: "In Cassandra-style systems, choose partition keys around known queries. Device readings can be grouped by device and day. Poor key choices can overload one partition; a new query can need a new table." },
        { label: "Graph", text: "Store entities as nodes and connections as relationships. This supports following paths, such as a person connected to a company connected to an account. Neo4j is one example. Related records alone do not require a graph store." },
        { label: "Vector", text: "Index lists of numbers called embeddings to find similar items. This supports tasks such as semantic search, which searches by meaning. Approximate search can trade some result accuracy for speed. A vector index does not determine the system's CAP behavior." },
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
        "Keeping shared facts in one place reduces duplicate updates. But reading related details can require joins. Embedding copies can simplify a read, but keeping those copies correct takes work.",
        "Organizing data for a known query can make that query efficient. But a new query can require another layout, index, or copy of the data.",
        "Adding a specialized database can help one workload, but it adds backups, monitoring, and data synchronization. There is no rule that SQL always favors correctness or NoSQL always favors availability.",
      ],
      remember: "Explain both the benefit and the cost. Check the actual product, deployment, and operation before claiming a guarantee.",
      source: "https://apple.github.io/foundationdb/cap-theorem.html",
    },
    {
      section: "Trade-offs: CAP", title: "When does CAP matter?",
      paragraphs: [
        "CAP applies to distributed systems, where data is handled across multiple servers. You do not need multiple database copies for every application.",
        "Consistency means every read sees the latest completed write. Availability means every request to a working server gets a successful response, even if the data is stale.",
        "A network partition means some servers cannot communicate. During a partition, a distributed database cannot guarantee both consistency and availability. It must either wait or reject some requests, or allow results that may be out of date.",
      ],
      remember: "CAP is a trade-off during network failures. A database type, such as relational or document, does not determine its CAP guarantees.",
      source: "https://apple.github.io/foundationdb/cap-theorem.html",
    },
    {
      section: "Interview Tip", title: "Connect the requirement to the choice",
      paragraphs: [
        "Start with the records and main queries. Then name which updates must succeed together, how much traffic you expect, and what older or missing data would mean to users.",
        'For example: "Our orders reference customers and products, and stock must stay valid when people buy at the same time. I will evaluate a relational database and define the transaction that reserves stock."',
        "If the design uses distributed copies, explain what happens when they cannot communicate. Use CAP to discuss that failure case, rather than using it as the only reason to select a database.",
      ],
      remember: "Requirements lead to a model, queries, and guarantees. Product names come after that reasoning.", source: "",
    },
  ],
};
