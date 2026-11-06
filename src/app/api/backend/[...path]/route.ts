import { NextResponse, type NextRequest } from "next/server";
import { backendUrl, clearSessionCookie, getSessionToken } from "@/shared/session/server";

/**
 * Relais BFF : /api/backend/<chemin> → <API>/api/<chemin>, avec le JWT du cookie HttpOnly.
 * Le corps est transmis tel quel (JSON comme multipart), le statut aussi (401, 402… gérés par apiClient).
 */
async function relay(request: NextRequest, ctx: RouteContext<"/api/backend/[...path]">) {
  const { path } = await ctx.params;
  const target = new URL(backendUrl(`/api/${path.map(encodeURIComponent).join("/")}`));
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of ["content-type", "accept", "accept-language"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const token = await getSessionToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    // Requis par fetch (undici) pour streamer un corps de requête.
    ...(hasBody ? { duplex: "half" } : {}),
    cache: "no-store",
    redirect: "manual",
  } as RequestInit);

  const responseHeaders = new Headers();
  for (const name of ["content-type", "content-disposition", "cache-control"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
  if (upstream.status === 401) clearSessionCookie(response);
  return response;
}

export { relay as GET, relay as POST, relay as PUT, relay as PATCH, relay as DELETE };
