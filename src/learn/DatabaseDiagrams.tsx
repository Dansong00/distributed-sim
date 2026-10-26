import { ArrowDown, ArrowRight, Database, ShoppingCart, ShieldCheck } from "lucide-react";
import "./database-lessons.css";

function OrderFlow({ steps, caption }: { steps: string[]; caption: string }) {
  return <figure className="lesson-diagram database-flow" aria-label={caption}>
    {steps.map((step, index) => <div className="database-flow-step" key={step}>
      {index > 0 && <ArrowDown aria-hidden="true" />}
      <div className="lesson-node">{step}</div>
    </div>)}
    <figcaption>{caption}</figcaption>
  </figure>;
}

export function DatabaseOverviewDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <OrderFlow steps={["Customer places an order", "Order references products", "Inventory must stay valid"]} caption="One store, connected records and shared rules" />;
    case 1:
      return <figure className="lesson-diagram lesson-variants" aria-label="Compare the data model with the queries and rules your database must support.">
        <div><h4>Data model</h4><div className="lesson-node"><Database aria-hidden="true" />Tables or documents?</div><figcaption>How do we store and query it?</figcaption></div>
        <div><h4>Database choice</h4><div className="lesson-node"><ShieldCheck aria-hidden="true" />Find orders. Protect stock.</div><figcaption>Which product supports our queries and rules?</figcaption></div>
      </figure>;
    case 2:
      return <figure className="lesson-diagram database-records" aria-label="Compare the same product as related tables, an embedded document, or a direct key lookup.">
        <div><h4>Related tables</h4><table><caption>Products</caption><thead><tr><th>ID</th><th>Name</th></tr></thead><tbody><tr><td>42</td><td>Shirt</td></tr></tbody></table><table><caption>Sizes</caption><thead><tr><th>Product ID</th><th>Size</th></tr></thead><tbody><tr><td>42</td><td>M</td></tr><tr><td>42</td><td>L</td></tr></tbody></table></div>
        <div><h4>Embedded document</h4><pre>{'{\n  "id": 42,\n  "name": "Shirt",\n  "sizes": ["M", "L"]\n}'}</pre><p>Read the product details together.</p></div>
        <figcaption>Key lookup: <code>product:42</code> retrieves its value. The layout shapes the read and update work.</figcaption>
      </figure>;
    case 3:
      return <figure className="lesson-diagram database-query-models" aria-label="Wide-column groups device readings. Graph follows connected entities. Vector search finds similar items.">
        <div><h4>Wide-column</h4><code>device:7 / day:26</code><p>Readings for one device and day</p></div>
        <div><h4>Graph</h4><code>Person → Company → Account</code><p>Follow a relationship path</p></div>
        <div><h4>Vector</h4><code>Query embedding → Similar items</code><p>Search by similarity</p></div>
      </figure>;
    case 4:
      return <figure className="lesson-diagram" aria-label="PostgreSQL can combine relational records with geospatial and vector extensions.">
        <div className="lesson-node"><Database aria-hidden="true" />PostgreSQL</div>
        <div className="database-capabilities"><span>Relational tables</span><span>PostGIS: location queries</span><span>pgvector: similarity search</span></div>
        <figcaption>Capabilities can share one database. Measure when a separate service is worth its cost.</figcaption>
      </figure>;
    case 5:
      return <figure className="lesson-diagram database-tradeoffs" aria-label="Database choices have paired benefits and costs.">
        <div><strong>Keep shared facts together</strong><span>Fewer duplicate updates</span><ArrowRight aria-hidden="true" /><span>Reads can require joins</span></div>
        <div><strong>Embed copies</strong><span>Convenient reads</span><ArrowRight aria-hidden="true" /><span>More updates to coordinate</span></div>
        <div><strong>Add a specialized store</strong><span>Queries suited to the workload</span><ArrowRight aria-hidden="true" /><span>Another system to operate</span></div>
      </figure>;
    default:
      return null;
  }
}

export function PostgresDiagram({ slide }: { slide: number }) {
  switch (slide) {
    case 0:
      return <OrderFlow steps={["Customer", "Order and order items", "Products and inventory"]} caption="Relationships connect one purchase to the data it needs" />;
    case 1:
      return <figure className="lesson-diagram database-rules" aria-label="Database constraints reject missing references, duplicate identifiers and negative stock.">
        <ShieldCheck aria-hidden="true" /><dl><dt>Order.customer_id</dt><dd>Must reference a customer</dd><dt>Order.id</dt><dd>Must be unique</dd><dt>Inventory.stock</dt><dd>Must be zero or greater</dd></dl>
      </figure>;
    case 2:
      return <figure className="lesson-diagram" aria-label="Create the order and reduce stock in one transaction. ACID describes four transaction properties.">
        <div className="database-transaction"><small>One database transaction</small><div><ShoppingCart aria-hidden="true" />Create order<span>+</span>Reduce stock</div><strong>Commit both, or roll back both</strong></div>
        <dl className="database-acid"><div><dt>A · Atomicity</dt><dd>All or nothing</dd></div><div><dt>C · Consistency</dt><dd>Preserve defined rules</dd></div><div><dt>I · Isolation</dt><dd>Control competing work</dd></div><div><dt>D · Durability</dt><dd>Keep committed changes</dd></div></dl>
      </figure>;
    case 3:
      return <figure className="lesson-diagram" aria-label="Two customers compete for one item. A conditional update succeeds once; the other request finds no remaining stock.">
        <pre className="database-sql">{'UPDATE inventory\nSET stock = stock - 1\nWHERE product_id = 42 AND stock > 0;'}</pre>
        <div className="lesson-variants database-outcomes"><div><h4>Customer A</h4><div className="lesson-node">Update succeeds<br />Create the order</div></div><div><h4>Customer B</h4><div className="lesson-node">No row updated<br />Do not create an order</div></div></div>
        <figcaption>Check the update result. Create the order within that same transaction.</figcaption>
      </figure>;
    case 4:
      return <OrderFlow steps={["Recent orders for customer 7", "Index: customer ID + order date", "Matching orders, newest first"]} caption="An index supports a specific filter and ordering" />;
    case 5:
      return <figure className="lesson-diagram database-split" aria-label="An order is committed on the primary but has not yet reached the read replica.">
        <div className="lesson-node"><Database aria-hidden="true" />Primary<strong>Order 81 exists</strong></div>
        <div className="database-partition"><span>Replication delay</span><ArrowRight aria-hidden="true" /><small>Change not received yet</small></div>
        <div className="lesson-node"><Database aria-hidden="true" />Read replica<strong>Order 81 missing</strong></div>
        <figcaption>A committed transaction on one copy does not make every replica current.</figcaption>
      </figure>;
    case 6:
      return <figure className="lesson-diagram database-tradeoffs" aria-label="Stock coordination, indexes and replicas each bring a benefit and a cost.">
        <div><strong>Coordinate purchases</strong><span>Protect stock</span><ArrowRight aria-hidden="true" /><span>Wait or retry</span></div>
        <div><strong>Add an index</strong><span>Faster matching reads</span><ArrowRight aria-hidden="true" /><span>Storage and write work</span></div>
        <div><strong>Wait for a replica</strong><span>Protect recent writes</span><ArrowRight aria-hidden="true" /><span>More commit delay</span></div>
      </figure>;
    default:
      return null;
  }
}
