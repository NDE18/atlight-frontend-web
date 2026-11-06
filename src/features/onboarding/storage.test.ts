import { beforeEach, describe, expect, it } from "vitest";
import type { SessionUser } from "@/stores/session";
import { destinationAfterAuth, markOnboardingDone, needsOnboarding } from "./storage";

const user: SessionUser = { userId: 1, personId: 10, username: "awa.diallo", sport: null };

describe("onboarding après connexion ou inscription", () => {
  beforeEach(() => localStorage.clear());

  it("s'affiche tant que le profil n'a pas de sport (OnboardingPage.maybeShow)", () => {
    expect(needsOnboarding(user)).toBe(true);
    expect(needsOnboarding({ ...user, sport: "null" })).toBe(true);
    expect(needsOnboarding({ ...user, sport: "Football" })).toBe(false);
  });

  it("ne s'affiche plus une fois terminé ou passé", () => {
    markOnboardingDone();
    expect(needsOnboarding(user)).toBe(false);
  });

  it("ne concerne pas un compte sans profil Person", () => {
    expect(needsOnboarding({ ...user, personId: null })).toBe(false);
  });

  it("la page demandée (next) passe avant l'onboarding", () => {
    expect(destinationAfterAuth("/p/post/42", user)).toBe("/p/post/42");
    expect(destinationAfterAuth(null, user)).toBe("/onboarding");
    expect(destinationAfterAuth(null, { ...user, sport: "Football" })).toBe("/");
  });
});
