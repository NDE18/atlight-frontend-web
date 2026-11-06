import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordFlow } from "@/features/auth/components/forgot-password-flow";
import { safeNextPath } from "@/shared/utils/safe-next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("resetPassword") };
}

// Mot de passe oublié par code e-mail (AUTH-04).
export default async function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  const { next } = await searchParams;
  return <ForgotPasswordFlow next={safeNextPath(typeof next === "string" ? next : null)} />;
}
