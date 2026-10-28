import { ArrowDown, ArrowRight, Database, FileText, ShieldCheck } from "lucide-react";
import "./database-lessons.css";

export function ReplicationDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 1:
      return <figure className="lesson-diagram database-flow" aria-label="A replica starts with an initial copy, then receives and applies later changes.">
        <div className="database-flow-step"><div className="lesson-node"><Database aria-hidden="true" />Initial copy</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><FileText aria-hidden="true" />Receive later changes</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><Database aria-hidden="true" />Apply changes to the replica</div></div>
        <figcaption>Track progress so copying can resume after a disconnect.</figcaption>
      </figure>;
    case 4:
      return <figure className="lesson-diagram database-split" aria-label="The primary has the new profile, but a read on the replica still returns the old profile because the change has not been applied.">
        <div className="lesson-node"><Database aria-hidden="true" />Primary<strong>New profile</strong><small>Save confirmed</small></div>
        <div className="database-partition"><span>Replication lag</span><ArrowRight aria-hidden="true" /><small>Not applied yet</small></div>
        <div className="lesson-node"><Database aria-hidden="true" />Replica<strong>Old profile</strong><small>Read arrives here</small></div>
        <figcaption>The read can show older data even after the save succeeds.</figcaption>
      </figure>;
    case 6:
      return <figure className="lesson-diagram database-flow" aria-label="One safe failover sequence prevents the old leader from writing, promotes a suitable replica, then redirects application connections.">
        <div className="database-flow-step"><div className="lesson-node"><ShieldCheck aria-hidden="true" />Prevent old leader writes</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><Database aria-hidden="true" />Promote a suitable replica</div><ArrowDown aria-hidden="true" /><div className="lesson-node">Redirect application connections</div></div>
        <figcaption>A lost connection alone does not prove the old leader stopped.</figcaption>
      </figure>;
    default:
      return null;
  }
}
