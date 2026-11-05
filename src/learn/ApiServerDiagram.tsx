import { ArrowDown, Database, Smartphone, Server, ShieldCheck, ListChecks, Clock } from "lucide-react";

export function ApiServerDiagram({ slide }: { slide: number }) {
  if (slide === 3 || slide === 4) return null;
  if (slide >= 2) return <figure className="lesson-diagram lesson-variants" aria-label="Immediate work returns a result. Background work returns a job ID so the client can check progress.">
    <div><h4>Finish now</h4><div className="lesson-node"><Server aria-hidden="true" />Complete operation</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node"><ListChecks aria-hidden="true" />Return result</div><figcaption>Required work has completed</figcaption></div>
    <div><h4>Finish later</h4><div className="lesson-node"><Clock aria-hidden="true" />Accept job</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node"><ListChecks aria-hidden="true" />Job ID: check progress</div><figcaption>A worker processes the job</figcaption></div>
  </figure>;
  return <figure className="lesson-diagram api-request-flow" aria-label={slide === 0 ? "A client sends input. The API checks the request, performs allowed work and uses data storage when required. The client receives a result or error." : "Identify the user, check access and data, perform allowed work, return a result."}>
    <div className="lesson-node">{slide === 0 ? <Smartphone aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}{slide === 0 ? "Client sends input" : "User, access and data checks"}</div>
    <ArrowDown aria-hidden="true" />
    <div className="lesson-node"><Server aria-hidden="true" />{slide === 0 ? "API checks and performs work" : "Run allowed operation"}</div>
    <ArrowDown aria-hidden="true" />
    <div className="lesson-node"><Database aria-hidden="true" />{slide === 0 ? "Use data storage if needed" : "Read or change data if needed"}</div>
    <figcaption>Response to the client: result or error</figcaption>
  </figure>;
}
