import { NextResponse } from "next/server";
import { getSessionToken } from "@/shared/session/server";

/**
 * Jeton pour l'en-tête CONNECT de STOMP, qui ne peut pas lire le cookie HttpOnly.
 * Le backend n'émet pas encore de jeton court : c'est le JWT de session qui est renvoyé.
 * À remplacer par un jeton dédié à durée courte (évolution backend, cahier technique 5.2).
 */
export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
