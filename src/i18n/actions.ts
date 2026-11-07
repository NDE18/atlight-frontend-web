"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./config";

/**
 * Choix de la langue (AUTH-08), mémorisé un an. null = revenir à la langue du navigateur,
 * comme « Langue du système » sur le mobile.
 */
export async function setLocalePreference(locale: string | null): Promise<void> {
  const store = await cookies();
  if (locale === null) {
    store.delete(LOCALE_COOKIE);
    return;
  }
  if (!isLocale(locale)) return;
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
