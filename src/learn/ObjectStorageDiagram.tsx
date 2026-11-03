import { ArrowDown, ArrowUpDown } from "lucide-react";
import "./database-lessons.css";

export function ObjectStorageDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <figure className="lesson-diagram database-flow" aria-label="The Notes API writes the PDF as one object, then records the key on the note. A later download reads that key and requests the object. The object write and the note-row commit are separate.">
        <div className="database-flow-step"><div className="lesson-node">Notes API<small>Writes one complete object</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Object store<small>Bytes and metadata at one key</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Database<small>Note row stores the key after success</small></div></div>
        <figcaption>Confirm the object, then commit the key. These are not one transaction.</figcaption>
      </figure>;
    case 4:
      return <figure className="lesson-diagram lesson-variants" aria-label="A lost upload response leaves the outcome unknown. An unconditional retry can replace another writer's object. A create-if-absent precondition fails when a live object already has that key, which does not prove the stored bytes are this PDF.">
        <div><h4>No response</h4><div className="lesson-node">Upload times out</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Object may or may not be stored</div><figcaption>Absence of a response is not absence of the object</figcaption></div>
        <div><h4>Create if absent</h4><div className="lesson-node">Precondition on no live object</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">412 means the precondition failed</div><figcaption>That does not prove these bytes are stored</figcaption></div>
      </figure>;
    default:
      return null;
  }
}
