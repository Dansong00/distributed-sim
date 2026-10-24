import { ArrowDown, ArrowLeft, ArrowRight, Database, Monitor, Server } from "lucide-react";

export function LessonDiagram({ slide }: { slide: number }) {
  if (slide === 4) return null;
  if (slide === 3) return <figure className="lesson-diagram lesson-variants" aria-label="Client work: quick local actions and offline drafts, with data to sync. Server work: shared data and access checks, with network and running costs.">
    <div><h4>On the client</h4><div className="lesson-node"><Monitor aria-hidden="true" />Screen updates<br />Offline drafts</div><figcaption>Gain: quick local actions<br />Cost: sync data across devices</figcaption></div>
    <div><h4>On the server</h4><div className="lesson-node"><Server aria-hidden="true" />Shared data<br />Access checks</div><figcaption>Gain: one shared service<br />Cost: network and server upkeep</figcaption></div>
  </figure>;
  if (slide === 2) return <figure className="lesson-diagram lesson-variants" aria-label="Stateless: either server can handle the request. Stateful: requests return to the server holding the session.">
    <div><h4>Stateless</h4><div className="lesson-node"><Monitor />Client</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-server-pair"><div className="lesson-node"><Server />Server A</div><div className="lesson-node"><Server />Server B</div></div><figcaption>Either server can handle it</figcaption></div>
    <div><h4>Stateful</h4><div className="lesson-node"><Monitor />Client</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node"><Server />Server A</div><figcaption>Session data stays on A</figcaption></div>
  </figure>;
  return <figure className="lesson-diagram" aria-label="The browser sends a request to the API server and receives a response.">
    <div className="lesson-exchange">
      <div className="lesson-node"><Monitor /><span>Browser</span></div>
      <div className="lesson-messages"><span>Get profile</span><ArrowRight aria-hidden="true" /><span>Profile data</span><ArrowLeft aria-hidden="true" /></div>
      <div className="lesson-node"><Server /><span>API Server</span><small>{slide === 1 ? "Checks access" : ""}</small></div>
    </div>
    {slide === 1 && <div className="lesson-storage"><ArrowDown aria-hidden="true" /><div className="lesson-node"><Database />Database</div></div>}
  </figure>;
}
