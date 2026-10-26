import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

export function FileMenu({ children, disabled }: { children: ReactNode; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("pointerdown", outside);
    return () => window.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  return <div className="file-menu" ref={root} onKeyDown={event => {
    event.stopPropagation();
    if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
  }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} disabled={disabled} aria-label="Diagram actions" title="Diagram actions" aria-expanded={open} onClick={() => setOpen(!open)}><Menu size={20} aria-hidden="true" /></button>
    {open && <div className="file-menu-items" role="group" aria-label="Diagram actions" onClick={event => {
      if (event.target instanceof Element && event.target.closest("button")) {
        // Restore the trigger before a command opens a modal or removes this menu.
        trigger.current?.focus(); setOpen(false);
      }
    }}>{children}</div>}
  </div>;
}
