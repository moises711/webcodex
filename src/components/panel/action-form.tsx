"use client";
import { useActionState } from "react";
import type { ActionResult } from "@/server/actions/admin";
export function ActionForm({
  action,
  children,
  label = "Guardar",
}: {
  action: (previous: ActionResult, form: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  label?: string;
}) {
  const [result, submit, pending] = useActionState(action, { message: "" });
  return (
    <form action={submit} className="form-grid">
      {children}
      <button className="button secondary" disabled={pending}>
        {pending ? "Guardando…" : label}
      </button>
      {result.message && (
        <p
          role={result.error ? "alert" : "status"}
          className={result.error ? "error-message" : "message"}
        >
          {result.message}
        </p>
      )}
      {result.temporaryPassword && (
        <div className="message">
          <strong>Clave temporal (cópiala ahora)</strong>
          <p className="mono">{result.temporaryPassword}</p>
          <p className="notice">
            No se mostrará al recargar. Compártela solo con el usuario
            correspondiente.
          </p>
        </div>
      )}
    </form>
  );
}
