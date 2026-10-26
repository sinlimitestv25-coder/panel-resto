# v0.2 — Panel propio por restaurante (link directo por slug)

## Qué cambió
- El panel de cada restaurante ahora se identifica por su **slug** en la URL,
  no por un ID interno. Antes: `/admin/<id-feo>`. Ahora: `/admin/<slug>`
  (ej. `/admin/la-esquina`).
- Ese link (`/admin/<slug>`) es el que se le puede dar directamente a un
  restaurante para que entre a cargar SU menú, fotos y QR, sin ver los demás
  restaurantes.
- `/admin` sigue siendo el panel del dueño de la plataforma: lista todos los
  restaurantes y permite crear nuevos.
- Si se cambia el slug desde Ajustes, el panel redirige automáticamente a la
  nueva URL.

## Archivos
- `src/lib/tenant-context.tsx` — ahora carga el restaurante por slug en vez de por id.
- `src/app/admin/page.tsx` — el link a cada restaurante ahora usa su slug.
- `src/app/admin/[slug]/layout.tsx` — (carpeta renombrada de `[tenantId]` a `[slug]`) navegación por tabs usando el slug.
- `src/app/admin/[slug]/page.tsx` — links internos (Menú/Fotos/QR) actualizados a slug.
- `src/app/admin/[slug]/ajustes/page.tsx` — redirige a la nueva URL si cambia el slug.

Nota: las carpetas `menu/`, `fotos/` y `qr/` también se movieron de
`[tenantId]/` a `[slug]/` (cambio de ubicación, el contenido no cambió), por
eso no están copiadas acá.
