# 03 — Design System · Códex Cusco

Estilo: **moderno, limpio, tecnológico**, derivado del logo de Códex Cusco: una "X" formada por **líneas de circuito y nodos**, con degradado celeste → azul, y el nombre en azul marino. Todo el lenguaje visual (fondos, animaciones, íconos decorativos) debe recordar a un **circuito electrónico**: líneas finas, ángulos de 45°/90°, nodos circulares y pulsos de luz que viajan por las líneas.

Inspiración de interfaz: Linear, Vercel, Notion. Mucho espacio en blanco, tarjetas redondeadas, sombras suaves.

---

## 1. Identidad de marca (del logo)
| Elemento | Valor |
|---|---|
| Logo | "X" de circuito + wordmark "Códex" (azul marino, bold) + "Cusco" (azul claro) |
| Archivos necesarios | `logo-color.svg`, `logo-white.svg` (fondos oscuros), `logo-icon.svg` (solo la X), favicon |
| Zona de respeto | Alrededor del logo: mínimo el alto de la "C" de Códex |
| Tamaño mínimo | Navbar 32 px de alto · icono solo 24 px |
| Prohibido | Deformar, rotar, cambiar colores, poner sobre fondos con poco contraste |

> Los colores se estimaron del logo. Verificar con cuentagotas sobre el archivo original y ajustar solo los tokens `--navy-*` y `--brand-*`.

## 2. Paleta (tokens)

### Marca
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--navy-900` | `#1E3A5F` | `#EAF3FA` | Títulos, sidebar del panel, texto "Códex" |
| `--brand-600` (primario) | `#216AA3` | `#4FB3E8` | Botones primarios, enlaces, foco (contraste AA con texto blanco) |
| `--brand-500` (azul del logo) | `#2F86C8` | `#5BBCEB` | Hover, íconos, líneas de circuito |
| `--sky-400` (celeste) | `#4FB3E8` | `#7CCBF0` | Acentos, nodos, pulsos de luz |
| `--sky-200` | `#B9E1F5` | `#1F4A6B` | Bordes suaves, halos |
| `--brand-100` | `#E3F2FB` | `#12304A` | Fondos suaves, badges |

### Neutros
| Token | Claro | Oscuro |
|---|---|---|
| `--bg` | `#F5F9FC` | `#0A1626` |
| `--surface` (tarjetas) | `#FFFFFF` | `#11233A` |
| `--surface-2` | `#EDF3F8` | `#162C47` |
| `--border` | `#DCE7F0` | `#1F3652` |
| `--text` | `#0F2238` | `#EAF3FA` |
| `--text-muted` | `#5B7186` | `#8FA8C0` |

### Semánticos
`--success #16A34A` · `--warning #F59E0B` · `--danger #DC2626` · `--info #0EA5E9`

### Degradados
- `--grad-brand`: `linear-gradient(135deg, #6EC6EE 0%, #2F86C8 100%)` (el del logo). Solo hero, botón destacado, portadas sin imagen.
- `--grad-navy`: `linear-gradient(160deg, #1E3A5F 0%, #0F2238 100%)` para sidebar del panel, login y footer.
- `--glow`: `0 0 24px rgba(79,179,232,.35)` para pulsos y hover destacado.

### Colores por área (acento configurable)
Cada área guarda un hex elegido en el panel. Paleta sugerida del selector: `#2F86C8 #4FB3E8 #14B8A6 #10B981 #F59E0B #EF4444 #EC4899 #8B5CF6` + hex personalizado. Se usa en: borde superior de la tarjeta, badge, ícono, halo del hover y degradado de portada. Calcular automáticamente texto blanco/oscuro según contraste (AA).

## 3. Tipografía
- Títulos expresivos: **Caveat** (600/700), inspirada en la referencia manuscrita del usuario. Cuerpo y UI: **Inter** (400/500/600). Plus Jakarta Sans queda disponible como respaldo para componentes existentes. Código y credenciales: **JetBrains Mono**.
- Cargar con `next/font` (sin CLS).
- Escala: `h1 48/56` · `h2 36/44` · `h3 24/32` · `body 16/26` · `small 14/20` · `caption 12/16`. En móvil h1 = 34.
- Títulos en `--navy-900`; el nombre de la empresa puede usar `--brand-600` en la palabra destacada.

