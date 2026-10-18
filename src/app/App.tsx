import { useEffect, useRef, useState } from "react";
import { Boxes } from "lucide-react";
import { createDiagramStore } from "../storage/diagram-store";
import { useDocumentSession } from "./useDocumentSession";
import { DiagramPicker } from "./DiagramPicker";
import { StarterDialog } from "./StarterDialog";
import { Dialog } from "../ui/Dialog";
import { deleteSelection, duplicateSelection } from "../domain/operations";
import { Canvas, type CanvasHandle } from "../editor/Canvas";
import { Palette } from "../editor/Palette";
import { Inspector } from "../editor/Inspector";
import { useAutoLayout } from "../editor/useAutoLayout";
import type { HistoryAction } from "../domain/history";
import type { Viewport } from "../domain/model";
import { Toolbar } from "../editor/Toolbar";
import { ConnectorPreferencesContext, readConnectorPreferences, saveConnectorPreferences, type ConnectorPreferences } from "../editor/connector-preferences";
const store = createDiagramStore();
export function App() {
  const [connectorPreferences, setConnectorPreferences] = useState(readConnectorPreferences);
  const rememberConnectorPreferences = (patch: Partial<ConnectorPreferences>) => {
    const next = { ...connectorPreferences, ...patch };
    setConnectorPreferences(next);
    saveConnectorPreferences(next);
  };
  const session = useDocumentSession(store);
  const { document, history, selection, setSelection } = session;
  const layout = useAutoLayout();
  const [preparing, setPreparing] = useState(false);
  const [gesture, setGesture] = useState(false);
  const cleanupButton = useRef<HTMLButtonElement>(null);
  const cleanupLock = useRef(false);
  const cleanupRequest = useRef(0);
  const originalViewport = useRef<Viewport | null>(null);
  const previewViewport = useRef<Viewport | null>(null);
  const applying = useRef(false);
  const locked = preparing || layout.phase !== "idle";
  const blocked = locked || session.busy;
  const dispatch = (action: HistoryAction) => cleanupLock.current ? false : session.dispatch(action);
  const [modal, setModal] = useState<
    "new" | "rename" | "delete" | "reload" | "discard" | null
  >(null);
  const [panel, setPanel] = useState<"components" | "properties" | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function run(action: () => Promise<unknown>, close = true) {
    if (cleanupLock.current) return;
    setError("");
    try {
      await action();
      if (close) setModal(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      if (close) setModal(null);
    }
  }
  function download() {
    if (cleanupLock.current) return;
    try {
      const blob = new Blob([session.exportCurrent()], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document?.name.replace(/[^a-z0-9_-]/gi, "_") || "diagram"}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(String(e));
    }
  }
  const [tool, setTool] = useState<"select" | "pan">("select");
  const canvas = useRef<CanvasHandle>(null);
  function finishCleanup(restore: boolean) {
    cleanupRequest.current++;
    if (restore && originalViewport.current) canvas.current?.setViewport(originalViewport.current);
    originalViewport.current = null;
    previewViewport.current = null;
    cleanupLock.current = false;
    setPreparing(false);
    layout.cancel();
  }
  async function cleanUp() {
    if (cleanupLock.current || session.busy || gesture || !document?.nodes.length ||
      session.status === "error" || session.status === "conflict") return;
    // Blur synchronously to finish a valid inspector text transaction first.
    if (window.document.activeElement instanceof HTMLElement) window.document.activeElement.blur();
    cleanupLock.current = true;
    const request = ++cleanupRequest.current;
    originalViewport.current = { ...document.viewport };
    previewViewport.current = { ...document.viewport };
    setError("");
    setPreparing(true);
    try {
      const snapshot = await session.prepareCleanup();
      if (cleanupRequest.current !== request) return;
      originalViewport.current = snapshot.document.viewport;
      previewViewport.current = snapshot.document.viewport;
      layout.start(snapshot);
    } catch (error) {
      if (cleanupRequest.current === request) {
        setError(error instanceof Error ? error.message : String(error));
        finishCleanup(true);
      }
    } finally {
      if (cleanupRequest.current === request) setPreparing(false);
    }
  }
  async function applyCleanup() {
    if (!cleanupLock.current || !layout.snapshot || !layout.candidate || applying.current) return;
    applying.current = true;
    try {
      const applied = await session.applyCleanup(layout.snapshot, layout.candidate);
      if (applied) {
        if (previewViewport.current) session.dispatch({ type: "viewport", viewport: previewViewport.current });
        finishCleanup(false);
      }
    } finally { applying.current = false; }
  }
  useEffect(() => {
    if (layout.candidate) canvas.current?.fit();
  }, [layout.candidate]);
  useEffect(() => {
    if (!layout.snapshot) return;
    if (session.status === "error" || session.status === "conflict") {
      finishCleanup(layout.snapshot.installation === session.installation);
      return;
    }
    if (!applying.current && (layout.snapshot.installation !== session.installation ||
      layout.snapshot.generation !== session.generation))
      finishCleanup(layout.snapshot.installation === session.installation);
  }, [session.installation, session.generation, session.status, layout.snapshot, session.busy]);
  useEffect(() => {
    if (layout.error) { setError(layout.error); finishCleanup(true); }
  }, [layout.error]);
  useEffect(() => {
    if (!locked) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || applying.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      finishCleanup(true);
    };
    window.addEventListener("keydown", escape, true);
    return () => window.removeEventListener("keydown", escape, true);
  }, [locked]);
  const previouslyBlocked = useRef(false);
  useEffect(() => {
    if (locked) previouslyBlocked.current = true;
    if (previouslyBlocked.current && !blocked) {
      cleanupButton.current?.focus();
      previouslyBlocked.current = false;
    }
  }, [blocked, locked]);
  const remove = () => {
    if (!document || cleanupLock.current) return;
    dispatch({
      type: "preview",
      document: deleteSelection(document, selection),
    });
    dispatch({ type: "commit" });
    setSelection({ nodeIds: [], edgeIds: [] });
  };
  const duplicate = () => {
    if (!document || cleanupLock.current) return;
    const result = duplicateSelection(document, selection);
    if (!dispatch({ type: "preview", document: result.document })) return;
    dispatch({ type: "commit" });
    setSelection(result.selection);
  };
  return (
    <ConnectorPreferencesContext.Provider value={connectorPreferences}>
    <div className="app-shell">
      <header className="app-header">
        <button
          className="brand"
          onClick={() => void run(() => session.showPicker())}
          disabled={blocked}
        >
          <span>
            <Boxes size={22} />
          </span>
          System Canvas
        </button>
        <div className="header-divider" />
        <span className="document-title">
          {document?.name || "Your workspace"}
        </span>
        <div className="file-actions">
          {document && (
            <>
              <span role="status" className={`save-status ${session.status}`}>
                {session.status === "saved"
                  ? "Saved locally"
                  : session.status === "saving"
                    ? "Saving…"
                    : session.status === "conflict"
                      ? "Conflict — edits kept"
                      : "Save failed — edits kept"}
              </span>
              <button
                disabled={blocked}
                onClick={() => void run(() => session.showPicker())}
              >
                Diagrams
              </button>
            </>
          )}
          <button disabled={blocked} onClick={() => { if (!cleanupLock.current) setModal("new"); }}>
            New diagram
          </button>
          <button
            disabled={blocked}
            onClick={() => input.current?.click()}
          >
            Import JSON
          </button>
          {document && (
            <>
              <button
                disabled={blocked}
                onClick={() => {
                  setName(document.name);
                  setModal("rename");
                }}
                aria-label="Rename diagram"
              >
                Rename
              </button>
              <button
                disabled={blocked}
                onClick={() => void run(() => session.duplicate())}
                aria-label="Duplicate diagram"
              >
                Make a copy
              </button>
              <button disabled={blocked} onClick={download}>Export JSON</button>
              <button
                disabled={blocked}
                onClick={() => setModal("delete")}
                aria-label="Delete diagram"
              >
                Delete diagram
              </button>
            </>
          )}
          <input
            ref={input}
            aria-label="Import diagram file"
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file && !cleanupLock.current) void run(() => session.importFile(file));
            }}
          />
        </div>
      </header>
      {(error || session.error || session.warning) && (
        <div className="notice" role="alert">
          {error || session.error?.message || session.warning}
          {(session.status === "error" || session.status === "conflict") &&
            document && (
              <div className="recovery-actions">
                <button
                  disabled={blocked}
                  onClick={() => void run(() => session.retrySave())}
                >
                  Retry save
                </button>
                <button
                  disabled={blocked}
                  onClick={() => void run(() => session.saveAsCopy())}
                >
                  Save as copy
                </button>
                <button disabled={blocked} onClick={download}>Export JSON</button>
                <button
                  disabled={blocked}
                  onClick={() => setModal("reload")}
                >
                  Reload stored version
                </button>
                <button
                  disabled={blocked}
                  onClick={() => setModal("discard")}
                >
                  Discard edits and leave
                </button>
              </div>
            )}
        </div>
      )}
      {!document ? (
        <main className="library">
          <div className="library-card">
            {session.loading ? (
              <p>Opening local workspace…</p>
            ) : session.records.length ? (
              <>
                <span className="eyebrow">LOCAL WORKSPACE</span>
                <h1>Your diagrams</h1>
                <p>
                  Saved in this browser. Export JSON backups to keep a portable
                  copy.
                </p>
                <DiagramPicker
                  records={session.records}
                  busy={session.busy}
                  onOpen={(id) => void run(() => session.open(id))}
                />
              </>
            ) : (
              <>
                <span className="eyebrow">LOCAL WORKSPACE</span>
                <h1>Create a diagram</h1>
                <StarterDialog
                  busy={session.busy}
                  onCreate={(template, name) =>
                    void run(() => session.create(template, name))
                  }
                />
                <p className="storage-note">
                  Your diagrams stay in this browser on this device. Clearing
                  browser data removes them. Export JSON for a backup.
                </p>
              </>
            )}
          </div>
        </main>
      ) : (
        <div
          className={`workspace panel-${panel ?? "none"}`}
          inert={session.busy && !locked}
        >
          <nav className="panel-switches" aria-label="Editor panels">
            <button
              aria-expanded={panel === "components"}
              aria-label="Components panel"
              onClick={() =>
                setPanel(panel === "components" ? null : "components")
              }
            >
              Components
            </button>
            <button
              aria-expanded={panel === "properties"}
              aria-label="Properties panel"
              onClick={() =>
                setPanel(panel === "properties" ? null : "properties")
              }
            >
              Properties
            </button>
          </nav>
          <Palette disabled={blocked} onAdd={(id) => { if (!cleanupLock.current) canvas.current?.add(id); }} />
          <main>
            <Toolbar
              tool={tool}
              onTool={setTool}
              undo={() => dispatch({ type: "undo" })}
              redo={() => dispatch({ type: "redo" })}
              canUndo={!blocked && history!.past.length > 0}
              canRedo={!blocked && history!.future.length > 0}
              canDelete={!blocked && (
                document.nodes.some((node) =>
                  selection.nodeIds.includes(node.id),
                ) ||
                document.edges.some((edge) =>
                  selection.edgeIds.includes(edge.id),
                ))
              }
              canDuplicate={!blocked && document.nodes.some((node) =>
                selection.nodeIds.includes(node.id),
              )}
              onDelete={remove}
              onDuplicate={duplicate}
              cleanupBusy={session.busy}
              cleanupButtonRef={cleanupButton}
              cleanupPhase={preparing ? "preparing" : layout.phase}
              canCleanUp={!blocked && !gesture && document.nodes.length > 0 && session.status !== "error" && session.status !== "conflict"}
              onCleanUp={() => void cleanUp()}
              onApplyCleanup={() => void applyCleanup()}
              onCancelCleanup={() => { if (!applying.current) finishCleanup(true); }}
            />
            <Canvas
              key={session.installation}
              fitOnMount={session.fitOnOpen}
              ref={canvas}
              document={layout.candidate ?? document}
              readOnly={blocked}
              onPreviewViewport={(viewport) => { if (cleanupLock.current) previewViewport.current = viewport; }}
              onGestureChange={setGesture}
              selection={selection}
              tool={tool}
              onSelectionChange={setSelection}
              dispatch={dispatch}
            />
            <div className="canvas-footer">
              <span>Shift to select · Space to pan · ⌘ / Ctrl Z to undo</span>
              <span>
                {document.nodes.length} elements · {document.edges.length}{" "}
                connections
              </span>
            </div>
          </main>
          <Inspector disabled={blocked}
            onConnectorSetting={(patch) => { if (!cleanupLock.current) rememberConnectorPreferences(patch); }}
            document={document}
            selection={selection}
            dispatch={dispatch}
          />
        </div>
      )}
      {modal === "new" && (
        <Dialog
          title="Create a diagram"
          onClose={() => {
            if (!session.busy) setModal(null);
          }}
        >
          <StarterDialog
            busy={session.busy}
            onCancel={() => setModal(null)}
            onCreate={(template, name) =>
              void run(() => session.create(template, name))
            }
          />
        </Dialog>
      )}
      {modal === "rename" && (
        <Dialog title="Rename diagram" onClose={() => setModal(null)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void run(() => session.rename(name));
            }}
          >
            <label>
              Diagram name
              <input
                autoFocus
                maxLength={200}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <div className="dialog-actions">
              <button type="button" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="primary" type="submit">
                Save name
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {modal === "delete" && document && (
        <Dialog
          title="Delete this diagram?"
          onClose={() => {
            if (!session.busy) setModal(null);
          }}
        >
          <p>
            “{document.name}” will be permanently removed from this browser.
            Export a backup first if you need it.
          </p>
          <div className="dialog-actions">
            <button disabled={blocked} onClick={() => setModal(null)}>
              Cancel
            </button>
            <button
              className="danger"
              disabled={blocked}
              onClick={() => void run(() => session.remove(document.id))}
            >
              Delete permanently
            </button>
          </div>
        </Dialog>
      )}
      {(modal === "reload" || modal === "discard") && (
        <Dialog
          title="Discard unsaved edits?"
          onClose={() => {
            if (!session.busy) setModal(null);
          }}
        >
          <p>
            Your unsaved local changes will be lost. Export JSON or save as a
            copy to keep them.
          </p>
          <div className="dialog-actions">
            <button disabled={blocked} onClick={() => setModal(null)}>
              Cancel
            </button>
            <button
              className="danger"
              disabled={blocked}
              onClick={() =>
                void run(() =>
                  modal === "reload"
                    ? session.reloadStored()
                    : session.showPicker({ discard: true }),
                )
              }
            >
              {modal === "reload" ? "Discard and reload" : "Discard and leave"}
            </button>
          </div>
        </Dialog>
      )}
    </div>
    </ConnectorPreferencesContext.Provider>
  );
}
