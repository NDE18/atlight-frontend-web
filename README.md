# Atlight Web

Version web d'Atlight, cohérente avec l'app mobile Flutter (`../atlight-frontend-mobile`) et branchée sur le même backend Spring Boot (`../atlight-backend`).

Références : [cahier technique](https://claude.ai/artifact/XFjjxm8JiWcmWSvdWTQg9L) (comment construire) et [cahier des charges](https://claude.ai/artifact/YXGRpJkwP3R4CHL7xiBpw5) (quoi construire, comment valider).

## Démarrage

Prérequis : Node.js 24+.

```bash
npm install
cp .env.example .env.local   # puis adapter l'URL du backend
npm run dev                  # http://localhost:3000
```

## Scripts

| Commande                          | Rôle                                                 |
| --------------------------------- | ---------------------------------------------------- |
| `npm run dev`                     | Serveur de développement (Turbopack)                 |
| `npm run build` / `npm start`     | Build et serveur de production (Node)                |
| `npm run lint`                    | ESLint (règles Next.js + TypeScript)                 |
| `npm run typecheck`               | Génère les types de routes puis `tsc --noEmit`       |
| `npm run format` / `format:check` | Prettier (+ tri des classes Tailwind)                |
| `npm test` / `test:watch`         | Tests unitaires Vitest + Testing Library             |
| `npm run test:e2e`                | Tests de bout en bout Playwright (bureau et mobile)  |
| `npm run i18n:sync`               | Régénère `messages/*.json` depuis les ARB du mobile  |
| `npm run i18n:check`              | Échoue si une clé manque en FR ou en EN              |
| `npm run ci`                      | Ce que lance la CI avant les tests E2E, dans l'ordre |

Première utilisation de Playwright sur une machine : `npx playwright install chromium`.
Les tests E2E simulent les routes du BFF (`e2e/fixtures.ts`) : ils ne demandent pas de backend.
Si le port 3000 est pris, `PORT=3001 npm run test:e2e` (un serveur déjà lancé sur ce port est réutilisé).

## CI/CD et déploiement

`.github/workflows/ci.yml` : sur chaque push et pull request, traductions, Prettier, ESLint, types, tests unitaires, build et tests E2E. Sur `main`, l'image Docker est ensuite publiée sur ghcr.io puis déployée sur le VPS Contabo : **https://web.atlight.fr**. Mise en place (port 80, secrets, variables), retour arrière et dépannage : [`docs/deploiement.md`](docs/deploiement.md).

Image en local : `docker build -t atlight-web . && docker run -p 3000:3000 atlight-web`.

## Stack

| Besoin           | Outil                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router), React 19, TypeScript strict                                     |
| État global      | Zustand (`src/stores` : `session`, `app`)                                                |
| Données serveur  | TanStack Query v5                                                                        |
| Temps réel       | `@stomp/stompjs` (même `/ws` et même en-tête CONNECT que le mobile)                      |
| i18n             | next-intl, messages convertis des ARB du mobile (mêmes clés, syntaxe ICU)                |
| Formulaires      | React Hook Form + Zod                                                                    |
| Styles           | Tailwind CSS 4, jetons du design system dans `src/app/globals.css`                       |
| Icônes           | Material Symbols (mêmes noms que les Material Icons du mobile)                           |
| Médias           | `next/image` (Cloudinary), `react-easy-crop`, `emoji-picker-react`, Downshift (mentions) |
| Push / analytics | Firebase JS SDK, service worker `/firebase-messaging-sw.js`                              |
| Erreurs          | Sentry (`@sentry/nextjs`)                                                                |
| Sécurité         | En-têtes CSP et associés (`next.config.ts`), DOMPurify (`src/shared/utils/sanitize.ts`)  |

## Structure

