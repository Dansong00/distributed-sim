import { ArrowDown } from "lucide-react";

export function SharedFileStorageDiagram({ slide }: { slide: number }) {
  if (slide === 1) return <figure className="lesson-diagram database-flow" aria-label="A program opens a mounted path; the operating-system client sends needed file requests over the network to the shared file service.">
    <div className="database-flow-step"><div className="lesson-node">Program<small>Open /shared/report.csv</small></div><ArrowDown aria-hidden="true" /></div>
    <div className="database-flow-step"><div className="lesson-node">Filesystem client<small>Local cache and network requests</small></div><ArrowDown aria-hidden="true" /></div>
    <div className="database-flow-step"><div className="lesson-node">Shared file service<small>Files, directories and metadata</small></div></div>
    <figcaption>The mounted path depends on a remote service.</figcaption>
  </figure>;
  if (slide === 3) return <figure className="lesson-diagram lesson-variants" aria-label="Two clients both read 10 and write 11. One increment is lost because the complete updates were not coordinated.">
    <div><h4>Client A</h4><div className="lesson-node">Read 10 → write 11</div><ArrowDown className="lesson-down" aria-hidden="true" /></div>
    <div><h4>Client B</h4><div className="lesson-node">Read 10 → write 11</div><ArrowDown className="lesson-down" aria-hidden="true" /></div>
    <div className="lesson-node" style={{ gridColumn: "1 / -1" }}>Shared counter: 11<small>Two increments should produce 12</small></div>
    <figcaption style={{ gridColumn: "1 / -1" }}>Successful individual writes do not protect the whole update.</figcaption>
  </figure>;
  return null;
}
