import { useRef, useState } from "react";

export function EditableTitle({ name, disabled, onRename }: { name: string; disabled: boolean; onRename: (name: string) => void }) {
  const [draft, setDraft] = useState(name);
  const [editing, setEditing] = useState(false);
  const cancelled = useRef(false);
  return <input className="document-title title-input" aria-label="Diagram title" title="Edit diagram title"
    disabled={disabled} maxLength={200} value={editing ? draft : name}
    onFocus={event => { cancelled.current = false; setDraft(name); setEditing(true); event.currentTarget.select(); }}
    onChange={event => setDraft(event.target.value)}
    onBlur={() => {
      setEditing(false);
      if (!cancelled.current && draft.trim() && draft.trim() !== name) onRename(draft.trim());
    }}
    onKeyDown={event => {
      event.stopPropagation();
      if (event.key === "Escape") { cancelled.current = true; event.currentTarget.blur(); }
      if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); }
    }} />;
}
