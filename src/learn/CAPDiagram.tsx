import { Database, Unplug } from "lucide-react";
import "./database-lessons.css";

export function CAPDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 1:
      return <figure className="lesson-diagram database-split" aria-label="Both servers receive requests, but cannot exchange messages across the network split.">
        <div className="lesson-node"><Database aria-hidden="true" />Server A<strong>Running</strong></div>
        <div className="database-partition"><span>Network split</span><Unplug aria-hidden="true" /><small>No messages cross</small></div>
        <div className="lesson-node"><Database aria-hidden="true" />Server B<strong>Running</strong></div>
        <figcaption>Clients can reach a server even when the servers cannot reach each other.</figcaption>
      </figure>;
    case 4:
      return <figure className="lesson-diagram database-split" aria-label="Server A confirms the new value 12. The network split prevents server B from learning it; B still holds 10.">
        <div className="lesson-node"><Database aria-hidden="true" />Server A<strong>12</strong><small>Write confirmed</small></div>
        <div className="database-partition"><span>Network split</span><Unplug aria-hidden="true" /><small>Update cannot cross</small></div>
        <div className="lesson-node"><Database aria-hidden="true" />Server B<strong>10</strong><small>Read arrives here</small></div>
        <figcaption>Answer with old data, or leave the read unfulfilled.</figcaption>
      </figure>;
    case 5:
      return <figure className="lesson-diagram lesson-variants" aria-label="In a three-server majority-based system, the connected pair can agree on writes. The isolated server cannot commit writes alone.">
        <div><h4>Connected pair</h4><div className="lesson-node"><Database aria-hidden="true" />Servers A + B<strong>2 of 3</strong></div><p>Can agree and commit writes</p></div>
        <div><h4>Isolated server</h4><div className="lesson-node"><Database aria-hidden="true" />Server C<strong>1 of 3</strong></div><p>Cannot commit writes alone</p></div>
        <figcaption style={{ gridColumn: "1 / -1" }}>The majority protocol preserves one agreed history.</figcaption>
      </figure>;
    default:
      return null;
  }
}
