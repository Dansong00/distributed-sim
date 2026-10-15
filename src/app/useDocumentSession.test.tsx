// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useDocumentSession } from "./useDocumentSession";
import { createDiagram } from "../domain/templates";
import {
  DiagramConflictError,
  type DiagramStore,
} from "../storage/diagram-store";
import { duplicateSelection } from "../domain/operations";
import { importDiagram } from "../domain/serialization";
import type { StoredDiagram } from "../domain/model";
function fake() {
  const records = new Map<string, StoredDiagram>();
  const store: DiagramStore = {
    diagnostics: [],
    list: async () => [...records.values()],
    get: async (id) => records.get(id),
    remove: async (id) => {
      records.delete(id);
    },
    save: vi.fn(async (document, expected) => {
      const actual = records.get(document.id)?.revision ?? null;
      if (actual !== expected)
        throw new DiagramConflictError(document.id, expected, actual);
      const record = { document, revision: (actual ?? 0) + 1 };
      records.set(document.id, record);
      return record;
    }),
  };
  return { store, records };
}
function edit(session: ReturnType<typeof useDocumentSession>, name: string) {
  session.dispatch({
    type: "preview",
    document: { ...session.document!, name },
  });
  session.dispatch({ type: "commit" });
}
const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  let reject!: (v: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
afterEach(() => vi.useRealTimers());
test("serializes A then B while A saves and remains Saving until B completes", async () => {
  vi.useFakeTimers();
  const { store } = fake();
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => {
    await result.current.create("blank", "Initial");
  });
  const a = deferred<StoredDiagram>(),
    b = deferred<StoredDiagram>();
  vi.mocked(store.save)
    .mockImplementationOnce(() => a.promise)
    .mockImplementationOnce(() => b.promise);
  act(() => edit(result.current, "A"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400);
  });
  act(() => edit(result.current, "B"));
  const docA = vi.mocked(store.save).mock.calls.at(-1)![0];
  await act(async () => {
    a.resolve({ document: docA, revision: 2 });
  });
  expect(result.current.status).toBe("saving");
  expect(vi.mocked(store.save).mock.calls.at(-1)![0].name).toBe("B");
  const docB = vi.mocked(store.save).mock.calls.at(-1)![0];
  await act(async () => {
    b.resolve({ document: docB, revision: 3 });
  });
  expect(result.current.status).toBe("saved");
  expect(result.current.document?.name).toBe("B");
});
test("failed save retains edits and blocks switch until explicit discard", async () => {
  const { store, records } = fake();
  const other = createDiagram("blank", "Other");
  records.set(other.id, { document: other, revision: 1 });
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => {
    await result.current.create("blank", "Initial");
  });
  vi.mocked(store.save).mockRejectedValueOnce(
    new DOMException("Storage is full", "QuotaExceededError"),
  );
  act(() => edit(result.current, "Keep this"));
  await act(async () => {
    await expect(result.current.open(other.id)).rejects.toThrow(
      "Storage is full",
    );
  });
  expect(result.current.document?.name).toBe("Keep this");
  expect(result.current.status).toBe("error");
  await act(async () => {
    await result.current.open(other.id, { discard: true });
  });
  expect(result.current.document?.name).toBe("Other");
});
test("conflicts preserve local document and save as copy creates a new ID", async () => {
  const { store, records } = fake();
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => {
    await result.current.create("blank", "Original");
  });
  const id = result.current.document!.id;
  records.set(id, { document: result.current.document!, revision: 2 });
  act(() => edit(result.current, "Local edits"));
  await act(async () => {
    await expect(result.current.retrySave()).rejects.toBeInstanceOf(
      DiagramConflictError,
    );
  });
  expect(result.current.document?.name).toBe("Local edits");
  expect(result.current.status).toBe("conflict");
  await act(async () => {
    await result.current.saveAsCopy();
  });
  expect(result.current.document?.id).not.toBe(id);
  expect(result.current.document?.name).toBe("Local edits copy");
  expect(records.get(id)?.revision).toBe(2);
});
test("switch flushes pending changes and retry persists edits after quota failure", async () => {
  const { store, records } = fake();
  const other = createDiagram("web", "Other");
  records.set(other.id, { document: other, revision: 1 });
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => {
    await result.current.create("blank", "Original");
  });
  const id = result.current.document!.id;
  act(() => edit(result.current, "Latest"));
  vi.mocked(store.save).mockRejectedValueOnce(new Error("quota"));
  await act(async () => {
    await expect(result.current.open(other.id)).rejects.toThrow("quota");
  });
  await act(async () => {
    await result.current.retrySave();
  });
  expect(records.get(id)?.document.name).toBe("Latest");
  act(() =>
    result.current.dispatch({
      type: "viewport",
      viewport: { x: 125, y: -60, zoom: 0.7 },
    }),
  );
  await act(async () => {
    await result.current.open(other.id);
  });
  await act(async () => {
    await result.current.open(id);
  });
  expect(result.current.document?.viewport).toEqual({
    x: 125,
    y: -60,
    zoom: 0.7,
  });
  expect(result.current.history?.past).toHaveLength(0);
  expect(result.current.selection).toEqual({ nodeIds: [], edgeIds: [] });
});
test("warns before unload only while edits are unsaved", async () => {
  const { store } = fake();
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => {
    await result.current.create("blank", "Original");
  });
  const saved = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(saved);
  expect(saved.defaultPrevented).toBe(false);
  act(() => edit(result.current, "Unsaved"));
  const pending = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(pending);
  expect(pending.defaultPrevented).toBe(true);
  await act(async () => {
    await result.current.retrySave();
  });
  const done = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(done);
  expect(done.defaultPrevented).toBe(false);
});
test("initial listing failure permits retrying the picker and creating a diagram", async () => {
  const { store } = fake();
  vi.spyOn(store, "list").mockRejectedValueOnce(
    new Error("Temporarily unavailable"),
  );
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => {});
  await act(async () => {
    await result.current.showPicker();
  });
  await act(async () => {
    await result.current.create("blank", "Recovered");
  });
  expect(result.current.document?.name).toBe("Recovered");
});

