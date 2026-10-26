// Autenticación básica para el prototipo: todo vive en el navegador
// (localStorage para el usuario/contraseña del dueño y el hash por
// restaurante, sessionStorage para la sesión activa). No es seguridad
// real — es un gate simple para que no cualquiera con el link edite el
// panel. Cuando conectemos Supabase esto se reemplaza por auth de verdad
// (con server).

const OWNER_USER_KEY = "panelresto_owner_user";
const OWNER_PW_KEY = "panelresto_owner_pw_hash";
const OWNER_SESSION_KEY = "panelresto_owner_session";

export function simpleHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

// --- Dueño de la plataforma (panel /admin) ------------------------------

export function hasOwnerPassword(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(OWNER_PW_KEY);
}

export function setOwnerCredentials(username: string, password: string) {
  window.localStorage.setItem(OWNER_USER_KEY, normalizeUsername(username));
  window.localStorage.setItem(OWNER_PW_KEY, simpleHash(password));
}

export function verifyOwnerCredentials(username: string, password: string): boolean {
  const storedUser = window.localStorage.getItem(OWNER_USER_KEY);
  const storedHash = window.localStorage.getItem(OWNER_PW_KEY);
  return (
    !!storedUser &&
    !!storedHash &&
    storedUser === normalizeUsername(username) &&
    storedHash === simpleHash(password)
  );
}

export function isOwnerSession(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(OWNER_SESSION_KEY) === "1";
}

export function startOwnerSession() {
  window.sessionStorage.setItem(OWNER_SESSION_KEY, "1");
}

export function endOwnerSession() {
  window.sessionStorage.removeItem(OWNER_SESSION_KEY);
}

// --- Restaurantes (panel /admin/<slug>) ---------------------------------

export function hashTenantPassword(password: string): string {
  return simpleHash(password);
}

export function verifyTenantCredentials(
  tenant: { username: string; passwordHash: string },
  username: string,
  password: string
): boolean {
  return (
    !!tenant.passwordHash &&
    normalizeUsername(tenant.username) === normalizeUsername(username) &&
    tenant.passwordHash === simpleHash(password)
  );
}

export function isTenantSession(tenantId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(`panelresto_tenant_session_${tenantId}`) === "1";
}

export function startTenantSession(tenantId: string) {
  window.sessionStorage.setItem(`panelresto_tenant_session_${tenantId}`, "1");
}
