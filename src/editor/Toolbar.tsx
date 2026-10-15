export function Toolbar({
  tool,
  onTool,
  undo,
  redo,
  canUndo,
  canRedo,
  canDelete,
  canDuplicate,
  onDelete,
  onDuplicate,
}: {
  tool: "select" | "pan";
  onTool: (tool: "select" | "pan") => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Canvas tools">
      <button aria-pressed={tool === "select"} onClick={() => onTool("select")}>
        Select
      </button>
      <button aria-pressed={tool === "pan"} onClick={() => onTool("pan")}>
        Pan
      </button>
      <span />
      <button disabled={!canUndo} onClick={undo}>
        Undo
      </button>
      <button disabled={!canRedo} onClick={redo}>
        Redo
      </button>
      <span />
      <button disabled={!canDuplicate} onClick={onDuplicate}>
        Duplicate
      </button>
      <button disabled={!canDelete} onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
