/** Cookie HttpOnly qui porte le JWT : jamais lisible par le JavaScript du navigateur. */
export const SESSION_COOKIE = "atlight_token";

/** Routes accessibles sans session (le reste redirige vers /login?next=…). */
export const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/privacy",
  "/p/",
  "/.well-known/",
  "/api/session/",
  "/firebase-messaging-sw.js",
] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => (p.endsWith("/") ? pathname.startsWith(p) : pathname === p));
}

/** Durée de vie du cookie déduite du champ `exp` du JWT (secondes), 7 jours à défaut. */
export function maxAgeFromJwt(token: string): number {
  const fallback = 60 * 60 * 24 * 7;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    if (typeof payload.exp !== "number") return fallback;
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    return fallback;
  }
}
