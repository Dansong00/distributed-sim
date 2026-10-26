export const sqliteLesson = {
  title: "SQLite",
  reviewed: "2026-10-26",
  slides: [
    {
      section: "What Is SQLite?", title: "A SQL database built into your application",
      paragraphs: [
        { label: "Relational database engine", text: "SQLite stores data in tables and supports SQL queries, joins, indexes, and transactions." },
        { label: "Embedded", text: "The engine runs inside your application's process. Your code calls SQLite directly, rather than sending queries to a separate database server." },
        { label: "Serverless", text: "Here, this means there is no separate database server to manage. A persistent database lives in a local file. SQLite also supports in-memory databases." },
      ],
      remember: "SQLite changes where the database runs. You still have a relational database.",
      source: "https://www.sqlite.org/whentouse.html",
    },
    {
      section: "Where Does It Fit?", title: "Keep data close to the code that uses it",
      paragraphs: [
        { label: "Mobile and desktop applications", text: "Store data locally and use it without a network connection." },
        { label: "Embedded devices and command-line tools", text: "Get structured storage without a database service to install." },
        { label: "Server applications", text: "SQLite can also sit behind a web application. Users contact the application server, which accesses its local database." },
        "The key questions are where the data lives and how much work competes to write it. SQLite is not limited to prototypes.",
      ],
      remember: "Choose based on the workload and access pattern, not whether the project is small or serious.",
      source: "https://www.sqlite.org/whentouse.html",
    },
    {
      section: "Tables, Types, and Rules", title: "Flexible typing still needs clear rules",
      paragraphs: [
        { label: "Type affinity", text: "In ordinary SQLite tables, a column's affinity guides conversions but does not strictly limit every stored value. An integer column can retain text that cannot be converted." },
        { label: "STRICT tables", text: "These enforce stronger type checks. Values must fit the declared type after permitted conversions, except columns explicitly declared ANY." },
        { label: "Constraints", text: "NOT NULL, UNIQUE, and CHECK reject invalid values." },
        { label: "Foreign keys", text: "These protect relationships. Explicitly enable their enforcement on each connection with PRAGMA foreign_keys = ON, before starting a transaction." },
      ],
      remember: "Decide which flexibility you want and which rules the database must enforce.",
      source: "https://www.sqlite.org/stricttables.html",
    },
    {
      section: "Transactions and ACID", title: "Group related changes into one operation",
      paragraphs: [
        { label: "Transaction", text: "Groups database changes. Commit accepts them; rollback cancels them." },
        { label: "Atomicity", text: "All changes succeed together, or none take effect." },
        { label: "Consistency", text: "Changes preserve the rules you defined." },
        { label: "Isolation", text: "Concurrent transactions do not expose incomplete changes under normal settings." },
        { label: "Durability", text: "Committed changes survive failures according to the configured guarantees." },
        "SQLite supports ACID transactions, but durability settings matter. For example, WAL with synchronous=NORMAL can lose recent committed transactions after a power failure while preserving database consistency.",
      ],
      remember: "A successful commit and protection against every kind of failure are not interchangeable promises.",
      source: "https://www.sqlite.org/pragma.html#pragma_synchronous",
    },
    {
      section: "Concurrency", title: "Many connections, one writer at a time",
      paragraphs: [
        { label: "One active writer", text: "SQLite supports multiple connections, including connections from different processes on the same machine. But each database allows only one active writer at a time." },
        { label: "SQLITE_BUSY", text: "A connection can receive this result when it cannot obtain access. Competing writes must take turns. Waiting or retrying needs a deliberate limit." },
        { label: "Short transactions", text: "Keep write transactions short. A transaction that waits on a network request can hold up unrelated writes." },
      ],
      remember: "Measure write contention and transaction duration, not just the number of users.",
      source: "https://www.sqlite.org/isolation.html",
    },
    {
      section: "Journaling and WAL", title: "How readers and writers share the database",
      paragraphs: [
        { label: "Rollback journal", text: "Records original data so SQLite can undo an interrupted change. In this mode, readers and writers can block each other." },
        { label: "Write-ahead logging (WAL)", text: "Records changes in a separate log. Readers can continue using a stable snapshot while a writer commits changes." },
        { label: "Checkpoint", text: "Transfers logged changes into the main database file. Long-running reads can delay checkpoint progress and allow the log to grow." },
        "WAL still allows only one writer, and its shared-memory design requires processes on the same machine.",
      ],
      remember: "WAL improves reader/writer overlap; it does not enable simultaneous writers.",
      source: "https://www.sqlite.org/wal.html",
    },
    {
      section: "Queries and Indexes", title: "Local queries still need efficient access paths",
      paragraphs: [
        { label: "Query planner", text: "SQLite supports joins, filtering, sorting, and aggregation. Its query planner chooses how to retrieve the requested data." },
        { label: "Index", text: "Can help locate matching rows or return them in the required order. A composite index covers multiple columns, and their order affects which queries it helps." },
        "Indexes also take space and add work when rows change. Inspect the query plan and measure real queries before adding more indexes.",
      ],
      remember: "Avoiding a network call does not make an expensive query cheap.",
      source: "https://www.sqlite.org/queryplanner.html",
    },
    {
      section: "Operating SQLite", title: "Fewer services, but data still needs care",
      paragraphs: [
        { label: "Backups", text: "Use a supported backup method for an active database. In WAL mode, committed data can still live in the WAL file, so copying only the main file can omit changes." },
        { label: "Schema changes", text: "Plan how existing databases move to a new structure. Some changes require rebuilding a table and copying its data." },
        { label: "Synchronization", text: "Moving changes between devices or servers requires additional software. A local transaction does not resolve conflicting edits elsewhere." },
      ],
      remember: "Embedded storage still needs an upgrade, backup, and recovery plan.",
      source: "https://www.sqlite.org/backup.html",
    },
    {
      section: "Trade-offs and Interview Guidance", title: "Choose SQLite for the access pattern",
      paragraphs: [
        { label: "What you gain", text: "Direct local access, fewer services to run, and a database that can travel with the application." },
        { label: "What you accept", text: "One writer per database, responsibility for local files, and additional work if data must synchronize across machines." },
        { label: "Client/server databases", text: "Often a better fit when many machines need shared database access or competing writes cannot take turns. SQLite can still be suitable behind an application server with local storage." },
      ],
      remember: "Explain where the data lives, who writes it, and how failures are handled. Those requirements make the choice defensible.",
      source: "https://www.sqlite.org/whentouse.html",
    },
  ],
};
