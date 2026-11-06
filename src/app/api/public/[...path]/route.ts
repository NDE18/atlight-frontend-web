import { NextResponse, type NextRequest } from "next/server";
import { relayToBackend } from "@/shared/api/relay";

/**
 * Relais BFF des endpoints publics d'authentification : /api/public/<chemin> → <API>/api/<chemin>.
 * Jamais de JWT (un cookie périmé ne doit pas faire échouer une inscription), et seulement
 * les chemins listés ici : ce n'est pas un proxy ouvert vers le backend.
 */
const ALLOWED: { method: string; path: RegExp }[] = [
  { method: "POST", path: /^registration$/ },
  { method: "GET", path: /^user\/check-username$/ },
  { method: "POST", path: /^user\/set_email$/ },
  { method: "GET", path: /^user\/resend_code\/\d+$/ },
  { method: "POST", path: /^user\/pwd\/forgotten$/ },
  { method: "POST", path: /^user\/confirm_for_reset_password$/ },
  { method: "POST", path: /^user\/reset_password$/ },
];

/** Le backend renvoie le `RegistrationDto` reçu : le mot de passe ne doit pas revenir au navigateur. */
function withoutPassword(data: unknown): unknown {
  if (data && typeof data === "object" && "password" in data) {
    const { password: _password, ...rest } = data as Record<string, unknown>;
    void _password;
    return rest;
  }
  return data;
}

async function relay(request: NextRequest, ctx: RouteContext<"/api/public/[...path]">) {
  const { path } = await ctx.params;
  const joined = path.join("/");
  if (!ALLOWED.some((rule) => rule.method === request.method && rule.path.test(joined))) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return relayToBackend(request, `/api/${path.map(encodeURIComponent).join("/")}`, {
    transformJson: withoutPassword,
  });
}

export { relay as GET, relay as POST };
