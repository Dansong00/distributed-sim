export const apiGatewaysLesson = {
  title: "API Gateways",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "Follow a Request", title: "A shared entrance for multiple services",
      paragraphs: [
        "An API gateway is a client-facing intermediary that forwards API requests and applies shared entrance rules. A backend service is the application that handles the forwarded request.",
        "The request travels client → gateway → selected service. The service performs the application work; its response returns through the gateway to the client.",
        "Service routing chooses which application should receive a request. Load balancing distributes traffic across replicas: instances serving the same role. A gateway product can do both, so two separate boxes are not always needed.",
      ],
      remember: "Use the gateway for a shared API entrance; the selected service still performs the application work.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway",
    },
    {
      section: "Shared Rules", title: "Separate entrance policies from application rules",
      paragraphs: [
        "Routing selects a destination from request properties, such as the HTTP method and path. An edge policy is a rule at the system entrance, such as limiting request-body size before forwarding to the application.",
        "For HTTPS, method/path routing and body inspection need decrypted HTTP. TLS termination ends the client's encrypted connection at the gateway. Protect the gateway-to-service connection separately with TLS and validate the service's certificate.",
        "Reject oversized requests before forwarding them. Enforce a bounded size check rather than buffering an unlimited body first. Sharing this policy avoids repeating its configuration in every service.",
        "Application rules that depend on business data belong with the service. A gateway body-size limit cannot decide whether a particular record may be edited.",
      ],
      remember: "Centralize common checks; keep application-specific decisions with the service.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-offloading",
    },
    {
      section: "Identity and Access", title: "Authentication supplies identity, not blanket permission",
      paragraphs: [
        "Authentication checks who the caller is by validating credentials. Authorization decides what that caller may do. Receiving a token or identity header is not itself validation.",
        "Remove or replace client-supplied identity claims with the validated identity. A backend must accept that identity only through a protected path that authenticates the gateway; forwarded identity assertions must be verifiable by the backend.",
        "Block direct external access to the backend, or enforce equivalent identity and policy checks on that path. Otherwise callers can bypass the gateway. Encrypting a connection alone does not prove that its caller is the gateway.",
        "For example, authenticating Alice does not allow her to read Bob's private document. The service must check her permission for that resource against its application data.",
      ],
      remember: "Verified identity is input to the permission check, not permission to access every resource.",
      source: "https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html",
    },
    {
      section: "Traffic Limits", title: "Two local counters are not one shared allowance",
      paragraphs: [
        "Throttling limits request rate. A burst is a short surge; a quota is an allowance over a stated period. Scope specifies which callers and gateway instances share a limit. A per-user limit groups requests by the validated user identity.",
        "Suppose each of two gateway replicas independently allows one caller 100 requests per minute. Sending traffic to both can admit 200. That does not enforce a promised combined allowance of 100.",
        "Best-effort throttling may permit bursts or exceed a target; it is not strict quota accounting. A strict shared allowance needs coordinated admission so replicas cannot spend the same allowance twice. Coordination adds latency or a dependency that may require refusing work when accounting is unavailable.",
        "On a 429 Too Many Requests response, respect any supplied retry delay; wait and bound retries instead of repeating immediately. Even a strict request-count limit cannot guarantee capacity: an expensive query costs more than a small read, and a shared database can still overload.",
      ],
      remember: "Specify the scope and required precision before promising a limit.",
      source: "https://learn.microsoft.com/en-us/azure/api-management/rate-limit-by-key-policy",
    },
    {
      section: "Waiting and Failure", title: "A timeout ends the wait, not necessarily the work",
      paragraphs: [
        "A timeout limits how long a caller waits. An overall deadline is the latest useful response time. In-flight work means requests already underway.",
        "If the client has two seconds, the gateway's wait for a backend must fit inside that budget, leaving time for gateway processing and returning the response. Retry attempts and their delays spend the same remaining budget; each attempt does not get a fresh two seconds.",
        "A backend may commit a write while its response is lost. A gateway timeout or error tells the client that no successful response arrived in time, not whether the write committed. The outcome is unknown to the client.",
        "Timing out does not by itself cancel in-flight work or undo a committed write. The service can continue after the gateway stops waiting. Retrying blindly can repeat the effect.",
      ],
      remember: "Budget waits across the whole path, and treat a lost write response as an uncertain outcome.",
      source: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
    },
    {
      section: "Retry Ownership", title: "Choose a retry owner and protect the effect",
      paragraphs: [
        "Retry amplification happens when layers multiply attempts. Three total client attempts, each causing three gateway attempts, can reach the backend nine times. Choose one retry owner; other layers forward each attempt once. Bound attempts and delays within the remaining deadline.",
        "An idempotency key identifies one logical operation and is reused on every attempt. Deduplication recognizes repeats. The service that owns the effect must enforce it; adding a key at the gateway cannot make an arbitrary write safe.",
        "Service replicas can share a durable database record keyed by caller and operation ID. In one transaction, reserve that key uniquely, apply the effect and record its result; commit all or none. Concurrent repeats cannot reserve it twice. Completed repeats return the recorded result.",
        "Separate record and effect writes leave a crash gap. A gateway-only record does not coordinate the service transaction. A fresh key on every retry defeats duplicate recognition.",
      ],
      remember: "Retry policy controls attempts; atomic duplicate protection belongs with the effect.",
      source: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
    },
    {
      section: "Combining Responses", title: "Combining responses also combines dependencies",
      paragraphs: [
        "Aggregation combines several backend responses into one client response. Fan-out means making those multiple backend calls. The client makes fewer calls, but backend work remains and the response depends on more services.",
        "Define required and optional data before failures occur. For a catalog page, product details might be required while recommendations are optional. Missing optional recommendations need not make the product details unusable.",
        "Allocate waits within the overall deadline. With two seconds total, stop waiting for optional data after 500 milliseconds and leave time to return the response. Mark missing data explicitly rather than claiming completeness.",
        "If required data misses its allocated deadline, fail the response instead of inventing it or disguising its absence. Keep complex application workflows in a service rather than growing them inside gateway policies.",
      ],
      remember: "A partial response is useful only when its missing data and failure policy are explicit.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation",
    },
    {
      section: "Fit and Availability", title: "Add the gateway when the shared entrance earns its cost",
      paragraphs: [
        "A single API can enforce its own identity checks, permissions and request limits. Shared routing and policies across several services can justify a separate gateway, but add a network hop, configuration and operating responsibility.",
        "The gateway can become a common failure point. Headroom is spare capacity. Surviving a gateway failure requires a reachable alternate gateway and enough surviving gateway and backend capacity, not just another box in the diagram.",
        "Replicas can share a bad routing rule or failed dependency. More gateways do not fix that shared failure, create capacity in a saturated database or supply missing resource permission checks.",
        "Test the reachable failover path and watch latency, rejections and backend errors. Decide from the workload and failure behavior whether the shared entrance is worth its cost.",
      ],
      remember: "A gateway organizes API access; its presence alone guarantees neither security nor availability.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-routing",
    },
  ],
};