## 4. Espaciado, forma y elevación
- Base 4 px. Contenedor máx. `1280px`, padding lateral 16 / 24 / 32.
- Radios: `sm 8` · `md 12` · `lg 16` · `xl 24` (tarjetas = 16).
- Sombras: `sm: 0 1px 2px rgba(15,35,56,.06)` · `md: 0 8px 24px rgba(15,35,56,.08)` · `lg: 0 16px 48px rgba(15,35,56,.12)`.
- Bordes de 1 px `--border`. En hover de tarjeta, borde pasa a `--sky-200` (o al color del área).

## 5. Lenguaje de circuito (motivo gráfico)
Usarlo con moderación para dar identidad sin saturar.
- **Patrón de fondo del hero y login**: SVG con líneas finas (1 px, `--brand-500` al 12 % de opacidad) en trazos horizontales/verticales con giros de 45° y **nodos** (círculos de 4–6 px). Crear `circuit-pattern.svg` reutilizable (tileable) y `circuit-hero.svg` (composición grande).
- **Esquinas de circuito**: en tarjetas destacadas, pequeño trazo con nodo en una esquina que se ilumina en hover.
- **Separadores de sección**: línea fina con un nodo en el centro.
- **Loader de marca**: la "X" del logo dibujándose (trazo) en bucle suave.
- **Íconos**: lucide-react, trazo 1.75, esquinas redondeadas. Ilustraciones de estados vacíos con el mismo estilo de líneas + nodos.

## 6. Animaciones y movimiento

### 6.1 Principios
1. **Con propósito**: guían la atención o confirman una acción; nunca decoran sin sentido.
2. **Rápidas y suaves**: UI 150–250 ms; entradas de sección 400–600 ms; ambientales lentas (6–20 s).
3. **Solo `transform` y `opacity`** (más `stroke-dashoffset` en SVG). Evitar animar `width/height/top/left`.
4. **Una sola vez**: las animaciones de entrada por scroll se ejecutan una vez.
5. **Accesibles**: respetar `prefers-reduced-motion` (ver 6.5). Nada parpadea más de 3 veces por segundo.
6. **Todas las vistas comparten el fondo ambiental**, incluido el panel, por petición explícita del usuario del 12/10/2026. Los formularios conservan texto Inter y superficies de mayor opacidad para lectura.

### 6.2 Tokens de movimiento
```css
:root {
  --dur-fast: 150ms;     /* hover, foco, toggles */
  --dur-base: 250ms;     /* tarjetas, menús, modales */
  --dur-slow: 500ms;     /* entradas de sección */
  --dur-ambient: 12s;    /* fondos y pulsos continuos */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --stagger: 70ms;       /* retraso entre elementos de una lista */
}
```
Librería: **Motion** (`motion/react`) para entradas, layout y gestos; **CSS** para hover, shimmer y ambientales. No añadir otra librería de animación.

