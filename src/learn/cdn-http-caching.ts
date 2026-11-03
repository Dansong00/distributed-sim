export const cdnHttpCachingLesson = {
  title: "CDN and HTTP Caching",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "Response Caches", title: "A reusable response can stop the trip early",
      paragraphs: [
        "An HTTP cache stores response bodies and metadata, such as status and headers, for reuse. A browser private cache serves that user agent. A content delivery network (CDN) runs shared caches at edge servers near users. The origin is the server responsible for the resource.",
        "A hit reuses a suitable stored response; a miss lacks one usable for the request. With empty caches, the request goes browser → CDN → origin. The response returns origin → CDN → browser, with storage at each cache only if its policy permits.",
        "A browser hit avoids the network request. After a browser miss, a CDN hit avoids origin. HTTP caches hold responses, not replicated database records. Origin may consult a database, but a hit need not reach it.",
      ],
      remember: "Identify the cache layer before saying which work a hit avoids.",
      source: "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/",
    },
    {
      section: "Freshness", title: "Delivery does not restart the freshness clock",
      paragraphs: [
        "Cache-Control is a response header carrying caching rules called directives. A fresh response is young enough for reuse without validation under its policy. A stale response has reached its freshness limit; its body need not be deleted. Freshness is permission to reuse, not proof that origin content is unchanged.",
        "Consider a public response with Cache-Control: public, max-age=60, s-maxage=300. public explicitly permits shared caching subject to other rules. max-age sets the freshness lifetime in seconds. s-maxage overrides it only in shared caches; the browser still uses 60 seconds.",
        "Age estimates seconds since generation or successful validation at origin, including time spent through caches. If this response arrives with Age: 90, ignoring transit and clock differences, the browser is 30 seconds past its lifetime. The CDN has 300 − 90 = 210 seconds of freshness left. Receiving it does not start a new full lifetime.",
        "A cache may evict a response sooner to free space. Freshness sets reuse limits, not guaranteed retention. When validation is needed, a stored body can still save transfer.",
      ],
      remember: "Use the layer's lifetime and the response's existing age together.",
      source: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control",
    },
    {
      section: "Conditional Revalidation", title: "304 reuses a body; it still needs a round trip",
      paragraphs: [
        "A representation is the returned form of a resource, such as a page's HTML. Revalidation checks whether the stored representation remains usable. ETag is an opaque validator identifying that representation; clients preserve the tag rather than interpreting it.",
        "The CDN has a stale page with ETag: \"v1\" and cannot serve it stale under its policy. It sends a conditional GET to origin with If-None-Match: \"v1\", asking for the body only if the selected representation no longer matches.",
        "If unchanged, origin returns 304 Not Modified without a replacement body. The CDN updates applicable stored metadata, including freshness information, and uses its retained body to answer the browser's ordinary GET.",
        "If changed, origin returns 200 with the new body and its validator, for example ETag: \"v2\". The CDN replaces its stored representation if policy allows. An ETag does not push changes into other caches.",
        "304 saves retransmitting the body across the validation hop. Origin was still contacted and may run application logic or query a database to decide whether the representation changed.",
      ],
      remember: "Body bandwidth saved is different from an origin request avoided.",
      source: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag",
    },
    {
      section: "Storage Policy", title: "Storage policy and permission are separate checks",
      paragraphs: [
        "Cookies are browser-held state: Set-Cookie asks the browser to store it; Cookie sends it back. Authorization is a request header carrying credentials. Authentication establishes identity; authorization checks permission to access a resource.",
        "For a public page, unqualified no-cache allows storage but requires successful validation before every reuse. It does not mean never store. For a private response where browser storage is acceptable, private forbids shared-cache storage; it neither forbids browser storage nor requires validation on every use. Other directives still apply.",
        "For a sensitive response, no-store instructs HTTP caches not to store the response. It cannot erase previously delivered copies or replace permission checks. Choose the policy explicitly instead of relying on a header's misleading name.",
        "A shared response reused for the wrong user can leak private data. Cookie and Set-Cookie do not automatically create per-user cache entries or universally prevent caching. Authorization-bearing requests have special shared-cache restrictions, but response policy can permit reuse; authentication alone is no universal CDN bypass guarantee.",
        "Keep authorization at origin. For private routes, verify that explicit private/no-store policies and actual CDN rules prevent shared storage and reuse. Test different users; do not mark personalized responses public for a higher hit rate.",
      ],
      remember: "no-cache means validate; no-store means do not store; private excludes shared caches.",
      source: "https://www.rfc-editor.org/rfc/rfc9111.html",
    },
    {
      section: "Cache Keys", title: "Different content needs a different cache match",
      paragraphs: [
        "A cache key identifies which stored response can satisfy a request. HTTP caching uses the method and target URL, with selected request headers distinguishing variants: different returned forms of the same resource.",
        "A public export varies by ?format=pdf versus ?format=html, and Accept-Language: en versus fr. Keep the format query values distinct. A CDN configured to ignore them could return HTML for a PDF request; verify the actual key settings rather than assuming every CDN includes every query parameter.",
        "Vary: Accept-Language tells a cache that this request header's value must match for reuse. It separates language variants when supported and honored. CDN support and custom keys differ: verify that both format and language survive the actual matching rules, or bypass caching until they do.",
        "Irrelevant tracking parameters can create extra entries and fewer hits. Exclude them only after confirming they do not change the response. Vary does not change the URL, grant permission or override private/no-store. Correctly separated public variants are not permission to share private responses.",
      ],
      remember: "Keep distinctions that change content; remove only distinctions proven irrelevant.",
      source: "https://developers.cloudflare.com/cache/how-to/cache-keys/",
    },
    {
      section: "Updates and Removal", title: "A purge cannot recall a delivered page",
      paragraphs: [
        "A versioned asset URL changes when its bytes change: publish app.v2.js instead of overwriting app.v1.js. Long caching fits immutable assets, whose bytes stay unchanged at each URL. Update the referring page to request v2; an old cached page can still ask for v1.",
        "A mutable page that keeps its URL needs a chosen freshness/revalidation policy matching the tolerated update delay. A database edit does not rewrite stored HTTP responses. Short freshness or validation on each reuse makes a different trade-off from long-lived versioned assets.",
        "A CDN purge removes or invalidates targeted CDN entries according to the provider. Verify coverage of the relevant URLs, variants and CDN cache layers, plus propagation and completion behavior. Purge is an operation to check, not an assumption of simultaneous replacement everywhere.",
        "Purging CDN entries does not evict fresh browser copies or erase downloaded content. Unpublishing can stop future origin access and trigger purges, but already delivered public content cannot be instantly revoked. Choose cache lifetimes with that limit in mind before publishing.",
      ],
      remember: "Version public assets; bound mutable-page reuse; verify each cache layer separately.",
      source: "https://developers.cloudflare.com/cache/how-to/purge-cache/",
    },
    {
      section: "Bounded Stale Reuse", title: "An old copy buys time only within its allowance",
      paragraphs: [
        "When a public response tolerates delay, stale-while-revalidate permits bounded stale reuse while attempting background validation, hiding validation latency. stale-if-error permits bounded stale fallback on eligible errors, such as an origin failure. These are optional permissions, not freshness or availability promises.",
        "Consider Cache-Control: public, max-age=60, stale-while-revalidate=30, stale-if-error=120. Assume cache support, an eligible stored response, no conflicting policy and negligible transit time. The response is fresh for 60 seconds; stale windows start when freshness expires.",
        "At age 75 it is 15 seconds stale: the additional 30-second background-validation window permits reuse while refreshing, through age 90. At age 150 with an eligible error, it is 90 seconds stale: the error allowance lasts another 120 seconds after expiry, through age 180. At age 200 neither extension still permits stale reuse.",
        "A cold cache has no response to fall back to, and exhausted allowances can expose the failure. Verify provider support and policy; these directives do not override private/no-store. Private-data correctness or urgent removal may forbid stale reuse even when it improves public-help availability.",
      ],
      remember: "Count stale allowance after freshness expires, and require an eligible stored copy.",
      source: "https://www.rfc-editor.org/rfc/rfc5861.html",
    },
    {
      section: "Worth the Cost?", title: "Measure the work this cache actually avoids",
      paragraphs: [
        "Request hit ratio is cache hits divided by requests at a specified layer. Here a CDN hit means serving from its cache without contacting origin. Suppose 1,000 GETs reach one CDN after browser caching and 800 are hits. The ratio is 800 / 1,000 = 80%. If each other request makes exactly one origin request, with no extra layers or background requests, origin receives 200.",
        "Browser hits never entered that denominator. Request hit ratio is not byte hit ratio: response sizes differ. Revalidation, background refreshes, extra layers and application work need separate measurements in real traffic; 80% does not prove 80% less database work or transfer.",
        "Repeated public assets and popular published pages can reduce latency by answering nearby, and reduce origin requests and transfer. CDN requests and transfer can incur charges; key configuration, invalidation and monitoring add operational work.",
        "For a low-traffic application serving mostly private or rarely reused responses, omit shared caching if measured benefits do not justify those costs. Compare reuse, latency and total cost. Keep privacy rules intact rather than making private content shared to improve a metric.",
      ],
      remember: "A high hit ratio is useful evidence, not a requirement to add a CDN.",
      source: "https://www.cloudflare.com/learning/cdn/what-is-a-cache-hit-ratio/",
    },
  ],
};
