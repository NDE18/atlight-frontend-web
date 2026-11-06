/** Rôles proposés à l'inscription, dans l'ordre du mobile. ORGANISM et ADMIN sont internes. */
export const SIGNUP_ROLES = ["FAN", "ATHLETE", "COACH", "MANAGER", "AGENT", "JOURNALIST"] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];
export type Role = SignupRole | "ORGANISM" | "ADMIN";

export function isSignupRole(value: unknown): value is SignupRole {
  return typeof value === "string" && (SIGNUP_ROLES as readonly string[]).includes(value);
}

/** `UserInfoDto` du backend. */
export interface UserInfo {
  id: number;
  username: string;
  role: Role;
}

/** `PersonInfoDto` du backend (absent pour un compte ORGANISM). */
export interface PersonInfo {
  id: number;
  firstname?: string | null;
  lastname?: string | null;
  birthdate?: string | null;
  placeOfBirth?: string | null;
  residence?: string | null;
  nationality?: string | null;
  sport?: string | null;
  phone?: string | null;
  description?: string | null;
  picture?: string | null;
  coverPicture?: string | null;
  clubName?: string | null;
  height?: number | null;
  weight?: number | null;
  /** Présents sur la fiche complète (`GET /api/person/{id}`), pas dans la réponse de connexion. */
  verified?: boolean;
  openToTryouts?: boolean;
}

/**
 * `AuthenticationResponseDto` (connexion, confirmation d'inscription) tel que le BFF le renvoie :
 * le JWT en a été retiré pour être placé dans le cookie HttpOnly.
 */
export interface AuthSession {
  message?: string;
  user: UserInfo;
  person: PersonInfo | null;
}

/** Corps de `POST /api/registration`. */
export interface RegistrationRequest {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  role: SignupRole;
}

/**
 * `RegistrationDto` renvoyé par `/api/registration`, `/api/user/set_email`
 * et `/api/user/pwd/forgotten`. Seuls les champs utiles au web sont typés.
 */
export interface RegistrationDto {
  id: number;
  username?: string | null;
  email?: string | null;
  firstname?: string | null;
  lastname?: string | null;
}

/** Codes d'erreur fonctionnels renvoyés par le backend (`ApiErrorResponse.error`, corps des 400/429). */
export type AuthErrorCode =
  "BAD_CREDENTIALS" | "ACCOUNT_DISABLED" | "TOO_MANY_REQUESTS" | "INVALID_CODE" | "CODE_EXPIRED";

/** Issue d'une saisie de code e-mail (inscription ou mot de passe oublié). */
export type CodeCheckResult = "ok" | "invalid" | "expired";
