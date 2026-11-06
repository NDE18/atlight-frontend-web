import type { BrowserContext, Page } from "@playwright/test";

/*
 * Simulation des routes du BFF appelées par le navigateur (/api/public/*, /api/session/*,
 * /api/backend/*) : les parcours d'authentification se testent sans backend Spring.
 */

export const PERSON = {
  id: 7,
  firstname: "Awa",
  lastname: "Diallo",
  sport: null,
  clubName: null,
  residence: null,
};
export const SESSION = {
  message: "OK",
  user: { id: 42, username: "awa.diallo", role: "ATHLETE" },
  person: PERSON,
};
export const VALID_CODE = "1234";

/** Pose le cookie de session comme le ferait le BFF après une authentification réussie. */
async function openSession(context: BrowserContext, baseURL: string) {
  await context.addCookies([
    { name: "atlight_token", value: "e2e-token", url: baseURL, httpOnly: true },
  ]);
}

export const HOME_POST = {
  id: 501,
  personId: 9,
  personName: "Jordan Mbappé",
  personVerified: true,
  personRole: "ATHLETE",
  personClub: "Stade Lagune FC",
  description: "Une nouvelle étape dans ma carrière sportive ! #Football",
  mediaType: "IMAGE",
  images: [],
  createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  commentsCount: 8,
  repostsCount: 3,
  byType: { GOLD: 14, GOAL: 6, STRONG: 4 },
};

export async function mockAuthBackend(page: Page, baseURL: string) {
  const context = page.context();

  // Filet de sécurité, déclaré en premier (les routes déclarées ensuite passent avant) :
  // aucun appel authentifié non simulé ne part vers le vrai backend.
  await page.route("**/api/backend/**", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/backend/user/publication/feed?**", (route) =>
    route.fulfill({ json: [HOME_POST] }),
  );
  await page.route("**/api/backend/user/publication/feed/trending**", (route) =>
    route.fulfill({
      json: [
        { name: "Football", count: 12 },
        { name: "Mercato", count: 8 },
      ],
    }),
  );
  await page.route("**/api/backend/notification/count**", (route) =>
    route.fulfill({ json: { count: 3 } }),
  );
  await page.route("**/api/backend/message/unread-count", (route) =>
    route.fulfill({ json: { count: 5 } }),
  );

  await page.route("**/api/public/user/check-username**", (route) => {
    const username = new URL(route.request().url()).searchParams.get("username");
    return route.fulfill({ json: { available: username !== "pris" } });
  });

  await page.route("**/api/public/registration", (route) => {
    const body = route.request().postDataJSON();
    return route.fulfill({
      json: {
        id: 42,
        username: body.username,
        email: body.email,
        firstname: body.firstname,
        lastname: body.lastname,
      },
    });
  });

  await page.route("**/api/public/user/resend_code/**", (route) =>
    route.fulfill({ body: "OK", contentType: "text/plain" }),
  );

  await page.route("**/api/session/confirm-registration", async (route) => {
    if (route.request().postDataJSON().code !== VALID_CODE) {
      return route.fulfill({ status: 400, json: { error: "INVALID_CODE" } });
    }
    await openSession(context, baseURL);
    return route.fulfill({ json: SESSION });
  });

  await page.route("**/api/session/login", async (route) => {
    const { username, password } = route.request().postDataJSON();
    if (username !== "awa.diallo" || password !== "Atlight2026!") {
      return route.fulfill({
        status: 401,
        json: {
          error: "BAD_CREDENTIALS",
          message: "Incorrect username and/or password, try again!",
        },
      });
    }
    await openSession(context, baseURL);
    return route.fulfill({ json: SESSION });
  });

  await page.route("**/api/session/logout", async (route) => {
    await context.clearCookies();
    return route.fulfill({ status: 204 });
  });

  await page.route("**/api/backend/person/7", (route) => route.fulfill({ json: PERSON }));

  await page.route("**/api/public/user/pwd/forgotten", (route) => {
    const { email } = route.request().postDataJSON();
    return email === "inconnu@exemple.com"
      ? route.fulfill({ status: 205 })
      : route.fulfill({ json: { id: 42, email } });
  });

  await page.route("**/api/public/user/confirm_for_reset_password", (route) =>
    route.fulfill({
      contentType: "text/plain",
      body: route.request().postDataJSON().code === VALID_CODE ? "for reset password" : "KO",
    }),
  );

  await page.route("**/api/public/user/reset_password", (route) =>
    route.fulfill({ json: { id: 42, email: route.request().postDataJSON().email } }),
  );
}
