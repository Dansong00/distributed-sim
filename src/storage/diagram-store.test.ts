import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { openDB } from "idb";
import {
  createDiagramStore,
  DiagramConflictError,
  CorruptDiagramError,
} from "./diagram-store";
import type { Diagram } from "../domain/model";
const doc = (id = "one"): Diagram => ({
  schemaVersion: 1,
  id,
  name: id,
  createdAt: "2026-10-15T00:00:00Z",
  updatedAt: "2026-10-15T00:00:00Z",
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});
const setup = () => {
  const name = crypto.randomUUID();
  return { name, store: createDiagramStore(name) };
};
describe("diagram store", () => {
  it("creates, reads, updates and deletes independent records, sorted newest first", async () => {
    const { store } = setup();
    expect(await store.get("missing")).toBeUndefined();
    expect(await store.save(doc(), null)).toEqual({
      document: doc(),
      revision: 1,
    });
    const newer = { ...doc("two"), updatedAt: "2026-10-16T00:00:00Z" };
    await store.save(newer, null);
    expect((await store.list()).map((r) => r.document.id)).toEqual([
      "two",
      "one",
    ]);
    expect(await store.save({ ...doc(), name: "changed" }, 1)).toMatchObject({
      revision: 2,
    });
    await store.remove("one", 2);
    expect(await store.get("one")).toBeUndefined();
    expect(await store.get("two")).toEqual({ document: newer, revision: 1 });
  });
  it("rejects create-only collisions and stale writes/deletes without changing records", async () => {
    const { store } = setup();
    await store.save(doc(), null);
    await expect(
      store.save({ ...doc(), name: "lost" }, null),
    ).rejects.toBeInstanceOf(DiagramConflictError);
    await expect(store.save(doc(), 2)).rejects.toBeInstanceOf(
      DiagramConflictError,
    );
    await expect(store.remove("one", 2)).rejects.toBeInstanceOf(
      DiagramConflictError,
    );
    await expect(
      store.save({ ...doc(), name: "x".repeat(201) }, 1),
    ).rejects.toThrow();
    expect(await store.get("one")).toEqual({ document: doc(), revision: 1 });
  });
  it("allows only one concurrent writer across independent store instances", async () => {
    const { store, name } = setup();
    await store.save(doc(), null);
    const other = createDiagramStore(name);
    const results = await Promise.allSettled([
      store.save({ ...doc(), name: "a" }, 1),
      other.save({ ...doc(), name: "b" }, 1),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const failure = results.find(
      (r) => r.status === "rejected",
    ) as PromiseRejectedResult;
    expect(failure.reason).toBeInstanceOf(DiagramConflictError);
    expect((await store.get("one"))?.revision).toBe(2);
  });
  it("does not recreate a deleted record with a stale revision", async () => {
    const { store } = setup();
    await store.save(doc(), null);
    await store.remove("one", 1);
    await expect(store.save(doc(), 1)).rejects.toMatchObject({
      actualRevision: null,
    });
    await expect(store.remove("one", 1)).rejects.toBeInstanceOf(
      DiagramConflictError,
    );
    expect(await store.get("one")).toBeUndefined();
    await store.save(doc(), null);
  });
  it("reports corrupt records while listing valid records and preserving stored bytes", async () => {
    const { store, name } = setup();
    await store.save(doc(), null);
    const db = await openDB(name, 1);
    await db.put("diagrams", { document: { id: "bad" }, revision: 1 });
    expect((await store.list()).map((r) => r.document.id)).toEqual(["one"]);
    expect(store.diagnostics).toHaveLength(1);
    expect(store.diagnostics[0]).toMatchObject({ id: "bad" });
    await expect(store.get("bad")).rejects.toBeInstanceOf(CorruptDiagramError);
    await expect(store.save(doc("bad"), null)).rejects.toBeInstanceOf(
      CorruptDiagramError,
    );
    expect(await db.get("diagrams", "bad")).toEqual({
      document: { id: "bad" },
      revision: 1,
    });
    db.close();
  });
});

it("rejects an aborted commit after a successful put and preserves the previous revision", async () => {
  const { store } = setup();
  await store.save(doc(), null);
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (
    ...args: Parameters<IDBObjectStore["put"]>
  ) {
    const request = original.apply(this, args);
    request.addEventListener("success", () => this.transaction.abort());
    return request;
  };
  try {
    await expect(
      store.save({ ...doc(), name: "uncommitted" }, 1),
    ).rejects.toThrow();
  } finally {
    IDBObjectStore.prototype.put = original;
  }
  expect(await store.get("one")).toEqual({ document: doc(), revision: 1 });
});

it("rejects listing when its transaction aborts without an unhandled completion rejection", async () => {
  const { store } = setup();
  await store.save(doc(), null);
  const original = IDBObjectStore.prototype.getAll;
  IDBObjectStore.prototype.getAll = function (
    ...args: Parameters<IDBObjectStore["getAll"]>
  ) {
    const request = original.apply(this, args);
    request.addEventListener("success", () => this.transaction.abort());
    return request;
  };
  try {
    await expect(store.list()).rejects.toThrow();
  } finally {
    IDBObjectStore.prototype.getAll = original;
  }
  expect(await store.get("one")).toEqual({ document: doc(), revision: 1 });
});
