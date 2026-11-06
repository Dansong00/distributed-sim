export const blockStorageLesson = {
  title: "Block Storage",
  reviewed: "2026-11-05",
  slides: [
    {
      section: "The Block Interface", title: "A volume supplies addresses, not filenames",
      paragraphs: [
        { label: "Volume", text: "A disk-like device that exposes numbered blocks. Software can read or overwrite selected ranges without replacing a whole stored object. The block interface moves bytes; it does not understand what those bytes mean." },
        "A filesystem organizes blocks into files, directories and metadata. A database using those files adds records, queries and transaction rules. These are layers with different responsibilities: a database can use block storage without the volume becoming a database.",
        "Attaching a volume makes its device accessible to a host. It does not create a filesystem, mount it or start a database. The diagram shows a common database-on-files path; software designed for raw block access can use a different path.",
      ],
      remember: "Block addresses locate bytes. Higher layers give them structure.",
      source: "https://aws.amazon.com/compare/the-difference-between-block-file-object-storage/",
    },
    {
      section: "Safe Setup", title: "Attach first, inspect before formatting",
      paragraphs: [
        { label: "Provision and attach", text: "Provisioning allocates a volume. Attaching exposes the device to a host. Identify the intended device and inspect whether it already contains data or a filesystem; a newly attached device is not necessarily empty." },
        { label: "Format and mount", text: "Formatting creates a filesystem. Mounting makes that filesystem accessible at a location in the host's directory tree. For file use, format only the verified empty intended volume; mount a suitable existing filesystem without formatting it again." },
        "A volume restored from a snapshot can already contain a filesystem and valuable data. Formatting it overwrites filesystem structures and can destroy access to that data. Successful attachment gives no reason to run a format operation automatically.",
      ],
      remember: "New to this host does not mean empty.",
      source: "https://docs.aws.amazon.com/ebs/latest/userguide/ebs-using-volumes.html",
    },
    {
      section: "Persistence and Placement", title: "Persistent does not mean undeletable or always reachable",
      paragraphs: [
        "Persistent storage can retain delivered data after a process stops or an instance's running life ends. The service lifecycle and deletion policy still matter. Amazon EBS volumes can outlive an EC2 instance, but its delete-on-termination setting can remove a volume when the instance terminates. Inspect the actual setting instead of assuming it survives.",
        { label: "Availability Zone", text: "A provider-defined location boundary used to isolate failures. EBS attaches a volume to instances in the same zone and replicates volume data within that zone to protect against component failures." },
        "Copies inside one zone do not establish access during a zone-wide outage. They also do not undo an intentional or accidental deletion. Check the chosen product's placement and recovery guarantees; the generic block-storage label does not specify its topology.",
      ],
      remember: "Check lifetime, deletion policy and failure boundary separately.",
      source: "https://docs.aws.amazon.com/ebs/latest/userguide/EBSFeatures.html",
    },
    {
      section: "Write Completion", title: "Accepted into memory is not yet durable",
      paragraphs: [
        "Writes can pass through volatile application buffers and operating-system caches before reaching persistent storage. An ordinary buffered write can report success while recent bytes remain only in memory. A host crash can lose those bytes; a persistent volume cannot preserve data that never reached it.",
        "Use the application's or database's supported durability procedure. It must send the relevant buffered data onward, wait for the required completion and handle errors. On Linux, fsync flushes a file's data and relevant metadata toward durable storage and waits for the device's completion report. It cannot flush bytes still held only in an application's own buffer.",
        "The operation's scope matters: syncing a file does not necessarily persist its directory entry; Linux may also require syncing the containing directory. Follow the supported procedure for the operation and storage stack instead of treating one call as a universal recipe.",
        "Successful durability completion covers specified data under a specified failure model. It does not protect against every disaster or later deletion, and it does not make several related writes one transaction. The database or application still owns transaction and recovery rules.",
      ],
      remember: "Ask which data reached which durability boundary, and check the result.",
      source: "https://man7.org/linux/man-pages/man2/fsync.2.html",
    },
    {
      section: "Shared Access", title: "Two attachments do not coordinate two writers",
      paragraphs: [
        "Where supported, multi-attach exposes the same block device to multiple hosts. It does not itself coordinate their filesystem caches, metadata changes or application transactions.",
        "An ordinary single-host filesystem assumes it controls its disk structures. Two independent mounts can each cache an old view and make conflicting updates, overwriting metadata or data. Attachment can succeed while concurrent writing is unsafe. AWS explicitly warns that ordinary XFS and EXT4 filesystems are not designed for simultaneous access from multiple servers.",
        "If the requirement is simply shared files and directories, consider a shared file service. Shared block access needs a filesystem or application expressly designed to coordinate it. Verify both provider attachment support and the software's coordination requirements; enabling a volume option does not supply those rules.",
      ],
      remember: "Shared device access needs coordinated software above it.",
      source: "https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes-multi.html",
    },
    {
      section: "Snapshots and Recovery", title: "A disk snapshot is not automatically an application backup",
      paragraphs: [
        "A snapshot preserves a volume's state at a point in time. EBS snapshots capture data written to the volume, excluding bytes still in application or operating-system caches. During an application update, the stored state may contain only some related writes.",
        { label: "Crash recovery", text: "A database may be able to repair or replay a disk state as it would after a crash. That is different from an application-consistent backup prepared at a valid application boundary. Snapshot success alone proves neither a complete transaction nor that the application can recover." },
        "Use the database's or application's supported backup procedure. Coordinate flushing and pausing writes where required, including all relevant data volumes. A pause by itself does not send buffered bytes to storage. For EBS, snapshot creation continues asynchronously; check completion before relying on that recovery point.",
        "Restore into a volume, attach it appropriately and use its existing filesystem without formatting. Retain historical points that meet your recovery needs: a snapshot taken after a damaging update may preserve the damage. Test restoration and application usability, including how much data and recovery time you can afford to lose.",
      ],
      remember: "Keep usable recovery points and prove that you can restore them.",
      source: "https://docs.aws.amazon.com/ebs/latest/userguide/ebs-creating-snapshot.html",
    },
    {
      section: "Performance", title: "Count operations, bytes and time separately",
      paragraphs: [
        "Capacity measures how much data fits. IOPS counts input/output operations per second. Throughput measures bytes transferred per second. I/O latency is the time one operation takes to complete. More capacity alone does not guarantee faster access.",
        "Many small random requests can exhaust an operation-rate limit while transferring relatively few bytes. A large sequential scan can hit a byte-throughput limit with fewer operations. Request size and access pattern matter; there is no universal ranking that makes every workload fast.",
        "Measure a representative workload: its request sizes, demand, latency and queued requests. A queue holds operations waiting for completion; excessive demand can increase that wait. Compare both volume limits and the host's storage-path limits. EBS, for example, can be limited by the instance's bandwidth as well as the volume.",
        "If the host or another part of the application is the bottleneck, buying more volume performance may not reduce application latency. Find where the time goes before changing the setting.",
      ],
      remember: "Match the limit you change to the limit the workload reaches.",
      source: "https://docs.aws.amazon.com/ebs/latest/userguide/ebs-io-characteristics.html",
    },
    {
      section: "Choosing the Interface", title: "Start with the operations the software needs",
      paragraphs: [
        { label: "Block", text: "Fits an operating-system disk or database engine updating ranges in disk-like storage. A database can use files on the volume while retaining responsibility for records and transactions." },
        { label: "File", text: "A shared file service exposes named files, directories and filesystem operations to multiple hosts. It supplies a sharing interface that a raw block attachment does not." },
        { label: "Object", text: "Provides key-based access to stored objects, useful for blobs such as media and exports. That differs from addressing ranges on an attached disk." },
        { label: "Database", text: "Supplies record queries and transaction behavior. Selecting a block volume does not create those capabilities." },
        "Choosing block storage leaves filesystem or database management, safe attachment, deletion settings, capacity, performance and tested recovery to the system's operators. Choose by access pattern, sharing and recovery needs, not just by the familiarity of a disk.",
      ],
      remember: "The storage interface is one layer of the design.",
      source: "https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html",
    },
  ],
};
