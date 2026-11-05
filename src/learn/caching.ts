export const cachingLesson = {
  title: "Caching Fundamentals",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "Why Cache?", title: "Reuse a result instead of repeating the work",
      paragraphs: [
        "A cache keeps a reusable copy of a result. A hit can reduce response time and avoid work in the system that supplied the result.",
        "Creating the copy still costs work: fetch or compute the result, then write it to the cache. Storage, lookups and keeping copies current all have costs.",
        "For the database-backed cache in this stack, the database is authoritative: it owns the durable record. Losing a cache entry must not lose that record.",
      ],
      remember: "First identify repeated work that is worth avoiding. A cache adds another copy to manage.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching",
    },
    {
      section: "Follow a Read", title: "The same request can take two paths",
      paragraphs: [
        {"label": "Cache hit", "text": "The application finds a usable entry under the requested key and returns the stored result."},
        {"label": "Cache miss", "text": "No usable entry exists. The application reads the database, stores a copy in the cache and returns the result."},
        "A hit can still return outdated data. Presence in a cache does not prove that the value matches its source.",
      ],
      remember: "A hit avoids this database lookup. A miss still needs the database.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside",
    },
    {
      section: "Cache-Aside", title: "The application manages the cached copy",
      paragraphs: [
        {"label": "Cache-aside", "text": "The API checks and fills the cache explicitly. The cache does not fetch the result from the database on its own."},
        {"label": "Cache key", "text": "Identifies the result to reuse. product:42 works for shared product details; prices in different currencies need distinct keys, such as product:42:USD."},
        "Include the inputs that change the answer. Reusing one person's private result for another person is a data leak.",
      ],
      remember: "Define what the key identifies, who fills it, and where the authoritative data lives.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching",
    },
    {
      section: "Data Changes", title: "The price changed. What does the next reader see?",
      paragraphs: [
        "A seller changes the price from $20 to $25. The cached $20 is now stale.",
        {"label": "Invalidation", "text": "Remove the cached entry after saving the new price in the database. A later miss reloads it."},
        "Saving the price and removing the copy are separate steps. A reader can fetch $20 before the update, pause, then refill $20 after removal. The next cache hit still returns $20. Removal can also fail.",
      ],
      remember: "Invalidation alone does not guarantee freshness. To avoid charging an old price at checkout, validate the price against the authoritative data as part of accepting the order.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside",
    },
    {
      section: "Expiration and Eviction", title: "An entry can disappear for different reasons",
      paragraphs: [
        {"label": "Time to live, or TTL", "text": "Sets how long an entry may remain before it expires. A 60-second TTL does not refresh the data every minute; a later miss must load it again."},
        {"label": "Eviction", "text": "Removes entries to make room. A least-recently-used policy favors removing entries that have not been read recently."},
        "An entry can be evicted before its TTL ends. Some configurations reject new entries when full instead of evicting existing ones.",
      ],
      remember: "TTL limits an entry's lifetime, not the age of the source data used to fill it.",
      source: "https://redis.io/docs/latest/develop/reference/eviction/",
    },
    {
      section: "Local Versus Shared", title: "Local copies can disagree",
      paragraphs: [
        {"label": "Local cache", "text": "Lives inside each API process. Reads avoid a network call, but each process fills and updates its own copy. Their copies can reflect different versions of the same data."},
        {"label": "Shared cache", "text": "Several API servers use a separate cache service, such as Redis or Memcached. They can reuse entries, but each lookup adds a network call and the service needs operating."},
        "Restarting one API process discards its local cache; other processes keep their copies. If the shared cache is unreachable, every API server using it loses access to those cached entries.",
      ],
      remember: "Sharing reduces separate copies. It does not automatically keep the cache current with the database.",
      source: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
    },
    {
      section: "Failure Under Load", title: "Simultaneous misses can flood the database",
      paragraphs: [
        {"label": "Cache stampede", "text": "Many requests miss the same key together and repeat its database lookup. Coalescing requests lets concurrent readers share one in-progress lookup."},
        "A cache outage can turn most reads into database traffic. Limit fallback work to what the database can handle; reject excess requests or serve older data only where the application permits stale results.",
        "Test with an empty or unavailable cache. A warm cache can hide insufficient database capacity.",
      ],
      remember: "Falling back to the database is a load decision, not a free recovery path.",
      source: "https://aws.amazon.com/builders-library/caching-challenges-and-strategies/",
    },
    {
      section: "Make the Decision", title: "Explain what you would cache and why",
      paragraphs: [
        "Choose results that are expensive enough to obtain, frequently reused and able to tolerate a defined amount of staleness. Keep freshness-critical decisions tied to authoritative data.",
        {"label": "Measure", "text": "Compare response time and database load before and after caching. Track hit ratio, the fraction of lookups served from the cache, and the cost of misses."},
        "If requests rarely reuse results, or freshness is too hard to maintain, the cache may cost more than it saves.",
      ],
      remember: "Name the cached result, its key, acceptable staleness, update policy, and failure behavior.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching",
    },
  ],
};
