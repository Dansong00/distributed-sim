export const mysqlLesson = {
  title: "MySQL",
  reviewed: "2026-10-27",
  slides: [
    {
      section: "What Is MySQL?", title: "A relational database that runs as a server",
      paragraphs: [
        { label: "Relational database management system", text: "MySQL stores data in tables and supports SQL queries, joins, constraints, and transactions." },
        { label: "Client/server", text: "Your application and MySQL run as separate programs. The application sends SQL requests to MySQL, which reads or changes the stored data and sends back rows or a result." },
        "These programs can run on the same computer or on different computers connected by a network. Multiple applications can connect to the same MySQL server.",
      ],
      remember: "Your application sends requests. MySQL stores the data, executes the queries, and returns the results.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/what-is-mysql.html",
    },
    {
      section: "MySQL and InnoDB", title: "The storage engine determines important behavior",
      paragraphs: [
        { label: "Storage engine", text: "Manages how table data is stored, retrieved, and locked." },
        { label: "InnoDB", text: "MySQL's default engine. It supports transactions, crash recovery, foreign keys, and row-level locking." },
        "MySQL supports other engines with different capabilities. For example, not every engine can roll back changes. The transaction and locking behavior in this deck describes InnoDB tables.",
      ],
      remember: "Know which engine your tables use before relying on its guarantees.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/innodb-introduction.html",
    },
    {
      section: "Tables, Types, and Rules", title: "Define valid data before accepting writes",
      paragraphs: [
        { label: "Column types", text: "Specify the kind of value a column stores: INT for whole numbers, DECIMAL for exact decimal numbers, and VARCHAR or TEXT for text." },
        { label: "Primary key", text: "Identifies each row using a column or combination of columns. The key must be unique, and none of its columns can be NULL." },
        { label: "Foreign key", text: "Requires a reference to match a key in another table. For example, an order's non-null customer_id must refer to an existing customer." },
        { label: "Other constraints", text: "NOT NULL requires a value. UNIQUE prevents duplicate non-null keys. An enforced CHECK condition such as quantity >= 0 rejects negative quantities." },
        { label: "Strict SQL mode", text: "A setting that makes MySQL reject invalid input in many cases instead of adjusting it. For a normal INSERT, putting 'abc' into an INT column causes an error in strict mode. Without strict mode, MySQL can save 0 and issue a warning." },
      ],
      remember: "Types describe values. Constraints enforce rules. Strict mode controls how MySQL handles invalid input; keep it consistent across environments.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/sql-mode.html",
    },
    {
      section: "Transactions and ACID", title: "Make related changes succeed together",
      paragraphs: [
        { label: "Transaction", text: "A group of database changes. COMMIT accepts the group; ROLLBACK discards its uncommitted changes." },
        { label: "Atomicity", text: "Save the entire group or none of it. If a group must be cancelled, roll back the transaction so earlier changes in that group are not left saved." },
        { label: "Consistency", text: "Keep valid data valid. For example, quantities must remain nonnegative and orders must reference existing customers. Define these rules with constraints and application logic; MySQL cannot infer them." },
        { label: "Isolation", text: "Controls what transactions can see and change while running at the same time. InnoDB keeps older row versions for reads and uses locks to prevent conflicting writes from proceeding together." },
        { label: "Durability", text: "Committed changes must survive a restart. By default, InnoDB flushes a redo log, a record used to recover changes, to storage at each commit. Delaying that flush can lose recent commits in a crash. Losing the storage itself still requires backups or another durable copy." },
        { label: "Autocommit", text: "Automatically commits each successful statement as its own transaction when no explicit transaction is open. It is enabled by default. START TRANSACTION groups several statements until you issue COMMIT or ROLLBACK." },
      ],
      remember: "Several successful SQL statements are not automatically one atomic operation.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/commit.html",
    },
    {
      section: "Isolation and Concurrency", title: "Concurrent work needs rules about reads and writes",
      paragraphs: [
        { label: "Snapshot reads", text: "Read saved versions of rows from a point in time. InnoDB uses older row versions when needed, so these reads can continue while other transactions change the rows." },
        { label: "Repeatable Read", text: "InnoDB's default isolation level. Inside a transaction, the first plain SELECT, without FOR UPDATE or FOR SHARE, normally establishes the snapshot. Later plain SELECTs reuse it, while still seeing that transaction's own changes." },
        "For example, your transaction reads a price of 10. Another transaction changes it to 12 and commits. A second plain SELECT in your transaction still sees 10, unless your transaction also changed that row.",
        { label: "Locks", text: "InnoDB tracks which transaction holds permission to change a record. If transaction A updates a row, another transaction trying to update that row normally waits. A releases its update lock when it commits or rolls back. A plain snapshot read can still see an older committed version." },
        { label: "Locking reads", text: "SELECT ... FOR UPDATE inside a transaction reads and locks records before you change them. Unlike a snapshot read, it prevents competing updates from proceeding. Depending on the query and isolation level, locks can also cover index ranges and block new rows in those ranges." },
        { label: "Deadlock", text: "A waits for a lock held by B, while B waits for a lock held by A. InnoDB normally detects the cycle and rolls one transaction back. The application must be prepared to retry that transaction." },
      ],
      remember: "Keep transactions short and choose concurrency behavior for the operation you need to protect.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html",
    },
    {
      section: "Queries and Indexes", title: "Your primary key affects more than identification",
      paragraphs: [
        { label: "Clustered index", text: "InnoDB stores row data in this index, normally organized by the primary key." },
        { label: "Secondary index", text: "Stores its indexed columns plus the row's primary key. MySQL can use that key to find the complete row. A wide primary key therefore increases the space used by secondary indexes." },
        "Good indexes help queries find fewer rows and can reduce the number of records an update locks. Every additional index also needs maintenance when data changes. Inspect query plans before adding indexes.",
      ],
      remember: "Choose keys and indexes around actual queries, storage cost, and write behavior.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html",
    },
    {
      section: "Replication", title: "Extra copies help reads, but can fall behind",
      paragraphs: [
        { label: "Replication", text: "Copies changes from a source server to replicas. Applications can send suitable reads to replicas to distribute read traffic." },
        { label: "Asynchronous replication", text: "MySQL's standard replication works this way by default. The source can commit before a replica applies the change, so a replica can return older data." },
        "Replicas do not automatically increase the source's write capacity. They also introduce decisions about read routing, lag, and what happens when the source fails.",
      ],
      remember: "Decide which reads can tolerate older data before sending them to replicas.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/replication.html",
    },
    {
      section: "Backup and Recovery", title: "Recovering service and recovering data are different jobs",
      paragraphs: [
        { label: "Backup", text: "Preserves a recoverable database state. A replica alone is not enough: an accidental deletion can be copied to it too." },
        { label: "Binary log", text: "Records database changes and supports replication and recovery." },
        { label: "Point-in-time recovery", text: "Restores a backup, then replays available log events up to a chosen point. That can help recover to just before a destructive operation, provided the necessary backup and logs are available." },
        "Test the restore process, not just backup creation.",
      ],
      remember: "Define how much data loss and downtime the application can tolerate, then test whether recovery meets those limits.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/point-in-time-recovery.html",
    },
    {
      section: "Trade-offs and Interview Guidance", title: "Explain the requirements that make MySQL fit",
      paragraphs: [
        { label: "What you gain", text: "Shared relational storage, SQL queries, constraints, and transactional updates with InnoDB." },
        { label: "What you take on", text: "A database service to operate, connections to manage, query tuning, backups, and concurrency problems such as lock waits and deadlocks." },
        { label: "Scaling choices have costs", text: "Indexes add write work; read replicas can lag; distributing writes requires additional design. These costs follow from the mechanisms covered in this deck." },
      ],
      remember: "Explain the data relationships, transaction boundaries, main queries, and failure requirements. Those make a stronger justification than naming MySQL alone.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/innodb-introduction.html",
    },
  ],
};
