export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

/** Cookie posé par Réglages → Langue. Absent = langue du navigateur (comme le mobile, `null`). */
export const LOCALE_COOKIE = "atlight.locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Première langue supportée d'un en-tête `Accept-Language`, sinon la langue par défaut. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return (ranked.find((r) => isLocale(r.lang))?.lang as Locale | undefined) ?? defaultLocale;
}
