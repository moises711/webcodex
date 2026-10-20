import { auditLabel, entityLabel } from "@/lib/audit-labels";
import { requireSuperAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { DeleteRecord } from "@/components/panel/delete-record";
export default async function Page() {
  await requireSuperAdmin();
  const logs = await db.auditLog.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <>
      <h1>Auditoría</h1>
      <p className="notice">
        Últimos 200 eventos. No se registran contraseñas ni contenido de
        credenciales.
      </p>
      <div className="panel-card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Entidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>
                  {log.createdAt.toLocaleString("es-PE", {
                    timeZone: "America/Lima",
                  })}
                </td>
                <td>{log.user?.name || "Visitante"}</td>
                <td>{auditLabel(log.action)}</td>
                <td>
                  {entityLabel(log.entity)} · {log.entityId}
                </td>
                <td>
                  <DeleteRecord
                    id={log.id}
                    entity="AuditLog"
                    name={auditLabel(log.action)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!logs.length && (
          <p className="empty-state">No hay eventos registrados.</p>
        )}
      </div>
    </>
  );
}
