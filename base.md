# Portal de Proyectos Corporativos — Base para Codex

Sistema web (Next.js) para **publicar y mostrar los proyectos y sistemas de la empresa, organizados por áreas**. Cada área tiene su propio vista donde se publicarion su trabajo ,para subir y gestionar su contenido (textos + imágenes). Los proyectos tipo "sistema" muestran nombre del sistema, link y credenciales demo.
"para las demas areas" con una foto o alguna imagen , informacion , fecha
que esten separados por secciones  para cada  area que se pueda crear  dentro del panel de administracion

## Orden de lectura (obligatorio para Codex)
1. `AGENTS.md` → reglas de trabajo y convenciones (leer SIEMPRE primero)
2. `01-PRD.md` → qué se construye, roles, flujos, pantallas
3. `02-ARQUITECTURA.md` → stack, carpetas, base de datos, rutas, seguridad
4. `03-DESIGN-SYSTEM.md` → colores, tipografía, componentes, reglas visuales
5. `04-REGLAS-DE-NEGOCIO.md` → permisos, publicación, credenciales demo
6. `05-ROADMAP-TAREAS.md` → fases y checklist; ejecutar en orden
7. `06-PUNTOS-SUELTOS.md` → decisiones pendientes y el valor por defecto asumido

## Cómo usarlo

1. Crea el repo vacío y copia estos `.md` en `/docs` (y `AGENTS.md` en la raíz).
2. Primer prompt a Codex:
   > Lee `AGENTS.md` y todos los archivos de `/docs`. Ejecuta la **Fase 0** de `05-ROADMAP-TAREAS.md`. No avances a la Fase 1 hasta que yo confirme. Si algo está en `06-PUNTOS-SUELTOS.md` como pendiente, usa el valor por defecto indicado.
3. Revisa cada fase, luego pide la siguiente.