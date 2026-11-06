import type { SessionUser } from "@/stores/session";

/** Onboarding montré une seule fois par navigateur (clé `onboardingDone` du mobile, par appareil). */
const KEY = "atlight.onboardingDone";

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingDone(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // Stockage indisponible : l'onboarding pourra réapparaître, sans autre conséquence.
  }
}

/** Même condition que `OnboardingPage.maybeShow` : profil sans sport, onboarding jamais terminé. */
export function needsOnboarding(user: Pick<SessionUser, "personId" | "sport"> | null): boolean {
  if (!user?.personId) return false;
  const sport = user.sport?.trim();
  return (!sport || sport === "null") && !isOnboardingDone();
}

/**
 * Destination après connexion ou inscription : la page demandée (`next`) en priorité,
 * sinon l'onboarding s'il reste à faire, sinon l'accueil.
 */
export function destinationAfterAuth(next: string | null, user: SessionUser): string {
  if (next) return next;
  return needsOnboarding(user) ? "/onboarding" : "/";
}
