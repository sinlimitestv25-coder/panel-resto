# v0.6.1 — Entrada directa al login + usuario de administrador precargado ✅

Copia completa, probada de cero (`npm install` + `npm run build`).

## Qué trae esta versión
- **Sin pantalla intermedia**: antes, al entrar al sitio (`/`) aparecía una
  landing con el logo y un botón "Entrar al panel". Ahora `/` lleva directo
  a la pantalla de acceso de administrador (la dividida: marca de un lado,
  usuario y contraseña del otro) — es lo primero que se ve al abrir el
  sitio.
- **Usuario de administrador precargado**: la primera vez que se abre la
  app (sin ningún usuario creado todavía) se precarga automáticamente:
  - Usuario: `rodrigo.mansilla@restogo.com`
  - Contraseña: `restogo123`

  Ya no hace falta pasar por la pantalla de "Creá tu acceso" — se puede
  entrar directo con esos datos. Si en ese navegador ya existía un usuario
  creado antes, no se toca (la precarga solo actúa cuando no hay ninguno).

## Importante
- Sigue siendo un gate simple en el navegador (localStorage/sessionStorage),
  no seguridad real — eso llega con Supabase. La contraseña es la que pidió
  el usuario ("no importa"), se puede cambiar más adelante sin problema.
- Demo restaurante "La Esquina": usuario `la-esquina`, contraseña
  `esquina123` (sin cambios).
