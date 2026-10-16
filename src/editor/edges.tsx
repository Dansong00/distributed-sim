import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
  type ConnectionLineComponentProps,
  type EdgeProps,
} from "@xyflow/react";
import type { Diagram, DiagramEdge, Point } from "../domain/model";
const directions: Record<string, Point> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

/** Keep labels halfway along the route, independent of its stroke. */
function polyline(points: Point[], rounded = false): { path: string; label: Point } {
  const ps = points.filter((p, i) => !i || p.x !== points[i - 1].x || p.y !== points[i - 1].y);
  const lengths = ps.slice(1).map((p, i) => Math.hypot(p.x - ps[i].x, p.y - ps[i].y));
  let remaining = lengths.reduce((sum, n) => sum + n, 0) / 2;
  let label = ps[0];
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const ratio = lengths[i] ? remaining / lengths[i] : 0;
      label = {
        x: ps[i].x + (ps[i + 1].x - ps[i].x) * ratio,
        y: ps[i].y + (ps[i + 1].y - ps[i].y) * ratio,
      };
      break;
    }
    remaining -= lengths[i];
  }
  let path = `M ${ps[0].x} ${ps[0].y}`;
  for (let i = 1; i < ps.length; i++) {
    const p = ps[i], prev = ps[i - 1], next = ps[i + 1];
    if (rounded && next) {
      const before = Math.hypot(p.x - prev.x, p.y - prev.y), after = Math.hypot(next.x - p.x, next.y - p.y);
      const r = Math.min(14, before / 2, after / 2);
      path += ` L ${p.x + (prev.x - p.x) * r / before} ${p.y + (prev.y - p.y) * r / before} Q ${p.x} ${p.y} ${p.x + (next.x - p.x) * r / after} ${p.y + (next.y - p.y) * r / after}`;
    } else path += ` L ${p.x} ${p.y}`;
  }
  return { path, label };
}

