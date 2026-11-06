import { ArrowDown } from "lucide-react";

export function ObjectStorageDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 1:
      return <figure className="lesson-diagram lesson-variants" aria-label="The application first confirms its intended object upload, then publishes a ready database reference. These are separate writes; a failed database commit can leave an unreferenced object.">
        <div><h4>1. Store the object</h4><div className="lesson-node">Application uploads bytes</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Object store<small>Bucket, key, bytes and metadata</small></div></div>
        <div><h4>2. Publish the reference</h4><div className="lesson-node">Application confirms the object</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Database<small>Application record and ready reference</small></div></div>
        <figcaption style={{ gridColumn: "1 / -1" }}>The application coordinates two writes. They do not commit together.</figcaption>
      </figure>;
    case 4:
      return <figure className="lesson-diagram lesson-variants" aria-label="A lost upload response leaves the outcome unknown. A create-if-absent rejection means an object exists under the condition's rules, not that this upload's intended bytes are stored.">
        <div><h4>No response</h4><div className="lesson-node">Upload times out</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Write may have completed</div><figcaption>The result is unknown</figcaption></div>
        <div><h4>Condition rejected</h4><div className="lesson-node">Create only if no live object</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">A live object occupied the key</div><figcaption>Intended bytes still unverified</figcaption></div>
      </figure>;
    default:
      return null;
  }
}
