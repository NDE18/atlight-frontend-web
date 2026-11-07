import type { NextRequest } from "next/server";
import { relayToBackend } from "@/shared/api/relay";
import { clearSessionCookie, getSessionToken } from "@/shared/session/server";

/**
 * Relais BFF : /api/backend/<chemin> → <API>/api/<chemin>, avec le JWT du cookie HttpOnly.
 * Le corps est transmis tel quel (JSON comme multipart), le statut aussi (401, 402… gérés par apiClient).
 */
async function relay(request: NextRequest, ctx: RouteContext<"/api/backend/[...path]">) {
  const { path } = await ctx.params;
  const response = await relayToBackend(request, `/api/${path.map(encodeURIComponent).join("/")}`, {
    token: await getSessionToken(),
  });
  if (response.status === 401) clearSessionCookie(response);
  return response;
}

export { relay as GET, relay as POST, relay as PUT, relay as PATCH, relay as DELETE };
