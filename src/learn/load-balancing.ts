export const loadBalancingLesson = {
  title: "Load Balancing",
  reviewed: "2026-11-02",
  slides: [
    {
      section: "Follow a Request", title: "One entrance, several API servers",
      paragraphs: [
        "Our Notes API has several server instances. A load balancer distributes incoming traffic among them; a backend is a server selected to do the application work.",
        "In this reverse-proxy example, the client contacts one service entry point. The balancer forwards the request to a selected backend. That server reads the note from the database and returns a response through the balancer to the client.",
        "Clients need not choose an instance themselves. Distribution can use spare server capacity and support redundant serving, but the proxy adds a network hop and another component to operate.",
        "One adequate server may be enough if the service does not need traffic distribution or redundant serving. A balancer is not automatically useful in front of it.",
      ],
      remember: "The backend performs the work; the balancer chooses where traffic goes.",
      source: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html",
    },
    {
      section: "Routing Unit", title: "A connection is not an HTTP request",
      paragraphs: [
        { label: "Layer 4, or L4", text: "Routes at the transport level. For TCP traffic, it typically chooses a backend for a connection using network information, not HTTP paths." },
        "Many note requests can reuse that connection. They can all reach the same backend; adding requests on that connection does not force new selections.",
        { label: "Layer 7, or L7", text: "Understands HTTP requests. It can route /notes and /exports to different backend groups, or select a backend for each request. Rules that keep a user on one backend can override independent selection." },
        "Path routing requires readable HTTP contents. TLS encrypts the connection; an HTTPS proxy normally ends, or terminates, that TLS connection to inspect requests. Encryption to the backend is a separate configuration choice.",
      ],
      remember: "Choose the routing unit and required HTTP visibility before choosing a balancing policy.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/load-balancing-overview",
    },
    {
      section: "Selection Policy", title: "Equal turns do not mean equal work",
      paragraphs: [
        { label: "Round robin", text: "Takes turns across eligible backends. It is a simple starting point for similar servers and similar work; a quick note read and a slow export still each count as one request." },
        { label: "Least connections", text: "Prefers the backend with fewer active connections. This can help when connection durations vary, but one connection may carry far more work than another." },
        { label: "Weights", text: "Bias the share of traffic. A server with twice the measured capacity might start with twice the weight. Configured weights are not a live measurement or a performance guarantee." },
        "For long, uneven work, consider least connections; for unequal server capacity, consider weights. Check actual latency and resource use before deciding: no policy is universally best.",
      ],
      remember: "Count requests or connections to select traffic, then measure the work those counts hide.",
      source: "https://nginx.org/en/docs/http/load_balancing.html",
    },
    {
      section: "Health and Readiness", title: "A green check is a sample, not a promise",
      paragraphs: [
        "A health check periodically probes a backend. Readiness means it can accept useful new work: a process can answer /health while the note handler cannot reach its required database.",
        "Use a check that reflects the capabilities needed to serve notes. Checks have limited coverage, intervals and failure thresholds; a backend can fail just after passing. Detection takes time.",
        "Once detected and removed from eligible backends, it stops receiving new selections. Requests already underway can still fail; removal does not complete, undo or safely replay them.",
        "Check the product's all-unhealthy policy too. Some balancers send traffic to unhealthy targets when every target fails its checks, rather than refusing all traffic.",
      ],
      remember: "Health-based routing reduces exposure to failure; it cannot guarantee every request succeeds.",
      source: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html",
    },
    {
      section: "Session State", title: "The next server cannot read this server's memory",
      paragraphs: [
        "Session state is information kept between a user's requests. If the Notes API keeps a user's session only in A's memory, B cannot read it. Losing A can lose the only copy.",
        { label: "Affinity, or stickiness", text: "Prefers the same backend for that user's requests. It can keep ordinary requests on A, but skew load and restrict placement. It does not copy the session or preserve it when A fails." },
        { label: "Shared session storage", text: "Lets either backend read the session. It adds access or coordination work and a shared dependency whose availability matters too." },
      ],
      remember: "Routing a user consistently and making their state available on another server are separate responsibilities.",
      source: "https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/web-farm?view=aspnetcore-10.0",
    },
    {
      section: "Planned Removal", title: "Drain before stopping a backend",
      paragraphs: [
        "During a deployment, draining stops new assignments to A while allowing in-flight work, meaning requests already underway, to finish within a deadline. Shut A down after completion or when that deadline expires.",
        "Stopping new L4 connections does not stop new HTTP requests on existing connections. A drain must also manage those connection lifetimes or stop accepting further requests. L7 request-aware draining must still track already accepted work.",
        "Give a running note export time to finish, but bound the wait. Forced termination at the deadline may interrupt unfinished requests. Their work is not automatically moved to B.",
      ],
      remember: "Remove new assignments, handle existing connections and requests, then stop. Draining cannot promise zero interrupted work.",
      source: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html",
    },
    {
      section: "Retries", title: "No response does not mean no saved note",
      paragraphs: [
        "A saves a new note, but its response is lost. The client cannot tell whether the write committed. A blind retry on B can create a second note.",
        { label: "Idempotency key", text: "A stable ID for one logical operation, reused on every attempt. Deduplication means recognizing a repeat. A new key per retry, or a key remembered only in A's memory, cannot reliably protect a retry on B." },
        "All backends use a shared durable database record of the key and result. In one transaction, insert a key that the database allows only once, create the note and record its result; commit all or none. A repeat returns the recorded result without creating another note. Separate check-then-write steps can race or leave a crash gap.",
        "Bound retry attempts and delay them: extra requests consume capacity and can deepen overload. Retry policy does not replace duplicate protection or guarantee success.",
      ],
      remember: "The application makes the effect safe to repeat; the balancer does not make an arbitrary write idempotent.",
      source: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
    },
    {
      section: "Capacity and Availability", title: "Keep the whole serving path usable",
      paragraphs: [
        "Balancing distributes existing capacity. More API servers can help when API processing is the bottleneck; they do not remove a saturated shared database bottleneck.",
        "Headroom is spare capacity. After one backend fails, the survivors need enough capacity for the remaining load. Otherwise redirecting traffic can overload them. Limit or reject excess work visibly instead of assuming redistribution solves it.",
        "A lone balancer is itself a possible failure point. If it fails, clients need a reachable alternate entry path, not just another disconnected balancer box. Use an available managed entry or redundant frontends with working failover, and test that path.",
        "Measure request latency, errors and backend and database resource use under representative traffic, including a failure. Redundant components alone do not guarantee an available service.",
      ],
      remember: "Choose balancing for distribution or redundant serving; verify both entry-path availability and surviving capacity.",
      source: "https://sre.google/sre-book/handling-overload/",
    },
  ],
};
