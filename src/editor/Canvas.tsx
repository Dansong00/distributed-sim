import { ConnectorPreferencesContext } from "./connector-preferences";
import {
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStoreApi,
  type NodeChange,
} from "@xyflow/react";
import type { Diagram, DiagramNode, Point, Selection } from "../domain/model";
import type { HistoryAction } from "../domain/history";
import { createComponent } from "../domain/catalog";
import {
  deleteSelection,
  duplicateSelection,
  moveSelection,
  reparentMoved,
  resizeContainer,
} from "../domain/operations";
import { toFlowEdges, toFlowNodes } from "./flow-adapter";
import { ComponentNode, ContainerNode, StickyNode, TextNode } from "./nodes";
import { ConnectionPreview, DiagramConnection } from "./edges";
import { resizeSticky } from "./sticky-sizing";
import { isEditing } from "./shortcuts";
const nodeTypes = {
  component: ComponentNode,
  container: ContainerNode,
  sticky: StickyNode,
  text: TextNode,
};
const edgeTypes = { diagram: DiagramConnection };
export type CanvasHandle = { add: (id: string) => void; fit: () => void };
export type CanvasProps = {
  document: Diagram;
  fitOnMount?: boolean;
  selection: Selection;
  tool: "select" | "pan";
  onSelectionChange: (selection: Selection) => void;
  dispatch: (action: HistoryAction) => boolean;
  ref?: Ref<CanvasHandle>;
};
function Editor({
  document,
  fitOnMount = false,
  selection,
  tool,
  onSelectionChange: notifySelection,
  dispatch,
  ref,
}: CanvasProps) {
  const connectorPreferences = useContext(ConnectorPreferencesContext);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const onSelectionChange = (next: Selection) => {
    selectionRef.current = next;
    notifySelection(next);
  };
  const flow = useReactFlow();
  const store = useStoreApi();
  const wrapper = useRef<HTMLDivElement>(null);
  const latest = useRef(document);
  latest.current = document;
  const dragOrigin = useRef<{
    document: Diagram;
    rootId: string;
    position: Point;
    selection: Selection;
  } | null>(null);
  const resizeAnchor = useRef<{ id: string; right?: number; bottom?: number } | null>(null);
  const [space, setSpace] = useState(false);
  const transact = (next: Diagram) => {
    if (!dispatch({ type: "preview", document: next })) return false;
    dispatch({ type: "commit" });
    return true;
  };
  const add = (id: string, point?: Point) => {
    const bounds = wrapper.current!.getBoundingClientRect();
    const position =
      point ??
      flow.screenToFlowPosition({
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      });
    let node: DiagramNode;
    if (id === "sticky" || id === "text" || id === "container")
      node = {
        id: crypto.randomUUID(),
        kind: id,
        position,
        width: id === "container" ? 640 : 240,
        height: id === "container" ? 400 : id === "sticky" ? 160 : 80,
        name:
          id === "container"
            ? "Boundary"
            : id === "sticky"
              ? "Sticky note"
              : "Text",
        notes: "",
        description: "",
        color: id === "sticky" ? "yellow" : undefined,
      };
    else node = createComponent(id, position);
    if (!point)
      node.position = {
        x: position.x - node.width / 2,
        y: position.y - node.height / 2,
      };
    const next = reparentMoved(
      { ...document, nodes: [...document.nodes, node] },
      [node.id],
    );
    if (!transact(next)) return;
    onSelectionChange({ nodeIds: [node.id], edgeIds: [] });
  };
  useImperativeHandle(ref, () => ({
    add,
    fit: () => void flow.fitView({ padding: 0.17 }),
  }));
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (
        isEditing(event.target) ||
        (event.target instanceof Element && event.target.closest("dialog"))
      )
        return;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (key === " ") {
        event.preventDefault();
        setSpace(true);
        return;
      }
      if (mod && ["a", "d", "z", "y"].includes(key)) {
        event.preventDefault();
        if (key === "a")
          onSelectionChange({
            nodeIds: document.nodes.map((n) => n.id),
            edgeIds: document.edges.map((e) => e.id),
          });
        if (key === "d") {
          const result = duplicateSelection(document, selection);
          if (transact(result.document)) onSelectionChange(result.selection);
        }
        if (key === "z") dispatch({ type: event.shiftKey ? "redo" : "undo" });
        if (key === "y") dispatch({ type: "redo" });
      } else if (key === "delete" || key === "backspace") {
        event.preventDefault();
        transact(deleteSelection(document, selection));
        onSelectionChange({ nodeIds: [], edgeIds: [] });
      } else if (key === "escape") {
        onSelectionChange({ nodeIds: [], edgeIds: [] });
        store.getState().cancelConnection();
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.key === " ") setSpace(false);
    };
    const blur = () => setSpace(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [document, selection, dispatch, onSelectionChange, flow]);
  const changes = (changes: NodeChange[]) => {
    const selected = changes.filter((c) => c.type === "select");
    if (selected.length) {
      const ids = new Set(selectionRef.current.nodeIds);
      for (const change of selected) {
        if (change.type === "select") {
          if (change.selected) ids.add(change.id);
          else ids.delete(change.id);
        }
      }
      onSelectionChange({ ...selectionRef.current, nodeIds: [...ids] });
    }
    let next = latest.current;
    let changed = false;
    // Treat Flow's resize geometry as a proposal, clamped around container
    // members or the sticky note's text at its proposed width.
    for (const change of changes) {
      if (
        change.type === "dimensions" &&
        change.dimensions &&
        change.resizing !== undefined
      ) {
        const node = next.nodes.find((n) => n.id === change.id);
        if (node?.kind === "container" || node?.kind === "sticky") {
          // The end event repeats Flow's raw dimensions. Keep the last clamped
          // proposal rather than shrinking the opposite side a second time.
          if (change.resizing === false) {
            changed = true;
            continue;
          }
          dispatch({ type: "begin" });
          const position = changes.find(
            (candidate) =>
              candidate.type === "position" && candidate.id === change.id,
          );
          const size = {
            ...change.dimensions,
            position:
              position?.type === "position" ? position.position : undefined,
          };
          next = node.kind === "container"
            ? resizeContainer(next, change.id, size)
            : { ...next, nodes: next.nodes.map(n => n.id === node.id ? resizeSticky(n, size, resizeAnchor.current?.id === n.id ? resizeAnchor.current : undefined) : n) };
          changed = true;
        }
      }
    }
    if (changed) {
      dispatch({ type: "preview", document: next });
      if (changes.some((c) => c.type === "dimensions" && c.resizing === false))
        dispatch({ type: "commit" });
    }
  };
  return (
    <div
      ref={wrapper}
      className="canvas"
      aria-label="Architecture canvas"
      onPointerDownCapture={(event) => {
        const target = event.target as Element;
        const control = target.closest(".react-flow__resize-control");
        const id = control?.closest(".react-flow__node")?.getAttribute("data-id");
        const node = latest.current.nodes.find(n => n.id === id);
        resizeAnchor.current = node && control ? {
          id: node.id,
          right: control.classList.contains("left") ? node.position.x + node.width : undefined,
          bottom: control.classList.contains("top") ? node.position.y + node.height : undefined,
        } : null;
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("application/system-canvas");
        if (id)
          add(id, flow.screenToFlowPosition({ x: e.clientX, y: e.clientY }));
      }}
    >
      <ReactFlow
        nodes={toFlowNodes(document).map((n) => ({
          ...n,
          // Preserve Flow's measured dimensions so controlled rerenders retain
          // its DOM-derived handle bounds (selection, autosave, pan and drag).
          measured: flow.getInternalNode(n.id)?.measured,
          selected: selection.nodeIds.includes(n.id),
        }))}
        edges={toFlowEdges(document).map((e) => ({
          ...e,
          selected: selection.edgeIds.includes(e.id),
        }))}
        nodesDraggable={tool === "select" && !space}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineComponent={ConnectionPreview}
        defaultViewport={document.viewport}
        minZoom={0.2}
        maxZoom={2}
        fitView={fitOnMount}
        fitViewOptions={{ padding: 0.17 }}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        selectionOnDrag={tool === "select" && !space}
        panOnDrag={tool === "pan" || space ? true : [1]}
        panActivationKeyCode="Space"
        selectionKeyCode={null}
        onNodesChange={changes}
        onEdgesChange={(changes) => {
          if (!changes.some((change) => change.type === "select")) return;
          const ids = new Set(selectionRef.current.edgeIds);
          for (const change of changes) {
            if (change.type === "select") {
              if (change.selected) ids.add(change.id);
              else ids.delete(change.id);
            }
          }
          onSelectionChange({ ...selectionRef.current, edgeIds: [...ids] });
        }}
        onNodeDragStart={(_, node) => {
          const selected = selection.nodeIds.includes(node.id)
            ? selection
            : { nodeIds: [node.id], edgeIds: [] };
          const root = document.nodes.find(n => n.id === node.parentId && selected.nodeIds.includes(n.id)) ?? node;
          dragOrigin.current = {
            document,
            rootId: root.id,
            position: root.position,
            selection: selected,
          };
          dispatch({ type: "begin" });
        }}
        onNodeDrag={(_, node, nodes) => {
          const origin = dragOrigin.current;
          if (origin) {
            const moving = nodes.find(n => n.id === origin.rootId) ?? (node.id === origin.rootId ? node : flow.getNode(origin.rootId));
            if (!moving) return;
            const next = moveSelection(origin.document, origin.selection, {
              x: moving.position.x - origin.position.x,
              y: moving.position.y - origin.position.y,
            });
            next.viewport = flow.getViewport();
            dispatch({ type: "preview", document: next });
          }
        }}
        onNodeDragStop={() => {
          const origin = dragOrigin.current;
          if (origin) {
            dispatch({
              type: "preview",
              document: reparentMoved(
                latest.current,
                origin.selection.nodeIds.filter(
                  (id) =>
                    !origin.selection.nodeIds.includes(
                      latest.current.nodes.find((n) => n.id === id)?.parentId ??
                        "",
                    ),
                ),
              ),
            });
            dispatch({ type: "commit" });
            dragOrigin.current = null;
          }
        }}
        onConnect={(connection) => {
          if (!connection.source || !connection.target) return;
          if (
            ![connection.source, connection.target].every(
              (id) =>
                ["component", "sticky"].includes(document.nodes.find((n) => n.id === id)?.kind ?? ""),
            )
          )
            return;
          const edge = {
            id: crypto.randomUUID(),
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle ?? "right",
            targetHandle: connection.targetHandle ?? "left",
            label: "",
            ...connectorPreferences,
          };
          if (!transact({ ...document, edges: [...document.edges, edge] })) return;
          onSelectionChange({ nodeIds: [], edgeIds: [edge.id] });
        }}
        onMove={(_, viewport) => {
          if (dispatch({ type: "viewport", viewport }))
            latest.current = { ...latest.current, viewport };
          else void flow.setViewport(latest.current.viewport);
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#ced6e2"
        />
        <Controls showInteractive={false} />
        {!document.nodes.length && (
          <div className="empty-canvas">
            Start with a component.
            <small>Click a building block or drag one onto the canvas.</small>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}
export function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <Editor {...props} />
    </ReactFlowProvider>
  );
}
