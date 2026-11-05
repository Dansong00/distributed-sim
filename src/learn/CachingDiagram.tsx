import { ArrowDown, ArrowRight, Database } from "lucide-react";
import "./database-lessons.css";

export function CachingDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 1:
      return <figure className="lesson-diagram lesson-variants" aria-label="On a hit the API returns the cached result. On a miss the API reads the database, fills the cache, and responds.">
        <div><h4>Hit</h4><div className="lesson-node">API checks cache</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">Entry found</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">API responds</div><figcaption>No database lookup</figcaption></div>
        <div><h4>Miss</h4><div className="lesson-node">API checks cache</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">API reads database</div><ArrowDown className="lesson-down" aria-hidden="true" /><div className="lesson-node">API caches and responds</div><figcaption>More work on this request</figcaption></div>
      </figure>;
    case 3:
      return <figure className="lesson-diagram database-split" aria-label="The database has the new 25 dollar price, but the cached copy still holds 20 dollars until it is removed or replaced.">
        <div className="lesson-node"><Database aria-hidden="true" />Database<strong>$25</strong><small>New price saved</small></div>
        <div className="database-partition"><span>Copy is stale</span><ArrowRight aria-hidden="true" /><small>Still needs invalidation</small></div>
        <div className="lesson-node">Cache<strong>$20</strong><small>Old price remains</small></div>
        <figcaption>A database update does not automatically update the cached copy.</figcaption>
      </figure>;
    default:
      return null;
  }
}
