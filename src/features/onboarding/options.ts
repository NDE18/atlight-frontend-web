/** `sportsList` de about_section.dart (mobile) : valeurs enregistrées telles quelles par le backend. */
export const SPORTS = [
  "Football",
  "Basketball",
  "Tennis",
  "Rugby",
  "Athletics",
  "Swimming",
  "Cycling",
  "Boxing",
  "Volleyball",
  "Handball",
  "Other",
] as const;

/** `countries` de about_section.dart (mobile), mêmes noms enregistrés. */
export const COUNTRIES = [
  { name: "Cameroon", flag: "🇨🇲" },
  { name: "United States", flag: "🇺🇸" },
  { name: "France", flag: "🇫🇷" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Nigeria", flag: "🇳🇬" },
] as const;

/** null / "null" / "" → "" (même nettoyage que `Person._cleanString` du mobile). */
export function cleanText(value: string | null | undefined): string {
  const text = value?.trim() ?? "";
  return text === "null" ? "" : text;
}
