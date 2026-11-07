import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomePage } from "@/features/feed/components/home-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("home") };
}

// Accueil (maquette Accueil2) : fil, stories et tendances en lecture ; colonne de droite.
export default function Page() {
  return <HomePage />;
}
