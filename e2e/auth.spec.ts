import { expect, test } from "@playwright/test";
import { VALID_CODE, mockAuthBackend } from "./fixtures";

// Lot 1 — compte et authentification (AUTH-01 à AUTH-08), backend simulé.
test.use({ locale: "fr-FR" });

test.beforeEach(async ({ page, baseURL }) => {
  await mockAuthBackend(page, baseURL!);
});

const digit = (n: number) => ({ name: `Chiffre ${n} sur 4` });
// En dev, une route est compilée à sa première visite : délai plus large après ces navigations.
const firstVisit = { timeout: 15_000 };

test("AUTH-01/02 — inscription en 4 étapes jusqu'à l'onboarding", async ({ page }) => {
  // Parcours complet avec un rechargement : plus long que le délai par défaut en dev.
  test.setTimeout(60_000);
  await page.goto("/register");
  await expect(
    page.getByRole("heading", { name: "Quel est votre rôle dans le sport ?" }),
  ).toBeVisible();

  await page.getByText("Athlète", { exact: true }).click();
  await page.getByRole("button", { name: "Suivant" }).click();
  await expect(page).toHaveURL(/step=2/);
  await expect(page.getByRole("heading", { name: "Présentez-vous" })).toBeFocused();

  await page.getByLabel("Prénom").fill("Awa");
  await page.getByLabel("Nom", { exact: true }).fill("Diallo");
  await page.getByLabel("Nom d'utilisateur").fill("awa.diallo");
  await expect(page.getByText("Nom d'utilisateur disponible")).toBeVisible();
  await page.getByRole("button", { name: "Suivant" }).click();
  await expect(page).toHaveURL(/step=3/);

  // Le bouton Précédent du navigateur revient à l'étape d'avant, saisies conservées.
  await page.goBack();
  await expect(page).toHaveURL(/step=2/);
  await expect(page.getByLabel("Prénom")).toHaveValue("Awa");
  await page.goForward();
  await expect(page).toHaveURL(/step=3/);

  await page.getByLabel("Email").fill("awa@exemple.com");
  await page.getByLabel("Mot de passe", { exact: true }).fill("Atlight2026!");
  await page.getByLabel("Confirmer le mot de passe").fill("Atlight2026!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();

  await expect(page).toHaveURL(/step=4/);
  await expect(page.getByRole("heading", { name: "Vérifiez votre e-mail" })).toBeVisible();
  await expect(page.getByText("awa@exemple.com")).toBeVisible();

  // Recharger à l'étape 4 y revient (identifiant, prénom et e-mail en sessionStorage).
  await page.reload();
  await expect(page.getByRole("heading", { name: "Vérifiez votre e-mail" })).toBeVisible();
  await expect(page).toHaveURL(/step=4/);

  // Code faux : message clair, le compte n'est pas bloqué.
  await page.getByRole("textbox", digit(1)).click();
  await page.keyboard.type("0000");
  await expect(page.getByText("Ce code est incorrect.")).toBeVisible();
  await expect(page.getByRole("textbox", digit(1))).toBeFocused();

  await page.keyboard.type(VALID_CODE);
  await expect(page.getByRole("heading", { name: "Votre compte est confirmé" })).toBeVisible();
  await page.getByRole("button", { name: "Continuer" }).click();
  await expect(page).toHaveURL(/\/onboarding$/, firstVisit);
  await expect(page.getByRole("heading", { name: "Bienvenue sur Atlight !" })).toBeVisible();
});

test("AUTH-01 — une étape ouverte sans les précédentes renvoie à l'étape 1", async ({ page }) => {
  await page.goto("/register?step=3");
  await expect(page).toHaveURL(/step=1/);
  await expect(
    page.getByRole("heading", { name: "Quel est votre rôle dans le sport ?" }),
  ).toBeVisible();
});

test("AUTH-01 — nom d'utilisateur déjà pris", async ({ page }) => {
  await page.goto("/register");
  await page.getByText("Coach", { exact: true }).click();
  await page.getByRole("button", { name: "Suivant" }).click();
  await page.getByLabel("Nom d'utilisateur").fill("pris");
  await expect(page.getByText("Déjà pris. Essayez")).toBeVisible();
  await page.getByRole("button", { name: "pris1" }).click();
  await expect(page.getByLabel("Nom d'utilisateur")).toHaveValue("pris1");
  await expect(page.getByText("Nom d'utilisateur disponible")).toBeVisible();
});

test("AUTH-03 — identifiants erronés : message générique", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Nom d'utilisateur").fill("awa.diallo");
  await page.getByLabel("Mot de passe", { exact: true }).fill("mauvais");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Nom d'utilisateur ou mot de passe incorrect.")).toBeVisible();
});

test("AUTH-03/05/06 — connexion vers la page demandée, puis déconnexion", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login\?next=%2F$/);

  await page.getByLabel("Nom d'utilisateur").fill("awa.diallo");
  await page.getByLabel("Mot de passe", { exact: true }).fill("Atlight2026!");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/$/, firstVisit);
  await expect(page.getByRole("heading", { name: /Bonjour, Awa/ })).toBeVisible();
  // Accueil : fil, tendances et compteurs lus dans l'API (simulée).
  await expect(page.getByText("Jordan Mbappé")).toBeVisible();
  await expect(page.getByRole("button", { name: "#Football" }).first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Notifications\s*3 non lus$/ }).first(),
  ).toBeVisible();

  // Session conservée au rechargement (AUTH-05).
  await page.reload();
  await expect(page.getByRole("heading", { name: /Bonjour, Awa/ })).toBeVisible();

  // Une entrée d'historique privée, pour vérifier le retour arrière après la déconnexion.
  await page.goto("/?depuis=e2e");
  await page.getByRole("button", { name: "Ouvrir le menu du compte" }).click();
  await page
    .getByRole("dialog", { name: "Menu du compte" })
    .getByRole("button", { name: "Déconnexion" })
    .click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem("atlight.session"))).not.toContain(
    "awa.diallo",
  );

  // Le retour arrière n'affiche plus de contenu privé (AUTH-06).
  await page.goBack();
  await expect(page).toHaveURL(/\/login\?next=/);
  await expect(page.getByRole("heading", { name: "Content de vous revoir" })).toBeVisible();
  await expect(page.getByText(/Bonjour, Awa/)).toBeHidden();
});

test("AUTH-04 — mot de passe oublié par code e-mail", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill("inconnu@exemple.com");
  await page.getByRole("button", { name: "Recevoir le code" }).click();
  await expect(page.getByText("Aucun compte n'est associé à cette adresse e-mail.")).toBeVisible();

  await page.getByLabel("Email").fill("awa@exemple.com");
  await page.getByRole("button", { name: "Recevoir le code" }).click();
  await expect(page.getByRole("heading", { name: "Entrez votre code" })).toBeVisible();

  await page.getByRole("textbox", digit(1)).click();
  await page.keyboard.type(VALID_CODE);
  await expect(
    page.getByRole("heading", { name: "Choisissez un nouveau mot de passe" }),
  ).toBeVisible();

  await page.getByLabel("Nouveau mot de passe").fill("Atlight2026!");
  await page.getByLabel("Confirmer le mot de passe").fill("Atlight2026!");
  await page.getByRole("button", { name: "Enregistrer le mot de passe" }).click();
  await expect(page.getByRole("heading", { name: "C'est reparti !" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Se connecter" })).toHaveAttribute("href", "/login");
});

test("AUTH-08 — la langue choisie est mémorisée", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
