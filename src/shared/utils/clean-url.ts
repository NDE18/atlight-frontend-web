/** URL de média exploitable, ou null : le backend renvoie parfois '' ou 'null' (règle _cleanUrl du mobile). */
export function cleanUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return trimmed === "" || trimmed === "null" ? null : trimmed;
}
