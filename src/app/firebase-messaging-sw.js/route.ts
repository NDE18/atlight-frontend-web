import { SDK_VERSION } from "firebase/app";
import { env } from "@/shared/config/env";

/**
 * Service worker FCM généré à la volée : un fichier de /public ne peut pas lire les variables
 * d'environnement. Affiche les notifications reçues quand l'onglet est en arrière-plan.
 */
export function GET() {
  const { vapidKey: _vapid, ...config } = env.firebase;
  void _vapid;
  const body = `
importScripts("https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-messaging-compat.js");
firebase.initializeApp(${JSON.stringify(config)});
firebase.messaging().onBackgroundMessage((payload) => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || "Atlight", { body: n.body, icon: "/icons/app-icon.png", data: payload.data });
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/notifications";
  event.waitUntil(clients.openWindow(url));
});
`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-cache",
    },
  });
}
