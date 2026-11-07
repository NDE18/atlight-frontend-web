import { describe, expect, it } from "vitest";
import {
  EMAIL_PATTERN,
  accountSchema,
  checkPassword,
  identitySchema,
  isStrongPassword,
  loginSchema,
  registrationSchema,
} from "./validation";

describe("checkPassword — règles de PasswordDoubleField (mobile)", () => {
  it("valide chaque règle séparément", () => {
    expect(checkPassword("abc", "")).toEqual({
      length: false,
      upper: false,
      special: false,
      digit: false,
      match: false,
    });
    expect(checkPassword("Atlight2026!", "Atlight2026!")).toEqual({
      length: true,
      upper: true,
      special: true,
      digit: true,
      match: true,
    });
  });

  it("utilise la même liste de caractères spéciaux que le mobile", () => {
    expect(checkPassword("Atlight 2026", "").special).toBe(true);
    expect(checkPassword("Atlight2026_", "").special).toBe(false);
  });

  it("exige une confirmation non vide et identique", () => {
    expect(checkPassword("Atlight2026!", "").match).toBe(false);
    expect(checkPassword("Atlight2026!", "Atlight2026?").match).toBe(false);
  });

  it("isStrongPassword ignore la confirmation", () => {
    expect(isStrongPassword("Atlight2026!")).toBe(true);
    expect(isStrongPassword("atlight2026!")).toBe(false);
  });
});

describe("schémas de l'inscription", () => {
  const valid = {
    role: "ATHLETE",
    firstname: "Awa",
    lastname: "Diallo",
    username: "awa.diallo",
    email: "awa@exemple.com",
    password: "Atlight2026!",
    confirmation: "Atlight2026!",
    acceptPrivacy: true,
  };

  it("accepte une inscription complète", () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
  });

  it("exige un des six rôles", () => {
    expect(issuesOf(registrationSchema.safeParse({ ...valid, role: "" })).role).toBe(
      "registerRoleRequired",
    );
    expect(issuesOf(registrationSchema.safeParse({ ...valid, role: "ORGANISM" })).role).toBe(
      "registerRoleRequired",
    );
  });

  it("étape Identité : champs requis après suppression des espaces, 50 caractères maximum", () => {
    expect(
      issuesOf(
        identitySchema.safeParse({ firstname: "  ", lastname: "", username: "x".repeat(51) }),
      ),
    ).toEqual({
      firstname: "firstNameRequired",
      lastname: "lastNameRequired",
      username: "usernameTooLong",
    });
  });

  it("étape Compte : signale chaque problème sur son champ, même quand plusieurs coexistent", () => {
    expect(
      issuesOf(
        accountSchema.safeParse({
          email: "pas-un-email",
          password: "faible",
          confirmation: "autre",
          acceptPrivacy: false,
        }),
      ),
    ).toEqual({
      email: "emailInvalid",
      password: "passwordRulesNotMet",
      confirmation: "passwordMismatch",
      acceptPrivacy: "privacyRequired",
    });
  });

  it("valide l'e-mail avec le même motif que le backend", () => {
    expect(EMAIL_PATTERN.test("awa.diallo+atlight@club.cm")).toBe(true);
    expect(EMAIL_PATTERN.test("awa@club")).toBe(false);
  });
});

describe("loginSchema", () => {
  it("refuse un nom d'utilisateur vide ou fait d'espaces", () => {
    expect(issuesOf(loginSchema.safeParse({ username: "   ", password: "" }))).toEqual({
      username: "usernameRequired",
      password: "passwordRequired",
    });
  });
});

/** Messages d'erreur (clés de traduction) indexés par champ. */
function issuesOf(result: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  return Object.fromEntries((result.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));
}
