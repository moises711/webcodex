"use client";
import { useState, useTransition } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projectSchema, type ProjectInput } from "@/lib/validators/project";
import {
  saveProject,
  setProjectStatus,
  duplicateProject,
} from "@/server/actions/projects";
import { LiveContentCard } from "./live-content-card";
import { ImageUploader } from "./image-uploader";
import { Credentials } from "@/components/public/credentials";
export function ProjectForm({
  id,
  initial,
  areas,
  media = [],
  coverId = null,
  status = "DRAFT",
  allowPublish = true,
}: {
  id?: string;
  initial: ProjectInput;
  areas: { id: string; name: string; slug?: string }[];
  media?: { id: string; url: string; alt: string }[];
  coverId?: string | null;
  status?: string;
  allowPublish?: boolean;
}) {
  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: initial,
  });
  const fields = useFieldArray({
    control: form.control,
    name: "credentials",
    keyName: "fieldKey",
  });
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const [savedId, setSavedId] = useState(id);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewSelection, setPreviewSelection] = useState({ media, coverId });
  const liveValues = useWatch({ control: form.control });
  const previewPhoto = previewSelection.media.find(
    (item) => item.id === previewSelection.coverId,
  );

  const type = useWatch({ control: form.control, name: "type" });
  const areaId = useWatch({ control: form.control, name: "areaId" });
  const selectedArea = areas.find((area) => area.id === areaId);
  const systemsArea = selectedArea?.slug === "sistemas";
  function save(value: ProjectInput) {
    start(async () => {
      let contentSaved = !!savedId;
      try {
        const result = await saveProject(savedId, {
          ...value,
          systemName: value.type === "SYSTEM" ? value.title : value.systemName,
        });
        setMessage(result.error || result.message || "");
        if (!result.id || result.error) return;
        setSavedId(result.id);
        contentSaved = true;
        for (const photo of photos) {
          const data = new FormData();
          data.set("projectId", result.id);
          data.set(
            "alt",
            `${value.title} · ${photo.name.replace(/\.[^.]+$/, "")}`.slice(
              0,
              300,
            ),
          );
          data.set("file", photo);
          const response = await fetch("/api/upload", {
            method: "POST",
            body: data,
          });
          const uploaded = await response.json();
          if (!response.ok) {
            setMessage(
              `El contenido está guardado. ${uploaded.error || "No se pudo subir la foto."} Puedes volver a guardar para reintentar las fotos pendientes.`,
            );
            return;
          }
          setPhotos((previous) => previous.filter((item) => item !== photo));
        }
        if (!id) router.push(`/panel/proyectos/${result.id}#imagenes`);
        else router.refresh();
      } catch {
        setMessage(
          contentSaved
            ? "El contenido está guardado. Revisa la conexión y vuelve a guardar para reintentar las fotos pendientes."
            : "No se pudo guardar el contenido.",
        );
      }
    });
  }
  function change(status: string) {
    if (!id) return;
    start(async () => {
      try {
        const result = await setProjectStatus(id, status);
        setMessage(result.error || result.message || "");
        router.refresh();
      } catch {
        setMessage("No se pudo cambiar el estado.");
      }
    });
  }
  return (
    <div className={`form-grid project-editor ${id ? "has-project" : ""}`}>
      <form
        id="content-form"
        onSubmit={form.handleSubmit(save)}
        className="form-grid"
      >
        <a
          className="button secondary preview-mobile-jump"
          href="#live-preview"
        >
          Ver tarjeta
        </a>
        {systemsArea && (
          <fieldset className="system-type-switch">
            <legend>Tipo de contenido</legend>
            <div className="system-type-options">
              {(
                [
                  { value: "WEBSITE", label: "Página web" },
                  { value: "SYSTEM", label: "Sistema de administración" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={type === option.value ? "is-selected" : ""}
                >
                  <input
                    type="radio"
                    name="system-content-type"
                    value={option.value}
                    checked={type === option.value}
                    onChange={() => {
                      form.setValue("type", option.value);
                      form.setValue("systemName", form.getValues("title"));
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <section className="form-section">
          <h2>
            {systemsArea ? "Información básica" : "Información del trabajo"}
          </h2>
          <div className="form-grid">
            <label>
              Título
              <input
                {...form.register("title", {
                  onChange: (event) =>
                    form.setValue("systemName", event.target.value),
                })}
                maxLength={160}
              />
            </label>
            <label>
              Descripción del trabajo
              <textarea {...form.register("summary")} maxLength={200} />
              <span className="field-hint">Máximo 200 caracteres</span>
            </label>
            <div className="two-columns">
              {id && (
                <label>
                  Área
                  <select
                    {...form.register("areaId", {
                      onChange: (event) => {
                        const isSystems =
                          areas.find((a) => a.id === event.target.value)
                            ?.slug === "sistemas";
                        form.setValue("type", isSystems ? "SYSTEM" : "PROJECT");
                        form.setValue("credentials", []);
                        form.setValue("coverLinkUrl", "");
                        form.setValue("coverLinkText", "");
                      },
                    })}
                  >
                    {areas.map((a) => (
                      <option value={a.id} key={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Fecha del trabajo
                <input type="date" {...form.register("workDate")} />
                <span className="field-hint">
                  Obligatoria para publicar. Indica día, mes y año.
                </span>
              </label>
            </div>
          </div>
        </section>
        {(type === "WEBSITE" || !systemsArea) && (
          <section className="form-section">
            <h2>
              {type === "WEBSITE"
                ? "Enlace de la página web"
                : "Enlace del trabajo (opcional)"}
            </h2>
            <p className="notice">
              {type === "WEBSITE"
                ? "Agrega el enlace de la página web y selecciona una imagen de referencia en este paso."
                : "Incluye un enlace si el trabajo está publicado en otra plataforma."}
            </p>
            <div className="two-columns">
              <label>
                Enlace de destino
                <input
                  type="url"
                  placeholder="https://"
                  {...form.register("coverLinkUrl", {
                    onChange: (event) => {
                      if (!systemsArea)
                        form.setValue(
                          "coverLinkText",
                          event.target.value ? "Ver trabajo" : "",
                        );
                    },
                  })}
                />
              </label>
            </div>
            {form.formState.errors.coverLinkUrl && (
              <p role="alert" className="error-message">
                {form.formState.errors.coverLinkUrl.message}
              </p>
            )}
            {form.formState.errors.coverLinkText && (
              <p role="alert" className="error-message">
                {form.formState.errors.coverLinkText.message}
              </p>
            )}
          </section>
        )}
        {type === "SYSTEM" && (
          <section className="form-section">
            <h2>Datos del sistema</h2>
            <div className="form-grid">
              <label>
                URL de acceso
                <input {...form.register("systemUrl")} placeholder="https://" />
              </label>
              <p className="notice">
                Correo y contraseña de la cuenta de demostración.
              </p>
              {fields.fields.map((field, index) => (
                <div className="panel-card form-grid" key={field.fieldKey}>
                  <div className="two-columns">
                    <label>
                      Correo electrónico (Gmail)
                      <input
                        type="email"
                        autoComplete="off"
                        placeholder="correo@gmail.com"
                        {...form.register(`credentials.${index}.username`)}
                      />
                    </label>
                    <label>
                      {field.id
                        ? "Nueva contraseña (vacía para conservar)"
                        : "Contraseña demo"}
                      <input
                        type="password"
                        autoComplete="off"
                        {...form.register(`credentials.${index}.password`)}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => fields.remove(index)}
                  >
                    Quitar credencial
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  fields.append({
                    label: "Acceso demo",
                    username: "",
                    password: "",
                    notes: "",
                    isActive: true,
                  })
                }
              >
                Agregar credencial demo +
              </button>
            </div>
          </section>
        )}
        {!id && (
          <section className="form-section">
            <h2>Fotos del trabajo</h2>
            <p className="notice">
              Selecciona hasta 12 fotos. La primera será la portada. JPG, PNG o
              WebP, máximo 5 MB por foto. Agrega al menos una foto para
              publicar.
            </p>
            <label>
              Seleccionar fotos
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={pending}
                onChange={(event) => {
                  const incoming = Array.from(event.target.files || []);
                  if (
                    incoming.some(
                      (file) =>
                        !file.size ||
                        file.size > 5 * 1024 * 1024 ||
                        !["image/jpeg", "image/png", "image/webp"].includes(
                          file.type,
                        ),
                    )
                  ) {
                    setMessage("Usa JPG, PNG o WebP de hasta 5 MB por foto.");
                    event.target.value = "";
                    return;
                  }
                  if (photos.length + incoming.length > 12) {
                    setMessage("Puedes seleccionar un máximo de 12 fotos.");
                    event.target.value = "";
                    return;
                  }
                  setPhotos((previous) => [...previous, ...incoming]);
                  setMessage("");
                  event.target.value = "";
                }}
              />
            </label>
            {photos.length > 0 && (
              <ul className="pending-photo-list">
                {photos.map((photo, index) => (
                  <li key={`${photo.name}-${index}`}>
                    <span>
                      {photo.name}
                      {index === 0 ? " · Portada" : ""}
                    </span>
                    <button
                      className="button destructive"
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        setPhotos((previous) =>
                          previous.filter((_, i) => i !== index),
                        )
                      }
                      aria-label={`Quitar ${photo.name}`}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {Object.keys(form.formState.errors).length > 0 && (
          <p role="alert" className="error-message">
            Revisa los campos obligatorios:{" "}
            {Object.keys(form.formState.errors).join(", ")}.
          </p>
        )}
        <div className="form-actions">
          <button className="button primary" disabled={pending}>
            {pending
              ? "Guardando…"
              : id
                ? "Guardar cambios"
                : "Guardar contenido"}
          </button>
          <Link className="button secondary" href="/panel/proyectos">
            Volver a proyectos
          </Link>
        </div>
      </form>
      <div className="project-editor-side">
        <LiveContentCard
          title={liveValues.title}
          summary={liveValues.summary}
          date={liveValues.workDate}
          area={selectedArea?.name}
          type={type}
          link={
            type === "SYSTEM" ? liveValues.systemUrl : liveValues.coverLinkUrl
          }
          photo={photos[0]}
          savedPhoto={previewPhoto}
        />
        <p role="status" className="message">
          {message}
        </p>
        {id ? (
          <>
            <ImageUploader
              projectId={id}
              initial={media}
              initialCover={coverId}
              onChange={setPreviewSelection}
            />
            {type === "SYSTEM" && (
              <section className="form-section">
                <h2>Consultar accesos guardados</h2>
                <Credentials projectId={id} panel />
              </section>
            )}
            <section className="form-section">
              <h2>Publicación</h2>
              <p className="notice">
                Estado actual:{" "}
                {
                  (
                    {
                      DRAFT: "Borrador",
                      IN_REVIEW: "En revisión",
                      PUBLISHED: "Publicado",
                      ARCHIVED: "Archivado",
                    } as Record<string, string>
                  )[status]
                }
              </p>
              <div className="form-actions">
                <Link
                  className="button secondary"
                  href={`/panel/proyectos/${id}/vista-previa`}
                >
                  Vista previa
                </Link>
                {allowPublish ? (
                  <button
                    className="button primary"
                    disabled={pending}
                    onClick={() => change("PUBLISHED")}
                  >
                    Publicar
                  </button>
                ) : (
                  <button
                    className="button primary"
                    disabled={pending}
                    onClick={() => change("IN_REVIEW")}
                  >
                    Enviar a revisión
                  </button>
                )}
                <button
                  className="button secondary"
                  disabled={pending}
                  onClick={() => change("DRAFT")}
                >
                  Volver a borrador
                </button>
                <button
                  className="button destructive"
                  disabled={pending}
                  onClick={() => {
                    if (
                      window.confirm(
                        "¿Archivar este proyecto? Dejará de ser visible en el portal.",
                      )
                    )
                      change("ARCHIVED");
                  }}
                >
                  Archivar
                </button>
                <button
                  className="button secondary"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      try {
                        const result = await duplicateProject(id);
                        if (result.id)
                          router.push(`/panel/proyectos/${result.id}#imagenes`);
                        else setMessage(result.error || "");
                      } catch {
                        setMessage("No se pudo duplicar el proyecto.");
                      }
                    })
                  }
                >
                  Duplicar
                </button>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
