"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useTransition } from "react";
import { locales, type Locale } from "@/i18n/config";
import { setLocalePreference } from "@/i18n/actions";
import { SvgIcon } from "./svg-icon";

export const LANGUAGE_LABEL_KEYS: Record<Locale, string> = {
  fr: "languageFrench",
  en: "languageEnglish",
};

/** Hook partagé : change la langue et recharge les composants serveur sans perdre les saisies. */
export function useChangeLocale() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const change = (locale: Locale | null) =>
    startTransition(async () => {
      await setLocalePreference(locale);
      router.refresh();
    });
  return { change, pending };
}

/** « Français · English » sous les formulaires d'authentification. */
export function LanguageSwitch() {
  const t = useTranslations();
  const current = useLocale();
  const { change, pending } = useChangeLocale();

  return (
    <div
      role="group"
      aria-label={t("changeLanguage")}
      className="text-grey-700 flex items-center justify-center gap-1 text-sm"
    >
      <SvgIcon name="language" size={18} />
      {locales.map((locale, i) => (
        <Fragment key={locale}>
          {i > 0 && <span aria-hidden>·</span>}
          <button
            type="button"
            lang={locale}
            aria-pressed={current === locale}
            disabled={pending}
            onClick={() => change(locale)}
            className="hover:text-primary-dark aria-pressed:text-grey-900 min-h-9 rounded px-1.5 hover:underline aria-pressed:font-bold"
          >
            {t(LANGUAGE_LABEL_KEYS[locale])}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
