import { Background, BackgroundVariant, ConnectionMode, Controls, ReactFlow } from '@xyflow/react';
import type { Diagram } from '../domain/model';
import { toFlowEdges, toFlowNodes } from './flow-adapter';
import { ComponentNode, ContainerNode, StickyNode, TextNode } from './nodes';
const nodeTypes = { component: ComponentNode, container: ContainerNode, sticky: StickyNode, text: TextNode };
export function Canvas({ document }: { document: Diagram }) {
  return <div className="canvas" aria-label="Architecture canvas"><ReactFlow nodes={toFlowNodes(document)} edges={toFlowEdges(document)} nodeTypes={nodeTypes} connectionMode={ConnectionMode.Loose} nodesDraggable={false} nodesConnectable={false} defaultViewport={document.viewport} minZoom={0.2} maxZoom={2} fitView fitViewOptions={{ padding: 0.17 }}>
    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ced6e2"/><Controls showInteractive={false}/>
  </ReactFlow></div>;
}
