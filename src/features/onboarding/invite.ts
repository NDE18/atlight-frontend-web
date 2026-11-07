/**
 * Domaine des liens publics, lu directement : importer `env` (validé par zod) ajouterait
 * environ 37 Ko compressés au JavaScript initial du shell (budget : 250 Ko).
 */
const SHARE_BASE_URL = process.env.NEXT_PUBLIC_SHARE_BASE_URL ?? "https://atlight.fr";

/**
 * Invitation de contacts (bouton « Inviter des amis » du mobile) : partage natif du navigateur,
 * sinon copie du lien. Même texte que le mobile (`joinMeOnAtlight` + domaine public).
 */
export async function shareInvite(
  text: string,
): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  const url = SHARE_BASE_URL;
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
