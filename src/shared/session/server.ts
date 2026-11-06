import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/shared/config/env";
import { maxAgeFromJwt, SESSION_COOKIE } from "./constants";

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export function backendUrl(path: string): string {
  return `${env.apiBaseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeFromJwt(token),
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE);
}

/**
 * Relaie une authentification au backend (connexion, confirmation d'inscription).
 * Le JWT renvoyé (en-tête Authorization ou champ `token`) est placé dans le cookie HttpOnly
 * et retiré du corps transmis au navigateur.
 */
export async function relayAuthentication(path: string, body: unknown): Promise<NextResponse> {
  const upstream = await fetch(backendUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await upstream.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!upstream.ok) {
    return NextResponse.json(data ?? { message: text }, { status: upstream.status });
  }

  const header = upstream.headers.get("authorization");
  const token = (header?.replace(/^Bearer\s+/i, "") || (data?.token as string | undefined)) ?? "";
  if (!token) {
    return NextResponse.json({ message: "Missing token in backend response" }, { status: 502 });
  }

  const { token: _omit, ...publicData } = data ?? {};
  void _omit;
  const response = NextResponse.json(publicData);
  setSessionCookie(response, token);
  return response;
}
