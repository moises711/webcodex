const labels: Record<string, string> = {
  AREA_UPDATED: "Servicio actualizado",
  AREA_CREATED: "Servicio creado",
  AREAS_REORDERED: "Servicios reordenados",
  AREA_COVER_UPLOADED: "Portada de servicio actualizada",
  USER_UPDATED: "Usuario actualizado",
  USER_CREATED: "Usuario creado",
  TEAM_UPDATED: "Equipo actualizado",
  SETTINGS_UPDATED: "Configuración actualizada",
  PASSWORD_CHANGED: "Contraseña cambiada",
  PASSWORD_RESET: "Contraseña restablecida",
  CREDENTIALS_VIEWED: "Accesos consultados",
  PROJECT_UPDATED: "Proyecto actualizado",
  PROJECT_CREATED: "Proyecto creado",
  PROJECT_DRAFT: "Proyecto guardado como borrador",
  PROJECT_IN_REVIEW: "Proyecto enviado a revisión",
  PROJECT_PUBLISHED: "Proyecto publicado",
  PROJECT_ARCHIVED: "Proyecto archivado",
  PROJECT_DUPLICATED: "Proyecto duplicado",
  MEDIA_UPDATED: "Imagen actualizada",
  IMAGE_UPLOADED: "Imagen subida",
  PROJECT_DELETED: "Proyecto eliminado",
  USER_DELETED: "Usuario eliminado",
  MEDIA_DELETED: "Imagen eliminada",
  AUDITLOG_DELETED: "Evento eliminado",
  PROFORMA_DELETED: "Proforma eliminada",
  PRODUCTION_PREPARED: "Contenido de demostración retirado del sitio público",
};
export function auditLabel(action: string) {
  return labels[action] || "Actividad administrativa";
}
export function entityLabel(entity: string) {
  return (
    (
      {
        Area: "Servicio",
        Project: "Proyecto",
        User: "Usuario",
        Media: "Imagen",
        AuditLog: "Evento",
        SiteSettings: "Configuración",
        Proforma: "Proforma",
      } as Record<string, string>
    )[entity] || "Registro"
  );
}
