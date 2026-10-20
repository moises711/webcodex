# 06 — Puntos sueltos y decisiones pendientes

Cada punto tiene un **valor por defecto** que Codex usará si el dueño no decide otra cosa. Cambiar la columna "Decisión" para sobrescribir.

| #   | Punto                             | Pregunta                                                            | Valor por defecto                                            | Decisión                                                     |
| --- | --------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1   | Nombre y logo                     | ¿Cómo se llama el portal y hay logo/colores de marca?               | Nombre "Portal de Proyectos", logo texto, paleta indigo/cian | Códex Cusco; logo original del usuario y paleta azul/celeste |
| 2   | Lista de áreas                    | ¿Qué áreas existen?                                                 | Sistemas, Ingeniería, Marketing, Operaciones (editable)      |                                                              |
| 3   | Visibilidad del sitio             | ¿Público en internet o solo red interna/empleados?                  | Público (credenciales solo para internos)                    |                                                              |
| 4   | Credenciales demo                 | ¿Quién puede verlas?                                                | `INTERNAL` (requiere login)                                  |                                                              |
| 5   | Usuarios internos                 | ¿Los empleados pueden registrarse para ver credenciales?            | Solo cuentas creadas por el super admin                      |                                                              |
| 6   | Login corporativo                 | ¿Usan Google Workspace / Microsoft 365?                             | Email + contraseña (SSO queda como mejora)                   |                                                              |
| 7   | Revisión antes de publicar        | ¿Un admin aprueba lo que sube el editor?                            | Desactivada (configurable en ajustes)                        |                                                              |
| 8   | Quién crea usuarios               | ¿Super admin o cada admin de área?                                  | Solo super admin                                             |                                                              |
| 9   | Almacenamiento de imágenes        | ¿S3/R2, Cloudinary o servidor propio?                               | Cloudflare R2 vía `StorageProvider`                          |                                                              |
| 10  | Hosting y base de datos           | ¿Vercel o servidor propio?                                          | Hostinger Node.js + MySQL/MariaDB                                       | MySQL local con datos trasladados; despliegue Hostinger pendiente         |
| 11  | Dominio                           | ¿Qué dominio/subdominio?                                            | Pendiente (usar `APP_URL`)                                   |                                                              |
| 12  | Idioma                            | ¿Solo español?                                                      | Solo español (estructura lista para i18n después)            |                                                              |
| 13  | Contenido sensible                | ¿Se pueden mostrar nombres de clientes o capturas con datos reales? | Política: no datos reales; mostrar aviso en el editor        |                                                              |
| 14  | Tipos de proyecto                 | ¿Además de Proyecto/Sistema hay otros (casos de éxito, eventos)?    | Solo `PROJECT` y `SYSTEM`                                    |                                                              |
| 15  | Campos extra de proyecto          | ¿Cliente, equipo, fechas inicio/fin, métricas?                      | Solo año, etiquetas y tecnologías                            |                                                              |
| 16  | Video                             | ¿Se necesita subir/embeber videos?                                  | No en v1 (solo imágenes)                                     |                                                              |
| 17  | Archivos adjuntos                 | ¿PDF, manuales?                                                     | No en v1                                                     |                                                              |
| 18  | Analítica                         | ¿Contar visitas por proyecto?                                       | No en v1 (se puede agregar Plausible/GA)                     |                                                              |
| 19  | Notificaciones                    | ¿Correo al enviar a revisión o publicar?                            | No en v1                                                     |                                                              |
| 20  | Correo transaccional              | ¿Para recuperar contraseña?                                         | Resend (variable `RESEND_API_KEY`)                           |                                                              |
| 21  | Respaldo                          | ¿Frecuencia de backup de BD e imágenes?                             | Diario (proveedor gestionado)                                |                                                              |
| 22  | Política de privacidad / términos | ¿Se necesitan páginas legales?                                      | Página simple "Aviso" editable                               |                                                              |
| 23  | Orden del contenido               | ¿Cómo se ordenan proyectos en el área?                              | Destacados primero, luego más recientes                      |                                                              |
| 24  | Límites                           | Tamaño/cantidad de imágenes                                         | 5 MB, 12 por proyecto                                        |                                                              |
| 25  | Credenciales vencidas             | ¿Alerta si un sistema demo cambió su clave?                         | Botón "reportar credencial inválida" (post-v1)               |                                                              |

## Riesgos detectados

- **Guardar credenciales:** aunque sean demo, protegerlas (cifrado + visibilidad + auditoría). Prohibido registrar usuarios reales de producción.
- **Permisos entre áreas:** el error más común. Cubrir con tests e2e antes de entregar.
- **Imágenes pesadas:** forzar conversión/optimización a WebP y límites.
- **Contenido enriquecido:** sanitizar para evitar XSS.
- **Dependencia del equipo:** si un editor se va, el super admin debe poder reasignar proyectos.
