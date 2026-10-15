import { useEffect, useRef, useState } from "react";
import {
  createHistory,
  historyReducer,
  type HistoryAction,
  type HistoryState,
} from "../domain/history";
import type { Diagram, Selection, StoredDiagram } from "../domain/model";
import { createDiagram } from "../domain/templates";
import { exportDiagram, importDiagram } from "../domain/serialization";
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
    s.fitOnOpen = fit;
    s.history = record ? createHistory(record.document) : null;
    s.revision = record?.revision ?? null;
    s.generation = 0;
    s.saved = 0;
    s.status = "saved";
    s.error = null;
    s.selection = { nodeIds: [], edgeIds: [] };
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
    // Lifecycle writes freeze editing as well as the visible workspace. Global
    // keyboard handlers can still fire while a DOM subtree is inert.
    if (!s.history || s.busy) return;
    const previous = s.history.present;
    s.history = historyReducer(s.history, action);
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
  async function prepare(discard = false) {
    clearTimeout(timer.current);
    if (discard) {
      await flight.current?.catch(() => {});
      return;
    }
    await flush();
  }
  async function saveNew(document: Diagram, fit = false) {
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
    status: s.status,
    error: s.error,
    records: s.records,
    warning: s.warning,
    loading: s.loading,
    busy: s.busy,
    dispatch,
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
