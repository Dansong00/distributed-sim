export const objectStorageLesson = {
  title: "Object Storage",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "Name the Attachment", title: "The slashes are part of one key",
      paragraphs: [
        "For the Notes attachment, notes/42/export.pdf is one key in the bucket.",
        "In an S3 general-purpose bucket the namespace is flat. The slash characters do not create directories. The console can present a prefix and a delimiter as a folder. That presentation is not an atomic filesystem rename of a parent directory.",
      ],
      remember: "A key names one object. A prefix is not a directory the store can rename in one step.",
      source: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html",
    },
    {
      section: "Store, Then Point", title: "The PDF and the note row are different writes",
      paragraphs: [
        "A bucket is a container. An object is opaque bytes plus metadata. A key is that object's name and identifies it inside the bucket. On a successful upload the Notes API writes the PDF bytes as one complete object at that key. It records the key on the note only after it accepts that write as successful. A later download reads the key from the note and requests that object. The database stores the note record and the key. The object store stores the object bytes and metadata. The download retrieves that object. It does not query note fields.",
        "The object write and the database commit are separate operations. Either can succeed while the other fails. The object store does not commit them together. S3 applies each update to one key. It cannot atomically update this key together with another key.",
        "After a successful write of a new object, or an overwrite or delete of an existing object, any subsequent read immediately receives the latest version. A list after that write reflects the change. Amazon S3 pioneered the service with eventual consistency and now delivers strong read-after-write and list consistency. Amazon S3's consistency overview says this strong read-after-write behavior replaced S3's earlier eventual consistency. It is not a promise of every object store.",
      ],
      remember: "Confirm the object, then store the key. On current S3, a successful write is what a later read of that key returns.",
      source: "https://aws.amazon.com/s3/consistency/",
    },
    {
      section: "Replace the Whole Object", title: "A new upload does not patch the old PDF",
      paragraphs: [
        "On Google Cloud Storage an object is opaque data plus metadata in a bucket. In a flat namespace there are no directories. A name such as notes/42/export.pdf is one object name. A simulated-folder rename copies and deletes each object and can stop halfway. A delimiter listing mimics folders. It does not create them.",
        "The upload writes a complete object for that key. It does not patch bytes inside the stored object the way a disk write does. A GCS object is immutable for its lifetime. Until the replacement upload completes, readers receive the old object. After it completes, readers receive the new object. An interrupted upload does not leave partial object data visible.",
        "Do not treat S3's timestamp rule as a GCS mechanism. GCS uses preconditions, described with the lost-response rules, when a replacement must match an expected generation.",
      ],
      remember: "Replacement stores a whole new object. Readers see the old one until that upload completes.",
      source: "https://cloud.google.com/storage/docs/objects",
    },
    {
      section: "Read and List", title: "Strong consistency is not a promise that the read succeeds",
      paragraphs: [
        "Google Cloud Storage documents that, after a success response, the object is immediately available to read and to list. That read-after-write does not return a stale object or a false 404, except that the same page says a publicly cached object can still be served stale. The Notes attachment is not that public HTTP-cache case. If the first region is unavailable before cross-region replication, the read can still return a retryable 500. Strong consistency does not mean the read cannot fail. GCS confirms a write as successful only after the data has been redundantly stored.",
        "After a versioning change, GCS says to wait at least 30 seconds before deleting or replacing objects, because that bucket configuration change is not immediate. On GCS, removing a user's access is reflected immediately in the bucket metadata, but that user may still have access for a short time, typically about a minute and sometimes longer. That lag is not instant revocation, and it is not a rule of every object store. Google Cloud Storage defines availability as the ability to access data when requested and durability as long-term protection so stored data remains intact.",
      ],
      remember: "These services can show a successful write on the next read. A paged list is still not one frozen bucket, and a read can still fail.",
      source: "https://cloud.google.com/storage/docs/consistency",
    },
    {
      section: "Lost Response", title: "No answer does not mean no object",
      paragraphs: [
        "A timeout or lost response does not prove the object is absent. The write may have completed after the client stopped waiting, just as a committed database write can remain stored when its caller receives no response. A later unconditional write that succeeds stores this request's complete object at the key and can replace another writer's PDF. Without If-None-Match, a PUT of an existing key in an unversioned or version-suspended S3 bucket overwrites the object.",
        "Create-if-absent preconditions are product features, not a universal object-store API. On S3, If-None-Match: * returns 200 when no current object has that key and 412 when one does. With S3 versioning, If-None-Match: * can still succeed when the current version is a delete marker. That does not mean this upload's bytes are already the live object.",
        "A received 412 proves the precondition failed. It does not prove the stored bytes are this PDF. A lost response to the conditional write is still ambiguous. A received success response and a received precondition failure are evidence. The absence of a response is not. On a store that documents read-after-write, a later read after the timeout reports only that read's result. Finding the key shows that some complete object is present, not that the bytes are this PDF. A miss is evidence of absence only under that store's documented consistency. On GCS, ifGenerationMatch=0 proceeds only when no live object has that name and returns 412 when a live object exists. It can still proceed when only noncurrent versions exist.",
      ],
      remember: "Treat a missing response as unknown. An unconditional retry can replace another writer's object.",
      source: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html",
    },
    {
      section: "Durability", title: "Eleven nines is not this HTTP response",
      paragraphs: [
        "Amazon S3 standard storage is designed for 99.999999999 percent durability and 99.99 percent availability of objects over a given year. Durability and availability are not the same yearly figure.",
        "S3 considers an upload successful only after it has checked integrity and stored the data redundantly across multiple devices. Those checks describe a completed write, not the chance that the caller's HTTP response arrived. The durability design does not mean this HTTP request succeeded. Renaming an S3 prefix renames each object whose key contains it. It is not one filesystem rename. An S3 update of a single key is atomic: a concurrent read returns the previous complete object or the new complete object, never a mixture of the two. When two unconditional S3 writes to the same key overlap, S3 uses last-writer-wins by timestamp. Acknowledgment order does not identify the winner. A read after both writes are acknowledged shows which object remains. That rule is specific to S3. S3 buckets and objects are private by default, and access is granted explicitly through mechanisms such as IAM and bucket policies.",
        "S3 One Zone data may be lost if that Availability Zone is lost, even when the class quotes an 11-nines design against equipment failure. An 11-nines design does not mean a One Zone bucket survives loss of its single zone.",
        "Durability does not preserve overwritten or deleted bytes. S3's durability system does not protect against deletes, and an overwrite without versioning replaces the current object. Versioning, replication, and S3 Object Lock are optional controls beyond the durability the store already applies. S3 versioning preserves older versions once it is enabled. After versioning is first enabled, S3 recommends waiting 15 minutes before PUT or DELETE requests. A GCS zonal bucket may quote an 11-nines design against equipment failure and still lose data if its zone fails.",
      ],
      remember: "Durability describes bytes that were stored. It does not prove this response arrived or keep a PDF you overwrote.",
      source: "https://aws.amazon.com/s3/faqs/",
    },
    {
      section: "Who May Read It", title: "The store checks its credential, not the note owner",
      paragraphs: [
        "The object store authorizes the credentials on the request against its own policies. It does not look up the Notes user or enforce that user's permission on note 42. A prefix or object rule limits only the credential it names, and only when an operator wrote that mapping.",
        "If the Notes API uses a credential that can read every attachment and does not check the note record first, the store can return another note's object. The per-note decision is the application's responsibility.",
        "GCS object listing requires the storage.objects.list permission for the authenticated caller. One S3 list response contains at most 1,000 keys, so listing a bucket can take further requests. S3 does not define that multi-page walk as one frozen snapshot. On GCS, an object created before the next page is omitted from later pages when its name is in the namespace already listed. A listing is not one atomic snapshot of the bucket.",
      ],
      remember: "Check the note in the application. Listing and a 412 do not decide who owns the note.",
      source: "https://cloud.google.com/storage/docs/json_api/v1/objects/list",
    },
    {
      section: "Where It Belongs", title: "Bytes in the bucket, the note in the database",
      paragraphs: [
        "The PDF bytes belong in the object store because they are one opaque object addressed by key and replaced as a whole. The note fields and the permission decision stay in the database. The bucket is a poor fit for editing bytes inside the PDF, querying note fields, or replacing the Notes permission check.",
        "With Object Versioning and soft delete both disabled, a GCS replacement permanently deletes the old live version. With versioning enabled, a replace keeps the old live object as a noncurrent version. Soft delete can retain a replaced live object even when versioning is disabled. Designed durability does not provide that retention. Without versioning, the previous bytes are not the current object.",
        "The API confirms that the object write completed, resolving a lost response before treating the object as stored, and then commits the key on the note. If the database commit fails, the object can remain with no note pointing at it. If the key is committed first, a reader can be directed to a key the store does not have. A bucket listing is not a transaction that repairs either outcome, and it is not one atomic snapshot.",
      ],
      remember: "Confirm the object, then commit the key. Older bytes remain only when a retention feature keeps them.",
      source: "https://cloud.google.com/storage/docs/object-versioning",
    },
  ],
};
