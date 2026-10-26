import { ArrowDown, Database, FileText, Layers, Server } from "lucide-react";
import "./database-lessons.css";

export function SQLiteDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <figure className="lesson-diagram lesson-variants" aria-label="SQLite runs inside the application. PostgreSQL runs in a separate server process.">
        <div><h4>SQLite</h4><div className="database-transaction"><small>Application process</small><Database aria-hidden="true" /><strong>SQLite engine</strong></div><ArrowDown aria-hidden="true" /><div className="lesson-node"><FileText aria-hidden="true" />Local database file</div></div>
        <div><h4>PostgreSQL</h4><div className="lesson-node">Application process</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><Server aria-hidden="true" />Database server process</div></div>
      </figure>;
    case 4:
      return <figure className="lesson-diagram database-flow" aria-label="Competing writers take turns accessing one database.">
        <div className="database-flow-step"><div className="lesson-node">Other writers: wait or retry</div><ArrowDown aria-hidden="true" /><div className="database-transaction"><small>One active writer</small><Database aria-hidden="true" /><strong>Write transaction</strong></div><ArrowDown aria-hidden="true" /><div className="lesson-node">Database</div></div>
        <figcaption>One writer per database, across connections and processes.</figcaption>
      </figure>;
    case 5:
      return <figure className="lesson-diagram database-flow" aria-label="A writer appends changes to the WAL. A checkpoint transfers them to the database. Readers use a stable snapshot from the database and WAL.">
        <div className="database-flow-step"><div className="lesson-node">Writer</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><FileText aria-hidden="true" />WAL: committed changes</div><ArrowDown aria-hidden="true" /><span>Checkpoint</span><ArrowDown aria-hidden="true" /><div className="lesson-node"><Database aria-hidden="true" />Main database file</div></div>
        <figcaption>Readers use a stable snapshot from the database and WAL while the writer appends changes.</figcaption>
      </figure>;
    case 6:
      return <figure className="lesson-diagram database-flow" aria-label="A composite index on customer ID and order date can support finding one customer's recent orders.">
        <div className="database-flow-step"><div className="lesson-node">Recent orders for customer 7</div><ArrowDown aria-hidden="true" /><div className="lesson-node"><Layers aria-hidden="true" />Index: customer ID + order date</div><ArrowDown aria-hidden="true" /><div className="lesson-node">Matching rows in date order</div></div>
        <figcaption>Evaluate the index against the query's filter and ordering.</figcaption>
      </figure>;
    default:
      return null;
  }
}
