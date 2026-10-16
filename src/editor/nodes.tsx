import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import {
  Globe,
  Server,
  Database,
  Layers,
  Network,
  HardDrive,
  MessageSquare,
  Box,
} from "lucide-react";
import { STICKY_MIN_WIDTH, STICKY_MAX_SIZE } from "./sticky-sizing";
import type { CanvasNode } from "./flow-adapter";
const technologyIcons = import.meta.glob("../assets/technology/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const technologies: Record<string, string> = {
  PostgreSQL: "postgresql",
  MySQL: "mysql",
  MongoDB: "mongodb",
  Redis: "redis",
  Kafka: "apachekafka",
  RabbitMQ: "rabbitmq",
  "Google Cloud Storage": "googlecloud",
};
const icons = {
  Clients: Globe,
  Compute: Server,
  Databases: Database,
  Caches: Layers,
  Messaging: MessageSquare,
  Networking: Network,
  Storage: HardDrive,
};
export function ComponentNode({ data }: NodeProps<CanvasNode>) {
  const node = data.element;
  const Icon = icons[node.category as keyof typeof icons] ?? Box;
  const technologyIcon =
    technologyIcons[
      `../assets/technology/${technologies[node.technology ?? ""]}.svg`
    ];
  return (
    <div className={`component-card category-${node.category?.toLowerCase()}`}>
      <span className="component-icon">
        {technologyIcon ? (
          <img width={23} height={23} src={technologyIcon} alt="" />
        ) : (
          <Icon size={21} strokeWidth={1.7} />
        )}
      </span>
      <div className="component-copy">
        <small>{node.category}</small>
        <strong>{node.name}</strong>
        <span>{node.technology || node.componentType}</span>
      </div>
      {Object.entries({
        top: Position.Top,
        right: Position.Right,
        bottom: Position.Bottom,
        left: Position.Left,
      }).map(([id, position]) => (
        <Handle key={id} id={id} type="source" position={position} />
      ))}
    </div>
  );
}
export function ContainerNode({ data, selected }: NodeProps<CanvasNode>) {
  return (
    <div className="container-node">
      <NodeResizer isVisible={selected} minWidth={48} minHeight={48} />
      <span>
        <Box size={13} />
        {data.element.name}
      </span>
    </div>
  );
}
export function StickyNode({ data, selected }: NodeProps<CanvasNode>) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={STICKY_MIN_WIDTH}
        minHeight={48}
        maxWidth={STICKY_MAX_SIZE}
        maxHeight={STICKY_MAX_SIZE}
      />
      <div className={`sticky-node sticky-${data.element.color ?? "yellow"} nowheel`}>
        <strong>{data.element.name}</strong>
        <p>{data.element.notes}</p>
      </div>
    </>
  );
}
export function TextNode({ data }: NodeProps<CanvasNode>) {
  return (
    <div className="text-node">
      <strong>{data.element.name}</strong>
      <p>{data.element.notes}</p>
    </div>
  );
}
