import { describe, it, expect } from "vitest";
import { edgeRoute } from "./edges";
import { createDiagram } from "../domain/templates";
import type { DiagramEdge } from "../domain/model";
const edge: DiagramEdge = {
  path: "curved",
  id: "a",
  source: "x",
  target: "y",
  sourceHandle: "right",
  targetHandle: "left",
  label: "",
  direction: "one-way",
};
const endpoints = { source: { x: 0, y: 0 }, target: { x: 100, y: 0 } };
describe("edgeRoute", () => {
  it.each([
    { source: { x: 0, y: 0 }, target: { x: 200, y: 0 } },
    { source: { x: 0, y: 0 }, target: { x: 0, y: 200 } },
  ])("gives a singleton aligned link a modest visible curve: %o", (points) => {
    const doc = createDiagram("blank", "Test");
    doc.edges = [edge];
    const route = edgeRoute(edge, doc, points);
    const midpoint = { x: (points.source.x + points.target.x) / 2, y: (points.source.y + points.target.y) / 2 };
    const bend = Math.hypot(route.label.x - midpoint.x, route.label.y - midpoint.y);
    expect(bend).toBeGreaterThanOrEqual(6);
    expect(bend).toBeLessThanOrEqual(15);
  });
  it("separates parallel and reverse edges spatially", () => {
    const doc = createDiagram("blank", "Test");
    const reverse = { ...edge, id: "b", source: "y", target: "x" };
    const parallel = { ...edge, id: "c" };
    doc.edges = [edge, reverse, parallel];
    const routes = [
      edgeRoute(edge, doc, endpoints),
      edgeRoute(reverse, doc, {
        source: endpoints.target,
        target: endpoints.source,
      }),
      edgeRoute(parallel, doc, endpoints),
    ];
    expect(new Set(routes.map((route) => route.label.y)).size).toBe(3);
    expect(new Set(routes.map((route) => route.path)).size).toBe(3);
  });
  it("self-links form nonzero loops with distinct radii", () => {
    const doc = createDiagram("blank", "Test");
    const a = { ...edge, target: "x" };
    const b = { ...a, id: "b" };
    doc.edges = [a, b];
    const points = { source: endpoints.source, target: endpoints.source };
    const first = edgeRoute(a, doc, points);
    const second = edgeRoute(b, doc, points);
    expect(first.path).toMatch(/[CQ]/);
    expect(first.label.y).toBeLessThan(0);
    expect(second.label.y).toBeLessThan(first.label.y);
    expect(first.path).not.toContain("NaN");
  });
});


