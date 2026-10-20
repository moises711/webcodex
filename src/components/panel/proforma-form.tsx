"use client";
import { useState } from "react";
import { Plus, Trash2, Download, FileText } from "lucide-react";
import {
  proformaDefaults,
  proformaSchema,
  calculateProforma,
  soles,
  type Proforma,
} from "@/lib/proforma";
export function ProformaForm({ date }: { date: string }) {
  const [data, setData] = useState<Proforma>({
    ...proformaDefaults,
    date,
    items: proformaDefaults.items.map((item) => ({ ...item })),
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const totals = calculateProforma(data);
  function set<K extends keyof Proforma>(key: K, value: Proforma[K]) {
    setData((previous) => ({ ...previous, [key]: value }));
  }
  function field(
    key: keyof Proforma,
    label: string,
    maxLength: number,
    type = "text",
    required = false,
  ) {
    return (
      <label>
        {label}
        <input
          name={key}
          type={type}
          required={required}
          maxLength={maxLength}
          value={String(data[key])}
          onChange={(event) => set(key, event.target.value as never)}
        />
      </label>
    );
  }
  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const parsed = proformaSchema.safeParse(data);
    if (!parsed.success) {
      setFailed(true);
      setMessage(parsed.error.issues[0]?.message || "Revisa los datos");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/proformas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "No se pudo generar la proforma");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Proforma-${data.number}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setFailed(false);
      setMessage("Proforma generada. Revisa el archivo descargado.");
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error ? error.message : "Error al descargar el PDF",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="proforma-builder" onSubmit={generate}>
      <div className="proforma-fields">
        <section className="panel-card">
          <h2>1. Empresa y documento</h2>
          <div className="proforma-field-grid">
            {field("number", "Número de proforma", 50, "text", true)}
            {field("date", "Fecha", 10, "date", true)}
            {field("company", "Empresa", 100, "text", true)}
            {field("ruc", "RUC de la empresa", 20)}
            {field("location", "Sede", 100)}
            {field("contact", "Contacto de la empresa", 180)}
          </div>
        </section>
        <section className="panel-card">
          <h2>2. Datos del cliente</h2>
          <div className="proforma-field-grid">
            {field("client", "Nombre / Razón social", 150, "text", true)}
            {field("document", "DNI / RUC del cliente", 30)}
            {field("address", "Dirección", 240)}
            {field("phone", "Teléfono / Contacto", 100)}
          </div>
        </section>
        <section className="panel-card">
          <h2>3. Alcance del servicio</h2>
          <div className="proforma-field-grid">
            {field("service", "Servicio", 180, "text", true)}
            {field("equipment", "Equipos", 180)}
            {field("delivery", "Tiempo de entrega", 150, "text", true)}
            <label>
              Validez (días)
              <input
                name="validity"
                type="number"
                min={1}
                max={365}
                required
                value={data.validity}
                onChange={(e) => set("validity", Number(e.target.value))}
              />
            </label>
          </div>
          <label>
            Alcance detallado (una línea por actividad)
            <textarea
              name="scope"
              rows={5}
              maxLength={3000}
              value={data.scope}
              onChange={(e) => set("scope", e.target.value)}
            />
          </label>
        </section>
        <section className="panel-card">
          <div className="section-heading">
            <h2>4. Presupuesto</h2>
            <button
              className="button secondary button-small"
              type="button"
              disabled={data.items.length >= 40}
              onClick={() =>
                set("items", [
                  ...data.items,
                  { description: "", quantity: 1, price: 0 },
                ])
              }
            >
              <Plus size={16} /> Agregar servicio
            </button>
          </div>
          <div className="proforma-items">
            {data.items.map((item, index) => (
              <div className="proforma-item" key={index}>
                <label>
                  Servicio {index + 1}
                  <input
                    required
                    maxLength={240}
                    value={item.description}
                    onChange={(e) =>
                      set(
                        "items",
                        data.items.map((line, i) =>
                          i === index
                            ? { ...line, description: e.target.value }
                            : line,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Cantidad
                  <input
                    aria-label={`Cantidad del servicio ${index + 1}`}
                    type="number"
                    required
                    min={1}
                    max={10000}
                    step={1}
                    value={item.quantity}
                    onChange={(e) =>
                      set(
                        "items",
                        data.items.map((line, i) =>
                          i === index
                            ? { ...line, quantity: Number(e.target.value) }
                            : line,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Precio unitario (S/)
                  <input
                    aria-label={`Precio del servicio ${index + 1}`}
                    type="number"
                    required
                    min={0}
                    max={1000000}
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      set(
                        "items",
                        data.items.map((line, i) =>
                          i === index
                            ? { ...line, price: Number(e.target.value) }
                            : line,
                        ),
                      )
                    }
                  />
                </label>
                <strong>{soles(totals.lines[index])}</strong>
                <button
                  type="button"
                  className="button secondary button-small"
                  disabled={data.items.length === 1}
                  aria-label={`Eliminar servicio ${index + 1}`}
                  onClick={() =>
                    set(
                      "items",
                      data.items.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={data.taxEnabled}
              onChange={(e) => set("taxEnabled", e.target.checked)}
            />
            Incluir IGV en el total
          </label>
          {data.taxEnabled && (
            <label>
              IGV (%)
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={data.taxRate}
                onChange={(e) => set("taxRate", Number(e.target.value))}
              />
            </label>
          )}
        </section>
        <section className="panel-card">
          <h2>5. Condiciones</h2>
          {(
            [
              ["warranty", "Garantía", 600],
              ["payment", "Forma de pago", 600],
              ["notes", "Observaciones", 1000],
            ] as const
          ).map(([key, label, max]) => (
            <label key={key}>
              {label}
              <textarea
                rows={2}
                maxLength={max}
                value={data[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </label>
          ))}
          {field("signer", "Nombre del responsable de la firma", 100)}
          <p className="notice">
            El documento deja espacios para firma del responsable y conformidad
            del cliente.
          </p>
        </section>
      </div>
      <aside
        className="panel-card proforma-summary"
        aria-label="Resumen de la proforma"
      >
        <FileText size={30} />
        <p className="eyebrow">RESUMEN EN TIEMPO REAL</p>
        <h2>{data.number || "Tu proforma"}</h2>
        <p>{data.client || "Completa los datos del cliente"}</p>
        <dl>
          <div>
            <dt>Servicios</dt>
            <dd>{data.items.length}</dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd>{soles(totals.subtotal)}</dd>
          </div>
          <div>
            <dt>
              IGV {data.taxEnabled ? `(${data.taxRate}%)` : "no incluido"}
            </dt>
            <dd>{soles(totals.tax)}</dd>
          </div>
          <div className="proforma-grand-total">
            <dt>Total</dt>
            <dd>{soles(totals.total)}</dd>
          </div>
        </dl>
        <button className="button primary" disabled={busy} type="submit">
          <Download size={18} />
          {busy ? "Generando PDF…" : "Descargar proforma PDF"}
        </button>
        <p className="notice">
          Revisa los datos antes de descargar. Esta versión genera el PDF; no
          guarda un historial de proformas.
        </p>
        {message && <p role={failed ? "alert" : "status"}>{message}</p>}
      </aside>
    </form>
  );
}
