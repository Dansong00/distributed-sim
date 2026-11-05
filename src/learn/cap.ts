export const capLesson = {
  title: "CAP Theorem",
  reviewed: "2026-11-03",
  slides: [
    {
      section: "What Is CAP?", title: "A limit on what distributed systems can guarantee",
      paragraphs: [
        {"label": "Distributed system", "text": "Uses computers that communicate over a network."},
        {"label": "CAP", "text": "Stands for Consistency, Availability, and Partition tolerance. When a network split prevents communication, a system cannot guarantee both the latest data and successful completion of every request."},
        "The next cards explain why.",
      ],
      remember: "CAP concerns distributed systems. A single local database does not face this choice between disconnected copies.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Partition Tolerance", title: "What happens when servers cannot communicate?",
      paragraphs: [
        {"label": "Network partition", "text": "Prevents parts of a system from exchanging messages. Servers on both sides can still be running and receiving requests."},
        {"label": "Partition tolerance", "text": "Means the design accounts for these communication failures. It does not promise that every operation remains available."},
        "Adding more servers does not remove this problem. They still need a working connection to share changes.",
      ],
      remember: "A server can be running while its connection to another server is broken.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Consistency", title: "A completed write must be visible to later reads",
      paragraphs: [
        {"label": "Consistency in CAP", "text": "Linearizability: operations behave as if they take effect in a single order that respects real time."},
        "If a write completes before a read begins, and no intervening write changes the value, the read must reflect that write. Returning an older local copy cannot satisfy this guarantee.",
        "Overlapping operations may be placed in either order, provided the resulting order is valid for one copy. The required order follows completed-before-started relationships, not a globally synchronized timestamp on every request.",
        "This differs from eventual convergence and from ACID consistency, which concerns preserving defined database rules.",
      ],
      remember: "Once a write completes, later reads must reflect it or a newer write.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Availability", title: "Every request to a working server can complete",
      paragraphs: [
        {"label": "Availability in CAP", "text": "Means every valid request that reaches a working server eventually gets a successful result."},
        "For a read, that means returning data. Returning 'service unavailable' does not satisfy this guarantee.",
        "Availability alone does not promise the latest data. A disconnected server can answer using an older local copy.",
        "CAP availability does not mean fast, immediately answered, or a particular uptime percentage. The theorem requires eventual per-request completion and sets no practical response-time target.",
      ],
      remember: "An error response is not successful completion of the requested operation.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Why Both Cannot Be Guaranteed", title: "A server cannot return an update it cannot learn about",
      paragraphs: [
        "Two servers hold the value 10. Their connection breaks.",
        "Server A accepts a change to 12 and confirms success. Then a client reads from Server B. B still knows only 10.",
        {"label": "Return 10", "text": "The read succeeds, but breaks consistency."},
        {"label": "Wait or reject the read", "text": "B avoids returning old data, but cannot guarantee availability."},
        "Blocking the original write at A also gives up availability. The conflict exists whichever operation waits.",
        "Guessing the new value cannot guarantee correctness across possible unseen writes. The obstacle is missing information, not a particular database product.",
      ],
      remember: "B cannot know about a change that no message can deliver.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Favoring Consistency", title: "Stop operations that cannot safely proceed",
      paragraphs: [
        {"label": "CP design", "text": "Preserves consistency during a partition. Some requests must wait or fail."},
        {"label": "Quorum", "text": "A required group of servers. In a three-server system using a majority-based agreement protocol, two servers must agree before a write completes."},
        "If the network splits into two servers and one, the connected pair can continue committing writes. The isolated server cannot commit writes on its own.",
        "Safely coordinated operations can continue; favoring consistency need not shut down every part of the system.",
      ],
      remember: "The gain is one agreed history of changes. The cost is that clients reaching the isolated server cannot complete those operations.",
      source: "https://raft.github.io/raft.pdf",
    },
    {
      section: "Favoring Availability", title: "Continue serving, then resolve differences",
      paragraphs: [
        {"label": "AP design", "text": "Keeps accepting requests during a partition. Each side works with the information it has."},
        "Reads can return older data. If both sides accept writes, they can produce conflicting changes to the same item.",
        "After communication returns, the system exchanges changes. It needs a rule to merge them, select one, or ask someone to resolve the conflict.",
        "Availability supplies no automatic safe merge. Selecting one conflicting value can lose another user's intent, and cross-record rules require their own protection.",
      ],
      remember: "The gain is continued access. The cost is handling disagreement and its effects on users.",
      source: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/",
    },
    {
      section: "Eventual Consistency", title: "Copies can catch up without being current at every moment",
      paragraphs: [
        {"label": "Eventual consistency", "text": "Copies converge if new updates stop, communication resumes and the required updates and reconciliation reach every copy."},
        "Convergence means agreement on a resulting state. It does not promise that every conflicting edit survives; the conflict-resolution policy determines the result.",
        "Eventually gives no fixed deadline or immediate read-your-writes guarantee. Applications must decide whether temporary older reads are acceptable.",
        "A database can offer different read guarantees. Choose for the operation rather than assuming every request has the same behavior.",
      ],
      remember: "Choose the read guarantee for the operation, rather than assuming every request behaves the same way.",
      source: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html",
    },
    {
      section: "Using CAP in a Design", title: "Explain what users experience during a split",
      paragraphs: [
        "Make the choice for the operation you are designing.",
        {"label": "Profile view", "text": "Can show an older biography."},
        {"label": "Seat reservation", "text": "Can wait if the system cannot confirm that the seat is still free."},
        {"label": "Offline edit", "text": "Can remain pending until conflicting changes are resolved."},
        "Outside partitions, CAP does not force a choice between consistency and availability. It does not predict normal-operation latency, capacity or operating cost; evaluate those separately.",
      ],
      remember: "Separate CAP consistency, an up-to-date view, from ACID consistency, preserving rules such as unique IDs and valid relationships.",
      source: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/",
    },
  ],
};
