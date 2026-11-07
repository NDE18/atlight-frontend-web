import { relayAuthentication } from "@/shared/session/server";

/** Connexion : relaie POST /api/user/connexion et pose le cookie de session. */
export async function POST(request: Request) {
  return relayAuthentication(request, "/api/user/connexion");
}
