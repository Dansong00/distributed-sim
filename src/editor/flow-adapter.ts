import { MarkerType, type Node, type Edge } from '@xyflow/react';
import type { Diagram, DiagramNode } from '../domain/model';
export type CanvasNode = Node<{ element: DiagramNode }>;
export function toFlowNodes(document: Diagram): CanvasNode[] {
  return [...document.nodes].sort((a, b) => Number(Boolean(a.parentId)) - Number(Boolean(b.parentId))).map(element => ({
    id: element.id, type: element.kind, position: { ...element.position }, parentId: element.parentId,
    style: { width: element.width, height: element.height }, data: { element },
    zIndex: element.kind === 'container' ? -1 : 0,
  }));
}
export function toFlowEdges(document: Diagram): Edge[] {
  return document.edges.map(edge => ({ ...edge, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed },
    markerStart: edge.direction === 'both' ? { type: MarkerType.ArrowClosed } : undefined,
    style: { stroke: '#8090a5', strokeWidth: 1.5 }, labelStyle: { fill: '#607087', fontSize: 11 }, labelBgPadding: [8, 5], labelBgBorderRadius: 5,
  }));
}
