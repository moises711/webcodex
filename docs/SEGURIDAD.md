# Revisión de seguridad · 20/10/2026

Se revisaron el código y la configuración locales, las dependencias instaladas, la autenticación, las acciones del servidor, las APIs, los permisos por área, los archivos y el contenido público. Se probaron las protecciones en una instancia local compilada en modo producción. Esto no certifica ausencia de vulnerabilidades ni sustituye una revisión del hosting desplegado.

## Problemas corregidos

| Hallazgo | Corrección |
| --- | --- |
| El contador público aceptaba origen ausente y JSON sin un límite explícito de tamaño | Origen obligatorio, JSON limitado a 1 KiB, tiempo máximo de lectura y cuota compartida |
| Los intentos de ingreso se limitaban por cuenta, pero se podían repartir entre muchas cuentas | Cuota adicional por dirección del cliente, independiente del contador por cuenta |
| Cambio de contraseña y operaciones costosas sin cuotas específicas | Límites compartidos para cambio y recuperación de contraseña, subida de imágenes, PDF y lectura de accesos demo |
| Enlaces de recuperación pendientes seguían válidos después de cambiar la contraseña | Invalidación de los enlaces no usados dentro de la transacción del cambio de contraseña |
| El tiempo de envío del correo podía distinguir una cuenta existente de otra inexistente | Respuesta genérica antes de buscar la cuenta y enviar correo, mediante `after()` de Next.js |
| Las credenciales internas podían consultarse con una sesión que debía cambiar su contraseña | Se deniega el acceso interno y privado hasta completar el cambio |
| Un administrador de área podía asignar como portada una URL privada de otra área | Se valida la propiedad de la imagen antes de guardar la referencia |
| La validación del contenido enriquecido solo comprobaba su tamaño | Validación de estructura, tipos, profundidad, número de nodos y tamaño; el renderizador rechaza documentos inválidos |
| La política de scripts permitía JavaScript inline | CSP con nonce aleatorio por respuesta, aplicado a scripts del framework, tema y datos estructurados |
| Los objetos nuevos de S3/R2 se enlazaban directamente al origen público | Las imágenes pasan por `/api/media/` y su comprobación de publicación o permisos; el bucket debe configurarse privado |
| La comprobación del último administrador podía quedar obsoleta entre solicitudes simultáneas | Se comprueba de nuevo dentro de una transacción serializable |
| Posible filtración de tokens de recuperación por Referer o caché | `no-referrer` y `private, no-store` en páginas de autenticación |
| Exportaciones generadas podían incluirse por error en Git | `/output/` añadido a las exclusiones; los archivos `.env` y `.local/` ya estaban excluidos |

Las mutaciones HTTP también rechazan orígenes ausentes, `null` o externos en Proxy. Las rutas mantienen sus comprobaciones propias. Las cargas multipart y JSON tienen límites de bytes reales y lectura de 10 segundos; no se confía únicamente en `Content-Length`. Next.js limita los cuerpos de Server Actions a 256 KiB y el búfer de Proxy a 6 MiB. Las imágenes originales se validan y convierten a WebP, sin aceptar SVG ni imágenes animadas.

## Cuotas

| Operación | Límite |
| --- | --- |
| Ingreso por cliente | 50 solicitudes / 15 minutos, además de 5 intentos por cuenta |
| Solicitar recuperación | 10 / 15 minutos por cliente, además del contador por correo |
| Restablecer contraseña | 20 / 15 minutos por cliente |
| Cambiar contraseña actual | 5 / 15 minutos por usuario |
| Subir imágenes | 60 / 10 minutos por usuario |
| Generar PDF | 20 / 5 minutos por usuario |
| Leer credenciales demo | 30 / 5 minutos por usuario o cliente anónimo |
| Registrar visitas | 60 / minuto por cliente |

Los contadores se guardan en MySQL y se comparten entre procesos. No contienen contraseñas ni direcciones IP en texto plano. Con `TRUST_PROXY=false`, las cabeceras de IP se ignoran y se aplica una cuota conservadora compartida; en producción configura un proxy que sobrescriba `X-Forwarded-For` antes de activar `TRUST_PROXY=true`. No actives esa opción si se puede acceder directamente al proceso Node desde Internet.

