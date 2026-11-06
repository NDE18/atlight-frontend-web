import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginScreen } from "@/features/auth/components/login-screen";
import { safeNextPath } from "@/shared/utils/safe-next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("login") };
}

// Connexion (AUTH-03). `next` : page privée demandée avant la redirection par le proxy.
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return <LoginScreen next={safeNextPath(typeof next === "string" ? next : null)} />;
}
