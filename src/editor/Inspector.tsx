import type { Diagram, Selection } from "../domain/model";
import type { HistoryAction } from "../domain/history";
export function Inspector({
  document,
  selection,
  dispatch,
}: {
  document: Diagram;
  selection: Selection;
  dispatch: (action: HistoryAction) => void;
}) {
  const node = document.nodes.find((n) => selection.nodeIds.includes(n.id));
  const edges = document.edges.filter((e) => selection.edgeIds.includes(e.id));
  const edge = edges[0];
  if (!node && !edge)
    return (
      <aside className="inspector">
        <h3>Properties</h3>
        <p>Select an element or connection to shape the details.</p>
      </aside>
    );
  const update = (key: string, value: string) =>
    dispatch({
      type: "preview",
      document: node
        ? {
            ...document,
            nodes: document.nodes.map((n) =>
              n.id === node.id ? { ...n, [key]: value } : n,
            ),
          }
        : {
            ...document,
            edges: document.edges.map((e) =>
              e.id === edge!.id ? { ...e, [key]: value } : e,
            ),
          },
    });
  const field = (
    label: string,
    key: string,
    value: string,
    multiline = false,
  ) => (
    <label key={key}>
      {label}
      {multiline ? (
        <textarea
          aria-label={label}
          maxLength={10000}
          value={value}
          onFocus={() => dispatch({ type: "begin" })}
          onChange={(e) => update(key, e.target.value)}
          onBlur={() => dispatch({ type: "commit" })}
        />
      ) : (
        <input
          aria-label={label}
          maxLength={200}
          value={value}
          onFocus={() => dispatch({ type: "begin" })}
          onChange={(e) => update(key, e.target.value)}
          onBlur={() => dispatch({ type: "commit" })}
        />
      )}
    </label>
  );
  const connectorSetting = (label: string, key: "stroke" | "path", values: string[], fallback: string) => {
    const selected = new Set(edges.map(e => e[key] ?? fallback));
    const value = selected.size > 1 ? "mixed" : [...selected][0];
    return <label>{label}<select aria-label={label} value={value} onChange={event => {
      dispatch({ type: "preview", document: { ...document, edges: document.edges.map(e => selection.edgeIds.includes(e.id) ? { ...e, [key]: event.target.value } : e) } });
      dispatch({ type: "commit" });
    }}>
      {selected.size > 1 && <option value="mixed" disabled>Mixed</option>}
      {values.map(v => <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>)}
    </select></label>;
  };
  return (
    <aside className="inspector">
      <h3>
        {node
          ? node.kind === "component"
            ? "Component"
            : node.kind
          : edges.length > 1 ? `Connections (${edges.length})` : "Connection"}
      </h3>
      {node ? (
        <>
          {field("Name", "name", node.name)}
          {node.kind === "component" && (
            <>
              {field("Technology", "technology", node.technology ?? "")}
              <p>{node.description}</p>
            </>
          )}
          {node.kind !== "container" &&
            field("Notes", "notes", node.notes, true)}
          {node.kind === "sticky" && (
            <label>
              Color
              <select
                value={node.color ?? "yellow"}
                onChange={(e) => {
                  update("color", e.target.value);
                  dispatch({ type: "commit" });
                }}
              >
                {["yellow", "blue", "pink", "green"].map((color) => (
                  <option key={color}>{color}</option>
                ))}
              </select>
            </label>
          )}
        </>
      ) : edges.length === 1 ? (
        <>
          {field("Label", "label", edge!.label)}
          <label>
            Direction
            <select
              aria-label="Direction"
              value={edge!.direction}
              onChange={(e) => {
                update("direction", e.target.value);
                dispatch({ type: "commit" });
              }}
            >
              <option value="one-way">One way</option>
              <option value="both">Both ways</option>
            </select>
          </label>
        </>
      ) : null}
      {edges.length > 0 && <>
        {node && <h3>Connections ({edges.length})</h3>}
        {connectorSetting("Stroke style", "stroke", ["solid", "dashed", "dotted"], "solid")}
        {connectorSetting("Path shape", "path", ["straight", "curved", "elbow"], "elbow")}
        {edges.some(e => e.source === e.target && e.path === "straight") && <p>Straight self-connections use a rectangular loop so they stay visible.</p>}
      </>}
    </aside>
  );
}
