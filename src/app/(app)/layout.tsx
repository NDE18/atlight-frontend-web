import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AppShell } from "@/features/shell/components/app-shell";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";

// Espace connecté : shell responsive (barre latérale, barre du haut, navigation mobile).
export default async function AppLayout({ children }: { children: ReactNode }) {
  const preference = (await cookies()).get(LOCALE_COOKIE)?.value;
  return (
    <AppShell localePreference={isLocale(preference) ? preference : null}>{children}</AppShell>
  );
}
