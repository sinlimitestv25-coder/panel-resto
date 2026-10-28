# v0.7 — Carta pública rediseñada (vista del comensal) ✅

Copia completa, probada de cero (`npm install` + `npm run build`).

Basado en un prototipo visual que trajo el usuario (carta de restaurante con
formato premium: tipografía serif + sans, tarjetas, categorías sticky,
buscador, filtros, carrito flotante). Se tomó el formato y se adaptó para
que cada restaurante lo vea con su propio color (no uno fijo), conectado a
los datos reales de cada tenant en vez de contenido de ejemplo.

## Qué trae esta versión

- **Diseño nuevo de la carta pública** (`/<slug>`): encabezado con logo y
  nombre del restaurante, selector de idioma, selector de moneda y botón
  de tema claro/oscuro. Banner de bienvenida con la descripción del
  restaurante y botón "Llamar mozo". Todo usa el color de marca que cada
  restaurante define en Ajustes (no un color fijo).
- **Buscador** de platos y **filtros por etiqueta dietética** (Vegano,
  Vegetariano, Sin TACC, Sin azúcar, Picante) — las etiquetas se cargan
  por plato desde el panel admin (Menú → al crear o editar un plato).
- **Categorías como pestañas** (Desayuno, Almuerzo, Cena, Bebidas,
  Postres, Otros) en vez de una sola lista larga.
- **Modal de detalle del plato**: foto, precio, etiquetas, descripción,
  ingredientes principales (nuevo campo en el panel admin) y selector de
  cantidad.
- **Comanda / carrito**: agregar platos (desde la tarjeta o el modal),
  barra flotante con el total, modal de pedido con cantidades editables,
  notas para cocina, subtotal + servicio de mesa (10%) + total.
- **"Enviar pedido" y "Llamar mozo" son simulados**: muestran una
  confirmación en pantalla pero todavía no llegan a ningún lado real —
  eso necesita conectar Supabase y un sistema de notificación a cocina/
  mozo, que queda pendiente (como ya estaba anotado para el QR por mesa).
- **Idiomas**: español, inglés, portugués, francés, italiano y alemán —
  traduce los textos fijos de la interfaz (botones, etiquetas, secciones).
  Los nombres y descripciones de los platos los escribe cada restaurante
  en un solo idioma y no se traducen automáticamente.
- **Moneda**: ARS, USD, EUR, BRL. Los precios se cargan en ARS; la
  conversión usa tasas fijas solo para la demo (no son tasas reales ni se
  actualizan solas).
- **Mesa por URL**: si el link incluye `?mesa=4`, se muestra un badge
  "Mesa 4" en el banner. Todavía no hay un QR distinto por mesa (sigue
  pendiente, como ya estaba anotado); por ahora es un link que se podría
  armar a mano si se quisiera probar.

## Importante

- Como el resto del prototipo, el pedido y el llamado al mozo no tienen
  backend real todavía — son demostrativos, pensados para mostrar el flujo
  completo antes de invertir en Supabase.
- Se agregó `dietaryTags` e `ingredients` a los platos — los platos viejos
  (cargados antes de esta versión) no tienen estos datos hasta que se
  edite el plato y se completen desde el panel admin.
- Demo restaurante "La Esquina": usuario `la-esquina`, contraseña
  `esquina123`. Acceso de administrador: `rodrigo.mansilla@restogo.com` /
  `restogo123` (sin cambios).
