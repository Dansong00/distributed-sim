import { ArrowDown, ArrowUpDown } from "lucide-react";
import "./database-lessons.css";

export function ApiGatewayDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <figure className="lesson-diagram database-flow" aria-label="The client sends a request through the API gateway. The gateway selects a backend service, which performs the application work and responds through the gateway.">
        <div className="database-flow-step"><div className="lesson-node">Client</div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">API gateway<small>Shared policies and service routing</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Selected service<small>Destination depends on request routing</small></div></div>
        <figcaption>Request down, response up. The selected service does the application work.</figcaption>
      </figure>;
    case 2:
      return <figure className="lesson-diagram database-flow" aria-label="The gateway validates Alice's identity and replaces untrusted identity claims. Through a protected authenticated path, the service receives verifiable identity and checks access to Bob's document. Authentication does not grant permission.">
        <div className="database-flow-step"><div className="lesson-node">Gateway: validate Alice<small>Replace forged identity claims</small></div><ArrowDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Protected identity path<small>Service authenticates the gateway</small></div><ArrowDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Service: check resource permission<small>Deny if Alice has no access</small></div></div>
        <figcaption>Block an unchecked direct route to the service.</figcaption>
      </figure>;
    default:
      return null;
  }
}
