import { relayAuthentication } from "@/shared/session/server";

/** Connexion : relaie POST /api/user/connexion et pose le cookie de session. */
export async function POST(request: Request) {
  return relayAuthentication("/api/user/connexion", await request.json());
}
