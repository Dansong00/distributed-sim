export const capLesson = {
  title: "CAP Theorem",
  reviewed: "2026-10-27",
  slides: [
    {
      section: "What Is CAP?", title: "A limit on what distributed systems can guarantee",
      paragraphs: [
        { label: "Distributed system", text: "Uses computers that communicate over a network." },
        { label: "CAP", text: "Stands for Consistency, Availability, and Partition tolerance. When a network split prevents communication, a system cannot guarantee both the latest data and successful completion of every request." },
        "The next cards explain why.",
      ],
      remember: "CAP concerns distributed systems. A single local database does not face this choice between disconnected copies.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Partition Tolerance", title: "What happens when servers cannot communicate?",
      paragraphs: [
        { label: "Network partition", text: "Prevents parts of a system from exchanging messages. Servers on both sides can still be running and receiving requests." },
        { label: "Partition tolerance", text: "Means the design accounts for these communication failures. It does not promise that every operation remains available." },
        "Adding more servers does not remove this problem. They still need a working connection to share changes.",
      ],
      remember: "A server can be running while its connection to another server is broken.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Consistency", title: "A completed write must be visible to later reads",
      paragraphs: [
        { label: "Consistency in CAP", text: "Means the system behaves like one up-to-date copy of the data." },
        "Suppose you change your display name and receive confirmation. A read that starts afterward must return the new name, unless another write changes it again.",
        "A server cannot meet this guarantee by returning an older name from its local copy.",
        { label: "Linearizability", text: "The technical term for this guarantee. Reads and writes behave as if they happen one at a time, in an order that respects completed operations." },
      ],
      remember: "Once a write completes, later reads must reflect it or a newer write.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Availability", title: "Every request to a working server can complete",
      paragraphs: [
        { label: "Availability in CAP", text: "Means every valid request that reaches a working server eventually gets a successful result." },
        "For a read, that means returning data. Returning 'service unavailable' does not satisfy this guarantee.",
        "Availability alone does not promise the latest data. A disconnected server can answer using an older local copy.",
        "It also does not mean 'fast.' CAP does not set a response-time target.",
      ],
      remember: "An error response is not successful completion of the requested operation.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Why Both Cannot Be Guaranteed", title: "A server cannot return an update it cannot learn about",
      paragraphs: [
        "Two servers hold the value 10. Their connection breaks.",
        "Server A accepts a change to 12 and confirms success. Then a client reads from Server B. B still knows only 10.",
        { label: "Return 10", text: "The read succeeds, but breaks consistency." },
        { label: "Wait or reject the read", text: "B avoids returning old data, but cannot guarantee availability." },
        "Blocking the original write at A also gives up availability. The conflict exists whichever operation waits.",
      ],
      remember: "B cannot know about a change that no message can deliver.",
      source: "https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf",
    },
    {
      section: "Favoring Consistency", title: "Stop operations that cannot safely proceed",
      paragraphs: [
        { label: "CP design", text: "Preserves consistency during a partition. Some requests must wait or fail." },
        { label: "Quorum", text: "A required group of servers. In a three-server system using a majority-based agreement protocol, two servers must agree before a write completes." },
        "If the network splits into two servers and one, the connected pair can continue committing writes. The isolated server cannot commit writes on its own.",
      ],
      remember: "The gain is one agreed history of changes. The cost is that clients reaching the isolated server cannot complete those operations.",
      source: "https://raft.github.io/raft.pdf",
    },
    {
      section: "Favoring Availability", title: "Continue serving, then resolve differences",
      paragraphs: [
        { label: "AP design", text: "Keeps accepting requests during a partition. Each side works with the information it has." },
        "Reads can return older data. If both sides accept writes, they can produce conflicting changes to the same item.",
        "After communication returns, the system exchanges changes. It needs a rule to merge them, select one, or ask someone to resolve the conflict.",
      ],
      remember: "The gain is continued access. The cost is handling disagreement and its effects on users.",
      source: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/",
    },
    {
      section: "Eventual Consistency", title: "Copies can catch up without being current at every moment",
      paragraphs: [
        { label: "Eventual consistency", text: "Means copies converge if writes stop and updates can reach every copy." },
        "For example, one server saves a new profile photo. Another briefly returns the old photo, then receives the update and returns the new one.",
        "'Eventually' does not promise a particular delay. Applications must decide whether older reads are acceptable.",
        "Some databases offer both strong and eventual read options. A database name alone does not tell you which guarantee a request receives.",
      ],
      remember: "Choose the read guarantee for the operation, rather than assuming every request behaves the same way.",
      source: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html",
    },
    {
      section: "Using CAP in a Design", title: "Explain what users experience during a split",
      paragraphs: [
        "Make the choice for the operation you are designing.",
        { label: "Profile view", text: "Can show an older biography." },
        { label: "Seat reservation", text: "Can wait if the system cannot confirm that the seat is still free." },
        { label: "Offline edit", text: "Can remain pending until conflicting changes are resolved." },
        "Outside partitions, CAP does not force a choice between consistency and availability.",
      ],
      remember: "Separate CAP consistency, an up-to-date view, from ACID consistency, preserving rules such as unique IDs and valid relationships.",
      source: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/",
    },
  ],
};
