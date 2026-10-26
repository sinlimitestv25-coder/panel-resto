# v0.4 — Alta de restaurante completa

## Qué cambió
- Al crear un restaurante nuevo desde `/admin`, ahora se cargan de una:
  descripción, dirección, teléfono, color del panel, logo y foto de
  portada — además del nombre, slug y contraseña que ya pedía. Antes
  quedaba "pelado" y había que ir a Ajustes para completarlo.
- Esos mismos campos (nombre, slug, descripción, dirección, teléfono,
  color, logo, portada) se extrajeron a un componente compartido
  (`TenantProfileFields`) que usan tanto el alta como Ajustes, para no
  duplicar el formulario.

## Archivos nuevos
- `src/components/TenantProfileFields.tsx` — campos de perfil del restaurante, reutilizados por el alta y por Ajustes.

## Archivos modificados
- `src/app/admin/page.tsx` — el formulario de alta ahora usa `TenantProfileFields` y manda todos los campos al crear.
- `src/app/admin/[slug]/ajustes/page.tsx` — reemplaza sus campos duplicados por `TenantProfileFields`.
