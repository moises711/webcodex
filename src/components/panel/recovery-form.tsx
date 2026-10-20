"use client";
import { useActionState } from "react";
import { requestPasswordReset, resetPassword } from "@/server/actions/recovery";
export function RecoveryForm({ token }: { token?: string }) {
  const [message, action, pending] = useActionState(
    token ? resetPassword : requestPasswordReset,
    "",
  );
  return (
    <form action={action} className="form-grid">
      {token ? (
        <>
          <input type="hidden" name="token" value={token} />
          <label>
            Nueva contraseña
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={10}
              maxLength={72}
            />
          </label>
          <label>
            Repetir contraseña
            <input
              type="password"
              name="confirmation"
              autoComplete="new-password"
              required
            />
          </label>
        </>
      ) : (
        <label>
          Correo electrónico
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
      )}
      <button className="button primary" disabled={pending}>
        {pending
          ? "Procesando…"
          : token
            ? "Restablecer contraseña"
            : "Solicitar enlace"}
      </button>
      {message && (
        <p role="status" className="message">
          {message}
        </p>
      )}
    </form>
  );
}
