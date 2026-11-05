import { ArrowDown, ArrowUpDown } from "lucide-react";
import "./database-lessons.css";

export function DnsDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 1:
      return <figure className="lesson-diagram database-flow" aria-label="In the illustrative hierarchy with empty relevant caches, the stub asks the recursive resolver. That resolver asks root for a referral to .test, then .test for a referral to example.test, then the example.test authority for records. It returns the result to the stub.">
        <div className="database-flow-step"><div className="lesson-node">Client's stub resolver</div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Recursive resolver<small>Follows referrals on the client's behalf</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Asks root, then .test, then example.test<small>Referrals first; final authority supplies records</small></div></div>
        <figcaption>Teaching hierarchy. Cached answers or delegations can skip visits.</figcaption>
      </figure>;
    case 3:
      return <figure className="lesson-diagram lesson-variants" aria-label="The authority changes to a new address with TTL 30 at 10:01. A resolver that cached the old address at 10:00 with TTL 300 can ordinarily reuse it until 10:05. The edit does not push a replacement into that cache or move existing connections.">
        <div><h4>Authority at 10:01</h4><div className="lesson-node">New address, TTL 30</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">New answers use new values</div><figcaption>No push into existing caches</figcaption></div>
        <div><h4>Resolver cached at 10:00</h4><div className="lesson-node">Old address, TTL 300</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Ordinary reuse until 10:05</div><figcaption>Connections have their own lifetimes</figcaption></div>
      </figure>;
    default:
      return null;
  }
}
