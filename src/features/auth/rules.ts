/*
 * Règles de saisie identiques au mobile et au backend (AUTH-01 : « validations identiques au mobile »).
 * Sans zod : les composants partagés (règles du mot de passe, saisie du code) les importent
 * sans alourdir le JavaScript de l'espace connecté. Les schémas sont dans validation.ts.
 */

/** `RegistrationDto.username` : @Size(max = 50). */
export const USERNAME_MAX = 50;
/** Même motif que `EmailValidator` du backend. */
export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
/** `OtpService.generate4DigitCode`. */
export const CODE_LENGTH = 4;
/** Validité d'un code e-mail (`Constants.CODE_VALIDITY_MINUTES`). */
export const CODE_VALIDITY_SECONDS = 10 * 60;
/** Délai avant « Renvoyer le code » (verification_page.dart). */
export const RESEND_DELAY_SECONDS = 45;

/** Règles de `PasswordDoubleField.dart`, dans l'ordre d'affichage du mobile. */
export interface PasswordChecks {
  length: boolean;
  upper: boolean;
  special: boolean;
  digit: boolean;
  match: boolean;
}

export const PASSWORD_RULES: { key: keyof PasswordChecks; label: string }[] = [
  { key: "length", label: "ruleLeast8Chars" },
  { key: "upper", label: "ruleLeast1Upper" },
  { key: "special", label: "ruleLeast1Special" },
  { key: "digit", label: "ruleLeast1Digit" },
  { key: "match", label: "ruleFieldsMatch" },
];

export function checkPassword(password: string, confirmation: string): PasswordChecks {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    special: /[ !@#$%^&*(),.?":{}|<>]/.test(password),
    digit: /[0-9]/.test(password),
    match: confirmation.length > 0 && password === confirmation,
  };
}

export function isStrongPassword(password: string): boolean {
  const { match: _match, ...rules } = checkPassword(password, password);
  void _match;
  return Object.values(rules).every(Boolean);
}

/** Code saisi complet (chiffres uniquement). */
export function isCompleteCode(digits: readonly string[]): boolean {
  return digits.length === CODE_LENGTH && digits.every((d) => /^\d$/.test(d));
}
