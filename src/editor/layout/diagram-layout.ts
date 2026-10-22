import ELK, { type ElkNode, type ElkExtendedEdge, type LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import type { Diagram, DiagramNode, Point } from '../../domain/model';
import { exportDiagram, validateDiagram } from '../../domain/serialization';

const options: LayoutOptions = {
  'elk.algorithm': 'layered', 'elk.direction': 'RIGHT', 'elk.randomSeed': '1',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN', 'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '120', 'elk.spacing.componentComponent': '48',
  'elk.padding': '[top=24,left=24,bottom=24,right=24]',
};
const byId = <T extends { id: string }>(a: T, b: T) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
const box = (n: DiagramNode): ElkNode => ({id:n.id, width:n.width, height:n.height});
const direction = (v: Point) => Math.abs(v.x) >= Math.abs(v.y) ? (v.x >= 0 ? 'right' : 'left') : (v.y >= 0 ? 'bottom' : 'top');

/** Calculate portable geometry only; callers own preview, history and persistence. */
export async function layoutDiagram(document: Diagram): Promise<Diagram> {
  const input = validateDiagram(document);
  exportDiagram(input);
  if (!input.nodes.length) return input;
  const nodes = [...input.nodes].sort(byId), edges = [...input.edges].sort(byId);
  const elk = new ELK(); // Bundled entry uses its in-process worker shim, never a nested browser worker.
  const connected = new Set(nodes.filter(n => n.kind === 'component').map(n => n.id));
  const adjacency = new Map(nodes.map(n => [n.id, [] as string[]]));
  for (const e of edges) if (e.source !== e.target) {
    adjacency.get(e.source)!.push(e.target); adjacency.get(e.target)!.push(e.source);
  }
  const pending = [...connected];
  for (let i = 0; i < pending.length; i++) for (const id of adjacency.get(pending[i])!) {
    if (!connected.has(id)) { connected.add(id); pending.push(id); }
  }
  const noteIds = new Set(nodes.filter(n => n.kind !== 'container' && !connected.has(n.id)).map(n => n.id));
  const layoutEdges = (ids: Set<string>): ElkExtendedEdge[] => edges.filter(e => e.source !== e.target && ids.has(e.source) && ids.has(e.target))
    .map(e => ({id:e.id, sources:[e.source], targets:[e.target]}));
  const notes = new Map<string | undefined, ElkNode>();
  // Each scope gets its own strip. ELK keeps note-only linked groups together and
  // packs their disconnected blocks in canonical input order with actual sizes.
  for (const scope of [undefined, ...nodes.filter(n => n.kind === 'container').map(n => n.id)]) {
    const children = nodes.filter(n => n.parentId === scope && noteIds.has(n.id));
    if (children.length) notes.set(scope, await elk.layout({id:'notes', layoutOptions:options,
      children:children.map(box), edges:layoutEdges(new Set(children.map(n => n.id)))}));
  }
  const mainNodes = nodes.filter(n => !noteIds.has(n.id));
  const children = mainNodes.filter(n => !n.parentId).map(n => {
    const result = box(n);
    if (n.kind !== 'container') return result;
    const members = mainNodes.filter(child => child.parentId === n.id).map(box);
    const strip = notes.get(n.id);
    const minimumWidth = Math.max(n.width, strip?.width ?? 0);
    const minimumHeight = Math.max(n.height, strip?.height ?? 0);
    if (!members.length) return {...result, width:minimumWidth, height:minimumHeight};
    return {...result, children:members, layoutOptions:{
      'elk.padding': `[top=24,left=24,bottom=${strip ? strip.height! + 48 : 24},right=24]`,
      'elk.nodeSize.constraints': 'MINIMUM_SIZE', 'elk.nodeSize.minimum': `(${minimumWidth},${minimumHeight})`,
    }};
  });
  const graph = await elk.layout({id:'root', layoutOptions:options, children,
    edges:layoutEdges(new Set(mainNodes.map(n => n.id)))});
  const placed = new Map<string, ElkNode>();
  const routed = new Map<string, ElkExtendedEdge>();
  function collect(graph: ElkNode) {
    for (const e of graph.edges ?? []) routed.set(e.id,e);
    for (const n of graph.children ?? []) { placed.set(n.id,n); collect(n); }
  }
  collect(graph);
  for (const [scope, strip] of notes) {
    const members = mainNodes.filter(n => n.parentId === scope);
    const bottom = Math.max(0,...members.map(n => placed.get(n.id)!.y! + placed.get(n.id)!.height!));
    const offset = members.length ? bottom + 48 : 0;
    for (const n of strip.children ?? []) placed.set(n.id,{...n,y:n.y! + offset});
    for (const e of strip.edges ?? []) routed.set(e.id,e);
  }
  const outputNodes = input.nodes.map(n => {
    const p = placed.get(n.id)!;
    return {...n, position:{x:p.x!,y:p.y!}, ...(n.kind === 'container' ? {width:p.width!,height:p.height!} : {})};
  });
  const nodeMap = new Map(outputNodes.map(n => [n.id,n]));
  const center = (n: DiagramNode): Point => ({x:n.position.x+n.width/2+(n.parentId ? nodeMap.get(n.parentId)!.position.x : 0),
    y:n.position.y+n.height/2+(n.parentId ? nodeMap.get(n.parentId)!.position.y : 0)});
  const outputEdges = input.edges.map(e => {
    if (e.source === e.target) return {...e};
    const s = center(nodeMap.get(e.source)!), t = center(nodeMap.get(e.target)!);
    const sections = routed.get(e.id)?.sections;
    const first = sections?.[0], last = sections?.[sections.length-1];
    const start = first && (first.bendPoints?.[0] ?? first.endPoint);
    const end = last && (last.bendPoints?.at(-1) ?? last.startPoint);
    return {...e, sourceHandle:direction(start && first ? {x:start.x-first.startPoint.x,y:start.y-first.startPoint.y} : {x:t.x-s.x,y:t.y-s.y}),
      targetHandle:direction(end && last ? {x:end.x-last.endPoint.x,y:end.y-last.endPoint.y} : {x:s.x-t.x,y:s.y-t.y})};
  });
  const candidate = validateDiagram({...input,nodes:outputNodes,edges:outputEdges});
  exportDiagram(candidate);
  return candidate;
}
