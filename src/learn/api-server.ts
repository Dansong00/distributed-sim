export const apiServerLesson = {
  title: "API Server",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "What Is It?", title: "The part of your system that handles API requests",
      paragraphs: [
        "An API defines how software requests operations and interprets results. An API server is the application code that implements those operations.",
        "The server checks requests, applies application rules and coordinates work. Clients present or consume the results; a database manages stored data.",
        "An API operation may use a database, call another service or calculate a result without stored data. The API server is not another name for the database.",
      ],
      remember: "The API server connects a request to the work your application needs to do.",
      source: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Introduction",
    },
    {
      section: "Core Concept", title: "Follow a request from start to finish",
      paragraphs: [
        "Routing selects the handler for the requested operation. Input validation checks the request's shape and acceptable values before work that depends on them.",
        "Authentication establishes identity by checking credentials. Authorization checks what that caller may do to the requested resource. A known identity does not imply permission.",
        "The handler performs allowed application work, uses its dependencies as needed and returns a result or error. Invalid input and denied permission must prevent the protected side effects.",
        "Middleware handles shared tasks around a request. Splitting checks between middleware and handler code does not remove the requirement to perform them before allowing the action.",
      ],
      remember: "Identifying a user and checking what they can do are different steps.",
      source: "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html",
    },
    {
      section: "Variants", title: "Finish the work now, or accept it for later",
      paragraphs: [
        "Immediate processing finishes the required work before returning the operation's result. The caller receives an outcome in the same exchange.",
        "Deferred processing arranges later work and returns acceptance first. A queue holds pending work; a worker processes it separately from the original request.",
        "Give the caller a job identity and a status lookup or notification for completion. Track pending, successful and failed states. Accepted work can still fail, so an acceptance response is not a finished result.",
      ],
      remember: "An accepted request does not mean the work is complete.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply",
    },
    {
      section: "Trade-offs", title: "A quick response can mean more coordination",
      paragraphs: [
        "Immediate processing gives the caller a result directly, but long work consumes its waiting budget and may exceed a timeout.",
        "Deferral shortens the wait for acceptance and separates execution from that request. It does not automatically reduce the total work or completion time. The system must operate the queue and workers and retain visible status, results and failures.",
        "Retries can recover a temporary failure, but a lost response or acknowledgement may hide an effect that already occurred. Idempotent handling means repeating the operation does not repeat its effect; deduplication recognizes a repeated operation so it can avoid applying the effect again.",
      ],
      remember: "Use background work when the task needs it. It adds steps for both the system and the client.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply",
    },
    {
      section: "Interview Tip", title: "Choose the response promise before the execution path",
      paragraphs: [
        "If the caller needs a completed result before proceeding, finish the necessary work before returning success. If later completion is acceptable, define acceptance, progress and terminal outcomes before moving work into the background.",
        "Explain the input, required checks, application work, dependencies and response. Include how invalid input, denied access and an unavailable dependency become visible to the caller.",
        "Use deferred work when its waiting and workload benefits justify the extra queue, worker, status and duplicate-processing coordination.",
      ],
      remember: "An API boundary is a promise about allowed work and observable outcomes.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/patterns/asynchronous-request-reply",
    },
  ],
};