```
messages/               fr.json, en.json — générés, ne pas éditer à la main
scripts/arb-to-json.mjs conversion ARB → JSON et contrôle des clés
e2e/                    tests Playwright
deploy/                 déploiement sur le VPS : compose.yml, deploy.sh, modèles nginx
Dockerfile              image de production (sortie standalone)
src/
  proxy.ts              garde de session (ex-middleware) : sans cookie → /login?next=…
  app/
    (app)/              espace connecté : shell responsive (layout.tsx) et pages
    (auth)/             connexion, inscription en 4 étapes, mot de passe oublié
    onboarding/         onboarding après inscription (privé, hors shell)
    (public)/p/         pages publiques rendues serveur (mêmes chemins que les liens du mobile)
    api/session/        BFF : login, confirm-registration, logout, ws-token
    api/backend/[...]   BFF : relais authentifié vers <API>/api/*
    api/public/[...]    BFF : endpoints publics d'authentification (liste fermée, jamais de JWT)
    api/health/         sonde de santé du conteneur ({ status, version })
    firebase-messaging-sw.js/  service worker FCM généré depuis l'environnement
  features/<domaine>/   api.ts, types.ts, components/ — un dossier par domaine
                        (lot 1 : auth, onboarding, shell)
  shared/               api/client.ts, realtime/stomp.ts, firebase/, session/, ui/, utils/, config/env.ts
  stores/               session, app
  i18n/                 choix de la langue (cookie atlight.locale, sinon Accept-Language)
```

## Choix techniques

- **Session par BFF.** Le JWT du backend est stocké dans un cookie `HttpOnly` (`atlight_token`) posé par `/api/session/login` ou `/api/session/confirm-registration`. Le navigateur ne le lit jamais. Tous les appels passent par `apiClient` → `/api/backend/*`, qui ajoute l'en-tête `Authorization`. Un 401 efface la session, un 402 ouvre la modale premium.
- **STOMP.** L'en-tête CONNECT ne peut pas lire le cookie : `/api/session/ws-token` renvoie le jeton. Il renvoie le JWT de session tant que le backend n'émet pas de jeton court.
- **Langue sans préfixe d'URL.** Les liens partagés `/p/*` restent identiques à ceux du mobile, donc Android App Links continue d'ouvrir l'app.
- **Cache Components désactivé** (`next.config.ts`). La session et la langue se lisent à chaque requête. On pourra l'activer plus tard pour les pages publiques.
- **Endpoints publics d'authentification.** Inscription, codes e-mail et mot de passe oublié passent par `/api/public/*` (`apiClient(..., { anonymous: true })`) : jamais de JWT (un cookie périmé ne bloque pas une inscription), et seuls les chemins listés dans la route sont relayés.
- **IP du client transmise au backend.** Les relais du BFF recopient `X-Forwarded-For` : le limiteur de débit du backend compte par IP, sinon tous les utilisateurs du web partageraient le quota du serveur Next.js.
- **Libellés.** Toutes les clés viennent des ARB du mobile ; les nouvelles clés du lot 1 y ont été ajoutées (fin de fichier), puis `npm run i18n:sync`.
- **Icônes des écrans du lot 1 en SVG inline** (`src/shared/ui/svg-icon.tsx`, tracés Material des maquettes). La police Material Symbols pèse 4 Mo en `font-display: block` : elle n'est chargée que si le composant `Icon` est utilisé.
- **Inscription** (`/register?step=1..4`) : saisies gardées en mémoire, jamais de mot de passe dans le stockage du navigateur ; à l'étape 4, l'identifiant du compte, le prénom et l'e-mail sont en `sessionStorage` (rechargement), effacés après validation.
- **Next.js 16 au lieu de 14.** Next 14 n'est plus maintenu et a des failles critiques corrigées seulement en 15.5+/16 (voir `npm audit`).

## Reste à configurer

- `public/.well-known/assetlinks.json` : renseigner l'empreinte SHA-256 du certificat de signature Google Play.
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` : à générer dans la console Firebase (Cloud Messaging → Certificats Web Push).
- `NEXT_PUBLIC_SENTRY_DSN` et, en CI, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.
- Déploiement : vérifier que le port 80 du VPS est autorisé, et créer dans ce dépôt les secrets `CONTABO_*` du backend (voir [`docs/deploiement.md`](docs/deploiement.md)).
- CSP : passer aux nonces avant la production si la revue de sécurité l'exige.
- `public/legal/privacy.html` : copie de la politique de confidentialité du mobile, en anglais seulement. Une version FR/EN reste à fournir.

Notes de version du lot 1 : [`docs/notes-de-version-lot1.md`](docs/notes-de-version-lot1.md).
