export type Point = { x: number; y: number };
export type Viewport = Point & { zoom: number };
export type ElementKind = "component" | "sticky" | "text" | "container";
export type DiagramNode = {
  id: string;
  kind: ElementKind;
  position: Point;
  width: number;
  height: number;
  parentId?: string;
  name: string;
  notes: string;
  description: string;
  componentType?: string;
  category?: string;
  technology?: string;
  color?: string;
};
export type DiagramEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  label: string;
  direction: "one-way" | "both";
};
export type Diagram = {
  schemaVersion: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport: Viewport;
};
export type StoredDiagram = { document: Diagram; revision: number };
export type Selection = { nodeIds: string[]; edgeIds: string[] };
