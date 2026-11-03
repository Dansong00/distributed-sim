export const dnsLesson = {
  title: "DNS",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "Before the Request", title: "Name discovery comes before the HTTP request",
      paragraphs: [
        "DNS, the Domain Name System, provides name discovery. A hostname names a network destination; an IP address is the network address used to reach it. A DNS record is typed data associated with a name.",
        "For a web connection, the client obtains address records, connects to a usable address and then sends its HTTP request. DNS resolves the hostname, not the URL path, and does not carry the later HTTP exchange.",
        "An address answer does not establish that the application is healthy. A usable cached address or an existing connection can avoid a fresh lookup. A cache temporarily reuses a stored answer.",
      ],
      remember: "Name discovery and serving the HTTP request are separate steps.",
      source: "https://www.cloudflare.com/learning/dns/what-is-dns/",
    },
    {
      section: "Who Answers?", title: "The resolver follows responsibility for the name",
      paragraphs: [
        "The stub resolver is the client's local lookup helper. It asks a recursive resolver to obtain an answer on its behalf. An authoritative server supplies records for a zone, a managed portion of DNS names.",
        "Delegation assigns responsibility for a child zone to its authoritative servers. A referral points the resolver toward them; it is not the final host address.",
        "With empty relevant caches, consider the illustrative name api.example.test. The recursive resolver asks root, follows a referral to .test, then a referral to the example.test authority for the final records. Root does not hold every host address; these reserved names describe a teaching hierarchy, not a public deployment.",
        "The recursive resolver returns the result to the stub. Cached answers can avoid authority visits, and cached delegations can let it start closer to the answer. The stub need not perform each visit itself.",
      ],
      remember: "The resolver finds the answer; authorities supply records for the zones they serve.",
      source: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/welcome-dns-service.html",
    },
    {
      section: "Record Types", title: "An alias still needs an address",
      paragraphs: [
        "IPv4 and IPv6 are two IP address families. An A record supplies an IPv4 address; an AAAA record supplies an IPv6 address. A client uses an address family it can reach.",
        "A CNAME record is a name alias. Resolving it follows the target name to obtain A or AAAA data, possibly already cached or returned with the alias. Otherwise another lookup is needed.",
        "The alias contains a DNS name, not an IP address, URL or HTTP path. Without usable target address data, it cannot supply an address to connect to.",
        "Alias and target records can be cached separately. The alias creates a dependency on the target's DNS data, even when both names have the same operator.",
      ],
      remember: "A and AAAA supply addresses. CNAME names another record owner to resolve.",
      source: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/ResourceRecordTypes.html",
    },
    {
      section: "Changing an Address", title: "A new TTL cannot rewrite an old cached answer",
      paragraphs: [
        "Now consider a direct address record for api.example.test instead of the alias. TTL, or time to live, limits ordinary cache reuse in seconds. Each cache ages the TTL it received; it is not a worldwide update timer.",
        "A resolver caches the old address at 10:00 with a 300-second TTL. At 10:01 we change the address and lower TTL to 30 seconds. Its existing entry can still be ordinarily usable until 10:05; the edit does not rewrite that entry.",
        "For a planned move, lower TTL first, allow the previous longer TTL to age out, then switch. Keep the old destination usable through the transition while monitoring traffic, errors and existing connections at both destinations. DNS edits do not migrate open connections.",
        "Shorter TTLs mean more refresh queries and more frequent dependence on working DNS. Independent caches and connection lifetimes prevent a simultaneous cutover. Some resolvers can even serve expired data when refreshing fails, so TTL is not a hard global recovery deadline.",
      ],
      remember: "Plan overlap and observe clients; a TTL edit is not a cache purge.",
      source: "https://www.rfc-editor.org/rfc/rfc8767.html",
    },
    {
      section: "Missing Data and Failures", title: "Not found is an answer that can be cached",
      paragraphs: [
        "Negative caching reuses an answer reporting absence. NXDOMAIN says the queried name does not exist. NODATA means the name exists but has no record of the requested type: no AAAA record does not imply no A record or no name.",
        "Suppose a resolver cached NXDOMAIN before we created api.example.test. Adding its A record does not notify that cache. The negative answer has its own cache lifetime; the new positive record's TTL does not clear it.",
        "SERVFAIL means resolution could not be completed, for example because the resolver could not obtain usable answers. It is not proof that the name does not exist. Resolution failures may also be cached to avoid repeatedly hammering failing DNS servers.",
        "Check the requested name, record type and returned status before changing records. A missing type, a cached absent name and a lookup failure call for different investigations.",
      ],
      remember: "Distinguish an answer about absence from a failure to obtain an answer.",
      source: "https://www.rfc-editor.org/rfc/rfc9520.html",
    },
    {
      section: "Steering and Failover", title: "Changing answers cannot move an open connection",
      paragraphs: [
        "DNS traffic steering selects destinations returned in answers. Failover changes the selected destination after failure. For east and west endpoints, a separate health check and policy, or an operator, must detect east's failure and change answers. Ordinary DNS records do not detect application health themselves.",
        "Returning east for half of lookups does not guarantee half of HTTP requests reach east. A shared recursive resolver can reuse one answer for many clients, and each client may send many requests using that address or connection.",
        "After east is removed from new answers, cached clients can still try it. Existing connections do not migrate to west just because DNS changed. DNS is not choosing a destination again for every HTTP request.",
        "West must be reachable, healthy and have enough spare capacity for redirected work. A health signal is a sample, not a promise that every request succeeds; DNS changes do not create capacity or guarantee instant recovery.",
      ],
      remember: "DNS steers future address discovery, subject to caches and client behavior.",
      source: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover-configuring.html",
    },
    {
      section: "Availability and Diagnosis", title: "Check discovery separately from service errors",
      paragraphs: [
        "During a DNS outage, a client with a usable cached address may still connect, and an open connection may keep working without a lookup. Fresh uncached lookups need a reachable recursive resolver, working delegation and authoritative servers that can answer.",
        "Reachable alternate resolvers and authoritative servers reduce individual server failures. They cannot fix a shared wrong record, broken delegation or a failed application. Several DNS servers with the same bad configuration can return the same wrong result.",
        "Start with the client's recursive resolver: inspect the queried name and type, its answer or error, and remaining TTL. Compare authoritative data and parent delegation when results are wrong or failing. An authoritative new address beside a cached old one suggests a cache-age question, not an automatic need for another edit.",
        "Once the expected address is obtained, inspect connection, HTTPS and application results separately. HTTP 500 means an HTTP service responded with an error; it is not by itself a DNS lookup failure. Successful DNS does not prove the application works.",
      ],
      remember: "Locate the failed step before changing DNS or the application.",
      source: "https://www.rfc-editor.org/rfc/rfc1034.html",
    },
    {
      section: "Trust Boundaries", title: "Validated DNS still needs verified HTTPS",
      paragraphs: [
        "DNSSEC adds signatures to DNS data. A validating resolver checks those signatures through a chain of trust: each trusted signing key vouches for the next link, starting at a configured trusted key. Successful validation establishes the signed data's origin and integrity, meaning it has not been altered without detection.",
        "That validates DNS data, not the application. DNSSEC does not encrypt the query, certify service health or guarantee availability. Unsigned data does not gain these signature checks merely because a resolver supports DNSSEC.",
        "HTTPS separately authenticates the endpoint through certificate validation and encrypts the HTTP exchange. The client must still verify the certificate for the hostname it requested, api.example.test, even if DNS followed an alias to edge.example.test.",
        "A valid DNSSEC answer does not remove HTTPS certificate checks. Nor does discovering a real server give the caller permission to read every note; the application's access rules still apply.",
      ],
      remember: "DNSSEC protects DNS data; HTTPS protects the connection to the requested service identity.",
      source: "https://www.rfc-editor.org/rfc/rfc4033.html",
    },
  ],
};
