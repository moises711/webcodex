# 04 — Reglas de negocio

## Matriz de permisos

| Acción                           | Visitante | Interno | Editor                       | Admin área   | Super admin |
| -------------------------------- | --------- | ------- | ---------------------------- | ------------ | ----------- |
| Ver proyectos publicados         | ✅        | ✅      | ✅                           | ✅           | ✅          |
| Ver credenciales `PUBLIC`        | ✅        | ✅      | ✅                           | ✅           | ✅          |
| Ver credenciales `INTERNAL`      | ❌        | ✅      | ✅                           | ✅           | ✅          |
| Ver credenciales `HIDDEN`        | ❌        | ❌      | ✅ (su área)                 | ✅ (su área) | ✅          |
| Crear/editar proyecto de su área | ❌        | ❌      | ✅                           | ✅           | ✅          |
| Editar proyecto de otra área     | ❌        | ❌      | ❌                           | ❌           | ✅          |
| Publicar (sin revisión)          | ❌        | ❌      | ✅                           | ✅           | ✅          |
| Publicar (con revisión activa)   | ❌        | ❌      | ❌ (envía a revisión)        | ✅           | ✅          |
| Archivar/eliminar proyecto       | ❌        | ❌      | ❌ (solo archivar los suyos) | ✅           | ✅          |
| Editar datos del área            | ❌        | ❌      | ❌                           | ✅           | ✅          |
| Gestionar editores del área      | ❌        | ❌      | ❌                           | ✅           | ✅          |
| CRUD áreas y usuarios, ajustes   | ❌        | ❌      | ❌                           | ❌           | ✅          |

## Proyectos

1. `slug` único, generado del título (sin tildes, minúsculas, guiones). Si choca, agregar sufijo `-2`.
2. Para publicar: título, resumen, ≥ 1 imagen y portada son obligatorios. Si es sistema: nombre y URL válidos.
3. Al publicar se fija `publishedAt`; al despublicar vuelve a `DRAFT`.
4. Eliminar = borrado lógico recomendado (`ARCHIVED`); borrado definitivo solo admin y pide confirmación escribiendo el título.
5. Si un área se desactiva, sus proyectos dejan de ser públicos pero no se borran.
6. Máximo 12 imágenes por proyecto; 5 MB cada una; formatos jpg/png/webp.

## Sistemas y credenciales demo

1. Un proyecto tipo `SYSTEM` tiene exactamente 1 `SystemInfo` y 0..n `DemoCredential`.
2. Cada credencial: etiqueta (rol), usuario, contraseña, notas opcionales, activa/inactiva.
3. Contraseñas cifradas AES-256-GCM; en el panel se muestran enmascaradas con botón "mostrar" (acción auditada).
4. Visibilidad por sistema: `PUBLIC` (cualquiera), `INTERNAL` (requiere sesión), `HIDDEN` (solo panel). **Valor por defecto: `INTERNAL`.**
5. Mostrar siempre el aviso: "Credenciales de demostración. No usar datos reales."
6. Solo deben ser cuentas **demo**; el formulario muestra advertencia de no registrar credenciales de producción reales.
7. La URL debe ser `https://` (permitir `http://` solo si el super admin lo habilita) y se abre con `rel="noopener noreferrer" target="_blank"`.

## Áreas

- Nombre y slug únicos. Orden manual (drag & drop) para el listado público.
- Cada usuario puede pertenecer a 1..n áreas; el panel muestra un selector si tiene varias.
- Eliminar un área solo si no tiene proyectos; si los tiene, desactivar.

## Usuarios

- Super admin crea usuarios y envía invitación/contraseña temporal (cambio obligatorio en primer ingreso).
- Contraseña mínima 10 caracteres. Bloqueo temporal tras 5 intentos fallidos.
- Desactivar usuario cierra sus sesiones y conserva su historial.

## Auditoría

Registrar: quién, qué, cuándo, entidad. Visible solo para super admin. Retención sugerida: 12 meses.