export function edgeRoute(
  edge: DiagramEdge,
  doc: Pick<Diagram, "nodes" | "edges">,
  endpoints: { source: Point; target: Point },
): { path: string; label: Point } {
  const { source: s, target: t } = endpoints;
  const peers = doc.edges.filter(e =>
    (e.source === edge.source && e.target === edge.target) ||
    (e.source === edge.target && e.target === edge.source));
  const index = Math.max(0, peers.findIndex(e => e.id === edge.id));
  const shape = edge.path ?? "elbow";
  const sv = directions[edge.sourceHandle], tv = directions[edge.targetHandle];
  if (edge.source === edge.target) {
    const node = doc.nodes.find(n => n.id === edge.source);
    const width = node?.width ?? 180, height = node?.height ?? 100;
    const left = s.x - (sv.x === 1 ? width : sv.x === -1 ? 0 : width / 2);
    const top = s.y - (sv.y === 1 ? height : sv.y === -1 ? 0 : height / 2);
    const gap = 40 + index * 28;
    const bounds = {
      left: Math.min(left, t.x) - gap,
      right: Math.max(left + width, t.x) + gap,
      top: Math.min(top, t.y) - gap,
      bottom: Math.max(top + height, t.y) + gap,
    };
    const outer = (p: Point, side: string): Point =>
      side === "left" || side === "right"
        ? { x: bounds[side], y: p.y }
        : { x: p.x, y: bounds[side as "top" | "bottom"] };
    const sides = ["right", "top", "left", "bottom"];
    const corners = [
      { x: bounds.right, y: bounds.top },
      { x: bounds.left, y: bounds.top },
      { x: bounds.left, y: bounds.bottom },
      { x: bounds.right, y: bounds.bottom },
    ];
    const start = sides.indexOf(edge.sourceHandle), end = sides.indexOf(edge.targetHandle);
    const turns = (end - start + 4) % 4 || 4;
    return polyline([
      s,
      outer(s, edge.sourceHandle),
      ...Array.from({ length: turns }, (_, i) => corners[(start + i) % 4]),
      outer(t, edge.targetHandle),
      t,
    ], shape === "curved");
  }
  if (shape === "straight") return polyline([s, t]);
  if (shape === "curved") {
    const offset = (index - (peers.length - 1) / 2) * 42 || 20;
    const sign = edge.source < edge.target ? 1 : -1;
    const dx = (t.x - s.x) * sign, dy = (t.y - s.y) * sign, length = Math.hypot(dx, dy) || 1;
    const c = { x: (s.x + t.x) / 2 - dy / length * offset, y: (s.y + t.y) / 2 + dx / length * offset };
    return {
      path: `M ${s.x} ${s.y} Q ${c.x} ${c.y}, ${t.x} ${t.y}`,
      label: { x: (s.x + t.x + 2 * c.x) / 4, y: (s.y + t.y + 2 * c.y) / 4 },
    };
  }
  const horizontal = Boolean(sv.x), targetHorizontal = Boolean(tv.x);
  const facing = sv.x === -tv.x && sv.y === -tv.y;
  const forward = (t.x - s.x) * sv.x + (t.y - s.y) * sv.y > 0;
  const aligned = horizontal ? s.y === t.y : s.x === t.x;
  if (peers.length <= 1 && aligned && facing && forward) return polyline([s, t]);
  const gap = 24 + index * 18;
  if (horizontal !== targetHorizontal) {
    const x = horizontal ? (sv.x > 0 ? Math.max(s.x, t.x) + gap : Math.min(s.x, t.x) - gap) : (tv.x > 0 ? Math.max(s.x, t.x) + gap : Math.min(s.x, t.x) - gap);
    const y = horizontal ? (tv.y > 0 ? Math.max(s.y, t.y) + gap : Math.min(s.y, t.y) - gap) : (sv.y > 0 ? Math.max(s.y, t.y) + gap : Math.min(s.y, t.y) - gap);
    return polyline(horizontal ? [s, { x, y: s.y }, { x, y }, { x: t.x, y }, t] : [s, { x: s.x, y }, { x, y }, { x, y: t.y }, t]);
  }
  // XYFlow handles the ordinary orthogonal cases. A shared outer lane keeps
  // aligned peers separate and handles very close/backwards endpoints safely.
  if (!aligned && peers.length <= 1 && (!facing || forward)) {
    const [path, x, y] = getSmoothStepPath({
      sourceX: s.x, sourceY: s.y,
      targetX: t.x, targetY: t.y,
      sourcePosition: edge.sourceHandle as Position,
      targetPosition: edge.targetHandle as Position,
      borderRadius: 0,
      offset: gap,
    });
    return { path, label: { x, y } };
  }
  const a = { x: s.x + sv.x * gap, y: s.y + sv.y * gap };
  const b = { x: t.x + tv.x * gap, y: t.y + tv.y * gap };
  const lane = horizontal ? Math.min(s.y, t.y) - gap : Math.min(s.x, t.x) - gap;
  return polyline(horizontal ? [s, a, { x: a.x, y: lane }, { x: b.x, y: lane }, b, t] : [s, a, { x: lane, y: a.y }, { x: lane, y: b.y }, b, t]);
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
        style={{
          ...props.style,
          stroke: props.selected ? "#6573df" : "#8090a5",
          strokeWidth: props.selected ? 2.5 : 1.5,
          strokeDasharray: data.edge.stroke === "dashed"
            ? "8 5" : data.edge.stroke === "dotted" ? "1 6" : undefined,
          strokeLinecap: data.edge.stroke === "dotted" ? "round" : "butt",
        }}
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

export function ConnectionPreview(props: ConnectionLineComponentProps) {
  const edge: DiagramEdge = {
    id: "preview",
    source: props.fromNode.id,
    target: props.toNode?.id ?? "preview-target",
    sourceHandle: props.fromHandle.id ?? props.fromPosition,
    targetHandle: props.toHandle?.id ?? props.toPosition,
    label: "",
    direction: "one-way",
    stroke: "solid",
    path: "elbow",
  };
  const route = edgeRoute(edge, { nodes: [props.fromNode.data.element as Diagram["nodes"][number]], edges: [edge] }, {
    source: { x: props.fromX, y: props.fromY }, target: { x: props.toX, y: props.toY },
  });
  return <path className="react-flow__connection-path" d={route.path} fill="none" stroke="#8090a5" strokeWidth={1.5} />;
}
