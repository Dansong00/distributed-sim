import type { DiagramNode } from "../domain/model";
import { clientServerLesson } from "./client-server";
import { apiServerLesson } from "./api-server";
import { databasesLesson } from "./databases";
import { postgresqlLesson } from "./postgresql";
import { sqliteLesson } from "./sqlite";
import { mysqlLesson } from "./mysql";
import { capLesson } from "./cap";
import { replicationLesson } from "./replication";

import { cdnHttpCachingLesson } from "./cdn-http-caching";
import { dnsLesson } from "./dns";
import { apiGatewaysLesson } from "./api-gateways";
import { loadBalancingLesson } from "./load-balancing";
import { queuesLesson } from "./queues";
import { cachingLesson } from "./caching";
import { sharedFileStorageLesson } from "./shared-file-storage";
import { blockStorageLesson } from "./block-storage";
import { objectStorageLesson } from "./object-storage";
import { keyValueLesson } from "./key-value";

export const lessons = { "shared-file-storage": sharedFileStorageLesson, "block-storage": blockStorageLesson, "object-storage": objectStorageLesson, "key-value": keyValueLesson, "client-server": clientServerLesson, "api-server": apiServerLesson, databases: databasesLesson, cap: capLesson, replication: replicationLesson, caching: cachingLesson, queues: queuesLesson, "load-balancing": loadBalancingLesson, "api-gateways": apiGatewaysLesson, dns: dnsLesson, "cdn-http-caching": cdnHttpCachingLesson, postgresql: postgresqlLesson, sqlite: sqliteLesson, mysql: mysqlLesson };
export type LessonId = keyof typeof lessons;

export function lessonsFor(node: DiagramNode): LessonId[] {
  if (node.kind !== "component") return [];
  if (node.componentType === "file-storage") return ["shared-file-storage"];
  if (node.componentType === "block-storage") return ["block-storage"];
  if (node.componentType === "object-storage") return ["object-storage"];
  if (node.category === "Caches" || node.componentType === "cache") return ["caching", "key-value"];
  if (node.category === "Messaging" || node.componentType === "queue") return ["queues"];
  const technology = node.technology?.trim().toLowerCase();
  if (node.componentType === "network" && technology === "cdn") return ["cdn-http-caching"];
  if (node.componentType === "network" && technology === "dns") return ["dns"];
  if (node.componentType === "network" && technology === "api gateway") return ["api-gateways"];
  if (node.componentType === "network" && technology === "load balancer") return ["load-balancing"];
  if (node.category === "Databases" || node.componentType === "database") {
    if (technology === "dynamodb" || technology === "generic database" || (!technology && node.componentType === "database")) return ["databases", "cap", "replication", "key-value"];
    if (technology === "postgresql") return ["databases", "cap", "replication", "postgresql"];
    if (technology === "sqlite") return ["databases", "cap", "replication", "sqlite"];
    if (technology === "mysql") return ["databases", "cap", "replication", "mysql"];
    return ["databases", "cap", "replication"];
  }
  if (!["client", "server"].includes(node.componentType ?? "")) return [];
  if (node.componentType === "server" && technology === "worker") return ["client-server", "queues"];
  return node.componentType === "server" && technology === "api server"
    ? ["client-server", "api-server"] : ["client-server"];
}
