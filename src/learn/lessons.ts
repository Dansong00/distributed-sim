import type { DiagramNode } from "../domain/model";
import { clientServerLesson } from "./client-server";
import { apiServerLesson } from "./api-server";
import { databasesLesson } from "./databases";
import { postgresqlLesson } from "./postgresql";

export const lessons = { "client-server": clientServerLesson, "api-server": apiServerLesson, databases: databasesLesson, postgresql: postgresqlLesson };
export type LessonId = keyof typeof lessons;

export function lessonsFor(node: DiagramNode): LessonId[] {
  if (node.kind !== "component") return [];
  const technology = node.technology?.trim().toLowerCase();
  if (node.category === "Databases" || node.componentType === "database") {
    return technology === "postgresql" ? ["databases", "postgresql"] : ["databases"];
  }
  if (!["client", "server"].includes(node.componentType ?? "")) return [];
  return node.componentType === "server" && technology === "api server"
    ? ["client-server", "api-server"] : ["client-server"];
}
