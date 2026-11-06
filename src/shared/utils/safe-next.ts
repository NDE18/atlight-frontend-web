/** Pages d'authentification : y revenir après connexion n'aurait pas de sens. */
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

/**
 * Valide le paramètre `next` (`/login?next=…`) : uniquement un chemin interne,
 * jamais une URL externe (redirection ouverte) ni une page d'authentification.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  let url: URL;
  try {
    url = new URL(next, "https://atlight.invalid");
  } catch {
    return null;
  }
  if (url.origin !== "https://atlight.invalid") return null;
  if (AUTH_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Ajoute `next` à un lien d'authentification (connexion ↔ inscription) s'il est valide. */
export function withNext(path: string, next: string | null | undefined): string {
  const safe = safeNextPath(next);
  return safe ? `${path}?next=${encodeURIComponent(safe)}` : path;
}
