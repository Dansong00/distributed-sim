import { categories, presets } from './catalog';
import type { Diagram, DiagramEdge, DiagramNode, Point } from './model';

export class DocumentValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'DocumentValidationError'; }
}
const fail = (message: string): never => { throw new DocumentValidationError(message); };
function object(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${field} must be an object.`);
  return value as Record<string, unknown>;
}
function string(value: unknown, field: string, max: number, nonempty = false): string {
  if (typeof value !== 'string' || value.length > max || (nonempty && !value.length)) fail(`${field} must be ${nonempty ? 'a nonempty string' : 'text'} of at most ${max} characters.`);
  return value as string;
}
function number(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail(`${field} must be a finite number between ${min} and ${max}.`);
  return value as number;
}
function choice<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (!allowed.includes(value as T)) fail(`${field} must be one of: ${allowed.join(', ')}.`);
  return value as T;
}
function point(value: unknown, field: string): Point {
  const p = object(value, field);
  return { x: number(p.x, `${field}.x`, -1_000_000, 1_000_000), y: number(p.y, `${field}.y`, -1_000_000, 1_000_000) };
}
function array(value: unknown, field: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) fail(`${field} must be an array of at most ${max} items.`);
  return value as unknown[];
}
function timestamp(value: unknown, field: string): string {
  const result = string(value, field, 100, true);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(result) || !Number.isFinite(Date.parse(result))) fail(`${field} must be a valid UTC ISO timestamp.`);
  if (new Date(result).toISOString().slice(0, 19) !== result.slice(0, 19)) fail(`${field} must be a valid calendar date and time.`);
  return result;
}
const componentTypes = [...new Set(presets.map(p => p.componentType))];
const handles = ['top', 'right', 'bottom', 'left'] as const;

/** Reconstruct only portable fields; text is preserved as inert data, never HTML. */
export function validateDiagram(value: unknown): Diagram {
  const d = object(value, 'Document');
  if (d.schemaVersion !== 1) fail('Unsupported schemaVersion. Only version 1 is supported.');
  const nodes = array(d.nodes, 'Elements', 500).map((value, index): DiagramNode => {
    const n = object(value, `Element ${index + 1}`);
    const node: DiagramNode = {
      id: string(n.id, 'Element ID', 200, true),
      kind: choice(n.kind, 'Element kind', ['component', 'sticky', 'text', 'container']),
      position: point(n.position, 'Element position'),
      width: number(n.width, 'Element width', Number.MIN_VALUE, 100_000),
      height: number(n.height, 'Element height', Number.MIN_VALUE, 100_000),
      name: string(n.name, 'Element name', 200), notes: string(n.notes, 'Notes', 10_000),
      description: string(n.description, 'Description', 10_000),
    };
    if (n.parentId !== undefined) node.parentId = string(n.parentId, 'Parent ID', 200, true);
    if (node.kind === 'component') {
      node.componentType = choice(n.componentType, 'Component type', componentTypes);
      node.category = choice(n.category, 'Category', categories);
    }
    if (n.technology !== undefined) node.technology = string(n.technology, 'Technology', 200);
    if (n.color !== undefined) node.color = string(n.color, 'Color', 200);
    return node;
  });
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  if (nodeMap.size !== nodes.length) fail('Element IDs must be unique.');
  for (const node of nodes) {
    if (node.parentId !== undefined) {
      const parent = nodeMap.get(node.parentId);
      if (!parent || parent.kind !== 'container') fail('Every parent must reference an existing container.');
      if (node.kind === 'container') fail('Containers cannot be nested.');
    }
  }
  const edges = array(d.edges, 'Connections', 1000).map((value): DiagramEdge => {
    const e = object(value, 'Connection');
    const edge: DiagramEdge = {
      id: string(e.id, 'Connection ID', 200, true), source: string(e.source, 'Source ID', 200, true),
      target: string(e.target, 'Target ID', 200, true), sourceHandle: choice(e.sourceHandle, 'Source handle', handles),
      targetHandle: choice(e.targetHandle, 'Target handle', handles), label: string(e.label, 'Connection label', 200),
      direction: choice(e.direction, 'Connection direction', ['one-way', 'both']),
    };
    if (e.stroke !== undefined) edge.stroke = choice(e.stroke, 'Connection stroke', ['solid', 'dashed', 'dotted'] as const);
    if (e.path !== undefined) edge.path = choice(e.path, 'Connection path', ['straight', 'curved', 'elbow'] as const);
    if (nodeMap.get(edge.source)?.kind !== 'component' || nodeMap.get(edge.target)?.kind !== 'component') fail('Connection endpoints must reference existing components.');
    return edge;
  });
  if (new Set(edges.map(e => e.id)).size !== edges.length) fail('Connection IDs must be unique.');
  const viewport = object(d.viewport, 'Viewport');
  return {
    schemaVersion: 1, id: string(d.id, 'Document ID', 200, true), name: string(d.name, 'Document name', 200),
    createdAt: timestamp(d.createdAt, 'Created timestamp'), updatedAt: timestamp(d.updatedAt, 'Updated timestamp'),
    nodes, edges, viewport: { ...point(viewport, 'Viewport'), zoom: number(viewport.zoom, 'Zoom', .2, 2) },
  };
}
export function exportDiagram(doc: Diagram): string {
  const text = JSON.stringify(validateDiagram(doc), null, 2);
  // Import assigns UUIDs. Reserve their width so a valid export stays portable
  // even when an imported/custom identifier is shorter than a UUID.
  const idGrowth = (id: string) => Math.max(0, 36 - id.length);
  const remapGrowth = Math.max(0, 24 - doc.createdAt.length) + Math.max(0, 24 - doc.updatedAt.length) + idGrowth(doc.id) + doc.nodes.reduce((sum, n) => sum + idGrowth(n.id) + (n.parentId ? idGrowth(n.parentId) : 0), 0)
    + doc.edges.reduce((sum, e) => sum + idGrowth(e.id) + idGrowth(e.source) + idGrowth(e.target), 0);
  if (new TextEncoder().encode(text).byteLength + remapGrowth > 5 * 1024 * 1024) fail("Document exceeds the 5 MiB portable file size limit.");
  return text;
}
export function importDiagram(text: string): Diagram {
  if (new TextEncoder().encode(text).byteLength > 5 * 1024 * 1024) fail('Import exceeds the 5 MiB file size limit.');
  let value: unknown;
  try { value = JSON.parse(text); } catch { fail('The file is not valid JSON.'); }
  const doc = validateDiagram(value);
  const nodeIds = new Map(doc.nodes.map(n => [n.id, crypto.randomUUID()]));
  const now = new Date().toISOString();
  const imported = { ...doc, id: crypto.randomUUID(), createdAt: now, updatedAt: now,
    nodes: doc.nodes.map(n => ({ ...n, id: nodeIds.get(n.id)!, ...(n.parentId === undefined ? {} : { parentId: nodeIds.get(n.parentId)! }) })),
    edges: doc.edges.map(e => ({ ...e, id: crypto.randomUUID(), source: nodeIds.get(e.source)!, target: nodeIds.get(e.target)! })),
  };
  exportDiagram(imported);
  return imported;
}