describe("connector path choices", () => {
  const doc = createDiagram("blank", "Routes");
  const route = (changes: Partial<DiagramEdge>, points = endpoints) => {
    const e = { ...edge, path: "elbow" as const, ...changes };
    return edgeRoute(e, { ...doc, edges: [e] }, points);
  };
  const vertices = routeVertices;
  it("defaults legacy connections to a direct elbow between aligned facing handles", () => {
    expect(route({ path: undefined }).path).toBe("M 0 0 L 100 0");
  });
  it("straight paths remain direct even with parallel and reverse peers", () => {
    const a = { ...edge, path: "straight" as const }, b = { ...a, id: "b" };
    const d = { ...doc, edges: [a, b] };
    expect(edgeRoute(a, d, endpoints).path).toBe("M 0 0 L 100 0");
    expect(edgeRoute(b, d, endpoints).path).toBe("M 0 0 L 100 0");
  });
  const handles = ["top", "right", "bottom", "left"];
  const vectors: Record<string, { x: number; y: number }> = { top: { x: 0, y: -1 }, right: { x: 1, y: 0 }, bottom: { x: 0, y: 1 }, left: { x: -1, y: 0 } };
  for (const sourceHandle of handles) for (const targetHandle of handles) {
    it(`routes rounded orthogonal segments naturally from ${sourceHandle} to ${targetHandle}`, () => {
      for (const target of [{ x: 160, y: 90 }, { x: -80, y: -70 }, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 100 }, { x: 100, y: 0 }, { x: -1, y: 0 }]) {
        const r = route({ sourceHandle, targetHandle }, { source: endpoints.source, target });
        expect(r.path).not.toMatch(/C|NaN|Infinity/);

        const ps = vertices(r.path);
        expect(ps[0]).toEqual(endpoints.source);
        expect(ps.at(-1)).toEqual(target);
        for (let i = 1; i < ps.length; i++) expect(ps[i].x === ps[i - 1].x || ps[i].y === ps[i - 1].y).toBe(true);
        const corners = ps.filter((p, i) => !i || (p.x !== ps[i-1].x || p.y !== ps[i-1].y)).filter((p, i, a) => !i || i === a.length-1 || !((a[i-1].x === p.x && p.x === a[i+1].x) || (a[i-1].y === p.y && p.y === a[i+1].y)));
        if (target.x || target.y) for (let i = 0; i < corners.length - 1; i++) for (let j = i + 2; j < corners.length - 1; j++) {
          const a = corners[i], b = corners[i+1], c = corners[j], d = corners[j+1];
          expect(Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x)) <= Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x)) && Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y)) <= Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y))).toBe(false);
        }
        const first = { x: ps[1].x - ps[0].x, y: ps[1].y - ps[0].y };
        const last = { x: ps.at(-2)!.x - target.x, y: ps.at(-2)!.y - target.y };
        expect(first.x * vectors[sourceHandle].x + first.y * vectors[sourceHandle].y).toBeGreaterThan(0);
        expect(last.x * vectors[targetHandle].x + last.y * vectors[targetHandle].y).toBeGreaterThan(0);
      }
    });
  }
  it.each(["elbow", "curved"] as const)("separates aligned parallel and reverse %s routes", path => {
    const a = { ...edge, path }, b = { ...a, id: "b" }, c = { ...a, id: "c", source: "y", target: "x", sourceHandle: "left", targetHandle: "right" };
    const d = { ...doc, edges: [a, b, c] };
    const routes = [edgeRoute(a, d, endpoints), edgeRoute(b, d, endpoints), edgeRoute(c, d, { source: endpoints.target, target: endpoints.source })];
    expect(new Set(routes.map(r => JSON.stringify(r.label))).size).toBe(3);
  });
  it.each(["straight", "elbow", "curved"] as const)("keeps %s self-loops visible for every handle pair", path => {
    for (const sourceHandle of handles) for (const targetHandle of handles) {
      const r = route({ target: "x", path, sourceHandle, targetHandle }, { source: endpoints.source, target: endpoints.source });
      expect(r.path).not.toMatch(/NaN|Infinity/);
      expect(r.path).toMatch(path === "curved" ? /[CQ]/ : /L/);
      expect(Math.hypot(r.label.x, r.label.y)).toBeGreaterThan(20);
    }
  });
});

it("keeps every curved peer visibly bent, including the center of an odd batch", () => {
  const d = createDiagram("blank", "Curved peers");
  d.edges = Array.from({ length: 3 }, (_, i) => ({ ...edge, id: String(i), path: "curved" }));
  for (const e of d.edges) expect(edgeRoute(e, d, endpoints).label.y).not.toBe(0);
});

it("self-loop segments stay outside the card for every real handle pair", () => {
  const d = createDiagram("web", "Self loops");
  const n = d.nodes[0];
  const left = n.position.x, top = n.position.y, right = left + n.width, bottom = top + n.height;
  const handles = { top: { x: (left + right) / 2, y: top }, right: { x: right, y: (top + bottom) / 2 }, bottom: { x: (left + right) / 2, y: bottom }, left: { x: left, y: (top + bottom) / 2 } };
  for (const path of ["straight", "elbow"] as const) for (const sourceHandle of Object.keys(handles) as (keyof typeof handles)[]) for (const targetHandle of Object.keys(handles) as (keyof typeof handles)[]) {
    const e = { ...edge, path, source: n.id, target: n.id, sourceHandle, targetHandle };
    const r = edgeRoute(e, { ...d, edges: [e] }, { source: handles[sourceHandle], target: handles[targetHandle] });
    const ps = routeVertices(r.path);
    for (let i = 1; i < ps.length; i++) {
      const a = ps[i - 1], b = ps[i];
      const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      expect(middle.x > left && middle.x < right && middle.y > top && middle.y < bottom).toBe(false);
    }
    expect(ps.some((a, i) => {
      const b = ps[i + 1];
      return b && ((a.x === b.x && r.label.x === a.x && r.label.y >= Math.min(a.y,b.y) && r.label.y <= Math.max(a.y,b.y)) || (a.y === b.y && r.label.y === a.y && r.label.x >= Math.min(a.x,b.x) && r.label.x <= Math.max(a.x,b.x)));
    })).toBe(true);
  }
});