### 6.3 Catálogo — sitio público
| Elemento | Animación |
|---|---|
| **Logo (primera carga)** | La "X" se dibuja con `stroke-dashoffset` (600 ms), los nodos aparecen con escala 0→1 (spring) y luego el texto hace fade-in. Solo una vez por sesión. |
| **Navbar** | Al hacer scroll > 8 px: fondo con blur + sombra sm (transición 200 ms). Subrayado de enlace que crece desde la izquierda en hover. |
| **Hero – fondo** | `circuit-hero.svg` con **pulsos de luz** (gradiente sky-400) que recorren las líneas con `stroke-dashoffset` en bucle (8–14 s, desfasados). Nodos con pulso suave de opacidad. Parallax muy leve del patrón al mover el mouse (máx. 8 px, solo escritorio). |
| **Hero – texto** | Titular palabra por palabra (fade + translateY 12 px, stagger 70 ms); subtítulo y buscador entran después. El buscador, en foco, ensancha el halo `--glow`. |
| **Contadores (estadísticas)** | `CountUp` de 0 al valor al entrar en viewport (1.2 s, ease-out). |
| **Reveal por scroll** | Secciones y tarjetas: fade + translateY 24 px → 0, `stagger` entre tarjetas, `viewport: { once: true, amount: 0.2 }`. |
| **AreaCard** | Hover: sube 4 px, sombra md, borde superior se expande de 3 px a 6 px con el color del área, ícono rota 6° y escala 1.08, esquina de circuito se ilumina (stroke del color del área). |
| **ProjectCard** | Hover: imagen escala 1.05 (400 ms, dentro de `overflow:hidden`), overlay degradado sutil, aparece flecha "→" que se desliza; badge "Sistema" con pequeño pulso cada 6 s. |
| **Galería / lightbox** | Apertura con fade + escala 0.96→1; cambio de imagen con deslizamiento horizontal; cierre con `Esc`; miniaturas con borde animado en la activa. |
| **SystemBlock** | Botón "Abrir sistema ↗": brillo que cruza el botón en hover (shine), flecha se desplaza. Copiar credencial: ícono cambia a ✓ con micro-escala y toast "Copiado". Ojo mostrar/ocultar con crossfade. |
| **Transición de página** | Fade 150 ms + leve desplazamiento 8 px (View Transitions API si está disponible, si no `AnimatePresence`). Barra de progreso fina `--sky-400` arriba durante la navegación. |
| **Separadores** | La línea con nodo se dibuja de izquierda a derecha al entrar en viewport. |
| **Footer** | Línea de circuito decorativa con un pulso que la recorre cada 10 s. |

### 6.4 Catálogo — panel de administración
| Elemento | Animación |
|---|---|
| **Sidebar** | Colapso/expansión 250 ms (ancho con `transform`/layout de Motion); ítem activo con indicador que se desliza (`layoutId`). |
| **Login** | Panel izquierdo con circuito animado (igual que el hero) y logo blanco; tarjeta del formulario entra con fade-up; error de credenciales → "shake" horizontal 300 ms. |
| **Botones** | Hover: sube brillo; `active`: escala 0.97; estado cargando: spinner + texto "Guardando…" (sin cambiar ancho). |
| **Tablas** | Filas con fade-in escalonado al cargar (máx. 10 filas animadas); hover resalta fila con `--surface-2`. |
| **Skeletons** | Shimmer: degradado que cruza de izquierda a derecha cada 1.4 s. |
| **Modales / drawers** | Modal: fade + escala 0.97→1; drawer: desliza desde la derecha; overlay con fade. |
| **Toasts** | Entran desde abajo-derecha con spring, barra de tiempo, salen con fade. Éxito con ✓ que se dibuja. |
| **ImageUploader** | Zona de arrastre: al arrastrar encima se ilumina (borde punteado animado con `--sky-400` y escala 1.01); progreso con barra fluida; al terminar, miniatura aparece con escala y un ✓ breve; reordenar con drag (layout animation); marcar portada ⭐ con "pop". |
| **Reordenar áreas** | Drag & drop con las filas reacomodándose suavemente (layout animation) y sombra al arrastrar. |
| **Publicar** | Al publicar con éxito: ✓ animado y confeti sutil de nodos azules (opcional, máx. 1 s). |
| **Selector de color de área** | La vista previa de la tarjeta cambia de color con transición 250 ms. |

### 6.5 Accesibilidad y rendimiento
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
- Con reduced-motion: el circuito se muestra **estático**, sin pulsos, sin parallax ni contadores animados (mostrar valor final).
- Pausar animaciones ambientales fuera de pantalla (`IntersectionObserver`) y cuando la pestaña no está visible.
- En móvil: desactivar parallax y reducir pulsos del hero a 2–3 líneas.
- Presupuesto: animaciones no deben bajar de 60 fps ni afectar Lighthouse Performance (≥ 90). Usar `will-change` solo durante la animación.
- Las imágenes y el SVG de circuito no deben bloquear el LCP: cargar el SVG de fondo con `loading="lazy"` o como CSS background tras el primer render.

