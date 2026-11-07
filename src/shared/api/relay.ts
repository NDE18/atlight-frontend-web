import "server-only";
import { NextResponse } from "next/server";
import { backendUrl, forwardedHeaders } from "@/shared/session/server";

interface RelayOptions {
  /** JWT de session à transmettre en `Authorization: Bearer`. */
  token?: string;
  /** Retouche d'un corps JSON avant de le renvoyer au navigateur. */
  transformJson?: (data: unknown) => unknown;
}

/** Relaie une requête du navigateur vers `<API><backendPath>` et renvoie la réponse telle quelle. */
export async function relayToBackend(
  request: Request,
  backendPath: string,
  { token, transformJson }: RelayOptions = {},
): Promise<NextResponse> {
  const target = new URL(backendUrl(backendPath));
  target.search = new URL(request.url).search;

  const headers = forwardedHeaders(request, ["content-type"]);
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

  // 204, 205 et 304 n'ont jamais de corps.
  if ([204, 205, 304].includes(upstream.status)) {
    return new NextResponse(null, { status: upstream.status, headers: responseHeaders });
  }

  const isJson = upstream.headers.get("content-type")?.includes("json") ?? false;
  if (transformJson && isJson) {
    const text = await upstream.text();
    const body = text ? JSON.stringify(transformJson(JSON.parse(text))) : null;
    return new NextResponse(body, { status: upstream.status, headers: responseHeaders });
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
}
