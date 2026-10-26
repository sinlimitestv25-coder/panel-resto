# v0.5 — Copia completa y autónoma ✅

Esta carpeta es un **proyecto completo**, no un parche. Se probó de cero
(`npm install` + `npm run build`) y compiló sin errores.

## ⚠️ Importante antes de subir esta versión
Tu repo en GitHub (`panel-resto`) todavía tiene una carpeta vieja colgada
de antes, `src/app/admin/[tenantId]/`, que ninguna versión nueva puede
borrar por sí sola (subir archivos arrastrándolos en GitHub nunca borra,
solo agrega/actualiza). Es un paso de una sola vez:

1. En github.com, entrá a tu repo y borrá la carpeta `src/app/admin/[tenantId]`
   completa (podés abrir el editor del navegador apretando `.` y borrarla
   de un clic).
2. Recién ahí arrastrá esta carpeta (`versiones/v0.5`) para subirla.

Después de este único paso, no debería volver a pasar — mientras ninguna
versión futura vuelva a renombrar o sacar una carpeta.

## Qué cambió en esta versión
- Se sacaron del proyecto los íconos de ejemplo que trae Next.js por
  defecto (`public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`,
  `window.svg`) — no se usaban en ninguna pantalla, era basura del
  scaffolding inicial.

## Qué incluye (acumulado de todas las versiones hasta acá)
Igual que v0.4.1 (ver `versiones/v0.4.1/NOTAS.md` para el detalle completo
de funcionalidades): panel multitenant con login, alta de restaurante
completa, menú por categorías con fotos, galería, QR, menú público
mobile-first, panel admin revisado para celular.

## Cómo usarla
1. Hacé la limpieza de arriba (una sola vez).
2. Copiá toda esta carpeta a tu repo (o reemplazá el contenido entero).
3. `npm install`.
4. `npm run dev` para probar local, o subila a GitHub/Vercel.
