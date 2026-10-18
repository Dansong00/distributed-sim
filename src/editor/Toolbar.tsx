import type { Ref } from "react";
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
  cleanupBusy,
  cleanupButtonRef,
  cleanupPhase,
  canCleanUp,
  onCleanUp,
  onApplyCleanup,
  onCancelCleanup,
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
  cleanupBusy: boolean;
  cleanupButtonRef: Ref<HTMLButtonElement>;
  cleanupPhase: "idle" | "preparing" | "calculating" | "preview";
  canCleanUp: boolean;
  onCleanUp: () => void;
  onApplyCleanup: () => void;
  onCancelCleanup: () => void;
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
      <span />
      <button ref={cleanupButtonRef} disabled={!canCleanUp} onClick={onCleanUp}>Clean up</button>
      {cleanupPhase !== "idle" && <>
        <span className="cleanup-status" role="status" aria-live="polite">
          {cleanupPhase === "preview" ? "Preview cleanup" : "Arranging…"}
        </span>
        {cleanupPhase === "preview" && <button className="primary" disabled={cleanupBusy} onClick={onApplyCleanup}>Apply</button>}
        <button disabled={cleanupBusy && cleanupPhase === "preview"} onClick={onCancelCleanup}>Cancel</button>
      </>}
    </div>
  );
}
