import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs/config";

const isDev = process.env.NODE_ENV !== "production";

const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_BASE_URL);
const wsOrigin = originOf(process.env.NEXT_PUBLIC_WS_URL);

function originOf(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

// CSP sans nonce : Next.js injecte des scripts inline d'hydratation, d'où 'unsafe-inline'.
// Passer aux nonces (via proxy.ts) avant la mise en production si la revue sécurité l'exige.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.gstatic.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "media-src 'self' blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    apiOrigin,
    wsOrigin,
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "https://*.google-analytics.com",
    "https://*.ingest.sentry.io",
    "https://*.ingest.de.sentry.io",
    isDev ? "ws://localhost:*" : "",
  ]
    .filter(Boolean)
    .join(" "),
  "worker-src 'self'",
  "frame-src 'self' https://*.cinetpay.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.cinetpay.com",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Cache Components désactivé : la session (cookie) et la langue sont lues à chaque requête.
  // Voir README, section « Choix techniques ».
  cacheComponents: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Fichiers de vérification lus par Android / iOS.
      {
        source: "/.well-known/:file*",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Les source maps ne sont envoyées que si un token Sentry est fourni (CI de prod).
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
