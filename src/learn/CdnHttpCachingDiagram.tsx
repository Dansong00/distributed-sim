import { ArrowDown, ArrowUpDown } from "lucide-react";
import "./database-lessons.css";

export function CdnHttpCachingDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <figure className="lesson-diagram database-flow" aria-label="On a miss, a cacheable GET request goes browser to CDN to origin and the response returns origin to CDN to browser. A browser hit avoids the network request; a CDN hit avoids origin. Storage at each cache depends on its policy.">
        <div className="database-flow-step"><div className="lesson-node">Browser private cache<small>Hit: no network request</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">CDN shared edge cache<small>Hit: no origin request</small></div><ArrowUpDown aria-hidden="true" /></div>
        <div className="database-flow-step"><div className="lesson-node">Origin<small>Serves the resource on a miss</small></div></div>
        <figcaption>Misses continue down; responses return up. Store only when policy permits.</figcaption>
      </figure>;
    case 2:
      return <figure className="lesson-diagram lesson-variants" aria-label={'The CDN validates a stored page with If-None-Match: "v1". If unchanged, origin returns 304 without a replacement body; the CDN updates metadata and reuses its body. If changed, origin returns 200 with the new body and validator, stored only if policy allows. Both branches contact origin.'}>
        <div><h4>Unchanged at origin</h4><div className="lesson-node">304, no replacement body</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Update metadata; reuse body</div><figcaption>Validation still contacted origin</figcaption></div>
        <div><h4>Changed at origin</h4><div className="lesson-node">200, new body and tag</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Replace if policy permits</div><figcaption>Validation still contacted origin</figcaption></div>
      </figure>;
    default:
      return null;
  }
}
