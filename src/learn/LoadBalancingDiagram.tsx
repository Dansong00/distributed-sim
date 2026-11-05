import { ArrowDown, ArrowUpDown } from "lucide-react";
import "./database-lessons.css";

export function LoadBalancingDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <figure className="lesson-diagram database-flow" aria-label="The client sends a request through the reverse-proxy load balancer to one selected API backend, A or B. The response returns through the proxy to the client.">
        <div className="database-flow-step"><div className="lesson-node">Client</div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Load balancer<small>One service entry point</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Selected backend: A or B<small>Runs the application</small></div></div>
        <figcaption>Request down, response up. Select one backend for this request.</figcaption>
      </figure>;
    case 5:
      return <figure className="lesson-diagram lesson-variants" aria-label="During a planned request-aware drain, A finishes already accepted work until its deadline while new assignments go to B. Existing connections must also be managed; work is not moved from A to B.">
        <div><h4>Backend A: draining</h4><div className="lesson-node">Already accepted request</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Finish, or reach deadline</div><figcaption>Remaining work may be interrupted</figcaption></div>
        <div><h4>Backend B: accepting</h4><div className="lesson-node">New assignments</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Process new work</div><figcaption>Does not inherit A's unfinished work</figcaption></div>
      </figure>;
    default:
      return null;
  }
}
