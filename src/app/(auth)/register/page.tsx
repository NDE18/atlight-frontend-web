import { getTranslations } from "next-intl/server";

// Inscription en 4 étapes : Rôle, Identité, Compte, Code (AUTH-01, AUTH-02 — cahier des charges 4.1.1).
export default async function RegisterPage() {
  const t = await getTranslations();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-4">
      <h1 className="text-primary text-2xl font-bold">atlight</h1>
      <p className="text-grey-700 mt-2">{t("signUp")}</p>
    </main>
  );
}