// Include quadratic control points: they recover the orthogonal route's corners.
function routeVertices(path: string) {
  return [...path.matchAll(/[MLQ]\s*([\d.e+-]+)[ ,]+([\d.e+-]+)(?:[ ,]+([\d.e+-]+)[ ,]+([\d.e+-]+))?/g)].flatMap(m => [{ x: +m[1], y: +m[2] }, ...(m[3] ? [{ x: +m[3], y: +m[4] }] : [])]);
}

it.each([
  ["bottom", "left", 160, 90],
  ["left", "top", -160, 90],
  ["bottom", "left", 1, 1],
] as const)("uses one adaptive rounded turn from %s to %s", (sourceHandle, targetHandle, x, y) => {
  const e = { ...edge, path: "elbow" as const, sourceHandle, targetHandle };
  const r = edgeRoute(e, { nodes: [], edges: [e] }, { source: { x: 0, y: 0 }, target: { x, y } });
  expect(r.path.match(/Q/g)).toHaveLength(1);
  if (x === 1) expect(r.label).toEqual({ x: .125, y: .875 });
  for (const p of routeVertices(r.path)) {
    expect(p.x).toBeGreaterThanOrEqual(Math.min(0,x));
    expect(p.x).toBeLessThanOrEqual(Math.max(0,x));
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(y);
  }
});

it("takes the short outside corner for a top-to-right self-loop", () => {
  const e = { ...edge, path: "elbow" as const, target: "x", sourceHandle: "top", targetHandle: "right" };
  const r = edgeRoute(e, { nodes: [], edges: [e] }, { source: { x: 90, y: 0 }, target: { x: 180, y: 50 } });
  expect(r.path.match(/Q/g)).toHaveLength(3);
  expect(routeVertices(r.path).every(p => p.x >= 90 && p.y <= 50)).toBe(true);
});

it("keeps perpendicular peers separate", () => {
  const a = { ...edge, path: "elbow" as const, sourceHandle: "bottom" }, b = { ...a, id: "b" };
  const points = { source: { x: 0, y: 0 }, target: { x: 160, y: 90 } };
  expect(edgeRoute(a, { nodes: [], edges: [a,b] }, points).path).not.toBe(edgeRoute(b, { nodes: [], edges: [a,b] }, points).path);

});

it.each([1,20,48])("keeps close aligned facing peers on separate lanes at distance %s", x => {
  const a = { ...edge, path: 'elbow' as const }, b = { ...a, id: 'b' };
  const routes = [a,b].map(e => edgeRoute(e, { nodes: [], edges: [a,b] }, { source: { x: 0, y: 0 }, target: { x, y: 0 } }));
  expect(routes[0].label.y).not.toBe(routes[1].label.y);
  for (const r of routes) expect(Math.abs(r.label.y)).toBeGreaterThan(10);
});

it("places a halfway label on the rounded corner rather than its trimmed vertex", () => {
  const e = { ...edge, path: 'elbow' as const, sourceHandle: 'bottom' };
  const r = edgeRoute(e, { nodes: [], edges: [e] }, { source: { x: 0, y: 0 }, target: { x: 90, y: 90 } });
  // The quadratic joins (0,76) to (14,90), with control (0,90).
  expect(r.label).toEqual({ x: 3.5, y: 86.5 });
});

it("keeps six close perpendicular peers distinct without backtracking", () => {
  const peers = Array.from({length: 6}, (_, i) => ({ ...edge, id: String(i), path: 'elbow' as const, sourceHandle: 'top', targetHandle: 'right' }));
  const routes = peers.map(e => edgeRoute(e, { nodes: [], edges: peers }, { source: { x: 90, y: 0 }, target: { x: -20, y: -100 } }));
  expect(new Set(routes.map(r => r.path)).size).toBe(6);
  for (const r of routes) {
    const ps = routeVertices(r.path);
    for (let i = 1; i < ps.length; i++) {
      expect(ps[i].x).toBeLessThanOrEqual(ps[i-1].x);
      expect(ps[i].y).toBeLessThanOrEqual(ps[i-1].y);
    }
  }
});

it.each(['top','bottom'])("keeps six same-direction %s peers off their endpoint axis", handle => {
  const peers = Array.from({length: 6}, (_, i) => ({ ...edge, id: String(i), path: 'elbow' as const, sourceHandle: handle, targetHandle: handle }));
  for (const y of [-101,101]) {
    const routes = peers.map(e => edgeRoute(e, { nodes: [], edges: peers }, { source: { x: 90, y: 0 }, target: { x: 90, y } }));
    expect(new Set(routes.map(r => r.path)).size).toBe(6);
    for (const r of routes) expect(r.label.x).toBeLessThan(90);
  }
});
