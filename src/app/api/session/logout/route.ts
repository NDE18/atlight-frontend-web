import { NextResponse } from "next/server";
import { backendUrl, clearSessionCookie, getSessionToken } from "@/shared/session/server";

/** Déconnexion : met le JWT en liste noire côté backend puis efface le cookie. */
export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await fetch(backendUrl("/api/user/logout"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => undefined);
  }
  const response = new NextResponse(null, { status: 204 });
  clearSessionCookie(response);
  return response;
}
