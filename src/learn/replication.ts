export const replicationLesson = {
  title: "Replication",
  reviewed: "2026-10-27",
  slides: [
    {
      section: "What Is Replication?", title: "Keep copies of the same data on different servers",
      paragraphs: [
        { label: "Replication", text: "Copies data changes between servers. Each maintained copy is a replica." },
        "Replicas can serve read requests, place data closer to users, or take over when another server fails. Keeping those copies current requires ongoing work.",
        { label: "Replication and sharding", text: "Solve different problems. Replication keeps copies of the same data. Sharding divides data into different groups. A system can use both by keeping several copies of each group." },
      ],
      remember: "Adding read replicas can increase read capacity. It does not automatically increase the number of writes the system can handle.",
      source: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html",
    },
    {
      section: "How Changes Reach a Replica", title: "Start with a copy, then follow the changes",
      paragraphs: [
        { label: "Snapshot", text: "A copy of the database at a known point. A common replication setup starts with this copy." },
        { label: "Change log", text: "Records later changes on the source. The replica receives these records and applies them to its own data." },
        "The replica tracks its progress so it can resume after a disconnect. Receiving a change and applying it are separate steps.",
        { label: "Physical replication", text: "Copies changes to database storage." },
        { label: "Logical replication", text: "Describes changes to data, such as inserted or updated rows. It can allow selected tables to be copied instead of the whole database." },
      ],
      remember: "Start with an initial copy, then receive and apply later changes.",
      source: "https://www.postgresql.org/docs/current/logical-replication.html",
    },
    {
      section: "Asynchronous Replication", title: "Confirm the write without waiting for another copy",
      paragraphs: [
        { label: "Asynchronous replication", text: "The writing server can confirm success before a replica receives the change." },
        "The application avoids waiting for the replica. But the replica can return older data until it catches up.",
        "If the writing server fails permanently before sending a confirmed change, a replacement replica will not have that change.",
      ],
      remember: "The trade-off is less waiting during writes, in exchange for older reads and possible loss of recent writes during failover.",
      source: "https://www.postgresql.org/docs/current/warm-standby.html",
    },
    {
      section: "Synchronous Replication", title: "Wait for other copies before confirming success",
      paragraphs: [
        { label: "Synchronous replication", text: "A write waits for confirmation from the required replicas before reporting success. What that confirmation means matters." },
        { label: "Received", text: "The replica has the change, possibly only in memory." },
        { label: "Stored durably", text: "The replica saved it to storage that can survive a restart." },
        { label: "Applied", text: "The replica updated its data so queries can see the change." },
        "Waiting for durable copies protects against losing the writing server. It adds delay, and writes can stall if too few required replicas respond.",
      ],
      remember: "Synchronous replication does not necessarily wait for every replica. Nor does every synchronous mode guarantee that replica reads already show the change.",
      source: "https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION",
    },
    {
      section: "Replication Lag", title: "A successful save can still be followed by an older read",
      paragraphs: [
        { label: "Replication lag", text: "Means a replica has not yet applied changes from the source." },
        "Suppose you update your profile and receive confirmation. The next page loads from a replica that still holds your old profile. Your save appears to have disappeared.",
        { label: "Read-your-writes", text: "Your later reads include your own completed changes. The application can read from the primary that accepted the write. Another approach waits until a replica applies that specific change." },
      ],
      remember: "A fixed delay, such as 'wait one second,' cannot guarantee that a replica catches up. The application needs evidence of progress.",
      source: "https://dev.mysql.com/doc/refman/8.4/en/gtid-functions.html",
    },
    {
      section: "Where Writes Go", title: "Different write arrangements create different coordination work",
      paragraphs: [
        { label: "Single leader", text: "One server accepts writes for a set of data. Followers copy its changes. This gives writes one place to be ordered, but replacing that leader requires a failover process." },
        { label: "Multiple leaders", text: "Several servers accept writes and exchange changes. This can let users write to a nearby server. If two leaders change the same item independently, the system needs a conflict rule. Choosing the latest timestamp can discard another valid edit." },
        { label: "Leaderless", text: "Requests can go through any coordinating server, which sends them to the replicas holding the data. The system waits for a configured number of replies and repairs differences between copies." },
      ],
      remember: "These arrangements describe where writes go. They do not, by themselves, tell you whether replication is synchronous or asynchronous.",
      source: "https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html",
    },
    {
      section: "Failover", title: "A replacement server must take over safely",
      paragraphs: [
        { label: "Failover", text: "Moves a failed server's responsibilities to another server. In a single-leader system, the process selects a suitable replica, promotes it to leader, and redirects application connections. How current that replica is affects whether recent writes survive." },
        "A missing response does not prove the old leader stopped. Its network connection can be broken while it still accepts writes.",
        { label: "Split brain", text: "Happens when two servers both act as the sole leader. They can accept conflicting changes." },
        { label: "Fencing", text: "Prevents the old leader from continuing to write, for example by shutting it down or blocking its access." },
      ],
      remember: "Safe failover needs protection against the old leader continuing to write, not just a replacement server.",
      source: "https://www.postgresql.org/docs/current/warm-standby-failover.html",
    },
    {
      section: "Replication and Backups", title: "A current copy cannot always recover an earlier state",
      paragraphs: [
        "Replication also copies unwanted changes. If someone deletes the wrong records, replicas can apply that deletion too.",
        { label: "Backup", text: "Preserves an earlier recoverable state." },
        { label: "Point-in-time recovery", text: "Restores a backup and replays saved change logs up to a chosen moment. That can recover the database to just before an accidental deletion." },
        "Replication helps keep service running after a server failure. Backups and retained logs help recover earlier data.",
      ],
      remember: "Both need testing. A replica that cannot take over and a backup that cannot be restored provide little protection.",
      source: "https://www.postgresql.org/docs/current/continuous-archiving.html",
    },
    {
      section: "Trade-offs and Design Guidance", title: "Choose the guarantees your application needs",
      paragraphs: [
        { label: "What you gain", text: "More places to read data and more options for surviving a server failure." },
        { label: "What you take on", text: "Extra servers, storage, network traffic, monitoring, and recovery work. Every copied write consumes resources." },
        { label: "Connection to CAP", text: "During a network split, a system that needs agreement between disconnected copies must stop some operations. A system that continues independently needs to handle older reads or conflicting writes." },
        "In an interview, explain which reads can be old, how much recent data can be lost, and how long recovery can take.",
      ],
      remember: "'Add three replicas' is incomplete until you explain how writes reach them and what happens when one stops responding.",
      source: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/",
    },
  ],
};
