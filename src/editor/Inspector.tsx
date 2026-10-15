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
  const edge = document.edges.find((e) => selection.edgeIds.includes(e.id));
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
  return (
    <aside className="inspector">
      <h3>
        {node
          ? node.kind === "component"
            ? "Component"
            : node.kind
          : "Connection"}
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
      ) : (
        <>
          {field("Label", "label", edge!.label)}
          <label>
            Direction
            <select
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
      )}
    </aside>
  );
}
