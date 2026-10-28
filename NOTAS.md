# v0.6.1 — Entrada directa al login + usuario de administrador precargado ✅

Copia completa, probada de cero (`npm install` + `npm run build`).

## Qué trae esta versión
- **Sin pantalla intermedia**: antes, al entrar al sitio (`/`) aparecía una
  landing con el logo y un botón "Entrar al panel". Ahora `/` lleva directo
  a la pantalla de acceso de administrador (la dividida: marca de un lado,
  usuario y contraseña del otro) — es lo primero que se ve al abrir el
  sitio.
- **Usuario de administrador de prueba, siempre disponible**: funciona
  para entrar sin importar qué haya guardado el navegador (por ejemplo, un
  usuario de pruebas anteriores). No reemplaza ni borra ningún usuario ya
  creado, se suma como una entrada válida más:
  - Usuario: `rodrigo.mansilla@restogo.com`
  - Contraseña: `restogo123`

## Importante
- Sigue siendo un gate simple en el navegador (localStorage/sessionStorage),
  no seguridad real — eso llega con Supabase. La contraseña es la que pidió
  el usuario ("no importa"), se puede cambiar o quitar más adelante sin
  problema.
- Demo restaurante "La Esquina": usuario `la-esquina`, contraseña
  `esquina123` (sin cambios).
