import { ArrowDown } from "lucide-react";

export function BlockStorageDiagram({ slide }: { slide: number }) {
  if (slide === 0) return <figure className="lesson-diagram database-flow" aria-label="A database using files: database records and transactions above filesystem names and directories, above volume block addresses.">
    <div className="database-flow-step"><div className="lesson-node">Database<small>Records, queries, transactions</small></div><ArrowDown aria-hidden="true" /></div>
    <div className="database-flow-step"><div className="lesson-node">Filesystem<small>Files, directories, metadata</small></div><ArrowDown aria-hidden="true" /></div>
    <div className="database-flow-step"><div className="lesson-node">Block volume<small>Read and write addressed ranges</small></div></div>
    <figcaption>One common path; each layer has a different job.</figcaption>
  </figure>;
  if (slide === 4) return <figure className="lesson-diagram lesson-variants" aria-label="Two hosts with independent filesystem caches access the same block volume. Attachment does not coordinate their metadata or writes.">
    <div><h4>Host A</h4><div className="lesson-node">Filesystem cache A</div><ArrowDown className="lesson-down" aria-hidden="true" /></div>
    <div><h4>Host B</h4><div className="lesson-node">Filesystem cache B</div><ArrowDown className="lesson-down" aria-hidden="true" /></div>
    <div className="lesson-node" style={{ gridColumn: "1 / -1" }}>The same block volume<small>No automatic filesystem coordination</small></div>
    <figcaption style={{ gridColumn: "1 / -1" }}>Independent writers can conflict and corrupt data.</figcaption>
  </figure>;
  return null;
}
