import { growStickyNotes } from "../editor/sticky-sizing";
import { useEffect, useRef, useState } from "react";
import {
  createHistory,
  historyReducer,
  type HistoryAction,
  type HistoryState,
} from "../domain/history";
import type { CleanupSnapshot, Diagram, Selection, StoredDiagram } from "../domain/model";
import { createDiagram } from "../domain/templates";
import { exportDiagram, importDiagram, validateDiagram } from "../domain/serialization";
import {
  DiagramConflictError,
  type DiagramStore,
} from "../storage/diagram-store";
export type SaveStatus = "saved" | "saving" | "error" | "conflict";
export function useDocumentSession(store: DiagramStore) {
  const [, render] = useState(0);
  const state = useRef({
    history: null as HistoryState | null,
    selection: { nodeIds: [], edgeIds: [] } as Selection,
    revision: null as number | null,
    generation: 0,
    saved: 0,
    status: "saved" as SaveStatus,
    error: null as Error | null,
    fitOnOpen: false,
    installation: 0,
    records: [] as StoredDiagram[],
    warning: "",
    loading: true,
    busy: false,
  });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flight = useRef<Promise<void> | null>(null);
  const alive = useRef(true);
  const emit = () => {
    if (alive.current) render((n) => n + 1);
  };
  const s = state.current;
  function fail(error: unknown) {
    s.error = error instanceof Error ? error : new Error(String(error));
    s.status = error instanceof DiagramConflictError ? "conflict" : "error";
    emit();
  }
  async function refresh() {
    s.records = await store.list();
    s.warning = store.diagnostics.map((e) => e.message).join(" ");
    emit();
  }
  useEffect(() => {
    alive.current = true;
    refresh()
      .catch(fail)
      .finally(() => {
        s.loading = false;
        emit();
      });
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, [store]);
  function install(record: StoredDiagram | null, fit = false) {
    clearTimeout(timer.current);
    s.installation++;
    s.fitOnOpen = fit;
    let document = record?.document;
    if (document) {
      const grown = growStickyNotes(document);
      // A legacy file at the portable byte limit can still open safely with
      // scrolling; do not make an otherwise valid stored document unsaveable.
      try { exportDiagram(grown); document = grown; } catch { /* retain original */ }
    }
    s.history = document ? createHistory(document) : null;
    s.revision = record?.revision ?? null;
    s.generation = 0;
    s.saved = 0;
    s.status = "saved";
    s.error = null;
    s.selection = { nodeIds: [], edgeIds: [] };
    if (record && document !== record.document) {
      s.generation++;
      s.status = "saving";
      timer.current = setTimeout(() => { void flush().catch(() => {}); }, 400);
    }
    emit();
  }
  async function flush(): Promise<void> {
    clearTimeout(timer.current);
    if (flight.current) return flight.current;
    if (!s.history) return;
    if (s.status === "error" || s.status === "conflict") throw s.error;
    if (s.saved === s.generation) return;
    s.status = "saving";
    emit();
    const work = async () => {
      try {
        while (s.history && s.saved !== s.generation) {
          const generation = s.generation;
          const document = {
            ...s.history.present,
            updatedAt: new Date().toISOString(),
          };
          const record = await store.save(document, s.revision);
          s.revision = record.revision;
          s.saved = generation;
          // Record bookkeeping never replaces the newer live document or its history.
          s.records = [
            record,
            ...s.records.filter((r) => r.document.id !== record.document.id),
          ];
        }
        s.status = "saved";
        s.error = null;
        emit();
      } catch (error) {
        fail(error);
        throw error;
      }
    };
    flight.current = work();
    try {
      await flight.current;
    } finally {
      flight.current = null;
    }
  }
  function dispatch(action: HistoryAction) {
    if (s.busy) return false;
    return updateHistory(action);
  }
  function updateHistory(action: HistoryAction) {
    // Lifecycle writes freeze editing as well as the visible workspace. Global
    // keyboard handlers can still fire while a DOM subtree is inert.
    if (!s.history) return false;
    if (action.type === "preview" || action.type === "replace")
      action = { ...action, document: growStickyNotes(action.document, s.history.present) };
    const next = historyReducer(s.history, action);
    if (next.present !== s.history.present) {
      try {
        exportDiagram(next.present);
      } catch (error) {
        s.warning = `Edit not applied: ${error instanceof Error ? error.message : String(error)}`;
        emit();
        return false;
      }
      if (action.type !== "viewport") s.warning = "";
    }
    const previous = s.history.present;
    s.history = next;
    if (
      previous !== s.history.present &&
      JSON.stringify(previous) !== JSON.stringify(s.history.present)
    ) {
      s.generation++;
      clearTimeout(timer.current);
      if (s.status !== "error" && s.status !== "conflict") {
        s.status = "saving";
        timer.current = setTimeout(() => {
          void flush().catch(() => {});
        }, 400);
      }
    }
    emit();
    return true;
  }
  async function lifecycle<T>(action: () => Promise<T>): Promise<T> {
    if (s.busy) throw new Error("Please wait for the current diagram action.");
    s.busy = true;
    emit();
    try {
      return await action();
    } finally {
      s.busy = false;
      emit();
    }
  }
  function matchesCleanup(snapshot: CleanupSnapshot) {
    return s.history && s.installation === snapshot.installation &&
      s.generation === snapshot.generation && s.revision === snapshot.revision &&
      JSON.stringify(s.history.present) === JSON.stringify(snapshot.document);
  }
  async function checkCleanupRevision(snapshot: CleanupSnapshot) {
    const record = await store.get(snapshot.document.id);
    if (!matchesCleanup(snapshot)) throw new Error("The diagram changed during cleanup.");
    if (record?.revision !== snapshot.revision)
      throw new DiagramConflictError(snapshot.document.id, snapshot.revision, record?.revision ?? null);
  }
  const prepareCleanup = () => {
    if (!s.history || s.busy || s.status === "error" || s.status === "conflict")
      return Promise.reject(s.error ?? new Error("The diagram is not ready for cleanup."));
    dispatch({ type: "commit" });
    return lifecycle(async (): Promise<CleanupSnapshot> => {
      const installation = s.installation;
      const generation = s.generation;
      try {
        await flush();
        if (!s.history || s.installation !== installation || s.generation !== generation)
          throw new Error("The diagram changed during cleanup.");
        const snapshot = structuredClone({ document: s.history.present, installation,
          generation, revision: s.revision! });
        await checkCleanupRevision(snapshot);
        return snapshot;
      } catch (error) { fail(error); throw error; }
    });
  };
  async function applyCleanup(snapshot: CleanupSnapshot, candidate: Diagram): Promise<boolean> {
    if (s.busy) return false;
    // Own both arguments across the asynchronous revision check.
    const captured = structuredClone(snapshot);
    let next: Diagram;
    try {
      if (!matchesCleanup(captured) || s.status === "error" || s.status === "conflict")
        throw new Error("The diagram changed during cleanup.");
      next = validateDiagram(candidate);
      exportDiagram(next);
      const allowed: Diagram = { ...captured.document,
        nodes: captured.document.nodes.map((node, index) => {
          const proposed = next.nodes[index];
          if (!proposed || proposed.id !== node.id) throw new Error("Cleanup must preserve every element.");
          if (node.kind === "container" && (proposed.width < node.width || proposed.height < node.height))
            throw new Error("Cleanup cannot shrink containers.");
          return { ...node, position: proposed.position,
            ...(node.kind === "container" ? {width: proposed.width, height: proposed.height} : {}) };
        }),
        edges: captured.document.edges.map((edge, index) => ({ ...edge,
          sourceHandle: next.edges[index]?.sourceHandle, targetHandle: next.edges[index]?.targetHandle })),
      };
      if (JSON.stringify(validateDiagram(allowed)) !== JSON.stringify(next))
        throw new Error("Cleanup may only change positions, container growth and attachment sides.");
    } catch (error) {
      s.warning = `Cleanup not applied: ${error instanceof Error ? error.message : String(error)}`;
      emit(); return false;
    }
    return lifecycle(async () => {
      try {
        await checkCleanupRevision(captured);
        // No await between the final snapshot check and this single content transaction.
        if (!updateHistory({ type: "preview", document: next })) return false;
        updateHistory({ type: "commit" });
        return true;
      } catch (error) { fail(error); return false; }
    });
  }
  async function prepare(discard = false) {
    clearTimeout(timer.current);
    if (discard) {
      await flight.current?.catch(() => {});
      return;
    }
    await flush();
  }
  async function saveNew(document: Diagram, fit = false) {
    document = growStickyNotes(document);
    const record = await store.save(document, null);
    s.records = [record, ...s.records];
    install(record, fit);
  }
  const create = (template: "blank" | "web" | "notes", name: string) =>
    lifecycle(async () => {
      await prepare();
      await saveNew(
        createDiagram(
          template,
          name.trim().slice(0, 200) || "Untitled diagram",
        ),
        true,
      );
    });
  const open = (id: string, options?: { discard?: boolean }) =>
    lifecycle(async () => {
      await prepare(options?.discard);
      const record = await store.get(id);
      if (!record) throw new Error("This diagram has been deleted.");
      install(record);
    });
  const showPicker = (options?: { discard?: boolean }) =>
    lifecycle(async () => {
      await prepare(options?.discard);
      await refresh();
      install(null);
    });
  async function rename(name: string) {
    if (!s.history || s.busy) return;
    dispatch({
      type: "preview",
      document: {
        ...s.history.present,
        name: name.trim().slice(0, 200) || "Untitled diagram",
      },
    });
    dispatch({ type: "commit" });
    await flush();
  }
  const duplicate = () =>
    lifecycle(async () => {
      await prepare();
      if (s.history)
        await saveNew({
          ...s.history.present,
          id: crypto.randomUUID(),
          name: `${s.history.present.name.slice(0, 195)} copy`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
    });
  const saveAsCopy = () =>
    lifecycle(async () => {
      clearTimeout(timer.current);
      await flight.current?.catch(() => {});
      if (s.history)
        await saveNew({
          ...s.history.present,
          id: crypto.randomUUID(),
          name: `${s.history.present.name.slice(0, 195)} copy`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
    });
  const remove = (id: string) =>
    lifecycle(async () => {
      await prepare();
      const record =
        id === s.history?.present.id
          ? { revision: s.revision! }
          : await store.get(id);
      if (!record) throw new Error("This diagram has been deleted.");
      await store.remove(id, record.revision);
      s.records = s.records.filter((record) => record.document.id !== id);
      if (s.history?.present.id === id) install(null);
      await refresh();
    });
  const importFile = (file: File) =>
    lifecycle(async () => {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Import exceeds the 5 MiB file size limit.");
      const document = importDiagram(await file.text());
      await prepare();
      await saveNew(document);
    });
  const exportCurrent = () => {
    if (!s.history) throw new Error("No diagram is open.");
    return exportDiagram(s.history.present);
  };
  const retrySave = async () => {
    if (flight.current) await flight.current.catch(() => {});
    s.status = "saving";
    s.error = null;
    return flush();
  };
  const reloadStored = () =>
    lifecycle(async () => {
      clearTimeout(timer.current);
      await flight.current?.catch(() => {});
      if (!s.history) return;
      const record = await store.get(s.history.present.id);
      if (!record)
        throw new Error(
          "This diagram was deleted. Save a copy to keep your work.",
        );
      install(record);
    });
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (s.saved !== s.generation) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  return {
    document: s.history?.present ?? null,
    history: s.history,
    selection: s.selection,
    setSelection: (selection: Selection) => {
      s.selection = selection;
      emit();
    },
    fitOnOpen: s.fitOnOpen,
    installation: s.installation,
    generation: s.generation,
    status: s.status,
    error: s.error,
    records: s.records,
    warning: s.warning,
    loading: s.loading,
    busy: s.busy,
    dispatch,
    prepareCleanup,
    applyCleanup,
    create,
    open,
    showPicker,
    rename,
    duplicate,
    remove,
    importFile,
    exportCurrent,
    retrySave,
    saveAsCopy,
    reloadStored,
  };
}
