import { ApiError } from "@/shared/api/client";

/**
 * Message à afficher pour une erreur technique (jamais d'écran blanc) :
 * réseau coupé, limite de débit du backend, ou erreur serveur.
 */
export function technicalErrorKey(error: unknown): string {
  if (!(error instanceof ApiError)) return "authNetworkError";
  if (error.status === 429) return "authTooManyAttempts";
  return "authServerError";
}
