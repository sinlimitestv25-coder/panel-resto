# v0.4.1 — Copia completa y autónoma ✅

Esta carpeta es un **proyecto completo**, no un parche. Se probó de cero
(`npm install` + `npm run build`) y compiló sin errores. Podés copiarla
entera para armar tu repo de GitHub sin preocuparte por archivos viejos o
carpetas que falten borrar.

## Cómo usarla
1. Copiá toda esta carpeta (`versiones/v0.4.1/`) a donde vayas a iniciar tu
   repo, o reemplazá el contenido de tu repo existente por esto (borrando
   primero lo viejo, para no dejar nada suelto).
2. Corré `npm install` (no se incluye `node_modules/` para no pesar; se
   regenera solo y de todas formas no se sube a GitHub).
3. `npm run dev` para probar local, o subilo a GitHub/Vercel como siempre.

## Qué incluye (acumulado de todas las versiones hasta acá)
- Panel multitenant: `/admin` (dueño, con login) y `/admin/<slug>` (panel
  propio de cada restaurante, con su propia contraseña).
- Alta de restaurante completa: nombre, slug, descripción, dirección,
  teléfono, color, logo, portada y contraseña, todo en el mismo formulario.
- Menú por categorías (desayuno, almuerzo, bebidas, postres, etc.) con
  fotos por plato.
- Galería de fotos del restaurante.
- Generación de QR con descarga en PNG, apuntando al menú público.
- Menú público mobile-first por slug (`/<slug>`).
- Panel admin revisado y corregido para celular (sin desbordes ni
  contenido invisible).
- Datos en `localStorage` (sin Supabase todavía — prototipo).
- Restaurante demo: "La Esquina" (contraseña `esquina123`). Contraseña de
  administrador: la que hayas creado vos la primera vez que entraste a
  `/admin` (no viene precargada).

## Importante (sigue siendo prototipo)
Las contraseñas usan un hash simple en el navegador, no es seguridad real
— eso llega cuando conectemos Supabase. Ver `CHANGELOG.md` en la raíz del
proyecto para el detalle versión por versión.
