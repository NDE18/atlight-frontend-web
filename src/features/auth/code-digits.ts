import { CODE_LENGTH } from "./rules";

export const emptyDigits = (): string[] => Array.from({ length: CODE_LENGTH }, () => "");

/**
 * Saisie dans la case `index`. Plusieurs chiffres d'un coup (saisie automatique du code,
 * collage dans une case) remplissent les cases suivantes.
 * Renvoie les nouvelles cases et la case à focaliser ensuite (null : ne pas bouger).
 */
export function typeIntoDigit(
  digits: readonly string[],
  index: number,
  raw: string,
): { digits: string[]; focus: number | null } {
  let typed = raw.replace(/\D/g, "");
  const next = [...digits];

  // Une lettre ou un symbole : on ne touche à rien.
  if (!typed && raw) return { digits: next, focus: null };

  // Chiffre tapé à côté de celui déjà présent : il le remplace.
  const previous = digits[index];
  if (typed.length === 2 && previous && typed.includes(previous)) {
    typed = typed[0] === previous ? typed[1] : typed[0];
  }

  if (typed.length > 1) {
    const chars = typed.slice(0, CODE_LENGTH - index).split("");
    chars.forEach((char, n) => {
      next[index + n] = char;
    });
    const last = index + chars.length - 1;
    return { digits: next, focus: Math.min(last + 1, CODE_LENGTH - 1) };
  }

  next[index] = typed;
  if (!typed) {
    // Case vidée : retour à la précédente, comme le mobile.
    return { digits: next, focus: index > 0 ? index - 1 : null };
  }
  const empty = next.findIndex((d, n) => n > index && !d);
  return { digits: next, focus: empty !== -1 ? empty : index < CODE_LENGTH - 1 ? index + 1 : null };
}

/** Collage d'un code complet : remplit toutes les cases depuis la première. */
export function pasteDigits(text: string): string[] | null {
  const typed = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
  if (!typed) return null;
  const digits = emptyDigits();
  typed.split("").forEach((char, n) => {
    digits[n] = char;
  });
  return digits;
}

/** « 9:05 » pour le renvoi, « 09:05 » pour l'expiration. */
export function formatSeconds(total: number, padMinutes = false): string {
  const seconds = Math.max(0, Math.ceil(total));
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${padMinutes ? String(m).padStart(2, "0") : m}:${s}`;
}
