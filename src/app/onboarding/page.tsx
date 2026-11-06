import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";
import { safeNextPath } from "@/shared/utils/safe-next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("onboardingWelcomeTitle") };
}

// Onboarding après l'inscription (AUTH-07). Page privée : le proxy exige une session.
export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const { next } = await searchParams;
  return <OnboardingFlow next={safeNextPath(typeof next === "string" ? next : null)} />;
}
