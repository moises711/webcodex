"use client";
import { useActionState } from "react";
import { login } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
export default function LoginForm() {
  const [error, action, pending] = useActionState(login, "");
  return (
    <form action={action} className="form-grid">
      <label>
        Correo electrónico
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          maxLength={254}
        />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
      </label>
      {error && (
        <p role="alert" className="message error-message">
          {error}
        </p>
      )}
      <Button disabled={pending}>{pending ? "Ingresando…" : "Ingresar"}</Button>
      <p className="notice">
        Acceso exclusivo para cuentas habilitadas por la administración.
      </p>
    </form>
  );
}
