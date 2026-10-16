import type { DiagramNode, Point } from "./model";
export const categories = [
  "Clients",
  "Compute",
  "Databases",
  "Caches",
  "Messaging",
  "Networking",
  "Storage",
  "AI",
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
const groups: [Category, string, string[], string?][] = [
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
  ["Databases", "vector-database", ["Generic Vector Database", "pgvector", "Qdrant", "Pinecone", "Milvus"],
    "Indexes embedding vectors for similarity search and retrieval-augmented generation (RAG)."],
  ["Databases", "wide-column-database", ["Generic Wide-Column Database", "Cassandra", "ScyllaDB", "Bigtable"],
    "Distributes wide-column data by partition key for high write throughput and predictable key-based reads."],
  ["Databases", "graph-database", ["Generic Graph Database", "Neo4j", "Neptune"],
    "Stores entities and relationships for graph traversal, connected data and knowledge graphs."],
  ["Databases", "geospatial-database", ["Generic Geospatial Database", "PostGIS"],
    "Indexes geographic coordinates and shapes for distance, containment and geospatial queries."],
  ["Databases", "time-series-database", ["Generic Time-Series Database", "TimescaleDB", "InfluxDB"],
    "Stores timestamped measurements for time-series queries, retention policies and aggregations."],
  ["Databases", "search-engine", ["Generic Search Engine", "Elasticsearch", "OpenSearch"],
    "Indexes documents for full-text search, filtering and relevance ranking."],
  ["Databases", "analytics-database", ["Generic Analytics Database", "ClickHouse", "BigQuery", "Snowflake"],
    "Runs analytical (OLAP) queries over large datasets using column-oriented storage or a data warehouse."],
  ["Storage", "block-storage", ["Generic Block Storage", "Amazon EBS"],
    "Provides disk-like blocks for attached volumes, operating systems and database files."],
  ["Storage", "file-storage", ["Generic File Storage", "Amazon EFS"],
    "Provides shared file storage with directories and filesystem access for multiple clients."],
  ["Storage", "data-lake", ["Generic Data Lake"],
    "Keeps raw and curated datasets, usually in object storage, for analytics and model training."],
  ["Storage", "lakehouse", ["Generic Lakehouse"],
    "Combines a data lake with managed tables and query engines for analytics and machine learning."],
  ["Storage", "table-format", ["Apache Iceberg", "Delta Lake"],
    "An open table format or storage layer providing table metadata and transactions over data-lake files for a lakehouse."],
  ["Storage", "artifact-storage", ["Generic Model Artifact Storage"],
    "Stores model weights, checkpoints, tokenizers and evaluation artifacts as versioned files or objects."],
  ["AI", "model-serving", ["Generic Model Serving", "vLLM", "Triton Inference Server"],
    "Loads trained models and serves inference requests, often with batching and GPU acceleration."],
  ["AI", "embedding-service", ["Generic Embedding Service"],
    "Converts text, images or other inputs into embedding vectors for search and retrieval."],
  ["AI", "retrieval-service", ["Generic Retrieval Service"],
    "Retrieves relevant context from search indexes or vector databases for retrieval-augmented generation (RAG)."],
  ["AI", "reranker", ["Generic Reranker"],
    "Scores retrieved candidates against a query to improve the relevance of the final context."],
  ["AI", "feature-store", ["Generic Feature Store", "Feast"],
    "Manages reusable machine-learning features for consistent training and online inference."],
  ["AI", "model-registry", ["Generic Model Registry", "MLflow"],
    "A model registry that catalogs model versions, metadata and lifecycle status; artifacts live in backing storage."],
];
const descriptions: Record<Category, string> = {
  Clients: "A client that initiates requests to your system.",
  Compute: "A service that runs application logic.",
  Databases: "Stores and retrieves application data.",
  Caches: "Keeps reusable data close to its consumers.",
  Messaging: "Carries messages between system components.",
  Networking: "Routes requests through your system.",
  Storage: "Stores files and other objects.",
  AI: "Supports model training, inference or retrieval pipelines.",
};
export const presets: Preset[] = groups.flatMap(
  ([category, componentType, labels, description]) =>
    labels.map((label) => ({
      id: label.toLowerCase().replaceAll(" ", "-"),
      label,
      category,
      componentType,
      technology: label.startsWith("Generic ") ? undefined : label,
      description: description ?? descriptions[category],
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
