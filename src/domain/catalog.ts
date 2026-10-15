import type { DiagramNode, Point } from "./model";
export const categories = [
  "Clients",
  "Compute",
  "Databases",
  "Caches",
  "Messaging",
  "Networking",
  "Storage",
] as const;
export type Category = (typeof categories)[number];
export type Preset = {
  id: string;
  label: string;
  category: Category;
  componentType: string;
  technology?: string;
  description: string;
};
const groups: [Category, string, string[]][] = [
  ["Clients", "client", ["Generic Client", "Web Browser", "Mobile App", "CLI"]],
  [
    "Compute",
    "server",
    ["Generic Server", "API Server", "Worker", "Serverless Function"],
  ],
  [
    "Databases",
    "database",
    ["Generic Database", "PostgreSQL", "MySQL", "MongoDB", "DynamoDB"],
  ],
  ["Caches", "cache", ["Generic Cache", "Redis", "Memcached"]],
  ["Messaging", "queue", ["Generic Queue", "Kafka", "RabbitMQ", "SQS"]],
  ["Networking", "network", ["Load Balancer", "API Gateway", "CDN", "DNS"]],
  [
    "Storage",
    "object-storage",
    ["Generic Object Storage", "S3", "Google Cloud Storage"],
  ],
];
const descriptions: Record<Category, string> = {
  Clients: "A client that initiates requests to your system.",
  Compute: "A service that runs application logic.",
  Databases: "Stores and retrieves application data.",
  Caches: "Keeps reusable data close to its consumers.",
  Messaging: "Carries messages between system components.",
  Networking: "Routes requests through your system.",
  Storage: "Stores files and other objects.",
};
export const presets: Preset[] = groups.flatMap(
  ([category, componentType, labels]) =>
    labels.map((label) => ({
      id: label.toLowerCase().replaceAll(" ", "-"),
      label,
      category,
      componentType,
      technology: label.startsWith("Generic ") ? undefined : label,
      description: descriptions[category],
    })),
);
export function createComponent(
  presetId: string,
  position: Point,
): DiagramNode {
  const preset = presets.find((p) => p.id === presetId);
  if (!preset) throw new Error(`Unknown component preset: ${presetId}`);
  return {
    id: crypto.randomUUID(),
    kind: "component",
    position: { ...position },
    width: 200,
    height: 88,
    name: preset.label,
    notes: "",
    description: preset.description,
    componentType: preset.componentType,
    category: preset.category,
    technology: preset.technology,
  };
}
