export const clientServerLesson = {
  title: "Client / Server Model",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "What Is It?", title: "The client asks. The server responds.",
      paragraphs: [
        "A client is software that initiates a request. A server handles the request and returns a response. These are roles in an interaction, not types of computer.",
        "Browsers, mobile apps and other services can all be clients. The two roles may run on the same machine or communicate across a network.",
        "One program can play both roles: a server receiving a request becomes a client when it calls another service.",
      ],
      remember: "Client and server describe roles. When a server calls another service, it acts as a client.",
      source: "https://www.rfc-editor.org/rfc/rfc9110.html#section-3.3",
    },
    {
      section: "Core Concept", title: "Both sides follow the same rules.",
      paragraphs: [
        "A protocol defines the structure and interaction rules that let independently written programs exchange messages. An API defines the operations software exposes and how callers use their results.",
        "In HTTP, the request method expresses an operation, the URL identifies its target, headers carry metadata and an optional body carries content. The response has a status, headers and optional content.",
        "Agreeing on HTTP syntax is not enough: applications also need shared meanings for payload fields and success or error responses. Receiving a response does not necessarily mean the requested operation succeeded.",
        "The server must check access before performing protected work. Hiding an action in a client interface does not prevent a caller from sending the request directly.",
      ],
      remember: "The server must check what each user can access. A hidden button does not prevent someone from sending a request.",
      source: "https://www.rfc-editor.org/rfc/rfc9110.html#section-1.3",
    },
    {
      section: "Variants", title: "Where does the server keep session data?",
      paragraphs: [
        "Session state is context retained across related requests, such as sign-in status.",
        "Stateless request handling does not depend on an earlier request in that server's local memory. Necessary context arrives in the request or is retrieved from shared storage, so another equivalently configured server can handle it.",
        "A stateful handler keeps context between requests. If the only copy is in Server A's memory, later requests depend on A. Changing or losing A can lose access to that session.",
        "Moving state to shared storage helps replace handlers but leaves a storage dependency. Stateless does not mean no persistent data, authentication or state anywhere in the system.",
      ],
      remember: "Stateless does not mean no stored data. Stateless servers can use a shared database.",
      source: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/auto-scaling",
    },
    {
      section: "Trade-offs", title: "What do you gain, and what do you give up?",
      paragraphs: [
        "Shared server data and rules let multiple clients use the same service and receive centrally managed updates. Running work on the server can reduce demands on client devices.",
        "The separation adds network round trips, latency and failure opportunities. If a required service is unreachable, affected operations cannot complete. Overload can increase waiting or require rejection; the client/server model alone guarantees neither capacity nor availability.",
        "Client-side work can make local actions responsive and support offline use. Shared changes then need synchronization across devices. Trusted access checks must remain on the service that controls the resource.",
      ],
      remember: "Choose where each task runs based on its needs. Keep trusted checks on the server. Use the client for work that needs a fast response or must work offline.",
      source: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Introduction",
    },
    {
      section: "Interview Tip", title: "Explain responsibilities, state and failure",
      paragraphs: [
        "A complete request flow identifies what the client sends, how the server interprets and checks it, which allowed work runs, and what result or error returns.",
        "Locate persistent application data and any session context separately. Their locations determine which dependencies the operation needs and what survives replacing a handler.",
        "An explicit error reports a failure. No response leaves the outcome uncertain: processing may have failed, or processing may have succeeded and only the response was lost. Retrying is therefore an application decision, not proof the first attempt did nothing.",
      ],
      remember: "Connect the request, responsibilities, data and outcome. Component names alone do not explain behavior.",
      source: "https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2",
    },
  ],
};
