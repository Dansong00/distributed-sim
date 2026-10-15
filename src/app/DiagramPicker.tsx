import type { StoredDiagram } from "../domain/model";
export function DiagramPicker({
  records,
  onOpen,
  busy,
}: {
  records: StoredDiagram[];
  onOpen: (id: string) => void;
  busy: boolean;
}) {
  return (
    <div className="diagram-list">
      {records.map(({ document }) => (
        <button
          disabled={busy}
          className="diagram-item"
          key={document.id}
          onClick={() => onOpen(document.id)}
          aria-label={`Open ${document.name}`}
        >
          <strong>{document.name}</strong>
          <span>
            {document.nodes.length} elements · {document.edges.length}{" "}
            connections
          </span>
          <small>Edited {new Date(document.updatedAt).toLocaleString()}</small>
        </button>
      ))}
    </div>
  );
}
