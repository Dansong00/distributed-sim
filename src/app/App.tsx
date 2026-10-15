import { useReducer, useRef, useState } from "react";
import { Boxes } from "lucide-react";
import { createDiagram } from "../domain/templates";
import { createHistory, historyReducer } from "../domain/history";
import type { Selection } from "../domain/model";
import { deleteSelection, duplicateSelection } from "../domain/operations";
import { Canvas, type CanvasHandle } from "../editor/Canvas";
import { Palette } from "../editor/Palette";
import { Inspector } from "../editor/Inspector";
import { Toolbar } from "../editor/Toolbar";
export function App() {
  const [history, dispatch] = useReducer(historyReducer, undefined, () =>
    createHistory(createDiagram("notes", "Note-Taking App")),
  );
  const document = history.present;
  const [selection, setSelection] = useState<Selection>({
    nodeIds: [],
    edgeIds: [],
  });
  const [tool, setTool] = useState<"select" | "pan">("select");
  const canvas = useRef<CanvasHandle>(null);
  const remove = () => {
    dispatch({
      type: "preview",
      document: deleteSelection(document, selection),
    });
    dispatch({ type: "commit" });
    setSelection({ nodeIds: [], edgeIds: [] });
  };
  const duplicate = () => {
    const result = duplicateSelection(document, selection);
    dispatch({ type: "preview", document: result.document });
    dispatch({ type: "commit" });
    setSelection(result.selection);
  };
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="System Canvas home">
          <span>
            <Boxes size={22} />
          </span>
          System Canvas
        </a>
        <div className="header-divider" />
        <span className="document-title">{document.name}</span>
        <span className="header-caption">Architecture workspace</span>
      </header>
      <div className="workspace">
        <Palette onAdd={(id) => canvas.current?.add(id)} />
        <main>
          <div className="canvas-heading">
            <div>
              <span className="eyebrow">YOUR ARCHITECTURE WORKSPACE</span>
              <h2>A little app, a clear picture.</h2>
              <p>Build a system. Make the connections explicit.</p>
            </div>
          </div>
          <Toolbar
            tool={tool}
            onTool={setTool}
            undo={() => dispatch({ type: "undo" })}
            redo={() => dispatch({ type: "redo" })}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            onDelete={remove}
            onDuplicate={duplicate}
          />
          <Canvas
            ref={canvas}
            document={document}
            selection={selection}
            tool={tool}
            onSelectionChange={setSelection}
            dispatch={dispatch}
          />
          <div className="canvas-footer">
            <span>Shift to select · Space to pan · ⌘ / Ctrl Z to undo</span>
            <span>
              {document.nodes.length} elements · {document.edges.length}{" "}
              connections
            </span>
          </div>
        </main>
        <Inspector
          document={document}
          selection={selection}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}
