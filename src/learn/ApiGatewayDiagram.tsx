import { ArrowDown, ArrowUpDown } from "lucide-react";
import "./database-lessons.css";

export function ApiGatewayDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <figure className="lesson-diagram database-flow" aria-label="The client sends a notes request through the API gateway to Notes. Notes reads its database and responds through the gateway. An authors request routes to Authors instead.">
        <div className="database-flow-step"><div className="lesson-node">Client</div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">API gateway<small>Shared policies and service routing</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Notes service<small>/authors routes to Authors instead</small></div></div>
        <figcaption>Notes request down, response up. Notes does the application work.</figcaption>
      </figure>;
    case 2:
      return <figure className="lesson-diagram database-flow" aria-label="The gateway validates Alice's identity and replaces untrusted identity claims. Through a protected authenticated path, Notes receives verifiable identity and checks access to Bob's note. Authentication does not grant permission.">
        <div className="database-flow-step"><div className="lesson-node">Gateway: validate Alice<small>Replace forged identity claims</small></div><ArrowDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Protected identity path<small>Notes authenticates the gateway</small></div><ArrowDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Notes: check this note's permissions<small>Deny if Alice has no access</small></div></div>
        <figcaption>Block an unchecked direct route to Notes.</figcaption>
      </figure>;
    default:
      return null;
  }
}
