export const apiGatewaysLesson = {
  title: "API Gateways",
  reviewed: "2026-11-02",
  slides: [
    {
      section: "Follow a Request", title: "One entrance for Notes and Authors",
      paragraphs: [
        "Our app has a Notes service and an Authors service. An API gateway is a client-facing intermediary that forwards API requests and applies shared entrance rules. A backend service is the application that handles the forwarded request.",
        "The client requests /notes through the gateway. The gateway routes it to Notes, which reads the database. The response travels back through the gateway to the client.",
        "Replicas are copies serving the same role. Choosing Notes rather than Authors is service routing; distributing traffic across two Notes replicas is load balancing. A gateway product can do both, so two separate boxes are not always needed.",
      ],
      remember: "Use the gateway for a shared API entrance; the selected service still performs the application work.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway",
    },
    {
      section: "Shared Rules", title: "Route the request and check its size",
      paragraphs: [
        "Routing selects a destination from request properties. For example, send GET /notes to Notes and GET /authors to Authors. An edge policy is a rule at the system entrance, such as limiting request-body size before forwarding to the application.",
        "For an HTTPS request, method/path routing and body inspection need decrypted HTTP. TLS termination means ending the client's encrypted connection at the gateway. Protect the gateway-to-service connection separately with TLS and validate the service's certificate.",
        "In this example, reject an oversized body before forwarding it. Apply a bounded size check, not unlimited buffering while waiting to learn the body's size. Sharing the rule avoids repeating its configuration in every service.",
        "Notes still validates note-specific rules, such as whether a note can be edited after it is locked. A general entrance rule cannot replace business decisions that depend on application data.",
      ],
      remember: "Centralize common checks while keeping note-specific decisions with Notes.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-offloading",
    },
    {
      section: "Identity and Access", title: "Alice is signed in. Can she read Bob's note?",
      paragraphs: [
        "Authentication checks who the caller is by validating credentials. Authorization decides what that caller may do. The gateway validates Alice's credentials; merely receiving a token or an identity header is not validation.",
        "Alice can send a header claiming to be Bob. Remove or replace client-supplied identity claims with the validated identity. Notes must accept that identity only through a protected path that authenticates the gateway, preventing a caller from impersonating it. Forwarded identity assertions must be verifiable by Notes.",
        "Block direct external access to Notes, or enforce equivalent identity and policy checks on that path. Otherwise callers can bypass the gateway. Encrypting a connection alone does not prove that its caller is the gateway.",
        "Notes checks Alice's permission for the particular note using its application data. Deny access to Bob's private note unless Alice has permission, even when gateway authentication succeeds.",
      ],
      remember: "Verified identity is input to the permission check, not permission to read every note.",
      source: "https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html",
    },
    {
      section: "Traffic Limits", title: "Two local counters are not one shared allowance",
      paragraphs: [
        "Throttling limits request rate. A burst is a short surge; a quota is an allowance over a stated period. Scope specifies which callers and gateway instances share a limit. A per-user limit groups requests by the validated user identity.",
        "Suppose each of two gateway replicas independently allows Alice 100 requests per minute. Sending traffic to both can admit 200. That does not enforce a promised combined allowance of 100.",
        "Best-effort throttling may permit bursts or exceed a target; it is not strict quota accounting. A strict shared allowance needs coordinated admission so replicas cannot spend the same allowance twice. Coordination adds latency or a dependency that may require refusing work when accounting is unavailable.",
        "On a 429 Too Many Requests response, respect any supplied retry delay; wait and bound retries instead of repeating immediately. Even a strict request-count limit cannot guarantee capacity: an expensive Notes query costs more than a small read, and a shared database can still overload.",
      ],
      remember: "Specify the scope and required precision before promising a limit.",
      source: "https://learn.microsoft.com/en-us/azure/api-management/rate-limit-by-key-policy",
    },
    {
      section: "Waiting and Failure", title: "A timeout ends the wait, not necessarily the work",
      paragraphs: [
        "A timeout limits how long a caller waits. An overall deadline is the latest useful response time. In-flight work means requests already underway.",
        "If the client has two seconds, the gateway's wait for Notes must fit inside that budget, leaving time for gateway processing and returning the response. Retry attempts and their delays spend the same remaining budget; each attempt does not get a fresh two seconds.",
        "Notes may commit a new note while its response is lost. A gateway timeout or error tells the client that no successful response arrived in time, not whether the write committed. The outcome is unknown to the client.",
        "Timing out does not by itself cancel in-flight work or undo a committed note. The service can continue after the gateway stops waiting. Retrying that creation blindly can create another note.",
      ],
      remember: "Budget waits across the whole path, and treat a lost write response as an uncertain outcome.",
      source: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
    },
    {
      section: "Retry Ownership", title: "One owner retries; Notes prevents duplicate effects",
      paragraphs: [
        "Retry amplification happens when layers multiply attempts. Three total client attempts, each causing three gateway attempts, can reach Notes nine times. Choose one retry owner. Here the client retries; the gateway forwards each attempt once. Bound attempts and delay them within the remaining deadline.",
        "An idempotency key is one stable identifier for a logical operation, reused on every attempt. Deduplication means recognizing repeats. Notes, which owns the creation effect, must enforce it; a gateway adding a key cannot make an arbitrary write safe.",
        "In our design, Notes replicas share a durable database record keyed by caller and operation ID. In one transaction, reserve that key uniquely, create the note and record the result; commit all or none. Concurrent repeats cannot reserve it twice. A completed repeat returns the recorded result without creating another note.",
        "Separate record and creation writes leave a crash gap. A gateway-only record does not coordinate the Notes transaction. A fresh key on every retry describes different operations and defeats duplicate recognition.",
      ],
      remember: "Retry policy controls attempts; atomic duplicate protection belongs with the effect.",
      source: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
    },
    {
      section: "Combining Responses", title: "An overview can survive missing display names",
      paragraphs: [
        "Aggregation combines several backend responses into one client response. For a Notes overview, the gateway asks Notes for required notes and Authors for optional display names. Fan-out means making those multiple backend calls.",
        "The client makes fewer calls, which can help on a slow network. Backend work remains, and the response now depends on multiple services. One client request does not mean one backend operation.",
        "Choose the response contract before failure: within a two-second overall budget, for example, stop waiting for optional names after 500 milliseconds and leave time to return the response. Return available notes with names explicitly marked unavailable, rather than claiming the data is complete.",
        "If required Notes data is unavailable by its allocated deadline, fail the overview instead. Do not invent notes or disguise required-data loss. Keep complex application workflows in a service rather than growing them inside gateway policies.",
      ],
      remember: "A partial response is useful only when its missing data and failure policy are explicit.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation",
    },
    {
      section: "Fit and Availability", title: "Add the gateway when the shared entrance earns its cost",
      paragraphs: [
        "One adequate Notes API can check identity, permissions and request limits itself. A separate gateway may be unnecessary. Shared routing and policies across several services can justify one, but add a network hop, configuration and operating responsibility.",
        "The gateway can become a common failure point. Headroom is spare capacity. Surviving a gateway failure requires a reachable alternate gateway and enough surviving gateway and backend capacity, not just another box in the diagram.",
        "Replicas can share a bad routing rule or a failed dependency. More gateways do not fix that shared failure, create capacity in a saturated Notes database or supply a missing per-note permission check.",
        "Test the reachable failover path and watch latency, rejections and backend errors. Decide from the workload and failure behavior whether the shared entrance is worth its cost.",
      ],
      remember: "A gateway organizes API access; its presence alone guarantees neither security nor availability.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-routing",
    },
  ],
};
