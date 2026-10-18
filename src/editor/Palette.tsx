import { useState } from "react";
import { categories, presets } from "../domain/catalog";
export function Palette({ onAdd, disabled = false }: { onAdd: (id: string) => void; disabled?: boolean }) {
  const [query, setQuery] = useState("");
  const item = (id: string, label: string) => (
    <button
      draggable
      key={id}
      aria-label={`Add ${label}`}
      onClick={() => onAdd(id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("application/system-canvas", id);
        e.dataTransfer.effectAllowed = "copy";
      }}
    >
      {label}
    </button>
  );
  return (
    <aside className="palette" inert={disabled}>
      <div className="panel-heading">
        <span>YOUR BUILDING BLOCKS</span>
        <h1>Components</h1>
        <p>Small pieces. Clear systems.</p>
        <input
          aria-label="Search components"
          placeholder="Search components…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="catalog-groups">
        {categories.map((category) => (
          <details
            key={category}
            open={
              Boolean(query) || category === "Clients" || category === "Compute"
            }
          >
            <summary>{category}</summary>
            <ul>
              {presets
                .filter(
                  (p) =>
                    p.category === category &&
                    `${p.label} ${p.category} ${p.componentType} ${p.componentType.replaceAll("-", " ")} ${p.description}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((p) => (
                  <li key={p.id}>{item(p.id, p.label)}</li>
                ))}
            </ul>
          </details>
        ))}
        <details open>
          <summary>Annotations</summary>
          {item("sticky", "Sticky note")}
          {item("text", "Text")}
          {item("container", "Container")}
        </details>
      </div>
      <div className="palette-footer">
        <span className="local-dot" />A space to think in systems
      </div>
    </aside>
  );
}
