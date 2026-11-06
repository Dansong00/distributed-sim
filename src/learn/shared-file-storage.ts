export const sharedFileStorageLesson = {
  title: "Shared File Storage",
  reviewed: "2026-11-06",
  slides: [
    {
      section: "The File Interface", title: "Several hosts use one filesystem",
      paragraphs: [
        "A file holds bytes under a name. Directories organize those names into paths, such as /assets/logo.svg. Metadata describes a file: its size, owner and access permissions. A shared file service maintains this filesystem and accepts file operations from multiple hosts.",
        "Applications open, read, update, rename and close files through a filesystem interface. The service manages the shared file organization; each client does not independently manage the same raw disk structures.",
        "A block device exposes addressed blocks. Object storage exposes objects by key. A database adds records, field queries and transaction rules. Shared files provide neither a raw block attachment nor automatic database transactions.",
      ],
      remember: "Shared files give several clients a common set of names and file operations.",
      source: "https://aws.amazon.com/compare/the-difference-between-block-file-object-storage/",
    },
    {
      section: "Mounting", title: "A local path can lead to a remote service",
      paragraphs: [
        "Mounting makes a filesystem accessible at a directory in a host's local path tree. After mounting a share at /shared, a program can open /shared/report.csv using its usual file operations. This does not copy the dataset to the host or require formatting a client disk.",
        "The program calls the operating system. Its filesystem client sends needed requests across the network to the file service and returns results to the program. Some requests can use a client cache, a local copy kept to avoid another network trip.",
        "NFS means Network File System, a protocol for remote file operations. Amazon EFS uses NFS. An EFS mount target is a network endpoint through which clients reach the filesystem. A compatible client, a reachable endpoint and authorized access are all needed; a familiar path does not remove those dependencies.",
      ],
      remember: "Mounting changes how the remote files are reached, not where they live.",
      source: "https://docs.aws.amazon.com/efs/latest/ug/accessing-fs.html",
    },
    {
      section: "Caching and Completion", title: "Visibility and durability answer different questions",
      paragraphs: [
        "A client can cache file contents and metadata, and buffer pending writes in volatile memory. An ordinary buffered write can succeed before its bytes reach the service. A client crash can lose those bytes; remote persistent storage cannot preserve data it never received.",
        { label: "Visibility", text: "EFS provides close-to-open consistency: after a writer finishes writing and successfully closes, a later opener can see the changes. This is not a promise that an already-open reader immediately sees every concurrent write. Follow the client and service's documented cache rules." },
        { label: "Durability", text: "Ask when the service has safely stored the bytes. Use the supported completion procedure, including sending application-held buffers onward, awaiting the required flush or close and checking errors. fsync is a file synchronization operation; it cannot send bytes still held only in an application's private buffer." },
        "EFS documents storage across Availability Zones for Regional filesystem writes at successful synchronous completion, such as fsync, or file close. An Availability Zone is an isolated infrastructure location within a cloud Region. This durability boundary does not make several writes a transaction or protect them from later deletion.",
      ],
      remember: "Check what another reader can observe and what survives a failure separately.",
      source: "https://docs.aws.amazon.com/efs/latest/ug/features.html",
    },
    {
      section: "Concurrent Updates", title: "A shared file still needs an update protocol",
      paragraphs: [
        "Suppose two clients each read a counter of 10, compute 11 and write 11. Both file writes can succeed, yet the final value is 11 rather than 12. The filesystem performed the individual operations; it did not make each read-compute-write sequence one indivisible update.",
        "A single writer can process updates in order. Alternatively, every participant can use a supported lock, a coordination rule that reserves access while an update runs. Acquire it before reading, protect the entire read-modify-write sequence and release it after completing the required writes. Locking only the final write leaves the stale-read problem.",
        "EFS locks are advisory: a program that ignores the lock can still read or write. All participants must cooperate with the same supported locking protocol. Sharing a directory alone does not provide that cooperation.",
        "A lock also cannot undo half an update after a crash. When several related files must change together, use an application or database transaction and recovery design. Atomic recovery means related changes can be recovered as a complete update rather than an arbitrary subset.",
      ],
      remember: "Coordinate the whole update, including what happens if its writer fails.",
      source: "https://docs.aws.amazon.com/efs/latest/ug/features.html",
    },
    {
      section: "Access Control", title: "Reaching the share does not authorize every file",
      paragraphs: [
        "Network rules determine whether the client can reach the service. Client authorization determines whether it may use the filesystem; EFS can use IAM, AWS's identity and access-management policies, when configured. File and directory permissions still control access inside it. A successful mount can therefore be followed by a denied write.",
        "EFS uses Unix-style ownership and permissions with numeric user IDs and group IDs. Read permission allows reading file contents; write permission allows modifying them. A directory's execute, or search, permission allows traversal through that directory to a path beneath it.",
        "The same username on two hosts can map to different numeric IDs. EFS then sees different identities, despite the matching name. Check the effective IDs sent by the client, file ownership, group membership, required directory permissions and client policy.",
        "Align the intended identities and grant only the access the application needs. Making the whole share writable by everyone hides the diagnosis and grants unrelated clients permission to damage data.",
      ],
      remember: "Check the network path, client policy and effective file identity.",
      source: "https://docs.aws.amazon.com/efs/latest/ug/accessing-fs-nfs-permissions.html",
    },
    {
      section: "Failures and Placement", title: "Stored data can survive while file access stops",
      paragraphs: [
        "Availability means being able to access data now. Durability concerns retaining stored data. If a host loses its network route, remote file requests can stop progressing even when the service still has every byte.",
        "With an NFS hard mount, timed-out requests keep retrying until the server responds. Application I/O can wait during an outage. Switching to soft timeouts is not a harmless responsiveness fix: returned errors and interrupted operations can introduce data-integrity risks. Follow supported mount settings and design how the application handles unavailable storage.",
        "Check the actual failure boundary. EFS Regional stores data across multiple Availability Zones; EFS One Zone stores it within one zone and can lose data in a zone disaster. The generic file-storage interface does not imply either placement.",
        "Storage redundancy does not repair a broken client or network path, and it does not undo an authorized deletion or bad write. The application needs working clients, reachable service endpoints and a recovery plan as well as redundant storage.",
      ],
      remember: "Durable bytes and a working request path are separate requirements.",
      source: "https://docs.aws.amazon.com/efs/latest/ug/mounting-fs-nfs-mount-settings.html",
    },
    {
      section: "Backup and Recovery", title: "Keep history that the application can actually use",
      paragraphs: [
        "Redundancy preserves copies of the current state, including a mistaken overwrite. Recovery from that mistake needs an earlier backup. Set a backup schedule and retention period that leave usable history when damage is discovered.",
        "A live file backup is not automatically an atomic application snapshot. AWS warns that writes, renames, moves or deletes during an EFS backup can leave inconsistent results. Related files may reflect different stages of an application update.",
        "Use the application's supported backup procedure. Coordinate pending writes and pause modifying processes for the backup when required, or choose a period with no modifications. Pausing new work alone does not flush bytes still held in application memory.",
        "Restore a suitable recovery point to a controlled destination. Check files, permissions and application behavior, and measure the recovery time. Choose backup frequency and retention around how much work you can afford to lose and how long you can be down. A successful backup job alone does not prove a usable restore.",
      ],
      remember: "Test recovery of the application, not just completion of the backup job.",
      source: "https://docs.aws.amazon.com/efs/latest/ug/awsbackup.html",
    },
    {
      section: "Performance", title: "Count file operations as well as bytes",
      paragraphs: [
        "Capacity measures stored bytes. Throughput measures bytes transferred per second. IOPS counts input/output operations per second. Latency is the time one operation takes. Increasing capacity does not by itself promise faster access.",
        "Opening, looking up and closing tiny files adds metadata work and network round trips for little useful data. Metadata work manages names and file attributes rather than transferring the file's contents. Larger reads can spread that overhead over more bytes, so equal byte counts need not take equal time.",
        "Additional clients can help independent work. They do not remove a bottleneck where all updates wait for the same file's lock; more contenders may simply wait longer. This competition for a shared resource is contention.",
        "Measure a representative workload: operation sizes and mix, metadata activity, latency, aggregate throughput and lock waits. Check client, network and service limits before increasing provisioned performance or parallelism. Change the part that limits the workload rather than assuming more storage or more hosts will help.",
      ],
      remember: "A small amount of data can still require a large amount of file work.",
      source: "https://docs.aws.amazon.com/efs/latest/ug/performance-tips.html",
    },
    {
      section: "Workload Fit", title: "Choose the interface the software needs",
      paragraphs: [
        { label: "Shared file", text: "Fits several hosts that need existing pathname-based operations over files and directories through a supported filesystem interface." },
        { label: "Other roles", text: "Use block storage for a disk-like device, object storage for blobs retrieved by key, and a database for record queries and transactions. These can be layers in one design rather than competing replacements." },
        "A database may keep its own files on shared storage only when it supports the chosen filesystem's locking, durability and recovery behavior. Several database processes pointed at one directory do not automatically form a safe multi-writer database. Check the engine's requirements before choosing that layout.",
        "A managed file service can remove file-server administration. Application coordination, identities and permissions, network access, workload performance and tested recovery still need deliberate choices. Match those responsibilities to the workload before selecting the service.",
      ],
      remember: "A shared filesystem supplies file access; the application still owns its data rules.",
      source: "https://www.postgresql.org/docs/current/creating-cluster.html#CREATING-CLUSTER-FILESYSTEM",
    },
  ],
};
