import { useState } from 'react';
import { Boxes, ArrowUpRight, ChevronRight } from 'lucide-react';
import { createDiagram } from '../domain/templates';
import { categories, presets } from '../domain/catalog';
import { Canvas } from '../editor/Canvas';
export function App() {
  const [document] = useState(() => createDiagram('notes', 'Note-Taking App'));
  return <div className="app-shell">
    <header className="app-header"><a className="brand" href="/" aria-label="System Canvas home"><span><Boxes size={22}/></span>System Canvas</a><div className="header-divider"/><span className="document-title">{document.name}</span><span className="header-caption">Architecture workspace</span></header>
    <div className="workspace"><aside className="palette"><div className="panel-heading"><span>YOUR BUILDING BLOCKS</span><h1>Components</h1><p>Small pieces. Clear systems.</p></div><div className="catalog-groups">{categories.map(category => <details key={category} open={category === 'Clients' || category === 'Compute'}><summary><ChevronRight size={14}/>{category}<span>{presets.filter(p => p.category === category).length}</span></summary><ul>{presets.filter(p => p.category === category).map(preset => <li key={preset.id}>{preset.label}</li>)}</ul></details>)}</div><div className="palette-footer"><span className="local-dot"/>A space to think in systems</div></aside>
    <main><div className="canvas-heading"><div><span className="eyebrow">STARTER / 03</span><h2>A little app, a clear picture.</h2><p>Follow a note from the browser to the database.</p></div><span className="starter-tag"><ArrowUpRight size={14}/>Starting point</span></div><Canvas document={document}/><div className="canvas-footer"><span>Single-region example · Explore the assumptions on the canvas</span><span>{document.nodes.length} elements · {document.edges.length} connections</span></div></main></div>
  </div>;
}
