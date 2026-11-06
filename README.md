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

| Commande                          | Rôle                                                |
| --------------------------------- | --------------------------------------------------- |
| `npm run dev`                     | Serveur de développement (Turbopack)                |
| `npm run build` / `npm start`     | Build et serveur de production (Node)               |
| `npm run lint`                    | ESLint (règles Next.js + TypeScript)                |
| `npm run typecheck`               | Génère les types de routes puis `tsc --noEmit`      |
| `npm run format` / `format:check` | Prettier (+ tri des classes Tailwind)               |
| `npm test` / `test:watch`         | Tests unitaires Vitest + Testing Library            |
| `npm run test:e2e`                | Tests de bout en bout Playwright (bureau et mobile) |
| `npm run i18n:sync`               | Régénère `messages/*.json` depuis les ARB du mobile |
| `npm run i18n:check`              | Échoue si une clé manque en FR ou en EN             |
| `npm run ci`                      | Tout ce que lance la CI, dans l'ordre               |

Première utilisation de Playwright sur une machine : `npx playwright install chromium`.

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
src/
  proxy.ts              garde de session (ex-middleware) : sans cookie → /login?next=…
  app/
    (app)/              espace connecté
    (auth)/             connexion, inscription en 4 étapes
    (public)/p/         pages publiques rendues serveur (mêmes chemins que les liens du mobile)
    api/session/        BFF : login, confirm-registration, logout, ws-token
    api/backend/[...]   BFF : relais authentifié vers <API>/api/*
    firebase-messaging-sw.js/  service worker FCM généré depuis l'environnement
  features/<domaine>/   api.ts, types.ts, components/ — un dossier par domaine
  shared/               api/client.ts, realtime/stomp.ts, firebase/, session/, ui/, utils/, config/env.ts
  stores/               session, app
  i18n/                 choix de la langue (cookie atlight.locale, sinon Accept-Language)
```

## Choix techniques

- **Session par BFF.** Le JWT du backend est stocké dans un cookie `HttpOnly` (`atlight_token`) posé par `/api/session/login` ou `/api/session/confirm-registration`. Le navigateur ne le lit jamais. Tous les appels passent par `apiClient` → `/api/backend/*`, qui ajoute l'en-tête `Authorization`. Un 401 efface la session, un 402 ouvre la modale premium.
- **STOMP.** L'en-tête CONNECT ne peut pas lire le cookie : `/api/session/ws-token` renvoie le jeton. Il renvoie le JWT de session tant que le backend n'émet pas de jeton court.
- **Langue sans préfixe d'URL.** Les liens partagés `/p/*` restent identiques à ceux du mobile, donc Android App Links continue d'ouvrir l'app.
- **Cache Components désactivé** (`next.config.ts`). La session et la langue se lisent à chaque requête. On pourra l'activer plus tard pour les pages publiques.
- **Next.js 16 au lieu de 14.** Next 14 n'est plus maintenu et a des failles critiques corrigées seulement en 15.5+/16 (voir `npm audit`).

## Reste à configurer

- `public/.well-known/assetlinks.json` : renseigner l'empreinte SHA-256 du certificat de signature Google Play.
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` : à générer dans la console Firebase (Cloud Messaging → Certificats Web Push).
- `NEXT_PUBLIC_SENTRY_DSN` et, en CI, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.
- CSP : passer aux nonces avant la production si la revue de sécurité l'exige.
