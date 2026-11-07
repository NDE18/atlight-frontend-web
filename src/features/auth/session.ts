import type { SessionUser } from "@/stores/session";
import type { AuthSession } from "./types";

/** Réponse d'authentification du backend → données de session gardées côté navigateur. */
export function toSessionUser({ user, person }: AuthSession): SessionUser {
  return {
    userId: user.id,
    personId: person?.id ?? null,
    username: user.username,
    role: user.role,
    firstname: person?.firstname,
    lastname: person?.lastname,
    picture: person?.picture,
    coverPicture: person?.coverPicture,
    sport: person?.sport,
    clubName: person?.clubName,
    residence: person?.residence,
  };
}

/** Initiales d'un nom complet venu de l'API (« Sarah Koné » → « SK »). */
export function initialsFromName(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join("") || "?"
  ).toUpperCase();
}

/** Initiales affichées quand le profil n'a pas de photo. */
export function initialsOf(user: Pick<SessionUser, "firstname" | "lastname" | "username">): string {
  const letters = [user.firstname, user.lastname]
    .map((part) => part?.trim().charAt(0) ?? "")
    .join("");
  return (letters || user.username.charAt(0)).toUpperCase();
}