test("editor mutations are paused while an open operation is reading the next record", async () => {
  const { store, records } = fake();
  const other = createDiagram("blank", "Other");
  records.set(other.id, { document: other, revision: 1 });
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => {
    await result.current.create("blank", "Original");
  });
  const reading = deferred<StoredDiagram | undefined>();
  vi.spyOn(store, "get").mockImplementationOnce(() => reading.promise);
  let opening!: Promise<void>;
  await act(async () => {
    opening = result.current.open(other.id);
  });
  act(() => edit(result.current, "Must be paused"));
  expect(result.current.document?.name).toBe("Original");
  await act(async () => {
    reading.resolve({ document: other, revision: 1 });
    await opening;
  });
  expect(result.current.document?.name).toBe("Other");
});

test("rename resolves only once the name is durable", async () => {
  const { store, records } = fake();
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => {
    await result.current.create("blank", "Original");
  });
  const pending = deferred<StoredDiagram>();
  vi.mocked(store.save).mockImplementationOnce(() => pending.promise);
  let done = false;
  let renaming!: Promise<unknown>;
  await act(async () => {
    renaming = Promise.resolve(result.current.rename("Renamed")).then(() => {
      done = true;
    });
  });
  expect(done).toBe(false);
  const doc = vi.mocked(store.save).mock.calls.at(-1)![0];
  await act(async () => {
    records.set(doc.id, { document: doc, revision: 2 });
    pending.resolve({ document: doc, revision: 2 });
    await renaming;
  });
  expect(done).toBe(true);
  expect(records.get(doc.id)?.document.name).toBe("Renamed");
});

