import type { DiagramNode } from "../domain/model";
import { clientServerLesson } from "./client-server";
import { apiServerLesson } from "./api-server";
import { databasesLesson } from "./databases";
import { postgresqlLesson } from "./postgresql";
import { sqliteLesson } from "./sqlite";
import { mysqlLesson } from "./mysql";
import { capLesson } from "./cap";
import { replicationLesson } from "./replication";

export const lessons = { "client-server": clientServerLesson, "api-server": apiServerLesson, databases: databasesLesson, cap: capLesson, replication: replicationLesson, postgresql: postgresqlLesson, sqlite: sqliteLesson, mysql: mysqlLesson };
export type LessonId = keyof typeof lessons;

export function lessonsFor(node: DiagramNode): LessonId[] {
  if (node.kind !== "component") return [];
  const technology = node.technology?.trim().toLowerCase();
  if (node.category === "Databases" || node.componentType === "database") {
    if (technology === "postgresql") return ["databases", "cap", "replication", "postgresql"];
    if (technology === "sqlite") return ["databases", "cap", "replication", "sqlite"];
    if (technology === "mysql") return ["databases", "cap", "replication", "mysql"];
    return ["databases", "cap", "replication"];
  }
  if (!["client", "server"].includes(node.componentType ?? "")) return [];
  return node.componentType === "server" && technology === "api server"
    ? ["client-server", "api-server"] : ["client-server"];
}
