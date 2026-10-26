# v0.3 — Login básico para los dos paneles

## Qué cambió
- **Panel del dueño** (`/admin`): la primera vez pide crear una contraseña
  de administrador; después, pide esa contraseña para entrar. Queda logueado
  mientras la pestaña del navegador siga abierta ("Cerrar sesión de
  administrador" para salir antes).
- **Panel de cada restaurante** (`/admin/<slug>`): pide la contraseña propia
  de ese restaurante. El dueño de la plataforma entra siempre (su sesión es
  maestra), sin tener que loguearse restaurante por restaurante.
- Al crear un restaurante nuevo desde `/admin`, ahora se define su
  contraseña en el mismo formulario (mínimo 4 caracteres).
- Desde Ajustes de cada restaurante se puede cambiar su contraseña (campo
  opcional, se deja vacío para no tocarla).
- Restaurante demo "La Esquina": contraseña `esquina123`.

## Importante (prototipo, no es seguridad real)
Todo esto corre en el navegador: las contraseñas se guardan "hasheadas" con
un hash simple en `localStorage`/`sessionStorage`, sin servidor. Sirve para
que no cualquiera con el link edite el panel durante una demo, pero no
reemplaza autenticación real — eso se arma cuando conectemos Supabase.

## Archivos nuevos
- `src/lib/auth.ts` — hash simple + manejo de sesión del dueño y de cada restaurante.
- `src/components/OwnerGate.tsx` — pantalla de setup/login del panel del dueño.
- `src/components/TenantGate.tsx` — pantalla de login del panel de un restaurante.

## Archivos modificados
- `src/lib/types.ts` — se agregó `passwordHash` al restaurante.
- `src/lib/seed.ts` — el restaurante demo ahora tiene contraseña (`esquina123`).
- `src/lib/db.ts` — se subió la versión de la clave de localStorage (`panelresto_db_v2`) porque cambió la forma de los datos.
- `src/app/admin/page.tsx` — envuelto en `OwnerGate`; el alta de restaurante pide contraseña.
- `src/app/admin/[slug]/layout.tsx` — envuelto en `TenantGate`.
- `src/app/admin/[slug]/ajustes/page.tsx` — campo para cambiar la contraseña del restaurante.