test("rejects over-limit compound edits atomically while exact limits remain portable", async () => {
  const { store } = fake();
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => { await result.current.create("notes", "Limits"); });
  const base = result.current.document!;
  const component = base.nodes.find(n => n.kind === "component")!;
  const nodes = Array.from({ length: 500 }, (_, i) => ({ ...component, id: `node-${i}`, parentId: undefined }));
  const edges = Array.from({ length: 1000 }, (_, i) => ({ ...base.edges[0], id: `edge-${i}`, source: nodes[0].id, target: nodes[1].id }));
  act(() => {
    expect(result.current.dispatch({ type: "preview", document: { ...base, nodes, edges } })).toBe(true);
    result.current.dispatch({ type: "commit" });
  });
  await act(async () => { await result.current.retrySave(); });
  const history = result.current.history;
  const document = result.current.document!;
  for (const next of [
    duplicateSelection(document, { nodeIds: [nodes[0].id], edgeIds: [] }).document,
    { ...document, nodes: [...nodes, { ...nodes[0], id: "extra" }] },
    { ...document, edges: [...edges, { ...edges[0], id: "extra" }] },
    { ...document, nodes: nodes.map(n => ({ ...n, notes: "😀".repeat(5000) })) },
  ]) {
    act(() => { expect(result.current.dispatch({ type: "preview", document: next })).toBe(false); });
    expect(result.current.history).toBe(history);
    expect(result.current.status).toBe("saved");
    expect(result.current.warning).toContain("Edit not applied");
    expect(importDiagram(result.current.exportCurrent()).nodes).toHaveLength(500);
  }
  act(() => { expect(result.current.dispatch({ type: "viewport", viewport: { x: 1_000_001, y: 0, zoom: 1 } })).toBe(false); });
  expect(result.current.history).toBe(history);
  expect(result.current.status).toBe("saved");
  const edgeBounded = { ...document, nodes: nodes.slice(0, 2) };
  act(() => {
    expect(result.current.dispatch({ type: "preview", document: edgeBounded })).toBe(true);
    result.current.dispatch({ type: "commit" });
  });
  await act(async () => { await result.current.retrySave(); });
  const edgeHistory = result.current.history;
  const compound = duplicateSelection(edgeBounded, { nodeIds: edgeBounded.nodes.map(n => n.id), edgeIds: [] });
  expect(compound.document.edges).toHaveLength(2000);
  act(() => { expect(result.current.dispatch({ type: "preview", document: compound.document })).toBe(false); });
  expect(result.current.history).toBe(edgeHistory);
  expect(result.current.status).toBe("saved");
});

test("undo cannot restore oversized content under a newer viewport", async () => {
  const { store } = fake();
  const { result } = renderHook(() => useDocumentSession(store));
  await act(async () => { await result.current.create("notes", "Byte history"); });
  const base = result.current.document!;
  const component = base.nodes.find(n => n.kind === "component")!;
  const nodes = Array.from({ length: 500 }, () => ({ ...component, id: crypto.randomUUID(), parentId: undefined, notes: "x".repeat(10000), description: "" }));
  const exact = { ...base, nodes, edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
  let remaining = 5 * 1024 * 1024 - new TextEncoder().encode(JSON.stringify(exact, null, 2)).byteLength;
  for (const node of nodes) {
    const length = Math.min(remaining, 10000);
    node.description = "x".repeat(length);
    remaining -= length;
  }
  act(() => {
    expect(result.current.dispatch({ type: "preview", document: exact })).toBe(true);
    result.current.dispatch({ type: "commit" });
    expect(result.current.dispatch({ type: "preview", document: { ...exact, nodes: nodes.map((n, i) => i === 0 ? { ...n, notes: n.notes.slice(10) } : n) } })).toBe(true);
    result.current.dispatch({ type: "commit" });
    expect(result.current.dispatch({ type: "viewport", viewport: { x: 123456, y: 0, zoom: 1 } })).toBe(true);
  });
  const before = result.current.history;
  act(() => { expect(result.current.dispatch({ type: "undo" })).toBe(false); });
  expect(result.current.history).toBe(before);
  expect(() => importDiagram(result.current.exportCurrent())).not.toThrow();
});
