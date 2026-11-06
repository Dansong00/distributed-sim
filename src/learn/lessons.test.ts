import { expect, it } from "vitest";
import { createComponent } from "../domain/catalog";
import { lessonsFor, lessons } from "./lessons";

it("orders shared then specific lessons for API servers even after a rename", () => {
  const api = createComponent("api-server", { x: 0, y: 0 });
  api.name = "Notes service";
  expect(lessonsFor(api)).toEqual(["client-server", "api-server"]);
  api.technology = "Worker";
  expect(lessonsFor(api)).toEqual(["client-server", "queues"]);
});
it.each(["mobile-app", "web-browser", "generic-server", "serverless-function"])("keeps %s on the shared lesson only", preset => {
  expect(lessonsFor(createComponent(preset, { x: 0, y: 0 }))).toEqual(["client-server"]);
});
it.each(["mongodb", "neo4j", "cassandra", "postgis", "pgvector"])("offers overview, CAP, then Replication for %s", preset => {
  expect(lessonsFor(createComponent(preset, { x: 0, y: 0 }))).toEqual(["databases", "cap", "replication"]);
});
it("orders the overview before SQLite and uses technology rather than the display name", () => {
  const node = createComponent("sqlite", { x: 0, y: 0 });
  node.name = "Local storage";
  node.technology = " SQLite ";
  expect(lessonsFor(node)).toEqual(["databases", "cap", "replication", "sqlite"]);
  node.technology = "MySQL";
  expect(lessonsFor(node)).toEqual(["databases", "cap", "replication", "mysql"]);
});
it("orders the overview before PostgreSQL and keeps lessons after a rename", () => {
  const node = createComponent("postgresql", { x: 0, y: 0 });
  node.name = "Orders";
  expect(lessonsFor(node)).toEqual(["databases", "cap", "replication", "postgresql"]);
  node.technology = "MySQL";
  expect(lessonsFor(node)).toEqual(["databases", "cap", "replication", "mysql"]);
});
it("orders the overview before MySQL after renaming and normalizes technology", () => {
  const node = createComponent("mysql", { x: 0, y: 0 });
  node.name = "Shared storage";
  node.technology = " MySQL ";
  expect(lessonsFor(node)).toEqual(["databases", "cap", "replication", "mysql"]);
  node.technology = "MongoDB";
  expect(lessonsFor(node)).toEqual(["databases", "cap", "replication"]);
});
it("hides lessons on unrelated components and annotations", () => {
  const node = createComponent("cdn", { x: 0, y: 0 });
  node.technology = "Unsupported network appliance";
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

it.each(["generic-cache", "redis", "memcached"])("offers caching for %s after renaming", preset => {
  const node = createComponent(preset, { x: 0, y: 0 });
  node.name = "Product details";
  expect(lessonsFor(node)).toEqual(["caching", "key-value"]);
});
it("supports uncategorized cache components and excludes cache annotations", () => {
  const node = createComponent("redis", { x: 0, y: 0 });
  node.category = undefined;
  expect(lessonsFor(node)).toEqual(["caching", "key-value"]);
  expect(lessonsFor({ ...node, kind: "sticky" })).toEqual([]);
});

it.each(["generic-queue", "kafka", "rabbitmq", "sqs"])("offers queue foundations for %s after renaming", preset => {
  const node = createComponent(preset, { x: 0, y: 0 });
  node.name = "Receipt jobs";
  expect(lessonsFor(node)).toEqual(["queues"]);
});
it("adds messaging after the shared client/server lesson for normalized Worker technology", () => {
  const node = createComponent("worker", { x: 0, y: 0 });
  node.name = "Receipt processor";
  node.technology = " Worker ";
  expect(lessonsFor(node)).toEqual(["client-server", "queues"]);
  expect(lessonsFor({ ...node, componentType: "client" })).toEqual(["client-server"]);
});
it("supports uncategorized queues without offering lessons on annotations", () => {
  const node = createComponent("generic-queue", { x: 0, y: 0 });
  node.category = undefined;
  expect(lessonsFor(node)).toEqual(["queues"]);
  expect(lessonsFor({ ...node, kind: "sticky", category: "Messaging" })).toEqual([]);
});

it("offers load balancing after renaming and normalizes its technology", () => {
  const node = createComponent("load-balancer", { x: 0, y: 0 });
  node.name = "Notes entrance";
  node.technology = " Load Balancer ";
  expect(lessonsFor(node)).toEqual(["load-balancing"]);
  expect(lessonsFor({ ...node, category: undefined })).toEqual(["load-balancing"]);
  expect(lessonsFor({ ...node, kind: "sticky" })).toEqual([]);
  expect(lessonsFor({ ...node, componentType: "client" })).toEqual(["client-server"]);
});
it.each(["api-gateway", "cdn", "dns"])("does not give %s the load-balancing stack", preset => {
  const node = createComponent(preset, { x: 0, y: 0 });
  node.name = "Load Balancer";
  expect(lessonsFor(node)).not.toContain("load-balancing");
});

it("offers API gateways only for gateway technology after renaming", () => {
  const node = createComponent("api-gateway", { x: 0, y: 0 });
  node.name = "Notes entrance";
  node.technology = " API Gateway ";
  expect(lessonsFor(node)).toEqual(["api-gateways"]);
  expect(lessonsFor({ ...node, category: undefined })).toEqual(["api-gateways"]);
  expect(lessonsFor({ ...node, kind: "sticky" })).toEqual([]);
  expect(lessonsFor({ ...node, componentType: "client" })).toEqual(["client-server"]);
  for (const preset of ["load-balancer", "dns", "cdn", "api-server"]) {
    const other = createComponent(preset, { x: 0, y: 0 });
    other.name = "API Gateway";
    expect(lessonsFor(other)).not.toContain("api-gateways");
  }
});

it("offers DNS only for network DNS technology after renaming", () => {
  const node = createComponent("dns", { x: 0, y: 0 });
  node.name = "Notes lookup";
  node.technology = " dNs ";
  expect(lessonsFor(node)).toEqual(["dns"]);
  expect(lessonsFor({ ...node, category: undefined })).toEqual(["dns"]);
  expect(lessonsFor({ ...node, kind: "sticky" })).toEqual([]);
  expect(lessonsFor({ ...node, componentType: "client" })).toEqual(["client-server"]);
  for (const preset of ["load-balancer", "api-gateway", "cdn", "api-server"]) {
    const other = createComponent(preset, { x: 0, y: 0 });
    other.name = "DNS";
    expect(lessonsFor(other)).not.toContain("dns");
  }
});

it("offers object storage only for object-storage components after renaming", () => {
  const node = createComponent("s3", { x: 0, y: 0 });
  node.name = "Note files";
  node.technology = " S3 ";
  expect(lessonsFor(node)).toEqual(["object-storage"]);
  expect(lessonsFor(createComponent("generic-object-storage", { x: 0, y: 0 }))).toEqual(["object-storage"]);
  expect(lessonsFor(createComponent("google-cloud-storage", { x: 0, y: 0 }))).toEqual(["object-storage"]);
  expect(lessonsFor({ ...node, category: undefined })).toEqual(["object-storage"]);
  expect(lessonsFor({ ...node, kind: "sticky" })).toEqual([]);
  expect(lessonsFor({ ...node, componentType: "block-storage" })).toEqual([]);
  for (const preset of ["generic-block-storage", "generic-file-storage", "generic-data-lake", "cdn"]) {
    const other = createComponent(preset, { x: 0, y: 0 });
    other.name = "S3";
    expect(lessonsFor(other)).not.toContain("object-storage");
  }
});

it("offers CDN and HTTP caching only for CDN technology after renaming", () => {
  const node = createComponent("cdn", { x: 0, y: 0 });
  node.name = "Notes edge";
  node.technology = " cDn ";
  expect(lessonsFor(node)).toEqual(["cdn-http-caching"]);
  expect(lessonsFor({ ...node, category: undefined })).toEqual(["cdn-http-caching"]);
  expect(lessonsFor({ ...node, kind: "sticky" })).toEqual([]);
  expect(lessonsFor({ ...node, componentType: "client" })).toEqual(["client-server"]);
  for (const preset of ["load-balancer", "api-gateway", "dns", "api-server"]) {
    const other = createComponent(preset, { x: 0, y: 0 });
    other.name = "CDN";
    expect(lessonsFor(other)).not.toContain("cdn-http-caching");
  }
});


it.each(["generic-database", "dynamodb"])("adds key-value access after database foundations for %s", preset => {
  const node = createComponent(preset, { x: 0, y: 0 });
  node.name = "Account preferences";
  expect(lessonsFor(node)).toEqual(["databases", "cap", "replication", "key-value"]);
});
it("normalizes key-value database technology and removes its deck when technology changes", () => {
  const node = createComponent("dynamodb", { x: 0, y: 0 });
  node.category = undefined;
  node.technology = " DynamoDB ";
  expect(lessonsFor(node)).toEqual(["databases", "cap", "replication", "key-value"]);
  node.technology = "MongoDB";
  expect(lessonsFor(node)).toEqual(["databases", "cap", "replication"]);
  node.technology = "DynamoDB";
  expect(lessonsFor({ ...node, kind: "sticky" })).toEqual([]);
});
it.each(["postgresql", "mysql", "sqlite", "mongodb", "api-server", "generic-queue"])("does not infer a key-value deck from the display name of %s", preset => {
  const node = createComponent(preset, { x: 0, y: 0 });
  node.name = "Redis";
  expect(lessonsFor(node)).not.toContain("key-value");
});
