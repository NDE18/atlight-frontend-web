import { z } from "zod";
import { EMAIL_PATTERN, USERNAME_MAX, isStrongPassword } from "./rules";
import { SIGNUP_ROLES } from "./types";

/*
 * Schémas zod des formulaires d'authentification ; les messages d'erreur sont des clés de
 * traduction. Les règles sans zod (rules.ts) sont réexportées ici pour ces écrans.
 */
export * from "./rules";

// La CSP interdit eval : sans jitless, zod sonde `new Function` et le navigateur signale une
// violation de CSP à chaque chargement (sans effet, mais bruyante dans la console et Sentry).
z.config({ jitless: true });

const requiredText = (message: string) => z.string().trim().min(1, message);

export const emailField = z.string().trim().regex(EMAIL_PATTERN, "emailInvalid");

/** Mot de passe et confirmation : règles du mobile, erreur sur le champ concerné. */
const passwordPair = z
  .object({ password: z.string(), confirmation: z.string() })
  .superRefine(({ password, confirmation }, ctx) => {
    if (!isStrongPassword(password) || password.length > 128) {
      ctx.addIssue({ code: "custom", path: ["password"], message: "passwordRulesNotMet" });
    }
    if (password !== confirmation) {
      ctx.addIssue({ code: "custom", path: ["confirmation"], message: "passwordMismatch" });
    }
  });

export const loginSchema = z.object({
  username: requiredText("usernameRequired"),
  password: z.string().min(1, "passwordRequired"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const roleSchema = z.object({
  role: z.enum(SIGNUP_ROLES, "registerRoleRequired"),
});

export const identitySchema = z.object({
  firstname: requiredText("firstNameRequired"),
  lastname: requiredText("lastNameRequired"),
  username: requiredText("usernameRequired").max(USERNAME_MAX, "usernameTooLong"),
});

export const accountSchema = passwordPair.and(
  z.object({
    email: emailField,
    acceptPrivacy: z.literal(true, "privacyRequired"),
  }),
);

/** Toutes les saisies de l'inscription (étapes 1 à 3), validées étape par étape. */
export const registrationSchema = roleSchema.and(identitySchema).and(accountSchema);

export interface RegistrationValues {
  role: (typeof SIGNUP_ROLES)[number] | "";
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  confirmation: string;
  acceptPrivacy: boolean;
}

export const REGISTRATION_DEFAULTS: RegistrationValues = {
  role: "",
  firstname: "",
  lastname: "",
  username: "",
  email: "",
  password: "",
  confirmation: "",
  acceptPrivacy: false,
};

/** Champs de chaque étape, pour ne valider que l'étape courante. */
export const STEP_FIELDS = {
  1: ["role"],
  2: ["firstname", "lastname", "username"],
  3: ["email", "password", "confirmation", "acceptPrivacy"],
} as const satisfies Record<1 | 2 | 3, readonly (keyof RegistrationValues)[]>;

export const forgotEmailSchema = z.object({ email: emailField });

export const newPasswordSchema = passwordPair;
