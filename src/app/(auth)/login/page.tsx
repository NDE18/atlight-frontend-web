import { getTranslations } from "next-intl/server";

// Connexion (AUTH-03, lot 1). Écran provisoire.
export default async function LoginPage() {
  const t = await getTranslations();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-4">
      <h1 className="text-primary text-2xl font-bold">atlight</h1>
      <p className="text-grey-700 mt-2">{t("login")}</p>
    </main>
  );
}
