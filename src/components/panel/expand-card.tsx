"use client";
import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
export function ExpandCard({
  title,
  label = "Editar",
  children,
}: {
  title: React.ReactNode;
  label?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <section className="panel-card">
      <div className="panel-card-heading">
        <div>{title}</div>
        <button
          type="button"
          className="button secondary button-small"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          {open ? "Cerrar" : label}
          {open ? (
            <ChevronUp size={16} aria-hidden="true" />
          ) : (
            <ChevronDown size={16} aria-hidden="true" />
          )}
        </button>
      </div>
      <div id={id} hidden={!open} className="panel-card-content">
        {children}
      </div>
    </section>
  );
}
