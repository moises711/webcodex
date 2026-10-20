"use client";
import { useId, useState } from "react";
import { Trash2 } from "lucide-react";
import { ActionForm } from "./action-form";
import { deleteRecord } from "@/server/actions/delete";
export function DeleteRecord({
  id,
  entity,
  name,
  warning,
}: {
  id: string;
  entity: "Project" | "Area" | "User" | "AuditLog";
  name: string;
  warning?: string;
}) {
  const [open, setOpen] = useState(false);
  const confirmationId = useId();
  return (
    <div className="delete-record">
      <button
        type="button"
        className="button destructive button-small"
        aria-expanded={open}
        aria-controls={confirmationId}
        onClick={() => setOpen(!open)}
      >
        <Trash2 size={16} aria-hidden="true" /> Eliminar
      </button>
      {open && (
        <div id={confirmationId} className="panel-card delete-confirmation">
          <p>
            Eliminar «{name}». Esta acción es permanente. {warning}
          </p>
          <ActionForm action={deleteRecord} label="Eliminar definitivamente">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="entity" value={entity} />
            <label>
              Escribe ELIMINAR para confirmar
              <input
                name="confirmation"
                required
                pattern="ELIMINAR"
                autoComplete="off"
              />
            </label>
          </ActionForm>
          <button
            type="button"
            className="button secondary button-small"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