## Dependencias

- Auditoría de producción posterior a los cambios: **0 avisos conocidos**.
- `effect` actualizado de 3.18.4 a 3.22.3 mediante override compatible con la versión corregida.
- `deepmerge-ts` actualizado de 7.1.5 a 8.0.2. Prisma genera el cliente y valida el esquema con esta versión.
- Auditoría completa: queda **1 aviso alto de desarrollo** en `braces` 3.0.3, a través de ESLint. El aviso no tiene versión corregida publicada a la fecha de la revisión. No se marca como resuelto ni se oculta del informe. El servidor debe ejecutarse sin herramientas de desarrollo innecesarias y no procesar patrones glob de usuarios.

Fuentes: [Effect GHSA-38f7-945m-qr2g](https://github.com/advisories/GHSA-38f7-945m-qr2g), [DeepmergeTS GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx), [braces GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

## Comprobaciones

- **35 pruebas automatizadas correctas** de orígenes falsos, límites de bytes reales, lectura lenta, contenido malformado, permisos, archivos privados, criptografía, recuperación y cuotas.
- Veinte solicitudes concurrentes al limitador: solo cinco aceptadas con cuota de cinco; identidad independiente y reinicio al vencer la ventana. Los dos contadores temporales se eliminaron al terminar.
- Navegador en producción local: nonce diferente por respuesta; scripts legítimos e interacción React funcionales; manejador HTML inline inyectado bloqueado; mutaciones externas rechazadas; APIs protegidas sin sesión denegadas; archivos `.env` y `.git` no expuestos.
- Prisma, TypeScript, ESLint y compilación de producción.
- Se conservaron las publicaciones reales del usuario. Las pruebas automatizadas añadidas usan dobles de base de datos y no crean usuarios ni trabajos de demostración. Las pruebas del navegador no guardan formularios.

La CSP mantiene estilos inline para los estilos dinámicos de la interfaz; no permite scripts inline sin nonce en producción. Las páginas HTML se renderizan dinámicamente para generar un nonce nuevo por respuesta. Se conserva la caché de consultas del catálogo y de recursos estáticos. Un CDN no debe reutilizar HTML con nonce entre respuestas.

## Antes del despliegue

El entorno comprobado sigue siendo local: no tiene HTTPS ni S3/R2 configurados. No se ha comprobado ni modificado un hosting remoto.

1. Ejecuta `pnpm build` y `pnpm start` con `NODE_ENV=production`; no expongas `pnpm dev`. Configura HTTPS y `APP_URL` / `AUTH_URL` con el dominio público HTTPS. HSTS se activa en producción cuando `APP_URL` usa HTTPS.
2. Bloquea el acceso público del bucket S3/R2 y configura una identidad con permisos mínimos de lectura y escritura de imágenes. Las URLs antiguas que apunten directamente a un bucket público requieren migración; el cambio de código por sí solo no privatiza un bucket externo.
3. Configura límites y tiempos de lectura también en el proxy/hosting, protección WAF contra abuso y DDoS y acceso restringido al puerto de Node. Los límites de aplicación no protegen por sí solos contra saturación de red.
4. Mantén las claves actuales de cifrado y sesión en el almacén de secretos; no regeneres la clave de cifrado si hay contraseñas demo que conservar. La comprobación local verificó presencia y tamaño de claves sin imprimir valores, y permisos restringidos de `.env`.
5. Usa un usuario MySQL de aplicación con permisos mínimos, separa las credenciales de migración, mantén Node y el sistema operativo actualizados y prueba los respaldos.
6. Construye en un entorno controlado y separa las dependencias de desarrollo del proceso de producción. Vigila el aviso pendiente de `braces`.

Repetir la comprobación sin datos de ejemplo:

```bash
pnpm security:check
pnpm build
```

Para retirar contadores y tokens vencidos hace más de 24 horas:

```bash
pnpm security:maintenance
```

El mantenimiento no borra usuarios, áreas, publicaciones ni archivos. Se proporciona el comando; no se creó una tarea programada automática.

Referencias de controles: [seguridad de datos de Next.js](https://nextjs.org/docs/app/guides/data-security), [recuperación de cuentas OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [subida de archivos OWASP](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