### 6.6 Utilidades que Codex debe crear
```
/src/components/motion/
  Reveal.tsx            # fade+slide al entrar en viewport (props: delay, y, once)
  Stagger.tsx           # contenedor que escalona hijos
  CountUp.tsx           # contador animado
  CircuitBackground.tsx # SVG con líneas, nodos y pulsos (props: density, animated)
  LogoIntro.tsx         # animación de trazo de la X
  PageTransition.tsx
  ShineButton.tsx       # botón con brillo en hover
/src/styles/motion.css  # tokens, keyframes (shimmer, pulse, dash, shake)
```
Keyframes mínimos en `motion.css`:
```css
@keyframes dash-travel { from { stroke-dashoffset: 240; } to { stroke-dashoffset: 0; } }
@keyframes node-pulse  { 0%,100% { opacity:.35; transform:scale(1);} 50% { opacity:1; transform:scale(1.35);} }
@keyframes shimmer     { from { transform: translateX(-100%);} to { transform: translateX(100%);} }
@keyframes shake       { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
```

## 7. Componentes clave
- **Navbar**: logo Códex Cusco, enlaces (Inicio, Áreas, Buscar), toggle tema, botón "Ingresar". Sticky con blur.
- **Hero**: titular grande, subtítulo, buscador central, fondo `--grad-brand` suave + `CircuitBackground`.
- **AreaCard**: portada/degradado, ícono, nombre, nº de proyectos, borde superior del color del área, esquina de circuito.
- **ProjectCard**: imagen 16:9, badge de área, badge "Sistema" si aplica, título, resumen (2 líneas), año.
- **Gallery**: imagen principal + miniaturas, lightbox con teclado.
- **SystemBlock**: tarjeta destacada con nombre del sistema, botón "Abrir sistema ↗" y lista de credenciales (usuario/contraseña en mono, botones copiar, contraseña oculta con ojo). Aviso: "Credenciales solo para pruebas".
- **Panel**: sidebar `--grad-navy` colapsable con logo blanco, topbar con selector de área, tablas con filtros, badges de estado (Borrador gris · En revisión ámbar · Publicado verde · Archivado slate).
- **AreaManager**: lista reordenable, modal/drawer con nombre, slug, descripción, ícono, color, portada y vista previa en vivo.
- **ImageUploader**: drag & drop, progreso, reordenar, marcar portada, campo alt.
- Estados obligatorios: vacío (ilustración de circuito + CTA), carga (skeletons), error (mensaje + reintentar), toasts.

## 8. Reglas
- Un solo botón primario por vista. Botones: primario (relleno `--brand-600`), secundario (borde), fantasma, destructivo.
- Íconos: lucide-react, trazo 1.75.
- No usar más de 2 pesos de fuente por bloque. Máx. 3 colores de acento visibles por pantalla (marca + color del área + semántico).
- Contraste mínimo AA (4.5:1 texto). El azul del logo `#2F86C8` sobre blanco no cumple para texto pequeño: usar `--brand-600` para texto y botones, y `--brand-500` solo para decoración e íconos grandes.
- Modo claro y oscuro obligatorios; en oscuro, las líneas de circuito suben a 20 % de opacidad y los pulsos usan `--sky-400`.
- Coherencia: cualquier animación nueva debe usar los tokens de la sección 6.2.

Ajuste validado: `--brand-600` claro usa `#216AA3` para asegurar contraste AA también sobre `--bg` y `--brand-100`; el logo original conserva sus colores.


## Capa visual interactiva · 12/10/2026

