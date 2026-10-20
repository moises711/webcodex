"use client";
import { useActionState } from "react";
import { changePassword } from "@/server/actions/auth";
export default function PasswordForm() {
  const [error, action, pending] = useActionState(changePassword, "");
  return (
    <form action={action} className="form-grid">
      <label>
        Contraseña actual
        <input
          name="current"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <label>
        Nueva contraseña
        <input
          name="password"
          type="password"
          minLength={10}
          maxLength={72}
          autoComplete="new-password"
          required
        />
      </label>
      <label>
        Repetir nueva contraseña
        <input
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
        />
      </label>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <button className="button primary" disabled={pending}>
        {pending ? "Guardando…" : "Actualizar contraseña"}
      </button>
    </form>
  );
}
