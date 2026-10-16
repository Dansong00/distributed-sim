import { useContext, useId } from "react";
import { ConnectorPreferencesContext } from "./connector-preferences";
import {
  BaseEdge,
  useStore,
  EdgeLabelRenderer,
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

/** Keep labels near halfway along the rendered route, independent of stroke. */
function polyline(points: Point[], radius = 0): { path: string; label: Point } {
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
    if (radius && next) {
      const before = Math.hypot(p.x - prev.x, p.y - prev.y), after = Math.hypot(next.x - p.x, next.y - p.y);
      const r = Math.min(radius, before / 2, after / 2);
      // A label at a trimmed corner moves onto the quadratic itself.
      if (Math.hypot(label.x - p.x, label.y - p.y) < r) {
        label = { x: p.x + (prev.x - p.x) * r / before / 4 + (next.x - p.x) * r / after / 4,
          y: p.y + (prev.y - p.y) * r / before / 4 + (next.y - p.y) * r / after / 4 };
      }
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
    const forwardTurns = (end - start + 4) % 4 || 4;
    const backwardTurns = (start - end + 4) % 4 || 4;
    const step = backwardTurns < forwardTurns ? -1 : 1;
    const turns = Math.min(forwardTurns, backwardTurns);
    return polyline([
      s,
      outer(s, edge.sourceHandle),
      ...Array.from({ length: turns }, (_, i) => corners[(start + (step === 1 ? i : -i - 1) + 8) % 4]),
      outer(t, edge.targetHandle),
      t,
    ], shape === "straight" ? 0 : 14);
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
  // Try a bounded set of one-turn, dogleg, and outside-lane routes. Reject
  // reversals and crossings before choosing the shortest handle-safe route.
  const xs = [s.x, t.x, (s.x + t.x) / 2, Math.min(s.x, t.x) - gap, Math.max(s.x, t.x) + gap];
  const ys = [s.y, t.y, (s.y + t.y) / 2, Math.min(s.y, t.y) - gap, Math.max(s.y, t.y) + gap];
  const candidates: Point[][] = [];
  if (peers.length <= 1) {
    candidates.push([s, { x: t.x, y: s.y }, t], [s, { x: s.x, y: t.y }, t]);
    for (const x of xs) candidates.push([s, { x, y: s.y }, { x, y: t.y }, t]);
    for (const y of ys) candidates.push([s, { x: s.x, y }, { x: t.x, y }, t]);
  }
  const stub = facing && forward ? Math.min(gap, Math.abs(horizontal ? t.x - s.x : t.y - s.y) / 3) : gap;
  // Perpendicular peers need distinct stubs even when many lanes share a tiny gap.
  const adaptiveStub = (distance: number) => distance > 0 ? gap * distance / (distance + 3 * gap) : gap;
  const sourceStub = !facing ? adaptiveStub((t.x-s.x)*sv.x + (t.y-s.y)*sv.y) : stub;
  const targetStub = !facing ? adaptiveStub((s.x-t.x)*tv.x + (s.y-t.y)*tv.y) : stub;
  const a = { x: s.x + sv.x * sourceStub, y: s.y + sv.y * sourceStub };
  const b = { x: t.x + tv.x * targetStub, y: t.y + tv.y * targetStub };
  if (horizontal !== targetHorizontal) {
    for (const x of (peers.length > 1 ? [a.x, b.x, ...xs.slice(3)] : xs)) for (const y of (peers.length > 1 ? [a.y, b.y, ...ys.slice(3)] : ys)) candidates.push(horizontal
      ? [s, { x, y: s.y }, { x, y }, { x: t.x, y }, t]
      : [s, { x: s.x, y }, { x, y }, { x, y: t.y }, t]);
  } else {
    const lanes = horizontal ? ys.slice(3) : xs.slice(3);
    for (const lane of lanes) candidates.push(horizontal
      ? [s, a, { x: a.x, y: lane }, { x: b.x, y: lane }, b, t]
      : [s, a, { x: lane, y: a.y }, { x: lane, y: b.y }, b, t]);
  }
  const valid = candidates.map(ps => ps.filter((p, i) => !i || p.x !== ps[i - 1].x || p.y !== ps[i - 1].y)).filter(ps => {
    if (ps.length < 2 || (peers.length > 1 && horizontal !== targetHorizontal && ps.length < 5)) return false;
    const first = ps[1], last = ps[ps.length - 2];
    if ((first.x - s.x) * sv.x + (first.y - s.y) * sv.y <= 0 ||
        (last.x - t.x) * tv.x + (last.y - t.y) * tv.y <= 0) return false;
    if ((sv.x ? first.y !== s.y : first.x !== s.x) || (tv.x ? last.y !== t.y : last.x !== t.x)) return false;
    for (let i = 1; i < ps.length - 1; i++) {
      const p = ps[i - 1], q = ps[i], r = ps[i + 1];
      if ((q.x - p.x) * (r.x - q.x) + (q.y - p.y) * (r.y - q.y) < 0) return false;
    }
    for (let i = 0; i < ps.length - 1; i++) for (let j = i + 2; j < ps.length - 1; j++) {
      if (i === 0 && j === ps.length - 2 && s.x === t.x && s.y === t.y) continue;
      const p = ps[i], q = ps[i + 1], r = ps[j], u = ps[j + 1];
      if (Math.max(Math.min(p.x,q.x), Math.min(r.x,u.x)) <= Math.min(Math.max(p.x,q.x), Math.max(r.x,u.x)) &&
          Math.max(Math.min(p.y,q.y), Math.min(r.y,u.y)) <= Math.min(Math.max(p.y,q.y), Math.max(r.y,u.y))) return false;
    }
    return true;
  });
  const length = (ps: Point[]) => ps.slice(1).reduce((n, p, i) => n + Math.hypot(p.x - ps[i].x, p.y - ps[i].y), 0);
  valid.sort((a, b) => length(a) - length(b) || a.length - b.length);
  return polyline(valid[0] ?? [s, a, { x: a.x, y: b.y }, b, t], 14);
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
  const preferences = useContext(ConnectorPreferencesContext);
  const markerId = useId().replace(/:/g, "");
  const existing = useStore(state => state.edges);
  const edge: DiagramEdge = {
    id: "preview",
    source: props.fromNode.id,
    target: props.toNode?.id ?? "preview-target",
    sourceHandle: props.fromHandle.id ?? props.fromPosition,
    targetHandle: props.toHandle?.id ?? props.toPosition,
    label: "",
    ...preferences,
  };
  const route = edgeRoute(edge, { nodes: [props.fromNode.data.element as Diagram["nodes"][number]], edges: [...existing.map(e => (e.data as { edge: DiagramEdge }).edge), edge] }, {
    // React Flow previews use handle centers, while finished edges use their outer tips.
    source: { x: props.fromX + directions[edge.sourceHandle].x * props.fromHandle.width / 2, y: props.fromY + directions[edge.sourceHandle].y * props.fromHandle.height / 2 },
    target: { x: props.toX + directions[edge.targetHandle].x * (props.toHandle?.width ?? 0) / 2, y: props.toY + directions[edge.targetHandle].y * (props.toHandle?.height ?? 0) / 2 },
  });
  return <>
    <defs><marker id={markerId} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8090a5" /></marker></defs>
    <path className="react-flow__connection-path" d={route.path} fill="none" stroke="#8090a5" strokeWidth={1.5}
      strokeDasharray={edge.stroke === "dashed" ? "8 5" : edge.stroke === "dotted" ? "1 6" : undefined}
      strokeLinecap={edge.stroke === "dotted" ? "round" : "butt"}
      markerEnd={`url(#${markerId})`} markerStart={edge.direction === "both" ? `url(#${markerId})` : undefined} />
  </>;
}
