export const sqliteLesson = {
  title: "SQLite",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "What Is SQLite?", title: "A SQL database built into your application",
      paragraphs: [
        {"label": "Relational database engine", "text": "SQLite stores data in tables and supports SQL queries, joins, indexes, and transactions."},
        {"label": "Embedded", "text": "The engine runs inside your application's process. Your code calls SQLite directly, rather than sending queries to a separate database server."},
        {"label": "Serverless", "text": "Here, this means there is no separate database server to manage. A persistent database lives in a local file. SQLite also supports in-memory databases."},
        "The application and host still own filesystem permissions, storage capacity and recovery; embedded execution does not remove those responsibilities.",
      ],
      remember: "SQLite changes where the database runs. You still have a relational database.",
      source: "https://www.sqlite.org/whentouse.html",
    },
    {
      section: "Where Does It Fit?", title: "Keep data close to the code that uses it",
      paragraphs: [
        {"label": "Mobile and desktop applications", "text": "Store data locally and use it without a network connection."},
        {"label": "Embedded devices and command-line tools", "text": "Get structured storage without a database service to install."},
        {"label": "Server applications", "text": "SQLite can also sit behind a web application. Users contact the application server, which accesses its local database."},
        "The key questions are where the data lives and how much work competes to write it. SQLite is not limited to prototypes.",
      ],
      remember: "Choose based on the workload and access pattern, not whether the project is small or serious.",
      source: "https://www.sqlite.org/whentouse.html",
    },
    {
      section: "Tables, Types, and Rules", title: "Flexible typing still needs clear rules",
      paragraphs: [
        {"label": "Type affinity", "text": "Ordinary tables use affinity to guide conversions; each value has a storage class, such as integer, text or null. A declared integer column can retain text that cannot be converted."},
        {"label": "STRICT tables", "text": "These enforce stronger type checks. Values must fit the declared type after permitted conversions, except columns explicitly declared ANY."},
        {"label": "Constraints", "text": "Primary keys identify rows; UNIQUE restricts duplicates, NOT NULL rejects missing values and CHECK rejects false conditions. Combine CHECK with NOT NULL when a missing value must also be invalid."},
        {"label": "Foreign keys", "text": "Constrain references to existing rows; null references are allowed unless separately forbidden. Before starting a transaction, enable enforcement on each connection with PRAGMA foreign_keys = ON, then query PRAGMA foreign_keys and check that it returns 1."},
      ],
      remember: "Decide which flexibility you want and which rules the database must enforce.",
      source: "https://www.sqlite.org/stricttables.html",
    },
    {
      section: "Transactions and ACID", title: "Group related changes into one operation",
      paragraphs: [
        {"label": "Transaction", "text": "Groups database changes. Commit accepts them; rollback cancels them."},
        {"label": "Atomicity", "text": "All changes succeed together, or none take effect."},
        {"label": "Consistency", "text": "Changes preserve the rules you defined."},
        {"label": "Isolation", "text": "Controls concurrent visibility and write coordination. Normal settings hide incomplete changes, but do not remove application races, lock waits or the need for correct transaction logic."},
        {"label": "Durability", "text": "Committed changes survive failures according to the configured guarantees. This also requires reliable filesystem locking and storage that honors requests to flush data to persistent media."},
        "Durability settings can trade crash protection for speed. Settings that delay flushing committed changes to persistent storage can lose recent transactions after a power failure.",
        "Only database work inside the transaction is covered. Rollback does not reverse an external network side effect.",
      ],
      remember: "A successful commit and protection against every kind of failure are not interchangeable promises.",
      source: "https://www.sqlite.org/pragma.html#pragma_synchronous",
    },
    {
      section: "Concurrency", title: "Many connections, one writer at a time",
      paragraphs: [
        {"label": "One active writer", "text": "SQLite supports multiple connections, including connections from different processes on the same machine. But each database allows only one active writer at a time."},
        {"label": "SQLITE_BUSY", "text": "A connection can receive this result when it cannot obtain required access. A busy timeout or bounded retry can tolerate brief contention; some failures require retrying the transaction. Waiting does not create another writer or guarantee success."},
        {"label": "Short transactions", "text": "Keep write transactions short. A transaction that waits on a network request can hold up unrelated writes."},
      ],
      remember: "Measure write contention and transaction duration, not just the number of users.",
      source: "https://www.sqlite.org/isolation.html",
    },
    {
      section: "Journaling and WAL", title: "How readers and writers share the database",
      paragraphs: [
        {"label": "Rollback journal", "text": "Records original data so SQLite can undo an interrupted change. In this mode, readers and writers can block each other."},
        {"label": "Write-ahead logging (WAL)", "text": "Records changes in a separate log. Readers can continue using a stable snapshot while a writer commits changes."},
        {"label": "Checkpoint", "text": "Transfers logged changes into the main database file. Long-running reads can delay checkpoint progress and allow the log to grow."},
        "WAL still allows only one writer, and its shared-memory design requires processes on the same machine.",
      ],
      remember: "WAL improves reader/writer overlap; it does not enable simultaneous writers.",
      source: "https://www.sqlite.org/wal.html",
    },
    {
      section: "Queries and Indexes", title: "Local queries still need efficient access paths",
      paragraphs: [
        {"label": "Query planner", "text": "Chooses access and processing steps for joins, filtering, sorting and aggregation. EXPLAIN QUERY PLAN shows those steps."},
        {"label": "Index", "text": "An additional structure that can avoid scanning or sorting all rows. Match columns and their order to actual filters and requested ordering; a composite index contains multiple columns."},
        "A scan can be preferable for small tables or broad queries. The planner need not use an index merely because it exists. Measure representative queries.",
        "Local execution still uses CPU, storage I/O and memory. Indexes take space and add write maintenance; avoiding a network call does not make expensive work free.",
      ],
      remember: "Avoiding a network call does not make an expensive query cheap.",
      source: "https://www.sqlite.org/queryplanner.html",
    },
    {
      section: "Operating SQLite", title: "Fewer services, but data still needs care",
      paragraphs: [
        {"label": "Backups", "text": "Use a supported consistent backup method for an active database. Committed data may still be in the WAL, so copying only the main file can omit required state."},
        {"label": "Schema changes", "text": "A migration changes stored structure. Coordinate it with application versions and active access; some changes require rebuilding a table and copying data."},
        {"label": "Synchronization", "text": "Sharing changes between independent device or server copies requires additional software. Local transactions do not resolve conflicting edits elsewhere."},
        "Manage access permissions and free space. Retain backups according to recovery needs, then test restoration and application usability. A backup file alone does not prove consistency or recovery time.",
      ],
      remember: "Embedded storage still needs an upgrade, backup, and recovery plan.",
      source: "https://www.sqlite.org/backup.html",
    },
    {
      section: "Trade-offs and Interview Guidance", title: "Choose SQLite for the access pattern",
      paragraphs: [
        {"label": "What you gain", "text": "Direct local access, fewer services to run, and a database that can travel with the application."},
        {"label": "What you accept", "text": "One writer per database, responsibility for local files, and additional work if data must synchronize across machines."},
        {"label": "Client/server databases", "text": "Often a better fit when many machines need shared database access or competing writes cannot take turns. SQLite can still be suitable behind an application server with local storage."},
      ],
      remember: "Explain where the data lives, who writes it, and how failures are handled. Those requirements make the choice defensible.",
      source: "https://www.sqlite.org/whentouse.html",
    },
  ],
};
