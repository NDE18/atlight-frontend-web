import { relayAuthentication } from "@/shared/session/server";

/** Étape 4 de l'inscription : un code valide connecte directement (AUTH-02). */
export async function POST(request: Request) {
  return relayAuthentication(request, "/api/user/confirm_for_registration");
}
