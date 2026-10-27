import { ArrowDown, ArrowRight, Database, FileText, Layers, Server } from "lucide-react";
import "./database-lessons.css";

export function MySQLDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <figure className="lesson-diagram database-flow" aria-label="An application program sends SQL requests to the MySQL server program, which reads or changes stored data and returns results.">
        <div className="database-flow-step"><div className="lesson-node">Application program</div><ArrowDown aria-hidden="true" /><span>SQL request</span><ArrowDown aria-hidden="true" /><div className="lesson-node"><Server aria-hidden="true" />MySQL server program</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><Database aria-hidden="true" />Stored data</div></div>
        <figcaption>MySQL sends rows or a result back to the application. The programs can run on the same computer or different computers.</figcaption>
      </figure>;
    case 1:
      return <figure className="lesson-diagram database-flow" aria-label="MySQL handles connections and SQL. InnoDB manages storage and transactions for its tables.">
        <div className="database-flow-step"><div className="lesson-node"><Server aria-hidden="true" />MySQL: connections and SQL</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><Layers aria-hidden="true" />InnoDB: tables and transactions</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><Database aria-hidden="true" />Stored rows and indexes</div></div>
      </figure>;
    case 5:
      return <figure className="lesson-diagram database-flow" aria-label="An email lookup can use a secondary index to find a primary key, then the clustered index to retrieve the full row.">
        <div className="database-flow-step"><div className="lesson-node">Find a user by email</div><ArrowDown aria-hidden="true" /><div className="lesson-node">Secondary index: email and user ID</div><ArrowDown aria-hidden="true" /><div className="lesson-node">Clustered index: user ID and full row</div></div>
        <figcaption>If the secondary index already contains every requested field, the extra row lookup can be avoided.</figcaption>
      </figure>;
    case 6:
      return <figure className="lesson-diagram database-split" aria-label="The source has committed a change that the replica has not yet applied.">
        <div className="lesson-node"><Database aria-hidden="true" />Source<strong>Change committed</strong></div>
        <div className="database-partition"><span>Replication lag</span><ArrowRight aria-hidden="true" /><small>Change not applied yet</small></div>
        <div className="lesson-node"><Database aria-hidden="true" />Replica<strong>Older data</strong></div>
        <figcaption>A read on the replica can return an earlier value.</figcaption>
      </figure>;
    case 7:
      return <figure className="lesson-diagram database-flow" aria-label="Restore a backup, then replay binary log events up to the chosen recovery point, before the unwanted change.">
        <div className="database-flow-step"><div className="lesson-node"><Database aria-hidden="true" />Restore backup</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><FileText aria-hidden="true" />Replay later binary log events</div><ArrowDown aria-hidden="true" /><div className="lesson-node">Stop before the unwanted change</div></div>
        <figcaption>Recovery requires the backup and the necessary log events.</figcaption>
      </figure>;
    default:
      return null;
  }
}