Referencias solicitadas por el usuario: [Framer](https://www.framer.com/), [Active Theory](https://activetheory.net/) y [Lusion](https://lusion.co/). Se adaptan composición y tipos de interacción; no se incorporan sus marcas, vídeos ni recursos propietarios.

- Portada inmersiva con los colores azul/celeste de Códex Cusco y el logo original.
- Red de nodos con proyección de profundidad, rotación y respuesta al puntero; Canvas 2D ligero, sin añadir un motor 3D al stack.
- Entradas por scroll, contadores, tarjetas con inclinación suave y foco de luz, zoom de imágenes y botones con brillo.
- Barra de progreso, enlaces de navegación animados, banda tipográfica y separadores de circuito.
- `prefers-reduced-motion`, pausa manual y suspensión de animaciones ambientales fuera de pantalla o con la pestaña oculta.
- Contenido visible en SSR antes de cargar las animaciones; no hay una pantalla de carga artificial.

Componentes en `src/components/motion/`; estilos y tokens de escena en `src/styles/motion.css`. Motion es la librería indicada originalmente en este sistema de diseño.

Tokens de escena: `--hero-bg`, `--hero-text`, `--hero-muted`, `--hero-border`, `--hero-input-bg`, `--hero-accent`, `--scene-line` y `--scene-accent`. Se separan del tema claro/oscuro para conservar contraste en la portada.

La validación visual y de Lighthouse de esta capa nueva queda pendiente: el navegador automático rechazó el acceso a la URL local. Las métricas de la entrega anterior corresponden al diseño previo. No se presentan como medidas de esta versión animada.

### Dirección expresiva solicitada · 12/10/2026

La petición del usuario amplía el diseño tecnológico original hacia una estética más informal: títulos manuscritos, tarjetas orgánicas y cristal translúcido. El logo original conserva proporciones, orientación y colores.

`AtmosphereProvider` se monta en el layout raíz: portada, catálogo, búsqueda, detalles, acceso y panel comparten tres auroras CSS, trazos SVG y destellos decorativos. Un control global pausa el movimiento. Se respeta `prefers-reduced-motion` y se suspenden las animaciones con la pestaña oculta. No requiere nuevas dependencias.

Tokens centralizados en `src/styles/atmosphere.css`:

| Token | Claro | Oscuro |
| --- | --- | --- |
| `--dream-base` | `#eef4fa` | `#11172b` |
| `--dream-cyan` | `#9bdfed` | `#164b65` |
| `--dream-lilac` | `#c9baf0` | `#493965` |
| `--dream-peach` | `#f6cdbd` | `#553948` |
| `--dream-ink` | `#203654` | `#eff2ff` |
| `--dream-accent` | `#36669d` | `#a2d9f0` |
| `--dream-muted` | `#52647d` | `#bac7dd` |

`--glass-fill`, `--glass-strong`, `--glass-border` y `--glass-shadow` derivan de los tokens de superficie y color. El fondo es decorativo, fijo, sin captura de eventos y oculto a lectores de pantalla. Revisión visual, contraste medido y rendimiento de esta nueva versión pendientes de acceso al navegador; no se trasladan las métricas de la versión anterior.

Caveat se distribuye localmente en `src/app/fonts/caveat.ttf` mediante `next/font/local`, con licencia SIL OFL adjunta.

### Tipografía definitiva según referencias del usuario

Alice regular (`--font-title`) para títulos principales H1/H2. Pompiere regular (`--font-subtitle`) para H3 y subtítulos de portada/secciones. Sustituye Caveat como fuente activa. Ambas se alojan localmente con sus licencias SIL OFL en `src/app/fonts`, sin negritas sintéticas. Inter permanece en párrafos de contenido, controles y formularios. Los tamaños de Alice se ajustan para móvil y escritorio.

### Paleta azul oscuro · petición actual del usuario

El tema inicial pasa a oscuro (preferencia independiente `codex-blue-theme`), manteniendo el selector claro/oscuro. El fondo oscuro usa `--dream-base: #061326`, auroras azules `--dream-cyan: #0b416e`, `--dream-blue: #173b7c` y `--dream-deepblue: #102d58`. Texto `#edf5ff`, acentos `#8ecbff` y texto secundario `#abc2df`. Se eliminan lila y melocotón del fondo; las fuentes Alice/Pompiere, el cristal y las animaciones se conservan. La variante clara también utiliza exclusivamente azules para los fondos decorativos.
