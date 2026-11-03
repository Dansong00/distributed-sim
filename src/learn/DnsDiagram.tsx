import { ArrowDown, ArrowUpDown } from "lucide-react";
import "./database-lessons.css";

export function DnsDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <figure className="lesson-diagram database-flow" aria-label="The Notes client asks its stub resolver. The stub asks one recursive resolver and does not walk to the authoritative server itself. With no cached copy, the recursive resolver asks the authoritative name server, which answers from zone data. A later lookup can use the resolver's stored copy.">
        <div className="database-flow-step"><div className="lesson-node">Client stub<small>Asks one recursive resolver</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Recursive resolver<small>May answer from its stored copy</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Authoritative name server<small>Answers from zone data</small></div></div>
        <figcaption>Records come back up this path. GET /notes is a later step.</figcaption>
      </figure>;
    case 4:
      return <figure className="lesson-diagram lesson-variants" aria-label="Resolver A cached 192.0.2.10 at 12:00 and may keep returning it until 13:00. Resolver B cached the same old address at 12:05 and may keep it until 13:05. The authoritative change to 192.0.2.30 at 12:10 does not rewrite either copy.">
        <div><h4>Resolver A</h4><div className="lesson-node">Cached 192.0.2.10 at 12:00</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Countdown reaches zero at 13:00</div><figcaption>At 12:20 it may still return 192.0.2.10</figcaption></div>
        <div><h4>Resolver B</h4><div className="lesson-node">Cached 192.0.2.10 at 12:05</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Countdown reaches zero at 13:05</div><figcaption>At 13:02 it may still reuse 192.0.2.10</figcaption></div>
      </figure>;
    default:
      return null;
  }
}
