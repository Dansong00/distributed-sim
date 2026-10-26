import { ArrowDown, Database, Smartphone, Server, ShieldCheck, ListChecks, Clock } from "lucide-react";

export function ApiServerDiagram({ slide }: { slide: number }) {
  if (slide === 4) return null;
  if (slide >= 2) return <figure className="lesson-diagram lesson-variants" aria-label="Immediate work returns a result. Background work returns a job ID so the client can check progress.">
    <div><h4>Finish now</h4><div className="lesson-node"><Server aria-hidden="true" />Save note</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node"><ListChecks aria-hidden="true" />Return result</div><figcaption>{slide === 3 ? "One exchange, but the client waits" : "The note is saved"}</figcaption></div>
    <div><h4>Finish later</h4><div className="lesson-node"><Clock aria-hidden="true" />Accept report request</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node"><ListChecks aria-hidden="true" />Job ID: check progress</div><figcaption>{slide === 3 ? "Quick reply, but more status tracking" : "A worker builds the report"}</figcaption></div>
  </figure>;
  return <figure className="lesson-diagram api-request-flow" aria-label={slide === 0 ? "Mobile app sends note text. API checks access and saves to the database. The app receives the note ID." : "Identify the user, check access and data, create the note, return a result."}>
    <div className="lesson-node">{slide === 0 ? <Smartphone aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}{slide === 0 ? "App sends note text" : "User, access and data checks"}</div>
    <ArrowDown aria-hidden="true" />
    <div className="lesson-node"><Server aria-hidden="true" />{slide === 0 ? "API checks access and saves" : "Create note"}</div>
    <ArrowDown aria-hidden="true" />
    <div className="lesson-node"><Database aria-hidden="true" />{slide === 0 ? "Database stores the note" : "Save to database"}</div>
    <figcaption>Response to the app: the new note ID, or an error</figcaption>
  </figure>;
}
