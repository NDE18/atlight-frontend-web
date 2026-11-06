import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath, SESSION_COOKIE } from "@/shared/session/constants";

/**
 * Garde de session optimiste (équivalent RootRouter du mobile) : sans cookie de session,
 * toute page privée redirige vers /login?next=<url>. La validité réelle du JWT est
 * vérifiée par le backend ; un 401 déconnecte côté client.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && !pathname.startsWith("/api/")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  // Ignore les fichiers statiques et internes de Next.js.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml)$).*)",
  ],
};
