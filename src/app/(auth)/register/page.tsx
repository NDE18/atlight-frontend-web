import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { RegisterWizard } from "@/features/auth/components/register/register-wizard";
import { safeNextPath } from "@/shared/utils/safe-next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("signUp") };
}

// Inscription en 4 étapes : Rôle, Identité, Compte, Code (AUTH-01, AUTH-02 — cahier des charges 4.1.1).
export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { next } = await searchParams;
  return (
    <Suspense>
      <RegisterWizard next={safeNextPath(typeof next === "string" ? next : null)} />
    </Suspense>
  );
}
