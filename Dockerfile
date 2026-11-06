# syntax=docker/dockerfile:1
# Image de production du web Atlight : build Next.js en sortie « standalone », exécution par Node seul.
#   docker build -t atlight-web . && docker run -p 3000:3000 atlight-web
# Les variables NEXT_PUBLIC_* sont figées dans le bundle au build : on les passe en --build-arg.

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL=https://atlight.fr
ARG NEXT_PUBLIC_WS_URL=wss://atlight.fr/ws
ARG NEXT_PUBLIC_SHARE_BASE_URL=https://atlight.fr
ARG NEXT_PUBLIC_FIREBASE_API_KEY=
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=atlight-app.firebaseapp.com
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=atlight-app
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=atlight-app.firebasestorage.app
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=329948153339
ARG NEXT_PUBLIC_FIREBASE_APP_ID=
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY=
ARG NEXT_PUBLIC_SENTRY_DSN=
ARG SENTRY_ORG=
ARG SENTRY_PROJECT=
# Identifiant de version (commit) : un onglet resté ouvert sur l'ancienne version se recharge
# au lieu de demander des fichiers qui n'existent plus.
ARG NEXT_DEPLOYMENT_ID=

ENV NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1

# Le jeton Sentry (envoi des source maps) passe en secret de build : il ne reste pas dans l'image.
RUN --mount=type=secret,id=sentry_auth_token,env=SENTRY_AUTH_TOKEN npm run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
