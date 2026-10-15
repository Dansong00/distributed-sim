import { describe, it, expect } from "vitest";
import { edgeRoute } from "./edges";
import { createDiagram } from "../domain/templates";
import type { DiagramEdge } from "../domain/model";
const edge: DiagramEdge = {
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
    expect(first.path).toContain("C");
    expect(first.label.y).toBeLessThan(0);
    expect(second.label.y).toBeLessThan(first.label.y);
    expect(first.path).not.toContain("NaN");
  });
});
