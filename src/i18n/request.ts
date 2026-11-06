import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { isLocale, LOCALE_COOKIE, negotiateLocale } from "./config";

// Pas de préfixe de langue dans l'URL : les liens partagés /p/* restent identiques au mobile.
export default getRequestConfig(async () => {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(chosen)
    ? chosen
    : negotiateLocale((await headers()).get("accept-language"));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Rendu serveur en UTC ; les dates affichées à l'utilisateur sont formatées côté client,
    // dans le fuseau du navigateur (exigence EVT-02).
    timeZone: "UTC",
  };
});
