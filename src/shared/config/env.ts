import { z } from "zod";

// Les variables NEXT_PUBLIC_* sont figées au build : elles doivent être lues littéralement.
const schema = z.object({
  apiBaseUrl: z.url(),
  wsUrl: z.url(),
  shareBaseUrl: z.url(),
  firebase: z.object({
    apiKey: z.string(),
    authDomain: z.string(),
    projectId: z.string(),
    storageBucket: z.string(),
    messagingSenderId: z.string(),
    appId: z.string(),
    measurementId: z.string().optional(),
    vapidKey: z.string(),
  }),
  sentryDsn: z.string(),
});

export const env = schema.parse({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://atlight.fr",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "wss://atlight.fr/ws",
  shareBaseUrl: process.env.NEXT_PUBLIC_SHARE_BASE_URL ?? "https://atlight.fr",
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "",
  },
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
});

export const isFirebaseConfigured = env.firebase.apiKey !== "" && env.firebase.appId !== "";
