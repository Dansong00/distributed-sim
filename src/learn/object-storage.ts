export const objectStorageLesson = {
  title: "Object Storage",
  reviewed: "2026-11-05",
  slides: [
    {
      section: "The Object Model", title: "Address bytes by a bucket and key",
      paragraphs: [
        { label: "Bucket", text: "A container for objects. Each object contains bytes and metadata; its key identifies it within that bucket. The service can store the bytes without understanding the document, image or other format inside them." },
        { label: "Object metadata", text: "Describes the object, such as its content type. Application fields, relationships and ownership records are a separate data model. Attaching metadata does not create a relational database." },
        "In a flat namespace, exports/2026/report.pdf is one key. Its slashes are characters in the name. Console folders group keys by a shared beginning, called a prefix; they are not filesystem directories.",
        "Changing that prefix requires changing the affected object names, commonly through copies and deletes. It is not one atomic directory rename. This describes S3 general-purpose buckets and GCS flat namespaces; check any distinct namespace features before assuming the same behavior.",
      ],
      remember: "The bucket and key locate an object; the application gives its bytes meaning.",
      source: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html",
    },
    {
      section: "Objects and Application Records", title: "Two writes need application coordination",
      paragraphs: [
        "An application uploads bytes under a bucket and key. The object store keeps those bytes and object metadata. The application database keeps its own fields and an object reference. To retrieve the bytes later, the application reads that reference and requests the object by key.",
        "The object upload and database commit are separate operations. The object store does not commit them together. Reading an object also does not query the application's database fields.",
        "Confirm the intended object before making a reference available as ready to readers. A pending database record can exist earlier, provided readers cannot mistake it for a completed upload. If the upload result is uncertain, keep it unresolved until the application verifies the intended object.",
        "If the upload succeeds but the database commit fails, an unreferenced object can remain. Publishing a ready reference first can direct readers to missing bytes. The application needs recovery, such as retrying reference publication or cleaning up an object it has established is no longer needed. Listing objects does not turn these writes into a transaction.",
      ],
      remember: "Publishing a reference is a separate decision from storing the bytes.",
      source: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
    },
    {
      section: "Replacement", title: "Upload a complete replacement",
      paragraphs: [
        "In the standard whole-object upload model, changing a few bytes means supplying a complete replacement at the same key. This is different from changing a small range on a disk-like volume. Check the chosen service's operations before assuming another write interface is available.",
        "S3 documents atomic updates to one key: a concurrent read sees the complete old or new object, never a mixture. GCS likewise serves the old object until replacement completes, then the new one. The completed replacement becomes current; a read that overlapped it may have seen the previous object.",
        "Atomic replacement does not prevent another writer from replacing the same key. Nor does it keep the previous bytes for recovery. With versioning and other retention protections disabled, do not expect to retrieve the old object after replacement.",
        "Versioning can keep older versions separately from the current object. Retention means keeping data for later use or recovery; it requires an appropriate configured feature. These are product-specific guarantees, not promises made by the object-storage label alone.",
      ],
      remember: "Complete old or new bytes is one guarantee; retaining both is another.",
      source: "https://cloud.google.com/storage/docs/objects",
    },
    {
      section: "Reads and Listings", title: "Finding one key differs from searching records",
      paragraphs: [
        "An exact-key request retrieves one object. A prefix listing enumerates names with a shared beginning. It does not filter arbitrary fields inside those objects, such as a customer's approval status. Use application records or a suitable index for that query; listing and inspecting many objects adds requests, transferred data and latency as the collection grows.",
        "Current S3 and GCS document strong read-after-write and listing consistency. With no intervening change, a successful upload is reflected in subsequent reads and listings. These are provider guarantees, not a universal rule for object stores. A separate HTTP cache may still serve an older copy.",
        "Consistency describes which state an operation observes; the request can still fail. A fresh result is not a guarantee of availability.",
        "Listings can require multiple pages. Separate pages are not promised to form one frozen snapshot while objects change. Neither a strongly consistent listing nor a single-key update creates a transaction across several keys or the application database.",
        "When writes to one key overlap, response arrival order alone does not identify the final object. Observe the stored state under the provider's documented rules rather than assuming the last response wins.",
      ],
      remember: "Check the access path and the consistency boundary separately.",
      source: "https://cloud.google.com/storage/docs/consistency",
    },
    {
      section: "Uncertain Uploads", title: "A timeout leaves the outcome unknown",
      paragraphs: [
        "An upload can finish even when its response never reaches the caller. A timeout does not prove that nothing was stored. An unconditional retry can replace a newer object written by someone else at the same key.",
        "Before publishing the intended upload as ready, establish that its expected object is stored. Use an acknowledged result or verify the expected identity and content under the store's documented semantics. Finding the key proves only that some object exists. A later read describes the state it observes, not necessarily which earlier request produced it; another write can intervene.",
        { label: "Conditional write", text: "Performs the write only if a condition holds as part of that operation. Where supported, create-if-absent protects an existing live object from replacement. An expected-version condition allows replacement only of the version the caller intended." },
        "S3 and GCS provide conditional operations, with different APIs and details. A rejected condition does not prove your bytes are stored. A lost response to a conditional upload is still uncertain. Use the documented protection and recovery path; there is no universal safe retry implied by the word 'upload'.",
      ],
      remember: "Verify the intended object, not just the existence of its key.",
      source: "https://cloud.google.com/storage/docs/request-preconditions",
    },
    {
      section: "Failure and Recovery", title: "Durability is different from availability and retention",
      paragraphs: [
        { label: "Durability", text: "Concerns keeping stored data intact over time. Redundant storage protects against hardware failures. S3 and GCS document storing data redundantly before confirming successful writes, but that completed server-side write does not ensure its response reaches the caller." },
        { label: "Availability", text: "Concerns being able to access data when requested. A highly durable object can still be temporarily unreachable. Neither a durability target nor an availability target proves that one particular upload response arrived." },
        "Check the storage class and placement. Multiple devices in one zone do not necessarily protect against losing that whole zone. A high durability figure does not establish protection against every failure.",
        "Redundancy also does not undo an intentional overwrite or delete. Versioning can retain earlier versions; other retention and recovery features may preserve removed bytes. Check which protections are enabled, whether configuration changes have taken effect, and whether the needed data is still retained. Recovery is not automatic or permanent just because the store is durable.",
      ],
      remember: "Choose protection for the failures and deletions you need to recover from.",
      source: "https://docs.cloud.google.com/storage/docs/availability-durability",
    },
    {
      section: "Access Control", title: "Storage credentials and user permissions are separate checks",
      paragraphs: [
        "The object store authorizes the credentials presented on a request against its policies. It does not automatically read your application's ownership records. A private bucket can still return another user's object when the API uses a broad credential and skips the application's permission check.",
        "Before retrieving bytes or granting download access, the application must verify that the requesting user may access that resource. A hard-to-guess key is still an identifier, not a permission check.",
        "Give credentials only the operations and resource scope they need. Keep broad storage credentials out of untrusted clients: those clients could otherwise use the credential directly and bypass application restrictions within its allowed scope.",
        "Do not assume a policy change revokes access immediately. GCS documents that granting and revoking access can take time to propagate. An updated policy display is not proof that every request already uses the new policy; check the provider's actual behavior.",
      ],
      remember: "A storage policy protects its resources; the application must enforce its users' access.",
      source: "https://cloud.google.com/storage/docs/access-control/iam",
    },
    {
      section: "Choosing the Interface", title: "Match storage and delivery to the workload",
      paragraphs: [
        { label: "Object storage", text: "Fits media, exports and other opaque bytes fetched by key and created or replaced as complete objects. Small objects are allowed too; there is no strict minimum size implied by this model. Whole-object replacement and request overhead make it a poor default for frequent small in-place edits." },
        { label: "Database", text: "Fits application records, field queries, relationships and transactions. A bucket does not replace those capabilities or the application's permission checks." },
        { label: "Block storage", text: "Provides disk-like blocks on an attached volume. A database engine can use it for files that need small-range reads and writes." },
        { label: "Shared file storage", text: "Provides a filesystem interface with directories and file operations for multiple machines. That differs from making bucket-and-key requests." },
        { label: "CDN", text: "Caches and delivers copies closer to users, reducing origin traffic and delivery latency. Object storage can hold the origin object. The CDN does not replace the authoritative durable copy or the application database." },
      ],
      remember: "Choose the interface for the operations you need, then verify its guarantees.",
      source: "https://aws.amazon.com/compare/the-difference-between-block-file-object-storage/",
    },
  ],
};
