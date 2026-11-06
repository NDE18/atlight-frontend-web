import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { env, isFirebaseConfigured } from "@/shared/config/env";

/** Application Firebase côté navigateur (push web + analytics), ou null si non configurée. */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined" || !isFirebaseConfigured) return null;
  const { vapidKey: _vapid, ...options } = env.firebase;
  void _vapid;
  return getApps()[0] ?? initializeApp(options);
}

const PUSH_ASKED_KEY = "atlight.pushPermissionAsked";

/**
 * Jeton FCM web. Comme le mobile, la permission n'est demandée qu'une fois ;
 * à appeler après une action de l'utilisateur (NOTIF-04).
 */
export async function getWebPushToken(): Promise<string | null> {
  const app = getFirebaseApp();
  if (!app || !env.firebase.vapidKey || !("Notification" in window)) return null;

  if (Notification.permission === "default") {
    if (localStorage.getItem(PUSH_ASKED_KEY) === "1") return null;
    localStorage.setItem(PUSH_ASKED_KEY, "1");
    if ((await Notification.requestPermission()) !== "granted") return null;
  }
  if (Notification.permission !== "granted") return null;

  const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
  if (!(await isSupported())) return null;
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  return getToken(getMessaging(app), {
    vapidKey: env.firebase.vapidKey,
    serviceWorkerRegistration: registration,
  });
}
