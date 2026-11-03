export const dnsLesson = {
  title: "DNS",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "Follow a Lookup", title: "The stub asks one recursive resolver",
      paragraphs: [
        "A Notes client needs an address for api.notes.example before it can connect. The stub resolver is the resolver the client asks. It sends the query to one recursive resolver and does not itself follow delegations to the authoritative name server.",
        "A recursive resolver returns an answer or an error. The authoritative name server answers from its zone data, the records it stores for that part of the namespace. On this first lookup nothing relevant is cached, so the recursive resolver obtains the answer from the authoritative name server.",
        "That resolver stores a copy. When a second client asks the same recursive resolver before the copy expires, the resolver answers from its cached copy and does not contact the authoritative name server again. A cached answer is stored data, not a live read of the zone.",
      ],
      remember: "The stub asks a recursive resolver; a stored copy can answer the next lookup.",
      source: "https://www.rfc-editor.org/rfc/rfc1034",
    },
    {
      section: "Before the Request", title: "The lookup ends before GET /notes",
      paragraphs: [
        "The DNS lookup and the HTTP request are different steps. The lookup returns resource records. The client then connects to an address from those records and sends GET /notes.",
        "A resource record is a name, a type, and data, such as an address. The DNS response does not proxy GET /notes, does not check whether the Notes API is healthy on this request, and does not store the HTTP response.",
        "A successful lookup only supplies addressing data. The connection can still be refused, the response can still be lost, or the API can still return an HTTP error.",
      ],
      remember: "Resolve the name first. The API request is a separate step and can still fail.",
      source: "https://www.rfc-editor.org/rfc/rfc1035",
    },
    {
      section: "Alias or Address", title: "A CNAME does not contain the address",
      paragraphs: [
        "An A record carries one IPv4 address, such as 192.0.2.10. An AAAA record carries one IPv6 address, such as 2001:db8::10. In this example api.notes.example is a CNAME, an alias, of origin.notes.example.",
        "The CNAME contains that canonical name. It does not contain an IP address, so the lookup cannot stop at the alias. The resolver continues the DNS lookup at origin.notes.example.",
        "The resolver follows the alias and can return the CNAME together with the address record it found. The Notes application does not follow the alias by sending an HTTP request. The client connects only after an address record has been obtained.",
      ],
      remember: "An alias names another name. Connect only after an address record is found.",
      source: "https://www.cloudflare.com/learning/dns/dns-records/dns-cname-record/",
    },
    {
      section: "Several Addresses", title: "Two addresses are not a health check",
      paragraphs: [
        "origin.notes.example has two A records, 192.0.2.10 and 192.0.2.20. They are a set of addresses for one name. The order of records in that set is not significant, and it need not be preserved.",
        "That order is not health-aware distribution of HTTP requests. This ordinary DNS answer does not check which address accepts the Notes API. If 192.0.2.20 accepts no connections, DNS was not required to omit it. The client can attempt that address and the connection can fail.",
        "Rotating or randomizing the addresses does not health-check the API and does not assign each HTTP request to a healthy server.",
      ],
      remember: "An address set lists addresses. It does not choose a healthy server for each request.",
      source: "https://www.rfc-editor.org/rfc/rfc1034",
    },
    {
      section: "Cached Copies", title: "Each resolver counts down its own copy",
      paragraphs: [
        "A TTL is the time one cache may reuse its copy of an answer before the source should be consulted again. It is a maximum for that copy: a cache may discard the copy sooner. An authoritative change does not rewrite other caches. Resolvers that stored the old address at different times do not drop it at the same instant.",
        "In this example the copies are kept until their own countdowns reach zero. Resolver A caches origin.notes.example = 192.0.2.10 at 12:00 with a TTL of 3600 seconds, so that copy reaches zero at 13:00. Resolver B caches the same old address at 12:05, so its copy reaches zero at 13:05. At 12:10 the authoritative record becomes 192.0.2.30, and nobody flushes the resolvers. At 12:20 resolver A may still return 192.0.2.10 because its TTL has not expired.",
        "At 13:02, resolver A's countdown has reached zero, so it should consult the source again. Resolver B may still reuse 192.0.2.10 until 13:05.",
        "If a resolver cannot get an authoritative refresh when the TTL expires, it is allowed to reuse the expired address. That reuse is not required of every resolver. It does not mean resolvers ignore a TTL while a refresh is possible.",
      ],
      remember: "A TTL limits one cached copy. It does not update every resolver at once.",
      source: "https://www.rfc-editor.org/rfc/rfc8767",
    },
    {
      section: "Lookup Failure", title: "No address is not a missing name",
      paragraphs: [
        "A timeout means no DNS answer arrived. SERVFAIL means a server reported that it could not process the query. Neither result proves that api.notes.example does not exist, and neither proves that the Notes API process is down. The client still has no address, so it cannot open the connection. A failed lookup can make the healthy API unreachable from that client.",
        "NXDOMAIN means the queried name does not exist. A resolver can cache that name error and keep returning it after the name is added, until the negative answer expires. The reuse limit is the negative-caching TTL carried with that name-error answer: the lesser of the zone SOA record's TTL and its MINIMUM field. It is not the TTL of an address record, because no address record was returned.",
        "A name that exists but has no record of the requested address type is a no-data answer, not NXDOMAIN. That negative answer can also be cached. SERVFAIL is not cached for that same negative-caching TTL. Caching a server failure is optional; if a resolver does cache it, the cache is separate, tied to that server, and must not last longer than five minutes.",
        "A message shown by a browser is not itself the DNS name-error response.",
      ],
      remember: "No address means this client cannot connect, even when the API process is healthy.",
      source: "https://www.rfc-editor.org/rfc/rfc2308",
    },
    {
      section: "Planned Cutover", title: "Lower the old lifetime before the move",
      paragraphs: [
        "origin.notes.example is 192.0.2.10 with a TTL of 86400 seconds, and resolvers have already cached that answer. Lowering the TTL does not rewrite countdowns already stored. Those caches can keep returning 192.0.2.10 until the TTL they stored ends.",
        "For a planned cutover, lower the TTL first while the published address is still 192.0.2.10. Wait at least 86400 seconds, so caches that stored the old answer under that lifetime can expire and observe the shorter TTL. Only then change the authoritative address to 192.0.2.30. Editing the authoritative record does not rewrite answers already stored in caches.",
        "Changing the address without waiting out the old TTL, or publishing the short TTL only at the moment of the address change, leaves holders of the old cached TTL on 192.0.2.10 until that cached lifetime ends.",
        "After the wait and the change, do not claim that every Notes client has stopped using 192.0.2.10. Some caches can still retain or reuse a stale answer. A client that wants 192.0.2.30 still depends on a DNS lookup to learn it, so DNS remains an extra dependency in front of the new address.",
      ],
      remember: "Shrink the cached lifetime, wait it out, then change the address, and still expect stragglers.",
      source: "https://www.rfc-editor.org/rfc/rfc1034",
    },
    {
      section: "Keep the Name", title: "A stable name is not a load balancer",
      paragraphs: [
        "Installed Notes clients should keep a stable hostname, api.notes.example. When the address must change, that same name can return a new address without shipping a new IP address to every installed client. Each cache may still serve the old address until its TTL allows a refresh. Hard-coding today's addresses does not provide that later change.",
        "Two address records, such as 192.0.2.10 and 192.0.2.20, are only a set of addresses. They do not health-check backends, and they do not distribute each HTTP request. Choosing a healthy backend for an HTTP request, or proxying that request, remains outside DNS.",
        "Keep the name so clients can follow a planned address change. Add a separate component when the design needs per-request selection of a healthy backend.",
      ],
      remember: "A stable name absorbs an address change. It does not check health or balance requests.",
      source: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy-simple.html",
    },
  ],
};
