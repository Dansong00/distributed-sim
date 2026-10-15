import { useState } from "react";
export function StarterDialog({
  onCreate,
  busy,
  onCancel,
}: {
  onCreate: (template: "blank" | "web" | "notes", name: string) => void;
  busy: boolean;
  onCancel?: () => void;
}) {
  const [template, setTemplate] = useState<"blank" | "web" | "notes">("blank");
  const [name, setName] = useState("Untitled diagram");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCreate(template, name);
      }}
      className="starter-form"
    >
      <p>Start with an empty canvas or a small, editable example.</p>
      <label>
        Starter
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value as typeof template)}
        >
          <option value="blank">Blank canvas</option>
          <option value="web">Web application</option>
          <option value="notes">Note-taking app</option>
        </select>
      </label>
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
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
        <button className="primary" disabled={busy} type="submit">
          {busy ? "Creating…" : "Create diagram"}
        </button>
      </div>
    </form>
  );
}
