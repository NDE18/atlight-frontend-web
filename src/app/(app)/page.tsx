import { getTranslations } from "next-intl/server";

// Fil d'actualité (lot 2). Écran provisoire : le shell responsive arrive au lot 1.
export default async function FeedPage() {
  const t = await getTranslations();
  return (
    <main className="max-w-content mx-auto p-4">
      <h1 className="text-primary text-2xl font-bold">atlight</h1>
      <p className="text-grey-700 mt-2">{t("home")}</p>
    </main>
  );
}
