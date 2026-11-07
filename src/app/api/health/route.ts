/**
 * Sonde de santé du conteneur (Docker, déploiement) : ne dépend ni du backend ni de la session.
 * `version` est le tag de l'image, transmis au conteneur par le déploiement (APP_VERSION).
 */
export function GET() {
  return Response.json(
    { status: "ok", version: process.env.APP_VERSION ?? "dev" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
