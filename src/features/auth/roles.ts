import type { SvgIconName } from "@/shared/ui/svg-icon";
import { SIGNUP_ROLES, type SignupRole } from "./types";

/** Libellés des rôles, mêmes clés que le mobile (`_roleLabel` de registration_page.dart). */
export const ROLE_LABEL_KEYS: Record<SignupRole, string> = {
  FAN: "roleFan",
  ATHLETE: "roleAthlete",
  COACH: "roleCoach",
  MANAGER: "roleManager",
  AGENT: "roleAgent",
  JOURNALIST: "roleJournalist",
};

const ROLE_ICONS: Record<SignupRole, SvgIconName> = {
  FAN: "favorite",
  ATHLETE: "directions_run",
  COACH: "sports",
  MANAGER: "assignment_ind",
  AGENT: "handshake",
  JOURNALIST: "mic",
};

/** Cartes de l'étape 1 de l'inscription (cahier 4.1.1). */
export const ROLE_OPTIONS = SIGNUP_ROLES.map((role) => ({
  role,
  icon: ROLE_ICONS[role],
  labelKey: ROLE_LABEL_KEYS[role],
  descriptionKey: `${ROLE_LABEL_KEYS[role]}Description`,
}));

/** Icônes des trois avantages affichés dans le panneau pour chaque rôle (maquette Création de compte). */
export const ROLE_PERK_ICONS: Record<
  SignupRole | "default",
  [SvgIconName, SvgIconName, SvgIconName]
> = {
  default: ["article", "work", "event"],
  FAN: ["article", "event", "groups"],
  ATHLETE: ["videocam", "person_search", "work"],
  COACH: ["work", "article", "groups"],
  MANAGER: ["work", "person_search", "event"],
  AGENT: ["person_search", "videocam", "groups"],
  JOURNALIST: ["article", "event", "groups"],
};

/** Libellé d'un rôle quelconque renvoyé par l'API (ORGANISM, ADMIN : pas de libellé). */
export function roleLabelKey(role: string | undefined): string | null {
  return role && role in ROLE_LABEL_KEYS ? ROLE_LABEL_KEYS[role as SignupRole] : null;
}
