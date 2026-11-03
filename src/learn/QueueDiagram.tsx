import { ArrowDown } from "lucide-react";
import "./database-lessons.css";

export function QueueDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 1:
      return <figure className="lesson-diagram database-flow" aria-label="The API publishes to the broker, which confirms acceptance. A worker saves the result and ready status, then acknowledges to the broker.">
        <div className="database-flow-step"><div className="lesson-node">API publishes job</div><ArrowDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Broker accepts<small>Confirmation → API</small></div><ArrowDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Worker saves result + ready status<small>Then acknowledgement → broker</small></div></div>
        <figcaption>Acceptance and completed work are separate boundaries.</figcaption>
      </figure>;
    case 6:
      return <figure className="lesson-diagram lesson-variants" aria-label="A work queue divides jobs between workers. A retained log lets billing and analytics groups independently read the same events, each with its own position.">
        <div><h4>Work queue</h4><div className="lesson-node">Jobs A and B</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Worker 1: A<br />Worker 2: B</div><figcaption>Share work; retries can repeat it</figcaption></div>
        <div><h4>Retained log</h4><div className="lesson-node">Events A and B</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Billing: A → B<br />Analytics: A → B</div><figcaption>Independent groups and positions</figcaption></div>
      </figure>;
    default:
      return null;
  }
}
