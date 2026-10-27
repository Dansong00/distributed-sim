import { expect, it } from "vitest";
import { createComponent } from "../domain/catalog";
import { lessonsFor, lessons } from "./lessons";

it("orders shared then specific lessons for API servers even after a rename", () => {
  const api = createComponent("api-server", { x: 0, y: 0 });
  api.name = "Notes service";
  expect(lessonsFor(api)).toEqual(["client-server", "api-server"]);
  api.technology = "Worker";
  expect(lessonsFor(api)).toEqual(["client-server"]);
});
it.each(["mobile-app", "web-browser", "generic-server", "worker", "serverless-function"])("keeps %s on the shared lesson only", preset => {
  expect(lessonsFor(createComponent(preset, { x: 0, y: 0 }))).toEqual(["client-server"]);
});
it.each(["generic-database", "mongodb", "neo4j", "cassandra", "postgis", "pgvector"])("offers the shared database overview for %s", preset => {
  expect(lessonsFor(createComponent(preset, { x: 0, y: 0 }))).toEqual(["databases"]);
});
it("orders the overview before SQLite and uses technology rather than the display name", () => {
  const node = createComponent("sqlite", { x: 0, y: 0 });
  node.name = "Local storage";
  node.technology = " SQLite ";
  expect(lessonsFor(node)).toEqual(["databases", "sqlite"]);
  node.technology = "MySQL";
  expect(lessonsFor(node)).toEqual(["databases", "mysql"]);
});
it("orders the overview before PostgreSQL and keeps lessons after a rename", () => {
  const node = createComponent("postgresql", { x: 0, y: 0 });
  node.name = "Orders";
  expect(lessonsFor(node)).toEqual(["databases", "postgresql"]);
  node.technology = "MySQL";
  expect(lessonsFor(node)).toEqual(["databases", "mysql"]);
});
it("orders the overview before MySQL after renaming and normalizes technology", () => {
  const node = createComponent("mysql", { x: 0, y: 0 });
  node.name = "Shared storage";
  node.technology = " MySQL ";
  expect(lessonsFor(node)).toEqual(["databases", "mysql"]);
  node.technology = "MongoDB";
  expect(lessonsFor(node)).toEqual(["databases"]);
});
it("hides lessons on unrelated components and annotations", () => {
  const node = createComponent("api-gateway", { x: 0, y: 0 });
  expect(lessonsFor(node)).toEqual([]);
  expect(lessonsFor({ ...node, kind: "sticky", category: "Databases" })).toEqual([]);
});
it("keeps existing five-slide decks and database decks under ten slides", () => {
  for (const id of ["client-server", "api-server"] as const) expect(lessons[id].slides.map(s => s.section)).toEqual(["What Is It?", "Core Concept", "Variants", "Trade-offs", "Interview Tip"]);
  for (const lesson of Object.values(lessons)) {
    expect(lesson.slides.length).toBeGreaterThan(0);
    expect(lesson.slides.length).toBeLessThan(10);
  }
});
