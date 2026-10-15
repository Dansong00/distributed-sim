import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";
import type { Diagram, DiagramEdge, Point } from "../domain/model";
export function edgeRoute(
  edge: DiagramEdge,
  doc: Diagram,
  endpoints: { source: Point; target: Point },
): { path: string; label: Point } {
  const { source: s, target: t } = endpoints;
  const peers = doc.edges.filter(
    (e) =>
      (e.source === edge.source && e.target === edge.target) ||
      (e.source === edge.target && e.target === edge.source),
  );
  const index = Math.max(
    0,
    peers.findIndex((e) => e.id === edge.id),
  );
  if (edge.source === edge.target) {
    const r = 65 + index * 28;
    return {
      path: `M ${s.x} ${s.y} C ${s.x + r} ${s.y - r * 2}, ${t.x - r} ${t.y - r * 2}, ${t.x} ${t.y}`,
      label: { x: (s.x + t.x) / 2, y: Math.min(s.y, t.y) - r * 1.5 },
    };
  }
  const offset = (index - (peers.length - 1) / 2) * 42;
  const sign = edge.source < edge.target ? 1 : -1,
    dx = (t.x - s.x) * sign,
    dy = (t.y - s.y) * sign,
    length = Math.hypot(dx, dy) || 1;
  const c = {
    x: (s.x + t.x) / 2 - (dy / length) * offset,
    y: (s.y + t.y) / 2 + (dx / length) * offset,
  };
  return {
    path: `M ${s.x} ${s.y} Q ${c.x} ${c.y}, ${t.x} ${t.y}`,
    label: { x: (s.x + t.x + 2 * c.x) / 4, y: (s.y + t.y + 2 * c.y) / 4 },
  };
}
export function DiagramConnection(props: EdgeProps) {
  const data = props.data as { edge: DiagramEdge; document: Diagram };
  const route = edgeRoute(data.edge, data.document, {
    source: { x: props.sourceX, y: props.sourceY },
    target: { x: props.targetX, y: props.targetY },
  });
  return (
    <>
      <BaseEdge
        id={props.id}
        path={route.path}
        markerEnd={props.markerEnd}
        markerStart={props.markerStart}
        style={props.style}
      />
      {data.edge.label && (
        <EdgeLabelRenderer>
          <span
            className="edge-label react-flow__edge-text"
            style={{
              transform: `translate(-50%, -50%) translate(${route.label.x}px,${route.label.y}px)`,
            }}
          >
            {data.edge.label}
          </span>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
