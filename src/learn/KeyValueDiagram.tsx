import { ArrowDown } from "lucide-react";
import "./database-lessons.css";

export function KeyValueDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 2:
      return <figure className="lesson-diagram lesson-variants" aria-label="The same account number in two organizations needs two distinct keys. These namespaces do not grant access.">
        <div><h4>Organization A</h4><div className="lesson-node">A:account:7:prefs</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">A's preferences</div></div>
        <div><h4>Organization B</h4><div className="lesson-node">B:account:7:prefs</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">B's preferences</div></div>
        <figcaption style={{ gridColumn: "1 / -1" }}>Distinct identities. Permission still requires a check.</figcaption>
      </figure>;
    case 4:
      return <figure className="lesson-diagram lesson-variants" aria-label="Both callers read count 10 at version 4. The first atomic version-checked write stores 11 at version 5. The second is rejected and must reread and recompute.">
        <div><h4>First caller</h4><div className="lesson-node">Reads 10 · version 4</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">If version = 4<br />Store 11 · version 5</div><figcaption>Condition and write succeed together</figcaption></div>
        <div><h4>Second caller</h4><div className="lesson-node">Reads 10 · version 4</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">If version = 4<br />Rejected: now version 5</div><figcaption>Reread 11, compute 12, try with version 5</figcaption></div>
      </figure>;
    default:
      return null;
  }
}
